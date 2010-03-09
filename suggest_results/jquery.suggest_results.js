(function($){
	$.fn.suggest_results = function(options){
		var self = $.fn.suggest_results;
		var $options = $.extend({}, self.defaults, options);
		
		self.init($options);
		
		var TAB = 9;
		var RETURN = 13;
		var ESC = 27;
		var ARRUP = 38;
		var ARRDN = 40;
		
		return this.each(function(){
			var $e = $(this);
			$e.focus(function(){
				self.attach($e);
			}).blur(function(){
				self.hide();
			}).keyup(function(e){
				switch(e.keyCode) {
					case ARRUP: 
					case ARRDN: 
					case ESC: self.clear($e, $options);
					case RETURN: 
					default: self.search($e, $options);
				}
			});
		});
	};
	
	$.fn.suggest_results.box = null;
	$.fn.suggest_results.attached_to = null;
	$.fn.suggest_results.current_results = [];
	$.fn.suggest_results.selected_result = [];
	
	$.fn.suggest_results.init = function(options){
		var self = $.fn.suggest_results;
		self.box = $("#" + options.template.container_id);
		if (self.box.length == 0) {
			$("body").append(self.mustache(options.template.container, {id: options.template.container_id}));
			self.box = $("#" + options.template.container_id);
		};
	};
	
	$.fn.suggest_results.search = function(elm, options){
		var self = $.fn.suggest_results;
		var terms = (options.exact_match) ? elm.val() : elm.val().split(/\s/);
		if (typeof(options.url) === "string" && options.url !== "") {
			//TODO support fetching results from server-side
		} else {
			var results = self.filter_data(terms, options.data);
		};
		self.render(results, options);
		self.show();
	};
	
	$.fn.suggest_results.clear = function(elm, options){
		var self = $.fn.suggest_results;
		elm.val("");
		self.hide();
	};
	
	$.fn.suggest_results.render = function(results, options){
		var self = $.fn.suggest_results;
		var results_length = results.length;
		var html = "";
		for (var i=0; i < results_length; i++) {
			html += self.mustache(options.template.result, $.extend({}, {id: "suggest_result_" + i}, results[i]));
		};
		self.box.html("");
		self.box.append(html);
		
	};
	
	$.fn.suggest_results.attach = function(elm, options){
		var self = $.fn.suggest_results;
		var elm_uid = self.elm_uid(elm);
		if (elm_uid !== self.attached_to) {
			var offset = elm.offset();

			var width = elm.innerWidth();
			width += parseInt(elm.css("border-left-width"), 10) + parseInt(elm.css("border-right-width"), 10);
			self.box.css("width", width + "px");

			self.box.css("left", offset.left + "px");

			var top = offset.top + elm.innerHeight();
			top += parseInt(elm.css("margin-top"), 10);
			top += parseInt(elm.css("border-top-width"), 10) + parseInt(elm.css("border-bottom-width"), 10);
			self.box.css("top", top + "px");
			
			self.attached_to = elm_uid;
		};
	};

	$.fn.suggest_results.show = function(){
		$.fn.suggest_results.box.show();
	};
		
	$.fn.suggest_results.hide = function(){
		$.fn.suggest_results.box.hide();
	};
	
	$.fn.suggest_results.filter_data = function(terms, data){
		if (typeof(terms) === "string") {
			terms = [terms];
		};
		var matched = "";
		var result = [];
		for (var i = terms.length - 1; i >= 0; i--){
			var term = terms[i];
			term = term.toLowerCase();
			if (data !== null && typeof(term) !== "undefined" && term !== "") {
				for (var i = data.length - 1; i >= 0; i--){
					var title = data[i].title.toLowerCase();
					var match = (typeof(data[i].match) !== "undefined") ? data[i].match.toLowerCase() : "" ;
					if (title.indexOf(term) !== -1 || match.indexOf(term) !== -1) {
						if (matched.indexOf(":" + i + ":") == -1) {
							result.push(data[i]);
							matched += ":" + i + ":";
						};
					};
				};
			};
		};
		return result;
	};
	
	$.fn.suggest_results.elm_uid = function(elm){
		var uid = "";
		if ( elm.attr("id") !== ""    ) { uid += "#" + elm.attr("id");         };
		if ( elm.attr("class") !== "" ) { uid += "." + elm.attr("class");      };
		if ( elm.attr("name") !== ""  ) { uid += "[" + elm.attr("name") + "]"; };
		return uid;
	};
	
	$.fn.suggest_results.mustache = function(string, data){
		if (typeof(string) === "string" && typeof(data) === "object") {
			for (var key in data) {
				string = string.replace(new RegExp("{{" + key + "}}", "g"), data[key]);
			}
		};
		return string;
	};
	
	$.fn.suggest_results.defaults = {
		data: null,
		exact_match: false,
		template: {
			container_id: "suggest_results",
			container: '<div id="{{id}}"></div>',
			result: '<a class="result" id="{{id}}" href="{{url}}"><span class="title">{{title}}</span></a>',
			category: '<strong class="category">{{category}}</strong>' //TODO add support for categories
		}
	};
	
})(jQuery);
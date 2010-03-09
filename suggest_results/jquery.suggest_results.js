(function($){
	$.fn.suggest_results = function(options){
		var self = $.fn.suggest_results;
		var $options = $.extend({}, self.defaults, options);
		
		self.init($options);
		
		return this.each(function(){
			var $e = $(this);
			$e.focus(function(){
				self.attach($e, options);
				if ($e.val().length > 0) {
					self.search_timeout = self.setTimeout(function(){
						self.search($e, $options);
					}, $options.delay);
				};
			}).blur(function(){
				self.hide();
			}).keyup(function(e){
				var TAB = 9;
				var RETURN = 13;
				var ESC = 27;
				var ARRUP = 38;
				var ARRDN = 40;
				switch(e.keyCode) {
					case ARRUP: self.select_prev($options); return false;
					case ARRDN: self.select_next($options); return false;
					case ESC: self.clear($e, $options); break;
					case RETURN: self.activate_selected($options); return false;
					default:
						self.clearTimeout();
						self.search($e, $options);
				}
			});
		});
	};
	
	$.fn.suggest_results.box = null;
	$.fn.suggest_results.attached_to = null;
	$.fn.suggest_results.current_results = [];
	$.fn.suggest_results.selected_result = null;
	$.fn.suggest_results.timeout = null;
	
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
		var terms = (options.exact_match) ? $.trim(elm.val()) : elm.val().split(/\s/);
		if (typeof(options.url) === "string" && options.url !== "") {
			//TODO support fetching results from server-side
		} else {
			console.log(options.data);
			var results = self.filter_data(terms, options.data, options);
			console.log(results);
		};
		self.current_results = results;
		if (results.length > 0) {
			self.render(results, options);
			self.show();
		} else {
			self.hide();
		};
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
			var meta = {id: "suggested_result_" + i, "class": ""};
			if (i == 0) { $.extend(meta, {"class": "first"}); };
			if (i == results_length - 1) { $.extend(meta, {"class": "last"}); };
			html += self.mustache(options.template.result, $.extend({}, meta, results[i]));
		};
		self.box.html("");
		self.box.append(html);
		$(".result", self.box).click(function(){
			self.redirect_to($("a", $(this)).attr("href"));
		});
	};
	
	$.fn.suggest_results.attach = function(elm, options){
		var self = $.fn.suggest_results;
		var elm_uid = self.elm_uid(elm);
		if (elm_uid !== self.attached_to) {
			var offset = elm.offset();
			
			// left offset
			self.box.css("left", offset.left + "px");
			
			// top offset
			var top = offset.top + elm.innerHeight();
			top += parseInt(elm.css("border-top-width"), 10) + parseInt(elm.css("border-bottom-width"), 10);
			self.box.css("top", top + "px");
			
			// width
			if (typeof(options.width) === "number" || (typeof(options.width) === "string" && options.width != "")) {
				self.box.css("width", options.width);
			} else {
				var width = elm.innerWidth();
				width += parseInt(elm.css("border-left-width"), 10) + parseInt(elm.css("border-right-width"), 10);
				width -= parseInt(self.box.css("border-left-width"), 10) + parseInt(self.box.css("border-right-width"), 10);
				self.box.css("width", width + "px");	
			};
			
			self.attached_to = elm_uid;
		};
	};

	$.fn.suggest_results.show = function(){
		$.fn.suggest_results.box.show();
	};
		
	$.fn.suggest_results.hide = function(){
		var self = $.fn.suggest_results;
		self.setTimeout(function(){
			self.selected_result = null;
			self.box.hide();
		}, 500);
	};
	
	$.fn.suggest_results.select_next = function(options){
		var self = $.fn.suggest_results;
		var limit = self.current_results.length;
		console.log(limit);
		if (limit > 0) {
			if (self.selected_result === null) {
				self.selected_result = 0;
				$("#suggested_result_" + self.selected_result, self.box).addClass("selected");
			} else if (self.selected_result + 1 < limit) {
				$(".selected", self.box).removeClass("selected");
				self.selected_result++;
				$("#suggested_result_" + self.selected_result, self.box).addClass("selected");
			};	
		};
		return false;
	};
	
	$.fn.suggest_results.select_prev = function(options){
		var self = $.fn.suggest_results;
		var limit = self.current_results.length;
		console.log(limit);
		if (limit > 0) {
			if (self.selected_result === null) {
				self.selected_result = limit - 1;
				$("#suggested_result_" + self.selected_result, self.box).addClass("selected");
			} else if (self.selected_result > 0) {
				$(".selected", self.box).removeClass("selected");
				self.selected_result--;
				$("#suggested_result_" + self.selected_result, self.box).addClass("selected");
			};	
		};
		return false;
	};
	
	$.fn.suggest_results.activate_selected = function(options){
		var self = $.fn.suggest_results;
		if (self.selected_result !== null) {
			self.redirect_to(self.current_results[self.selected_result].href);
		};
	};
	
	$.fn.suggest_results.filter_data = function(terms, data, options){
		if (typeof(terms) === "string") { terms = [terms]; };
		var matched = "";
		var results = [];
		for (var i = terms.length - 1; i >= 0; i--){
			var term = terms[i];
			term = term.toLowerCase();
			if (data !== null && typeof(term) !== "undefined" && term !== "") {
				var data_length = data.length;
				for (var n=0; n < data_length; n++) {
					var title = data[n].title.toLowerCase();
					var match = (typeof(data[n].match) !== "undefined") ? data[n].match.toLowerCase() : "" ;
					if (title.indexOf(term) !== -1 || match.indexOf(term) !== -1) {
						if (matched.indexOf(":" + n + ":") == -1) {
							results.push(data[n]);
							matched += ":" + n + ":";
							if (results.length >= options.limit) {
								return results;
							};
						};
					};
				};
			};
		};
		return results;
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
	
	$.fn.suggest_results.redirect_to = function(url, location){
		if (typeof(location) == "undefined") {
			location = window.location;
		};
		var redirect_to = "";
		if (url.match(/.+\:\/\/.+/) === null) {
			redirect_to += location.protocol + "//";
			redirect_to += location.hostname;
			if (location.port != "") { redirect_to += ":" + location.port; };
			if (url.charAt(0) !== "/") {
				redirect_to += location.pathname.substr(0, location.pathname.lastIndexOf("/")+1);
			};
			window.location.href = redirect_to + url;
		} else {
			window.location.href = url;
		};
	};
	
	$.fn.suggest_results.setTimeout = function(callback, delay){
		var self = $.fn.suggest_results;
		self.clearTimeout();
		self.timeout = setTimeout(callback, delay);
	};
	
	$.fn.suggest_results.clearTimeout = function(){
		var self = $.fn.suggest_results;
		if (self.timeout !== null) {
			clearTimeout(self.timeout);
			self.timeout = null;
		};
	};
	
	$.fn.suggest_results.defaults = {
		delay: 150,
		limit: 6,
		data: null,
		exact_match: true,
		template: {
			container_id: "suggest_results",
			container: '<ol id="{{id}}"></ol>',
			result: '<li class="result {{class}}" id="{{id}}"><a href="{{href}}"><span class="title">{{title}}</span></a></li>',
			category: '<strong class="category {{class}}">{{category}}</strong>' //TODO add support for categories
		}
	};
	
})(jQuery);
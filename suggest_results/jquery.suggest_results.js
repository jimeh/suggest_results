/*!
 * Suggest Results v0.1.2
 * http://github.com/jimeh/suggest_results
 *
 * Copyright (c) 2010 Jim Myhrberg.
 * Released under the MIT license.
 */
(function($){
	$.fn.suggest_results = function(options){
		var self = $.fn.suggest_results;
		var $options = $.extend({}, self.defaults, options);
		
		self.init($options);
		
		var BACKSPACE = 8;
		var RETURN = 13;
		var ESC = 27;
		var ARRUP = 38;
		var ARRDN = 40;
		var SPECIALS_END = 45;
		
		return this.each(function(){
			var $e = $(this);
			$e.focus(function(){
				self.attach($e, $options);
				if ($e.val().length > 0) {
					self.setTimeout(function(){
						self.search($e, $options);
					}, $options.delay);
				};
			}).blur(function(){
				self.hide();
			}).keydown(function(e){
				switch(e.keyCode) {
					case ARRUP:
						self.select_prev($e, $options);
						return false;
					case ARRDN:
						self.select_next($e, $options);
						return false;
					case ESC:
						self.clear($e, $options);
						break;
					case RETURN:
						if (self.selected_result !== null) {
							self.activate_selected($options);
							return false;
						}
						break;
				}
			}).keyup(function(e){
				if (e.keyCode > SPECIALS_END || e.keyCode == BACKSPACE) {
					self.clearTimeout();
					self.search($e, $options);
				};
			});
		});
	};
	
	$.fn.suggest_results.box = null;
	$.fn.suggest_results.list = null;
	$.fn.suggest_results.attached_to = null;
	$.fn.suggest_results.current_results = [];
	$.fn.suggest_results.selected_result = null;
	$.fn.suggest_results.timeout = null;
	$.fn.suggest_results.query_cache = [];
	
	$.fn.suggest_results.init = function(options){
		var self = $.fn.suggest_results;
		self.box = $("#" + options.tpl_container_id);
		if (self.box.length == 0) {
			$("body").append(self.mustache(options.tpl_container, {id: options.tpl_container_id}));
			self.box = $("#" + options.tpl_container_id);
			self.list = self.box.children("ol");
		};
	};
	
	$.fn.suggest_results.search = function(elm, options){
		var self = $.fn.suggest_results;
		var terms = (options.exact_match) ? $.trim(elm.val()) : $.trim(elm.val()).split(/\s+/);
		if (typeof(options.url) === "string" && options.url !== "") {
			self.query_for_data(elm, options);
		} else {
			self.current_results = self.filter_data(terms, options.data, options);
			self.prerender(elm, self.current_results, options);
		};
	};
	
	$.fn.suggest_results.clear = function(elm, options){
		var self = $.fn.suggest_results;
		elm.val("");
		self.hide(0);
		self.selected_result = null;
	};
	
	$.fn.suggest_results.no_results = function(elm, options){
		var self = $.fn.suggest_results;
		if (options.no_results && elm.val() !== "") {
			var meta = {label: options.no_results_label, "class": "last"};
			self.list.html(self.mustache(options.tpl_label, meta));
			self.show();
		} else {
			self.hide(0);
		};
	};
	
	$.fn.suggest_results.prerender = function(elm, results, options){
		var self = $.fn.suggest_results;
		if (results.length > 0) {
			self.render(results, options);
			self.show();
		} else {
			self.no_results(elm, options);
		};
	};
	
	$.fn.suggest_results.render = function(results, options){
		var self = $.fn.suggest_results;
		var results_length = results.length;
		var html = "";
		for (var i=0; i < results_length; i++) {
			var meta = $.extend({}, results[i], {id: "suggested_result_" + i, "class": ""});
			if (i == 0) { $.extend(meta, {"class": "first"}); };
			if (i == results_length - 1) { $.extend(meta, {"class": "last"}); };
			html += self.mustache(options.tpl_result_begin, meta);
			html += self.mustache(options.tpl_result_body, meta);
			html += self.mustache(options.tpl_result_end, meta);
		};
		self.list.html(html);
		$(".result", self.list).click(function(){
			self.redirect_to($("a", $(this)).attr("href"));
		}).hover(function(){
			$(".selected", self.list).removeClass("selected");
			$(this).addClass("selected");
		},function(){
			$(this).removeClass("selected");
		});
	};
	
	$.fn.suggest_results.attach = function(elm, options){
		var self = $.fn.suggest_results;
		var elm_uid = self.elm_uid(elm);
		if (elm_uid !== self.attached_to) {
			self.box.hide().attr("class", options.name);
			var offset = elm.offset();
			
			// left offset
			self.box.css("left", offset.left + "px");
			
			// top offset
			var top = offset.top + elm.innerHeight();
			top += parseInt(elm.css("border-top-width"), 10) + parseInt(elm.css("border-bottom-width"), 10);
			self.box.css("top", top);
			
			// width
			if (typeof(options.width) === "number" || (typeof(options.width) === "string" && options.width != "")) {
				self.box.css("width", options.width);
			} else {
				var width = elm.innerWidth();
				width += parseInt(elm.css("border-left-width"), 10) + parseInt(elm.css("border-right-width"), 10);
				width -= parseInt(self.box.css("border-left-width"), 10) + parseInt(self.box.css("border-right-width"), 10);
				self.box.css("width", width);
			};
			self.attached_to = elm_uid;
		};
	};

	$.fn.suggest_results.show = function(){
		$.fn.suggest_results.box.show();
	};
		
	$.fn.suggest_results.hide = function(delay){
		var self = $.fn.suggest_results;
		if (typeof(delay) !== "number") { delay = 250; };
		self.selected_result = null;
		self.setTimeout(function(){
			self.selected_result = null;
			self.box.hide();
		}, delay);
	};
	
	$.fn.suggest_results.select_next = function(elm, options){
		var self = $.fn.suggest_results;
		var limit = self.current_results.length;
		if (limit > 0) {
			if (self.selected_result === null) {
				$(".selected", self.list).removeClass("selected");
				self.selected_result = 0;
				$("#suggested_result_" + self.selected_result, self.box).addClass("selected");
			} else if (self.selected_result + 1 < limit) {
				$(".selected", self.list).removeClass("selected");
				self.selected_result++;
				$("#suggested_result_" + self.selected_result, self.box).addClass("selected");
			} else {
				$(".selected", self.list).removeClass("selected");
				self.selected_result = null;
				elm.putCursorAtEnd();
			};	
		};
		return false;
	};
	
	$.fn.suggest_results.select_prev = function(elm, options){
		var self = $.fn.suggest_results;
		var limit = self.current_results.length;
		if (limit > 0) {
			if (self.selected_result === null) {
				$(".selected", self.list).removeClass("selected");
				self.selected_result = limit - 1;
				$("#suggested_result_" + self.selected_result, self.box).addClass("selected");
			} else if (self.selected_result > 0) {
				$(".selected", self.list).removeClass("selected");
				self.selected_result--;
				$("#suggested_result_" + self.selected_result, self.box).addClass("selected");
			} else {
				$(".selected", self.list).removeClass("selected");
				self.selected_result = null;
				elm.putCursorAtEnd();
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
		var terms_length = terms.length;
		for (var i=0; i < terms_length; i++) {
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
	
	$.fn.suggest_results.query_for_data = function(elm, options){
		var self = $.fn.suggest_results;
		var term = elm.val();
		var uid = options.url + "?" + term + ":" + options.limit;
		if (term !== "") {
			if (self.query_cache.hasOwnProperty(uid)) {
				self.current_results = self.query_cache[uid];
				self.prerender(elm, self.current_results, options);
			} else {
				var data = { limit: options.limit };
				data[options.url_query_var] = term;
				$.ajax({
					type: options.url_method,
					url: options.url,
					data: data,
					dataType: "json",
					success: function(response){
						self.current_results = response.results;
						self.query_cache[uid] = self.current_results;
						self.prerender(elm, self.current_results, options);
					}
				});
			};
		} else {
			self.no_results(elm, options);
		};
	};
	
	$.fn.suggest_results.elm_uid = function(elm){
		if (elm.attr("id") !== "") {
			return "#" + elm.attr("id");
		} else if (elm.attr("class") !== "") {
			return "." + elm.attr("class");
		} else if (elm.attr("name") !== "") {
			return "!" + elm.attr("name");
		};
		return "";
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
	
	// "borrowed" from PutCursorAtEnd plugin: http://plugins.jquery.com/project/PutCursorAtEnd
	$.fn.putCursorAtEnd = function(){
		return this.each(function(){
			$(this).focus();
			if (this.setSelectionRange) {
				var len = $(this).val().length * 2;
				this.setSelectionRange(len, len);
			} else {
				$(this).val($(this).val());
			}
			this.scrollTop = 999999;
		});
	};
	
	$.fn.suggest_results.defaults = {
		name: "",
		exact_match: true,
		limit: 6,
		no_results: true,
		no_results_label: "No Results",
		url: null,
		url_method: "get",
		url_query_var: "search",
		delay: 100,
		data: null,
		tpl_container_id: "suggest_results",
		tpl_container: '<div id="{{id}}"><ol></ol></div>',
		tpl_result_begin: '<li class="result {{class}}" id="{{id}}"><a href="{{href}}">',
		tpl_result_body: '<span class="title">{{title}}</span>',
		tpl_result_end: '</a></li>',
		tpl_label: '<li class="label {{class}}">{{label}}</li>'
	};
	
})(jQuery);


/*
	Crossbrowser hasOwnProperty solution, based on answers from:
	http://stackoverflow.com/questions/135448/how-do-i-check-to-see-if-an-object-has-an-attribute-in-javascript
*/
if ( !Object.prototype.hasOwnProperty ) {
	Object.prototype.hasOwnProperty = function(prop) {
		var proto = obj.__proto__ || obj.constructor.prototype;
		return (prop in this) && (!(prop in proto) || proto[prop] !== this[prop]);
	};
}
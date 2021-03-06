!function(window, undefined) {

	
	var   _Caffeinated	= window.Caffeinated
		, _cafe			= window.cafe
		, Caffeinated	= cafe = {}

	Caffeinated.noConflict = function(deep) {
		
		if(window.cafe === Caffeinated)
			window.cafe = _cafe
		
		if(deep && window.Caffeinated === Caffeinated)
			window.Caffeinated = _Caffeinated

		return Caffeinated
	}

	cafe.defaults = {
		ui_bases	: {
			"bs:button"			: "button"
			, "bs:list"			: "ul"
			, "bs:label"		: "label"
			, "bs:chkbox"		: "label"
			, "bs:radio"		: "label"
			, "bs:list"			: "ul"
			, "bs:item"			: "li"
			, "bs:divider"		: "li"
			, "bs:datepicker"	: "input"
			, "bs:grid"			: "table"
			, "bs:select" 		: "select"
			, "bs:option" 		: "option"
		}
		//
		, encode		: "utf-8"
		, debug			: "false"
		, theme			: "default"
		, welcome_page	: "index.xml"
		//
		, lib_path		: "scripts/"
		, plugins_path	: "scripts/"
		, themes_path	: "themes/"
		, core_path		: "cafe-core.js"
		, jquery_path	: "jquery.js"
	}
	
	/*
	 *	Object extend Support
	 *	Copied from jQuery Source Code(v1.7.2)
	 */
	extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false
	
		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target
			target = arguments[1] || {}
			// skip the boolean and the target
			i = 2
		}
	
		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
			target = {}
		}
	
		// extend jQuery itself if only one argument is passed
		if ( length === i ) {
			target = this
			--i
		}
	
		for ( ; i < length; i++ ) {
			// Only deal with non-null/undefined values
			if ( (options = arguments[ i ]) != null ) {
				// Extend the base object
				for ( name in options ) {
					src = target[ name ]
					copy = options[ name ]
	
					// Prevent never-ending loop
					if ( target === copy ) {
						continue
					}
	
					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
						if ( copyIsArray ) {
							copyIsArray = false
							clone = src && jQuery.isArray(src) ? src : []
	
						} else {
							clone = src && jQuery.isPlainObject(src) ? src : {}
						}
	
						// Never move original objects, clone them
						target[ name ] = jQuery.extend( deep, clone, copy )
	
					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy
					}
				}
			}
		}
	
		// Return the modified object
		return target
	}

	var getCookieItem = function(key) {
			if (!key || !hasCookieItem(key)) { return null; }
			return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
		}
		, setCookieItem = function(key, val, end, path, domain, secure) {
			if (!key || /^(?:expires|max\-age|path|domain|secure)$/.test(key)) { return; }
			var sExpires = "";
			if (end) {
				switch (typeof end) {
					case "number": sExpires = "; max-age=" + end; break;
					case "string": sExpires = "; expires=" + end; break;
					case "object": if (end.hasOwnProperty("toGMTString")) { sExpires = "; expires=" + end.toGMTString(); } break;
				}
			}
			document.cookie = escape(key) + "=" + escape(val) + sExpires + (domain ? "; domain=" + domain : "") + (path ? "; path=" + path : "") + (secure ? "; secure" : "");
		}
		, removeCookieItem = function(key) {
			if (!key || !hasCookieItem(key)) { return; }
			var oExpDate = new Date();
			oExpDate.setDate(oExpDate.getDate() - 1);
			document.cookie = escape(key) + "=; expires=" + oExpDate.toGMTString() + "; path=/";
		}
		, hasCookieItem = function(key) {
			return (new RegExp("(?:^|;\\s*)" + escape(key).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
		}



	extend(cafe, {
		  extend		: extend
	})
	
	if ( typeof window === "object" && typeof window.document === "object" ) {

		extend(window, {

			Caffeinated	: cafe
			, cafe		: cafe
			, extend	: extend

			//Cookie Utils
			, getCookieItem	: getCookieItem
			, setCookieItem	: setCookieItem
			, removeCookieItem: removeCookieItem
			, hasCookieItem	: hasCookieItem

		})

	}

} (window, undefined)
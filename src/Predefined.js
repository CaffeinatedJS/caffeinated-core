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
			  "bs:button"		:
					'<button '
					+ 'type="button" '
					+ 'class="btn @concat("btn-", ${face-type}) @concat("btn-", ${size})" '
					+ 'data-loading-text="@ref(${loading-text})"'
					+ '></button>'
			
			, "bs:modal"		:
					'<div '
					+ 'class="modal fade @ref(${visible})" '
					+ '/>'
			, "bs:modal-header"	: '<div class="modal-header"/>'
			, "bs:modal-body"	: '<div class="modal-body"/>'
			, "bs:modal-footer"	: '<div class="modal-footer"/>'
			, "bs:static-modal"	: '<div class="modal"/>'

			, "bs:dropdown"		: '<div class="dropdown"/>'
			, "bs:dropdown-toggle":
					'<a class="dropdown-toggle" '
					+ 'data-toggle="dropdown" '
					+ 'href="@ref(${href})"/>'
			, "bs:dropdown-menu"	: '<ul class="dropdown-menu"/>'
			, "bs:item"			: '<li class="@if(${actived}, "active", "")"><a href="@ref(${href})">@text()</a></li>'
			, "bs:divider"	: '<li class="divider"></li>'

			, "bs:caret"		: '<span class="caret"/>'
			, "bs:icon"			: '<span class="icon-@ref(${face}) @concat("icon-", ${color})"/>'

			, "bs:navbar"		: '<div class="navbar @concat("navbar-", ${position}) @concat("navbar-", ${face-type})">'
					+ '<div class="navbar-inner"><div class="container">@content()</div></div></div>'
			, "bs:nav-collapse"	: '<div class="nav-collapse collapse"/>'
			, "bs:nav-collapse-trigger": '<button type="button" class="btn btn-navbar" '
					+ 'data-toggle="collapse" data-target=".nav-collapse">'
					+ '<span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span>'
					+ '</button>'
			, "bs:brand"		: '<a class="brand">@content()</a>'
			, "bs:nav"			: '<ul class="nav @concat("nav-", ${type})"/>'
			, "bs:item-dropdown": '<li class="dropdown"/>'

			, "bs:list"			: "ul"
			, "bs:label"		: "label"
			, "bs:chkbox"		: "label"
			, "bs:radio"		: "label"
			, "bs:list"			: "ul"
			//, "bs:item"			: "li"
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
		if ( typeof target !== "object" && !isFunction(target) ) {
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
					if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = isArray(copy)) ) ) {
						if ( copyIsArray ) {
							copyIsArray = false
							clone = src && isArray(src) ? src : []
	
						} else {
							clone = src && isPlainObject(src) ? src : {}
						}
	
						// Never move original objects, clone them
						target[ name ] = extend( deep, clone, copy )
	
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

	isPlainObject = function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || type(obj) !== "object" || obj.nodeType || isWindow( obj ) ) {
			return false;
		}

		try {
			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call(obj, "constructor") &&
				!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
				return false;
			}
		} catch ( e ) {
			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	}

	isWindow = function( obj ) {
		return obj != null && obj == obj.window;
	}

	isArray = Array.isArray || function( obj ) {
		return type(obj) === "array";
	}

	type = function( obj ) {
		return obj == null ?
			String( obj ) :
			toString.call(obj) || "object";
	}

	isFunction = function( obj ) {
		return type(obj) === "function";
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
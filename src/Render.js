!function(window, extend, cafe, $) {

	var Render = function (xmlParser, htmlGenerator) {
		this.isIE = window.navigator.userAgent.indexOf('MSIE') > 0
		
		this.ids = {}
		//rendContext = {stack:[]}
		this.renderContext = {
			__ids__	: {}
		}
		this.xmlParser = xmlParser || new XMLParser(this.isIE)
		this.htmlGenerator = htmlGenerator 
								|| new HTMLGenerator(this.isIE, this.renderContext)

	}
	
	Render.prototype = {

		rend				: function(xml, tgt, context, params) {
			
			var html = this.generateHTML(this.parseXML(xml), context)
				, target = tgt//.constructor == String ? $(tgt) : tgt
				, queue = context.__queue__
				, initHandler = context[html.id] && context[html.id].init

			target.html(html)
			//$(target.selector + " *").after("\n")

			if(target.hasClass("ui_include")
				|| html.className.split(" ").indexOf("ui_application") > -1)
				$(html).unwrap()

			//TODO: chage the way to check login state
			permissions = (getCookieItem("pms") || "").replace(/\s*\,\s*/g, ",").split(",")

			for (var i = 0; i < queue.length; i++) {
				var id = queue[i].id
					, namespace = queue[i].name.split(":")[0]
					, name = queue[i].name.split(":")[1]
					, options = context[id]

				if (options.required
						&& permissions.indexOf(options.required) === -1) {
					$("#" + id).remove()
					continue
				}

				this.preparePluginOption(context[id])
				
				var  required = options.required
					, exsitBeforeLogin = options.beforeLogin
					, $element = $("#" + id)

				if($.fn[name])
					$element[name].call($element, options)

			}

			//after rend
			if (initHandler) initHandler(params)

			//TODO: add Support for Pretty-Print

			//Process Select->Options value
			$("option:not([value])").val("")

		}

		, parseXML			: function(xml){
			return this.xmlParser.parse(xml)
		}

		, generateHTML		: function(root, context){
			return this.htmlGenerator.generate(root, context)
		}

		, generateDOMBase	: function() {
			
		}

		, caseProccessor	: function() {

		}

		, preparePluginOption	: function(option) {
			for(var n in option) {
				if(n == "id" || n == "name") continue
				option[n] = window[option[n]] ? window[option[n]] : option[n]
			}
		}

	}

	var XMLParser = function(isIE) {
		this.isIE = isIE || window.navigator.userAgent.indexOf('MSIE') > 0
		this.scriptNodeTestReg = /^([a-zA-Z]+\:)?script$/g
	}
	
	XMLParser.prototype = {

		parse				: function(dom){

			var dom = dom.nodeName === '#document'
					? dom.childNodes[0]
					: dom
				, node = this.parseXMLNode(dom)

			if(!dom.childNodes.length)
				return node

			node.childs = []

			//*
			/* clean text node which text length is 0 */
			var delta = 0

			for(var i = 0; i < dom.childNodes.length; i++) {
				
				var child = this.parse(dom.childNodes[i])
				if(child.type === "Text" && !child.text) {
					delta++
					continue
				}
				node.childs[i - delta] = child
				
			}
			//*/

			/*
			/* keep text node which text length is 0
			for(var i = 0; i < dom.childNodes.length; i++) {
				node.childs[i] = this.parse(dom.childNodes[i])
			}
			//*/

			return node

		}

		, parseXMLNode		: function(dom) {

			var node = {
				  id			: dom.attributes 
				  		&& dom.attributes.getNamedItem("id")
				  		&& dom.attributes.getNamedItem("id").value
				, type			: this.detectXMLNodeType(dom)
				, name			: dom.nodeName
				, attributes	: {}
			}

			switch (node.type) {

				case "Element" :

					//copy node attributes
					
					for(var i = 0; i < dom.attributes.length; ++i) {
						node.attributes[dom.attributes[i].name] = 
							dom.attributes[i].value
					}

					//process ui:case element
					if(dom.nodeName === 'ui:case') {
						node.code = this.procesUICaseNode(dom)
					}

					break

				case "Text" :
					node.text = (this.isIE ? dom.text : dom.textContent).trim()
					break
				//*
				case "Cdata-section" :
					node.text = dom.data
					break
				//*/

				case "Script" :

					break

				case "Comment" :
					node.text = (this.isIE ? dom.text : dom.textContent).trim()
					break

			}

			return node

		}

		, detectXMLNodeType	: function(dom){

			var type = "Element"

			if (dom.nodeName.indexOf("#") == 0)
				type = (dom.nodeName.substring(1,2).toUpperCase() 
							+ dom.nodeName.substring(2))

			if (this.scriptNodeTestReg.test(dom.nodeName))
				type = "Script"

			return type
			
		}

		, procesUICaseNode	: function(dom){

			var code = ''
				, code_beautifier 
					= window.style_html 
						&& typeof window.style_html === 'function'
				, code_beautify_options = {
						brace_style					: "expand"
						, indent_char				: " "
						, indent_scripts			: "normal"
						, indent_size				: "4"
						, keep_array_indentation	: false
						, preserve_newlines			: true
						, space_after_anon_function	: true
						, space_before_conditional	: true
						, unescape_strings			: true
					}

			for (var i = 0; i < dom.childNodes.length; i++) {
				code += (this.isIE
						? dom.childNodes[i].xml
						: new XMLSerializer()
							.serializeToString(dom.childNodes[i]))//.trim()
			}

			code = code.replace(/ xmlns:\w+="[^"]+"/g, "")
						.replace(/</g, "&lt;")
						.replace(/>/g, "&gt;")

			if(!code_beautifier) return code
			
			return code_beautifier(code, code_beautify_options)

		}
	}

	var HTMLGenerator = function(isIE, context) {
		this.isIE = isIE || window.navigator.userAgent.indexOf('MSIE') > 0
		this.renderContext = context
		this.htmlTagNameReg = /^[a-z0-9]+$/
		this.tagNameWithNS = /^[a-zA-Z0-9\_\-]+\:[a-zA-Z0-9\_\-]+$/
	}
	
	HTMLGenerator.prototype = {
		
		generate			: function(root, context) {

			var dom = this.generateDOM(root, context)

			if(!context.__SPACES__) context.__SPACES__ = ""

			if(!root.childs || !root.childs.length)
				return dom

			context.__SPACES__ += "\t"

			for (var i = 0; i < root.childs.length; i++) {
				
				var child = root.childs[i]

				dom.appendChild(document.createTextNode("\n" + context.__SPACES__))
				dom.appendChild(this.generate(child, context))

			}

			context.__SPACES__ = context.__SPACES__.substring(1)
			dom.appendChild(document.createTextNode("\n" + context.__SPACES__))

			return dom

		}

		, generateDOM		: function(node, context) {
			
			switch (node.type) {
				case "Element" :
					return this.generateElement(node, context)
				case "Script" :
					return this.generateScript(node, context)
				case "Cdata-section" :
					return this.generateScript(node, context)
				case "Comment" :
					return this.generateComment(node, context)
				case "Text" :
					return this.generateText(node, context)
			}

		}

		, generateElement	: function(node, context) {

			var base = node.attributes.ui_base
					//TODO: check cafe options
					|| cafe.context.options.ui_bases[node.name]
					|| (this.htmlTagNameReg.test(node.name) 
						? node.name : '')
					|| "div"
				//, id = node.id
				, dom, attrs = node.attributes

						
			//if(!id) node.id = generateElementId(node.name)
			/*
			 * base dom like
			 * 	'<div class="button" data-toggle="modal" data-target="myModal"/>' 
			 */
			if(/^<.+>$/.test(new String(base))) {
				
				var dom = document.createElement("div")
					, childs = dom.childNodes
				
				dom.innerHTML = base

				/* 
				 * childs.length === 0 means base's format is illegal
				 * childs.length > 1 means base has multi base dom
				 */
				if(childs.length !== 1)
					dom = document.createElement("div")

				/* for multi base dom */
				if(childs.length > 1)
					for (var i = 0; i < childs.length; i++) {
						dom.appendChild(childs[i])
					}

			/*
			 * base dom like "div"
			 * NOTICED: DO NOT SUPPORT tag name with namespace for now!
			 */
			} else if(this.htmlTagNameReg.test(new String(base))) {

				dom = document.createElement(base)

			/*
			 * base dom like an Object
			 * 	{
			 * 		tagName : "div"
			 * 		, attributes : {
			 * 			class : "button"
			 * 		}
			 * 	}
			 */	
			} else if(base.constructor === Object) {

				var tagName = base.tagName
								|| base.tag
								|| base.name
								|| "div"
				node.attributes = extend({}
										, base.attributes
										, base.attrs
										, base.attr
										, base.options
										, node.attributes)

				dom = document.createElement(tagName)
			}

			dom.id = node.id || this.generateElementId(node.name)

			for (var n in attrs) {
				attrs[n] = this.valueOf(attrs[n])
			}

			context[dom.id] = attrs
			context.__queue__.unshift({name: node.name, id: dom.id})

			//TODO:
			for (var n in attrs) {
				dom.setAttribute(this.toHTMLAttrName(n), attrs[n])
			}

			if(this.tagNameWithNS.test(node.name))
				dom.classList.add(node.name.replace(/\:/, '_'))

			return dom
		}

		, generateScript	: function(node, context) {
			var dom = document.createElement("script")
			dom.setAttribute("type", "text/javascript")
			eval(node.text)
			return dom
		}

		, generateComment	: function(node, context) {
			return document.createComment(node.text)
		}

		, generateText		: function(node, context) {
			return document.createTextNode(node.text)
		}

		, parseBase	: function(node){
			
		}

		, valueOf			: function(val){
			
			/*
			// ECMA Script 5 has no Integer, Float or Double data-type, instead of is Nubmer
			if(/^\-?[1-9][0-9]*$/.test(val))
				return parseInt(val)
			//*/

			if(/^\-?[1-9][0-9]*$(\.[0-9]+)?/.test(val))
				return parseFloat(val)

			if(/(true)|(false)/.test(val))
				return val === 'true'

			return val

		}

		, toHTMLAttrName	: function(name){
			return name.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/g, "_");
		}

		, generateElementId	: function(name){
			
			var name = name.replace(":", "_")
				, ids = this.renderContext.__ids__
			
			if(!ids[name]) ids[name] = 0;
			return "gen_" + name + "_" + (++ids[name]);

		}
	}

	extend(cafe, {
		Render			: Render
		, XMLParser		: XMLParser
		, HTMLGenerator	: HTMLGenerator
	})

	//
	var _Render = window.Render
	
	window.Render = Render
	
	window.Render.noConflict = function() {
		window.Render = _Render
		return this
	}

} (window, window.extend, window.cafe, window.jQuery)
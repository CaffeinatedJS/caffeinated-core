cafe.config({

	theme	: "bootstrap"
	
	, ui_bases	: {
		"bs:button"	: "button"
		, "bs:list"	: "ul"
		, "bs:label"	: "label"
		, "bs:chkbox"	: "label"
		, "bs:radio"	: "label"
		, "bs:list"	: "ul"
		, "bs:item"	: "li"
		, "bs:divider": "li"
		, "bs:datepicker": "input"
		, "bs:grid"	: "table"
		, "bs:select" : "select"
		, "bs:option" : "option"
	}
	
	, welcome_page: "index.xml"
	
	, lib_path		: "../../src/"
	, plugins_path	: "../../lib/"
	, themes_path		: "../../themes/"
	
	, jquery_path		: "dependences/jquery-1.7.2.js"
	, core_path		: "caffeinated/Core.js"

	// , plugins : {

	// 	  bootstrap	: {
	// 	  	  alias		: "bs"
	// 	  	, plugins	: [

	// 	  	  ]
	// 	  }
	// }
	
	, plugins	: [
		
		//* Bootstrap UI
		  "bootstrap/bootstrap.js"
		, "bootstrap/bootstrap-extend.js"
		, "bootstrap/bootstrap-grid.js"
		, "bootstrap/bootstrap-datepicker.js"
		, "prettify/prettify.js"
		
		, "beautify/beautify-html.js"
		, "beautify/beautify.js"
		
		, "demo/clients-lib-account.js"
		, "demo/clients-lib-comp.js"
		, "demo/clients-lib-feed.js"
		, "demo/clients-lib-order.js"
		

	]
	
	, properties	: {
		"remote.server.srv1"	: "192.168.5.191:8080"
	}
	
})
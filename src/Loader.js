!function (window, undefined, cafe) {

	var UUID = function() {
		var S4 = function () {
			return (((1 + Math.random()) * 0x100000000) | 0).toString(36).substring(1)
		}
		/*
		this.value = (S4() + S4()
						+ "-" + S4()
						+ "-" + S4()
						+ "-" + S4()
						+ "-" + S4() + S4() + S4())
		//*/
		this.value = new Date().getTime().toString(36) + S4() + S4() + S4()
		this.toString = function() {
			return this.value
		}
	}

	cafe.config = function(options) {
		this.options = this.options || {}
		this.options = extend(true, {}, cafe.defaults, this.options, options)
	}

	/*
	 * for IE
	 */
	if (!window.console) 
		window.console = {
			  log		: function() {}
			, info		: function() {}
			, error		: function() {}
			, group		: function() {}
			, groupEnd	: function() {}
		}

	var Logger = function(debug, console, isChrome) {
		this.debug = debug
		this.console = console || window.console
		this.isChrome = isChrome
		this.divider = '-'.replace(/(\-)/, "$1$1$1$1$1").replace(/((\-){5})/, "$1$1")
		this.divider = isChrome
				? this.divider.replace(/((\-){10})/, "$1$1$1$1$1")
				: this.divider.replace(/((\-){10})/, "$1$1$1$1$1$1")
		//this.level = level || 'error'
	}
	
	Logger.prototype = {

		log		: function() {
			this.output(arguments, this.console.log)
		}
		
		, info		: function() {
			this.output(arguments, this.console.info)
		}

		, warn		: function() {
			this.output(arguments, this.console.warn)
		}

		, error		: function() {
			this.output(arguments, this.console.error)
		}

		, group		: function() {
			this.output(arguments, this.console.group)
		}

		, groupEnd	: function() {
			this.console.groupEnd()
		}

		, time		: function(label) {
			if(this.debug) this.console.time(label)
		}

		, timeEnd	: function(label) {
			if(this.debug) this.console.timeEnd(label)
		}

		, output: function(args, output) {
			if(this.debug) {
				args[0] = args[0].toString().replace(/\={5}/, this.divider)
				if(!this.isChrome) args[0] = args[0].replace(/\%./g, "")
				output.apply(this.console, args)
			}
		}

	}

	var _this = document.getElementById('cafe-loader') || document.scripts[0]
		, config_path	= _this.getAttribute('data-config') || 'cafe-config.js'
		, debug_in_cafe	= _this.getAttribute('data-debug') === 'true' ? true : false
		, isChrome		= /chrome/.test(window.navigator.userAgent.toLowerCase())
		//*
		, console		= window.console
						= cafe.console
						= new Logger(debug_in_cafe, window.console, isChrome)
		//*/

	/*
	 *	Caffeinated Context
	 */
	var Context = function() {
		this.jobs	= new JobQueue(this)
		this.loader = new Loader()
		//this.stack = {};//???
	}
	
	Context.prototype = {
	
		init 			: function() {
			
			var loader = this.loader
				, jobs = this.jobs

			this.loadConfigJobs(jobs, loader)
			this.loadDependencesJobs(jobs, loader)
			this.loadThemesAndPluginsJobs(jobs, loader)
			this.initMainViewJobs(jobs, loader)

			this.jobs.start()
			//this.initRuntime()
			
		}

		, loadConfigJobs			: function(jobs, loader) {

			this.isdebug = debug_in_cafe
			
			jobs.add(new AsyncJob(function(context) {
				loader.loadScripts(config_path, this)
			}, "load config define"))

			jobs.add(new SerialJob(function(context) {
				context.options = extend({}, cafe.defaults, cafe.options)
				context.options.debug = context.isdebug
			}, "configrate context options"))
		}

		, loadDependencesJobs		: function(jobs, loader) {
			//*
			jobs.add(new AsyncJob(function(context) {
				var options = context.options
				loader.loadScripts([options.lib_path + options.jquery_path], this)
			}, "load jQuery"))

			jobs.add(new AsyncJob(function(context) {
				var options = context.options
				loader.loadScripts([options.lib_path + options.core_path])
				loader.loadScripts(
					[(options.themes_path + options.theme + "/theme.js")]
					, this)
			}, "load basic dependences"))

			jobs.add(new SerialJob(function(context) {
				context.options = extend({}, cafe.defaults, cafe.options)
			}, "configrate theme options"))
			//*/

			/*
			var transc = new Transaction([
				
				new AsyncJob(function(context) {
					var options = context.options
					loader.loadScripts([options.lib_path + options.core_path])
					loader.loadScripts(
						[(options.themes_path + options.theme + "/theme.js")]
						, this)
				}, "load basic dependences")

			], "load theme package and other plug-ins")

			jobs.add(transc)
			//*/
		}

		, loadThemesAndPluginsJobs	: function(jobs, loader) {

			//var options = this.options
				//, 

			//*
			var transc = new Transaction([
				
				new SerialJob(function(context) {
					var transc = this.transction
						, options = context.options
						, plugins = options.plugins
						, styles = options.currentTheme.styles

					//Load theme files

					//Load plugins
					for(var n in plugins) {
						var url = plugins[n]
							
						transc.add(new AsyncJob(function() {
							loader.loadScripts(
								url.indexOf("http://") === 0 ? url : options.plugins_path + url
								, this
							)
						}, 'load "' + url + '"'))
					}
					
					//Load style sheets
					for(var n in styles) {
						var url = styles[n]
							
						transc.add(new AsyncJob(function() {
							loader.loadCssFiles(
								options.themes_path
									+ options.theme
									+ "/" + url
								, this
							)
						}, 'load "' + url + '"'))
					}

				}, "prepare loader jobs")

			], "load plug-ins and theme resouces")

			jobs.add(transc)
			//*/
		}

		, initMainViewJobs			: function(jobs, loader) {

			jobs.add(new SerialJob(function(context) {
				
				var render = new cafe.Render()
					, viewManager = new cafe.ViewManager(render)
				
				context.viewManager = viewManager
				//viewManager.initMainView()
				viewManager.load(context.options.welcome_page);

			}, "init main view"))

		}
		
	}
	
	
	/*
	 *	ICUI Context Job Scheduling
	 */
	var JobQueue = function(context) {
		//console.log("Start jobs queue initializing......")
		this.queue		= []
		this.jobs		= {}
		this.isWorking	= false
		this.context	= context

	}
	
	JobQueue.prototype = {
		
		start		: function() {

			if(this.isWorking) return

			this.open()

			var context = this.context
				, nextJob = this.next()

			if(nextJob)
				this.process(nextJob)

		}
		
		, add		: function(job) {
			
			job.queue = this

			this.queue.push(job.id)
			this.jobs[job.id] = job
			this.isEmpty = false

		}
		
		, next		: function() {
			return this.jobs[this.queue[0]]
		}

		, process	: function(job) {

			var log = job instanceof Transaction
							? console.group
							: console.info

			log.apply(console
				, ["%c\u2193 %cProcessing: %c"
					+ (job.desc || job.id)
					, "font-weight:bold;color:#007CF3"
					, "font-weight:bold;color:#333"
					, "font-weight:normal;color:#333"
			])

			job.process(context)

		}
		
		, finish	: function(id, success) {

			var job = this.jobs[id]


			//I dont know why!!!
			if(job == undefined 
				&& /(msie) ([\w.]+)/.test(window.navigator.userAgent.toLowerCase()))
				return
			
			if(job.isDone()) {
				
				if(success)
					console.info(
						  "%c\u2714 %cComplete\t: %c"
							+ (job.desc || job.id)
						, "font-weight:bold;color:#00A600"
						, "font-weight:bold;color:#333"
						, "font-weight:normal;color:#333")
				else
					console.info(
						  "%c\u2716 %cFaild\t\t: %c"
							+ (job.desc || job.id)
						, "font-weight:bold;color:red"
						, "font-weight:bold;color:red"
						, "font-weight:normal;color:red")

				delete this.jobs[id]
				this.queue.shift()
				//UIContext.start()
				//this.isEmpty = this.jobs.length > 0
				
				var nextJob = this.next()

				if(nextJob) {
					this.process(nextJob)
				} else {
					this.close()
				}
			}
		}

		, open		: function() {

			this.timestamp = new Date()
			
			console.info(
				  "\n%cOK, let's do this!\t\t"
				  	+ this.timestamp.toLocaleString()
					+ "\n====="
				, "font-weight:bold;"
			)
			
			this.isWorking = true
			
		}

		, close		: function() {

			if(this.onClosed) this.onClosed.apply(this)

			this.onClosed = undefined
			
			var timestamp = new Date()

			this.isWorking = false

			console.info(
				  "%c=====\n"
					+ "Great, jobs queue has been cleaned!\n"
					+ "Total : "
					+ (timestamp.getTime() - this.timestamp.getTime()) / 1000
					+ "sec\t\t"
					+ timestamp.toLocaleString()
				, "font-weight:bold;"
			)

		}
		
	}
	
	var SerialJob = function(job, desc) {
		
		this.job	= job
		this.desc	= desc
		this.id		= new UUID().toString()
		this.stat	= "sleep"
	
	}
	
	SerialJob.prototype = {

		process	: function(context) {

			this.stat = "actived"
			this.success = true

			try {
				this.job(context)
			} catch(e) {
				console.error(e)
				this.success = false
			}

			this.stat = "done"

			this.done(this.success)
			
		}
		
		, done	: function(success) {
			this.stat == "done"
			this.queue.finish(this.id, success)
		}
		
		, isDone	: function() {
			return this.stat == "done"
		}
	}
	
	var AsyncJob = function(job, desc) {
		
		var id	= this.id = new UUID().toString()

		this.job	= job
		this.desc	= desc
		this.stat	= "sleep"
		
		/*
		this.callback = function() {
			UIContext.finishJob(id)
		}
		//*/

	}
	
	AsyncJob.prototype = {

		process	: function(context) {
			
			this.stat = "actived"
			this.job(context)

		}

		, done		: function(success) {

			this.stat = "done"
			this.queue.finish(this.id, success)

		}

		, isDone	: function() {
			return this.stat == "done"
		}

	}
	
	var Transaction = function(jobs, desc) {
		
		this.id = new UUID().toString()
		this.jobs = []
		this.desc = desc
		this.stat = "sleep"
		this.threads = 0
		this.success = true

		this.add(jobs)

		/*
		var id = this.id
		this.callback = function() {
			UIContext.finishJob(id)
		}
		//*/
	}
	
	Transaction.prototype = {

		add				: function(job) {

			if(this.stat === "done")
				console.error("You can't add any job into the Transaction has been done.")

			//*

			var jobs = job instanceof Array ? job : [job]
			
			this.jobs = this.jobs.concat(jobs)

			this.threads = this.jobs.length

			if(this.stat === "actived") {
				this.processJobs(jobs)
			}

		}

		, processJobs	: function(job) {

			var jobs = job || this.jobs

			for(var n in jobs) {
				
				var job = jobs[n]
					, log = job instanceof Transaction
							? console.group
							: console.info

				job.transction = job.queue = this

				log.apply(console
					, ["%c\u2193 %cProcessing: %c"
						+ (job.desc || job.id)
						, "font-weight:bold;color:#007CF3"
						, "font-weight:bold;color:#333"
						, "font-weight:normal;color:#333"
				])

				job.process(context)

			}

		}

		, process	: function(context) {

			this.stat = "actived"

			this.processJobs()

		}
		
		, finish: function(id, success) {

			var jobs = this.jobs
				, job, n

			this.success = this.success && success

			for(n in jobs) { if(jobs[n].id === id) job = jobs[n] }

			if(job.isDone()) {
				
				if(success)
					console.info(
						  "%c\u2714 %cComplete\t: %c"
							+ (job.desc || job.id)
						, "font-weight:bold;color:#00A600"
						, "font-weight:bold;color:#333"
						, "font-weight:normal;color:#333")
				else
					console.info(
						  "%c\u2716 %cFaild\t\t: %c"
							+ (job.desc || job.id)
						, "font-weight:bold;color:red"
						, "font-weight:bold;color:red"
						, "font-weight:normal;color:red")

				delete job
				//this.jobs.shift()

			}

			this.stat = (--this.threads) == 0 ? "done" : "actived"

			if(this.stat === "done") {
				console.groupEnd()
				this.queue.finish(this.id, success)
			}
		}

		, done	: function(success) {
			this.queue.finish(this.id, success)
		}
		
		, isDone: function() {
			return this.stat === "done"
		}
	}
 	
	/*
	 *	Core Loader Version 1.1
	 */
	var Loader = function () {
	
		//console.log("Start core loader initializing......")
		
		this.scripts = {
			"cafe-core"	: "scripts/cafe-core.js"
		}
		
		this.browser = {
			ie: /(msie) ([\w.]+)/.test(window.navigator.userAgent.toLowerCase())
			, moz: /(mozilla)(?:.*? rv:([\w.]+))?/.test(window.navigator.userAgent.toLowerCase())
			, opera: /(opera)(?:.*version)?[ \/]([\w.]+)/.test(window.navigator.userAgent.toLowerCase())
			, webkit: /(webkit)[ \/]([\w.]+)/.test(window.navigator.userAgent.toLowerCase())
		}
		
	}
	
	Loader.prototype = {
		
		hasFile	: function (tag, url) {
		
			var contains = false
			var files = document.getElementsByTagName(tag)
			var type = tag == "script" ? "src" : "href"
			for (var i = 0, len = files.length; i < len; i++) {
				if (files[i].getAttribute(type) == url) {
					contains = true
					break
				}
			}
			
			return contains
		}

		, fileExt	: function(url) {
			var att = url.split('.')
			var ext = att[att.length - 1].toLowerCase()
			return ext
		}

		, loadFile:function(element, context, parent) {
			var p = parent && parent != undefined ? parent : "head"

			try {
				document.getElementsByTagName(p)[0].appendChild(element)
			} catch(e) {
				console.log(e)
			}

			if (context && context.done) {
				//MS IE
				if (this.browser.ie) {
					element.onreadystatechange = function () {
						if (this.readyState == 'loaded' || this.readyState == 'complete') {
							context.done(true)
						}
					}
				//Webkit Opera Moz
				} else if (this.browser.webkit || this.browser.opera || this.browser.moz) {
					element.onload = function () {
						context.done(true)
					}
					element.onerror = function() {
						context.done(false)
					}
				} else {
					context.done(true)
				}
			}
		}

		, loadCssFiles	: function(files, context) {
			var urls = files && typeof (files) == "string" ? [files] : files
			for (var i = 0, len = urls.length; i < len; i++) {
				var cssFile = document.createElement("link")
				cssFile.setAttribute('type', 'text/css')
				cssFile.setAttribute('rel', 'stylesheet')
				cssFile.setAttribute('href', urls[i])
				if (!this.hasFile("link", urls[i])) {
					this.loadFile(cssFile, context)
				}
			}
		}

		, loadScripts : function(files, context, parent) {
			var urls = files && typeof (files) == "string" ? [files] : files
			for (var i = 0, len = urls.length; i < len; i++) {
				var script = document.createElement("script")
				script.setAttribute('charset', 'utf-8')
				script.setAttribute('type', 'text/javascript')
				script.setAttribute('src', urls[i])
				if (!this.hasFile("script", urls[i])) {
					this.loadFile(script, context, parent)
				}
			}
		}
		
	}
	
	var context = new Context()
	context.init()

	extend(cafe, {

		//Jobs Scheduling
		  JobQueue		: JobQueue
		, Transaction	: Transaction
		, SerialJob		: SerialJob
		, AsyncJob		: AsyncJob

		//Resouces loader
		, Loader		: Loader

		, context		: context

	})
	
	if ( typeof window === "object" && typeof window.document === "object" ) {

		extend(window, {
			  UUID		: UUID
			, UIContext	: context
			, AsyncJob	: AsyncJob
			, SerialJob	: SerialJob
			, Transaction: Transaction
			, JobsQueue	: context.jobs
			, extend	: extend
		})

	}

}(window, undefined, cafe)


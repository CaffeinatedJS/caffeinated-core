!function(window, undefined, cafe, $) {

	var ViewManager = function(render) {
		this.render = render
		this.views = {}
		this.rendjobids = []
	}

	ViewManager.prototype = {

		load		: function(url, target, params, callback) {
			
			//TODO: Add code to triggering View-Load-Start event

			var url = this.parseURL(url)
			
			if (url instanceof Array) {
				//TODO: Add code to triggering View-Load-Multi event
				for (var i = 0; i < url.length; i++) {
					var temp = url[i].split("=")
						, params = params || {}
						, callback = callback || {}
					this.load(temp[1], temp[0], params[temp[0]], callback[temp[0]])
				}
				return
			}

			var that = this
				, jobs = cafe.context.jobs
				, target = target instanceof $
					? target.selector
					: (target || "body")
				, viewId = url + "@" + target
				, viewContext = this.views[viewId]
					|| { __queue__: [] }

			this.views[viewId] = viewContext
			this.unload(viewId)

			jobs.add(new cafe.AsyncJob(function() {

				var theJob = this

				this.desc += ("\"" + url + "\", and put it on \"" + target + "\".")

				$.ajax({
					  url		: url
					, dataType	: "xml"
					, success	: function(data) {
						that.render.rend(data, $(target), viewContext, params)
						if (callback) callback(data, target)
						theJob.done(true)
					}
					, error		: function(data) {
						theJob.done(false)
					}
					, complete	: function() {
						//TODO: Add code to triggering View-Load-Complete event
					}
				})

			}, "Load and rend view "))

			jobs.start()

		}
		
		, unload	: function (viewId, callback) {
			var target = $(viewId.split('@')[1])

			target.html("")
		}
		
		, parseURL	: function(url) {

			if (!url.indexOf("#?"))
				return url.replace(/^\#(\?)?/, "").split("\&")
			
			return url

		}

	}

	cafe.extend(cafe, {
		ViewManager	: ViewManager
	})
	
} (window, undefined, window.cafe, window.jQuery)
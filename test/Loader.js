$(function() {

	module('Caffeinated "Loader" function test	')
		
		test("should provide no conflict", function(){
			var _Caffeinated = window.Caffeinated.noConflict(true)
			ok(!window.Caffeinated && !window.cafe, "Caffeinated was set back to undefined (org value)")
			window.Caffeinated = window.cafe = _Caffeinated
		})

		test("should provide unrepeatable id", function() {
			var ids = []
				, max = 20
				, result = true
				, rounds = 10000

			//console.time("uuidx10000")
			while(--rounds > 0) {

				for(var i = 0; i < max; ++i) {
					ids[i] = new UUID().toString()
				}
				
				for(var i = 0; i < ids.length; ++i) {
					for (var j = i + 1; j < ids.length; ++j) {
						if(ids[i] === ids[j]) result = false	
					}
				}
			}
			//console.timeEnd("uuidx10000")

			ok(result, 'get 20 unrepeatable uuids')
		})

		test("cafe.extend should return new combo Object", function(){
			var obj_1 = {a:1, b:2, c:3}
				, obj_2 = {b:4, d:3}

			var combo = cafe.extend(obj_1, obj_2)

			ok(combo, "return new Object")
			deepEqual(combo, obj_1, "rewrite be comboed Object")
			deepEqual({a:1, b:4, c:3, d:3}, combo, "get the right resutl")
		})

		test("should get a defined console with any browser", function(){
			var console = window.console
			ok(console
				&& console.log
				&& console.info
				&& console.warn
				&& console.error, "the 'window.console' has been defined")
		})

		//test for init config
		test("should set new config", function() {
			var op = cafe.options
				, newop = {a: 1, b:4, c:7}

			cafe.config(newop)

			deepEqual(cafe.options, newop, "options have been set back")
			cafe.options = op
		})

		test("should execute SerialJob immediately", function() {
			
			var test = { say	: 'Hello World' }

			var desc = "test SerialJob function, change some value"
				, job = new SerialJob(function(context){
					
					equal(context, window.UIContext, 'the job bind context successed')
					equal(this.stat, 'actived', 'the job stat is "actived"')
					
					test.say += '!'

				}, desc)

			equal(job.stat, 'sleep', 'the job stat is "sleep"')
			equal(job.desc, "test SerialJob function, change some value"
				, "the job description is exactly")

			JobsQueue.add(job)

			JobsQueue.add(new SerialJob(function(context){
				equal(job.stat, "done", 'the job stat is "done"')
				deepEqual(test, { say	: 'Hello World!' }, 'the job execute immediately!')
			}, "test SerialJob function, check the value has been changed"))

			JobsQueue.start()

		})

		asyncTest("should execute AsyncJob asynchronous", function() {
			
			var test = { say	: 'Hello World' }
				, desc = "test AsyncJob function"
				, job = new AsyncJob(function(context) {
				
					equal(context, window.UIContext, 'AsyncJob bind Context successed!')
					equal(this.stat, 'actived', 'the job stat is "actived"')
					
					var job = this
					
					setTimeout(function() {
						test.say += "!"
						job.done(true)
					}, 1000)

				}, desc)

			equal(job.stat, 'sleep', 'the job stat is "sleep"')
			equal(job.desc, "test AsyncJob function"
				, "the job description is exactly")

			JobsQueue.add(job)

			JobsQueue.add(new SerialJob(function(context){

				equal(job.stat, "done", 'the job stat is "done"')
				deepEqual(test, { say	: 'Hello World!' }, 'AsyncJob executed asynchronously!')
				
				start()

			}, "test AsyncJob function"))

			JobsQueue.start()

		})

		asyncTest("should close Transaction after all Jobs have been done!", function() {

			var test = {}
				, j1 = 'SerialJob'
				, j2 = 'AsyncJob'
				, j3 = 'AsyncJob in transaction'
				, desc = "test Transaction function"
				, transac = new Transaction([
						  new SerialJob(function(context) {
						  	
						  	equal(transac.stat, "actived", "transaction stat is actived")

						  	test.j1 = j1
						  	
						  	equal(context
						  		, window.UIContext
						  		, "SerialJob in transaction bind context successed.")

						  }, "serial job in transaction")

						, new AsyncJob(function(context) {
							
							test.j2 = j2

							equal(context
						  		, window.UIContext
						  		, "AsyncJob in transaction bind context successed.")

							this.done(true)
						}, "async job in transaction")
						//*
						, new Transaction([

								new AsyncJob(function(context) {
									
									test.j3 = j3

									equal(context
								  		, window.UIContext
								  		, "AsyncJob in transaction which in another transaction bind context successed.")

									equal(transac.stat, "actived", "transaction stat still is actived")

									this.done(true)

								}, "async job in transaction which in another transaction")

							], "transaction in transaction")
						//*/
					], desc)
			
			JobsQueue.onClosed = function() {

				equal(transac.stat, "done", "transaction stat is done")

				deepEqual(test, {
					  j1	: j1
					, j2	: j2
					, j3	: j3
				}, "every job in transaction is works")
				
				start()
			}

			equal(transac.stat, 'sleep', 'the transacation stat is "sleep"')

			JobsQueue.add(transac)
			JobsQueue.start()

		})
		
})
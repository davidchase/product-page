(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
// PDP
// require('./product');
require('./product/productStream');
},{"./product/productStream":2}],2:[function(require,module,exports){
'use strict';
var stream = require('most');

var isImage = function(e) {
    return e.target.nodeName === 'IMG';
};
var thumbnails = document.querySelector('.thumbnails');
var primaryImage = document.querySelector('.primary-image');
var thumbnailsStream = stream.fromEventWhere(isImage, 'click', thumbnails);
var swatches = document.querySelector('.swatches');
var swatchesStream = stream.fromEventWhere(isImage, 'click', swatches);
var imagesStream = stream.from(document.getElementsByClassName('image'));
thumbnailsStream
    .map(function(e) {
        var image = e.target;
        image
            .parentNode
            .parentNode
            .querySelector('.selected')
            .classList
            .remove('selected');
        image
            .classList
            .add('selected');

        return image.getAttribute('data-view-code');
    })
    .observe(function(dataCode) {
        primaryImage.src = primaryImage.src.replace(/\w$/, '') + dataCode;
        return primaryImage;
    });

swatchesStream
    .map(function(e) {
        var swatch = e.target;
        swatch
            .parentNode
            .querySelector('.selected')
            .classList
            .remove('selected');
        swatch
            .classList
            .add('selected');
        return swatch;
    })
    .map(function(swatch) {
        var arr = [];
        var dataColorCode = swatch.getAttribute('data-color-code');
        var dataColorName = swatch.getAttribute('data-color-name');
        arr.push(dataColorCode, dataColorName, swatch);
        return arr;
    })
    .observe(function(array) {
        array[2]
            .parentNode
            .previousElementSibling
            .querySelector('.current-color')
            .textContent = array[1].toLowerCase();
        imagesStream.observe(function(img) {
            img.src = img.src.replace(/_\d*_/, '_' + array[0] + '_');
        });
        primaryImage.src = primaryImage.src.replace(/_\d*_/, '_' + array[0] + '_');
    });
},{"most":34}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var promise = require('./promises');
var step = require('./step');
var makeIterable = require('./iterable').makeIterable;

var reject = promise.Promise.reject;
var defer = promise.defer;

var Yield = step.Yield;
var End   = step.End;

module.exports = Queue;

Queue.keepAll = keepAll;
Queue.keepNewest = keepNewest;
Queue.keepOldest = keepOldest;

/**
 * An asynchronous queue that manages speed differences between producers
 * and consumers.  When the consumer is faster than the producer, the queue
 * returns a promise for the next iteration, which the consumer must wait for
 * before pulling subsequent iterations.  When the producer is faster, items
 * are buffered according to the supplied bufferPolicy.
 * @param {function(s:Step, items:Array):Array=keepAll} bufferPolicy queue buffering
 *  policy that will be used to manage consumer queue sizes. Defaults to keepAll,
 *  which allows queues to grow forever.
 * @constructor
 */
function Queue(bufferPolicy) {
	this._bufferPolicy = typeof bufferPolicy !== 'function' ? keepAll : bufferPolicy;

	this._items = [];
	this._awaiting = [];
	this._ended = defer();
	this.ended = this._ended.promise;
	this.isEnded = false;
}

Queue.disposeQueue = disposeQueue;

function disposeQueue(t, x, queue) {
	return queue.end(t, x);
}

makeIterable(function() {
	return new QueueIterator(this);
}, Queue.prototype);

Queue.prototype.add = function(t, x) {
	if (this.isEnded) {
		throw new Error('Queue ended');
	}

	var iteration = new Yield(t, x, this);
	if (this._awaiting.length === 0) {
		this._items = this._bufferPolicy(iteration, this._items);
	} else {
		this._awaiting.shift().resolve(iteration);
	}
};

Queue.prototype.error = function(e) {
	if(this.isEnded) {
		return;
	}

	this.isEnded = true;

	this._ended.reject(e);
	if(this._awaiting.length > 0) {
		this._awaiting.reduce(resolveAll, this._ended.promise);
	} else {
		this._items.push(this._ended.promise);
	}
};

Queue.prototype.end = function(t, x) {
	if(this.isEnded) {
		return;
	}

	this.isEnded = true;
	var end = new End(t, x, this);
	if(this._awaiting.length > 0) {
		this._awaiting.reduce(resolveAll, end);
	} else {
		this._items.push(end);
	}

	this._ended.resolve(this);
};

Queue.prototype.get = function() {
	if (this._items.length > 0) {
		return this._items.shift();
	}

	if (this.isEnded) {
		return reject(new Error('Queue ended'));
	}

	var consumer = defer();
	this._awaiting.push(consumer);
	return consumer.promise;
};

function QueueIterator(q) {
	this.queue = q;
}

QueueIterator.prototype.next = function() {
	return this.queue.get();
};

function resolveAll(end, consumer) {
	consumer.resolve(end);
	return end;
}

function keepAll(x, items) {
	items.push(x);
	return items;
}

function keepNewest(n) {
	return function(x, items) {
		return items.length < n ? keepAll(x, items) : keepAll(x, items.slice(1, n));
	};
}

function keepOldest(n) {
	return function(x, items) {
		return items.length < n ? keepAll(x, items) : items;
	};
}

},{"./iterable":26,"./promises":27,"./step":33}],5:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var findIndex = require('./binarySearch').findIndex;

module.exports = Scheduler;

// Default timer functions
var defaultNow = Date.now;
function defaultSetTimer(f, ms) {
	return setTimeout(f, ms);
}

function defaultClearTimer(t) {
	return clearTimeout(t);
}

function Scheduler(setTimer, clearTimer, now, errorHandler) {
	this.now = now || defaultNow;
	this._setTimer = setTimer || defaultSetTimer;
	this._clearTimer = clearTimer || defaultClearTimer;
	this._handleError = errorHandler || logAndReschedule;
	this._timer = null;
	this._nextArrival = 0;
	this._tasks = [];

	var self = this;
	this._runReadyTasksBound = function() {
		self._runReadyTasks();
	};
}

Scheduler.prototype = {
	delayed: function(delay, run, state) {
		return this._schedule(delay, -1, run, state);
	},

	cancel: function(task) {
		var i = this._tasks.indexOf(task);
		if(i >= 0) {
			this._tasks.splice(i, 1);
			if(i === 0) {
				this._scheduleNextRun(this.now());
			}
		}
	},

	_schedule: function(delay, period, run, state) {
		var now = this.now();
		delay = Math.max(0, delay);

		var task = {
			period: period,
			deadline: now + delay + Math.max(0, period),
			arrival: now + delay,
			run: run,
			state: state
		};

		this._tasks = insertByDeadline(this._tasks, task);
		this._scheduleNextRun(now);
		return task;
	},

	_schedulerNextArrival: function (nextArrival, now) {
		this._nextArrival = nextArrival;
		var delay = Math.max(0, nextArrival - now);
		this._timer = this._setTimer(this._runReadyTasksBound, delay);
	},

	_scheduleNextRun: function(now) {
		if(this._tasks.length === 0) {
			return;
		}

		var nextArrival = this._tasks[0].arrival;

		if(this._timer === null) {
			this._schedulerNextArrival(nextArrival, now);
		} else if(nextArrival < this._nextArrival) {
			this._clearTimer(this._timer);
			this._schedulerNextArrival(nextArrival, now);
		}
	},

	_scheduleNextTask: function(now, task) {
		if(task.period >= 0) {
			task.deadline = task.deadline + task.period;
			task.arrival = task.arrival + task.period;

			this._tasks = insertByDeadline(this._tasks, task);
		}
	},

	_runReadyTasks: function() {
		this._timer = null;

		var now = this.now();
		var tasks = this._tasks;
		var reschedule = [];

		while(tasks.length > 0 && tasks[0].arrival <= now) {
			reschedule.push(this._runTask(now, tasks.shift()));
		}

		for(var i=0; i<reschedule.length; ++i) {
			this._scheduleNextTask(now, reschedule[i]);
		}

		this._scheduleNextRun(now);
	},

	_runTask: function(now, task) {
		try {
			var result = task.run(task.state, now);
			if(result !== void 0) {
				task.state = result;
			}
			return task;
		} catch(e) {
			return this._handleError.call(void 0, e, task);
		}
	}
};

function insertByDeadline(tasks, task) {
	if(tasks.length === 0) {
		tasks.push(task);
	} else {
		tasks.splice(findIndex(compareByDeadline, task, tasks), 0, task);
	}

	return tasks;
}

function compareByDeadline(a, b) {
	return a.deadline - b.deadline;
}

function logAndReschedule (e, task) {
	setTimeout(function() {
		throw e;
	}, 0);
	return task;
}

},{"./binarySearch":9}],6:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Scheduler = require('./Scheduler');
var promise = require('./promises');
var step = require('./step');
var iterable = require('./iterable');
var base = require('./base');

module.exports = Stream;

//var Promise = promise.Promise;
var when = promise.when;
var resolve = promise.Promise.resolve;
var neverPromise = promise.never;
var identity = base.identity;

var Yield = Stream.Yield = step.Yield;
var End   = Stream.End   = step.End;

var getState = step.getState;
var getValueOrFail = step.getValueOrFail;

var iterableFrom = iterable.from;
var iterableHead = iterable.head;

var never = new Stream(identity, neverPromise());

Stream.getDefaultScheduler = getDefaultScheduler;
Stream.setDefaultScheduler = setDefaultScheduler;

var defaultScheduler;

function getDefaultScheduler() {
	if(defaultScheduler === void 0) {
		defaultScheduler = new Scheduler();
	}
	return defaultScheduler;
}

function setDefaultScheduler(scheduler) {
	if(scheduler != null) {
		defaultScheduler = scheduler;
	}
}

/**
 * Stream that generates items by repeatedly calling the provided
 * step function.  It will generate the first item by calling step with
 * the provided initial state.  The step function must return a Step,
 * which may Yield a value and a new state to be provided to the next
 * call to step.
 * @param {function(state:*):Step} step stream step function
 * @param {*} state initial state
 * @param {Scheduler=} scheduler
 * @constructor
 */
function Stream(step, state, scheduler, dispose) {
	this.step = step;
	this.state = state;
	this.scheduler = scheduler === void 0 ? getDefaultScheduler() : scheduler;
	this.dispose = typeof dispose === 'function' ? dispose : returnEndValue;
}

/**
 * @returns {Stream} stream that has no items and also never ends. Note that
 * this returns a singleton which can safely be compared with === to the result
 * of other calls to Stream.never().
 */
Stream.never = function() {
	return never;
};

/**
 * @param {*} x
 * @returns {Stream} stream that contains x as its only item
 */
Stream.of = function(x) {
	return new Stream(identity, once(x));
};

/**
 * Create a stream from an array-like or iterable
 * @param {Array|{iterator:function}|{next:function}|{length:Number}} iterable Array,
 *  array-like, iterable, or iterator
 * @returns {Stream} stream containing all items from the iterable
 */
Stream.from = function(iterable) {
	return new Stream(iterableHead, scheduledIterable(iterable));
};

/**
 * @param {Promise} p
 * @returns {Stream} stream containing p's fulfillment value as its only item
 */
Stream.fromPromise = function(p) {
	return new Stream(identity, resolve(p).then(once));
};

/**
 * @param {function(state:*):Step} step
 * @param {*} state
 * @returns {Stream} new stream with the supplied stepper and state, which shares
 * this stream's scheduler and dispose function
 */
Stream.prototype.beget = function(step, state) {
	return new Stream(step, state, this.scheduler, this.dispose);
};

/**
 * @param {function(state:*):Step} step
 * @param {*} state
 * @param {function(s:Stream, endValue:*, end:End):*} dispose
 * @returns {Stream} new stream with the supplied stepper, state, and dispose
 * function, which shares this stream's scheduler
 */
Stream.prototype.begetWithDispose = function(step, state, dispose) {
	return new Stream(step, state, this.scheduler, dispose);
};

/**
 * @returns {Promise} a promise for the first item in the stream
 */
Stream.prototype.head = function() {
	return resolve(streamNext(this)).then(getValueOrFail);
};

/**
 * @returns {Stream} a stream containing all items in this stream except the first
 */
Stream.prototype.tail = function() {
	return this.beget(this.step, when(getState, streamNext(this)));
};

// Helpers

function streamNext(s) {
	return when(s.step, s.state);
}

function once(x) {
	var t = getDefaultScheduler().now();
	return new Yield(t, x, new End(t));
}

function scheduledIterable(iterable) {
	return iterableFrom(getDefaultScheduler(), iterable);
}

function returnEndValue(t, x) {
	return x;
}

},{"./Scheduler":5,"./base":8,"./iterable":26,"./promises":27,"./step":33}],7:[function(require,module,exports){
var resolve = require('./promises').Promise.resolve;
var tail = require('./base').tail;
var dispatch = require('./dispatch');

/**
 * Invoke the provided function, with the provided arguments,
 * as soon as possible after the current call stack clears
 * @param {function} f
 * @returns {Promise} promise for the result of invoking f
 */
module.exports = function asap(f /*,...args*/) {
	return resolve(tail(arguments)).then(function(args) {
		return dispatch(f, args);
	});
};

},{"./base":8,"./dispatch":25,"./promises":27}],8:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

exports.identity = identity;
exports.cons = cons;
exports.append = append;
exports.tail = tail;
exports.copy = copy;
exports.map = map;
exports.reduce = reduce;
exports.replace = replace;
exports.findIndex = findIndex;

function identity(x) {
	return x;
}

function cons(x, array) {
	var l = array.length;
	var a = new Array(l + 1);
	a[0] = x;
	for(var i=0; i<l; ++i) {
		a[i + 1] = array[i];
	}
	return a;
}

function append(x, a) {
	var l = a.length;
	var b = new Array(l+1);
	for(var i=0; i<l; ++i) {
		b[i] = a[i];
	}

	b[l] = x;
	return b;
}

function tail(array) {
	var l = array.length - 1;
	var a = new Array(l);
	for(var i=0; i<l; ++i) {
		a[i] = array[i + 1];
	}
	return a;
}

function copy(array) {
	var l = array.length;
	var a = new Array(l);
	for(var i=0; i<l; ++i) {
		a[i] = array[i];
	}
	return a;
}

function map(f, array) {
	var l = array.length;
	var a = new Array(l);
	for(var i=0; i<l; ++i) {
		a[i] = f(array[i]);
	}
	return a;
}

function reduce(f, z, array) {
	var r = z;
	for(var i=0, l=array.length; i<l; ++i) {
		r = f(r, array[i], i);
	}
	return r;
}

function replace(x, i, array) {
	var l = array.length;
	var a = new Array(l);
	for(var j=0; j<l; ++j) {
		a[j] = i === j ? x : array[j];
	}
	return a;
}

function findIndex(p, a) {
	for(var i= 0, l= a.length; i<l; ++i) {
		if(p(a[i])) {
			return i;
		}
	}
	return -1;
}

},{}],9:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

exports.findIndex = findIndex;

/**
 * Find the index of x in the sortedArray using a binary search
 * @param {function(a, b):Number} compare comparator to return:
 *  0 when a === b
 *  negative when a < b
 *  positive when a > b
 * @param {*} x item to find
 * @param {Array} sortedArray already-sorted array in which to find x
 * @returns {Number} index of x if found OR index at which x should be
 *  inserted to preserve sort order
 */
function findIndex(compare, x, sortedArray) {
	var lo = 0;
	var hi = sortedArray.length;
	var mid, cmp;

	while (lo < hi) {
		mid = Math.floor((lo + hi) / 2);
		cmp = compare(x, sortedArray[mid]);

		if (cmp === 0) {
			return mid;
		} else if (cmp < 0) {
			hi = mid;
		} else {
			lo = mid + 1;
		}
	}
	return hi;
}
},{}],10:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var identity = require('../base').identity;

var Yield = Stream.Yield;

exports.unfold = unfold;
exports.iterate = iterate;
exports.repeat = repeat;

/**
 * Build a stream by unfolding steps from a seed value
 * @param {function(x:*):Step} f
 * @param {*} x seed value
 * @returns {Stream} stream containing all items
 */
function unfold(f, x) {
	return new Stream(f, x);
}

/**
 * Build a stream by iteratively calling f
 * @param {function(x:*):*} f
 * @param {*} x initial value
 * @returns {Stream}
 */
function iterate(f, x) {
	var scheduler = Stream.getDefaultScheduler();
	return new Stream(function(x) {
		return new Yield(scheduler.now(), x, f(x));
	}, x);
}

/**
 * Create an infinite stream of xs
 * @param {*} x
 * @returns {Stream} infinite stream where all items are x
 */
function repeat(x) {
	return iterate(identity, x);
}

},{"../Stream":6,"../base":8}],11:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var promise = require('../promises');
var step = require('../step');
var base = require('../base');
var empty = require('./monoid').empty;
var dispatch = require('../dispatch');

var replace = base.replace;
var tail = base.tail;
var map = base.map;

var when = promise.when;
var all = promise.Promise.all;

var getValue = step.getValue;
var Yield = step.Yield;
var unamb = step.unamb;

exports.combine = combine;
exports.combineArray = combineArray;

/**
 * Combine latest events from all input streams
 * @param {function(...events):*} f function to combine most recent events
 * @returns {Stream} stream containing the result of applying f to the most recent
 *  event of each input stream, whenever a new event arrives on any stream.
 */
function combine(f /*,...streams*/) {
	return combineArray(f, tail(arguments));
}

/**
 * Combine streams
 * @param {function(...events):*} f function to combine most recent events
 * @param {[*]} array most recent events
 * @returns {Stream} stream containing the result of applying f to the most recent
 *  event of each input stream, whenever a new event arrives on any stream.
 */
function combineArray(f, array) {
	if(array.length === 0) {
		return empty();
	}

	if(array.length === 1) {
		return array[0].map(f);
	}

	return new Stream(function(s) {
		return stepCombine(f, s);
	}, map(initTuple, array), void 0, disposeRemaining);
}

function stepCombine(f, s) {
	var first = s[0];
	return first.i === first.stream ? initAll(f, s) : stepEarliest(f, s);
}

function initAll (f, s) {
	var steps = map(stepTuple, s);
	return all(map(getI, steps)).then(function (is) {
		return handleInitStep(f, s, steps, is);
	});
}

function handleInitStep(f, s, steps, is) {
	var time = 0;
	var iteration;
	for (var i = 0; i < is.length; ++i) {
		iteration = is[i];

		if (iteration.done) {
			return iteration.withState(s);
		}

		if (iteration.time > time) {
			time = iteration.time;
		}
	}

	return yieldNext(time, f, is, map(stepTuple, steps));
}

function stepEarliest(f, s) {
	return unamb(function(i, index) {
		return handleCombineStep(f, s, i, index);
	}, map(getI, s));
}

function handleCombineStep(f, s, i, index) {
	if(i.done) {
		return i.withState(s);
	}

	var nexts = replace(makeTuple(s[index], i), index, s);
	return all(map(getValue, nexts)).then(function(iterations) {
		return yieldNext(i.time, f, iterations, stepAtIndex(nexts, index));
	});
}

function yieldNext(t, f, iterations, tuples) {
	return new Yield(t, dispatch(f, map(getValue, iterations)), tuples);
}

function stepAtIndex(tuples, index) {
	return replace(stepTuple(tuples[index]), index, tuples);
}

function initTuple(stream) {
	return { stream: stream, i: stream, value: void 0 };
}

function makeTuple(tuple, i) {
	return { stream: tuple.stream, i: i, value: tuple.i };
}

function stepTuple(tuple) {
	var stream = tuple.stream;
	var i = when(function(i) {
		return stream.step(i.state);
	}, tuple.i);

	return makeTuple(tuple, i);
}

function getI(tuple) {
	return tuple.i;
}

function disposeRemaining(t, x, remaining) {
	return all(map(function(s) {
		return disposeOne(t, x, s.stream, s.i);
	}, remaining));
}

function disposeOne(t, x, stream, i) {
	return when(function(i) {
		return stream.dispose(t, x, i.state);
	}, i);
}

},{"../Stream":6,"../base":8,"../dispatch":25,"../promises":27,"../step":33,"./monoid":18}],12:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var promise = require('../promises');

var when = promise.when;
var resolve = promise.Promise.resolve;
var reject = promise.Promise.reject;

exports.flatMapError = flatMapError;
exports.throwError = throwError;

/**
 * Create a stream containing only an error
 * @param {*} e error value, preferably an Error or Error subtype
 * @returns {Stream} new stream containing only an error
 */
function throwError(e) {
	return new Stream(reject, e);
}

/**
 * If stream encounters an error, recover and continue with items from stream
 * returned by f.
 * stream:                  -a-b-c-X-
 * f(X):                           d-e-f-g-
 * flatMapError(f, stream): -a-b-c-d-e-f-g-
 * @param {function(error:*):Stream} f function which returns a new stream
 * @param {Stream} stream
 * @returns {Stream} new stream which will recover from an error by calling f
 */
function flatMapError(f, stream) {
	return stream.begetWithDispose(stepFlatMapError,
		{ stream: stream, state: stream.state, recover: f }, dispose);
}

function stepFlatMapError (s) {
	return resolve(s.state).then(function (state) {
		return stepWithRecovery(s.recover, s.stream, state);
	}).catch(function (e) {
		// TODO: Should we call s.stream.dispose here?
		var stream = s.recover(e);
		return stepWithRecovery(thrower, stream, stream.state);
	});
}

function stepWithRecovery(f, stream, state) {
	return when(function (i) {
		return i.withState({ stream: stream, state: i.state, recover: f });
	}, when(stream.step, state));
}

function dispose(t, x, s) {
	return s.stream.dispose(t, x, s.state);
}

function thrower(e) {
	throw e;
}

},{"../Stream":6,"../promises":27}],13:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Stream = require('../Stream');
var concat = require('./monoid').concat;
var promise = require('../promises');

var when = promise.when;

exports.cycle = cycle;
exports.cons = consStream;

/**
* Tie a stream into a circle, thus creating an infinite stream
* @param {Stream} stream stream to make infinite
* @returns {Stream} new infinite stream
*/
function cycle(stream) {
	return stream.beget(stepCycle, { state: stream.state, stream: stream });
}

function stepCycle(s) {
	return when(function(i) {
		if(i.done) {
			return stepCycle({ state: s.stream.state, stream: s.stream });
		}

		return i.withState({ state: i.state, stream: s.stream });
	}, s.stream.step(s.state));
}

/**
* @param {*} x
* @param {Stream} stream
* @returns {Stream} new stream containing x followed by all items in this stream
*/
function consStream(x, stream) {
	return concat(Stream.of(x), stream);
}

},{"../Stream":6,"../promises":27,"./monoid":18}],14:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var promise = require('../promises');
var step = require('../step');

var when = promise.when;

var Yield = step.Yield;
var End = step.End;
var unamb = step.unamb;
var Pair = step.Pair;
var yieldPair = step.yieldPair;

var init = {};

exports.filter = filter;
exports.takeUntil = takeUntil;
exports.take = take;
exports.takeWhile = takeWhile;
exports.distinct = distinct;
exports.distinctBy = distinctBy;

/**
 * Retain only items matching a predicate
 * stream:                           -12345678-
 * filter(x => x % 2 === 0, stream): --2-4-6-8-
 * @param {function(x:*):boolean} p filtering predicate called for each item
 * @param {Stream} stream stream to filter
 * @returns {Stream} stream containing only items for which predicate returns truthy
 */
function filter(p, stream) {
	var stepper = stream.step;
	return stream.beget(function(state) {
		return filterNext(p, stepper, state);
	}, stream.state);
}

function filterNext(p, stepper, state) {
	return when(function(i) {
		return i.done || p(i.value) ? i
			: filterNext(p, stepper, i.state);
	}, when(stepper, state));
}

/**
 * stream:          -abcd-
 * take(2, stream): -ab
 * @param {function(x:*):boolean} p
 * @param {Stream} stream stream from which to take
 * @returns {Stream} stream containing items up to, but not including, the
 * first item for which p returns falsy.
 */
function takeWhile(p, stream) {
	var stepper = stream.step;
	return stream.beget(function(s) {
		return when(function (i) {
			return i.done || p(i.value) ? i
				: new End(i.time, i.value, i.state);
		}, when(stepper, s));
	}, stream.state);
}

/**
 * stream:                        -123451234-
 * takeWhile(x => x < 5, stream): -1234
 * @param {Number} n
 * @param {Stream} stream stream from which to take
 * @returns {Stream} stream containing at most the first n items from this stream
 */
function take(n, stream) {
	var stepper = stream.step;
	return stream.beget(function(s) {
		if(s.value === 0) {
			return new End(s.time, s.value, s.state);
		}

		return when(function (i) {
			return i.done ? i
				: i.withState(new Yield(i.time, s.value - 1, i.state));
		}, when(stepper, s.state));
	}, new Yield(stream.scheduler.now(), n|0, stream.state));
}

/**
 * stream:                    -a-b-c-d-e-f-g
 * signal:                    -------x
 * takeUntil(signal, stream): -a-b-c-
 * @param {Stream} signal retain only events in stream before the first
 * event in signal
 * @param {Stream} stream events to retain
 * @returns {Stream} new stream containing only events that occur before
 * the first event in signal.
 */
function takeUntil(signal, stream) {
	return stream.begetWithDispose(stepTakeUntil,
		new TakeUntil(null, signal, stream, stream.state), disposeTakeUntil);
}

function stepTakeUntil(s) {
	if(s.until === null) {
		s = new TakeUntil(awaitSignal(s), s.signal, s.stream, s.state);
	}

	return unamb(function (i, index) {
		return handleTakeUntil(s, i, index);
	}, [s.until, when(s.stream.step, s.state)]);
}

function handleTakeUntil (s, i, index) {
	return index === 0 ? endTakeUntil(s, i)
		: i.withState(new TakeUntil(s.until, s.signal, s.stream, i.state));
}

function disposeTakeUntil(t, x, s) {
	return s.stream.dispose(t, x, s.state);
}

function awaitSignal(s) {
	return when(s.signal.step, s.signal.state);
}

function endTakeUntil(s, i) {
	return new End(i.time, i.value, new TakeUntil(null, null, s.stream, s.state));
}

function TakeUntil(until, signal, stream, state) {
	this.until = until; this.signal = signal; this.stream = stream; this.state = state;
}

/**
 * Remove adjacent duplicates, using === to detect duplicates
 * stream:           -abbcd-
 * distinct(stream): -ab-cd-
 * @param {Stream} stream stream from which to omit adjacent duplicates
 * @returns {Stream} stream with no adjacent duplicates
 */
function distinct(stream) {
	return distinctBy(same, stream);
}

/**
 * Remove adjacent duplicates using the provided equals function to detect duplicates
 * stream:           -abbcd-
 * distinct(stream): -ab-cd-
 * @param {?function(a:*, b:*):boolean} equals optional function to compare items.
 * @param {Stream} stream stream from which to omit adjacent duplicates
 * @returns {Stream} stream with no adjacent duplicates
 */
function distinctBy(equals, stream) {
	var stepper = stream.step;
	return stream.beget(function(s) {
		return stepDistinct(equals, stepper, s);
	}, new Pair(init, stream.state));
}

function stepDistinct(equals, stepper, s) {
	return when(function(i) {
		if(i.done) {
			return i;
		}

		// Always allow the first item, and all non-duplicates
		if(s.value === init || !equals(s.value, i.value)) {
			return yieldPair(i, i.value);
		}

		return stepDistinct(equals, stepper, new Pair(s.value, i.state));
	}, when(stepper, s.state));
}

function same(a, b) {
	return a === b;
}
},{"../promises":27,"../step":33}],15:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var promise = require('../promises');
var unamb = require('../step').unamb;
var base = require('../base');

var tail = base.tail;
var replace = base.replace;
var append = base.append;
var map = base.map;

var neverP = promise.never();
var when = promise.when;
var all = promise.Promise.all;

exports.join = join;

/**
 * Monadic join. Flatten a Stream<Stream<X>> to Stream<X> by merging inner
 * streams to the outer.  Event arrival times are preserved.
 * @param {Stream<Stream>} stream stream of streams
 * @returns {Stream}
 */
function join(stream) {
	return stream.begetWithDispose(stepJoin, [{ stream: stream, i: null }], disposeInners);
}

function stepJoin(s) {
	var s0 = s[0];
	return stepEarliest(s0.i === null ? [stepPair(s0.stream)] : s);
}

function stepEarliest(s) {
	return unamb(function(i, index) {
		return handleStep(i, index, s);
	}, map(getIteration, s));
}

function handleStep(i, index, s) {
	return index === 0 ? stepOuter(i, s) : stepInner(i, index, s);
}

function stepOuter(i, s) {
	if(i.done) {
		return s.length === 1 ? i.withState(s) : stepJoin(replace(endOuter(i, s[0].stream), 0, s));
	}

	return stepJoin(append(stepPair(i.value), stepAtIndex(i, 0, s)));
}

function stepInner(i, index, s) {
	if(i.done) {
		var sp = without(i, index, s);
		if(sp.length === 1 && sp[0].i === neverP) {
			return when(function(s) {
				return i.withState(s);
			}, sp);
		}

		return when(stepJoin, sp);
	}

	return i.withState(stepAtIndex(i, index, s));
}

function stepAtIndex(i, index, s) {
	var stream = s[index].stream;
	return replace(stepPair(stream.beget(stream.step, i.state)), index, s);
}

function stepPair(stream) {
	return { stream: stream, i: when(stream.step, stream.state) };
}

function endOuter(i, stream) {
	return { stream: stream, i: disposeOuter(i, stream) };
}

function getIteration(s) {
	return s.i;
}

function without(step, index, arr) {
	var stream = arr[index].stream;
	return when(function() {
		return arr.filter(function(x, ai) {
			return index !== ai;
		});
	}, stream.dispose(step.time, step.value, step.state));
}

function disposeOuter (i, stream) {
	return when(function () {
		return neverP;
	}, stream.dispose(i.time, i.value, i.state));
}

function disposeInners(t, x, s) {
	return all(map(function(si) {
		return disposeInner(t, x, si);
	}, tail(s))); // s[0] is the outer stream, ignore it
}

function disposeInner (t, x, si) {
	return when(function (i) {
		return si.stream.dispose(t, x, i.state);
	}, si.i);
}

},{"../base":8,"../promises":27,"../step":33}],16:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var combine = require('./combine').combine;
var dispatch = require('../dispatch');
var base = require('../base');
var cons = base.cons;

var paramsRx = /\(([^)]*)/;
var liftedSuffix = '_most$Stream$lifted';

exports.lift = lift;

/**
 * Lift a function to operate on streams.  For example:
 * lift(function(x:number, y:number):number) -> function(xs:Stream, ys:Stream):Stream
 * @param {function} f function to be lifted
 * @returns {function} function with the same arity as f that accepts
 *  streams as arguments and returns a stream
 */
function lift (f) {
	/*jshint evil:true*/
	var m = paramsRx.exec(f.toString());
	var body = 'return function ' + f.name + liftedSuffix + ' (' + m[1] + ') {\n' +
			'  return dispatch(combine, cons(f, arguments));\n' +
			'};';

	return (new Function('cons', 'dispatch', 'combine', 'f', body)(cons, dispatch, combine, f));
}
},{"../base":8,"../dispatch":25,"./combine":11}],17:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var empty = require('./monoid').empty;
var join = require('./join').join;
var copy = require('../base').copy;

exports.merge = merge;
exports.mergeArray = mergeArray;

/**
 * @returns {Stream} stream containing events from all streams in the argument
 * list in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
function merge(/*...streams*/) {
	return mergeArray(copy(arguments));
}

/**
 * @param {Array} streams array of stream to merge
 * @returns {Stream} stream containing events from all input observables
 * in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
function mergeArray(streams) {
	if(streams.length === 0) {
		return empty();
	}

	if(streams.length === 1) {
		return streams[0];
	}

	return join(Stream.from(streams));
}

},{"../Stream":6,"../base":8,"./join":15,"./monoid":18}],18:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var step = require('../step');
var identity = require('../base').identity;
var when = require('../promises').when;

var End = step.End;

exports.empty = empty;
exports.concat = concat;

/**
 * @returns {Stream} stream that contains no items, and immediately ends
 */
function empty() {
	return new Stream(identity, new End(Stream.getDefaultScheduler().now()));
}

/**
 * @param {Stream} left
 * @param {Stream} right
 * @returns {Stream} new stream containing all items in left followed by
 *  all items in right
 */
function concat(left, right) {
	return new Stream(stepConcat, { stream: left, state: left.state, tail: right }, void 0, disposeCurrent);
}

function stepConcat(s) {
	return when(function(i) {
		return handleStep(s, i);
	}, s.stream.step(s.state));
}

function handleStep(s, i) {
	if(i.done) {
		return when(function() {
			return yieldTailOrEnd(s, i);
		}, s.stream.dispose(i.time, i.value, i.state));
	}

	return i.withState({ stream: s.stream, state: i.state, tail: s.tail });
}

function yieldTailOrEnd(s, i) {
	var tail = s.tail;
	return tail === null ? i.withState({ stream: s.stream, state: i.state, tail: null }) :
		   stepConcat({ stream: tail, state: tail.state, tail: null });
}

function disposeCurrent(t, x, s) {
	return s.stream.dispose(t, x, s.state);
}

},{"../Stream":6,"../base":8,"../promises":27,"../step":33}],19:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var asap = require('../asap');
var runStream = require('../runStream');

exports.observe = observe;

/**
 * Observe all items in stream
 * @param {function(*):undefined|Promise} f function which will be called
 *  for each item in the stream.  It may return a promise to exert a simple
 *  form of back pressure: f is guaranteed not to receive the next item in
 *  the stream before the promise fulfills.  Returning a non-promise has no
 *  effect on back pressure
 * @param {Stream} stream stream to observe
 * @returns {Promise} promise that fulfills after all items have been observed,
 *  and the stream has ended.
 */
function observe(f, stream) {
	return asap(runStream, function(z, x) {
		return f(x);
	}, void 0, stream, stream.state, dispose);
}

function dispose(stream, _, i) {
	return stream.dispose(i.time, i.value, i.state);
}

},{"../asap":7,"../runStream":28}],20:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var asap = require('../asap');
var runStream = require('../runStream');
var when = require('../promises').when;

exports.reduce = reduce;
exports.reduce1 = reduce1;

/**
 * Reduce a stream to produce a single result.  Note that reducing an infinite
 * stream will return a Promise that never fulfills, but that may reject if an error
 * occurs.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} z initial value
 * @param {Stream} stream to reduce
 * @returns {Promise} promise for the file result of the reduce
 */
function reduce(f, z, stream) {
	return asap(runStream, f, z, stream, stream.state, disposeReduce);
}

/**
 * Reduce a stream to produce a single result, using the first item in the stream
 * as the initial value.  If the stream is empty, returns a rejected promise.
 * Note that reducing an infinite stream will return a Promise that never
 * fulfills, but that may reject if an error occurs.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {Stream} stream to reduce
 * @returns {Promise} promise for the file result of the reduce
 */
function reduce1(f, stream) {
	return stream.head().then(function(z) {
		var tail = stream.tail();
		return runStream(f, z, tail, tail.state, disposeReduce);
	});
}

function disposeReduce(stream, z, i) {
	return when(function() {
		return z;
	}, stream.dispose(i.time, i.value, i.state));
}
},{"../asap":7,"../promises":27,"../runStream":28}],21:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var promise = require('../promises');
var unamb = require('../step').unamb;

var when = promise.when;

exports.switch = switchLatest;

/**
 * Given a stream of streams, return a new stream that adopts the behavior
 * of the most recent inner stream.
 * @param {Stream} stream of streams on which to switch
 * @returns {Stream} switching stream
 */
function switchLatest(stream) {
	return stream.begetWithDispose(stepSwitch, initState(stream), disposeInner);
}

function stepSwitch(s) {
	return switchNext(s.current === null ? updateBoth(s.outer, s.inner) : s);
}

function switchNext(s) {
	return unamb(function(i, index) {
		return doSwitchNext(i, index, s);
	}, s.current);
}

function doSwitchNext(i, index, s) {
	/*jshint maxcomplexity:7*/
	var never = Stream.never();
	// If we got an item from the outer stream, we need to step it to get
	// the new inner stream, then start racing again.
	if(index === 0) {
		// If outer is done, consume current inner until it's done too.
		if(i.done) {
			return s.inner === never ? i.withState(s)
				: switchNext(updateOuter(never, s));
		}

		// Outer not done, step outer to get next inner stream
		// Signal lost interest in current inner
		return when(function() {
			return awaitNextOuter(s.outer, i);
		}, s.inner.dispose(i.time, i.value, s.inner.state));
	}

	if(i.done) {
		// If inner and outer are done, signal done, otherwise await the
		// next inner stream
		return s.outer === never ? i.withState(s)
			: stepBoth(s.outer, s.current[0]);
	}

	// Inner not done, yield latest value
	return i.withState(updateInner(s.inner.beget(s.inner.step, i.state), s));
}

function initState(outer) {
	return { outer: outer, inner: Stream.never(), current: null };
}

function updateBoth(outer, inner) {
	return { outer: outer, inner: inner, current: [streamNext(outer), streamNext(inner)] };
}

function updateOuter(outer, s) {
	return { outer: outer, inner: s.inner, current: [streamNext(outer), s.current[1]] };
}

function updateInner(inner, s) {
	return { outer: s.outer, inner: inner, current: [s.current[0], streamNext(inner)] };
}

function end(outer, endStep) {
	return { outer: outer, inner: Stream.never(), current: [endStep, endStep] };
}

function awaitNextOuter(outer, i) {
	var next = i.done ? end(outer, i)
		: updateBoth(outer.beget(outer.step, i.state), i.value);

	return switchNext(next);
}

function stepBoth(outer, i) {
	return when(function(oi) {
		return awaitNextOuter(outer, oi);
	}, i);
}

function streamNext(s) {
	return when(s.step, s.state);
}

function disposeInner(t, x, s) {
	return s.inner.dispose(t, x, s.inner.state);
}

},{"../Stream":6,"../promises":27,"../step":33}],22:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var promise = require('../promises');
var step = require('../step');

var when = promise.when;
var resolve = promise.Promise.resolve;
var delayed = promise.delay;
var never = promise.never;
var Yield = step.Yield;
var Pair = step.Pair;
var unamb = step.unamb;
var yieldPair = step.yieldPair;

exports.periodic = periodic;
exports.periodicOn = periodicOn;
exports.delay = delay;
exports.delayOn = delayOn;
exports.debounce = debounce;
exports.debounceOn = debounceOn;
exports.throttle = throttle;
exports.throttleOn = throttleOn;
exports.sync = sync;

/**
 * Create a stream that emits the current time periodically
 * @param {Number} period
 * @returns {Stream} new stream that emits the current time every period
 */
function periodic(period) {
	return periodicOn(Stream.getDefaultScheduler(), period);
}

/**
 * @deprecated
 * Create a stream that emits the current time periodically using
 * the provided scheduler
 * @param {Scheduler} scheduler
 * @param {Number} period
 * @returns {Stream} new stream that emits the current time every period
 */
function periodicOn(scheduler, period) {
	var stream = new Stream(function (s) {
		return new Yield(s, s, s + period);
	}, scheduler.now(), scheduler);

	return skipPast(Math.ceil(period * 0.01), sync(stream));
}

/**
 * Skip all events that are in the past, as determined by the supplied
 * stream's scheduler
 * @private
 * @param {Number} epsilon account for timer resolution (or lack thereof)
 * @param stream
 * @returns {Stream}
 */
function skipPast(epsilon, stream) {
	return stream.beget(function(s) {
		return stepSkipPast(epsilon, stream.scheduler, stream.step, s);
	}, stream.state);
}

function stepSkipPast (epsilon, scheduler, stepper, s) {
	return when(function (i) {
		return i.time + epsilon >= scheduler.now() ? i
			: stepSkipPast(epsilon, scheduler, stepper, i.state);
	}, resolve(s).then(stepper));
}

/**
 * Synchronize a stream's items with its scheduler, ensuring that
 * items are emitted only at their specified time
 * @private
 * @param {Stream} stream stream to synchronize
 * @returns {Stream} new stream whose items are synchronized to the
 * stream's scheduler
 */
function sync(stream) {
	return stream.beget(makeSyncStepper(stream.scheduler, stream.step), stream.state);
}

function makeSyncStepper(scheduler, stepper) {
	return function (s) {
		return syncStep(scheduler, stepper, s);
	};
}

function syncStep (scheduler, stepper, s) {
	return when(function (i) {
		return getSyncStep(scheduler, i);
	}, when(stepper, s));
}

function getSyncStep (scheduler, i) {
	var now = scheduler.now();
	return now < i.time ? delayed(i.time - now, i, scheduler) : i;
}

/**
 * @param {Number} delayTime milliseconds to delay each item using
 * the provided scheduler
 * @param {Stream} stream
 * @returns {Stream} new stream containing the same items, but delayed by ms
 */
function delay(delayTime, stream) {
	return delayOn(stream.scheduler, delayTime, stream);
}

/**
 * @deprecated
 * @param {Scheduler} scheduler
 * @param {Number} delayTime milliseconds to delay each item
 * @param {Stream} stream
 * @returns {Stream} new stream containing the same items, but delayed by ms
 */
function delayOn(scheduler, delayTime, stream) {
	var stepDelay = delayStep(delayTime);
	var stepper = stream.step;
	return stream.beget(makeSyncStepper(scheduler, function(s) {
		return when(stepDelay, when(stepper, s));
	}), stream.state);
}

function delayStep(dt) {
	return function(i) {
		return i.delay(dt);
	};
}

/**
 * Limit the rate of events
 * stream:              abcd----abcd----
 * throttle(2, stream): a-c-----a-c-----
 * @param {Number} period time to suppress events
 * @param {Stream} stream
 * @returns {Stream}
 */
function throttle(period, stream) {
	return throttleOn(stream.scheduler, period, stream);
}

/**
 * @deprecated
 * Limit the rate of events
 * stream:              abcd----abcd----
 * throttle(2, stream): a-c-----a-c-----
 * @param {Scheduler} scheduler
 * @param {Number} period time to suppress events
 * @param {Stream} stream
 * @returns {Stream} new stream that skips events for period
 */
function throttleOn(scheduler, period, stream) {
	scheduler = ensureScheduler(scheduler);

	var stepper = stream.step;
	return stream.beget(function(s) {
		return throttleNext(stepper, s, period, scheduler);
	}, new Pair(-1, stream.state));
}

function throttleNext(stepper, s, period, scheduler) {
	return when(function(i) {
		if(i.done) {
			return i.withState(s.state);
		}

		return i.time > s.value ? yieldPair(i, i.time + period)
			: throttleNext(stepper, new Pair(s.value, i.state), period, scheduler);
	}, when(stepper, s.state));
}

/**
 * Wait for a burst of events to subside and emit only the last event in the burst
 * stream:              abcd----abcd----
 * debounce(2, stream): -----d-------d--
 * @param {Number} period events occuring more frequently than this
 *  will be suppressed
 * @param {Stream} stream stream to debounce
 * @returns {Stream} new debounced stream
 */
function debounce(period, stream) {
	return debounceOn(stream.scheduler, period, stream);
}

/**
 * @deprecated
 * Wait for a burst of events to subside and emit only the last event in the burst
 * stream:              abcd----abcd----
 * debounce(2, stream): -----d-------d--
 * @param {Scheduler} scheduler
 * @param {Number} period events occuring more frequently than this
 *  on the provided scheduler will be suppressed
 * @param {Stream} stream stream to debounce
 * @returns {Stream} new debounced stream
 */
function debounceOn(scheduler, period, stream) {
	var stepper = stream.step;
	return stream.beget(function(s) {
		return stepDebounce(scheduler, period, stepper, s);
	}, { timer: void 0, prev: void 0, next: void 0, state: stream.state });
}

function stepDebounce(scheduler, period, step, s) {
	return stepEarliest(scheduler, period, step, s.timer === void 0 ? initState(step, s) : s);
}

function stepEarliest(scheduler, period, step, s) {
	return unamb(function(winner, index) {
		return index > 0 ? yieldDebounced(s)
			: winner.done ? winner.withState(s.state)
			: stepEarliest(scheduler, period, step, nextState(scheduler, period, step, winner));
	}, [s.next, s.timer]);
}

function initState(step, s) {
	return { timer: never(), prev: s.prev, next: when(step, s.state), state: s.state };
}

function nextState (scheduler, period, step, winner) {
	return { timer: delayed(period, new Yield(scheduler.now() + period, 'timer'), scheduler), prev: winner,
		next: when(step, winner.state), state: winner.state };
}

function yieldDebounced(s) {
	return when(function (prev) {
		return new Yield(prev.time, prev.value, { timer: never(), prev: void 0,
			next: s.next, state: prev.state });
	}, s.prev);
}

function ensureScheduler(scheduler) {
	if(typeof scheduler === 'undefined') {
		return Stream.getDefaultScheduler();
	}
	return scheduler;
}

},{"../Stream":6,"../promises":27,"../step":33}],23:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var join = require('./join').join;
var promise = require('../promises');
var step = require('../step');
var cons = require('./extend').cons;

var when = promise.when;
var Yield = step.Yield;
var Pair = step.Pair;

exports.map = map;
exports.ap = ap;
exports.flatMap = flatMap;
exports.scan = scan;
exports.tap = tap;
exports.constant = constant;

/**
 * Transform each value in the stream by applying f to each
 * @param {function(*):*} f mapping function
 * @param {Stream} stream stream to map
 * @returns {Stream} stream containing items transformed by f
 */
function map(f, stream) {
	var stepper = stream.step;
	return stream.beget(function (state) {
		return mapNext(f, stepper, state);
	}, stream.state);
}

function mapNext (f, stepper, state) {
	return when(function (i) {
		return i.map(f);
	}, when(stepper, state));
}

/**
 * Replace each value in the stream with x
 * @param {*} x
 * @param {Stream} stream
 * @returns {Stream} stream containing items replaced with x
 */
function constant(x, stream) {
	return map(function(){
		return x;
	}, stream);
}

/**
 * Map each value in the stream to a new stream, and merge it into the
 * returned stream.
 * @param {function(x:*):Stream} f chaining function, must return a Stream
 * @param {Stream} stream
 * @returns {Stream} new stream containing all items from each stream returned by f
 */
function flatMap(f, stream) {
	return join(map(f, stream));
}

/**
 * Perform a side effect for each item in the stream
 * @param {function(x:*):*} f side effect to execute for each item. The
 *  return value will be discarded.
 * @param {Stream} stream stream to tap
 * @returns {Stream} new stream containing the same items as this stream
 */
function tap(f, stream) {
	var stepper = stream.step;
	return stream.beget(function (state) {
		return tapNext(f, stepper, state);
	}, stream.state);
}

function tapNext (f, stepper, state) {
	return when(function (i) {
		return i.done ? i : when(function() {
			return i;
		}, i.map(f));
	}, when(stepper, state));
}

/**
 * Assume fs is a stream containing functions, and apply each function to each value
 * in the xs stream.  This generates, in effect, a cross product.
 * @param {Stream} fs stream of functions to apply to the xs
 * @param {Stream} xs stream of values to which to apply all the fs
 * @returns {Stream} stream containing the cross product of items
 */
function ap(fs, xs) {
	return flatMap(function(f) {
		return map(f, xs);
	}, fs);
}

/**
 * Create a stream containing successive reduce results of applying f to
 * the previous reduce result and the current stream item.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} initial initial value
 * @param {Stream} stream stream to scan
 * @returns {Stream} new stream containing successive reduce results
 */
function scan(f, initial, stream) {
	var scanStream = stream.begetWithDispose(function (s) {
		return stepScan(f, s);
	}, new Pair(initial, stream), disposeScan);

	return cons(initial, scanStream);
}

function stepScan (f, s) {
	var stream = s.state;
	return when(function (i) {
		if (i.done) {
			return i.withState(stream);
		}

		var x = f(s.value, i.value);
		return new Yield(i.time, x, new Pair(x, stream.beget(stream.step, i.state)));
	}, when(stream.step, stream.state));
}

function disposeScan(t, x, stream) {
	// Unwrap original stream's state from scan state
	var state = stream.state.state;
	return stream.dispose(t, x, state);
}

},{"../promises":27,"../step":33,"./extend":13,"./join":15}],24:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var promise = require('../promises');
var step = require('../step');
var base = require('../base');
var dispatch = require('../dispatch');

var when = promise.when;
var all = promise.Promise.all;

var isDone = step.isDone;
var Yield = step.Yield;
var End = step.End;

var tail = base.tail;
var map = base.map;
var findIndex = base.findIndex;

exports.zip = zip;
exports.zipArray = zipArray;

/**
 * Combine events from all streams using f
 * @param {function(a:Stream, b:Stream, ...):*} f function to combine items
 * @returns {Stream} stream containing
 */
function zip(f /*,...streams*/) {
	return zipArray(f, tail(arguments));
}

/**
 * Combine events from all streams using f
 * @param {function(a:Stream, b:Stream, ...):*} f function to combine items
 * @param {Array} streams array of observables to zip
 * @returns {Stream} stream containing items from all input streams combined
 * using f
 */
function zipArray(f, streams) {
	return new Stream(function(ss) {
		return stepZip(f, ss);
	}, streams, void 0, disposeAll);
}

function stepZip (f, streams) {
	return all(map(streamNext, streams)).then(function (iterations) {
		return handleStepZip(f, streams, iterations);
	});
}

function handleStepZip(f, streams, iterations) {
	var done = findIndex(isDone, iterations);
	if(done < 0) {
		return applyZipWith(f, streams, iterations);
	}

	var ended = iterations[done];
	return new End(ended.time, ended.value, streams);
}

function disposeAll(t, x, streams) {
	return all(map(function(stream) {
		return stream.dispose(t, x, stream.state);
	}, streams));
}

function applyZipWith(f, streams, iterations) {
	var t = 0;
	var values = new Array(iterations.length);
	var states = new Array(iterations.length);

	var stream, it;
	for(var i=0, l=iterations.length; i<l; ++i) {
		stream = streams[i];
		it = iterations[i];

		if(it.time > t) {
			t = it.time;
		}

		values[i] = it.value;
		states[i] = stream.beget(stream.step, it.state);
	}

	return new Yield(t, dispatch(f, values), states);
}

function streamNext(s) {
	return when(s.step, s.state);
}

},{"../Stream":6,"../base":8,"../dispatch":25,"../promises":27,"../step":33}],25:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

module.exports = function dispatch(f, args) {
	/*jshint maxcomplexity:6*/
	switch(args.length) {
		case 0: return f();
		case 1: return f(args[0]);
		case 2: return f(args[0], args[1]);
		case 3: return f(args[0], args[1], args[2]);
		case 4: return f(args[0], args[1], args[2], args[3]);
		default: return f.apply(void 0, args);
	}
};
},{}],26:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var promise = require('./promises');
var step = require('./step');

var resolve = promise.Promise.resolve;
var when = promise.when;

var Yield = step.Yield;
var End   = step.End;

exports.from = from;
exports.head = head;
exports.makeIterable = makeIterable;
exports.getIterator = getIterator;

/*global Set, Symbol*/
var iteratorSymbol;
// Firefox ships a partial implementation using the name @@iterator.
// https://bugzilla.mozilla.org/show_bug.cgi?id=907077#c14
if (typeof Set === 'function' && typeof new Set()['@@iterator'] === 'function') {
	iteratorSymbol = '@@iterator';
} else {
	iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator ||
		'_es6shim_iterator_';
}

function makeIterable(makeIterator, obj) {
	obj[iteratorSymbol] = makeIterator;
}

function isIterable(o) {
	return typeof o[iteratorSymbol] === 'function';
}

function getIterator(o) {
	return o[iteratorSymbol]();
}

function from(scheduler, x) {
	/*jshint maxcomplexity:6*/
	if(Array.isArray(x)) {
		return new ArrayIterable(scheduler.now, x);
	}

	if(x != null) {
		if(typeof x !== 'function' && typeof x.length === 'number') {
			return new ArrayIterable(scheduler.now, x);
		}

		if(isIterable(x)) {
			return new IterableAdapter(scheduler.now, x);
		}

		if(typeof x.next === 'function') {
			return new IterableWrapper(new IteratorAdapter(scheduler.now(), x));
		}
	}

	throw new TypeError('not iterable: ' + x);
}

function head(iterable) {
	var iterator = getIterator(iterable);
	var iteration = iterator.next();
	return resolve(iteration).then(function(iteration) {
		return iteration.done ? iteration
			: new Yield(iteration.time, iteration.value, new IterableWrapper(iterator));
	});
}

function IterableAdapter(now, iterable) {
	this.now = now;
	this.iterable = iterable;
}

makeIterable(function() {
	return new IteratorAdapter(this.now(), getIterator(this.iterable));
}, IterableAdapter.prototype);

function IteratorAdapter(time, iterator) {
	this.time = time;
	this._iterator = iterator;
}

IteratorAdapter.prototype.next = function() {
	var time = this.time;
	return when(function(i) {
		return i.done ? new End(time, i.value)
			: new Yield(time, i.value, this);
	}, this._iterator.next());
};

function IterableWrapper(iterator) {
	this._iterator = iterator;
}

makeIterable(function() {
	return this._iterator;
}, IterableWrapper.prototype);

function ArrayIterable(now, array) {
	this.now = now;
	this.array = array;
}

makeIterable(function() {
	return new ArrayIterator(this.now(), this.array);
}, ArrayIterable.prototype);

function ArrayIterator(time, array) {
	this.time = time;
	this.array = array;
	this.index = 0;
}

ArrayIterator.prototype.next = function() {
	return this.index < this.array.length
		? new Yield(this.time, this.array[this.index++], this)
		: new End(this.time, void 0);
};

},{"./promises":27,"./step":33}],27:[function(require,module,exports){
var unhandledRejection = require('when/lib/decorators/unhandledRejection');
var PromiseImpl = unhandledRejection(require('when/lib/Promise'));

exports.Promise = PromiseImpl;
exports.defer = defer;
exports.delay = delay;
exports.when = when;
exports.raceIndex = raceIndex;
exports.never = PromiseImpl.never;
exports.getStatus = PromiseImpl._handler;

/**
 * Create a { promise, resolve, reject } tuple
 * @returns {{promise:Promise, resolve:function(*), reject:function(*)}} tuple
 */
function defer() {
	var d = { promise: void 0, resolve: void 0, reject: void 0 };
	d.promise = new PromiseImpl(function(resolve, reject) {
		d.resolve = resolve;
		d.reject = reject;
	});
	return d;
}

/**
 * Return a promise that will be resolved with x after delayTime on the
 * provided scheduler.
 * @param {Number} delayTime delay after which the promise will be resolved with x
 * @param {*} x resolution
 * @param {Scheduler} scheduler scheduler on which to schedule the delay
 * @returns {Promise} promise that will be resolved after delayTime
 */
function delay(delayTime, x, scheduler) {
	return new PromiseImpl(function(resolve) {
		scheduler.delayed(delayTime, resolve, x);
	});
}

/**
 * (WARNING: allows sync or async application of f. Internal use only)
 * Apply f to the value of x. If x is promise, applies f when x is fulfilled.
 * Otherwise, applies f synchronously
 * @param {function} f
 * @param {*|Promise} x
 * @returns {*|Promise}
 */
function when (f, x) {
	return isPromise(x) ? x.then(f) : f(x);
}

function isPromise(x) {
	return x !== null
		&& (typeof x === 'object' || typeof x === 'function')
		&& typeof x.then === 'function';
}

/**
 * Like Promise.race, but calls f with the value *and index* of the first
 * fulfilled promise, and returns a promise for the result.
 * @param {function(x:*, i:Number):*} f function to apply to first
 *  fulfilled value and its index
 * @param {Array} promises
 * @returns {Promise}
 */
function raceIndex(f, promises) {
	var done = false;
	return new PromiseImpl(runRaceIndex);

	function runRaceIndex(resolve, reject) {
		for(var i= 0, l=promises.length; i<l; ++i) {
			settleOne(resolve, reject, i, promises[i]);
		}
	}

	function settleOne(resolve, reject, i, p) {
		PromiseImpl.resolve(p).then(function(x) {
			if(!done) {
				done = true;
				resolve(f(x, i));
			}
		}, reject);
	}
}

},{"when/lib/Promise":35,"when/lib/decorators/unhandledRejection":38}],28:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var promise = require('./promises');

var when = promise.when;
var resolve = promise.Promise.resolve;

module.exports = runStream;

/**
 * Consume a stream until end, processing each item, and finally
 * calling the supplied disposer.
 * @private
 * @param {function(z:*, x:*):*} f
 * @param {*} z
 * @param {Stream} stream
 * @param {*} state
 * @param {function(stream:Stream, z:*, i:End):*} dispose
 * @returns {Promise}
 */
function runStream(f, z, stream, state, dispose) {
	return resolve(when(stream.step, state)).then(function (i) {
		return i.done ? dispose(stream, z, i)
			: runStream(f, f(z, i.value), stream, i.state, dispose);
	});
}

},{"./promises":27}],29:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Queue = require('../Queue');
var iterable = require('../iterable');

var getIterator = iterable.getIterator;

module.exports = MulticastSource;

/**
 * Event source that allows multiple consumers to share a single subscription
 * to an imperatively generated stream.
 * @param {Scheduler} scheduler
 * @param {function(add:function(x), end:function(e)):function} run function
 *  that will receive 2 functions as arguments, the first to add new values to the
 *  stream and the second to end the stream. It may *return* a function that
 *  will be called once all consumers have stopped observing the stream.
 * @param {function(s:Step, items:Array):Array} defaultBufferPolicy queue buffering
 *  policy that will be used to manage consumer queue sizes
 * @constructor
 */
function MulticastSource(scheduler, run, defaultBufferPolicy) {
	this.scheduler = scheduler;

	this._run = run;
	this._subscribers = void 0;
	this._defaultBufferPolicy = defaultBufferPolicy;
	this._dispose = noop;

	var self = this;
	this._doNext = function(x) {
		return self._publishNext(x);
	};
	this._doEnd = function(e) {
		return self._end(e);
	};
	this._doRemove = function(q) {
		return self._remove(q);
	};
	this._doError = function(e) {
		return self._error(e);
	};
}

iterable.makeIterable(function(bufferPolicy) {
	var q = new Queue(bufferPolicy || this._defaultBufferPolicy);

	q.ended.then(this._doRemove);

	if(this._subscribers === void 0) {
		this._subscribers = [q];
		this._dispose = runPublisher(this._run, this._doNext, this._doEnd, this._doError);
	} else {
		this._subscribers.push(q);
	}

	return getIterator(q);
}, MulticastSource.prototype);

function runPublisher(publisher, next, end, error) {
	try {
		return publisher.call(void 0, next, end, error);
	} catch(e) {
		error(e);
	}
}

MulticastSource.prototype.disposer = Queue.disposeQueue;

MulticastSource.prototype._remove = function(subscriber) {
	this._subscribers.splice(this._subscribers.indexOf(subscriber), 1);

	var dispose = this._dispose;
	if(this._subscribers.length === 0 && typeof dispose === 'function') {
		this._dispose = noop;
		return dispose();
	}
};

MulticastSource.prototype._publishNext = function(x) {
	var t = this.scheduler.now();

	for(var i=0, s=this._subscribers, l=s.length; i<l; ++i) {
		s[i].add(t, x);
	}
};

MulticastSource.prototype._end = function(x) {
	var t = this.scheduler.now();
	var s = this._subscribers;

	while(s.length > 0) {
		s.shift().end(t, x);
	}
};

MulticastSource.prototype._error = function(e) {
	for(var i=0, s=this._subscribers, l=s.length; i<l; ++i) {
		s[i].error(e);
		this._remove(s[i]);
	}
};

function noop() {}

},{"../Queue":4,"../iterable":26}],30:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var MulticastSource = require('./MulticastSource');
var fromSource = require('./fromSource');
var Stream = require('../Stream');

exports.create = create;

/**
 * Create a stream by imperatively pushing events.
 * @param {function(add:function(x), end:function(e)):function} run function
 *  that will receive 2 functions as arguments, the first to add new values to the
 *  stream and the second to end the stream. It may *return* a function that
 *  will be called once all consumers have stopped observing the stream.
 * @returns {Stream} stream containing all events added by run before end
 */
function create(run) {
	return fromSource(new MulticastSource(Stream.getDefaultScheduler(), run));
}

},{"../Stream":6,"./MulticastSource":29,"./fromSource":32}],31:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var MulticastSource = require('./MulticastSource');
var fromSource = require('./fromSource');
var copy = require('../base').copy;

exports.fromEventWhere = fromEventWhere;
exports.fromEvent = fromEvent;

/**
 * Create a stream of events from the supplied EventTarget or EventEmitter
 * @param {function(event:*)} predicate filtering predicate call for each source event.
 *  If it returns `false`, the event will NOT be added to the stream.
 *  If it returns any other value (including falsy, eg undefined), the event will be added
 * @param {String} name event name, e.g. 'click'
 * @param {EventTarget|EventEmitter} source EventTarget or EventEmitter. The source
 *  must support either addEventListener/removeEventListener (w3c EventTarget:
 *  http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget),
 *  or addListener/removeListener (node EventEmitter: http://nodejs.org/api/events.html)
 * @returns {Stream} stream of events of the specified type from the source
 */
function fromEventWhere(predicate, name, source) {
	return fromSource(createMulticastSource(function(add) {
		return subscribe(name, source, addWhere);

		function addWhere(e) {
			if(predicate(e) !== false) {
				add(e);
			}
		}
	}));
}

/**
 * Create a stream of events from the supplied EventTarget or EventEmitter
 * @param {String} name event name, e.g. 'click'
 * @param {EventTarget|EventEmitter} source EventTarget or EventEmitter. The source
 *  must support either addEventListener/removeEventListener (w3c EventTarget:
 *  http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget),
 *  or addListener/removeListener (node EventEmitter: http://nodejs.org/api/events.html)
 * @returns {Stream} stream of events of the specified type from the source
 */
function fromEvent(name, source) {
	return fromSource(createMulticastSource(function(add) {
		return subscribe(name, source, add);
	}));
}

function createMulticastSource(run) {
	return new MulticastSource(Stream.getDefaultScheduler(), run);
}

function subscribe(event, source, add) {
	if(typeof source.addEventListener === 'function') {
		return subscribeEventTarget(source, event, add);
	}

	if(typeof source.addListener === 'function') {
		return subscribeEventEmitter(source, event, add);
	}

	throw new Error('source must support add/removeEventListener or add/removeListener');
}

function subscribeEventTarget (source, event, add) {
	source.addEventListener(event, add, false);
	return function () {
		source.removeEventListener(event, add, false);
	};
}

function subscribeEventEmitter (source, event, add) {
	source.addListener(event, addVarargs);
	return function () {
		source.removeListener(event, addVarargs);
	};

	// EventEmitter supports varargs (eg: emitter.emit('event', a, b, c, ...)) so
	// have to support it here by turning into an array
	function addVarargs(a) {
		return arguments.length > 1 ? add(copy(arguments)) : add(a);
	}
}

},{"../Stream":6,"../base":8,"./MulticastSource":29,"./fromSource":32}],32:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

var Stream = require('../Stream');
var iterable = require('../iterable');

var getIterator = iterable.getIterator;

module.exports = fromSource;

/**
 * Create a stream from an event source
 * @private
 * @param {{iterator:function():Object, scheduler:Scheduler, disposer:function():*}} source
 * @returns {Stream} stream containing all items emitted by the source
 */
function fromSource(source) {
	return new Stream(stepSource, source, source.scheduler, source.disposer);
}

function stepSource(queue) {
	return getIterator(queue).next();
}

},{"../Stream":6,"../iterable":26}],33:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/** @module */

/** @typedef {Yield|End} Step */

var promise = require('./promises');

var raceIndex = promise.raceIndex;
var getStatus = promise.getStatus;

exports.Yield = Yield;
exports.End   = End;

exports.isDone = isDone;
exports.getValue = getValue;
exports.getValueOrFail = getValueOrFail;
exports.getState = getState;

exports.Pair = Pair;
exports.yieldPair = yieldPair;

exports.unamb = unamb;

/**
 * A step that yields a new value and a new state that can be used to produce
 * another step
 * @param {Number} t time the value became or will become available
 * @param {*} x value
 * @param {*} s new state
 * @constructor
 */
function Yield(t, x, s) {
	this.time = t; this.done = false; this.value = x; this.state = s;
}

Yield.prototype.map = function(f) {
	return new Yield(this.time, f(this.value), this.state);
};

Yield.prototype.delay = function(dt) {
	return new Yield(this.time + dt, this.value, this.state);
};

Yield.prototype.withState = function(state) {
	return new Yield(this.time, this.value, state);
};

/**
 * A step that represents end of stream. The optional value is *not* in the stream,
 * but rather a custom end of end of stream marker value.
 * @param {Number} t end time
 * @param {?*} x optional end signal value
 * @param {*} s end state
 * @constructor
 */
function End(t, x, s) {
	this.time = t; this.done = true; this.value = x; this.state = s;
}

End.prototype.map = function() {
	return this;
};

End.prototype.delay = function(dt) {
	return new End(this.time + dt, this.value, this.state);
};

End.prototype.withState = function(state) {
	return new End(this.time, this.value, state);
};

function isDone(step) {
	return step.done;
}

function getValue(step) {
	return step.value;
}

function getValueOrFail(step) {
	if(step.done) {
		throw new Error('no more items');
	}
	return step.value;
}

function getState(step) {
	return step.state;
}

/**
 * Unambiguously decide which step is the earliest, and call f with
 *  that step and its index in the steps array.
 * This is a more precise race than Promise.race.  Promise.race always
 *  returns the settled promise with the lowest array index, even if a
 *  promise with a higher array index actually won the race.
 *  unamb checks all indices to find the step with the earliest time.
 * @param {function(x:*, i:Number):*} f function to apply to earliest
 *  step and its index
 * @param {Array} steps
 * @returns {Promise} promise for the result of applying f
 */
function unamb(f, steps) {
	var winner = decide(steps);
	if(winner === null) {
		return raceIndex(function(winner, index) {
			return decideWith(f, steps, winner, index);
		}, steps);
	}

	return f(winner.value, winner.index);
}

function decideWith(f, steps, maybeWinner, index) {
	var winner = decide(steps);
	return winner === null ? f(maybeWinner, index)
		 : f(winner.value, winner.index);
}

function decide(steps) {
	var index = -1, t = Infinity, i = 0;
	var winner, h;

	for(; i<steps.length; ++i) {
		h = getStatus(steps[i]);
		if(h.state() > 0 && h.value.time < t) {
			index = i;
			winner = h.value;
			t = winner.time;
		}
	}

	return index < 0 ? null : { index: index, value: winner };
}

/**
 * A simple value, state pair
 * @param {*} x
 * @param {*} s
 * @constructor
 */
function Pair(x, s) {
	this.value = x; this.state = s;
}

function yieldPair(step, x) {
	return new Yield(step.time, step.value, new Pair(x, step.state));
}

},{"./promises":27}],34:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var base = require('./lib/base');
var cons = base.cons;
var replace = base.replace;

/**
 * Core event stream type
 * @type {Stream}
 */
var Stream = require('./lib/Stream');
exports.Stream      = Stream;

exports.of          = Stream.of;
exports.from        = Stream.from;
exports.fromPromise = Stream.fromPromise;

//-----------------------------------------------------------------------
// Lifting functions

var lift = require('./lib/combinators/lift').lift;

exports.lift = lift;

//-----------------------------------------------------------------------
// Building

var build = require('./lib/combinators/build');
var repeat = build.repeat;

exports.unfold  = build.unfold;
exports.iterate = build.iterate;
exports.repeat  = repeat;

//-----------------------------------------------------------------------
// Extending

var extend = require('./lib/combinators/extend');

var cycle = extend.cycle;
var consStream = extend.cons;

exports.cycle     = cycle;
exports.startWith = consStream;

/**
 * Tie this stream into a circle, thus creating an infinite stream
 * @returns {Stream} new infinite stream
 */
Stream.prototype.cycle = function() {
	return cycle(this);
};

/**
 * @param {*} x item to prepend
 * @returns {Stream} a new stream with x prepended
 */
Stream.prototype.startWith = function(x) {
	return consStream(x, this);
};

//-----------------------------------------------------------------------
// Creating

var create = require('./lib/source/create');

/**
 * Create a stream by imperatively pushing events.
 * @param {function(add:function(x), end:function(e)):function} run function
 *  that will receive 2 functions as arguments, the first to add new values to the
 *  stream and the second to end the stream. It may *return* a function that
 *  will be called once all consumers have stopped observing the stream.
 * @returns {Stream} stream containing all events added by run before end
 */
exports.create = create.create;

//-----------------------------------------------------------------------
// Adapting other sources

var events = require('./lib/source/fromEvent');

/**
 * Create a stream of events from the supplied EventTarget or EventEmitter
 * @param {String} event event name
 * @param {EventTarget|EventEmitter} source EventTarget or EventEmitter. The source
 *  must support either addEventListener/removeEventListener (w3c EventTarget:
 *  http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-EventTarget),
 *  or addListener/removeListener (node EventEmitter: http://nodejs.org/api/events.html)
 * @returns {Stream} stream of events of the specified type from the source
 */
exports.fromEvent = events.fromEvent;
exports.fromEventWhere = events.fromEventWhere;

//-----------------------------------------------------------------------
// Observing

var observing = require('./lib/combinators/observe');
var observe = observing.observe;
var observeUntil = observing.observeUntil;

exports.forEach = exports.observe = observe;

/**
 * Process all the events in the stream
 * @type {Function}
 */
Stream.prototype.forEach = Stream.prototype.observe = function(f, signal) {
	return arguments.length < 2 ? observe(f, this) : observeUntil(f, signal, this);
};

//-----------------------------------------------------------------------
// Transforming

var transform = require('./lib/combinators/transform');

var map = transform.map;
var ap = transform.ap;
var flatMap = transform.flatMap;
var scan = transform.scan;
var tap = transform.tap;
var constant = transform.constant;

exports.map     = map;
exports.ap      = ap;
exports.flatMap = exports.chain = flatMap;
exports.scan    = scan;
exports.tap     = tap;
exports.constant = constant;

/**
 * Transform each value in the stream by applying f to each
 * @param {function(*):*} f mapping function
 * @returns {Stream} stream containing items transformed by f
 */
Stream.prototype.map = function(f) {
	return map(f, this);
};

/**
 * Replace each value in the stream with x
 * @param {*} x
 * @returns {Stream} stream containing items replaced with x
 */
Stream.prototype.constant = function(x){
	return constant(x, this);
};


/**
 * Assume this stream contains functions, and apply each function to each item
 * in the provided stream.  This generates, in effect, a cross product.
 * @param {Stream} xs stream of items to which
 * @returns {Stream} stream containing the cross product of items
 */
Stream.prototype.ap = function(xs) {
	return ap(this, xs);
};

/**
 * Map each value in the stream to a new stream, and emit its values
 * into the returned stream.
 * @param {function(x:*):Stream} f chaining function, must return a Stream
 * @returns {Stream} new stream containing all items from each stream returned by f
 */
Stream.prototype.flatMap = Stream.prototype.chain = function(f) {
	return flatMap(f, this);
};

/**
 * Create a stream containing successive reduce results of applying f to
 * the previous reduce result and the current stream item.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} initial initial value
 * @returns {Stream} new stream containing successive reduce results
 */
Stream.prototype.scan = function(f, initial) {
	return scan(f, initial, this);
};

/**
 * Perform a side effect for each item in the stream
 * @param {function(x:*):*} f side effect to execute for each item. The
 *  return value will be discarded.
 * @returns {Stream} new stream containing the same items as this stream
 */
Stream.prototype.tap = function(f) {
	return tap(f, this);
};

//-----------------------------------------------------------------------
// Filtering

var filter = require('./lib/combinators/filter');
var filterStream = filter.filter;
var takeUntil = filter.takeUntil;
var take = filter.take;
var takeWhile = filter.takeWhile;
var distinctSame = filter.distinct;
var distinctBy = filter.distinctBy;

exports.filter     = filterStream;
exports.takeUntil  = takeUntil;
exports.take       = take;
exports.takeWhile  = takeWhile;
exports.distinct   = distinctSame;
exports.distinctBy = distinctBy;

/**
 * Retain only items matching a predicate
 * stream:                           -12345678-
 * filter(x => x % 2 === 0, stream): --2-4-6-8-
 * @param {function(x:*):boolean} p filtering predicate called for each item
 * @returns {Stream} stream containing only items for which predicate returns truthy
 */
Stream.prototype.filter = function(p) {
	return filterStream(p, this);
};

/**
 * stream:                    -a-b-c-d-e-f-g-
 * signal:                    -------x
 * takeUntil(signal, stream): -a-b-c-
 * @param {Stream} signal retain only events in stream before the first
 * event in signal
 * @param {Stream} stream events to retain
 * @returns {Stream} new stream containing only events that occur before
 * the first event in signal.
 */
Stream.prototype.takeUntil = function(signal) {
	return takeUntil(signal, this);
};

/**
 * stream:          -abcd-
 * take(2, stream): -ab
 * @param {Number} n take up to this many events
 * @returns {Stream} stream containing at most the first n items from this stream
 */
Stream.prototype.take = function(n) {
	return take(n, this);
};

/**
 * stream:                        -123451234-
 * takeWhile(x => x < 5, stream): -1234
 * @param {function(x:*):boolean} p
 * @returns {Stream} stream containing items up to, but not including, the
 * first item for which p returns falsy.
 */
Stream.prototype.takeWhile = function(p) {
	return takeWhile(p, this);
};

/**
 * Remove adjacent duplicates
 * stream:           -abbcd-
 * distinct(stream): -ab-cd-
 * @param {?function(a:*, b:*):boolean} equals optional function to compare items.
 * @returns {Stream} stream with no adjacent duplicates
 */
Stream.prototype.distinct = function(equals) {
	return arguments.length === 0 ? distinctSame(this) : distinctBy(equals, this);
};

//-----------------------------------------------------------------------
// Reducing

var reducing = require('./lib/combinators/reduce');
var reduce = reducing.reduce;
var reduce1 = reducing.reduce1;

exports.reduce  = reduce;
exports.reduce1 = reduce1;

/**
 * Reduce the stream to produce a single result.  Note that reducing an infinite
 * stream will return a Promise that never fulfills, but that may reject if an error
 * occurs.
 * If the initial value is not provided, the first item in the stream will be
 * used--note that the stream *must not* be empty.  If the stream *is* empty
 * and no initial value is provided, returns a rejected promise.
 * @param {function(result:*, x:*):*} f reducer function
 * @param {*} initial optional initial value
 * @returns {Promise} promise for the file result of the reduce
 */
Stream.prototype.reduce = function(f, initial) {
	return arguments.length > 1 ? reduce(f, initial, this) : reduce1(f, this);
};

//-----------------------------------------------------------------------
// Monoid

var monoid = require('./lib/combinators/monoid');
var concat = monoid.concat;

exports.empty  = monoid.empty;
exports.concat = concat;

/**
 * @param {Stream} right
 * @returns {Stream} new stream containing all items in this followed by
 *  all items in right
 */
Stream.prototype.concat = function(right) {
	return concat(this, right);
};

//-----------------------------------------------------------------------
// Combining

var combine = require('./lib/combinators/combine');
var combineArray = combine.combineArray;

exports.combine = combine.combine;

/**
 * Combine latest events from all input streams
 * @param {function(...events):*} f function to combine most recent events
 * @returns {Stream} stream containing the result of applying f to the most recent
 *  event of each input stream, whenever a new event arrives on any stream.
 */
Stream.prototype.combine = function(f /*,...streams*/) {
	return combineArray(f, replace(this, 0, arguments));
};

//-----------------------------------------------------------------------
// Zipping

var zip = require('./lib/combinators/zip');
var zipArray = zip.zipArray;

exports.zip = zip.zip;

/**
 * Pair-wise combine items with those in s. Given 2 streams:
 * [1,2,3] zipWith f [4,5,6] -> [f(1,4),f(2,5),f(3,6)]
 * @param {function(a:Stream, b:Stream, ...):*} f function to combine items
 * @returns {Stream} new stream containing pairs
 */
Stream.prototype.zip = function(f /*,...ss*/) {
	return zipArray(f, replace(this, 0, arguments));
};

//-----------------------------------------------------------------------
// Merging

var merge = require('./lib/combinators/merge');
var mergeArray = merge.mergeArray;

exports.merge    = merge.merge;

/**
 * Merge this stream and all the provided streams
 * @returns {Stream} stream containing items from this stream and s in time
 * order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
Stream.prototype.merge = function(/*,...streams*/) {
	return mergeArray(cons(this, arguments));
};

//-----------------------------------------------------------------------
// Higher-order stream
//-----------------------------------------------------------------------

//-----------------------------------------------------------------------
// Joining (flattening)

var join = require('./lib/combinators/join').join;

exports.join = join;

/**
 * Monadic join. Flatten a Stream<Stream<X>> to Stream<X> by merging inner
 * streams to the outer.  Event arrival times are preserved.
 * @returns {Stream}
 */
Stream.prototype.join = function() {
	return join(this);
};

//-----------------------------------------------------------------------
// Switching

var switching = require('./lib/combinators/switch');
var switchLatest = switching.switch;

exports.switch = switchLatest;

/**
 * Given a stream of streams, return a new stream that adopts the behavior
 * of the most recent inner stream.
 * @returns {Stream} switching stream
 */
Stream.prototype.switch = Stream.prototype.switchLatest = function() {
	return switchLatest(this);
};

//-----------------------------------------------------------------------
// Timers

var timed = require('./lib/combinators/timed');
var delay = timed.delay;
var throttle = timed.throttle;
var debounce = timed.debounce;

exports.periodic   = timed.periodic;
exports.delay      = delay;
exports.throttle   = throttle;
exports.debounce   = debounce;

/**
 * @param {Number} delayTime milliseconds to delay each item
 * @returns {Stream} new stream containing the same items, but delayed by ms
 */
Stream.prototype.delay = function(delayTime) {
	return delay(delayTime, this);
};

/**
 * Limit the rate of events
 * stream:              abcd----abcd----
 * throttle(2, stream): a-c-----a-c-----
 * @param {Number} period time to suppress events
 * @returns {Stream} new stream that skips events for throttle period
 */
Stream.prototype.throttle = function(period) {
	return throttle(period, this);
};

/**
 * Wait for a burst of events to subside and emit only the last event in the burst
 * stream:              abcd----abcd----
 * debounce(2, stream): -----d-------d--
 * @param {Number} period events occuring more frequently than this
 *  on the provided scheduler will be suppressed
 * @returns {Stream} new debounced stream
 */
Stream.prototype.debounce = function(period) {
	return debounce(period, this);
};

//-----------------------------------------------------------------------
// Error handling

var error = require('./lib/combinators/error');

var flatMapError = error.flatMapError;
var throwError = error.throwError;

exports.flatMapError = flatMapError;
exports.throwError   = throwError;

/**
 * If this stream encounters an error, recover and continue with items from stream
 * returned by f.
 * stream:                  -a-b-c-X-
 * f(X):                           d-e-f-g-
 * flatMapError(f, stream): -a-b-c-d-e-f-g-
 * @param {function(error:*):Stream} f function which returns a new stream
 * @returns {Stream} new stream which will recover from an error by calling f
 */
Stream.prototype.flatMapError = function(f) {
	return flatMapError(f, this);
};

},{"./lib/Stream":6,"./lib/base":8,"./lib/combinators/build":10,"./lib/combinators/combine":11,"./lib/combinators/error":12,"./lib/combinators/extend":13,"./lib/combinators/filter":14,"./lib/combinators/join":15,"./lib/combinators/lift":16,"./lib/combinators/merge":17,"./lib/combinators/monoid":18,"./lib/combinators/observe":19,"./lib/combinators/reduce":20,"./lib/combinators/switch":21,"./lib/combinators/timed":22,"./lib/combinators/transform":23,"./lib/combinators/zip":24,"./lib/source/create":30,"./lib/source/fromEvent":31}],35:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function (require) {

	var makePromise = require('./makePromise');
	var Scheduler = require('./Scheduler');
	var async = require('./env').asap;

	return makePromise({
		scheduler: new Scheduler(async)
	});

});
})(typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); });

},{"./Scheduler":37,"./env":39,"./makePromise":40}],36:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {
	/**
	 * Circular queue
	 * @param {number} capacityPow2 power of 2 to which this queue's capacity
	 *  will be set initially. eg when capacityPow2 == 3, queue capacity
	 *  will be 8.
	 * @constructor
	 */
	function Queue(capacityPow2) {
		this.head = this.tail = this.length = 0;
		this.buffer = new Array(1 << capacityPow2);
	}

	Queue.prototype.push = function(x) {
		if(this.length === this.buffer.length) {
			this._ensureCapacity(this.length * 2);
		}

		this.buffer[this.tail] = x;
		this.tail = (this.tail + 1) & (this.buffer.length - 1);
		++this.length;
		return this.length;
	};

	Queue.prototype.shift = function() {
		var x = this.buffer[this.head];
		this.buffer[this.head] = void 0;
		this.head = (this.head + 1) & (this.buffer.length - 1);
		--this.length;
		return x;
	};

	Queue.prototype._ensureCapacity = function(capacity) {
		var head = this.head;
		var buffer = this.buffer;
		var newBuffer = new Array(capacity);
		var i = 0;
		var len;

		if(head === 0) {
			len = this.length;
			for(; i<len; ++i) {
				newBuffer[i] = buffer[i];
			}
		} else {
			capacity = buffer.length;
			len = this.tail;
			for(; head<capacity; ++i, ++head) {
				newBuffer[i] = buffer[head];
			}

			for(head=0; head<len; ++i, ++head) {
				newBuffer[i] = buffer[head];
			}
		}

		this.buffer = newBuffer;
		this.head = 0;
		this.tail = this.length;
	};

	return Queue;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}],37:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {

	var Queue = require('./Queue');

	// Credit to Twisol (https://github.com/Twisol) for suggesting
	// this type of extensible queue + trampoline approach for next-tick conflation.

	/**
	 * Async task scheduler
	 * @param {function} async function to schedule a single async function
	 * @constructor
	 */
	function Scheduler(async) {
		this._async = async;
		this._queue = new Queue(15);
		this._afterQueue = new Queue(5);
		this._running = false;

		var self = this;
		this.drain = function() {
			self._drain();
		};
	}

	/**
	 * Enqueue a task
	 * @param {{ run:function }} task
	 */
	Scheduler.prototype.enqueue = function(task) {
		this._add(this._queue, task);
	};

	/**
	 * Enqueue a task to run after the main task queue
	 * @param {{ run:function }} task
	 */
	Scheduler.prototype.afterQueue = function(task) {
		this._add(this._afterQueue, task);
	};

	/**
	 * Drain the handler queue entirely, and then the after queue
	 */
	Scheduler.prototype._drain = function() {
		runQueue(this._queue);
		this._running = false;
		runQueue(this._afterQueue);
	};

	/**
	 * Add a task to the q, and schedule drain if not already scheduled
	 * @param {Queue} queue
	 * @param {{run:function}} task
	 * @private
	 */
	Scheduler.prototype._add = function(queue, task) {
		queue.push(task);
		if(!this._running) {
			this._running = true;
			this._async(this.drain);
		}
	};

	/**
	 * Run all the tasks in the q
	 * @param queue
	 */
	function runQueue(queue) {
		while(queue.length > 0) {
			queue.shift().run();
		}
	}

	return Scheduler;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{"./Queue":36}],38:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function(require) {

	var setTimer = require('../env').setTimer;

	return function unhandledRejection(Promise) {
		var logError = noop;
		var logInfo = noop;

		if(typeof console !== 'undefined') {
			logError = typeof console.error !== 'undefined'
				? function (e) { console.error(e); }
				: function (e) { console.log(e); };

			logInfo = typeof console.info !== 'undefined'
				? function (e) { console.info(e); }
				: function (e) { console.log(e); };
		}

		Promise.onPotentiallyUnhandledRejection = function(rejection) {
			enqueue(report, rejection);
		};

		Promise.onPotentiallyUnhandledRejectionHandled = function(rejection) {
			enqueue(unreport, rejection);
		};

		Promise.onFatalRejection = function(rejection) {
			enqueue(throwit, rejection.value);
		};

		var tasks = [];
		var reported = [];
		var running = false;

		function report(r) {
			if(!r.handled) {
				reported.push(r);
				logError('Potentially unhandled rejection [' + r.id + '] ' + formatError(r.value));
			}
		}

		function unreport(r) {
			var i = reported.indexOf(r);
			if(i >= 0) {
				reported.splice(i, 1);
				logInfo('Handled previous rejection [' + r.id + '] ' + formatObject(r.value));
			}
		}

		function enqueue(f, x) {
			tasks.push(f, x);
			if(!running) {
				running = true;
				running = setTimer(flush, 0);
			}
		}

		function flush() {
			running = false;
			while(tasks.length > 0) {
				tasks.shift()(tasks.shift());
			}
		}

		return Promise;
	};

	function formatError(e) {
		var s = typeof e === 'object' && e.stack ? e.stack : formatObject(e);
		return e instanceof Error ? s : s + ' (WARNING: non-Error used)';
	}

	function formatObject(o) {
		var s = String(o);
		if(s === '[object Object]' && typeof JSON !== 'undefined') {
			s = tryStringify(o, s);
		}
		return s;
	}

	function tryStringify(e, defaultValue) {
		try {
			return JSON.stringify(e);
		} catch(e) {
			// Ignore. Cannot JSON.stringify e, stick with String(e)
			return defaultValue;
		}
	}

	function throwit(e) {
		throw e;
	}

	function noop() {}

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

},{"../env":39}],39:[function(require,module,exports){
(function (process){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

/*global process,document,setTimeout,clearTimeout,MutationObserver,WebKitMutationObserver*/
(function(define) { 'use strict';
define(function(require) {
	/*jshint maxcomplexity:6*/

	// Sniff "best" async scheduling option
	// Prefer process.nextTick or MutationObserver, then check for
	// setTimeout, and finally vertx, since its the only env that doesn't
	// have setTimeout

	var MutationObs;
	var capturedSetTimeout = typeof setTimeout !== 'undefined' && setTimeout;

	// Default env
	var setTimer = function(f, ms) { return setTimeout(f, ms); };
	var clearTimer = function(t) { return clearTimeout(t); };
	var asap = function (f) { return capturedSetTimeout(f, 0); };

	// Detect specific env
	if (isNode()) { // Node
		asap = function (f) { return process.nextTick(f); };

	} else if (MutationObs = hasMutationObserver()) { // Modern browser
		asap = initMutationObserver(MutationObs);

	} else if (!capturedSetTimeout) { // vert.x
		var vertxRequire = require;
		var vertx = vertxRequire('vertx');
		setTimer = function (f, ms) { return vertx.setTimer(ms, f); };
		clearTimer = vertx.cancelTimer;
		asap = vertx.runOnLoop || vertx.runOnContext;
	}

	return {
		setTimer: setTimer,
		clearTimer: clearTimer,
		asap: asap
	};

	function isNode () {
		return typeof process !== 'undefined' && process !== null &&
			typeof process.nextTick === 'function';
	}

	function hasMutationObserver () {
		return (typeof MutationObserver === 'function' && MutationObserver) ||
			(typeof WebKitMutationObserver === 'function' && WebKitMutationObserver);
	}

	function initMutationObserver(MutationObserver) {
		var scheduled;
		var node = document.createTextNode('');
		var o = new MutationObserver(run);
		o.observe(node, { characterData: true });

		function run() {
			var f = scheduled;
			scheduled = void 0;
			f();
		}

		var i = 0;
		return function (f) {
			scheduled = f;
			node.data = (i ^= 1);
		};
	}
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));

}).call(this,require('_process'))
},{"_process":3}],40:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2014 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

(function(define) { 'use strict';
define(function() {

	return function makePromise(environment) {

		var tasks = environment.scheduler;

		var objectCreate = Object.create ||
			function(proto) {
				function Child() {}
				Child.prototype = proto;
				return new Child();
			};

		/**
		 * Create a promise whose fate is determined by resolver
		 * @constructor
		 * @returns {Promise} promise
		 * @name Promise
		 */
		function Promise(resolver, handler) {
			this._handler = resolver === Handler ? handler : init(resolver);
		}

		/**
		 * Run the supplied resolver
		 * @param resolver
		 * @returns {Pending}
		 */
		function init(resolver) {
			var handler = new Pending();

			try {
				resolver(promiseResolve, promiseReject, promiseNotify);
			} catch (e) {
				promiseReject(e);
			}

			return handler;

			/**
			 * Transition from pre-resolution state to post-resolution state, notifying
			 * all listeners of the ultimate fulfillment or rejection
			 * @param {*} x resolution value
			 */
			function promiseResolve (x) {
				handler.resolve(x);
			}
			/**
			 * Reject this promise with reason, which will be used verbatim
			 * @param {Error|*} reason rejection reason, strongly suggested
			 *   to be an Error type
			 */
			function promiseReject (reason) {
				handler.reject(reason);
			}

			/**
			 * @deprecated
			 * Issue a progress event, notifying all progress listeners
			 * @param {*} x progress event payload to pass to all listeners
			 */
			function promiseNotify (x) {
				handler.notify(x);
			}
		}

		// Creation

		Promise.resolve = resolve;
		Promise.reject = reject;
		Promise.never = never;

		Promise._defer = defer;
		Promise._handler = getHandler;

		/**
		 * Returns a trusted promise. If x is already a trusted promise, it is
		 * returned, otherwise returns a new trusted Promise which follows x.
		 * @param  {*} x
		 * @return {Promise} promise
		 */
		function resolve(x) {
			return isPromise(x) ? x
				: new Promise(Handler, new Async(getHandler(x)));
		}

		/**
		 * Return a reject promise with x as its reason (x is used verbatim)
		 * @param {*} x
		 * @returns {Promise} rejected promise
		 */
		function reject(x) {
			return new Promise(Handler, new Async(new Rejected(x)));
		}

		/**
		 * Return a promise that remains pending forever
		 * @returns {Promise} forever-pending promise.
		 */
		function never() {
			return foreverPendingPromise; // Should be frozen
		}

		/**
		 * Creates an internal {promise, resolver} pair
		 * @private
		 * @returns {Promise}
		 */
		function defer() {
			return new Promise(Handler, new Pending());
		}

		// Transformation and flow control

		/**
		 * Transform this promise's fulfillment value, returning a new Promise
		 * for the transformed result.  If the promise cannot be fulfilled, onRejected
		 * is called with the reason.  onProgress *may* be called with updates toward
		 * this promise's fulfillment.
		 * @param {function=} onFulfilled fulfillment handler
		 * @param {function=} onRejected rejection handler
		 * @deprecated @param {function=} onProgress progress handler
		 * @return {Promise} new promise
		 */
		Promise.prototype.then = function(onFulfilled, onRejected) {
			var parent = this._handler;
			var state = parent.join().state();

			if ((typeof onFulfilled !== 'function' && state > 0) ||
				(typeof onRejected !== 'function' && state < 0)) {
				// Short circuit: value will not change, simply share handler
				return new this.constructor(Handler, parent);
			}

			var p = this._beget();
			var child = p._handler;

			parent.chain(child, parent.receiver, onFulfilled, onRejected,
					arguments.length > 2 ? arguments[2] : void 0);

			return p;
		};

		/**
		 * If this promise cannot be fulfilled due to an error, call onRejected to
		 * handle the error. Shortcut for .then(undefined, onRejected)
		 * @param {function?} onRejected
		 * @return {Promise}
		 */
		Promise.prototype['catch'] = function(onRejected) {
			return this.then(void 0, onRejected);
		};

		/**
		 * Creates a new, pending promise of the same type as this promise
		 * @private
		 * @returns {Promise}
		 */
		Promise.prototype._beget = function() {
			var parent = this._handler;
			var child = new Pending(parent.receiver, parent.join().context);
			return new this.constructor(Handler, child);
		};

		// Array combinators

		Promise.all = all;
		Promise.race = race;

		/**
		 * Return a promise that will fulfill when all promises in the
		 * input array have fulfilled, or will reject when one of the
		 * promises rejects.
		 * @param {array} promises array of promises
		 * @returns {Promise} promise for array of fulfillment values
		 */
		function all(promises) {
			/*jshint maxcomplexity:8*/
			var resolver = new Pending();
			var pending = promises.length >>> 0;
			var results = new Array(pending);

			var i, h, x, s;
			for (i = 0; i < promises.length; ++i) {
				x = promises[i];

				if (x === void 0 && !(i in promises)) {
					--pending;
					continue;
				}

				if (maybeThenable(x)) {
					h = getHandlerMaybeThenable(x);

					s = h.state();
					if (s === 0) {
						h.fold(settleAt, i, results, resolver);
					} else if (s > 0) {
						results[i] = h.value;
						--pending;
					} else {
						resolveAndObserveRemaining(promises, i+1, h, resolver);
						break;
					}

				} else {
					results[i] = x;
					--pending;
				}
			}

			if(pending === 0) {
				resolver.become(new Fulfilled(results));
			}

			return new Promise(Handler, resolver);

			function settleAt(i, x, resolver) {
				/*jshint validthis:true*/
				this[i] = x;
				if(--pending === 0) {
					resolver.become(new Fulfilled(this));
				}
			}
		}

		function resolveAndObserveRemaining(promises, start, handler, resolver) {
			resolver.become(handler);

			var i, h, x;
			for(i=start; i<promises.length; ++i) {
				x = promises[i];
				if(maybeThenable(x)) {
					h = getHandlerMaybeThenable(x);
					if(h !== handler) {
						h.visit(h, void 0, h._unreport);
					}
				}
			}
		}

		/**
		 * Fulfill-reject competitive race. Return a promise that will settle
		 * to the same state as the earliest input promise to settle.
		 *
		 * WARNING: The ES6 Promise spec requires that race()ing an empty array
		 * must return a promise that is pending forever.  This implementation
		 * returns a singleton forever-pending promise, the same singleton that is
		 * returned by Promise.never(), thus can be checked with ===
		 *
		 * @param {array} promises array of promises to race
		 * @returns {Promise} if input is non-empty, a promise that will settle
		 * to the same outcome as the earliest input promise to settle. if empty
		 * is empty, returns a promise that will never settle.
		 */
		function race(promises) {
			if(typeof promises !== 'object' || promises === null) {
				return reject(new TypeError('non-iterable passed to race()'));
			}

			// Sigh, race([]) is untestable unless we return *something*
			// that is recognizable without calling .then() on it.
			return promises.length === 0 ? never()
				 : promises.length === 1 ? resolve(promises[0])
				 : runRace(promises);
		}

		function runRace(promises) {
			var resolver = new Pending();
			var i, x, h;
			for(i=0; i<promises.length; ++i) {
				x = promises[i];
				if (x === void 0 && !(i in promises)) {
					continue;
				}

				h = getHandler(x);
				if(h.state() !== 0) {
					resolveAndObserveRemaining(promises, i+1, h, resolver);
					break;
				}

				h.visit(resolver, resolver.resolve, resolver.reject);
			}
			return new Promise(Handler, resolver);
		}

		// Promise internals
		// Below this, everything is @private

		/**
		 * Get an appropriate handler for x, without checking for cycles
		 * @param {*} x
		 * @returns {object} handler
		 */
		function getHandler(x) {
			if(isPromise(x)) {
				return x._handler.join();
			}
			return maybeThenable(x) ? getHandlerUntrusted(x) : new Fulfilled(x);
		}

		/**
		 * Get a handler for thenable x.
		 * NOTE: You must only call this if maybeThenable(x) == true
		 * @param {object|function|Promise} x
		 * @returns {object} handler
		 */
		function getHandlerMaybeThenable(x) {
			return isPromise(x) ? x._handler.join() : getHandlerUntrusted(x);
		}

		/**
		 * Get a handler for potentially untrusted thenable x
		 * @param {*} x
		 * @returns {object} handler
		 */
		function getHandlerUntrusted(x) {
			try {
				var untrustedThen = x.then;
				return typeof untrustedThen === 'function'
					? new Thenable(untrustedThen, x)
					: new Fulfilled(x);
			} catch(e) {
				return new Rejected(e);
			}
		}

		/**
		 * Handler for a promise that is pending forever
		 * @constructor
		 */
		function Handler() {}

		Handler.prototype.when
			= Handler.prototype.become
			= Handler.prototype.notify // deprecated
			= Handler.prototype.fail
			= Handler.prototype._unreport
			= Handler.prototype._report
			= noop;

		Handler.prototype._state = 0;

		Handler.prototype.state = function() {
			return this._state;
		};

		/**
		 * Recursively collapse handler chain to find the handler
		 * nearest to the fully resolved value.
		 * @returns {object} handler nearest the fully resolved value
		 */
		Handler.prototype.join = function() {
			var h = this;
			while(h.handler !== void 0) {
				h = h.handler;
			}
			return h;
		};

		Handler.prototype.chain = function(to, receiver, fulfilled, rejected, progress) {
			this.when({
				resolver: to,
				receiver: receiver,
				fulfilled: fulfilled,
				rejected: rejected,
				progress: progress
			});
		};

		Handler.prototype.visit = function(receiver, fulfilled, rejected, progress) {
			this.chain(failIfRejected, receiver, fulfilled, rejected, progress);
		};

		Handler.prototype.fold = function(f, z, c, to) {
			this.visit(to, function(x) {
				f.call(c, z, x, this);
			}, to.reject, to.notify);
		};

		/**
		 * Handler that invokes fail() on any handler it becomes
		 * @constructor
		 */
		function FailIfRejected() {}

		inherit(Handler, FailIfRejected);

		FailIfRejected.prototype.become = function(h) {
			h.fail();
		};

		var failIfRejected = new FailIfRejected();

		/**
		 * Handler that manages a queue of consumers waiting on a pending promise
		 * @constructor
		 */
		function Pending(receiver, inheritedContext) {
			Promise.createContext(this, inheritedContext);

			this.consumers = void 0;
			this.receiver = receiver;
			this.handler = void 0;
			this.resolved = false;
		}

		inherit(Handler, Pending);

		Pending.prototype._state = 0;

		Pending.prototype.resolve = function(x) {
			this.become(getHandler(x));
		};

		Pending.prototype.reject = function(x) {
			if(this.resolved) {
				return;
			}

			this.become(new Rejected(x));
		};

		Pending.prototype.join = function() {
			if (!this.resolved) {
				return this;
			}

			var h = this;

			while (h.handler !== void 0) {
				h = h.handler;
				if (h === this) {
					return this.handler = cycle();
				}
			}

			return h;
		};

		Pending.prototype.run = function() {
			var q = this.consumers;
			var handler = this.join();
			this.consumers = void 0;

			for (var i = 0; i < q.length; ++i) {
				handler.when(q[i]);
			}
		};

		Pending.prototype.become = function(handler) {
			if(this.resolved) {
				return;
			}

			this.resolved = true;
			this.handler = handler;
			if(this.consumers !== void 0) {
				tasks.enqueue(this);
			}

			if(this.context !== void 0) {
				handler._report(this.context);
			}
		};

		Pending.prototype.when = function(continuation) {
			if(this.resolved) {
				tasks.enqueue(new ContinuationTask(continuation, this.handler));
			} else {
				if(this.consumers === void 0) {
					this.consumers = [continuation];
				} else {
					this.consumers.push(continuation);
				}
			}
		};

		/**
		 * @deprecated
		 */
		Pending.prototype.notify = function(x) {
			if(!this.resolved) {
				tasks.enqueue(new ProgressTask(x, this));
			}
		};

		Pending.prototype.fail = function(context) {
			var c = typeof context === 'undefined' ? this.context : context;
			this.resolved && this.handler.join().fail(c);
		};

		Pending.prototype._report = function(context) {
			this.resolved && this.handler.join()._report(context);
		};

		Pending.prototype._unreport = function() {
			this.resolved && this.handler.join()._unreport();
		};

		/**
		 * Wrap another handler and force it into a future stack
		 * @param {object} handler
		 * @constructor
		 */
		function Async(handler) {
			this.handler = handler;
		}

		inherit(Handler, Async);

		Async.prototype.when = function(continuation) {
			tasks.enqueue(new ContinuationTask(continuation, this));
		};

		Async.prototype._report = function(context) {
			this.join()._report(context);
		};

		Async.prototype._unreport = function() {
			this.join()._unreport();
		};

		/**
		 * Handler that wraps an untrusted thenable and assimilates it in a future stack
		 * @param {function} then
		 * @param {{then: function}} thenable
		 * @constructor
		 */
		function Thenable(then, thenable) {
			Pending.call(this);
			tasks.enqueue(new AssimilateTask(then, thenable, this));
		}

		inherit(Pending, Thenable);

		/**
		 * Handler for a fulfilled promise
		 * @param {*} x fulfillment value
		 * @constructor
		 */
		function Fulfilled(x) {
			Promise.createContext(this);
			this.value = x;
		}

		inherit(Handler, Fulfilled);

		Fulfilled.prototype._state = 1;

		Fulfilled.prototype.fold = function(f, z, c, to) {
			runContinuation3(f, z, this, c, to);
		};

		Fulfilled.prototype.when = function(cont) {
			runContinuation1(cont.fulfilled, this, cont.receiver, cont.resolver);
		};

		var errorId = 0;

		/**
		 * Handler for a rejected promise
		 * @param {*} x rejection reason
		 * @constructor
		 */
		function Rejected(x) {
			Promise.createContext(this);

			this.id = ++errorId;
			this.value = x;
			this.handled = false;
			this.reported = false;

			this._report();
		}

		inherit(Handler, Rejected);

		Rejected.prototype._state = -1;

		Rejected.prototype.fold = function(f, z, c, to) {
			to.become(this);
		};

		Rejected.prototype.when = function(cont) {
			if(typeof cont.rejected === 'function') {
				this._unreport();
			}
			runContinuation1(cont.rejected, this, cont.receiver, cont.resolver);
		};

		Rejected.prototype._report = function(context) {
			tasks.afterQueue(new ReportTask(this, context));
		};

		Rejected.prototype._unreport = function() {
			this.handled = true;
			tasks.afterQueue(new UnreportTask(this));
		};

		Rejected.prototype.fail = function(context) {
			Promise.onFatalRejection(this, context === void 0 ? this.context : context);
		};

		function ReportTask(rejection, context) {
			this.rejection = rejection;
			this.context = context;
		}

		ReportTask.prototype.run = function() {
			if(!this.rejection.handled) {
				this.rejection.reported = true;
				Promise.onPotentiallyUnhandledRejection(this.rejection, this.context);
			}
		};

		function UnreportTask(rejection) {
			this.rejection = rejection;
		}

		UnreportTask.prototype.run = function() {
			if(this.rejection.reported) {
				Promise.onPotentiallyUnhandledRejectionHandled(this.rejection);
			}
		};

		// Unhandled rejection hooks
		// By default, everything is a noop

		// TODO: Better names: "annotate"?
		Promise.createContext
			= Promise.enterContext
			= Promise.exitContext
			= Promise.onPotentiallyUnhandledRejection
			= Promise.onPotentiallyUnhandledRejectionHandled
			= Promise.onFatalRejection
			= noop;

		// Errors and singletons

		var foreverPendingHandler = new Handler();
		var foreverPendingPromise = new Promise(Handler, foreverPendingHandler);

		function cycle() {
			return new Rejected(new TypeError('Promise cycle'));
		}

		// Task runners

		/**
		 * Run a single consumer
		 * @constructor
		 */
		function ContinuationTask(continuation, handler) {
			this.continuation = continuation;
			this.handler = handler;
		}

		ContinuationTask.prototype.run = function() {
			this.handler.join().when(this.continuation);
		};

		/**
		 * Run a queue of progress handlers
		 * @constructor
		 */
		function ProgressTask(value, handler) {
			this.handler = handler;
			this.value = value;
		}

		ProgressTask.prototype.run = function() {
			var q = this.handler.consumers;
			if(q === void 0) {
				return;
			}

			for (var c, i = 0; i < q.length; ++i) {
				c = q[i];
				runNotify(c.progress, this.value, this.handler, c.receiver, c.resolver);
			}
		};

		/**
		 * Assimilate a thenable, sending it's value to resolver
		 * @param {function} then
		 * @param {object|function} thenable
		 * @param {object} resolver
		 * @constructor
		 */
		function AssimilateTask(then, thenable, resolver) {
			this._then = then;
			this.thenable = thenable;
			this.resolver = resolver;
		}

		AssimilateTask.prototype.run = function() {
			var h = this.resolver;
			tryAssimilate(this._then, this.thenable, _resolve, _reject, _notify);

			function _resolve(x) { h.resolve(x); }
			function _reject(x)  { h.reject(x); }
			function _notify(x)  { h.notify(x); }
		};

		function tryAssimilate(then, thenable, resolve, reject, notify) {
			try {
				then.call(thenable, resolve, reject, notify);
			} catch (e) {
				reject(e);
			}
		}

		// Other helpers

		/**
		 * @param {*} x
		 * @returns {boolean} true iff x is a trusted Promise
		 */
		function isPromise(x) {
			return x instanceof Promise;
		}

		/**
		 * Test just enough to rule out primitives, in order to take faster
		 * paths in some code
		 * @param {*} x
		 * @returns {boolean} false iff x is guaranteed *not* to be a thenable
		 */
		function maybeThenable(x) {
			return (typeof x === 'object' || typeof x === 'function') && x !== null;
		}

		function runContinuation1(f, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.become(h);
			}

			Promise.enterContext(h);
			tryCatchReject(f, h.value, receiver, next);
			Promise.exitContext();
		}

		function runContinuation3(f, x, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.become(h);
			}

			Promise.enterContext(h);
			tryCatchReject3(f, x, h.value, receiver, next);
			Promise.exitContext();
		}

		/**
		 * @deprecated
		 */
		function runNotify(f, x, h, receiver, next) {
			if(typeof f !== 'function') {
				return next.notify(x);
			}

			Promise.enterContext(h);
			tryCatchReturn(f, x, receiver, next);
			Promise.exitContext();
		}

		/**
		 * Return f.call(thisArg, x), or if it throws return a rejected promise for
		 * the thrown exception
		 */
		function tryCatchReject(f, x, thisArg, next) {
			try {
				next.become(getHandler(f.call(thisArg, x)));
			} catch(e) {
				next.become(new Rejected(e));
			}
		}

		/**
		 * Same as above, but includes the extra argument parameter.
		 */
		function tryCatchReject3(f, x, y, thisArg, next) {
			try {
				f.call(thisArg, x, y, next);
			} catch(e) {
				next.become(new Rejected(e));
			}
		}

		/**
		 * @deprecated
		 * Return f.call(thisArg, x), or if it throws, *return* the exception
		 */
		function tryCatchReturn(f, x, thisArg, next) {
			try {
				next.notify(f.call(thisArg, x));
			} catch(e) {
				next.notify(e);
			}
		}

		function inherit(Parent, Child) {
			Child.prototype = objectCreate(Parent.prototype);
			Child.prototype.constructor = Child;
		}

		function noop() {}

		return Promise;
	};
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));

},{}]},{},[1]);

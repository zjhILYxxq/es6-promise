class MyPromise {
    constructor(fn) {
        // promise 对象的初始状态为 'pending'
        this._status = 'pending'
        // promise 对象的初始值为 'undefined'
        this._value = undefined
        // 用于缓存注册的callback，当状态发生变更时，会遍历并处理
        this._handlers = []
        this._effects = []
        // then方法中会调用构造函数构建一个新的promise对象
        // 使用构造函数的时候，不传入fn，也就不会执行fn
        if(!fn) return
        // 执行 fn
        exector(this, fn)
    }

    then(onFullfilled, onRejected) {
        let P = this.constructor
        // promise.then 方法会返回一个 promise 实例
        let res = new P()
        // 如果当前promise对象的状态为pending，会将{onFullfilled, onRejected,..} 添加到_handlers中，等到状态变为终态， 再做处理
        // 如果当前promise对象的状态为终态， 会将callback添加到微任务队列中
        handle(this, {
            onFullfilled,
            onRejected,
            promise: res
        })
        // 返回一个新的promise对象
        return res
    }
    /**
     * then(null, onRejected) 的别名
     * @param {} onRejected 
     */
    catch(onRejected) {
        this.then(null, onRejected)
    }
    /**
     * 只要promise实例的状态发生变化， 都会执行
     * 返回一个promise实例
     * promise实例的值为上一个promise实例的值
     */
    finally(callback) {
        let P = this.constructor
        let res = new P()
        handle(this, {
            onFullfilled: () => {
                // 当原promise实例的状态变为resolved时，执行callback
                callback()
                // 返回原promise对象的值作为新promise对象的值
                return this._value
            },
            onRejected: () => {
                // 当原promise实例的装填变为rejected， 执行callback
                callback()
                // 返回原promise对象的值作为新promise对象的值
                return this._value
            },
            promise: res
        })
        // 返回一个新的promise对象
        return res
    }
    /**
     * 静态方法 resolve， 返回一个状态为 'resolved' 的 promise 实例
     * @param {*} value 
     */
    static resolve(value)  {
        // 传入一个promise对象， 直接返回参数
        if (value instanceof MyPromise) return value
        // 传入一个thenable对象，构建一个新的promise对象
        // thenable对象的状态和值决定新的promise对象的状态和值
        if (value && value.then && typeof value.then === 'function') {
            return new MyPromise(value.then.bind(value))
        }
        // 其他类型的参数，直接返回状态为resolved的promise对象
        // promise对象的值为传入的参数
        let promise = new MyPromise()
        promise._status = 'resolved'
        promise._value = value
        return promise
    }
    /**
     * 静态方法 reject, 返回一个状态为 'rejected' 的 promise 实例
     * @param {} value 
     */
    static reject(value) {
        let promise = new MyPromise()
        promise._status = 'rejected'
        promise._value = value
        return promise
    }
    /**
     * 静态方法 all， 返回一个promise 实例
     * arr 是一个数组， 里面是promise实例。 
     * 当 arr 中所有的promise 实例的状态为 resolved 时， 返回的promise 实例的状态为 resolved
     *      promise实例的值是一个数组， 包含 arr 中所有promise 实例的值
     * 如果arr 中有一个promise实例的状态为 rejected， 则返回的promise 实例的状态为 rejected
     *      promise实例的值等于arr中第一个状态为rejected的promise实例的值
     * @param {*} arr 
     */
    static all(arr) {
        var args = Array.prototype.slice.call(arr)
        // all 方法会返回一个新的promise对象
        return new MyPromise(function(resolve, reject) {
            if (args.length === 0) return resolve([])
            let remain = args.length
            // 如果promise对象的状态为resolved， 把promise对象的值先缓存起来
            // 如果promise对象的状态为pending，等promise的状态变为resolved，把promise对象的状态缓存起来
            // 当所有的promise对象的状态为resolved时，将新的promise对象的状态置为resolved， 使用缓存的数组作为新的promise对象的值
            // 如果promise对象的状态为rejected，直接将新的promise对象的状态置为rejected
            function func(index, val) {
                if (typeof val === 'object') {
                    if (val instanceof MyPromise) {
                        // promise对象的状态为resolved， 缓存promise对象的值
                        if (val._status === 'resolved') return func(index, val._value)
                        // promise对象的状态为rejected，新的promise对象的状态为rejected
                        if (val._status === 'rejected') {
                            // 新的promise对象的值为第一个状态为rejected的promise对象的值
                            reject(val._value)
                            return false
                        }
                        // promise对象的状态为pending
                        val.then(value => {
                            func(index, value)
                        }, reject)
                        return true
                    } else if (val.then && typeof val.then === 'function') {
                        // 传入的参数是thenable对象
                        let p = new MyPromise(val.then.bind(val))
                        p.then(value => {
                            func(index, value)
                        }, reject)
                        return true
                    }
                }
                // 如果promise对象的状态为resolved， 缓存promise对象的值
                args[index] = val
                // 传入的promise对象的状态都变为resolved， 返回的promise对象的状态变为resolved
                // 值为一个数组，包含所有promise对象值
                if (--remain === 0) {
                    resolve(args)
                }
                return true
            }
            // 遍历传入的promise对象
            for(let i = 0; i < args.length; i++) {
                if (!func(i, args[i])) return false
            }
        })
    }
    /**
     * 静态方法 race 返回一个promise 实例
     * arr 是一个数组， 里面是promise实例。 
     * 当 arr 中只要有一个 promise 实例的状态为发生变化， 返回的 promise的状态就会发生变化
     *      promise实例的值是一个数组， 包含 arr 中所有promise 实例的值
     * @param {*} arr 
     */
    static race(arr) {
        // 返回一个promise对象
        return new MyPromise(function(resolve, reject) {
            arr.forEach(function(value){
                //  arr 中只要有一个 promise 实例的状态为发生变化， 返回的 promise的状态就会发生变化
                // 返回的promise对象的值为参数中第一个状态变化的promise对象的值
                MyPromise.resolve(value).then(resolve, reject);
            });
        })
    }
    /**
     * 静态方法 allSettled 返回一个promise 实例
     * arr 是一个数组， 里面是promise实例。 
     * 当 传入的所有 promise 对象 的状态都变为 终态 时， 返回的 新的 promise 对象 的状态变为 resolved。
     * @param {*} arr 
     */
    static allSettled(arr) {
        var args = Array.prototype.slice.call(arr)
        // 返回一个新的promise对象
        return new MyPromise(function(resolve, reject) {
            if (args.length === 0) return resolve([])
            let remain = args.length
            function func(index, val) {
                if (typeof val === 'object') {
                    // 参数为promise对象
                    if (val instanceof MyPromise) {
                        // promise对象的状态为resolved， 缓存promise对象的值
                        if (val._status === 'resolved') return func(index, val._value)
                        // promise对象的状态为rejected， 缓存promise对象的值
                        if (val._status === 'rejected') return func(index, val._value)
                        // promise对象的状态为pending， 等promise对象的状态变为终态时，缓存promise对象的值
                        val.then((value) => {
                            func(index, value)
                        }, (error) => {
                            func(index, error)
                        })
                    } else if (val.then && typeof val.then === 'function') {
                        // 参数为thenable对象
                        let p = new MyPromise(val.then.bind(val))
                        p.then((value) => {
                            func(index, value)
                        }, (error) => {
                            func(index, error)
                        })
                    }
                }
                // 参数为普通值，直接缓存
                args[index] = val
                if (--remain === 0) {
                    // 所有的promise对象的状态都为终态，将返回的promise对象的状态变为resolved
                    // 值为所有promise对象的值
                    resolve(args)
                }
            }
            // 遍历传入的所有promise对象
            for(let i = 0; i < args.length; i++) {
                func(i, args[i])
            }
        })
    }
    /**
     * 静态方法 any 返回一个promise 实例
     * arr 是一个数组， 里面是promise实例。 
     * 当 arr 中只要有一个 promise 实例的状态为 resolved， 返回的 promise的状态就变为resolved
     * 只有arr 中所有的promise实例的状态变为 rejected， 返回的promise的状态变为 rejected
     * @param {*} arr 
     */
    static any(arr) {
        var args = Array.prototype.slice.call(arr)
        // 返回一个新的promise对象
        return new MyPromise(function(resolve, reject) {
            if (args.length === 0) return resolve([])
            let remain = args.length
            function func(index, val) {
                if (typeof val === 'object') {
                    // 传入的参数为promise对象
                    if (val instanceof MyPromise) {
                        // promise对象的状态为resoved， 则返回的promise对象的状态为resolved
                        // 值为第一个状态为resolved的promise对象的值
                        if (val._status === 'resolved') {
                            resolve(val._value)
                            return false
                        }
                        // promise对象的状态为rejected， 缓存promise对象的值
                        if (val._status === 'rejected') return func(index, val._value)
                        // promise对象的状态为pending， 等promise对象的状态变为rejected是，缓存promise对象的值；
                        // 变为resolved时， 返回的promise对象的状态变为resolved
                        val.then(resolve, (error) => {
                            func(index, error)
                        })
                        return true
                    } else if (val.then && typeof val.then === 'function') {
                        // 传入的参数是thenable对象
                        let p = new MyPromise(val.then.bind(val))
                        p.then(resolve, (error) => {
                            func(index, error)
                        })
                        return true
                    }
                }
                // 传入的参数是普通值
                args[index] = val
                // 所有的promise对象的状态都为rejected
                if (--remain === 0) {
                    // 将返回的promise对象的状态变为rejected
                    // 返回的promise对象的值为传入的所有promise对象的值
                    reject(args)
                }
                return true
            }
            // 遍历传入的promise对象
            for(let i = 0; i < args.length; i++) {
                if (!func(i, args[i])) return false
            }
        })
    } 
}
function exector(promise, fn) {
    try {
        // 执行fn， 传入 resolve 和 reject
        fn(value => {resolve(promise, value)},   // resolve
            reason => { reject(promise, reason)}) // reject
    } catch(e) {
        // 执行fn的过程中，如果发生异常， 将promise对象的状态置为rejected
        reject(promise, e)
    }
}
/**
 * 将 promise 实例的状态置为 resolved
 * @param {} promise 
 * @param {*} value value的值可以是普通对象， 也可以是promise实例
 */
function resolve(promise, value) {
    // 如果 promise对象的状态已经为终态， 直接返回
    if (promise._status !== 'pending') return
    if (value && typeof value === 'object') {
        // 使用resolve时，如果传入的是一个promise对象，promise对象的状态会传递给当前promise对象
        if (value instanceof MyPromise) {
            // 传递状态
            promise._status = value._status
            // 传递值
            promise._value = value._value
            if (value._status !== 'pending') {
                // 如果传入的promise对象的状态是resolved， 那么当前promise对象的状态会变为resolved
                // 此时需要将当前promise对象注册的callback全部添加到微任务队列中
                promise._handlers.forEach(handler => {
                    handle(promise, handler)
                })
            } else {
                // 如果传入的promise对象的状态是 pending
                // 需要将当前promise对象添加到传入的promise对象的_effects列表中
                // 等到传入的promise对象的状态发生变化时，通知当前promise对象进行状态变化
                value._effects.push(promise)
            }
            return
        } else if (value.then && typeof value.then === 'function') {
            // 如果传入的是一个 thenable 对象
            doResolve(promise, value.then.bind(value))
            return 
        }
    }
    // 如果传入的是普通值， 那么将当前promise对象的状态置为resolved
    promise._status = 'resolved'
    // 传入的值为promise对象的值
    promise._value = value
    // 遍历_handlers列表， then、catch、finally注册的callback添加到微任务队列中
    promise._handlers.forEach(handler => {
        handle(promise, handler)
    })
    // 通知_effects列表中的promise对象进行状态变更
    promise._effects.forEach(item => {
        resolve(item, promise._value)
    })
}
/**
 * 将 promise 实例的状态置为 rejected
 * @param {*} promise 
 * @param {*} error 
 */
function reject(promise, error) {
    // 如果promise对象的状态为终态， 直接返回
    if (promise._status !== 'pending') return
    // promise 对象 的状态变为 rejected
    promise._status = 'rejected'  
    // 传入的值为promise对象的值
    promise._value = error
    // 遍历_handlers列表， then、catch、finally注册的callback添加到微任务队列中
    promise._handlers.forEach(handler => {
        handle(promise, handler)
    })
    // 通知_effects列表中的promise对象进行状态变更
    promise._effects.forEach(item => {
        reject(item, promise._value)
    })
}
// handler是一个对象，里面包含promise对象注册的onFullfilled、onRejected 和 执行 'then'、'catch'、'finally'方法时返回的 promise对象
function handle(promise, handler) {
    // 如果 promise 实例的状态为pending， 将注册的callback先收集起来。
    // 等promise对象的状态变为终态时，将callback添加到微任务队列中
    if (promise._status === 'pending') {
        promise._handlers.push(handler)
        return
    }
    // promise实例的状态为resolved或者rejected时， 将注册的callback添加到微任务队列中， 等待执行
    queueTask(function() {
        // 微任务队列启动后， 开始处理微任务队列中的任务
        // 如果promise 对象的状态为resolved， 获取onFullfilled
        // 如果promise 对象的状态为rejected， 获取onRejected
        let cb = promise._status === 'resolved' ? handler.onFullfilled : handler.onRejected;
        if (!cb) {
            // 如果callback没有正确注册
            // 'p2 = p1.then(onFullfilled, onRejected)'
            // 如果p1没有正确注册callback，即p1为resolved，却没有注册onFullfilled；
            // 或者 p1为rejected，却没有注册onRejected
            if (promise.status === 'resolved') {
                // 如果p1的状态为resolved，将p2的状态置为resolved
                // p2的值为p1的值
                resolve(handler.promise, promise._value)
            } else {
                // 如果p1的状态为rejected，将p2的状态置为rejected
                // p2的值为p1的值
                reject(handler.promise, promise._value)
            }
            return
        }
        // 如果callback有正确注册
        try {
            // 执行callback
            let res = cb(promise._value)
            // 'p2 = p1.then()'
            // 将p2的状态置为resolved， 并使用callback的返回值作为p2的值
            resolve(handler.promise, res)
        } catch (e) {
            // callback执行异常，将p2的状态置为rejected，将异常作为p2的返回值
            reject(handler.promise, e)
        }
    })
}
module.exports = MyPromise
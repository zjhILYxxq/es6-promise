function timerPromiseFy(delay) {
    return new Promise(function (resolve, reject) {
        setTimeout(function() {
            resolve(delay);
        }, delay)
    })
}
// Promise.race()的用法和Promise.all()的用法基本一样。
// 区别是：Promise.all([promise1, promise2, ..., promiseN])中的Promise实例对象的状态需要全部为完成
//              (要么是resolved，要么是rejected，不需要全部都是resolve或者rejected),才能进行then或
//              者catch操作
//        Promise.race([promise1, promise2, ..., promiseN])中的Promise实例对象只要有一个的状态是
//              resolved或者reject，就可以执行then或者catch操作。而且一个Promise实例对象变为resolve
//              或者reject之后,并不影响其他Promise实例对象的运行
Promise.race([
    timerPromiseFy(1),
    timerPromiseFy(32),
    timerPromiseFy(64),
    timerPromiseFy(128)
]).then(function (value) {
    console.log(value);
});
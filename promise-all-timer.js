// delay毫秒之后执行resolve
function timerPromiseFy(delay) {
    // 返回一个Promise实例对象
    return new Promise(function(resolve, reject) {
        setTimeout(function () {
            resolve(delay);
        }, delay);
    })
}

var startDate = Date.now();
// Promise.all的promise并不是一个个的顺序执行， 而是同时开始、并行执行的
// 所有的promise处于resolve状态时才会执行then回调函数
Promise.all([
    // 1ms之后执行resolve
    timerPromiseFy(1),
    // 32ms之后执行resolve
    timerPromiseFy(32),
    // 64ms之后执行resolve
    timerPromiseFy(64),
    // 128ms之后执行resolve
    timerPromiseFy(128)
]).then(function(values) {
    console.log((Date.now() - startDate) + 'ms');
    console.log(values);
});
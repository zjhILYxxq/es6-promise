// 调用Promise构造函数生成promise实例对象
var aPromise = new Promise(function(resolve) {
    resolve(100);
});
// aPromise实例对象注册当aPromise实例状态变为resolve的回调函数， 同时生成一个新的Promise实例对象thenPromise
var thenPromise = aPromise.then(function(value) {
    console.log(value);
});
// thenPromise实例对象注册当thenPromise实例状态变为rejected的回调函数， 同时生成一个新的Promise实例对象catchPromise
var catchPromise = thenPromise.catch(function(error) {
    consolo.error(error);
});
console.log(aPromise !== thenPromise);
console.log(thenPromise !== catchPromise);
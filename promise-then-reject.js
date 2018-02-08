var promise = Promise.resolve();
// 在 then 中注册的回调函数可以通过return返回一个值。
// 如果返回的是promise对象的话，可以根据promise对象的状态，
// 在下一个then中的注册的回调函数中的onFulfilled和onRejected的哪一个会被调用也是能确定的。
promise.then(function () {
    var retPromise = new Promise(function (resolve, reject) {
        reject(new Error('this promise is rejected'));
    });
    return retPromise;
}).then(function (value) {
    console.log(value);
}).catch(function (error) {
    console.log(error);
});

var oldPromise, newPromise;

oldPromise = Promise.resolve(42).then(function(value) {
   newPromise = Promise.reject(new Error('error'));
   return newPromise;
});

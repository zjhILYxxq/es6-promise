
function throwError(value) {
    throw new Error(value);
}
// throwError抛出的error不会被捕获
function badMain(onRejected) {
    return Promise.resolve(42).then(throwError, onRejected);
}
// throwError抛出的error错误会被捕获
function goodMain(onRejected) {
    return Promise.resolve(42).then(throwError).catch(onRejected);
}

badMain(function(){
    console.log("Bad");
});

goodMain(function () {
    console.log("Good");
});
// promise.then(onFulfilled, onRejected), onFulfilled中产生的异常不会被onRejected捕获；
// promise.then(onFulfilled).catch(onRejected), onFulfilled中产生的异常会被onRejected捕获；
// 运行promise时，可以通过抛出error，将promise的状态变为rejected
var promise1 = new Promise(function (resolve, reject) {
    throw new Error('error1');
});
promise1.catch(function(error) {
    console.log(error);
});
// 通过reject将promise的状态变为rejected，这种方式会更好
var promise2 = new Promise(function (resolve, reject) {
   reject(new Error('error2'));
});
promise2.catch(function(error){
    var a = this;
    var b = arguments;
    console.log(error);
});
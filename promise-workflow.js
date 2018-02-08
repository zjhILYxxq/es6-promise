function asyncFunction() {
    // new Promise, 返回一个promise对象
    return new Promise(function(resolve, reject) {
        setTimeout(function () {
            reject('Async Hello world');
        }, 2000);
    })
}
// asyncFunction().then(function(value){
//     console.log(value)
// }).catch(function(error){
//     console.log(error)
// });
asyncFunction().then(
    // resolve后的回调函数
    function(value) {
        console.log(value);
    },
    // reject后的回到函数
    function(value) {
        console.log(value);
    });
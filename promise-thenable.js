// Promise.resolve()作为new Promise(function(resolve, reject) {resolve(42)})的快捷方式
Promise.resolve(42).then(function(value) {
    console.log(value);
});
// Promise.reject()作为new Promise(function(resolve, reject) {reject(...)})的快捷方式
Promise.reject(new Error('123')).catch(function(value){console.log(value)});

$.ajax({
   url: '../common/data/data-2.json',
   type: 'get',
   dataType: 'json',
   success: function(data) {
       console.log(data);
   },
    error: function(data) {
       console.log(data);
    }
});
// 没有catch方法？？
$.ajax('../common/data/data-1.json').then(function(value) {
    console.log(value);
});
Promise.resolve($.ajax('../common/data/data-2.json')).then(function(value) {
    console.log(value)
}).catch(function(value) {
    console.log(value)
});
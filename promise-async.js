new Promise(function(resolve, reject){
    console.log('1');
    resolve(42)
}).then(function(value) {
    console.log('2');
});
console.log('3');
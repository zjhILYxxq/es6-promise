Promise.all([Promise.resolve(42), Promise.resolve(54), Promise.reject(new Error('error')),
                Promise.reject(new Error('error2'))]).then(function (value) {
    console.log(value);
    throw new Error('error2')
}).catch(function (error) {
    console.log(error);
});
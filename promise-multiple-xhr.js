function getUrl(url) {
    // 创建一个Promise实例对象
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.onload = function() {
            if(req.status === 200) {
                resolve(req.responseText);
            } else {
                reject(new Error(req.statusText));
            }
        }
        req.onerror = function () {
            reject(new Error(req.statusText));
        }
        req.send();
    });
}
var requests = {
    comment: function () {
        // 相当于 getUrl('../common/data/data-2.json').then(function(value){JSON.parse(value)})
        // 生成一个Promise实例对象
        return getUrl('../common/data/data-2.json')
            // 注册状态变为resolve之后的回调函数，并生成一个新的Promise实例对象
            .then(JSON.parse);
    },
    people: function () {
        return getUrl('../common/data/data-4.json').then(JSON.parse);
    }
};

function main () {
    function recordValue(results, value) {
        results.push(value);
        return results;
    }
    var pushValue = recordValue.bind(null, []);
    return requests.comment().then(pushValue).then(requests.people).then(pushValue);
}
main().then(function (value) {
    console.log(value);
}).catch(function (error) {
    console.log(error);
});
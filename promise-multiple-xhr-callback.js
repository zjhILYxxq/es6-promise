/**
 * 根据url请求数据
 * @param url       url路径
 * @param callback  回调方法
 */
function getUrlCallBack(url, callback) {
    // 创建xhr对象
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    // 成功之后的回调函数
    req.onload= function () {
        if(req.status === 200) {
            // callback 是 jsonParse通过bind生成的绑定函数
            callback(null, req.responseText);
        }else{
            callback(new Error(req.statusText), req.response);
        }
    }
    // 失败之后的回调函数
    req.onerror = function () {
        callback(new Error(req.statusText));
    }
    // 发送
    req.send();
}
// 解析json
function jsonParse(callback, error, value) {
    if(error) {
        callback(error, value);
    } else {
        try{
            var result = JSON.parse(value);
            callback(null, result);
        }catch(e){
            callback(e, value);
        }
    }
}
// XHR请求
var request = {
    // 获取comment数据
    getComment: function (callback) {
        return getUrlCallBack('../common/data/data-2.json', jsonParse.bind(null, callback));
    },
    // 获取people数据
    getPeople: function (callback) {
        return getUrlCallBack('../common/data/data-3.json', jsonParse.bind(null, callback));
    }
};

function allRequest(requests, callback, results) {
    if (requests.length === 0) {
        return callback(null, results);
    }
    var req = requests.shift();
    req(function (error, value) {
        if(error) {
            callback(error, value);
        }else {
            results.push(value);
            allRequest(requests, callback, results);
        }
    });
}

function main(callback) {
    allRequest([request.getComment, request.getPeople], callback, []);
}

main(function (error, results) {
    if(error) {
        return console.error(error);
    }
    console.log(results);
});

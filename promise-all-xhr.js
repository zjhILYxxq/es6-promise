function getUrl(url) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.onload = function () {
            if (req.status === 200) {
                resolve(req.responseText);
            } else {
                reject(new Error(req.statusText));
            }
        };
        req.onerror = function () {
            reject(new Error(req.statusText));
        };
        req.send();
    })
}
var requests = {
    comment: function () {
        return getUrl('../common/data/data-2.json').then(JSON.parse);
    },
    people: function () {
        return getUrl('../common/data/data-4.json').then(JSON.parse);
    }
};

function main () {
    return Promise.all([requests.comment(), requests.people(), Promise.reject(new Error('error'))]);
}

main().then(function (value) {
    console.log(value);
}).catch(function (error) {
    console.log(error);
});
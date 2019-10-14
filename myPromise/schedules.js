let queue = [] // 任务队列
let flushing = false // 任务队列未启用
let index = 0
// 将任务添加到任务队列中
// 如果是首次将任务添加到任务队列中，启动任务队列，
//      并通过setTimeout实现同步代码执行完成以后处理任务队列中的任务
// 如果添加任务时， 任务队列已启动， 直接将任务添加到任务队列中，等待处理
function queueTask(task) {
    if (!queue.length) {
        // 启动任务队列
        flushing = true
        // 等同步代码执行完成以后， 处理任务队列中的任务
        setTimeout(flushQueue, 0)
    }
    // 将任务添加到任务列中
    queue.push(task)
}
// 处理任务队列中的任务
function flushQueue() {
    // 遍历任务队列中的任务，处理每一个任务
    while(index < queue.length) {
        queue[index].call()
        index++
    }
    // 处理完成以后，清空并关闭任务队列
    queue = []
    index = 0
    flushing = false
}
module.exports = queueTask
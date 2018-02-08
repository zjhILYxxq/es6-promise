function Deferred() {
    this.promise = new Promise(function(resolve, reject))
}
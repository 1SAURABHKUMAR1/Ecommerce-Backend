// use try catch block || Promise().then().catch() || BigPromise()

module.exports = func => (req, res, next) =>
    Promise.resolve(func(req, res, next)).catch(next)
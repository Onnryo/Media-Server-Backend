const MongoClient = require('mongodb').MongoClient
let mongodb

var connect = (url, callback) => {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
        if (err) return callback(err)
        mongodb = db.db(process.env.MONGO_DATABASE)
        callback()
    })
}

var get = () => {
    return mongodb
}

var close = callback => {
    mongodb.close()
}

module.exports = {
    connect,
    get,
    close,
}

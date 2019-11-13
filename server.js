const express = require('express')
const index = require('./routes/index')
const client = require('./src/mongo')
require('dotenv').config()

const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/', index)

client.connect(process.env.MONGO_URL, err => {
    if (err) return console.log(err)
    app.listen(port, () =>
        console.log(`Media Server Backend listening on port ${port}.`)
    )
})

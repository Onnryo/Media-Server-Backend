import express from 'express'
import index from './src/routes'
import client from './src/utils/mongo'
import torrentClient from './src/utils/torrent'

import dotenv from 'dotenv'
dotenv.config()

const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/', index)

client.connect(process.env.MONGO_URL, err => {
    if (err) return console.log(err)
    torrentClient.connect()
    app.listen(port, () =>
        console.log(`Media Server Backend listening on port ${port}.`)
    )
})

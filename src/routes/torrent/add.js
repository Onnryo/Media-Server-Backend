import express from 'express'
import client from '../../utils/mongo'
import { waterfall } from 'async'
import { check, validationResult } from 'express-validator'
import { exec } from 'child_process'
//import WebTorrent from 'webtorrent'
import { add } from '../../utils/torrent'


const router = express()

router.post(
    '/add',
    [
        check('uri')
            //.matches(/magnet:\?xt=urn:[a-z0-9]+:[a-z0-9]{32}/)
            .trim()
            .escape(),
        check('type').trim().escape().isIn(['tv', 'movie', 'ftp']),
    ],
    (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).send({ errors: errors.array() })
        }
        waterfall(
            [
                callback => {
                    req.body.user = req.user
                    callback(null, req.body)
                },
                queueTorrent,
                //addTorrentToDeluge,
                //getTorrentID,
                //addTorrentToDb,
            ],
            (err, status, result) => {
                return res.status(status).send(result)
            }
        )
    }
)

const queueTorrent = (body, callback) => {
    add(body.uri)
    callback(null, 200, {})
    //callback(null, body)
}

const addTorrentToDeluge = (body, callback) => {
    exec(
        `deluge-console "connect ${process.env.DELUGE_ADDRESS}:${process.env.DELUGE_PORT} ${process.env.DELUGE_USER} ${process.env.DELUGE_PASS} ; add -p ${process.env.DOWNLOAD_DIR} ${body.uri} ; exit"`,
        (err, stdout, stderr) => {
            if (err) {
                console.log(err)
                callback(true, 500, { errors: ['Server error: 102'] })
            } else {
                callback(null, body)
            }
        }
    )
}

const getTorrentID = (body, callback) => {
    exec(
        `deluge-console "connect ${process.env.DELUGE_ADDRESS}:${process.env.DELUGE_PORT} ${process.env.DELUGE_USER} ${process.env.DELUGE_PASS} ; info --sort=active_time ; exit"`,
        (err, stdout, stderr) => {
            if (err) {
                console.log(err)
                callback(true, 500, { errors: ['Server error: 103'] })
            } else {
                body.id = stdout.split('\n')[2].split(' ')[1]
                callback(null, body)
            }
        }
    )
}

const addTorrentToDb = (body, callback) => {
    client
        .get()
        .collection('torrents')
        .insertOne({
            uri: body.uri,
            id: body.id,
            user: body.user,
            added: new Date(),
        })
    callback(null, 200, {id: body.id})
}

module.exports = router

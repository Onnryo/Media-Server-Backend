import express from 'express'
import { waterfall } from 'async'
import { check, validationResult } from 'express-validator'
import { exec } from 'child_process'

const router = express()

router.post(
    '/info',
    [
        check('id')
            .optional()
            .trim()
            .escape(),
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
                getTorrentInfo,
                parseInfo,
            ],
            (err, status, result) => {
                return res.status(status).send(result)
            }
        )
    }
)

const getTorrentInfo = (body, callback) => {
    if (body.id) {
        exec(
            `deluge-console "connect ${process.env.DELUGE_ADDRESS}:${process.env.DELUGE_PORT} ${process.env.DELUGE_USER} ${process.env.DELUGE_PASS} ; info ${body.id} ; exit"`,
            (err, stdout, stderr) => {
                if (err) {
                    console.log(err)
                    callback(true, 500, { errors: ['Server error: 104'] })
                } else {
                    body.info = stdout
                    callback(null, body)
                }
            }
        )
    } else {
        exec(
            `deluge-console "connect ${process.env.DELUGE_ADDRESS}:${process.env.DELUGE_PORT} ${process.env.DELUGE_USER} ${process.env.DELUGE_PASS} ; info --sort=active_time ; exit"`,
            (err, stdout, stderr) => {
                if (err) {
                    console.log(err)
                    callback(true, 500, { errors: ['Server error: 105'] })
                } else {
                    body.info = stdout
                    callback(null, body)
                }
            }
        )
    }
}

const parseInfo = (body, callback) => {
    let lines = body.info.split('\n')
    if (lines.length <= 1) callback(null, 200, { torrents: [] })
    else {
        let torrents = []
        for (var i = 0; i < lines.length - 1; i++) {
            if (lines[i] == ' ') {
                let torrent = {
                    name: lines[i + 1].split(' ')[1],
                    id: lines[i + 2].split(' ')[1],
                    state: lines[i + 3].split(' ')[1],
                }
                if (torrent.state == 'Seeding') torrent.progress = 100.0
                else if (torrent.state == 'Paused') {
                    torrent.progress = parseFloat(
                        lines[i + 7].split(' ')[1].slice(0, -1)
                    )
                } else {
                    torrent.progress = parseFloat(
                        lines[i + 8].split(' ')[1].slice(0, -1)
                    )
                }
                torrents.push(torrent)
            }
        }
        callback(null, 200, { torrents: torrents })
    }
}

module.exports = router

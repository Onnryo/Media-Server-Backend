import express from 'express'
import client from '../../utils/mongo'
import { waterfall } from 'async'
import { check, validationResult } from 'express-validator'
import { exec } from 'child_process'
//import WebTorrent from 'webtorrent'
import { add } from '../../utils/torrent'


const router = express()

router.post(
    '/download',
    [
        check('url').trim().escape(),
        check('format').trim().escape(),
    ],
    (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).send({ errors: errors.array() })
        }
	
    	exec(
            `youtube-dl -o ${process.env.DOWNLOAD_DIR} -f ${req.body.format} ${req.body.url}`,
            (err, stdout, stderr) => {
		if (err) {
                    console.log(err)
		    return res.status(500).send({ errors: ['Server error: 201'] })
            	} else {
                    return res.status(200).send({})
            	}
            }
    	)
    }
)

module.exports = router

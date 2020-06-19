import express from 'express'
import { check, validationResult } from 'express-validator'
import { exec } from 'child_process'

const router = express()

router.post(
    '/delete',
    [
        check('id')
            .trim()
            .escape(),
    ],
    (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).send({ errors: errors.array() })
        }
        exec(
            `deluge-console "connect ${process.env.DELUGE_ADDRESS}:${process.env.DELUGE_PORT} ${process.env.DELUGE_USER} ${process.env.DELUGE_PASS} ; rm ${req.body.id} ; exit"`,
            (err, stdout, stderr) => {
                if (err) {
                    console.log(err)
                    return res.status(500).send({errors: ['Server error: 107']})
                } else {
                    return res.status(200).send({})
                }
            }
        )
    }
)

module.exports = router

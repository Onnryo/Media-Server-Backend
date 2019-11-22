import express from 'express'
import client from '../../src/mongo'
import { waterfall } from 'async'
import { check, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'

const router = express()

/* 
    Stores new user in db if username and email are unique
    req.body parameters:
        username: 6+ alpha-numeric characters with no special characters
        email: valid email
        password at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character
*/
router.post(
    '/signup',
    [
        check('username')
            .matches(/^(?=.{4,})(?!.*\W).*$/)
            .trim()
            .escape(),
        check('email')
            .isEmail()
            .normalizeEmail(),
        check('password')
            .matches(/^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\W).*$/)
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
                    callback(null, req.body)
                },
                hash,
                checkUser,
                createUser,
            ],
            (err, status, result) => {
                return res.status(status).send(result)
            }
        )
    }
)

/* 
    Hashes body.password and stores hash in body.password
*/
const hash = (body, callback) => {
    bcrypt.hash(body.password, 10, (err, hash) => {
        body.password = hash
        callback(null, body)
    })
}

/* 
    Ensure username and email have not been taken
*/
const checkUser = (body, callback) => {
    client
        .get()
        .collection('users')
        .find({ $or: [{ username: body.username }, { email: body.email }] }, {})
        .toArray((err, docs) => {
            if (err) {
                console.log(error.message)
                callback(true, 500, { errors: ['Server error: 100'] })
            } else if (docs.length != 0) {
                console.log(docs[0].username)
                if (docs[0].username == body.username)
                    callback(true, 400, { errors: ['Username is taken'] })
                else if (docs[0].email == body.email)
                    callback(true, 400, { errors: ['Email is taken'] })
            } else callback(null, body)
        })
}

/* 
    Stores user info in users collection
*/
const createUser = (body, callback) => {
    client
        .get()
        .collection('users')
        .insertOne({
            username: body.username,
            email: body.email,
            password: body.password,
        })
    callback(null, 200, {})
}

module.exports = router

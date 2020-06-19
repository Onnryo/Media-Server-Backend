import express from 'express'
import client from '../../utils/mongo'
import { waterfall } from 'async'
import { check, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express()

/* 
    If username is in users collection, compare body.password to hashed password.
    If password is correct, generate and return new JWT
    req.body parameters:
        username, password
*/
router.post(
    '/login',
    [
        check('username')
            .trim()
            .escape(),
        check('password')
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
                getHash,
                compareHash,
            ],
            (err, status, result) => {
                return res.status(status).send(result)
            }
        )
    }
)

/* 
    Get user from users collection and store user's hashed password in body.hash
*/
const getHash = (body, callback) => {
    client
        .get()
        .collection('users')
        .findOne({ username: body.username }, (err, user) => {
            if (err) {
                console.log(error.message)
                callback(true, 500, { errors: ['Server error: 101'] })
            } else if (user) {
                body.hash = user.password
                callback(null, body)
            } else
                callback(true, 400, {
                    errors: ['Invalid username or password'],
                })
        })
}

/* 
    Compares body.password with hashed password
    Generate JWT if password is correct
*/
const compareHash = (body, callback) => {
    bcrypt.compare(body.password, body.hash, (err, result) => {
        if (result) {
            let token = jwt.sign({ user: body.username }, process.env.JWT_KEY, {
                expiresIn: 86400,
            })
            callback(null, 200, { token: token })
        } else callback(true, 400, { errors: ['Invalid username or password'] })
    })
}

module.exports = router

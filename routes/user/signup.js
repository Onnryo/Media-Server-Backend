const express = require('express')
const router = express()
const client = require('../../src/mongo')

router.post('/signup', (req, res) => {
    client
        .get()
        .collection('users')
        .insertOne({
            username: req.body.username,
            email: req.body.email,
            password: 'password',
        })
    res.send(`${req.body.username}: ${req.body.password}`)
})

module.exports = router

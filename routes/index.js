const express = require('express')
const router = express()

const signup = require('./user/signup')
const login = require('./user/login')

router.use('/user', signup)
router.use('/user', login)

module.exports = router

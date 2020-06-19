import express from 'express'
import jwt from 'jsonwebtoken'
import signup from './user/signup'
import login from './user/login'
import add from './torrent/add'
import info from './torrent/info'
import pause from './torrent/pause'
import resume from './torrent/resume'
import del from './torrent/delete'
import ytdl from './youtube/download'

const router = express()

const jwtMiddleware = (req, res, next) => {
    if (req.headers.authorization) {
        var auth = req.headers.authorization.split(' ')
        if (auth.length > 1 && auth[0].toLowerCase() === 'bearer') {
            jwt.verify(auth[1], process.env.JWT_KEY, (err, payload) => {
                if (err || !payload)
                    res.status(401).send({ errors: ['Invalid token'] })
                else {
                    req.user = payload.user
                    next()
                }
            })
        } else
            res.status(400).send({ errors: ['Malformed authorization header'] })
    } else res.status(400).send({ erors: ['Missing authorization header'] })
}

router.use('/user', signup)
router.use('/user', login)

router.use('/torrent', jwtMiddleware, add)
router.use('/torrent', jwtMiddleware, info)
router.use('/torrent', jwtMiddleware, pause)
router.use('/torrent', jwtMiddleware, resume)
router.use('/torrent', jwtMiddleware, del)

router.use('/youtube', jwtMiddleware, ytdl)

module.exports = router

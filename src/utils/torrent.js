var WebTorrent = require('webtorrent')

let client

var connect = () => {
    client = new WebTorrent()
}

var get = () => {
    return client
}

var close = callback => {
    client.destroy(callback)
}

var add = (uri) => {
    client.add(uri, {path: process.env.DOWNLOAD_PATH}, (torrent) => {
        console.log('Client is downloading:', torrent.name, torrent.infoHash)
	torrent.on('done', () => {
	    console.log('Removing torrent:', torrent.files[0].path)
	    //torrent.destroy()
	})
    })
}

module.exports = {
    connect,
    get,
    add,
    close,
}

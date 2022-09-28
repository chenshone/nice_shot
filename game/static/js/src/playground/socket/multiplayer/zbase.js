class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground
        this.ws = new WebSocket("ws://moba.chenshone.top/wss/multiplayer/")
        this.uuid = null
        this.start()
    }

    start() {
        this.receive()
    }

    receive() {
        let outer = this
        this.ws.onmessage = function (e) {
            let data = JSON.parse(e.data)
            let uuid = data.uuid
            if (uuid === outer.uuid) return false

            let event = data.event
            if (event === 'create_player') {
                outer.receiveCreatePlayer(uuid, data.username, data.photo)
            }
        }
    }

    sendCreatePlayer(username, photo) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'create_player',
            'uuid': outer.uuid,
            'username': username,
            'photo': photo
        }))
    }

    receiveCreatePlayer(uuid, username, photo) {
        let player = new Player(this.playground,
            this.playground.width / 2 / this.playground.scale,
            this.playground.height / 2 / this.playground.scale,
            this.playground.height * 0.05 / this.playground.scale,
            "white",
            this.playground.height * 0.2 / this.playground.scale,
            "enemy",
            username,
            photo)
        player.uuid = uuid
        this.playground.players.push(player)
    }

}
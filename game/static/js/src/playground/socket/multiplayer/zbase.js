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
            } else if (event === 'move_to') {
                outer.receiveMoveTo(uuid, data.tx, data.ty)
            } else if (event === 'shoot_fireball') {
                outer.receiveShootFireball(uuid, data.tx, data.ty, data.ball_uuid)
            } else if (event === 'attack') {
                outer.receiveAttack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid)
            } else if (event === 'blink') {
                outer.receiveBlink(uuid, data.tx, data.ty)
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

    sendMoveTo(tx, ty) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'move_to',
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty
        }))
    }

    receiveMoveTo(uuid, tx, ty) {
        let player = this.getPlayer(uuid)
        if (player) {
            player.move2position(tx, ty)
        }
    }

    sendShootFireball(tx, ty, ball_uuid) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'shoot_fireball',
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid
        }))
    }

    receiveShootFireball(uuid, tx, ty, ball_uuid) {
        let player = this.getPlayer(uuid)
        if (player) {
            let fireball = player.shootFireball(tx, ty)
            fireball.uuid = ball_uuid
        }
    }

    // 被击中时，因为有误差的存在，所以需要强制同步被击中玩家的坐标
    sendAttack(attackee_uuid, x, y, angle, damage, ball_uuid) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'attack',
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
        }))
    }

    receiveAttack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.getPlayer(uuid)
        let attackee = this.getPlayer(attackee_uuid)
        if (attacker && attackee) {
            attackee.receiveAttack(x, y, angle, damage, ball_uuid, attacker)
        }
    }


    sendBlink(tx, ty) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'blink',
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }))
    }

    receiveBlink(uuid, tx, ty) {
        let player = this.getPlayer(uuid)
        if (player) {
            player.blink(tx, ty)
        }
    }

    getPlayer(uuid) {
        let players = this.playground.players
        for (let i = 0; i < players.length; i++)
            if (players[i].uuid === uuid)
                return players[i];
        return null
    }

}
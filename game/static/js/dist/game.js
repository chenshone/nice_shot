class PyGameMenu {
    constructor(root) {
        this.root = root
        this.$menu = $(`
        <div class="py_game_menu">
            <div class="py_game_menu_filed">
                <div class="py_game_menu_filed_item py_game_menu_filed_item_single_mode">
                单人模式
                </div>
                <br>
                <div class="py_game_menu_filed_item py_game_menu_filed_item_multi_mode">
                多人模式
                </div>
                <br>
                <div class="py_game_menu_filed_item py_game_menu_filed_item_settings">
                设置
                </div>
            </div>
        </div>
        `)
        this.$menu.hide()

        this.root.$py_game.append(this.$menu)

        this.$single_mode = this.$menu.find('.py_game_menu_filed_item_single_mode')
        this.$multi_mode = this.$menu.find('.py_game_menu_filed_item_multi_mode')
        this.$settings = this.$menu.find('.py_game_menu_filed_item_settings')
        this.start()
    }

    start() {
        this.add_listening_events()
    }

    add_listening_events() {
        let outer = this
        this.$single_mode.click(function () {
            outer.hide()
            outer.root.playground.show("single mode")
        })
        this.$multi_mode.click(function () {
            outer.hide()
            outer.root.playground.show("multi mode")
        })
        this.$settings.click(function () {
            outer.root.settings.logoutOnRemote()
        })
    }

    show() {
        this.$menu.show()
    }

    hide() {
        this.$menu.hide()
    }
}
let py_game_objects = []

class PyGameObject {
    constructor() {
        py_game_objects.push(this)
        this.hasCalledStart = false;
        this.timedelta = 0 // 当前帧距离上一帧的时间间隔
        this.uuid = this.createUuid()
    }

    createUuid() {
        let res = ""
        for (let i = 0; i < 8; i++) {
            let x = Math.floor(Math.random() * 10).toString()
            res += x
        }
        return res
    }

    start() { // 只会在第一帧执行一次
    }

    update() { // 每一帧都执行一次
    }

    beforeDestroy() { // 在销毁前执行一次

    }

    destroy() {
        this.beforeDestroy()
        for (let i = 0; i < py_game_objects.length; i++) {
            if (py_game_objects[i] === this) {
                py_game_objects.splice(i, 1)
                break
            }
        }
    }
}

let lastTimestamp
let py_game_animation = function (timestamp) {
    for (let i = 0; i < py_game_objects.length; i++) {
        let obj = py_game_objects[i]
        if (!obj.hasCalledStart) {
            obj.start()
            obj.hasCalledStart = true;
        } else {
            obj.timedelta = timestamp - lastTimestamp
            obj.update()
        }
    }
    lastTimestamp = timestamp

    requestAnimationFrame(py_game_animation)
}

requestAnimationFrame(py_game_animation)
class ChatField {
    constructor(playground) {
        this.playground = playground

        this.$history = $(`<div class="py_game_chat_field_history"></div>`)
        this.$input = $(`<input type="text" class="py_game_chat_field_input">`)

        this.$history.hide()
        this.$input.hide()

        this.fieldTimer = null

        this.playground.$playground.append(this.$history)
        this.playground.$playground.append(this.$input)

        this.start()
    }

    start() {
        this.addListeningEvent()
    }

    addListeningEvent() {
        let outer = this
        this.$input.keydown(function (e) {
            if (e.which === 27) { // esc
                outer.hideInput()
                return false
            } else if (e.which === 13) {
                let username = outer.playground.root.settings.username
                let text = outer.$input.val()
                if (text) {
                    outer.$input.val("")
                    outer.addMessage(username, text)
                    outer.playground.mps.sendMessage(username, text)
                }
                return false
            }
        })
    }

    renderMessage(message) {
        return $(`<div>${message}</div>`)
    }

    addMessage(username, text) {
        this.showHistory()
        let message = `[${username}]${text}`
        this.$history.append(this.renderMessage(message))
        this.$history.scrollTop(this.$history[0].scrollHeight)
    }

    showHistory() {
        let outer = this
        this.$history.fadeIn()

        if (this.fieldTimer) clearTimeout(this.fieldTimer)

        this.fieldTimer = setTimeout(function () {
            outer.$history.fadeOut()
            outer.fieldTimer = null
        }, 3000)
    }

    showInput() {
        this.showHistory()
        this.$input.show()
        this.$input.focus()
    }

    hideInput() {
        this.$input.hide()
        this.playground.gameMap.$canvas.focus()
    }
}class NoticeBoard extends PyGameObject {
    constructor(playground) {
        super()

        this.playground = playground
        this.ctx = playground.gameMap.ctx
        this.text = '已就绪: 0人'
        
    }

    start() {
    }

    write(text) {
        this.text = text
    }

    update() {
        this.render()
    }

    render() {
        this.ctx.font = "20px serif"
        this.ctx.fillStyle = "white"
        this.ctx.textAlign = "center"
        this.ctx.fillText(this.text, this.playground.width / 2, 20)
    }

}class GameMap extends PyGameObject {
    constructor(playground) {
        super();
        this.playground = playground
        this.$canvas = $(`
           <canvas tabindex="0"></canvas> 
        `)
        this.ctx = this.$canvas[0].getContext('2d')
        this.ctx.canvas.width = this.playground.width
        this.ctx.canvas.height = this.playground.height

        this.playground.$playground.append(this.$canvas)
    }

    start() {
        this.$canvas.focus()
    }

    resize() {
        this.ctx.canvas.width = this.playground.width
        this.ctx.canvas.height = this.playground.height
        this.ctx.fillStyle = "rgba(0,0,0,1)"
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    }

    update() {
        this.render()
    }

    render() {
        this.ctx.fillStyle = "rgba(0,0,0,0.2)"
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    }

}
class Particle extends PyGameObject {
    constructor(playground, x, y, radius, vx, vy, speed, color, moveLength) {
        super();
        this.playground = playground
        this.ctx = playground.gameMap.ctx
        this.x = x
        this.y = y
        this.radius = radius
        this.vx = vx
        this.vy = vy
        this.speed = speed
        this.color = color
        this.friction = 0.95
        this.moveLength = moveLength
        this.eps = 0.01
    }

    start() {
    }

    update() {
        if (this.moveLength < this.eps || this.speed < this.eps) {
            this.destroy()
            return false
        }
        let d = Math.min(this.moveLength, this.speed * this.timedelta / 1000)
        this.x += this.vx * d
        this.y += this.vy * d
        this.speed *= this.friction
        this.moveLength -= d
        this.render()
    }

    render() {
        let scale = this.playground.scale
        this.ctx.beginPath()
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false)
        this.ctx.fillStyle = this.color
        this.ctx.fill()
    }
}class Player extends PyGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        super()
        this.playground = playground
        this.ctx = playground.gameMap.ctx
        this.x = x
        this.y = y
        this.vx = 1
        this.vy = 1
        this.moveLength = 0
        this.radius = radius
        this.color = color
        this.speed = speed
        this.character = character
        this.username = username
        this.photo = photo
        this.eps = 0.01 // 精度
        // 收到伤害后会被弹出一段距离（此阶段失去控制）
        this.damageX = 0 //方向
        this.damageY = 0
        this.damageSpeed = 0
        this.friction = 0.9 // 摩擦力
        this.curSkill = null
        this.spendTime = 0 // 前5s不能攻击
        this.fireballs = []

        if (character !== "robot") {
            this.img = new Image()
            this.img.src = this.photo
        }

        if (character === 'me') {
            this.fireballColdtime = 3 // 冷却时间 秒
            this.fireBallImg = new Image()
            this.fireBallImg.src = 'https://cdn.jsdelivr.net/gh/chenshone/myPictureHost@main/learning-notes/20221008141348.png'

            this.blinkColdtime = 5 // 闪现冷却时间 秒
            this.blinkImg = new Image()
            this.blinkImg.src = 'https://cdn.jsdelivr.net/gh/chenshone/myPictureHost@main/learning-notes/20221008141411.png'
        }
    }

    start() {
        this.playground.playerCount++
        this.playground.noticeBoard.write(`已就绪: ${this.playground.playerCount}人`)
        if (this.playground.playerCount >= 3) {
            this.playground.state = 'fighting'
            this.playground.noticeBoard.write("fighting")
        }
        if (this.character === "me") {
            this.addListeningEvents()
        }
    }

    addListeningEvents() {
        let outer = this
        this.playground.gameMap.$canvas.on("contextmenu", function () {
            return false
        })
        this.playground.gameMap.$canvas.on("mousedown", function (e) {
            if (outer.playground.state !== 'fighting') return true

            const rect = outer.ctx.canvas.getBoundingClientRect()
            if (e.which === 3) { // 鼠标右键
                let tx = (e.clientX - rect.left) / outer.playground.scale
                let ty = (e.clientY - rect.top) / outer.playground.scale
                outer.move2position(tx, ty)
                if (outer.playground.mode === 'multi mode')
                    outer.playground.mps.sendMoveTo(tx, ty)
            } else if (e.which === 1) { // 鼠标左键
                let tx = (e.clientX - rect.left) / outer.playground.scale
                let ty = (e.clientY - rect.top) / outer.playground.scale
                if (outer.curSkill === 'fireball') {
                    if (outer.fireballColdtime > outer.eps) return false
                    let fireball = outer.shootFireball(tx, ty)
                    if (outer.playground.mode === 'multi mode')
                        outer.playground.mps.sendShootFireball(tx, ty, fireball.uuid)
                } else if (outer.curSkill === 'blink') {
                    if (outer.blinkColdtime > outer.eps) return false
                    outer.blink(tx, ty)
                    if (outer.playground.mode === 'multi mode') {
                        outer.playground.mps.sendBlink(tx, ty)
                    }
                }

                outer.curSkill = null
            }
        })

        this.playground.gameMap.$canvas.keydown(function (e) {
            if (e.which === 13) { // 回车
                if (outer.playground.mode === 'multi mode') { // 打开聊天框
                    outer.playground.chatField.showInput()
                    return false
                }
            } else if (e.which === 27) { // esc
                if (outer.playground.mode === 'multi mode') { // 关闭聊天框
                    outer.playground.chatField.hideInput()
                    return false
                }
            }


            if (outer.playground.state !== 'fighting') return true

            if (e.which === 81) { // q键
                if (outer.fireballColdtime > outer.eps) return false
                outer.curSkill = 'fireball'
                return false
            } else if (e.which === 70) { // f键
                if (outer.blinkColdtime > outer.eps) return false
                outer.curSkill = 'blink'
                return false
            }
        })
    }

    shootFireball(tx, ty) {
        let x = this.x, y = this.y
        let radius = this.playground.height * 0.01 / this.playground.scale
        let angle = Math.atan2(ty - y, tx - x)
        let vx = Math.cos(angle)
        let vy = Math.sin(angle)
        let color = "orange"
        let speed = this.playground.height * 0.5 / this.playground.scale
        let moveLength = this.playground.height * 1 / this.playground.scale
        let damage = this.playground.height * 0.01 / this.playground.scale
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, speed, color, moveLength, damage)
        this.fireballs.push(fireball)

        this.fireballColdtime = 3
        return fireball
    }

    destroyFireball(ball_uuid) {
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if (fireball.uuid === ball_uuid) {
                fireball.destroy()
                break
            }
        }
    }

    blink(tx, ty) {
        let x = this.x, y = this.y
        let d = this.getDist(x, y, tx, ty)
        d = Math.min(d, 0.8)
        let angle = Math.atan2(ty - y, tx - x)
        let vx = Math.cos(angle)
        let vy = Math.sin(angle)
        this.x += d * vx
        this.y += d * vy
        this.blinkColdtime = 5
        this.moveLength = 0 // 闪现完停下
    }

    getDist(x1, y1, x2, y2) {
        let dx = x1 - x2
        let dy = y1 - y2
        return Math.sqrt(dx * dx + dy * dy)
    }

    move2position(tx, ty) {
        this.moveLength = this.getDist(this.x, this.y, tx, ty)
        let angle = Math.atan2(ty - this.y, tx - this.x)
        this.vx = Math.cos(angle)
        this.vy = Math.sin(angle)

    }

    isAttacked(angle, damage) {
        // 被攻击的粒子效果
        for (let i = 0; i < 20 + Math.random() * 10; i++) {
            let x = this.x, y = this.y
            let radius = this.radius * 0.1 * Math.random()
            let angle = Math.PI * 2 * Math.random()
            let vx = Math.cos(angle), vy = Math.sin(angle)
            let speed = this.speed * 10
            let color = this.color
            let moveLength = this.radius * Math.random() * 10
            new Particle(this.playground, x, y, radius, vx, vy, speed, color, moveLength)
        }

        if (this.radius < this.eps) {
            this.destroy()
            return false
        }
        this.radius -= damage
        this.damageX = Math.cos(angle)
        this.damageY = Math.sin(angle)
        this.damageSpeed = damage * 100
        this.speed *= 0.8
    }

    receiveAttack(x, y, angle, damage, ball_uuid, attacker) {
        attacker.destroyFireball(ball_uuid)
        this.x = x
        this.y = y
        this.isAttacked(angle, damage)
    }

    update() {
        this.spendTime += this.timedelta / 1000
        if (this.character === 'me' && this.playground.state === 'fighting')
            this.updateColdtime()
        this.updateMove()
        this.render()
    }

    updateColdtime() {
        this.fireballColdtime -= this.timedelta / 1000
        this.fireballColdtime = Math.max(this.fireballColdtime, 0)

        this.blinkColdtime -= this.timedelta / 1000
        this.blinkColdtime = Math.max(this.blinkColdtime, 0)
    }

    updateMove() {
        if (this.character === "robot" && this.spendTime > 4 && Math.random() < 1 / 180.0) { // 平均每3s发射一枚炮弹
            let player = null
            for (let i = 0; i < 1000; i++) {
                player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)]
                if (player !== this)
                    break
                player = null
            }
            if (player) {
                let tx = player.x + player.vx * player.speed * 0.3
                let ty = player.y + player.vy * player.speed * 0.3
                this.shootFireball(tx, ty)
            }
        }

        //如果收到攻击，会被弹开，该段时间内，玩家无法操控
        if (this.damageSpeed > this.eps) {
            this.vx = this.vy = 0
            this.moveLength = 0
            this.x += this.damageX * this.damageSpeed * this.timedelta / 1000
            this.y += this.damageY * this.damageSpeed * this.timedelta / 1000
            this.damageSpeed *= this.friction
        } else {
            if (this.moveLength < this.eps) {
                this.moveLength = 0
                this.vx = this.vy = 0
                if (this.character === "robot") {
                    let tx = Math.random() * this.playground.width / this.playground.scale
                    let ty = Math.random() * this.playground.height / this.playground.scale
                    this.move2position(tx, ty)
                }
            } else {
                let moveD = Math.min(this.moveLength, this.speed * this.timedelta / 1000)
                this.x += this.vx * moveD
                this.y += this.vy * moveD
                this.moveLength -= moveD
            }
        }
    }

    render() {
        let scale = this.playground.scale
        if (this.character !== "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath()
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false)
            this.ctx.fillStyle = this.color
            this.ctx.fill()
        }

        if (this.character === 'me' && this.playground.state === 'fighting') {
            this.renderSkillColdtime()
        }
    }

    renderSkillColdtime() {
        let scale = this.playground.scale
        let x = 1.5, y = 0.9, r = 0.04
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireBallImg, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.fireballColdtime > this.eps) {
            this.ctx.beginPath()
            this.ctx.moveTo(x * scale, y * scale)
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireballColdtime / 3) - Math.PI / 2, true)
            this.ctx.lineTo(x * scale, y * scale)
            this.ctx.fillStyle = "rgba(0,0,255,0.5)"
            this.ctx.fill()
        }

        x = 1.62
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blinkImg, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.blinkColdtime > this.eps) {
            this.ctx.beginPath()
            this.ctx.moveTo(x * scale, y * scale)
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blinkColdtime / 5) - Math.PI / 2, true)
            this.ctx.lineTo(x * scale, y * scale)
            this.ctx.fillStyle = "rgba(0,0,255,0.5)"
            this.ctx.fill()
        }
    }

    beforeDestroy() {
        if (this.character === 'me')
            this.playground.state = 'over'
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1)
                break
            }
        }
    }
}class FireBall extends PyGameObject {
    constructor(playground, player, x, y, radius, vx, vy, speed, color, moveLength, damage) {
        super();
        this.playground = playground
        this.ctx = playground.gameMap.ctx
        this.player = player
        this.x = x
        this.y = y
        this.radius = radius
        this.vx = vx
        this.vy = vy
        this.speed = speed
        this.color = color
        this.moveLength = moveLength
        this.damage = damage
        this.eps = 0.01
    }

    start() {
    }

    update() {
        if (this.moveLength < this.eps) {
            this.destroy()
            return false
        }
        this.updateMove()
        if (this.player.character !== 'enemy')
            this.updateAttack()

        this.render()
    }

    updateMove() {
        let moveD = Math.min(this.moveLength, this.speed * this.timedelta / 1000)
        this.x += this.vx * moveD
        this.y += this.vy * moveD
        this.moveLength -= moveD
    }

    updateAttack() {
        // 碰撞检测
        for (let i = 0; i < this.playground.players.length; i++) {
            let player = this.playground.players[i]
            if (this.player !== player && this.isCollision(player)) {
                this.attack(player)
                break
            }
        }
    }

    getDist(x1, y1, x2, y2) {
        let dx = x1 - x2
        let dy = y1 - y2
        return Math.sqrt(dx * dx + dy * dy)
    }

    isCollision(player) {
        let d = this.getDist(this.x, this.y, player.x, player.y)
        return d < this.radius + player.radius
    }

    attack(player) {
        let angle = Math.atan2(player.y - this.y, player.x - this.x)
        player.isAttacked(angle, this.damage)
        if (this.playground.mode === 'multi mode') {
            this.playground.mps.sendAttack(player.uuid, player.x, player.y, angle, this.damage, this.uuid)
        }
        this.destroy()
    }

    render() {
        let scale = this.playground.scale
        this.ctx.beginPath()
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false)
        this.ctx.fillStyle = this.color
        this.ctx.fill()
    }

    beforeDestroy() {
        let fireballs = this.player.fireballs
        for (let i = 0; i < fireballs.length; i++)
            if (fireballs[i] === this) {
                fireballs.splice(i, 1)
                break;
            }
    }
}class MultiPlayerSocket {
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
            } else if (event === 'message') {
                outer.receiveMessage(data.username, data.text)
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

    sendMessage(username, text) {
        let outer = this
        this.ws.send(JSON.stringify({
            'event': 'message',
            'uuid': outer.uuid,
            'username': username,
            'text': text
        }))
    }

    receiveMessage(username, text) {
        this.playground.chatField.addMessage(username, text)
    }


    getPlayer(uuid) {
        let players = this.playground.players
        for (let i = 0; i < players.length; i++)
            if (players[i].uuid === uuid)
                return players[i];
        return null
    }

}class PyGamePlayground {
    constructor(root) {
        this.root = root
        this.mps = null
        this.$playground = $(`
        <div class="py_game_playground">
        </div>
        `)
        this.root.$py_game.append(this.$playground)
        this.hide()

        this.start()
    }

    getRandomColor() {
        let color = ['#eccc68', '#ff6b81', '#70a1ff', '#7bed9f']
        return color[Math.floor(color.length * Math.random())]
    }

    start() {
        let outer = this
        $(window).resize(function () {
            outer.resize()
        })
    }

    // 长宽比 16:9
    resize() {
        this.width = this.$playground.width()
        this.height = this.$playground.height()
        let unit = Math.min(this.width / 16, this.height / 9)
        this.width = unit * 16
        this.height = unit * 9
        this.scale = this.height  // 基准

        if (this.gameMap) this.gameMap.resize()
    }


    show(mode) {
        let outer = this
        this.$playground.show()
        this.mode = mode;
        this.state = 'waiting' // waiting fighting over
        this.resize()
        this.gameMap = new GameMap(this)
        this.noticeBoard = new NoticeBoard(this)
        this.playerCount = 0
        this.players = []
        this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05 / this.scale, "white", this.height * 0.2 / this.scale, "me", this.root.settings.username, this.root.settings.photo))

        if (mode === "single mode") {
            for (let i = 0; i < 5; i++) {
                this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05 / this.scale, this.getRandomColor(), this.height * 0.2 / this.scale, "robot"))
            }
        } else if (mode === "multi mode") {
            this.chatField = new ChatField(this)
            this.mps = new MultiPlayerSocket(this)
            this.mps.uuid = this.players[0].uuid // 每个玩家的ws的uuid等于玩家的uuid，这样可以指明当前的ws是谁
            this.mps.ws.onopen = function () {
                outer.mps.sendCreatePlayer(outer.root.settings.username, outer.root.settings.photo)
            }
        }

    }

    hide() {
        this.$playground.hide()
    }
}
class Settings {
    constructor(root) {
        this.root = root
        this.username = ""
        this.photo = ""

        this.$settings = $(`
        <div class="py_game_settings">
            <div class="py_game_settings_login">
                <div class="py_game_settings_title">
                    登录
                </div>
                <div class="py_game_settings_username">
                    <div class="py_game_settings_item">
                        <input type="text" placeholder="请输入用户名">
                    </div>
                </div>
                <div class="py_game_settings_password">
                    <div class="py_game_settings_item">
                        <input type="password" placeholder="请输入密码">
                    </div>
                </div>
                <div class="py_game_settings_submit">
                    <div class="py_game_settings_item">
                        <button>登录</button>
                    </div>
                </div>
                <div class="py_game_settings_error_message"></div>
                <div class="py_game_settings_option">注册</div>
            </div>
            <div class="py_game_settings_register">
                <div class="py_game_settings_title">
                    注册
                </div>
                <div class="py_game_settings_username">
                    <div class="py_game_settings_item">
                        <input type="text" placeholder="请输入用户名">
                    </div>
                </div>
                <div class="py_game_settings_password py_game_settings_password_first">
                    <div class="py_game_settings_item">
                        <input type="password" placeholder="请输入密码">
                    </div>
                </div>
                <div class="py_game_settings_password py_game_settings_password_second">
                    <div class="py_game_settings_item">
                        <input type="password" placeholder="请确认密码">
                    </div>
                </div>
                <div class="py_game_settings_submit">
                    <div class="py_game_settings_item">
                        <button>注册</button>
                    </div>
                </div>
                <div class="py_game_settings_error_message"></div>
                <div class="py_game_settings_option">登录</div>
            </div>
        </div>
        `)
        this.$login = this.$settings.find(".py_game_settings_login")
        this.$login_username = this.$login.find(".py_game_settings_username input")
        this.$login_password = this.$login.find(".py_game_settings_password input")
        this.$login_submit = this.$login.find(".py_game_settings_submit button")
        this.$login_error_message = this.$login.find(".py_game_settings_error_message")
        this.$login_register = this.$login.find(".py_game_settings_option")

        this.$login.hide()

        this.$register = this.$settings.find(".py_game_settings_register")
        this.$register_username = this.$register.find(".py_game_settings_username input")
        this.$register_password = this.$register.find(".py_game_settings_password_first input")
        this.$register_password_confirm = this.$register.find(".py_game_settings_password_second input")
        this.$register_submit = this.$register.find(".py_game_settings_submit button")
        this.$register_error_message = this.$register.find(".py_game_settings_error_message")
        this.$register_login = this.$register.find(".py_game_settings_option")

        this.$register.hide()

        this.root.$py_game.append(this.$settings)

        this.start()
    }

    start() {
        this.getinfo()
        this.addListeningEvents()
    }

    addListeningEvents() {
        this.addListeningEventLogin()
        this.addListeningEventRegister()
    }

    addListeningEventLogin() {
        let outer = this
        this.$login_register.click(function () { // 登录页面点击注册跳转到注册页面
            outer.register()
        })
        this.$login_submit.click(function () {
            outer.loginOnRemote()
        })
    }

    addListeningEventRegister() {
        let outer = this
        this.$register_login.click(function () { // 注册页面点击登录跳转到登录页面
            outer.login()
        })
        this.$register_submit.click(function () {
            outer.registerOnRemote()
        })
    }

    loginOnRemote() {
        let outer = this
        let username = this.$login_username.val()
        let password = this.$login_password.val()
        this.$login_error_message.empty()
        $.ajax({
            url: "http://moba.chenshone.top/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password
            },
            success(resp) {
                if (resp.result === 'success') {
                    location.reload()
                } else {
                    outer.$login_error_message.html(resp.result)
                }
            }
        })
    }

    registerOnRemote() {
        let outer = this
        let username = this.$register_username.val()
        let password = this.$register_password.val()
        let password_confirm = this.$register_password_confirm.val()
        this.$register_error_message.empty()
        $.ajax({
            url: "http://moba.chenshone.top/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm
            },
            success(resp) {
                if (resp.result === 'success') {
                    location.reload()
                } else {
                    outer.$register_error_message.html(resp.result)
                }
            }
        })
    }

    logoutOnRemote() {
        $.ajax({
            url: "http://moba.chenshone.top/settings/logout/",
            type: "GET",
            success(resp) {
                if (resp.result === 'success') {
                    location.reload()
                }
            }
        })
    }

    getinfo() {
        let outer = this
        $.ajax({
            url: "http://moba.chenshone.top/settings/getinfo",
            type: "GET",
            success: function (resp) {
                if (resp.result === "success") {
                    outer.username = resp.username
                    outer.photo = resp.photo
                    outer.hide()
                    outer.root.menu.show()
                } else {
                    outer.login()
                }
            }
        })
    }

    register() {
        this.$login.hide()
        this.$register.show()
    }

    login() {
        this.$register.hide()
        this.$login.show()
    }

    hide() {
        this.$settings.hide()
    }

    show() {
        this.$settings.show()
    }
}export class PyGame {
    constructor(id) {
        this.id = id
        this.$py_game = $('#' + id)
        this.settings = new Settings(this)
        this.menu = new PyGameMenu(this)
        this.playground = new PyGamePlayground(this)
        this.start()
    }

    start() {
    }
}

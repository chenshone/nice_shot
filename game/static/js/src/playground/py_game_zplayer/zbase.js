class Player extends PyGameObject {
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
            this.fireballColdtime = 2 // 冷却时间 秒
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

        this.fireballColdtime = 2
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

        this.updateWin()
        if (this.character === 'me' && this.playground.state === 'fighting')
            this.updateColdtime()
        this.updateMove()
        this.render()
    }

    updateWin() {
        if (this.playground.state === 'fighting' && this.character === 'me' && this.playground.players.length === 1) {
            this.playground.state = 'over'
            this.playground.scoreBoard.win()
        }
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
        if (this.playground.state === 'fighting' && this.character === 'me') {
            this.playground.state = 'over'
            this.playground.scoreBoard.lose()

        }
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1)
                break
            }
        }
    }
}
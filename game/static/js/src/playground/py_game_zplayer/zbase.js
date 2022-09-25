class Player extends PyGameObject {
    constructor(playground, x, y, radius, color, speed, isMe) {
        super();
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
        this.isMe = isMe
        this.eps = 0.01 // 精度
        // 收到伤害后会被弹出一段距离（此阶段失去控制）
        this.damageX = 0 //方向
        this.damageY = 0
        this.damageSpeed = 0
        this.friction = 0.9 // 摩擦力
        this.curSkill = null
        this.spendTime = 0 // 前5s不能攻击

        if (isMe) {
            this.img = new Image()
            this.img.src = this.playground.root.settings.photo
        }
    }

    start() {
        if (this.isMe) {
            this.addListeningEvents()
        }
    }

    addListeningEvents() {
        let outer = this
        this.playground.gameMap.$canvas.on("contextmenu", function () {
            return false
        })
        this.playground.gameMap.$canvas.on("mousedown", function (e) {
            const rect = outer.ctx.canvas.getBoundingClientRect()
            if (e.which === 3) { // 鼠标右键
                outer.move2position((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale)
            } else if (e.which === 1) { // 鼠标左键
                if (outer.curSkill === 'fireball') {
                    outer.shootFireball((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale)
                }

                outer.curSkill = null
            }
        })

        $(window).keydown(function (e) {
            if (e.which === 81) { // q键
                outer.curSkill = 'fireball'
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
        new FireBall(this.playground, this, x, y, radius, vx, vy, speed, color, moveLength, damage)
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

    update() {
        this.updateMove()
        this.render()
    }

    updateMove() {
        this.spendTime += this.timedelta
        if (!this.isMe && this.spendTime > 5000 && Math.random() < 1 / 180.0) { // 平均每3s发射一枚炮弹
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
                if (!this.isMe) {
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
        if (this.isMe) {
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
    }

    beforeDestroy() {
        for (let i = 0; i < this.playground.players.length; i++) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1)
                break
            }
        }
    }
}
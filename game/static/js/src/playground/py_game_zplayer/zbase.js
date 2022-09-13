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
        this.eps = 0.1 // 精度

        this.curSkill = null
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
            if (e.which === 3) { // 鼠标右键
                outer.move2position(e.clientX, e.clientY)
            } else if (e.which === 1) { // 鼠标左键
                if (outer.curSkill === 'fireball') {
                    outer.shootFireball(e.clientX, e.clientY)
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
        let radius = this.playground.height * 0.01
        let angle = Math.atan2(ty - y, tx - x)
        let vx = Math.cos(angle)
        let vy = Math.sin(angle)
        let color = "orange"
        let speed = this.playground.height * 0.5
        let moveLength = this.playground.height * 1
        new FireBall(this.playground, this, x, y, radius, vx, vy, speed, color, moveLength)
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

    update() {
        if (this.moveLength < this.eps) {
            this.moveLength = 0
            this.vx = this.vy = 0
        } else {
            let moveD = Math.min(this.moveLength, this.speed * this.timedelta / 1000)
            this.x += this.vx * moveD
            this.y += this.vy * moveD
            this.moveLength -= moveD
        }
        this.render()
    }

    render() {
        this.ctx.beginPath()
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        this.ctx.fillStyle = this.color
        this.ctx.fill()
    }
}
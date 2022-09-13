class FireBall extends PyGameObject {
    constructor(playground, player, x, y, radius, vx, vy, speed, color, moveLength) {
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
        this.eps = 0.1
    }

    start() {
    }

    update() {
        if (this.moveLength < this.eps) {
            this.destroy()
            return false
        }
        let moveD = Math.min(this.moveLength, this.speed * this.timedelta / 1000)
        this.x += this.vx * moveD
        this.y += this.vy * moveD
        this.moveLength -= moveD
        this.render()
    }

    render() {
        this.ctx.beginPath()
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        this.ctx.fillStyle = this.color
        this.ctx.fill()
    }
}
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
        this.eps = 1
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
        this.ctx.beginPath()
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        this.ctx.fillStyle = this.color
        this.ctx.fill()
    }
}
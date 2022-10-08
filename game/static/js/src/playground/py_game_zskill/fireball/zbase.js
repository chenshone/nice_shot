class FireBall extends PyGameObject {
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
}
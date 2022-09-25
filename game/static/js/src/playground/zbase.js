class PyGamePlayground {
    constructor(root) {
        this.root = root
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


    show() {
        this.$playground.show()
        this.resize()
        this.gameMap = new GameMap(this)
        this.players = []
        this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05 / this.scale, "white", this.height * 0.2 / this.scale, true))

        for (let i = 0; i < 5; i++) {
            this.players.push(new Player(this, this.width / 2 / this.scale, this.height / 2 / this.scale, this.height * 0.05 / this.scale, this.getRandomColor(), this.height * 0.2 / this.scale, false))
        }

    }

    hide() {
        this.$playground.hide()
    }
}

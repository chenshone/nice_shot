class PyGamePlayground {
    constructor(root) {
        this.root = root
        this.$playground = $(`
        <div class="py_game_playground">
        </div>
        `)
        this.hide()

        this.start()
    }

    getRandomColor() {
        let color = ['#eccc68', '#ff6b81', '#70a1ff', '#7bed9f']
        return color[Math.floor(color.length * Math.random())]
    }

    start() {
    }


    show() {
        this.$playground.show()
        this.root.$py_game.append(this.$playground)

        this.width = this.$playground.width()
        this.height = this.$playground.height()

        this.gameMap = new GameMap(this)
        this.players = []
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.2, true))

        for (let i = 0; i < 5; i++) {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.getRandomColor(), this.height * 0.2, false))

        }

    }

    hide() {
        this.$playground.hide()
    }
}

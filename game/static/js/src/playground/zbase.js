class PyGamePlayground {
    constructor(root) {
        this.root = root
        this.$playground = $(`
        <div class="py_game_playground">
        </div>
        `)
        // this.hide()
        this.root.$py_game.append(this.$playground)

        this.width = this.$playground.width()
        this.height = this.$playground.height()

        this.gameMap = new GameMap(this)
        this.players = []
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.2, true))


        this.start()
    }

    start() {
        this.add_listening_events()
    }

    add_listening_events() {
        let outer = this

    }

    show() {
        this.$playground.show()
    }

    hide() {
        this.$playground.hide()
    }
}

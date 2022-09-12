class PyGamePlayground {
    constructor(root) {
        this.root = root
        this.$playground = $(`
        <div class="py_game_playground">
            游戏界面
        </div>
        `)
        this.hide()
        this.root.$py_game.append(this.$playground)

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
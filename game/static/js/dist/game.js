class PyGameMenu {
    constructor(root) {
        this.root = root
        this.$menu = $(`
        <div class="py_game_menu">
            <div class="py_game_menu_filed">
                <div class="py_game_menu_filed_item py_game_menu_filed_item_single_mode">
                单人模式
                </div>
                <br>
                <div class="py_game_menu_filed_item py_game_menu_filed_item_multi_mode">
                多人模式
                </div>
                <br>
                <div class="py_game_menu_filed_item py_game_menu_filed_item_settings">
                设置
                </div>
            </div>
        </div>
        `)
        this.root.$py_game.append(this.$menu)

        this.$single_mode = this.$menu.find('.py_game_menu_filed_item_single_mode')
        this.$multi_mode = this.$menu.find('.py_game_menu_filed_item_multi_mode')
        this.$settings = this.$menu.find('.py_game_menu_filed_item_settings')
        this.start()
    }

    start() {
        this.add_listening_events()
    }

    add_listening_events() {
        let outer = this
        this.$single_mode.click(function () {
            outer.hide()
            outer.root.playground.show()
        })
        this.$multi_mode.click(function () {
            console.log("click multi mode")
        })
        this.$settings.click(function () {
            console.log("click settings")
        })
    }

    show() {
        this.$menu.show()
    }

    hide() {
        this.$menu.hide()
    }
}
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
export class PyGame {
    constructor(id) {
        this.id = id
        this.$py_game = $('#' + id)
        this.menu = new PyGameMenu(this)
        this.playground = new PyGamePlayground(this)
        this.start()
    }

    start() {
    }
}

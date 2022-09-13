export class PyGame {
    constructor(id) {
        this.id = id
        this.$py_game = $('#' + id)
        // this.menu = new PyGameMenu(this)
        this.playground = new PyGamePlayground(this)
        this.start()
    }

    start() {
    }
}

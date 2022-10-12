export class PyGame {
    constructor(id, access, refresh) {
        this.id = id
        this.access = access
        this.refresh = refresh
        this.$py_game = $('#' + id)
        this.settings = new Settings(this)
        this.menu = new PyGameMenu(this)
        this.playground = new PyGamePlayground(this)
        this.start()
    }

    start() {
    }
}

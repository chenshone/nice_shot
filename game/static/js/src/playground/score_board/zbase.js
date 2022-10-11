class ScoreBoard extends PyGameObject {
    constructor(playground) {
        super();
        this.playground = playground
        this.ctx = playground.gameMap.ctx
        this.state = null // win / lose

        this.win_img = new Image()
        this.win_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_8f58341a5e-win.png"
        this.lose_img = new Image()
        this.lose_img.src = "https://cdn.acwing.com/media/article/image/2021/12/17/1_9254b5f95e-lose.png"
    }

    start() {
    }

    addListeningEvents() {
        let outer = this
        let $canvas = this.playground.gameMap.$canvas

        $canvas.on('click', function () {
            outer.playground.hide()
            outer.playground.root.menu.show()
        })
    }

    win() {
        this.state = 'win'

        let outer = this
        setTimeout(function () {
            outer.addListeningEvents()
        }, 1000)
    }

    lose() {
        this.state = 'lose'

        let outer = this
        setTimeout(function () {
            outer.addListeningEvents()
        }, 1000)
    }

    lateUpdate() {
        this.render()
    }

    render() {
        let len = this.playground.height / 2
        if (this.state === 'win') {
            this.ctx.drawImage(this.win_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len)
        } else if (this.state === 'lose') {
            this.ctx.drawImage(this.lose_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len)
        }
    }
}
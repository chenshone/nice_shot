class ChatField {
    constructor(playground) {
        this.playground = playground

        this.$history = $(`<div class="py_game_chat_field_history"></div>`)
        this.$input = $(`<input type="text" class="py_game_chat_field_input">`)

        this.$history.hide()
        this.$input.hide()

        this.fieldTimer = null

        this.playground.$playground.append(this.$history)
        this.playground.$playground.append(this.$input)

        this.start()
    }

    start() {
        this.addListeningEvent()
    }

    addListeningEvent() {
        let outer = this
        this.$input.keydown(function (e) {
            if (e.which === 27) { // esc
                outer.hideInput()
                return false
            } else if (e.which === 13) {
                let username = outer.playground.root.settings.username
                let text = outer.$input.val()
                if (text) {
                    outer.$input.val("")
                    outer.addMessage(username, text)
                    outer.playground.mps.sendMessage(username, text)
                }
                return false
            }
        })
    }

    renderMessage(message) {
        return $(`<div>${message}</div>`)
    }

    addMessage(username, text) {
        this.showHistory()
        let message = `[${username}]${text}`
        this.$history.append(this.renderMessage(message))
        this.$history.scrollTop(this.$history[0].scrollHeight)
    }

    showHistory() {
        let outer = this
        this.$history.fadeIn()

        if (this.fieldTimer) clearTimeout(this.fieldTimer)

        this.fieldTimer = setTimeout(function () {
            outer.$history.fadeOut()
            outer.fieldTimer = null
        }, 3000)
    }

    showInput() {
        this.showHistory()
        this.$input.show()
        this.$input.focus()
    }

    hideInput() {
        this.$input.hide()
        this.playground.gameMap.$canvas.focus()
    }
}
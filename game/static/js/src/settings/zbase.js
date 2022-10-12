class Settings {
    constructor(root) {
        this.root = root
        this.username = ""
        this.photo = ""

        this.$settings = $(`
        <div class="py_game_settings">
            <div class="py_game_settings_login">
                <div class="py_game_settings_title">
                    登录
                </div>
                <div class="py_game_settings_username">
                    <div class="py_game_settings_item">
                        <input type="text" placeholder="请输入用户名">
                    </div>
                </div>
                <div class="py_game_settings_password">
                    <div class="py_game_settings_item">
                        <input type="password" placeholder="请输入密码">
                    </div>
                </div>
                <div class="py_game_settings_submit">
                    <div class="py_game_settings_item">
                        <button>登录</button>
                    </div>
                </div>
                <div class="py_game_settings_error_message"></div>
                <div class="py_game_settings_option">注册</div>
            </div>
            <div class="py_game_settings_register">
                <div class="py_game_settings_title">
                    注册
                </div>
                <div class="py_game_settings_username">
                    <div class="py_game_settings_item">
                        <input type="text" placeholder="请输入用户名">
                    </div>
                </div>
                <div class="py_game_settings_password py_game_settings_password_first">
                    <div class="py_game_settings_item">
                        <input type="password" placeholder="请输入密码">
                    </div>
                </div>
                <div class="py_game_settings_password py_game_settings_password_second">
                    <div class="py_game_settings_item">
                        <input type="password" placeholder="请确认密码">
                    </div>
                </div>
                <div class="py_game_settings_submit">
                    <div class="py_game_settings_item">
                        <button>注册</button>
                    </div>
                </div>
                <div class="py_game_settings_error_message"></div>
                <div class="py_game_settings_option">登录</div>
            </div>
        </div>
        `)
        this.$login = this.$settings.find(".py_game_settings_login")
        this.$login_username = this.$login.find(".py_game_settings_username input")
        this.$login_password = this.$login.find(".py_game_settings_password input")
        this.$login_submit = this.$login.find(".py_game_settings_submit button")
        this.$login_error_message = this.$login.find(".py_game_settings_error_message")
        this.$login_register = this.$login.find(".py_game_settings_option")

        this.$login.hide()

        this.$register = this.$settings.find(".py_game_settings_register")
        this.$register_username = this.$register.find(".py_game_settings_username input")
        this.$register_password = this.$register.find(".py_game_settings_password_first input")
        this.$register_password_confirm = this.$register.find(".py_game_settings_password_second input")
        this.$register_submit = this.$register.find(".py_game_settings_submit button")
        this.$register_error_message = this.$register.find(".py_game_settings_error_message")
        this.$register_login = this.$register.find(".py_game_settings_option")

        this.$register.hide()

        this.root.$py_game.append(this.$settings)

        this.start()
    }

    start() {
        if (this.root.access) {
            this.getinfo()
            this.refresh_jwt_token()
        } else {
            this.login()
        }
        this.addListeningEvents()
    }

    refresh_jwt_token() {
        setInterval(() => {
            $.ajax({
                url: "http://moba.chenshone.top/settings/token/refresh/",
                type: "post",
                data: {
                    'refresh': this.root.refresh
                },
                success: (resp) => {
                    this.root.access = resp.access
                }
            })
        }, 4.5 * 60 * 1000)
    }

    addListeningEvents() {
        this.addListeningEventLogin()
        this.addListeningEventRegister()
    }

    addListeningEventLogin() {
        let outer = this
        this.$login_register.click(function () { // 登录页面点击注册跳转到注册页面
            outer.register()
        })
        this.$login_submit.click(function () {
            outer.loginOnRemote()
        })
    }

    addListeningEventRegister() {
        let outer = this
        this.$register_login.click(function () { // 注册页面点击登录跳转到登录页面
            outer.login()
        })
        this.$register_submit.click(function () {
            outer.registerOnRemote()
        })
    }

    loginOnRemote(username, password) {
        let outer = this
        username = username || this.$login_username.val()
        password = password || this.$login_password.val()
        this.$login_error_message.empty()
        $.ajax({
            url: "http://moba.chenshone.top/settings/token/",
            type: "post",
            data: {
                username: username,
                password: password
            },
            success(resp) {
                outer.root.access = resp.access
                outer.root.refresh = resp.refresh
                outer.getinfo()
                outer.refresh_jwt_token()
            },
            error: resp => {
                this.$login_error_message.html("用户名或密码错误")
            }
        })
    }

    registerOnRemote() {
        let outer = this
        let username = this.$register_username.val()
        let password = this.$register_password.val()
        let password_confirm = this.$register_password_confirm.val()
        this.$register_error_message.empty()
        $.ajax({
            url: "http://moba.chenshone.top/settings/register/",
            type: "post",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm
            },
            success(resp) {
                if (resp.result === 'success') {
                    outer.loginOnRemote(username, password)
                } else {
                    outer.$register_error_message.html(resp.result)
                }
            }
        })
    }

    logoutOnRemote() {
        this.root.access = ""
        this.root.refresh = ""
        location.href = "/"
    }

    getinfo() {
        let outer = this
        $.ajax({
            url: "http://moba.chenshone.top/settings/getinfo",
            type: "GET",
            headers: {
                'Authorization': 'Bearer ' + this.root.access
            },
            success: function (resp) {
                if (resp.result === "success") {
                    outer.username = resp.username
                    outer.photo = resp.photo
                    outer.hide()
                    outer.root.menu.show()
                } else {
                    outer.login()
                }
            }
        })
    }

    register() {
        this.$login.hide()
        this.$register.show()
    }

    login() {
        this.$register.hide()
        this.$login.show()
    }

    hide() {
        this.$settings.hide()
    }

    show() {
        this.$settings.show()
    }
}
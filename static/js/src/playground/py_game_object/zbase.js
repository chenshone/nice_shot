let py_game_objects = []

class PyGameObject {
    constructor() {
        py_game_objects.push(this)
        this.hasCalledStart = false;
        this.timedelta = 0 // 当前帧距离上一帧的时间间隔
    }

    start() { // 只会在第一帧执行一次
    }

    update() { // 每一帧都执行一次
    }

    beforeDestroy() { // 在销毁前执行一次

    }

    destroy() {
        this.beforeDestroy()
        for (let i = 0; i < py_game_objects.length; i++) {
            if (py_game_objects[i] === this) {
                py_game_objects.splice(i, 1)
                break
            }
        }
    }
}

let lastTimestamp
let py_game_animation = function (timestamp) {
    for (let i = 0; i < py_game_objects.length; i++) {
        let obj = py_game_objects[i]
        if (!obj.hasCalledStart) {
            obj.start()
            obj.hasCalledStart = true;
        } else {
            obj.timedelta = timestamp - lastTimestamp
            obj.update()
        }
    }
    lastTimestamp = timestamp

    requestAnimationFrame(py_game_animation)
}

requestAnimationFrame(py_game_animation)

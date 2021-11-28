var game = {
    data: [], //存放数据
    score: 0, //分数
    status: 0, //当前状态，时刻的监听，时刻的需要改变      游戏运行中的状态，结束的状态
    gameover: 0,
    gamerunning: 1,


    // 开始游戏的方法
    start: function() {
        this.score = 0;
        this.data = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ]
        this.status = this.gamerunning;
        this.randomNum()
        this.randomNum()
        this.dataView()
    },
    // 随机数的方法
    randomNum: function() {
        for (;;) {
            var r = Math.floor(Math.random() * 4);
            var c = Math.floor(Math.random() * 4);
            if (this.data[r][c] == 0) {
                var num = Math.random() > 0.2 ? 2 : 4;
                this.data[r][c] = num;
                break;
            }
        }
    },
    // 更新的视图
    dataView: function() {
        for (var r = 0; r < 4; r++) {
            for (var c = 0; c < 4; c++) {
                var div = document.getElementById('c' + r + c);
                if (this.data[r][c] != 0) {
                    div.innerHTML = this.data[r][c];
                    div.className = 'cell n' + this.data[r][c]
                } else {
                    div.innerHTML = ''
                    div.className = 'cell'
                }
            }
        }
        document.getElementById('score01').innerHTML = this.score; //设置游戏分数

        // 监测游戏状态
        if (this.status == this.gameover) {
            document.getElementById('score02').innerHTML = this.score;
            document.getElementsByClassName('gameover')[0].style.display = 'block'
        } else {
            document.getElementsByClassName('gameover')[0].style.display = 'none'
        }
    },
    // 判断游戏是否结束的方法   游戏没结束返回false 结束返回true
    isgameover: function() {
        for (var r = 0; r < 4; r++) {
            for (var c = 0; c < 4; c++) {
                // 没有结束，三种情况：：1.数组中还有0 2.左右相邻的有相同的  3.上下相邻有相同的
                if (this.data[r][c] == 0) {
                    return false
                }
                if (c < 3) {
                    if (this.data[r][c] == this.data[r][c + 1]) {
                        return false
                    }
                }
                if (r < 3) {
                    if (this.data[r][c] == this.data[r + 1][c]) {
                        return false
                    }
                }
            }
        }
        return true; //表示游戏已经结束
    },
    // 左移动
    moveLeft: function() {
        var before = String(this.data) //移动之前
            //处理移动的逻辑

        for (var r = 0; r < 4; r++) {
            this.moveLeftInRow(r);
        }

        var after = String(this.data) //移动之后
        if (before != after) {
            this.randomNum()
            if (this.isgameover()) {
                this.status = this.gameover;
            }
            this.dataView()
        }
    },
    moveLeftInRow: function(r) { //单独处理每一行的逻辑
        // 0200   2000
        // 0220   4000
        // 2202   4200
        // 2222   4022  4202  4220   4400
        for (var c = 0; c < 3; c++) {
            var nextc = this.getNextInRow(r, c);
            if (nextc != -1) {
                if (this.data[r][c] == 0) {
                    this.data[r][c] = this.data[r][nextc];
                    this.data[r][nextc] = 0;
                    c--;
                } else if (this.data[r][c] == this.data[r][nextc]) {
                    this.data[r][c] *= 2;
                    this.score += this.data[r][c]
                    this.data[r][nextc] = 0
                }
            } else {
                break;
            }
        }
    },
    getNextInRow: function(r, c) {
        for (var i = c + 1; i < 4; i++) {
            if (this.data[r][i] != 0) {
                return i
            }
        }
        return -1;
    },

    // 右移动
    moveRight: function() {
        var before = String(this.data) //移动之前
        for (var r = 3; r >= 0; r--) {
            this.moveRightInRow(r);
        }
        var after = String(this.data) //移动之后
        if (before != after) {
            this.randomNum()
            if (this.isgameover()) {
                this.status = this.gameover;

            }
            this.dataView()
        }
    },
    moveRightInRow: function(r) { //单独处理每一行的逻辑
        for (var c = 3; c >= 0; c--) {
            var nextc = this.getNextInRowa(r, c);
            if (nextc != -1) {
                if (this.data[r][c] == 0) {
                    this.data[r][c] = this.data[r][nextc];
                    this.data[r][nextc] = 0;
                    c++;
                } else if (this.data[r][c] == this.data[r][nextc]) {
                    this.data[r][c] *= 2;
                    this.score += this.data[r][c]
                    this.data[r][nextc] = 0
                }
            } else {
                break;
            }
        }
    },
    getNextInRowa: function(r, c) {
        for (var i = c - 1; i >= 0; i--) {
            if (this.data[r][i] != 0) {
                return i
            }
        }
        return -1;
    },
    // 上移动
    moveTop: function() {
        var before = String(this.data) //移动之前
        for (var c = 0; c < 4; c++) {
            this.moveTopInRow(c);
        }
        var after = String(this.data) //移动之后
        if (before != after) {
            this.randomNum()
            if (this.isgameover()) {
                this.status = this.gameover;

            }
            this.dataView()
        }
    },
    moveTopInRow: function(c) { //单独处理每一列的逻辑
        for (var r = 0; r < 3; r++) {
            var nextr = this.getNextInRowaa(r, c);
            if (nextr != -1) {
                if (this.data[r][c] == 0) {
                    this.data[r][c] = this.data[nextr][c];
                    this.data[nextr][c] = 0;
                    r--;
                } else if (this.data[r][c] == this.data[nextr][c]) {
                    this.data[r][c] *= 2;
                    this.score += this.data[r][c]
                    this.data[nextr][c] = 0
                }
            } else {
                break;
            }
        }
    },
    getNextInRowaa: function(r, c) {
        for (var i = r + 1; i < 4; i++) {
            if (this.data[i][c] != 0) {
                return i
            }
        }
        return -1;
    },
    // 下移动
    moveButtom: function() {
        var before = String(this.data) //移动之前
        for (var c = 3; c >= 0; c--) {
            this.moveButtomInRow(c);
        }
        var after = String(this.data) //移动之后
        if (before != after) {
            this.randomNum()
            if (this.isgameover()) {
                this.status = this.gameover;

            }
            this.dataView()
        }
    },
    moveButtomInRow: function(c) { //单独处理每一列的逻辑
        for (var r = 3; r >= 0; r--) {
            var nextr = this.getNextInRowaaa(r, c);
            if (nextr != -1) {
                if (this.data[r][c] == 0) {
                    this.data[r][c] = this.data[nextr][c];
                    this.data[nextr][c] = 0;
                    r++;
                } else if (this.data[r][c] == this.data[nextr][c]) {
                    this.data[r][c] *= 2;
                    this.score += this.data[r][c]
                    this.data[nextr][c] = 0
                }
            } else {
                break;
            }
        }
    },
    getNextInRowaaa: function(r, c) {
        for (var i = r - 1; i >= 0; i--) {
            if (this.data[i][c] != 0) {
                return i
            }
        }
        return -1;
    },

}


game.start()



document.onkeydown = function(e) {
    if (e.keyCode == 37) {
        game.moveLeft()
    }
    if (e.keyCode == 39) {
        game.moveRight()
    }
    if (e.keyCode == 38) {
        game.moveTop()
    }
    if (e.keyCode == 40) {
        game.moveButtom()
    }
}
zai = function() {
    game.start()

}

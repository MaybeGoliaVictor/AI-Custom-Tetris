class Tetris {
    constructor(width, height) {
        this.board = []

        //makes a board of the right size
        for (let n = 0; n < height; n++) {
            this.board[n] = []

            for (let i = 0; i < width; i++) {
                this.board[n].push(0)
            }
        }

        this.level = 0
        //level 0 speed
        this.currentSpeed = speeds[0]
        this.score = 0
        this.linesCleared = 0
        this.shape = new Piece(Math.round(this.board[0].length / 2), 0, 0, randomType(0))
        //adjusts the spawn location so the piece spawns in as high as possible
        this.shapeStartingY = 0
        this.spawnAdjustment()
        this.nextShape = randomType(1)
        this.shapeIterator = 1

        //used to get the delay for when the player can still move the piece once it's hit the blocks
        this.iterationBuffer = false

    }

    //check line clears, checks game over
    checksLineClearing(board) {

        //Line clearing stuff
        let rowsCleared = []
        for (let row = board.length - 1; row > -1; row--) {
            let lineBlocksTotal = 0
            for (let col = 0; col < board[row].length; col++) {
                if (board[row][col] != 0) {
                    lineBlocksTotal++
                }
            }
            //whole row is filled
            if (lineBlocksTotal == board[0].length) {
                rowsCleared.push(row)
            }
        }
        //clear all of the lines needing clearing
        for (let i = 0; i < rowsCleared.length; i++) {
            board[rowsCleared[i]] = Array(board[0].length).fill(0)
        }

        //move blocks down
        for (let i = 0; i < rowsCleared.length; i++) {
            for (let row = rowsCleared[0]; row > 0; row--) {
                for (let col = 0; col < board[row].length; col++) {
                    if (board[row - 1][col] != 0) {
                        board[row][col] = board[row - 1][col]
                        board[row - 1][col] = 0
                    }
                }
            }
        }

        return [board, rowsCleared.length]
    }

    nextIteration(player) {

        if (player == "player") {
            //check if piece can move down, if it can't give one iteration period to rotate or move it,
            let canMoveDown = this.shape.newPosValidOnBoard(this.shape.x, this.shape.y + 1, this.shape.type, this.shape.rotation, this.board)

            if (canMoveDown == true) {
                this.shape.moveDown(this.board)
                this.iterationBuffer = false
            }
            else if (this.iterationBuffer == false) {
                this.iterationBuffer = true
            }
            else {
                this.iterationBuffer = false
                if (this.nextTurn() == "gameover") {
                    return "gameover"
                }
                else {
                    return true
                }

            }
        }
        else if (player == "AI") {
            //AI is like this since all the moving down is handled by the path it gets from it's path finding
            return (this.nextTurn())
        }



    }


    nextTurn() {

        //put all the blocks of the piece on the board
        for (let i = 0; i < shapeConfigurations[this.shape.type][this.shape.rotation].length; i++) {
            this.board[this.shape.y + shapeConfigurations[this.shape.type][this.shape.rotation][i][1]][this.shape.x + shapeConfigurations[this.shape.type][this.shape.rotation][i][0]] = this.shape.colour
        }

        this.shape.type = this.nextShape
        this.shape.x = Math.round(this.board[0].length / 2)
        this.shape.y = 0
        this.shape.rotation = 0
        this.shape.colour = shapeColours[this.nextShape]
        this.shape.shape = shapeConfigurations[this.nextShape]

        this.nextShape = randomType(this.shapeIterator)
        this.shapeIterator++

        let newBoardAndRowsCleared = this.checksLineClearing(this.board)

        this.board = newBoardAndRowsCleared[0]
        let rowsCleared = newBoardAndRowsCleared[1]
        this.linesCleared += rowsCleared
        // level changing, speed changing
        this.level = (Math.floor(this.linesCleared / 10))
        if (this.level < speeds.length - 1) {
            this.currentSpeed = speeds[this.level]
        }


        // updating the score
        if (rowsCleared > 0) {
            this.score += pointsPerNumOfLines[rowsCleared - 1] * (this.level + 1)
        }

        //since a piece has been spawned in, need to adjust it's spawn location so it spawns as high as possilbe, also
        //check if it's gameover
        return (this.spawnAdjustment())


    }

    //check if next piece can spawn, and if it can change it's y to the correct y value for it to spawn in
    spawnAdjustment() {

        //positions of the shape and rotation = 0
        let blockRelativePositions = this.shape.shape[0]

        let counter = -2
        for (let y = -2; y < 2; y++) {
            //checks if a block of the piece is in an illegal position
            //if it is, then check the next y, else spawn it there
            for (let blockNum = 0; blockNum < this.shape.shape[0].length; blockNum++) {
                if (this.board[blockRelativePositions[blockNum][1] + y] == undefined || this.board[blockRelativePositions[blockNum][1] + y][blockRelativePositions[blockNum][0] + this.shape.x] != 0) {
                    counter++
                    break
                }
            }
            //if the y value is allowed for the piece then set it
            if (counter == y) {
                this.shape.y = y
                //so the AI can later adjust it's path values after it's pathfinding
                if (y < 0) {
                    this.shapeStartingY = y
                }
                else {
                    this.shapeStartingY = 0
                }
                return false
            }
        }

        //if there is no where to spawn it
        return "gameover"
    }

}
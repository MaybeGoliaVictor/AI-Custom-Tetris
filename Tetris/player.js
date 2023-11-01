
//defined in PlayerVsAi.js, is the p5 instance for the player
let playerp5;



let player = function (p) {

    p.setup = function () {

        p.canvas = p.createCanvas(p.windowWidth / 2 - p.windowWidth / 10, p.windowHeight - p.windowHeight / 10 - p.windowHeight / 10)
        p.background(100)

        p.frameRate(60)

        p.canvas.parent("Player Canvas")

        p.nextTurn;

        p.tetris = new Tetris(userData.profiles[selectedProfile].boardWidth, userData.profiles[selectedProfile].boardHeight)

    }

    p.draw = function () {

        p.render()

        //moves it down at the right time
        if (p.frameCount % p.tetris.currentSpeed == 0) {
            p.nextTurn = p.tetris.nextIteration("player")


            if (p.nextTurn == "gameover") {
                playerAlive = false

                p.fill(0, 0, 0, 100)
                p.rect(0, 0, p.width, p.height)

                p.noLoop()


                if (AIAlive == false) {
                    if (AItetrisp5.AI.tetris.score > p.tetris.score) {
                        let loseScreen = document.getElementById("loseScreen")
                        loseScreen.className = loseScreen.className.replace("disable", "")

                    }
                    else {
                        let winScreen = document.getElementById("winScreen")
                        winScreen.className = winScreen.className.replace("disable", "")

                    }

                    playerAlive = true
                    AIAlive = true
                }
            }

        }


        //so you can hold keys down
        if (p.keyIsPressed == true) {
            if ((p.frameCount - p.frameKeyPressed[40]) % 2 == 0 && p.keysDown.includes(40)) {
                p.executeMovement("down")
            }
            if ((p.frameCount - p.frameKeyPressed[37]) == 16 || (p.frameCount - p.frameKeyPressed[39]) == 16 && (p.keysDown.includes(37) || p.keysDown.includes(39))) {
                p.executeMovement("side")
            }
            else if (((p.frameCount - p.frameKeyPressed[37]) > 16 && (p.frameCount - p.frameKeyPressed[37] - 16) % 6 == 0 && p.keysDown.includes(37)) || ((p.frameCount - p.frameKeyPressed[39]) > 16 && (p.frameCount - p.frameKeyPressed[39] - 16) % 6 == 0 && p.keysDown.includes(39))) {
                p.executeMovement("side")
            }
        }


    }

    // Stores the number of frames each key has been pressed
    p.frameKeyPressed = {
        //Down Arrow
        40: 0,
        //Left Arrow
        37: 0,
        //Right Arrow
        39: 0,
        // ","
        90: 0,
        // "."
        88: 0
    }

    //keys that are currently pressed
    p.keysDown = []


    //is triggered when any key is pressed
    p.keyPressed = function () {
        // use this to get the correct Delayed Auto Shift for NES Tetris
        p.frameKeyPressed[p.keyCode] = p.frameCount
        p.keysDown.push(p.keyCode)
        p.executeMovement("any")
    }

    //is triggered when any key is released
    p.keyReleased = function () {
        if (p.frameKeyPressed[p.keyCode] != null && p.keyIsDown(p.keyCode) == false) {
            p.frameKeyPressed[p.keyCode] = 0
            p.keysDown = p.keysDown.filter((keyBeingReleased) => { return keyBeingReleased != p.keyCode })
        }

        //stops default browser behaviour
        return false
    }

    p.executeMovement = function (direction) {
        if (direction == "side" || direction == "any" && !(p.keysDown.includes(37) && p.keysDown.includes(39))) {
            if (p.keysDown.includes(37)) {
                p.tetris.shape.moveSideways(p.tetris.board, -1)
            }
            else if (p.keysDown.includes(39)) {
                p.tetris.shape.moveSideways(p.tetris.board, 1)
            }
        }
        //down
        if (direction == "down" || direction == "any") {
            if (p.keysDown.includes(40)) {
                p.tetris.shape.moveDown(p.tetris.board)
            }
        }

        if (direction == "any") {
            if (p.keysDown.includes(90)) {
                p.tetris.shape.rotateAntiClockwise(p.tetris.board)
            }
            else if (p.keysDown.includes(88)) {
                p.tetris.shape.rotateClockwise(p.tetris.board)
            }
        }
    }

    p.render = function () {
        p.background(30)
        let sideLength;

        let boardHeight = p.tetris.board.length
        let boardWidth = p.tetris.board[0].length
        let fraction =  1 / Math.sqrt(2)
        let textMarginX = p.width * fraction + p.width*(1-fraction)* 1/40
        let textMarginY = p.width*(1-fraction)* 1/10 + 10

        let labelSize = 17
        let numberSize = 35

        let nextShape = shapeConfigurations[p.tetris.nextShape][0]
        let nextShapeColour = shapeColours[p.tetris.nextShape]
        let nextBoxSize = 100
        let x = p.width*(1+fraction)/2-nextBoxSize/2
        let y = textMarginY + 65

        if (p.height / boardHeight < p.width * fraction / boardWidth) {
            sideLength = p.height / boardHeight

            p.fill(0)
            p.noStroke()
            p.rect((p.width*fraction - boardWidth*sideLength)/2, 0, boardWidth*sideLength, p.height)

            p.fill(27)
            p.rect(p.width * fraction, 0, p.width * (1-fraction), p.height)

            //render shape
            p.tetris.shape.render((p.width*fraction - boardWidth*sideLength)/2, 0, sideLength, p)

            //render blocks on the board
            for (let row = 0; row < p.tetris.board.length; row++) {
                for (let col = 0; col < p.tetris.board[row].length; col++) {
                    if (p.tetris.board[row][col] != 0) {
                        p.fill(p.tetris.board[row][col])

                        p.rect(col * sideLength + (p.width*fraction - boardWidth*sideLength)/2, row * sideLength, sideLength, sideLength)
                    }

                }
            }
        }
        else {
            sideLength = p.width * fraction / boardWidth

            p.fill(0)
            p.noStroke()
            p.rect(0, (p.height - boardHeight*sideLength) / 2, p.width * fraction, boardHeight*sideLength)

            p.fill(27)
            //height is to match where the controls go to
            p.rect(p.width * fraction, 0, p.width * (1-fraction), p.height)

            //render shape
            p.tetris.shape.render(0, (p.height - boardHeight*sideLength) / 2, sideLength, p)

            //render blocks on the board
            for (let row = 0; row < p.tetris.board.length; row++) {
                for (let col = 0; col < p.tetris.board[row].length; col++) {
                    if (p.tetris.board[row][col] != 0) {
                        p.fill(p.tetris.board[row][col])

                        p.rect(col * sideLength, row * sideLength + (p.height - boardHeight*sideLength)/2, sideLength, sideLength)
                    }
                }
            }
        }

        p.fill(220)
        p.textStyle(p.BOLD);
        p.textSize(32.75);
        p.textAlign(p.CENTER, p.TOP)
        p.text("PLAYER", p.width*(1+fraction)/2, textMarginY-10);
        p.fill(200)

        p.textSize(labelSize);
        p.textStyle(p.BOLD);
        p.text(`Next`, p.width*(1+fraction)/2, textMarginY + 65-3.5-5-labelSize);

        p.push()
        p.fill(0)
        p.strokeWeight(7)
        p.stroke(50)
        p.rect(x-3.5, y-3.5, nextBoxSize+7, nextBoxSize+7)
        p.pop()

        p.push()
        p.fill(nextShapeColour)
        for (let i = 0; i < nextShape.length; i++) {
            p.rect(x+nextBoxSize/2 + nextShape[i][0]*nextBoxSize/4, y+nextBoxSize/2 + nextShape[i][1]*nextBoxSize/4, nextBoxSize/4, -nextBoxSize/4)
        }
        p.pop()

        p.textAlign(p.LEFT)

        p.textSize(labelSize);
        p.textStyle(p.BOLD);
        p.text(`Score`, textMarginX, textMarginY+nextBoxSize + 90);

        p.textSize(numberSize);
        p.textStyle(p.NORMAL);
        p.text(`${p.tetris.score}`, textMarginX, textMarginY+nextBoxSize + 95+labelSize);

        p.textSize(labelSize);
        p.textStyle(p.BOLD);
        p.text(`Lines Cleared`, textMarginX, textMarginY+nextBoxSize + 110+labelSize+numberSize);

        p.textSize(numberSize);
        p.textStyle(p.NORMAL);
        p.text(`${p.tetris.linesCleared}`, textMarginX, textMarginY+nextBoxSize + 115+labelSize*2+numberSize);

        p.textSize(labelSize);
        p.textStyle(p.BOLD);
        p.text(`Level`, textMarginX, textMarginY+nextBoxSize + 130+labelSize*2+numberSize*2);
        
        p.textSize(numberSize);
        p.textStyle(p.NORMAL);
        p.text(`${p.tetris.level}`, textMarginX, textMarginY+nextBoxSize + 135+labelSize*3+numberSize*2);

        p.textSize(labelSize-4);
        p.textStyle(p.BOLD);
        p.text("Controls:", textMarginX,textMarginY+nextBoxSize + 150 +labelSize*3+numberSize*3);
        p.text("z - Rotate Anticlockwise", textMarginX,textMarginY+nextBoxSize + 160 +labelSize*4+numberSize*3);
        p.text("x - Rotate Clockwise", textMarginX,textMarginY+nextBoxSize + 170 +labelSize*5+numberSize*3);
        p.text("Left Arrow - Move Left", textMarginX,textMarginY+nextBoxSize + 180 +labelSize*6+numberSize*3);
        p.text("Right Arrow - Move Left", textMarginX,textMarginY+nextBoxSize + 190 +labelSize*7+numberSize*3);
        p.text("Down Arrow - Move Down", textMarginX,textMarginY+nextBoxSize + 200 +labelSize*8+numberSize*3);
    }
}
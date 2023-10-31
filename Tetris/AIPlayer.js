

//number of frames taken for the piece to go down depending on the level
const speeds = [48, 43, 38, 33, 28, 23, 18, 13, 8, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1]

//number the score is increased by depending on how many rows are cleared
const pointsPerNumOfLines = [40, 100, 300, 1200]

p5.disableFriendlyErrors = true;

//defined in firebase.js once userData has been loaded in
let shapeKeys;

//defined before the AIPlayer canvas and the player canvas are created
//has the shapes of the current selected profile, and their colours

//wether the they have gameovered
let playerAlive = true
let AIAlive = true

//defined in PlayerVsAi.js, is the p5 instance for the AI
let AItetrisp5;

let onAIDeath = () => {
    if (AItetrisp5.AI.tetris.score > playerp5.tetris.score) {
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


let randomnessCheck = {}
let seed = Math.random()
//To give the player and the AI the same pieces for a long time
function randomType(a) {
    let x = 0
    for (let i = 1; i < 10; i++) {
        x += 2 / Math.PI * Math.asin(Math.sin(2 * i * a * seed * 10))
    }
    x -= Math.floor(x)

    if (randomnessCheck[shapeKeys[Math.round(x * (shapeKeys.length - 1))]] == undefined) {
        randomnessCheck[shapeKeys[Math.round(x * (shapeKeys.length - 1))]] = 0
    }
    randomnessCheck[shapeKeys[Math.round(x * (shapeKeys.length - 1))]]++

    return shapeKeys[Math.round(x * (shapeKeys.length - 1))]
}
shapeKeys = ['I', 'T', 'L', 'J', 'S', 'Z', 'O']
for (let i = 1; i < 100001; i++) {
    randomType(i)
}


//p5 definition of the AI
let AItetris = (p) => {
    p.setup = () => {
        p.canvas = p.createCanvas(p.windowWidth / 2 - p.windowWidth / 10, p.windowHeight - p.windowHeight / 10 - p.windowHeight / 10)
        p.setFrameRate(60)

        p.background(50)

        p.canvas.parent("AI Canvas")

        p.worker = new Worker('../WorkerScripts/AIDecision.js')
        p.pathReady = false;
        p.worker.addEventListener('message', (e) => {
            let data = e.data
            switch (data.cmd) {
                case 'pathReady':
                    p.pathReady = true
                    break;
                case 'setPath':
                    AItetrisp5.AI.nextPath = data.path
                    if (data.shapeStartingY != undefined) {
                        AItetrisp5.AI.tetris.startingShapeY = data.shapeStartingY;
                    }
                    AItetrisp5.AI.moveStep = 0;
                    p.pathReady = false
                    if (data.path != false) {
                        p.worker.postMessage({ cmd: 'startPathProcessing', tetris: AItetrisp5.AI.tetris, weights: AItetrisp5.AI.weights, shapeConfigurations, nextPiece: randomType(AItetrisp5.AI.tetris.shapeIterator) })
                    }
                    break;
            }
        })

        p.AI = new AI({
            bumpinessHigher: 8.9321615376483994,
            bumpinessLower: 7.8509095609952055,
            holesHigher: 4.0629747316612992,
            holesLower: 5.3195723511101844,
            linesClearedHigher: 7.586259925607157,
            linesClearedLower: 0.26355695583632377
        },
            userData.profiles[selectedProfile].boardWidth,
            userData.profiles[selectedProfile].boardHeight
        )

        p.worker.postMessage({ cmd: 'startPathProcessing', tetris: p.AI.tetris, weights: p.AI.weights, shapeConfigurations })
        p.firstTimeThru = true;

        //so the AI can move at the right speed
        p.frameDecision = p.frameCount

        p.render()

    }

    p.draw = function () {
        //resizeCanvas(100, 200)

        if (p.firstTimeThru == true && p.pathReady == true) {
            p.firstTimeThru = false;
            p.worker.postMessage({ cmd: 'getPath' })
        }

        //if the AI has reached the end of the path
        if (p.AI.moveStep == p.AI.nextPath.length && p.AI.nextPath.length != 0 && p.pathReady == true && p.firstTimeThru == false) {

            //check next iteration, and check if it's gameover
            let nextTurn = p.AI.tetris.nextIteration("AI")

            //get next move and set moveStep to 0
            p.worker.postMessage({ cmd: 'getPath' })
            p.pathReady = false;

            p.frameDecision = p.frameCount

            if (nextTurn == "gameover") {
                p.noLoop()
                p.worker.terminate();
                AIAlive = false
                p.AI.nextPath = undefined
                p.render()
                //gray out the canvas
                p.fill(0, 0, 0, 100)
                p.rect(0, 0, p.width, p.height)

                if (playerAlive == false) {
                    onAIDeath()
                }
            }

            if (playerAlive == false && p.AI.tetris.score > playerp5.tetris.score) {
                p.render()
                onAIDeath()
            }

        }

        if (p.AI != undefined && p.AI.nextPath != undefined && p.AI.nextPath.length != 0 && p.firstTimeThru == false) {
            //move to next part of the path if it's been the correct number of frames for sideways and/or downwards
            p.AI.actOnDecision(p.frameCount, p.frameDecision)
            p.render()
        }
    }


    p.render = function () {
        p.background(30)
        let sideLength;

        let boardHeight = p.AI.tetris.board.length
        let boardWidth = p.AI.tetris.board[0].length
        let fraction =  1 / Math.sqrt(2)
        let textMarginX = p.width * fraction + p.width*(1-fraction)* 1/10
        let textMarginY = p.width*(1-fraction)* 1/10 + 10

        let labelSize = 17
        let numberSize = 35

        let nextShape = shapeConfigurations[p.AI.tetris.nextShape][0]
        let nextShapeColour = shapeColours[p.AI.tetris.nextShape]
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
            p.AI.tetris.shape.render((p.width*fraction - boardWidth*sideLength)/2, 0, sideLength, p)

            //render blocks on the board
            for (let row = 0; row < p.AI.tetris.board.length; row++) {
                for (let col = 0; col < p.AI.tetris.board[row].length; col++) {
                    if (p.AI.tetris.board[row][col] != 0) {
                        p.fill(p.AI.tetris.board[row][col])

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
            p.AI.tetris.shape.render(0, (p.height - boardHeight*sideLength) / 2, sideLength, p)

            //render blocks on the board
            for (let row = 0; row < p.AI.tetris.board.length; row++) {
                for (let col = 0; col < p.AI.tetris.board[row].length; col++) {
                    if (p.AI.tetris.board[row][col] != 0) {
                        p.fill(p.AI.tetris.board[row][col])

                        p.rect(col * sideLength, row * sideLength + (p.height - boardHeight*sideLength)/2, sideLength, sideLength)
                    }
                }
            }
        }

        p.fill(220)
        p.textStyle(p.BOLD);
        p.textSize(32.75);
        p.textAlign(p.CENTER, p.TOP)
        p.text("AI PLAYER", p.width*(1+fraction)/2, textMarginY-10);
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
        p.text(`${p.AI.tetris.score}`, textMarginX, textMarginY+nextBoxSize + 95+labelSize);

        p.textSize(labelSize);
        p.textStyle(p.BOLD);
        p.text(`Lines Cleared`, textMarginX, textMarginY+nextBoxSize + 110+labelSize+numberSize);

        p.textSize(numberSize);
        p.textStyle(p.NORMAL);
        p.text(`${p.AI.tetris.linesCleared}`, textMarginX, textMarginY+nextBoxSize + 115+labelSize*2+numberSize);

        p.textSize(labelSize);
        p.textStyle(p.BOLD);
        p.text(`Level`, textMarginX, textMarginY+nextBoxSize + 130+labelSize*2+numberSize*2);
        
        p.textSize(numberSize);
        p.textStyle(p.NORMAL);
        p.text(`${p.AI.tetris.level}`, textMarginX, textMarginY+nextBoxSize + 135+labelSize*3+numberSize*2);
    }

}


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
    if (AItetrisp5.AI.tetris.score > playerp5.tetris.score){
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
function randomType(a){
    let x = 0
    for (let i = 1; i < 10; i++) {
        x += 2/Math.PI * Math.asin(Math.sin(2*i*a*seed*10))
    }
    x -= Math.floor(x)

    if (randomnessCheck[shapeKeys[Math.round(x * (shapeKeys.length-1))]] == undefined) {
        randomnessCheck[shapeKeys[Math.round(x * (shapeKeys.length-1))]] = 0
    }
    randomnessCheck[shapeKeys[Math.round(x * (shapeKeys.length-1))]]++

    return shapeKeys[Math.round(x * (shapeKeys.length-1))]
}
shapeKeys = ['I', 'T', 'L', 'J', 'S', 'Z', 'O']
for (let i = 1; i < 100001; i++) {
    randomType(i)
  }
  console.log(randomnessCheck)


//p5 definition of the AI
let AItetris = (p) => {
    p.setup = () => {
        p.canvas = p.createCanvas(p.windowWidth/2 - p.windowWidth/10, p.windowHeight - p.windowHeight/10 - p.windowHeight/10)
        p.setFrameRate(60)

        p.background(50)

        p.canvas.parent("AI Canvas")

        p.worker = new Worker('../WorkerScripts/AIDecision.js')
        p.pathReady = false;
        p.worker.addEventListener('message', (e) => {
            let data = e.data
            switch(data.cmd) {
                case 'pathReady':
                    p.pathReady = true
                    break;
                case 'setPath':
                    // if (pathReady == true) {
                        AItetrisp5.AI.nextPath = data.path
                        if (data.shapeStartingY != undefined) {
                            AItetrisp5.AI.tetris.startingShapeY = data.shapeStartingY;
                        }
                        AItetrisp5.AI.moveStep = 0;
                        p.pathReady = false
                        if (data.path != false) {
                            p.worker.postMessage({cmd: 'startPathProcessing', tetris: AItetrisp5.AI.tetris, weights: AItetrisp5.AI.weights, shapeConfigurations, nextPiece: randomType(AItetrisp5.AI.tetris.shapeIterator)})
                        }
                    // }
                    break;
                case 'gameover':
                    onAIDeath()
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

        p.worker.postMessage({cmd: 'startPathProcessing', tetris: p.AI.tetris, weights: p.AI.weights, shapeConfigurations})
        p.firstTimeThru = true;
        //so it has a decision ready before entering the loop and can enter one of the if statements
        // p.AI.update()
        
        //so the AI can move at the right speed
        p.frameDecision = p.frameCount


        p.render()

    }

    p.draw = function(){
        //resizeCanvas(100, 200)
        
        if (p.firstTimeThru == true && p.pathReady == true) {
            p.firstTimeThru = false;
            p.worker.postMessage({cmd: 'getPath'})
            // pathReady = false;
        }

        //if the AI has reached the end of the path
        if (p.AI.moveStep == p.AI.nextPath.length && p.AI.nextPath.length != 0 && p.pathReady == true && p.firstTimeThru == false) {

            //check next iteration, and check if it's gameover
            let nextTurn = p.AI.tetris.nextIteration("AI")

            //get next move and set moveStep to 0
            p.worker.postMessage({cmd: 'getPath'})
            p.pathReady = false;

            p.frameDecision = p.frameCount
            
            if (nextTurn == "gameover"){
                p.noLoop()
                p.worker.terminate();
                AIAlive = false
                p.AI.nextPath = undefined

                //gray out the canvas
                p.fill(0,0,0, 100)
                p.rect(0,0, p.width, p.height)

                if (playerAlive == false){
                    onAIDeath()
                    
                }
            }

            if (playerAlive == false && p.AI.tetris.score > playerp5.tetris.score){
                onAIDeath()
            }
            
        }

        if (p.AI != undefined && p.AI.nextPath != undefined && p.AI.nextPath.length != 0 && p.firstTimeThru == false) {
            //move to next part of the path if it's been the correct number of frames for sideways and/or downwards
            p.AI.actOnDecision(p.frameCount, p.frameDecision)
            p.render()
        }
    }


    p.render = function (){
        p.background(30)
        let sideLength;

        if ((p.height*7/10)/p.AI.tetris.board.length < (p.width*7/10)/p.AI.tetris.board[0].length){
            sideLength = (p.height*7/10)/p.AI.tetris.board.length
            p.fill(0)
            p.noStroke()
            p.rect(0,0, (p.height*7/10)/p.AI.tetris.board.length * p.AI.tetris.board[0].length, p.height*7/10)

            p.fill(27)
            p.rect(0, p.height*7/10, p.width, p.height*3/10)

            p.fill(220)
            p.textStyle(p.BOLD);
            p.textSize(20);
            p.text("AI PLAYER", 30, p.height*7/10 + 22);
            p.fill(200)
            p.textSize(12);
            p.text(`Score: ${p.AI.tetris.score}`, 30, p.height*8/10);
            p.text(`Lines Cleared: ${p.AI.tetris.linesCleared}`, 110, p.height*8/10);
            p.text(`Level: ${p.AI.tetris.level}`, 30, p.height*8/10 + 12);


        }
        else {
            sideLength = (p.width*7/10)/p.AI.tetris.board[0].length
            p.fill(0)
            p.noStroke()
            p.rect(0,0, p.width*7/10, (p.width*7/10)/p.AI.tetris.board[0].length * p.AI.tetris.board.length)

            p.fill(27)
            //height is to match where the controls go to
            p.rect(p.width*7/10, 0, p.width*3/10, p.height)

            p.fill(220)
            p.textStyle(p.BOLD);
            p.textSize(20);
            p.text("AI PLAYER", p.width*7.5/10, 30);
            p.fill(200)
            p.textSize(12);
            p.text(`Score: ${p.AI.tetris.score}`, p.width*7.5/10, 60);
            p.text(`Lines Cleared: ${p.AI.tetris.linesCleared}`, p.width*7.5/10, 80);
            p.text(`Level: ${p.AI.tetris.level}`, p.width*7.5/10, 100);

    
        }



            
            //render shape
            p.AI.tetris.shape.render(0, 0, sideLength, p)

            //render blocks on the board
            for (let row = 0; row < p.AI.tetris.board.length; row++) {
                for (let col = 0; col < p.AI.tetris.board[row].length; col++) {
                    if (p.AI.tetris.board[row][col] != 0){
                        p.fill(p.AI.tetris.board[row][col])
                        
                        p.rect(col * sideLength, row * sideLength, sideLength, sideLength)
                    }

                }
            }
    }

}
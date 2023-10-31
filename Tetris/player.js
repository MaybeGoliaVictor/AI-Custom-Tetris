
//defined in PlayerVsAi.js, is the p5 instance for the player
let playerp5;



let player = function(p) {

    p.setup = function(){

        p.canvas = p.createCanvas(p.windowWidth/2 - p.windowWidth/10, p.windowHeight - p.windowHeight/10 - p.windowHeight/10)
        p.background(100)

        p.frameRate(60)

        p.canvas.parent("Player Canvas")

        p.nextTurn;

        p.tetris = new Tetris(userData.profiles[selectedProfile].boardWidth, userData.profiles[selectedProfile].boardHeight)

    }

    p.draw = function(){

        p.render()

        //moves it down at the right time
        if (p.frameCount % p.tetris.currentSpeed == 0){
            p.nextTurn = p.tetris.nextIteration("player")


            if (p.nextTurn == "gameover"){                
                playerAlive = false

                p.fill(0,0,0, 100)
                p.rect(0,0, p.width, p.height)

                p.noLoop()


                if (AIAlive == false){
                    if (AItetrisp5.AI.tetris.score > p.tetris.score){
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
            if ((p.frameCount - p.frameKeyPressed[40]) % 2 == 0 && p.keysDown.includes(40)){
                p.executeMovement("down")
            }
            if ((p.frameCount - p.frameKeyPressed[37]) == 16 || (p.frameCount - p.frameKeyPressed[39]) == 16 && (p.keysDown.includes(37) || p.keysDown.includes(39))) {
                p.executeMovement("side")
            }
            else if (((p.frameCount - p.frameKeyPressed[37]) > 16 && (p.frameCount - p.frameKeyPressed[37] - 16)% 6 == 0 && p.keysDown.includes(37)) || ((p.frameCount - p.frameKeyPressed[39]) > 16 && (p.frameCount - p.frameKeyPressed[39] - 16)% 6 == 0 && p.keysDown.includes(39))){
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
p.keyPressed = function() {
    // use this to get the correct Delayed Auto Shift for NES Tetris
    p.frameKeyPressed[p.keyCode] = p.frameCount
    p.keysDown.push(p.keyCode)
    p.executeMovement("any")
}

//is triggered when any key is released
p.keyReleased = function(){
    if (p.frameKeyPressed[p.keyCode] != null && p.keyIsDown(p.keyCode) == false){
        p.frameKeyPressed[p.keyCode] = 0
        p.keysDown = p.keysDown.filter((keyBeingReleased) => {return keyBeingReleased != p.keyCode})
    }

    //stops default browser behaviour
    return false
}

p.executeMovement = function(direction){
    if (direction == "side" || direction == "any" && !(p.keysDown.includes(37) && p.keysDown.includes(39))){
        if (p.keysDown.includes(37)){
            p.tetris.shape.moveSideways(p.tetris.board, -1)
        }
        else if (p.keysDown.includes(39)){
            p.tetris.shape.moveSideways(p.tetris.board, 1)
        }
    }
    //down
    if (direction == "down" || direction == "any"){
        if (p.keysDown.includes(40)){
            p.tetris.shape.moveDown(p.tetris.board)
        }
    }

    if (direction == "any"){
        if (p.keysDown.includes(90)){
            p.tetris.shape.rotateAntiClockwise(p.tetris.board)
        }
        else if (p.keysDown.includes(88)){
            p.tetris.shape.rotateClockwise(p.tetris.board)
        }
    }
}

p.render = function (){
    p.background(30)
    let sideLength;

    if ((p.height*7/10)/p.tetris.board.length < (p.width*7/10)/p.tetris.board[0].length){
        sideLength = (p.height*7/10)/p.tetris.board.length
        p.fill(0)
        p.noStroke()
        p.rect(0,0, (p.height*7/10)/p.tetris.board.length * p.tetris.board[0].length, p.height*7/10)

        p.fill(27)
        p.rect(0, p.height*7/10, p.width, p.height*3/10)

        p.fill(220)
        p.textStyle(p.BOLD);
        p.textSize(20);
        p.text("PLAYER", 30, p.height*7/10 + 22);
        p.fill(200)
        p.textSize(12);
        p.text(`Score: ${p.tetris.score}`, 30, p.height*8/10);
        p.text(`Lines Cleared: ${p.tetris.linesCleared}`, 110, p.height*8/10);
        p.text(`Level: ${p.tetris.level}`, 30, p.height*8/10 + 12);
        p.text("Controls:", 110, p.height*8/10 + 13);
        p.text("z - Rotate Anticlockwise", 110, p.height*8/10 + 24);
        p.text("x - Rotate Clockwise", 110, p.height*8/10 + 35);
        p.text("Left Arrow - Move Left", 110, p.height*8/10 + 46);
        p.text("Right Arrow - Move Left", 110, p.height*8/10 + 57);
        p.text("Down Arrow - Move Down", 110, p.height*8/10 + 68);

    }
    else {
        sideLength = (p.width*7/10)/p.tetris.board[0].length
        p.fill(0)
        p.noStroke()
        p.rect(0,0, p.width*7/10, (p.width*7/10)/p.tetris.board[0].length * p.tetris.board.length)

        p.fill(27)
        //height is to match where the controls go to
        p.rect(p.width*7/10, 0, p.width*3/10, p.height)
        
        p.fill(220)
        p.textStyle(p.BOLD);
        p.textSize(20);
        p.text("PLAYER", p.width*7.25/10, 30);
        p.fill(200)
        p.textSize(12);
        p.text(`Score: ${p.tetris.score}`, p.width*7.25/10, 60);
        p.text(`Lines Cleared: ${p.tetris.linesCleared}`, p.width*7.25/10, 80);
        p.text(`Level: ${p.tetris.level}`, p.width*7.25/10, 100);
        p.text("Controls:", p.width*7.25/10, 140);
        p.text(", - Rotate Anticlockwise", p.width*7.25/10, 160);
        p.text(". - Rotate Clockwise", p.width*7.25/10, 180);
        p.text("Left Arrow - Move Left", p.width*7.25/10, 200);
        p.text("Right Arrow - Move Left", p.width*7.25/10, 220);
        p.text("Down Arrow - Move Down", p.width*7.25/10, 240);

       
    }


        p.fill(0)
        p.noStroke()


        //render current piece
        p.tetris.shape.render(0, 0, sideLength, p)

        //render blocks already on the board
        for (let row = 0; row < p.tetris.board.length; row++) {
            for (let col = 0; col < p.tetris.board[row].length; col++) {
                if (p.tetris.board[row][col] != 0){
                    p.fill(p.tetris.board[row][col])
                    
                    p.rect(col * sideLength, row * sideLength, sideLength, sideLength)
                }

            }
        }
}

}
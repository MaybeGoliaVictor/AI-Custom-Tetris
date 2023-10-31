let PATH = undefined;
let SHAPE_STARTING_Y = 0;

self.addEventListener('message', (e) => {
    let data = e.data
    switch(data.cmd) {
        case 'startPathProcessing':
            if (PATH != undefined) {
                data.tetris.shape.x = PATH[PATH.length-1].x
                data.tetris.shape.y = PATH[PATH.length-1].y + data.tetris.shapeStartingY
                data.tetris.shape.rotation = PATH[PATH.length-1].rotation
                for (let block = 0; block < data.shapeConfigurations[data.tetris.shape.type][data.tetris.shape.rotation].length; block++) {
                    data.tetris.board[data.tetris.shape.y + data.shapeConfigurations[data.tetris.shape.type][data.tetris.shape.rotation][block][1]][data.tetris.shape.x + data.shapeConfigurations[data.tetris.shape.type][data.tetris.shape.rotation][block][0]] = [255,255,255]
                }
                data.tetris.board = checksLineClearing(data.tetris.board)[0];

                data.tetris.shape.type = data.tetris.nextShape
                data.tetris.shape.x = Math.round(data.tetris.board[0].length/2)
                data.tetris.shape.y = 0
                data.tetris.shape.rotation = 0
                data.tetris.shape.shape = data.shapeConfigurations[data.tetris.nextShape]
                data.tetris.nextShape = data.nextPiece
                spawnAdjustment(data.tetris)
                SHAPE_STARTING_Y = data.tetris.shapeStartingY;
            }
            PATH = allPossibleLandingLocationsEvaluation(data.tetris, data.weights, data.shapeConfigurations)
            SHAPE_STARTING_Y = data.tetris.shapeStartingY;
            self.postMessage({cmd: 'pathReady'})

        break; 
        case 'getPath':
            let path = []
            for (let i = 0; i < PATH.length; i++) {
                path.push({x: PATH[i].x, y: PATH[i].y, rotation: PATH[i].rotation})
            }
            if (PATH != undefined) {
                self.postMessage({cmd: 'setPath', path, shapeStartingY: SHAPE_STARTING_Y})
            }
            else {
                self.postMessage({cmd: 'setPath', path})
            }
        break;
    }
})

function createXYNavigationBoard(board, y, type, shapeConfigurations) {
    let boards = []
    let shape = shapeConfigurations[type]
    //make it value instead of reference
    board = JSON.parse(JSON.stringify(board))

    //the starting y value is not 0 sometimes because the relative position of the blocks is based on 2nd row 3rd column of the 4 by 4 shape grid
    //meaning it needs to be moved so the 2nd row 3rd column is on the board while keeping the blocks all in the same relative position
    if (y < 0){
        for (let i = 0; i < Math.abs(y); i++) {
            board.unshift((new Array(board[0].length).fill(0)))   
        }
    }
    if (y > 0){
        board.push((new Array(board[0].length).fill(0)))
    }


    //same thing as for the y above, but for the x
    let onlyRightHandSide = true
    for (let r = 0; r < shape.length; r++) {
        for (let blockNum = 0; blockNum < shape[r].length; blockNum++) {
                if (shape[r][blockNum][0] != 1) {
                    onlyRightHandSide = false
                    break;
                }
        }
        if (onlyRightHandSide == false) {
            break;
        }
    }

    //helps with efficiency later, slightly advantages for performance for it to be a 1 instead of an array
    for (let row = 0; row < board.length; row++) {
        if (onlyRightHandSide == true) {
            board[row].unshift(0)
        }
        for (let col = 0; col < board[row].length; col++) {
            if(board[row][col] instanceof Array){
                board[row][col] = 1
            }
        }
    }

    let objectLocations = []
    //makes the parts of the board which would be inaccessible for 2nd row 3rd column due to the other blocks in the 4 by 4 grid equal to 2
    //also makes different boards for different rotations as different spaces would be accessible through different rotations
    for (let rotation = 0; rotation < shape.length; rotation++) {
        boards.push(JSON.parse(JSON.stringify(board)))
        for (let row = 0; row < boards[rotation].length; row++) {
            for (let col = 0; col < boards[rotation][row].length; col++) {
                for (let blockNum = 0; blockNum < shape[rotation].length; blockNum++) {
                    if (boards[rotation][row + shape[rotation][blockNum][1]] != undefined){
                        if (((boards[rotation][row + shape[rotation][blockNum][1]][col + shape[rotation][blockNum][0]] == undefined || boards[rotation][row + shape[rotation][blockNum][1]][col + shape[rotation][blockNum][0]] == 1) && boards[rotation][row][col] != 1)){
                            boards[rotation][row][col] = 2
                        }
                    }
                    else {
                        for (let col2 = 0; col2 < boards[rotation][row].length; col2++) {
                            if (boards[rotation][row][col2] != 1) {
                                boards[rotation][row][col2] = 2
                            }
                        }
                    }
                }
            }
        }
    }

    for (let rotation = 0; rotation < shape.length; rotation++) {
        for (let row = 0; row < boards[rotation].length; row++) {
            for (let col = 0; col < boards[rotation][row].length; col++) {
                if(boards[rotation][row][col] == 0) {
                    boards[rotation][row][col] = {x: col, y: row, rotation: rotation, f: 0, g: 0, h: 0, neighbors: [], active: true}
                    objectLocations.push({col, row, rotation})
                }
            }
        }
    }

    //adds references for each squares neighbours, with the rotations being modularly layered on top of each other
    for (let i = 0; i < objectLocations.length; i++) {
        let o = objectLocations[i];
        if(boards[o.rotation][o.row][o.col] instanceof Object){
            if(boards[o.rotation][o.row-1] != undefined  && boards[o.rotation][o.row-1][o.col] instanceof Object ){
                boards[o.rotation][o.row][o.col].neighbors.push(boards[o.rotation][o.row-1][o.col])
            }
            if(boards[o.rotation][o.row][o.col+1] != undefined  && boards[o.rotation][o.row][o.col+1] instanceof Object ){
                boards[o.rotation][o.row][o.col].neighbors.push(boards[o.rotation][o.row][o.col+1])
            }
            if(boards[o.rotation][o.row][o.col-1] != undefined && boards[o.rotation][o.row][o.col-1] instanceof Object ){
                boards[o.rotation][o.row][o.col].neighbors.push(boards[o.rotation][o.row][o.col-1])
            }
            if(boards[(o.rotation+1 + shape.length)%shape.length][o.row][o.col] != undefined  && (o.rotation+1 + shape.length)%shape.length != o.rotation && boards[(o.rotation+1 + shape.length)%shape.length][o.row][o.col] instanceof Object){
                boards[o.rotation][o.row][o.col].neighbors.push(boards[(o.rotation+1 + shape.length)%shape.length][o.row][o.col])
            }
            if(boards[(o.rotation-1 + shape.length)%shape.length][o.row][o.col] != undefined && o.rotation != (o.rotation-1 + shape.length)%shape.length && boards[(o.rotation-1 + shape.length)%shape.length][o.row][o.col] instanceof Object){
                boards[o.rotation][o.row][o.col].neighbors.push(boards[(o.rotation-1 + shape.length)%shape.length][o.row][o.col])
            }
        }
    }

    return {boards, onlyRightHandSide}
}

//Evaluates every possible move for the current shape on the board, and then evaluates all the possible moves with the next shape afterwards, the evaluation gives a score, 
//and then it picks the move with the highest score
function allPossibleLandingLocationsEvaluation(tetris, weights, shapeConfigurations){
    // Data Structure: {score: , x: , y: , rotation: }
    let ScoreOfXYRotation = []

    //makes it not a reference, but rather the value
    let board = JSON.parse(JSON.stringify(tetris.board)) 
    
    let bumpiness = getBumpiness(tetris.board)
    let holes = getHoleCount(tetris.board)

    let lowestColValue = Infinity
    let highestColValue = 0;
    let colHeight = 0
    for (let col = 0; col < board[0].length; col++) {
        colHeight = getColHeight(col,board)
        if(lowestColValue > colHeight){
            lowestColValue = colHeight
        }
        if(highestColValue < colHeight){
            highestColValue = colHeight
        }
    }

    //loops through all possible moves, the -2's and the +1 and +2 is just cause the relative position of the blocks is based on 2nd row 3rd column of the 4 by 4 shape grid
    for (let row = board.length - highestColValue -2; row < board.length - lowestColValue + 2; row++) {
        for (let col = -1; col < board[0].length + 2; col++) {
            for (let rotation = 0; rotation < shapeConfigurations[tetris.shape.type].length; rotation++) {
                if(newPosValidOnBoard(col, row+1, tetris.shape.type, rotation, board, shapeConfigurations) == false && newPosValidOnBoard(col, row, tetris.shape.type, rotation, board, shapeConfigurations) == true){
                    for (let block = 0; block < shapeConfigurations[tetris.shape.type][rotation].length; block++) {
                        board[row + shapeConfigurations[tetris.shape.type][rotation][block][1]][col + shapeConfigurations[tetris.shape.type][rotation][block][0]] = 1
                    }

                    let newBoardAndRowsCleared = checksLineClearing(board)
                    ScoreOfXYRotation.push({score: calculateFitnessForMove(newBoardAndRowsCleared[0], highestColValue, bumpiness, holes, newBoardAndRowsCleared[1], weights), x: col, y: row, rotation: rotation})
                    board = JSON.parse(JSON.stringify(tetris.board))
                }
            }
        }
    }

    //repeats the same thing with the next piece
    for (let i = 0; i <= ScoreOfXYRotation.length; i++) {
        if(ScoreOfXYRotation[i] != undefined){

            //places current piece on board in position
            for (let block = 0; block < shapeConfigurations[tetris.shape.type][ScoreOfXYRotation[i].rotation].length; block++) {
                board[ScoreOfXYRotation[i].y + shapeConfigurations[tetris.shape.type][ScoreOfXYRotation[i].rotation][block][1]][ScoreOfXYRotation[i].x + shapeConfigurations[tetris.shape.type][ScoreOfXYRotation[i].rotation][block][0]] = 1
            }
        
            board = checksLineClearing(board)[0]

            let savingBoard = JSON.parse(JSON.stringify(board))
            let bestScore = -Infinity;

            //loops through all possible moves for next piece, the -2's and the +1 and +2 is just cause the relative position of the blocks is based on 2nd row 3rd column of the 4 by 4 shape grid
            for (let row = -2; row < board.length + 2; row++) {
                for (let col = -1; col < board[0].length + 2; col++) {
                    for (let rotation = 0; rotation < shapeConfigurations[tetris.nextShape].length; rotation++) {
                        if(newPosValidOnBoard(col, row+1, tetris.nextShape, rotation, board, shapeConfigurations) == false && newPosValidOnBoard(col, row, tetris.nextShape, rotation, board, shapeConfigurations) == true){

                            for (let block = 0; block < shapeConfigurations[tetris.nextShape][rotation].length; block++) {
                                board[row + shapeConfigurations[tetris.nextShape][rotation][block][1]][col + shapeConfigurations[tetris.nextShape][rotation][block][0]] = 1
                            }
                        
                            let newBoardAndRowsCleared = checksLineClearing(board)

                            let moveScore = calculateFitnessForMove(newBoardAndRowsCleared[0], highestColValue, bumpiness, holes, newBoardAndRowsCleared[1], weights)
                            if (bestScore < moveScore){
                                bestScore = moveScore
                            }

                            board = JSON.parse(JSON.stringify(savingBoard))
                        }
                    }
                }
            }
            ScoreOfXYRotation[i].score += bestScore
            board = JSON.parse(JSON.stringify(tetris.board))
        }
        else {
            break
        }
    }

    //sort them in terms of the highest scores
    let temp = []
    let swapped = true
    //bubble sort
    while(swapped == true){
        swapped = false
        for (let i = 1; i < ScoreOfXYRotation.length; i++) {
            if (ScoreOfXYRotation[i].score > ScoreOfXYRotation[i-1].score){
                //swap the elements in the array
                temp = ScoreOfXYRotation[i-1]
                ScoreOfXYRotation[i-1] = ScoreOfXYRotation[i]
                ScoreOfXYRotation[i] = temp
                swapped = true
            }
        }
    }

    board = null
    
    let path;
    //goes through ScoreOfXYRotation until it finds a move to which it is possible for the AI to move the piece to, and then returns the path
    let {boards, onlyRightHandSide} = this.createXYNavigationBoard(tetris.board, tetris.shape.y, tetris.shape.type, shapeConfigurations);
    for (let i = 0; i < ScoreOfXYRotation.length; i++) {
        path = AStarPathFinding(boards, ScoreOfXYRotation[i].x, ScoreOfXYRotation[i].y, ScoreOfXYRotation[i].rotation, Math.round(tetris.board[0].length/2), tetris.shape.y, 0, onlyRightHandSide, tetris.currentSpeed)
        if (path != false && path != undefined){
            break;
        }
    }
    boards = null;
    return path;
    
}

//finds a possible path for a tetris piece on a board, starting at a specific x,y, rotation, to a different spot and/or rotation
function AStarPathFinding(boards, x, y, initRotation, endX, endY, endRotation, onlyRightHandSide, currentSpeed){

    if (y < 0){
        endY += Math.abs(y)
        y = 0
    }

    if (onlyRightHandSide == true) {
        x += 1
        endX += 1
    }

    let openSet = []
    let closedSet = []
    let path = []

    //starts the search at the starting position
    if(boards[initRotation][y][x] != 1 && boards[initRotation][y][x] != 2){
        openSet.push(boards[initRotation][y][x])
    }

    
    //A* search
    while(openSet.length > 0){
        let lowestFscoreIndex = 0
        for (let i = 0; i < openSet.length; i++) {
            if(openSet[i].active == true){
                if(openSet[i].f < openSet[lowestFscoreIndex].f){
                    lowestFscoreIndex = i
                }
            }
        }

        //start at the closest square to the end position that is a neighbour of a square that's been checked
        let current = openSet[lowestFscoreIndex]

        //to limit the most number of squares the AI can move a piece sideways
        let temp = current
        let sideWaysPotentialperFrame = 14

        if (currentSpeed*2 > 14){
            sideWaysPotentialperFrame = currentSpeed*2
        }

        for (let n = 0; n < sideWaysPotentialperFrame + 1; n++) {

            if (temp != undefined && temp.previous != undefined){
                if(temp.y == temp.previous.y){
                    temp = temp.previous

                    if(n > sideWaysPotentialperFrame ){
                        current.active = false
                    }
                }
                else{

                    current.active = true
                    break
                }
            }
            else{
                // try{
                current.active = true
                // }
                // catch{}
                break
            }

        }

        //if the closest square is the end one then trace a path back to the starting position and return the path
        if (current.x == endX && current.y == endY && current.rotation == endRotation){
            //DONE
            let temp = current
            path.push(temp)

            if(onlyRightHandSide == true){
                temp.x -=1
            }
            while(temp.previous){
                temp = temp.previous
                if(onlyRightHandSide == true){
                    temp.x -=1
                }
                path.push(temp)
                
            }
            // path.boards = boards
            // boards = null
            closedSet = null
            return path;
        }

        //since it's not the end square, move the sqaure into closedSet meaning it's already been checked
        openSet.splice(lowestFscoreIndex, 1)
        closedSet.push(current)



        //give all the neighbours of the current square a new predicted distance from the final distance, and update their distance from the beginning
        for (let i = 0; i < current.neighbors.length; i++) {
            if(!closedSet.includes(current.neighbors[i])){
                let tempG = current.g + 1

                if(openSet.includes(current.neighbors[i])){
                    //if a shorter distance from the beginning has been found, then set that
                    if(tempG < current.neighbors[i].g){
                        current.neighbors[i].g = tempG
                    }
                }
                else{
                    //hadn't been added to the list of possible next squares to check, so adding it now
                    current.neighbors[i].g = tempG
                    openSet.push(current.neighbors[i])
                }

                //total taxi-cab distance from end position
                current.neighbors[i].h = (-endY+current.neighbors[i].y + 1) * 3 + Math.abs(endX-current.neighbors[i].x) * 2 + Math.abs(endRotation - current.neighbors[i].rotation)

                // total taxi-cab distance from end position + shortest distance found from beginning 
                current.neighbors[i].f = current.neighbors[i].h + current.neighbors[i].g

                //set this square as the previous square of it's neighbour in the path
                current.neighbors[i].previous = current

                //limit how far it can go side ways in a single frame
                let temp = current.neighbors[i]
                let sideWaysPotentialperFrame = 14
                if (currentSpeed*2 > 14){
                    sideWaysPotentialperFrame = currentSpeed*2
                }
                for (let n = 0; n < sideWaysPotentialperFrame; n++) {

                    if (temp != undefined && temp.previous != undefined){
                        if(temp.y == temp.previous.y){
                            temp = temp.previous
                            if(n == sideWaysPotentialperFrame - 1){
                                current.neighbors[i].active = false
                            }
                        }
                        else{
                            
                            current.neighbors[i].active = true
                            break
                        }
                    }
                    else{
                        current.neighbors[i].active = true
                        break
                    }

                }
            }
        }



    }

    //no path was found
    // boards = null
    closedSet = null
    return false
}

    //Returns a score for a specific move, takes in the board after the move, and the board after, and then the number of rows cleared
    //note, the higher the score is, the better the AI thinks the move is
function calculateFitnessForMove(board, highestColValue, bumpinessBefore, holesBefore, rowsCleared, weights){
        let fitnessScore = 0

        //uses different weights depending on what part of the board the highest
        if (highestColValue <= board.length/2.5){

            fitnessScore += weights.linesClearedLower * (rowsCleared ** rowsCleared)
            fitnessScore += weights.bumpinessLower * (bumpinessBefore - getBumpiness(board))
            fitnessScore += weights.holesLower * (holesBefore - getHoleCount(board))
        }
        else{
            fitnessScore += weights.linesClearedHigher * (rowsCleared ** rowsCleared)
            fitnessScore += weights.bumpinessHigher * (bumpinessBefore - getBumpiness(board))
            fitnessScore += weights.holesHigher * (holesBefore - getHoleCount(board))
        }
        if (highestColValue >= board.length - 3){
            fitnessScore += rowsCleared ** 10 * 100
        }

        if(rowsCleared == 4){
            fitnessScore = Infinity
        }

        return fitnessScore
    }


    //returns the number of holes on the board
    //it counts a hole if there is a empty spot below a block 
function getHoleCount(board){
    let holeCount = 0
    let oneAbove = false
    let perCol = 0;
    for (let col = 0; col < board[0].length; col++) {
        oneAbove = false
        for (let row = 0; row < board.length; row++) {
            if (board[row][col] != 0) {
                oneAbove = true
            }
            else if (board[row][col] == 0 && oneAbove == true){
                perCol++
            }
        }
        holeCount += perCol**2
    }
    return holeCount/board[0].length
}

//returns the height of a particular column
function getColHeight(col, board){
            let colHeight = 0
            for (let row = 0; row < board.length; row++) {
                if (board[row][col] != 0){
                    colHeight = board.length-row
                    break
                }
            }
            return colHeight
        }

    //returns twice the average of the difference in height between each column
function getBumpiness(board){

        let bumpiness = 0
        let heights = []
        for (let col = 0; col < board[0].length; col++) {
            heights.push(getColHeight(col,board))
        }
        for (let col = 1; col < board[0].length; col++) {
            bumpiness += Math.abs(heights[col-1] - heights[col])**2/heights.length
        }
        
        //scales the bumpiness so it's the same magnitude as rowsCleared and 
        return bumpiness/board[0].length*2
    }

    //checks if the inputed position is posible on the board for a shape with a certain rotation
function newPosValidOnBoard(x, y, type, rotation, board, shapeConfigurations){

    const shape = shapeConfigurations[type]

    const currentXY = shape[(rotation + shape.length)%shape.length]

    for (let blockNum = 0; blockNum < currentXY.length; blockNum++) {
        if(board[currentXY[blockNum][1] + y] == undefined || board[currentXY[blockNum][1] + y][currentXY[blockNum][0] + x] != 0){
            return false
        }
    }
    return true
}

//check line clears, checks game over
function checksLineClearing(board){

    //Line clearing stuff
    let rowsCleared = []
    for (let row = board.length-1; row > -1; row--) {
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
                if (board[row - 1][col] != 0){
                    board[row][col] = board[row - 1][col]
                    board[row - 1][col] = 0
                }
            }
        }
    }

    return [board, rowsCleared.length]
}

function spawnAdjustment(tetris) {
        
    //positions of the shape and rotation = 0
    let blockRelativePositions = tetris.shape.shape[0]

    let counter = -2
    for (let y = -2; y < 2; y++) {
        //checks if a block of the piece is in an illegal position
        //if it is, then check the next y, else spawn it there
        for (let blockNum = 0; blockNum < tetris.shape.shape[0].length; blockNum++) {
            if(tetris.board[blockRelativePositions[blockNum][1]+y] == undefined || tetris.board[blockRelativePositions[blockNum][1]+y][blockRelativePositions[blockNum][0] + tetris.shape.x] != 0){
                counter++
                break
            }
        }
        //if the y value is allowed for the piece then set it
        if (counter == y){
            tetris.shape.y = y
            //so the AI can later adjust it's path values after it's pathfinding
            if (y < 0) {
                tetris.shapeStartingY = y 
            }
            else {
                tetris.shapeStartingY = 0
            }
            break;
        }
    }
}
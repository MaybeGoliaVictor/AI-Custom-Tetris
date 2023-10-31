class Piece {
    constructor(x,y, rotation, type){
        this.x = x
        this.y = y 
        this.rotation = rotation
        this.type = type
        this.colour = shapeColours[type]
        this.shape = shapeConfigurations[type]
    }

    moveSideways(board, xOffset){
        
        if (this.newPosValidOnBoard(this.x+xOffset, this.y, this.type, this.rotation, board)) {
            this.x += xOffset
            return true
        }
        return false
    }

    moveDown(board){
        if (this.newPosValidOnBoard(this.x, this.y+1, this.type, this.rotation, board)) {
            this.y +=1
            
            return true
        }
        return false
    }

    rotateAntiClockwise(board){
        if (this.newPosValidOnBoard(this.x, this.y, this.type, this.rotation-1, board)) {
            this.rotation--
            this.rotation = (this.rotation + this.shape.length)%this.shape.length
            return true
        }
        return false
    }
    
    rotateClockwise(board){
        if (this.newPosValidOnBoard(this.x, this.y, this.type, this.rotation+1, board)) {
            this.rotation++
            this.rotation = (this.rotation + this.shape.length)%this.shape.length
            return true
        }
        return false
    }

    render(xoffSet, yoffSet, size, p){
        p.fill(this.colour)
        for (let i = 0; i < this.shape[this.rotation].length; i++) {
            p.rect(xoffSet + (this.shape[this.rotation][i][0] + this.x) * size, yoffSet + (this.shape[this.rotation][i][1] + this.y) * size, size, size)
            
        }
    }

    //checks if the inputed position is posible on the board for a shape with a certain rotation
    newPosValidOnBoard(x, y, type, rotation, board){

        const shape = shapeConfigurations[type]

        const currentXY = shape[(rotation + shape.length)%shape.length]

        

        for (let blockNum = 0; blockNum < currentXY.length; blockNum++) {
            if(board[currentXY[blockNum][1] + y] == undefined || board[currentXY[blockNum][1] + y][currentXY[blockNum][0] + x] != 0){
                return false
            }
        }
        return true
    }
}
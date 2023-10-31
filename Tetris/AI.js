//The desicion making part of the AI is placed in WorkerScripts/AIDecision.js
class AI {
    constructor(weights, width, height) {

        //uses these to make decision on which move to make
        this.weights = weights

        this.tetris = new Tetris(width, height)

        //index at which this.nextPath is up to
        this.moveStep = 0

        //stores the series of moves the AI needs to excecute to arrive at it's end locations
        this.nextPath = []

    }

    //moves through the path for the piece
    actOnDecision(frameCount, frameDecision) {
        if (playerAlive == true) {
            //moves it down according to the speed of the tetris at the current level
            if (this.moveStep != this.nextPath.length && (frameCount - frameDecision) % this.tetris.currentSpeed == 0) {
                this.tetris.shape.x = this.nextPath[this.moveStep].x
                //this.tetris.shapeStartingY accounts for how the piece can move
                this.tetris.shape.y = this.nextPath[this.moveStep].y + this.tetris.shapeStartingY
                this.tetris.shape.rotation = this.nextPath[this.moveStep].rotation
                this.moveStep++
            }
            //if it's moving sideways then it can move sideways without moving down
            while (this.nextPath[this.moveStep + 1] != undefined && this.nextPath[this.moveStep].y == this.nextPath[this.moveStep + 1].y) {
                this.tetris.shape.x = this.nextPath[this.moveStep].x
                this.tetris.shape.y = this.nextPath[this.moveStep].y + this.tetris.shapeStartingY
                this.tetris.shape.rotation = this.nextPath[this.moveStep].rotation
                this.moveStep++
            }
        }
        else if (this.moveStep != this.nextPath.length) {
            this.tetris.shape.x = this.nextPath[this.nextPath.length - 1].x
            //this.tetris.shapeStartingY accounts for how the piece can move
            this.tetris.shape.y = this.nextPath[this.nextPath.length - 1].y + this.tetris.shapeStartingY
            this.tetris.shape.rotation = this.nextPath[this.nextPath.length - 1].rotation
            this.moveStep = this.nextPath.length;
        }
    }

}

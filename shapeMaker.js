let shapeMaker = function (p) {
    p.setup = function () {
        p.canvas = p.createCanvas(30, 30.5);
        p.canvas.parent('shapeMaker')

        p.pixelDensity(50);
        p.noLoop()
        selectedRotation = 0

        p.shapeButtonIndicatorLocations = []

        selectedRotationButtonsLocations = []

        p.frameRate(10)

    };

    p.draw = function () {
        if (signedIn == true) {
            p.background(0)

            if (userData != undefined && activeShape != undefined) {

                p.shapeButtonIndicatorLocations = []
                selectedRotationButtonsLocations = []


                let x = p.width / 4
                let y = 6
                let size = p.width / 8

                p.textSize(2);
                p.fill(255)
                p.textStyle(p.BOLD);
                p.text('Design Shape:', 2, 4.25);

                p.strokeWeight(0.2)
                p.stroke(50)
                for (let row = 0; row < 4; row++) {
                    for (let col = 0; col < 4; col++) {
                        p.shapeButtonIndicatorLocations.push({ x: x + size * col, y: y + size * row, size: size, active: false, index: null, col: col, row: row })

                        p.fill(10)

                        //shape selected in shapeSelector.js
                        for (let i = 0; i < activeShape.shape[selectedRotation].length; i++) {
                            if (activeShape.shape[selectedRotation][i][0] == col - 2 && activeShape.shape[selectedRotation][i][1] == row - 1) {
                                p.fill(activeShape.colour)
                                p.shapeButtonIndicatorLocations[p.shapeButtonIndicatorLocations.length - 1].active = true
                                p.shapeButtonIndicatorLocations[p.shapeButtonIndicatorLocations.length - 1].index = i

                                break
                            }

                        }
                        p.rect(x + (size * col), y + (size * row), size, size)

                    }
                }

                p.textSize(1);
                p.fill(255)
                p.textStyle(p.BOLD);
                p.text("Rotation: ", x / 4, p.height - y + size / 2 + 0.5)
                for (let i = 0; i < numberOfRotations; i++) {
                    p.fill(10)
                    p.rect(x + size * i, p.height - y, size, size)
                    p.textSize(1);
                    p.fill(255)
                    p.textStyle(p.BOLD);
                    p.text(i + 1, x + size * i + size / 2 - 0.5, p.height - y + size / 2 + 0.5)
                    selectedRotationButtonsLocations.push({ index: i, x: x + size * i, y: p.height - y, size: size })
                }


            }
        }
    }

    //triggered when the mouse is released
    p.mouseReleased = function () {

        for (let i = 0; i < p.shapeButtonIndicatorLocations.length; i++) {
            if (p.shapeButtonIndicatorLocations[i].x <= p.mouseX && p.mouseX <= p.shapeButtonIndicatorLocations[i].x + p.shapeButtonIndicatorLocations[i].size && p.mouseY >= p.shapeButtonIndicatorLocations[i].y && p.shapeButtonIndicatorLocations[i].y + p.shapeButtonIndicatorLocations[i].size >= p.mouseY) {
                if (p.shapeButtonIndicatorLocations[i].active == true) {

                    p.shapeButtonIndicatorLocations[i].active = false
                    activeShape.shape[selectedRotation].splice(p.shapeButtonIndicatorLocations[i].index, 1)
                    p.shapeButtonIndicatorLocations[i].index = null
                }
                else {
                    p.shapeButtonIndicatorLocations[i].active = true
                    activeShape.shape[selectedRotation].push([p.shapeButtonIndicatorLocations[i].col - 2, p.shapeButtonIndicatorLocations[i].row - 1])
                }
            }

        }


        for (let i = 0; i < selectedRotationButtonsLocations.length; i++) {
            if (selectedRotationButtonsLocations[i].x <= p.mouseX && p.mouseX <= selectedRotationButtonsLocations[i].x + selectedRotationButtonsLocations[i].size && p.mouseY >= selectedRotationButtonsLocations[i].y && selectedRotationButtonsLocations[i].y + selectedRotationButtonsLocations[i].size >= p.mouseY) {
                selectedRotation = selectedRotationButtonsLocations[i].index
            }
        }
    }
}

//initiates p5 Instance
let shapeMakerp5 = new p5(shapeMaker);

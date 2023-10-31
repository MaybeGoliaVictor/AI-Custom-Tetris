
let selectedProfile = 0
let userId;
let profiles;
let userData;
let activeShape;
let selectedRotation = 0;
let numberOfRotations = 1;

let shapeSelector = function (p) {
    p.setup = function () {
        p.canvas = p.createCanvas(30, 30.5);
        p.canvas.parent('shapeSelector')

        p.pixelDensity(25);
        p.noLoop()

        p.shapeButtonLocations = []

        p.frameRate(10)
    };

    p.draw = function () {
        if (signedIn == true) {
            p.background(0)

            if (userData != undefined) {
                p.textSize(2);
                p.fill(255)
                p.textStyle(p.BOLD);
                p.text('Select Shape: (1-16)', 2, 4.25);

                p.fill(18, 150, 197)
                p.rect(p.width - 4.5, 2.75, 1.75, 1.75, 0.3)
                p.textSize(2.5);
                p.fill(13, 95, 184)
                p.textStyle(p.BOLD);
                p.text('+', p.width - 4.39, 4.3);

                p.fill(18, 150, 197)
                p.rect(p.width - 6.5, 2.75, 1.75, 1.75, 0.3)
                p.textSize(2.5);
                p.fill(13, 95, 184)
                p.textStyle(p.BOLD);
                p.text('-', p.width - 6, 4.3);

                let shapeConfigs = Object.keys(userData.profiles[selectedProfile].shapeConfigurations)
                let row = 0
                let col = 0
                let size = 1.2
                p.shapeButtonLocations = []

                //render boxes and shapes
                for (let j = 0; j < shapeConfigs.length; j++) {

                    let x = 6 + (col * 4 - 2) * (p.width / 30 * size + p.width / 30 / 4)
                    let y = 6 + (row) * (p.height / 30.5 * size + p.width / 30 / 4) * 4
                    let sizeX = p.width / 30 * 4 * size + p.width / 30 / 4
                    let sizeY = p.height / 30.5 * 4 * size

                    if ((x <= p.mouseX && p.mouseX <= x + sizeX && p.mouseY >= y && y + sizeY >= p.mouseY) || (activeShape != undefined && activeShape.name == shapeConfigs[j])) {
                        p.fill(0)
                        p.strokeWeight(p.width / 30 / 2)
                        p.stroke(50)
                    }
                    else {
                        p.fill(20)
                        p.strokeWeight(p.width / 30 / 4)
                        p.stroke(40)
                    }


                    p.rect(x, y, sizeX, sizeY)
                    p.shapeButtonLocations.push({ x: x, y: y, sizeX: sizeX, sizeY: sizeY, name: shapeConfigs[j], shape: userData.profiles[selectedProfile].shapeConfigurations[shapeConfigs[j]], colour: userData.profiles[selectedProfile].shapeColours[shapeConfigs[j]] })
                    let shape = userData.profiles[selectedProfile].shapeConfigurations[shapeConfigs[j]][0]

                    if (x <= p.mouseX && p.mouseX <= x + sizeX && p.mouseY >= y && y + sizeY >= p.mouseY) {
                        let colour = userData.profiles[selectedProfile].shapeColours[shapeConfigs[j]]
                        p.fill(colour[0] + 10, colour[1] + 10, colour[2] + 10)
                    }
                    else {
                        p.fill(userData.profiles[selectedProfile].shapeColours[shapeConfigs[j]])
                    }

                    p.noStroke()

                    for (let i = 0; i < shape.length; i++) {
                        p.rect(6 + (shape[i][0] + col * 4) * (p.width / 30 * size) + (col * 4 - 2) * p.width / 30 / 4 + p.width / 30 / 8, 5.75 + (shape[i][1] + row * 4) * (p.height / 30.5 * size) + (row) * p.width / 30 + p.width / 30 / 4 + (p.height / 30.5 * size), p.width / 30 * size, p.height / 30.5 * size)
                    }

                    col += 1
                    if (col == 4) {
                        row += 1
                        col = 0
                    }
                }




            }
        }

    };

    //triggered when the mouse is released
    p.mouseReleased = function () {
        for (let i = 0; i < p.shapeButtonLocations.length; i++) {
            if (p.shapeButtonLocations[i].x <= p.mouseX && p.mouseX <= p.shapeButtonLocations[i].x + p.shapeButtonLocations[i].sizeX && p.mouseY >= p.shapeButtonLocations[i].y && p.shapeButtonLocations[i].y + p.shapeButtonLocations[i].sizeY >= p.mouseY) {


                activeShape = { shape: p.shapeButtonLocations[i].shape, name: p.shapeButtonLocations[i].name, colour: p.shapeButtonLocations[i].colour }
                selectedRotation = 0

                //poppulate fields
                let redInput = document.getElementById("Red")
                let greenInput = document.getElementById("Green")
                let blueInput = document.getElementById("Blue")
                let rotationInput = document.getElementById("No. of Rotations")
                redInput.value = p.shapeButtonLocations[i].colour[0]
                greenInput.value = p.shapeButtonLocations[i].colour[1]
                blueInput.value = p.shapeButtonLocations[i].colour[2]
                rotationInput.value = p.shapeButtonLocations[i].shape.length
                numberOfRotations = p.shapeButtonLocations[i].shape.length

            }
        }

        //new piece added
        if (p.width - 4.5 <= p.mouseX && p.mouseX <= p.width - 4.5 + 1.75 && p.mouseY >= 2.75 && 2.75 + 1.75 >= p.mouseY && p.shapeButtonLocations.length < 16) {
            let newPieceName = Math.random().toString(16).slice(2)
            userData.profiles[selectedProfile].shapeConfigurations[newPieceName] = [[]]
            userData.profiles[selectedProfile].shapeColours[newPieceName] = [255, 255, 255]
        }


        //delete piece
        if (p.width - 6.5 <= p.mouseX && p.mouseX <= p.width - 6.5 + 1.75 && p.mouseY >= 2.75 && 2.75 + 1.75 >= p.mouseY && p.shapeButtonLocations.length > 1) {
            delete userData.profiles[selectedProfile].shapeConfigurations[activeShape.name]
            activeShape = undefined
            numberOfRotations = 1
            selectedRotation = 0
        }

    }

    p.valueChanged = function () {
        let redInput = document.getElementById("Red")
        let greenInput = document.getElementById("Green")
        let blueInput = document.getElementById("Blue")
        let rotationInput = document.getElementById("No. of Rotations")
        let width = document.getElementById("Width")
        let height = document.getElementById("Height")

        if (activeShape != undefined) {
            if (redInput.value >= 0 && 255 >= redInput.value) {
                activeShape.colour[0] = redInput.value
            }
            else {
                redInput.value = activeShape.colour[0]
            }

            if (greenInput.value >= 0 && 255 >= greenInput.value) {
                activeShape.colour[1] = greenInput.value
            }
            else {
                greenInput.value = activeShape.colour[1]
            }

            if (blueInput.value >= 0 && 255 >= blueInput.value) {
                activeShape.colour[2] = blueInput.value
            }
            else {
                blueInput.value = activeShape.colour[2]
            }
            if (rotationInput.value >= 1 && 5 >= rotationInput.value && Math.round(rotationInput.value) == rotationInput.value) {
                numberOfRotations = rotationInput.value

                if (selectedRotation > numberOfRotations - 1) {
                    selectedRotation = numberOfRotations - 1
                }

                if (numberOfRotations < activeShape.shape.length) {
                    activeShape.shape.splice(numberOfRotations, activeShape.shape.length)
                }

                while (numberOfRotations > activeShape.shape.length) {
                    activeShape.shape.push([])
                }
            }
            else {
                rotationInput.value = numberOfRotations
            }
        }


        width.value = Math.round(width.value)
        height.value = Math.round(height.value)


        if (width.value < 5) {
            width.value = 5
        }
        else if (width.value > 40) {
            width.value = 40
        }

        if (height.value < 8) {
            height.value = 8
        }
        else if (height.value > 80) {
            height.value = 80
        }

    }

};

//initiate p5 instance
let shapeSelectorp5 = new p5(shapeSelector);
let startGame = document.getElementsByClassName("Yes")

for (let i = 0; i < startGame.length; i++) {
    startGame[i].addEventListener('click', () => {
        gameStarted = true
    
        let startingScreen = document.getElementById("startingScreen")
    
        startingScreen.className += " disable"

        let winScreen = document.getElementById("winScreen")
        winScreen.className = "center disable"

        let loseScreen = document.getElementById("loseScreen")
        loseScreen.className = "center disable"
    
        tetrisCanvas = document.getElementById("tetrisCanvas")
        tetrisCanvas.className = tetrisCanvas.className.replace("disable", "")
    
        let navbar = document.getElementsByClassName("navbar")
        if (navbar[0].className.includes("disable") == false){
            navbar[0].className += " disable"
        }
        
        shapesValidation()

        //Note this needs to be done before the new p5 instances are made as they use these variables on initiation to define variables
        shapeColours = userData.profiles[selectedProfile].shapeColours
        shapeConfigurations = userData.profiles[selectedProfile].shapeConfigurations

        shapeKeys = Object.keys(shapeConfigurations)

        if (AItetrisp5 != undefined && playerp5 != undefined){
            AItetrisp5.remove()
            playerp5.remove()
        }

        seed =  Math.random()

        AItetrisp5 = new p5(AItetris);
        playerp5 = new p5(player);
        
        AIAlive = true
        playerAlive = true
    
    })
}


let goToSettings = document.getElementsByClassName("No")

for (let i = 0; i < goToSettings.length; i++) {
    goToSettings[i].addEventListener('click', backToSettings)
}

let backButton = document.getElementById("backButton")
backButton.addEventListener('click', backToSettings)
    
function backToSettings() {

    let navbar = document.getElementsByClassName("navbar")
    navbar[0].className = navbar[0].className.replace(" disable", "");

    let current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    
    let pagee = document.getElementsByClassName("Player VS AI-Page")
    pagee[0].className += " disable";

    let page;
    page = document.getElementsByClassName("Settings-Page")

    currentPage = "Settings"
  
    page[0].className = page[0].className.replace(" disable", "")
    let settingsLink = document.getElementById("Settings")

    settingsLink.className += " active";
    if (AItetrisp5 != undefined && playerp5 != undefined){
        AItetrisp5.worker.terminate()
        AItetrisp5.remove()
        playerp5.remove()
        AItetrisp5 = undefined
        playerp5 = undefined
    }
    
        let winScreen = document.getElementById("winScreen")
        winScreen.className = "center disable"

        let loseScreen = document.getElementById("loseScreen")
        loseScreen.className = "center disable"

        let startingScreen = document.getElementById("startingScreen")
        startingScreen.className = "center"
    
    AIAlive = true
    playerAlive = true

    shapeSelectorp5.loop()
    shapeMakerp5.loop()
    
    
}



function shapesValidation(){
    let width = document.getElementById("Width")
    let height = document.getElementById("Height")


    width.value = Math.round(width.value)
    height.value = Math.round(height.value)


    if (width.value < 5){
        width.value = 5
    }
    else if (width.value > 40){
        width.value = 40
    }

    if (height.value < 8){
        height.value = 8
    }
    else if (height.value > 80){
        height.value = 80
    }

    userData.profiles[selectedProfile] = {
        name: userData.profiles[selectedProfile].name,
        shapeConfigurations: userData.profiles[selectedProfile].shapeConfigurations,
        shapeColours: userData.profiles[selectedProfile].shapeColours,
        boardWidth: width.value,
        boardHeight : height.value,
    }
    activeShape = undefined

    //ensuring valid shapes
    for (let p = 0; p < userData.profiles.length; p++) {
      let shapeConfigKeys = Object.keys(userData.profiles[p].shapeConfigurations)
      for (let i = 0; i < shapeConfigKeys.length; i++) {

        //delete all empty rotations for the shape
        for (let j = 0; j < userData.profiles[p].shapeConfigurations[shapeConfigKeys[i]].length; j++) {
          if (userData.profiles[p].shapeConfigurations[shapeConfigKeys[i]][j].length == 0) {
            userData.profiles[p].shapeConfigurations[shapeConfigKeys[i]].splice(j, 1)
            j--
          } 
        }

        //delete empty shape
        if (userData.profiles[p].shapeConfigurations[shapeConfigKeys[i]].length == 0) {
          delete userData.profiles[p].shapeConfigurations[shapeConfigKeys[i]]
          delete userData.profiles[p].shapeColours[shapeConfigKeys[i]]
        } 
      }

      //if no shapes, then add classic set
      if (Object.keys(userData.profiles[p].shapeConfigurations).length == 0){
        userData.profiles[p].shapeConfigurations = 
        {
        I: [
               [[-2,0],[-1,0],[1,0], [0,0]],
               [[0,-1],[0,1],[0,2], [0,0]]
        ], 
         T: [
              [[-1,0],[1,0],[0,1], [0,0]],
              [[0,-1],[-1,0],[0,1], [0,0]],
              [[0,-1],[-1,0],[1,0], [0,0]],
              [[0,-1],[0,1],[1,0], [0,0]]
        ],
        L: [
              [[-1,0],[-1,1],[1,0], [0,0]],
              [[-1,-1],[0,-1],[0,1], [0,0]],
              [[1,-1],[-1,0],[1,0], [0,0]],
              [[1,1],[0,-1],[0,1], [0,0]]
        ],
         J:[
              [[-1,0],[1,1],[1,0], [0,0]],
              [[1,-1],[0,-1],[0,1], [0,0]],
              [[-1,-1],[-1,0],[1,0], [0,0]],
              [[-1,1],[0,-1],[0,1], [0,0]]
        ],
         S:[
              [[0,1],[-1,1],[1,0], [0,0]],
              [[0,-1],[1,0],[1,1], [0,0]],
        ],
         Z: [
              [[0,1],[1,1],[-1,0], [0,0]],
              [[1,-1],[1,0],[0,1], [0,0]],
        ],
         O: [
               [[-1,0], [-1,1], [0,1], [0,0]]
        ]
        }
        userData.profiles[p].shapeColours = {I: [0,255,255],
                                              T: [128,0,128],
                                              L: [255, 165, 0],
                                              J: [50, 50, 255],
                                              S: [50, 255, 50],
                                              Z: [255, 50, 50],
                                              O: [255, 232, 0]}
       }
      }

}

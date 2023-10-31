function loadProfile(profile){
    let width = document.getElementById("Width")
    let height = document.getElementById("Height")

    width.value = userData.profiles[profile].boardWidth
    height.value = userData.profiles[profile].boardHeight

    selectedProfile = profile
    activeShape = undefined

    shapeColours = userData.profiles[selectedProfile].shapeColours
    shapeConfigurations = userData.profiles[selectedProfile].shapeConfigurations

}

let loadButton1 = document.getElementById("loadProfile(0)")
loadButton1.addEventListener("click", () => {
    loadProfile(0)
    let normal = document.getElementById("Normal")
    let extreme = document.getElementById("Extreme")
    let wimsicle = document.getElementById("Wimsicle")

    normal.className = "profileActive"
    extreme.className = ""
    wimsicle.className = ""
})

let loadButton2 = document.getElementById("loadProfile(1)")
loadButton2.addEventListener("click", () => {
    loadProfile(1)
    let normal = document.getElementById("Normal")
    let extreme = document.getElementById("Extreme")
    let wimsicle = document.getElementById("Wimsicle")

    normal.className = ""
    extreme.className = "profileActive"
    wimsicle.className = ""
})

let loadButton3 = document.getElementById("loadProfile(2)")
loadButton3.addEventListener("click", () => {
    loadProfile(2)
    let normal = document.getElementById("Normal")
    let extreme = document.getElementById("Extreme")
    let wimsicle = document.getElementById("Wimsicle")

    normal.className = ""
    extreme.className = ""
    wimsicle.className = "profileActive"

})
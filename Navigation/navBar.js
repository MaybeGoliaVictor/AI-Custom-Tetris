
let currentPage = "Login"

let signedIn = false

// Get the container element
let navBarContainer = document.getElementById("navbar-nav");

// Get all links with class="nav-link" inside the container
let links = navBarContainer.getElementsByClassName("nav-link");

// Loop through the links and add the active class to the clicked link and remove it from the previous one
for (let i = 0; i < links.length; i++) {
  links[i].addEventListener("click", function() {
    if (signedIn == true){
      //gets currently active link on the side bar and makes it no longer active
      let current = document.getElementsByClassName("active");
      current[0].className = current[0].className.replace(" active", "");
      //makes the current page disabled
      let pagee = document.getElementsByClassName(currentPage + "-Page")
      pagee[0].className += " disable";

      let newPage;
      newPage = document.getElementsByClassName(this.id+"-Page")
      if(newPage[0].className == "Player VS AI-Page disable disable"){
        newPage[0].className = "Player VS AI-Page"
      }
      else {
        newPage[0].className = newPage[0].className.replace(" disable", "")
      }

      

      
      currentPage = this.id
      //make the page that was just clicked active
      this.className += " active";

      //turn on and off the p5 canvas' in settings
      if (currentPage == "Settings"){
        shapeSelectorp5.loop()
        shapeMakerp5.loop()
      }
      else {
        shapeSelectorp5.noLoop()
        shapeMakerp5.noLoop()
      }

      if (currentPage == "Player VS AI"){
        let startingScreen = document.getElementById("startingScreen")
    
        startingScreen.className = "center"

      }
      
    }
  });
}

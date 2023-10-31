// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZpM5Pb8Im8syplZtmAbHMilAGWDJ4WVs",
  authDomain: "arctrus-tetris.firebaseapp.com",
  projectId: "arctrus-tetris",
  storageBucket: "arctrus-tetris.appspot.com",
  messagingSenderId: "996331145295",
  appId: "1:996331145295:web:7863b592475fdc353a023a"
};

// Initialise Firebase
const app = initializeApp(firebaseConfig)
// Initialise Cloud Firestore and get a reference to the service
const db = getFirestore(app)
// Initialise the Firebase Authentication and get a reference to the service
const auth = getAuth(app)


let signupForm = document.getElementById('Login-Form')
signupForm.addEventListener('submit', (e) => {
   e.preventDefault()

   const email = document.getElementById("email").value
   const password = document.getElementById("password").value
   
   //it's undefined for the first time through
   if (signupForm.value == 'login' || signupForm.value == undefined){
     signInWithEmailAndPassword(auth,email, password)
     .then((cred) => {
       //load in data and put it in the spots required in the app
        signInSuccessFull(cred)
        signupForm.reset()
     })
     .catch((err) => {
       if (err.message == "Firebase: Error (auth/wrong-password)."){
         let errMessage = document.getElementsByClassName("error_message")
         errMessage[0].innerText = "Password Incorrect"
       }
       else if (err.message == "Firebase: Error (auth/user-not-found)."){
         let errMessage = document.getElementsByClassName("error_message")
         errMessage[0].innerText = "Email Not Found."
       }
       else if (err.message == "Firebase: Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later. (auth/too-many-requests)."){
         let errMessage = document.getElementsByClassName("error_message")
         errMessage[0].innerText = "Account has been temporarily disabled, please try again later."
       }
     })
   }
   //signup
   else {
     createUserWithEmailAndPassword(auth,email, password)
     .then((cred) => {

        //create a starting set of data for the user 
        setDoc(doc(db, "users", cred.user.uid), {
            email: email,
            profiles: [{
                name: "Normal",
                shapeConfigurations: JSON.stringify(shapeConfigurations),
                shapeColours: JSON.stringify(shapeColours),
                boardWidth: 10,
                boardHeight : 20,
            },
            {
                name: "Extreme",
                shapeConfigurations: JSON.stringify(shapeConfigurations),
                shapeColours: JSON.stringify(shapeColours),
                boardWidth: 10,
                boardHeight : 20,
            },
            {
                name: "Wimsicle",
                shapeConfigurations: JSON.stringify(shapeConfigurations),
                shapeColours: JSON.stringify(shapeColours),
                boardWidth: 10,
                boardHeight : 20,
            }]
        }).then(() => {
                  //load in data and put it in the spots required for the app
                    signInSuccessFull(cred)
                })
            //empty the form
            signupForm.reset()
            })
        
     .catch((err) => {
       if (err.message == "Firebase: Error (auth/invalid-email)."){
         let errMessage = document.getElementById("errMessage")
         errMessage.innerText = "Invalid Email"
       }
       else if (err.message == "Firebase: Error (auth/email-already-in-use)."){
         let errMessage = document.getElementsByClassName("error_message")
         errMessage[0].innerText = "Email Already In Use, Please Login"
       }
     })
   }

})

 
function switchBetweenLoginAndSignUp() {
 let signupForm = document.getElementById('Login-Form')
 let lastLine = document.getElementById('formSwitcher')
 let titleOfForm = document.getElementById("Login-Form-Title")
 let submitFormButton = document.getElementById('submitForm')
 let errMessage = document.getElementById("errMessage")
 errMessage.innerText = ""



 if (signupForm.value == 'signup'){
   signupForm.value = 'login'
   lastLine.innerHTML = "Don't have an account? <a id='formSwitcher-link' >Signup!</a>"
   titleOfForm.innerText = titleOfForm.innerText.replace("Sign Up", "Login")
   submitFormButton.value = "Login"
 }
 else {
   signupForm.value = 'signup'
   lastLine.innerHTML = "Already have an account? <a id='formSwitcher-link' >Login!</a>"
   titleOfForm.innerText = titleOfForm.innerText.replace("Login", "Sign Up")
   submitFormButton.value = "Sign Up"
 }

 let lastLineLink = document.getElementById('formSwitcher-link')
 lastLineLink.addEventListener('click', switchBetweenLoginAndSignUp)
}

let lastLineLink = document.getElementById('formSwitcher-link')
lastLineLink.addEventListener('click', switchBetweenLoginAndSignUp)




let saveToProfile = document.getElementById("Save To Profile")
saveToProfile.addEventListener("click", async () => {
  shapesValidation()
  let userDataSent = JSON.parse(JSON.stringify(userData))

  //cause firebase doesn't allow nested array in this case
  for (let p = 0; p < userData.profiles.length; p++) {
    userDataSent.profiles[p].shapeConfigurations = JSON.stringify(userData.profiles[p].shapeConfigurations)
    userDataSent.profiles[p].shapeColours = JSON.stringify(userData.profiles[p].shapeColours) 
  }
    
//update firebase database
    await updateDoc(doc(db, "users", userId), {profiles: userDataSent.profiles}).then(() => {
        let savedSuccessfully = document.getElementById("savedSuccessfully")
        savedSuccessfully.className = savedSuccessfully.className.replace("disable", "")
        setTimeout(()=> {
          let savedSuccessfully = document.getElementById("savedSuccessfully")
          savedSuccessfully.className = "disable"
        }, 3000)
    })
    .catch(() => {
    })

})

//get user data from firebase
async function readUserInfo(){
    const profileDoc = doc(db, "users", userId);
    const profileSnapshot = await getDoc(profileDoc)
    if (profileSnapshot.exists() == true) {
        userData = profileSnapshot.data()

    }
}

function signInSuccessFull(cred){
    signedIn = true
         
    let pagee = document.getElementsByClassName("Login-Page")
    pagee[0].className += " disable";

    //turn side-bar on
    let navigationBarButtons = document.getElementsByClassName("nav-item disable")
    navigationBarButtons[0].className = navigationBarButtons[0].className.replace(" disable", "")
    navigationBarButtons[0].className = navigationBarButtons[0].className.replace(" disable", "")


    userId = cred.user.uid;
    
    readUserInfo().then(() => {
        for (let i = 0; i < userData.profiles.length; i++) {
          //turn strings back into nested arrays (cause you can't store nested arrays with firebase)
            userData.profiles[i].shapeConfigurations = JSON.parse(userData.profiles[i].shapeConfigurations)
            userData.profiles[i].shapeColours = JSON.parse(userData.profiles[i].shapeColours)
        }
        let width = document.getElementById("Width")
        let height = document.getElementById("Height")
    
        width.value = userData.profiles[0].boardWidth
        height.value = userData.profiles[0].boardHeight

        shapeColours = userData.profiles[selectedProfile].shapeColours
        shapeConfigurations = userData.profiles[selectedProfile].shapeConfigurations

        shapeKeys = Object.keys(userData.profiles[selectedProfile].shapeConfigurations)

        let page = document.getElementsByClassName("Settings-Page")
        currentPage = "Settings"
        page[0].className = page[0].className.replace(" disable", "")
        shapeSelectorp5.loop()
        shapeMakerp5.loop()

        //turns off login symbol
    navigationBarButtons = document.getElementsByClassName("nav-item")
    navigationBarButtons[0].className = "disable"

        

    })

    
    
}


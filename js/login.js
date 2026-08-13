/* ==========================================
   PAPPRITO HRIS
   LOGIN SYSTEM V3
========================================== */

import {
    auth,
    db
} from "./firebase.js";

import {

    signInWithEmailAndPassword,

    setPersistence,

    browserLocalPersistence,

    browserSessionPersistence

}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {

    collection,
    getDocs

}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   ELEMENTS
========================================== */

const role =
document.getElementById("role");

const email =
document.getElementById("email");

const password =
document.getElementById("password");

const remember =
document.getElementById("remember");

const loading =
document.getElementById("loading");

const loginBtn =
document.getElementById("loginBtn");

const fingerBtn =
document.getElementById("fingerBtn");


/* ==========================================
   SHOW PASSWORD
========================================== */

window.togglePassword = function(){

    const btn =
    document.querySelector(".show-btn");


    if(password.type === "password"){

        password.type = "text";

        btn.textContent = "HIDE";

    }else{

        password.type = "password";

        btn.textContent = "SHOW";

    }

};


/* ==========================================
   REMEMBER USERNAME
========================================== */

const rememberedUser =
localStorage.getItem("rememberUser");


if(rememberedUser){

    email.value =
    rememberedUser;

    remember.checked =
    true;

}


/* ==========================================
   SHOW LOADING
========================================== */

function showLoading(){

    if(loading){

        loading.style.display =
        "flex";

    }

}


/* ==========================================
   HIDE LOADING
========================================== */

function hideLoading(){

    if(loading){

        loading.style.display =
        "none";

    }

}


/* ==========================================
   DISABLE LOGIN
========================================== */

function disableLogin(){

    if(loginBtn){

        loginBtn.disabled =
        true;

        loginBtn.style.opacity =
        "0.6";

        loginBtn.textContent =
        "SIGNING IN...";

    }

}


/* ==========================================
   ENABLE LOGIN
========================================== */

function enableLogin(){

    if(loginBtn){

        loginBtn.disabled =
        false;

        loginBtn.style.opacity =
        "1";

        loginBtn.textContent =
        "LOGIN";

    }

}


/* ==========================================
   SAVE LOGIN SESSION
========================================== */

function saveLoginSession(
    selectedRole,
    username
){

    localStorage.setItem(
        "userRole",
        selectedRole
    );


    localStorage.setItem(
        "loggedInUser",
        username
    );


    if(remember.checked){

        localStorage.setItem(
            "rememberUser",
            username
        );

    }else{

        localStorage.removeItem(
            "rememberUser"
        );

    }

}


/* ==========================================
   ADMIN LOGIN
========================================== */

async function adminLogin(
    username,
    pass
){

    await signInWithEmailAndPassword(

        auth,

        username,

        pass

    );


    saveLoginSession(
        "admin",
        username
    );


    window.location.replace(
        "loading.html"
    );

}


/* ==========================================
   EMPLOYEE LOGIN
========================================== */

async function employeeLogin(
    username,
    pass
){

    const snapshot =

    await getDocs(

        collection(
            db,
            "employees"
        )

    );


    let foundEmployee =
    null;


    snapshot.forEach(
        docSnap => {

            const emp =
            docSnap.data();


            const employeeId =

            String(
                emp.employeeid || ""
            )
            .trim()
            .toUpperCase();


            const employeeUsername =

            String(
                emp.username || ""
            )
            .trim()
            .toUpperCase();


            const enteredUsername =

            username
            .trim()
            .toUpperCase();


            const employeePassword =

            String(
                emp.password || ""
            );


            const idMatch =

            employeeId !== "" &&

            employeeId ===
            enteredUsername;


            const usernameMatch =

            employeeUsername !== "" &&

            employeeUsername ===
            enteredUsername;


            const passwordMatch =

            employeePassword ===
            pass;


            if(

                (idMatch ||
                usernameMatch)

                &&

                passwordMatch

            ){

                foundEmployee = {

                    id:
                    docSnap.id,

                    ...emp

                };

            }

        }
    );


    if(!foundEmployee){

        throw new Error(
            "Invalid Employee Login"
        );

    }


    saveLoginSession(
        "employee",
        username
    );


    localStorage.setItem(

        "employeeDocId",

        foundEmployee.id

    );


    localStorage.setItem(

        "employeeId",

        foundEmployee.employeeid || ""

    );


    localStorage.setItem(

        "employeeName",

        [

            foundEmployee.firstname,

            foundEmployee.middlename,

            foundEmployee.lastname

        ]

        .filter(Boolean)

        .join(" ")

        .replace(/\s+/g," ")

        .trim()

    );


    window.location.replace(
        "loading.html"
    );

}


/* ==========================================
   LOGIN
========================================== */

window.login = async function(){

    const selectedRole =
    role.value;


    const username =
    email.value.trim();


    const pass =
    password.value;


    /* ======================================
       VALIDATION
    ====================================== */

    if(selectedRole === ""){

        alert(
            "Please select your role."
        );

        return;

    }


    if(username === ""){

        alert(
            "Please enter your Email or Employee ID."
        );

        return;

    }


    if(pass === ""){

        alert(
            "Please enter your password."
        );

        return;

    }


    try{

        showLoading();

        disableLogin();


        /* ==================================
           FIREBASE AUTH PERSISTENCE
        ================================== */

        if(remember.checked){

            await setPersistence(

                auth,

                browserLocalPersistence

            );

        }else{

            await setPersistence(

                auth,

                browserSessionPersistence

            );

        }


        /* ==================================
           ADMIN
        ================================== */

        if(selectedRole === "admin"){

            await adminLogin(
                username,
                pass
            );

            return;

        }


        /* ==================================
           EMPLOYEE
        ================================== */

        if(selectedRole === "employee"){

            await employeeLogin(
                username,
                pass
            );

            return;

        }


    }catch(error){

        console.error(
            "Login Error:",
            error
        );


        hideLoading();

        enableLogin();


        if(
            error.code ===
            "auth/invalid-credential"
        ){

            alert(
                "Invalid email or password."
            );

            return;

        }


        if(
            error.code ===
            "auth/invalid-email"
        ){

            alert(
                "Invalid email address."
            );

            return;

        }


        if(
            error.code ===
            "auth/user-not-found"
        ){

            alert(
                "Account not found."
            );

            return;

        }


        if(
            error.message ===
            "Invalid Employee Login"
        ){

            alert(
                "Invalid Employee ID or password."
            );

            return;

        }


        alert(
            error.message ||
            "Login failed."
        );

    }

};


/* ==========================================
   ENTER KEY
========================================== */

password.addEventListener(
    "keydown",
    function(event){

        if(event.key === "Enter"){

            login();

        }

    }
);


/* ==========================================
   FINGERPRINT / BIOMETRIC
========================================== */

if(fingerBtn){

    if(
        !window.PublicKeyCredential
    ){

        fingerBtn.style.display =
        "none";

    }else{

        fingerBtn.addEventListener(
            "click",
            function(){

                alert(
                    "Fingerprint Login is not yet connected."
                );

            }
        );

    }

}


/* ==========================================
   PAGE READY
========================================== */

window.addEventListener(
    "load",
    function(){

        hideLoading();

        console.log(
            "PAPPRITO HR Login Ready"
        );

    }
);

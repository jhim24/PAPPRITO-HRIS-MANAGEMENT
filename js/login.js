/* ==========================================
   PAPPRITO HRIS
   LOGIN SYSTEM V4
   ADMIN + EMPLOYEE PORTAL
========================================== */


/* ==========================================
   FIREBASE
========================================== */

import {
    auth,
    db
} from "./firebase.js";


import {

    signInWithEmailAndPassword,

    setPersistence,

    browserLocalPersistence,

    browserSessionPersistence,

    signOut

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
    document.getElementById(
        "role"
    );


const email =
    document.getElementById(
        "email"
    );


const password =
    document.getElementById(
        "password"
    );


const remember =
    document.getElementById(
        "remember"
    );


const loading =
    document.getElementById(
        "loading"
    );


const loginBtn =
    document.getElementById(
        "loginBtn"
    );


const fingerBtn =
    document.getElementById(
        "fingerBtn"
    );


/* ==========================================
   SHOW PASSWORD
========================================== */

window.togglePassword =
function(){

    const btn =
        document.querySelector(
            ".show-btn"
        );


    if(
        password.type ===
        "password"
    ){

        password.type =
            "text";


        if(btn){

            btn.textContent =
                "HIDE";

        }

    }else{

        password.type =
            "password";


        if(btn){

            btn.textContent =
                "SHOW";

        }

    }

};


/* ==========================================
   REMEMBER USERNAME
========================================== */

const rememberedUser =
    localStorage.getItem(
        "rememberUser"
    );


if(
    rememberedUser
){

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


    if(
        remember &&
        remember.checked
    ){

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
   FIND EMPLOYEE
========================================== */

async function findEmployee(
    username
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


    const enteredUsername =
        String(
            username || ""
        )
        .trim()
        .toUpperCase();


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


            const idMatch =
                employeeId !== "" &&
                employeeId ===
                enteredUsername;


            const usernameMatch =
                employeeUsername !== "" &&
                employeeUsername ===
                enteredUsername;


            if(
                idMatch ||
                usernameMatch
            ){

                foundEmployee = {

                    id:
                        docSnap.id,

                    ...emp

                };

            }

        }
    );


    return foundEmployee;

}


/* ==========================================
   CREATE INTERNAL AUTH EMAIL
========================================== */

function createPortalEmail(
    employeeId
){

    return String(
        employeeId || ""
    )
    .toLowerCase()
    .replace(
        /[^a-z0-9]/g,
        ""
    )
    +
    "@papprito-hris.local";

}


/* ==========================================
   EMPLOYEE LOGIN
========================================== */

async function employeeLogin(
    username,
    pass
){

    /* ======================================
       FIND EMPLOYEE
    ====================================== */

    const foundEmployee =
        await findEmployee(
            username
        );


    if(
        !foundEmployee
    ){

        throw new Error(
            "EMPLOYEE_NOT_FOUND"
        );

    }


    /* ======================================
       CHECK PORTAL ACCESS
    ====================================== */

    if(
        foundEmployee.portalEnabled !==
        true
    ){

        throw new Error(
            "PORTAL_DISABLED"
        );

    }


    /* ======================================
       CHECK AUTH ACCOUNT
    ====================================== */

    if(
        !foundEmployee.portalAccountCreated
        ||
        !foundEmployee.portalUid
    ){

        throw new Error(
            "PORTAL_ACCOUNT_NOT_CREATED"
        );

    }


    /* ======================================
       EMPLOYEE ID
    ====================================== */

    const employeeId =
        String(
            foundEmployee.employeeid || ""
        )
        .trim()
        .toUpperCase();


    if(
        !employeeId
    ){

        throw new Error(
            "EMPLOYEE_ID_MISSING"
        );

    }


    /* ======================================
       INTERNAL AUTH EMAIL
    ====================================== */

    const portalEmail =
        foundEmployee.portalEmail
        ||
        createPortalEmail(
            employeeId
        );


    /* ======================================
       FIREBASE AUTH LOGIN
    ====================================== */

    await signInWithEmailAndPassword(

        auth,

        portalEmail,

        pass

    );


    /* ======================================
       SAVE EMPLOYEE SESSION
    ====================================== */

    const fullName = [

        foundEmployee.firstname,

        foundEmployee.middlename,

        foundEmployee.lastname

    ]

    .filter(Boolean)

    .join(" ")

    .replace(
        /\s+/g,
        " "
    )

    .trim();


    saveLoginSession(
        "employee",
        employeeId
    );


    localStorage.setItem(

        "employeeDocId",

        foundEmployee.id

    );


    localStorage.setItem(

        "employeeId",

        employeeId

    );


    localStorage.setItem(

        "employeeName",

        fullName

    );


    localStorage.setItem(

        "employeeUsername",

        foundEmployee.portalUsername
        ||
        employeeId

    );


    /* ======================================
       REDIRECT
    ====================================== */

    window.location.replace(
        "loading.html"
    );

}


/* ==========================================
   LOGIN
========================================== */

window.login =
async function(){

    const selectedRole =
        role
            ? role.value
            : "";


    const username =
        email
            ? email.value.trim()
            : "";


    const pass =
        password
            ? password.value
            : "";


    /* ======================================
       VALIDATION
    ====================================== */

    if(
        selectedRole === ""
    ){

        alert(
            "Please select your role."
        );

        return;

    }


    if(
        username === ""
    ){

        alert(
            "Please enter your Email or Employee ID."
        );

        return;

    }


    if(
        pass === ""
    ){

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

        if(
            remember &&
            remember.checked
        ){

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

        if(
            selectedRole ===
            "admin"
        ){

            await adminLogin(

                username,

                pass

            );

            return;

        }


        /* ==================================
           EMPLOYEE
        ================================== */

        if(
            selectedRole ===
            "employee"
        ){

            await employeeLogin(

                username,

                pass

            );

            return;

        }


        throw new Error(
            "Invalid user role."
        );


    }catch(error){

        console.error(
            "Login Error:",
            error
        );


        hideLoading();

        enableLogin();


        /* ==================================
           EMPLOYEE NOT FOUND
        ================================== */

        if(
            error.message ===
            "EMPLOYEE_NOT_FOUND"
        ){

            alert(
                "Employee ID or username was not found."
            );

            return;

        }


        /* ==================================
           PORTAL DISABLED
        ================================== */

        if(
            error.message ===
            "PORTAL_DISABLED"
        ){

            alert(

                "Employee Portal access is disabled.\n\n" +

                "Please contact HR/Admin."

            );

            return;

        }


        /* ==================================
           PORTAL ACCOUNT NOT CREATED
        ================================== */

        if(
            error.message ===
            "PORTAL_ACCOUNT_NOT_CREATED"
        ){

            alert(

                "Employee Portal account has not been created yet.\n\n" +

                "Please contact HR/Admin."

            );

            return;

        }


        /* ==================================
           EMPLOYEE ID MISSING
        ================================== */

        if(
            error.message ===
            "EMPLOYEE_ID_MISSING"
        ){

            alert(
                "Employee ID is missing from the employee record."
            );

            return;

        }


        /* ==================================
           FIREBASE INVALID CREDENTIAL
        ================================== */

        if(
            error.code ===
            "auth/invalid-credential"
        ){

            alert(
                "Invalid Employee ID or password."
            );

            return;

        }


        /* ==================================
           INVALID EMAIL
        ================================== */

        if(
            error.code ===
            "auth/invalid-email"
        ){

            alert(
                "Employee portal account has an invalid authentication email."
            );

            return;

        }


        /* ==================================
           USER NOT FOUND
        ================================== */

        if(
            error.code ===
            "auth/user-not-found"
        ){

            alert(
                "Employee portal account was not found."
            );

            return;

        }


        /* ==================================
           WRONG PASSWORD
        ================================== */

        if(
            error.code ===
            "auth/wrong-password"
        ){

            alert(
                "Invalid Employee ID or password."
            );

            return;

        }


        /* ==================================
           TOO MANY REQUESTS
        ================================== */

        if(
            error.code ===
            "auth/too-many-requests"
        ){

            alert(

                "Too many login attempts.\n\n" +

                "Please try again later."

            );

            return;

        }


        /* ==================================
           ADMIN INVALID LOGIN
        ================================== */

        if(
            error.code ===
            "auth/invalid-login-credentials"
        ){

            alert(
                "Invalid email or password."
            );

            return;

        }


        /* ==================================
           DEFAULT
        ================================== */

        alert(

            error.message
            ||
            "Login failed."

        );

    }

};


/* ==========================================
   ENTER KEY
========================================== */

if(password){

    password.addEventListener(

        "keydown",

        function(event){

            if(
                event.key ===
                "Enter"
            ){

                login();

            }

        }

    );

}


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

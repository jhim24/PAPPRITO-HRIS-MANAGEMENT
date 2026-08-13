/* ==========================================
   PAPPRITO HRIS
   LOGIN SYSTEM V4
   ADMIN + EMPLOYEE PORTAL
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

    if(
        loading
    ){

        loading.style.display =
            "flex";

    }

}


/* ==========================================
   HIDE LOADING
========================================== */

function hideLoading(){

    if(
        loading
    ){

        loading.style.display =
            "none";

    }

}


/* ==========================================
   DISABLE LOGIN
========================================== */

function disableLogin(){

    if(
        loginBtn
    ){

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

    if(
        loginBtn
    ){

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

    /*
     * ADMIN USES REAL FIREBASE AUTH
     */

    const credential =
        await signInWithEmailAndPassword(

            auth,

            username,

            pass

        );


    saveLoginSession(
        "admin",
        username
    );


    /*
     * Clear old employee session
     */

    localStorage.removeItem(
        "employeeDocId"
    );


    localStorage.removeItem(
        "employeeId"
    );


    localStorage.removeItem(
        "employeeName"
    );


    localStorage.removeItem(
        "employeePortalEmail"
    );


    /*
     * Go to loading page
     */

    window.location.replace(
        "loading.html"
    );

}


/* ==========================================
   EMPLOYEE AUTH EMAIL
========================================== */

/*
   Employee enters:

       EMP001

   Firebase Auth actually uses:

       emp001@papprito-hr.local

   The employee does NOT need to know
   the internal Firebase email.
*/

function createEmployeeAuthEmail(
    employeeId
){

    return (

        String(
            employeeId || ""
        )
        .trim()
        .toLowerCase()

        +

        "@papprito-hr.local"

    );

}


/* ==========================================
   FIND EMPLOYEE
========================================== */

async function findEmployee(
    enteredUsername
){

    const snapshot =
        await getDocs(

            collection(
                db,
                "employees"
            )

        );


    const entered =
        String(
            enteredUsername || ""
        )
        .trim()
        .toUpperCase();


    let found =
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


            const username =
                String(
                    emp.username || ""
                )
                .trim()
                .toUpperCase();


            if(

                employeeId ===
                entered

                ||

                username ===
                entered

            ){

                found = {

                    id:
                        docSnap.id,

                    ...emp

                };

            }

        }
    );


    return found;

}


/* ==========================================
   EMPLOYEE LOGIN
========================================== */

async function employeeLogin(
    username,
    pass
){

    /*
     * First find the employee in
     * Firestore.
     */

    const employee =
        await findEmployee(
            username
        );


    if(
        !employee
    ){

        throw new Error(
            "EMPLOYEE_NOT_FOUND"
        );

    }


    /* ======================================
       CHECK PORTAL ACCESS
    ====================================== */

    if(
        employee.portalEnabled !==
        true
    ){

        throw new Error(
            "PORTAL_NOT_ENABLED"
        );

    }


    /* ======================================
       CHECK EMPLOYEE STATUS
    ====================================== */

    const status =
        String(
            employee.status ||
            "Active"
        )
        .trim()
        .toLowerCase();


    if(
        status !==
        "active"
    ){

        throw new Error(
            "EMPLOYEE_INACTIVE"
        );

    }


    /* ======================================
       GET EMPLOYEE ID
    ====================================== */

    const employeeId =
        String(
            employee.employeeid || ""
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
       INTERNAL FIREBASE AUTH EMAIL
    ====================================== */

    const authEmail =
        createEmployeeAuthEmail(
            employeeId
        );


    /* ======================================
       FIREBASE AUTH LOGIN
    ====================================== */

    const credential =
        await signInWithEmailAndPassword(

            auth,

            authEmail,

            pass

        );


    /* ======================================
       SAVE EMPLOYEE SESSION
    ====================================== */

    saveLoginSession(
        "employee",
        username
    );


    localStorage.setItem(

        "employeeDocId",

        employee.id

    );


    localStorage.setItem(

        "employeeId",

        employeeId

    );


    localStorage.setItem(

        "employeeName",

        [

            employee.firstname || "",

            employee.middlename || "",

            employee.lastname || ""

        ]

        .filter(Boolean)

        .join(" ")

        .replace(
            /\s+/g,
            " "
        )

        .trim()

    );


    localStorage.setItem(

        "employeePortalEmail",

        authEmail

    );


    /* ======================================
       GO TO LOADING
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
        ?
        role.value
        :
        "";


    const username =
        email
        ?
        email.value.trim()
        :
        "";


    const pass =
        password
        ?
        password.value
        :
        "";


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


        /*
         * Unknown role
         */

        throw new Error(
            "INVALID_ROLE"
        );


    }catch(error){

        console.error(
            "Login Error:",
            error
        );


        hideLoading();

        enableLogin();


        /* ==================================
           EMPLOYEE ERRORS
        ================================== */

        if(
            error.message ===
            "EMPLOYEE_NOT_FOUND"
        ){

            alert(
                "Employee account not found in the masterlist."
            );

            return;

        }


        if(
            error.message ===
            "PORTAL_NOT_ENABLED"
        ){

            alert(

                "Employee Portal account has not been created yet.\n\n" +

                "Please contact HR/Admin."

            );

            return;

        }


        if(
            error.message ===
            "EMPLOYEE_INACTIVE"
        ){

            alert(

                "Your employee account is inactive.\n\n" +

                "Please contact HR/Admin."

            );

            return;

        }


        if(
            error.message ===
            "EMPLOYEE_ID_MISSING"
        ){

            alert(
                "Employee ID is missing from your employee record."
            );

            return;

        }


        /* ==================================
           FIREBASE AUTH ERRORS
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


        if(
            error.code ===
            "auth/invalid-email"
        ){

            alert(
                "Invalid login information."
            );

            return;

        }


        if(
            error.code ===
            "auth/user-not-found"
        ){

            alert(
                "Employee Portal account not found."
            );

            return;

        }


        if(
            error.code ===
            "auth/wrong-password"
        ){

            alert(
                "Invalid Employee ID or password."
            );

            return;

        }


        if(
            error.code ===
            "auth/too-many-requests"
        ){

            alert(
                "Too many login attempts. Please try again later."
            );

            return;

        }


        if(
            error.code ===
            "auth/network-request-failed"
        ){

            alert(
                "Network error. Please check your internet connection."
            );

            return;

        }


        /* ==================================
           ADMIN INVALID CREDENTIAL
        ================================== */

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
            "auth/user-not-found"
        ){

            alert(
                "Account not found."
            );

            return;

        }


        /* ==================================
           INVALID ROLE
        ================================== */

        if(
            error.message ===
            "INVALID_ROLE"
        ){

            alert(
                "Invalid user role."
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

if(
    password
){

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

if(
    fingerBtn
){

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
            "PAPPRITO HR Login V4 Ready"
        );

    }

);

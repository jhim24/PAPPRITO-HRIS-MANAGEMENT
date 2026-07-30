/* ==========================================
   PAPPRITO HRIS
   LOGIN.JS
   PART 1
========================================== */

const loginForm = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");

const loadingScreen =
document.getElementById("loadingScreen");

const loginMessage =
document.getElementById("loginMessage");

const toast =
document.getElementById("toast");

const toastMessage =
document.getElementById("toastMessage");

const rememberMe =
document.getElementById("rememberMe");

/* ==========================
SHOW / HIDE PASSWORD
========================== */

window.togglePassword = function(){

    if(password.type==="password"){

        password.type="text";

    }else{

        password.type="password";

    }

};

/* ==========================
LOADING
========================== */

function showLoading(){

    loadingScreen.style.display="flex";

}

function hideLoading(){

    loadingScreen.style.display="none";

}

/* ==========================
TOAST
========================== */

function showToast(message,color="#16a34a"){

    toast.style.background=color;

    toastMessage.innerText=message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}

/* ==========================
REMEMBER ME
========================== */

window.addEventListener("load",()=>{

    const savedUser =
    localStorage.getItem("remember_username");

    if(savedUser){

        username.value=savedUser;

        rememberMe.checked=true;

    }

});

/* ==========================
SAVE REMEMBER
========================== */

function saveRemember(){

    if(rememberMe.checked){

        localStorage.setItem(

            "remember_username",

            username.value

        );

    }else{

        localStorage.removeItem(

            "remember_username"

        );

    }

}

/* ==========================
BASIC VALIDATION
========================== */

loginForm.addEventListener(

"submit",

function(e){

    e.preventDefault();

    loginMessage.innerHTML="";

    if(username.value.trim()===""){

        loginMessage.innerHTML=
        "Please enter username.";

        username.focus();

        return;

    }

    if(password.value.trim()===""){

        loginMessage.innerHTML=
        "Please enter password.";

        password.focus();

        return;

    }

    saveRemember();

    showLoading();

    /* FIREBASE LOGIN
       PART 2
    */

});

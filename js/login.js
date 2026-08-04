/* ==========================================
   PAPPRITO HRIS
   LOGIN
========================================== */

import { auth, db } from "./firebase.js";

import {

signInWithEmailAndPassword,

onAuthStateChanged

}

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {

collection,

getDocs

}

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* ==========================================
AUTO LOGIN
========================================== */

onAuthStateChanged(auth,(user)=>{

if(user){

const role = localStorage.getItem("userRole");

if(role==="admin"){

window.location.href="index.html";

}

}

});

/* ==========================================
SHOW PASSWORD
========================================== */

window.togglePassword=function(){

const pass=document.getElementById("password");

const btn=document.querySelector(".show-btn");

if(pass.type==="password"){

pass.type="text";

btn.innerHTML="HIDE";

}else{

pass.type="password";

btn.innerHTML="SHOW";

}

};

/* ==========================================
REMEMBER USER
========================================== */

const remembered=

localStorage.getItem("rememberUser");

if(remembered){

email.value=remembered;

remember.checked=true;

}

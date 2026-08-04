/* ==========================================
   PAPPRITO HRIS
   LOGIN SYSTEM V2
========================================== */

import { auth, db } from "./firebase.js";

import {

signInWithEmailAndPassword

}

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {

collection,
getDocs

}

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

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

/* ==========================================
SHOW PASSWORD
========================================== */

window.togglePassword=function(){

const btn=document.querySelector(".show-btn");

if(password.type==="password"){

password.type="text";

btn.textContent="HIDE";

}else{

password.type="password";

btn.textContent="SHOW";

}

};

/* ==========================================
REMEMBER USERNAME
========================================== */

const rememberedUser=

localStorage.getItem("rememberUser");

if(rememberedUser){

email.value=rememberedUser;

remember.checked=true;

}

/* ==========================================
LOGIN
========================================== */

window.login=async function(){

const selectedRole=

role.value;

const username=

email.value.trim();

const pass=

password.value.trim();

if(

selectedRole==="" ||

username==="" ||

pass===""

){

alert("Complete all fields.");

return;

}

loading.style.display="flex";

/* ==========================================
ADMIN LOGIN
========================================== */

if(selectedRole==="admin"){

try{

await signInWithEmailAndPassword(

auth,

username,

pass

);

localStorage.setItem(

"userRole",

"admin"

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

window.location.replace(

"loading.html"

);

return;

}catch(error){

loading.style.display="none";

alert(error.message);

return;

}

}
   /* ==========================================
EMPLOYEE LOGIN
========================================== */

if(selectedRole==="employee"){

try{

const snapshot=

await getDocs(

collection(db,"users")

);

let found=false;

snapshot.forEach(doc=>{

const user=doc.data();

if(

user.role==="employee"

&&

(user.username||"")

.toUpperCase()

.trim()

===

username.toUpperCase().trim()

&&

(user.password||"")

===

pass

){

found=true;

localStorage.setItem(

"userRole",

"employee"

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

window.location.replace(

"loading.html"

);

}

});

loading.style.display="none";

if(!found){

alert("Invalid Employee Login");

}

}catch(error){

loading.style.display="none";

console.error(error);

alert("Firebase Error");

}

return;

}

loading.style.display="none";

};

/* ==========================================
ENTER KEY LOGIN
========================================== */

password.addEventListener("keypress",(e)=>{

if(e.key==="Enter"){

login();

}

});

/* ==========================================
FINGERPRINT LOGIN
========================================== */

const fingerBtn=

document.getElementById("fingerBtn");

if(fingerBtn){

if(!window.PublicKeyCredential){

fingerBtn.style.display="none";

}else{

fingerBtn.addEventListener("click",()=>{

alert("Fingerprint Login Coming Soon");

});

}

}

/* ==========================================
SERVICE WORKER
========================================== */

if("serviceWorker" in navigator){

window.addEventListener("load",()=>{

navigator.serviceWorker

.register("/service-worker.js")

.then(()=>{

console.log("Service Worker Registered");

})

.catch(error=>{

console.log(error);

});

});

}

/* ==========================================
PAGE READY
========================================== */

window.addEventListener("load",()=>{

loading.style.display="none";

console.log("PAPPRITO HR Login Ready");

});

/* ==========================================
   PAPPRITO HRIS
   LOGIN
========================================== */

import { auth, db } from "./firebase.js";

import {

signInWithEmailAndPassword,
onAuthStateChanged,
signOut

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
/* ==========================================
ADMIN & EMPLOYEE LOGIN
========================================== */

window.login = async function(){

const role = document.getElementById("role").value;

const username = document.getElementById("email").value.trim();

const password = document.getElementById("password").value.trim();

const remember = document.getElementById("remember");

const loading = document.getElementById("loading");

if(role==="" || username==="" || password===""){

alert("Complete all fields");

return;

}

loading.style.display="flex";

/* ==========================
ADMIN LOGIN
========================== */

if(role==="admin"){

try{

await signInWithEmailAndPassword(

auth,

username,

password

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

window.location.replace("loading.html");

}catch(error){

loading.style.display="none";

alert(error.message);

}

return;

}

/* ==========================
EMPLOYEE LOGIN
========================== */

if(role==="employee"){

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

username

.toUpperCase()

.trim()

&&

(user.password||"")

===

password

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

window.location.replace("loading.html");

}

});

loading.style.display="none";

if(!found){

alert(

"Invalid Employee Login"

);

}

}catch(error){

loading.style.display="none";

console.error(error);

alert("Firebase Error");

}

}

};
/* ==========================================
   FINGERPRINT LOGIN
========================================== */

const fingerBtn = document.getElementById("fingerBtn");

if(window.PublicKeyCredential){

console.log("Fingerprint Supported");

}else{

if(fingerBtn){

fingerBtn.style.display="none";

}

}

if(fingerBtn){

fingerBtn.addEventListener("click",async()=>{

alert("Fingerprint Login Coming Soon");

});

}

/* ==========================================
   SERVICE WORKER
========================================== */

if("serviceWorker" in navigator){

window.addEventListener("load",()=>{

navigator.serviceWorker.register("/service-worker.js")

.then(()=>{

console.log("Service Worker Registered");

})

.catch(error=>{

console.log("Service Worker Error:",error);

});

});

}

/* ==========================================
   ENTER KEY LOGIN
========================================== */

document.getElementById("password")

.addEventListener("keypress",(e)=>{

if(e.key==="Enter"){

login();

}

});

/* ==========================================
   PAGE READY
========================================== */

window.addEventListener("load",()=>{

document.getElementById("loading").style.display="none";

console.log("PAPPRITO HR Login Ready");

});
/* ==========================================
CHECK EXISTING LOGIN
========================================== */

onAuthStateChanged(auth,(user)=>{

if(user){

window.location.replace("loading.html");

}

});

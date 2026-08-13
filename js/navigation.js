/* ==========================================
   PAPPRITO HRIS
   GLOBAL NAVIGATION
========================================== */

import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";


/* ==========================================
   GO TO DASHBOARD
========================================== */

window.goToDashboard = function(){

    window.location.replace(
        "dashboard.html"
    );

};


/* ==========================================
   OPEN PAGE
========================================== */

window.openPage = function(page){

    window.location.href = page;

};


/* ==========================================
   AUTH PROTECTION
========================================== */

onAuthStateChanged(
    auth,
    function(user){

        if(!user){

            window.location.replace(
                "login.html"
            );

            return;

        }


        /* ==================================
           PROTECT BROWSER BACK
        ================================== */

        history.replaceState(
            null,
            "",
            location.href
        );

        history.pushState(
            null,
            "",
            location.href
        );


        window.addEventListener(
            "popstate",
            function(){

                if(auth.currentUser){

                    /*
                       Stay inside HRIS.
                       Do not return to Login.
                    */

                    history.pushState(
                        null,
                        "",
                        location.href
                    );

                }else{

                    window.location.replace(
                        "login.html"
                    );

                }

            }
        );

    }
);

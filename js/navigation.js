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
   AUTHENTICATION PROTECTION
========================================== */

onAuthStateChanged(
    auth,
    function(user){

        /* ======================================
           NOT LOGGED IN
        ====================================== */

        if(!user){

            window.location.replace(
                "login.html"
            );

            return;

        }


        /* ======================================
           PROTECT CURRENT SESSION
        ====================================== */

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


        /* ======================================
           BROWSER / PHONE BACK BUTTON
        ====================================== */

        window.addEventListener(
            "popstate",
            function(){

                const currentUser =
                    auth.currentUser;


                if(currentUser){

                    /*
                       User is still logged in.

                       Keep the user inside
                       the HRIS system.
                    */

                    history.pushState(
                        null,
                        "",
                        location.href
                    );

                }else{

                    /*
                       User already logged out.
                    */

                    window.location.replace(
                        "login.html"
                    );

                }

            }
        );

    }
);

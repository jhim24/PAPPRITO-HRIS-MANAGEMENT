/* ==========================================
   PAPPRITO HRIS
   CENTRAL NAVIGATION V1
========================================== */

(function(){

    /* ==========================================
       GET USER ROLE
    ========================================== */

    const role =
        localStorage.getItem("userRole");


    /* ==========================================
       DETERMINE HOME PAGE
    ========================================== */

    let homePage = "login.html";


    if(role === "admin"){

        homePage = "dashboard.html";

    }

    else if(role === "employee"){

        homePage = "employeeportal.html";

    }


    /* ==========================================
       OPEN PAGE
    ========================================== */

    window.openPage = function(page){

        if(!page) return;


        /*
        Keep normal navigation.

        This allows the browser history
        to work correctly.
        */

        window.location.href = page;

    };


    /* ==========================================
       BACK TO ROLE HOME
    ========================================== */

    window.goHome = function(){

        if(
            role === "admin"
            ||
            role === "employee"
        ){

            window.location.href =
                homePage;

        }else{

            window.location.replace(
                "login.html"
            );

        }

    };


    /* ==========================================
       ROLE HOME PAGE
    ========================================== */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();


    /*
    If user is authenticated and
    manually opens index.html,
    send them to their correct home.
    */

    if(currentPage === "index.html"){

        if(
            role === "admin"
            ||
            role === "employee"
        ){

            window.location.replace(
                homePage
            );

        }

    }


    /* ==========================================
       HANDLE BROWSER BACK
    ========================================== */

    /*
    We do NOT block the Back button.

    Instead, if a page is reached directly
    without a valid previous HR page,
    the authentication/page protection
    should handle it.

    Normal navigation remains:

    ADMIN:
    Dashboard → Employee → Back → Dashboard

    EMPLOYEE:
    Portal → Attendance → Back → Portal
    */

    console.log(
        "PAPPRITO HRIS Navigation Ready:",
        role || "Guest"
    );

})();

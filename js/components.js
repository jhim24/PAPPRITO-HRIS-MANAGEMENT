/* ==========================================
   PAPPRITO HRIS
   COMPONENT LOADER
========================================== */


/* ==========================================
   LOAD COMPONENT
========================================== */

async function loadComponent(
    elementId,
    file
){

    const element =
        document.getElementById(
            elementId
        );


    if(!element){

        return;

    }


    try{

        const response =
            await fetch(file);


        if(!response.ok){

            throw new Error(
                `Unable to load component: ${file}`
            );

        }


        const html =
            await response.text();


        element.innerHTML =
            html;


        /*
           Component loaded successfully.
           Dispatch event so other scripts
           can initialize after the sidebar
           exists.
        */

        document.dispatchEvent(
            new CustomEvent(
                "sidebarLoaded"
            )
        );


    }catch(error){

        console.error(
            "Component Loader Error:",
            error
        );

    }

}


/* ==========================================
   LOAD SIDEBAR
========================================== */

async function loadSidebar(){

    await loadComponent(
        "sidebar-container",
        "../components/sidebar.html"
    );

}


/* ==========================================
   PAGE READY
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        loadSidebar();

    }
);

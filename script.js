/* ==========================================
   PAGE NAVIGATION
========================================== */

function openPage(page){

    window.location.href = page;

}

/* ==========================================
   MOBILE MENU
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    const sidebar = document.querySelector(".sidebar");

    if(!sidebar) return;

    // Hamburger Button
    const menuBtn = document.createElement("button");

    menuBtn.className = "menu-toggle";

    menuBtn.innerHTML = "☰";

    document.body.appendChild(menuBtn);

    // Overlay
    const overlay = document.createElement("div");

    overlay.className = "sidebar-overlay";

    document.body.appendChild(overlay);

    // Open
    menuBtn.onclick = ()=>{

        sidebar.classList.add("active");

        overlay.classList.add("active");

        menuBtn.innerHTML = "✕";

    };

    // Close
    function closeMenu(){

        sidebar.classList.remove("active");

        overlay.classList.remove("active");

        menuBtn.innerHTML = "☰";

    }

    overlay.onclick = closeMenu;

    window.addEventListener("resize",()=>{

        if(window.innerWidth > 768){

            closeMenu();

        }

    });

});

import { db } from "../../database/firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE MODULE
========================================== */

const modal = document.getElementById("employeeModal");

const addBtn = document.getElementById("addEmployeeBtn");

const closeBtn = document.getElementById("closeModal");

const cancelBtn = document.getElementById("cancelModal");

/* OPEN MODAL */

addBtn.addEventListener("click",()=>{

    modal.style.display="flex";

});

/* CLOSE MODAL */

closeBtn.addEventListener("click",()=>{

    modal.style.display="none";

});

cancelBtn.addEventListener("click",()=>{

    modal.style.display="none";

});

/* CLICK OUTSIDE */

window.addEventListener("click",(e)=>{

    if(e.target===modal){

        modal.style.display="none";

    }

});

/* ==========================================
   FIRESTORE
========================================== */

const employeeCollection = collection(db, "employees");

/* MOBILE SIDEBAR */

const sidebar = document.querySelector(".sidebar");

window.toggleSidebar=function(){

    sidebar.classList.toggle("active");

};

/* ==========================================
   SAVE EMPLOYEE
========================================== */

document
.getElementById("saveEmployee")
.addEventListener("click", async ()=>{

    try{

        await addDoc(employeeCollection,{

            employeeId:
            document.getElementById("empId").value,

            firstName:
            document.getElementById("firstName").value,

            middleName:
            document.getElementById("middleName").value,

            lastName:
            document.getElementById("lastName").value,

            birthday:
            document.getElementById("birthday").value,

            gender:
            document.getElementById("gender").value,

            department:
            document.getElementById("department").value,

            position:
            document.getElementById("position").value,

            email:
            document.getElementById("email").value,

            mobile:
            document.getElementById("mobile").value,

            sss:
            document.getElementById("sss").value,

            philhealth:
            document.getElementById("philhealth").value,

            pagibig:
            document.getElementById("pagibig").value,

            tin:
            document.getElementById("tin").value,

            bank:
            document.getElementById("bank").value,

            accountNo:
            document.getElementById("accountNo").value,

            address:
            document.getElementById("address").value,

            createdAt:
            serverTimestamp()

        });

       alert("Employee saved successfully!");

modal.style.display = "none";

loadEmployees();

    }catch(error){

        console.error(error);

        alert(error.message);

    }

});
/* ==========================================
   LOAD EMPLOYEES
========================================== */

async function loadEmployees() {

    const tbody = document.getElementById("employeeBody");

    tbody.innerHTML = "";

    const snapshot = await getDocs(employeeCollection);

    snapshot.forEach((documentData) => {

        const emp = documentData.data();

        tbody.innerHTML += `
            <tr>
                <td>📷</td>
                <td>${emp.employeeId ?? ""}</td>
                <td>${emp.firstName ?? ""} ${emp.lastName ?? ""}</td>
                <td>${emp.department ?? ""}</td>
                <td>${emp.position ?? ""}</td>
                <td>Active</td>
                <td>${emp.mobile ?? ""}</td>
                <td>
                    <button>Edit</button>
                    <button>Delete</button>
                </td>
            </tr>
        `;

    });

}

loadEmployees();

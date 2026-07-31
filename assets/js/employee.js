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
            status: "Active",
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

<td><img src="${emp.photo || '../assets/images/default-avatar.png'}" class="photo"></td>

<td>${emp.employeeId || ""}</td>

<td>${emp.firstName || ""}</td>

<td>${emp.middleName || ""}</td>

<td>${emp.lastName || ""}</td>

<td>${emp.birthday || ""}</td>

<td>${emp.gender || ""}</td>

<td>${emp.department || ""}</td>

<td>${emp.position || ""}</td>

<td>${emp.email || ""}</td>

<td>${emp.mobile || ""}</td>

<td>${emp.sss || ""}</td>

<td>${emp.philhealth || ""}</td>

<td>${emp.pagibig || ""}</td>

<td>${emp.tin || ""}</td>

<td>${emp.bank || ""}</td>

<td>${emp.accountNo || ""}</td>

<td>${emp.address || ""}</td>

<td>${emp.createdAt?.toDate().toLocaleDateString() || ""}</td>

<td>
<span class="status ${emp.status === 'Inactive' ? 'inactive' : 'active'}">
${emp.status || 'Active'}
</span>
</td>

<td>

<div class="action-group">

<button class="edit-btn">
Edit
</button>

<button class="delete-btn">
Delete
</button>

</div>

</td>

</tr>
`;

    });

}

loadEmployees();
document.addEventListener("click", async (e) => {

    if (e.target.classList.contains("delete-btn")) {

        if (!confirm("Delete this employee?")) return;

        await deleteDoc(doc(db, "employees", e.target.dataset.id));

        loadEmployees();

    }

});

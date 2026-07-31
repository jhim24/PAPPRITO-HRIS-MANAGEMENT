/* ==========================================================
   PAPPRITO HRIS
   EMPLOYEE.JS
   VERSION 2.0
========================================================== */

import {
    db,
    storage
} from "../../database/firebase-config.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

/* ==========================================================
   COLLECTION
========================================================== */

const employeeCollection = collection(db, "employees");

/* ==========================================================
   DOM
========================================================== */

const employeeTable = document.getElementById("employeeTableBody");

const modal = document.getElementById("employeeModal");

const addBtn = document.getElementById("addEmployeeBtn");

const cancelBtn = document.getElementById("cancelModal");

const saveBtn = document.getElementById("saveEmployee");

const searchInput = document.getElementById("searchEmployee");

const departmentFilter = document.getElementById("departmentFilter");

const photoInput = document.getElementById("employeePhoto");

const previewPhoto = document.getElementById("previewPhoto");

/* ==========================================================
   VARIABLES
========================================================== */

let editingId = null;

let uploadedPhoto = "";

/* ==========================================================
   OPEN MODAL
========================================================== */

addBtn.addEventListener("click", () => {

    modal.style.display = "flex";

});

/* ==========================================================
   CLOSE MODAL
========================================================== */

cancelBtn.addEventListener("click", () => {

    modal.style.display = "none";

    clearForm();

});

/* ==========================================================
   CLOSE WHEN CLICK OUTSIDE
========================================================== */

window.addEventListener("click", (e)=>{

    if(e.target===modal){

        modal.style.display="none";

        clearForm();

    }

});

/* ==========================================================
   PHOTO PREVIEW
========================================================== */

photoInput.addEventListener("change",(e)=>{

    const file=e.target.files[0];

    if(!file) return;

    previewPhoto.src=URL.createObjectURL(file);

});

/* ==========================================================
   CLEAR FORM
========================================================== */

function clearForm(){

    editingId=null;

    document.querySelectorAll(
        "#employeeModal input, #employeeModal select, #employeeModal textarea"
    ).forEach(el=>{

        if(el.type==="file") return;

        el.value="";

    });

    previewPhoto.src="../assets/images/default-user.png";

}
/* ==========================================================
   AUTO EMPLOYEE ID
========================================================== */

async function generateEmployeeId(){

    const snapshot = await getDocs(employeeCollection);

    const total = snapshot.size + 1;

    return "EMP-" + String(total).padStart(5,"0");

}

/* ==========================================================
   UPLOAD PHOTO
========================================================== */

async function uploadPhoto(file){

    if(!file) return "";

    const fileName = Date.now() + "_" + file.name;

    const storageRef = ref(storage,"employees/" + fileName);

    await uploadBytes(storageRef,file);

    return await getDownloadURL(storageRef);

}

/* ==========================================================
   SAVE EMPLOYEE
========================================================== */

saveBtn.addEventListener("click", async()=>{

    try{

        const firstName = document.getElementById("firstName").value.trim();
        const middleName = document.getElementById("middleName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const department = document.getElementById("department").value;
        const position = document.getElementById("position").value.trim();
        const email = document.getElementById("email").value.trim();
        const mobile = document.getElementById("mobile").value.trim();
        const status = document.getElementById("status").value;

        if(firstName==="" || lastName===""){

            alert("First Name and Last Name are required.");

            return;

        }

        let employeeId = document.getElementById("empId").value;

        if(employeeId===""){

            employeeId = await generateEmployeeId();

        }

        let photoURL = uploadedPhoto;

        if(photoInput.files.length>0){

            photoURL = await uploadPhoto(photoInput.files[0]);

        }

        const employeeData={

            employeeId,

            firstName,

            middleName,

            lastName,

            department,

            position,

            email,

            mobile,

            status,

            photoURL,

            createdAt:new Date()

        };

        await addDoc(employeeCollection,employeeData);

        alert("Employee saved successfully.");

        modal.style.display="none";

        clearForm();

        loadEmployees();

    }

    catch(error){

        console.error(error);

        alert("Error saving employee.");

    }

});
/* ==========================================================
   LOAD EMPLOYEES
========================================================== */

async function loadEmployees(){

    employeeTable.innerHTML = "";

    const snapshot = await getDocs(employeeCollection);

    snapshot.forEach((document)=>{

        const data = document.data();

        const row = document.createElement("tr");

        row.innerHTML = `

        <td>

            <img
            src="${data.photoURL || '../assets/images/default-user.png'}"
            class="photo">

        </td>

        <td>${data.employeeId || ""}</td>

        <td>${data.firstName || ""}</td>

        <td>${data.middleName || ""}</td>

        <td>${data.lastName || ""}</td>

        <td>${data.birthday || ""}</td>

        <td>${data.gender || ""}</td>

        <td>${data.department || ""}</td>

        <td>${data.position || ""}</td>

        <td>${data.email || ""}</td>

        <td>${data.mobile || ""}</td>

        <td>

            <span class="status ${(data.status || "Active").toLowerCase()}">

                ${data.status || "Active"}

            </span>

        </td>

        <td>

            <div class="action-group">

                <button
                class="view-btn"
                data-id="${document.id}">

                View

                </button>

                <button
                class="edit-btn"
                data-id="${document.id}">

                Edit

                </button>

                <button
                class="delete-btn"
                data-id="${document.id}">

                Delete

                </button>

            </div>

        </td>

        `;

        employeeTable.appendChild(row);

    });

}

/* ==========================================================
   SEARCH EMPLOYEE
========================================================== */

searchInput.addEventListener("keyup",()=>{

    const keyword = searchInput.value.toLowerCase();

    const rows = employeeTable.querySelectorAll("tr");

    rows.forEach(row=>{

        row.style.display = row.innerText
            .toLowerCase()
            .includes(keyword)
            ? ""
            : "none";

    });

});

/* ==========================================================
   FILTER DEPARTMENT
========================================================== */

departmentFilter.addEventListener("change",()=>{

    const department = departmentFilter.value;

    const rows = employeeTable.querySelectorAll("tr");

    rows.forEach(row=>{

        if(department===""){

            row.style.display="";

            return;

        }

        row.style.display = row.innerText
            .includes(department)
            ? ""
            : "none";

    });

});

/* ==========================================================
   INITIAL LOAD
========================================================== */

loadEmployees();
/* ==========================================================
   VIEW / EDIT / DELETE
========================================================== */

employeeTable.addEventListener("click", async (e) => {

    const id = e.target.dataset.id;

    if (!id) return;

    /* =========================
       DELETE
    ========================= */

    if (e.target.classList.contains("delete-btn")) {

        const confirmDelete = confirm(
            "Are you sure you want to delete this employee?"
        );

        if (!confirmDelete) return;

        await deleteDoc(doc(db, "employees", id));

        alert("Employee deleted successfully.");

        loadEmployees();

    }

    /* =========================
       EDIT / VIEW
    ========================= */

    if (
        e.target.classList.contains("edit-btn") ||
        e.target.classList.contains("view-btn")
    ) {

        const snapshot = await getDocs(employeeCollection);

        snapshot.forEach((employeeDoc) => {

            if (employeeDoc.id !== id) return;

            const data = employeeDoc.data();

            editingId = id;

            document.getElementById("empId").value = data.employeeId || "";
            document.getElementById("firstName").value = data.firstName || "";
            document.getElementById("middleName").value = data.middleName || "";
            document.getElementById("lastName").value = data.lastName || "";
            document.getElementById("birthday").value = data.birthday || "";
            document.getElementById("gender").value = data.gender || "";
            document.getElementById("department").value = data.department || "";
            document.getElementById("position").value = data.position || "";
            document.getElementById("email").value = data.email || "";
            document.getElementById("mobile").value = data.mobile || "";
            document.getElementById("status").value = data.status || "Active";

            document.getElementById("sss").value = data.sss || "";
            document.getElementById("philhealth").value = data.philhealth || "";
            document.getElementById("pagibig").value = data.pagibig || "";
            document.getElementById("tin").value = data.tin || "";

            document.getElementById("bank").value = data.bank || "";
            document.getElementById("accountNo").value = data.accountNo || "";

            document.getElementById("notes").value = data.notes || "";

            uploadedPhoto = data.photoURL || "";

            previewPhoto.src =
                uploadedPhoto || "../assets/images/default-user.png";

            modal.style.display = "flex";

        });

    }

});

/* ==========================================================
   UPDATE EMPLOYEE
========================================================== */

saveBtn.addEventListener("click", async () => {

    if (!editingId) return;

    let photoURL = uploadedPhoto;

    if (photoInput.files.length > 0) {

        photoURL = await uploadPhoto(photoInput.files[0]);

    }

    const employeeData = {

        employeeId: document.getElementById("empId").value,
        firstName: document.getElementById("firstName").value,
        middleName: document.getElementById("middleName").value,
        lastName: document.getElementById("lastName").value,
        birthday: document.getElementById("birthday").value,
        gender: document.getElementById("gender").value,
        department: document.getElementById("department").value,
        position: document.getElementById("position").value,
        email: document.getElementById("email").value,
        mobile: document.getElementById("mobile").value,
        status: document.getElementById("status").value,

        sss: document.getElementById("sss").value,
        philhealth: document.getElementById("philhealth").value,
        pagibig: document.getElementById("pagibig").value,
        tin: document.getElementById("tin").value,

        bank: document.getElementById("bank").value,
        accountNo: document.getElementById("accountNo").value,

        notes: document.getElementById("notes").value,

        photoURL

    };

    await updateDoc(
        doc(db, "employees", editingId),
        employeeData
    );

    alert("Employee updated successfully.");

    editingId = null;

    modal.style.display = "none";

    clearForm();

    loadEmployees();

});

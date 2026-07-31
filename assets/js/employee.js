/* ==========================================================
   PAPPRITO HRIS
   EMPLOYEE.JS v3.0
========================================================== */

import { db, storage } from "../../database/firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

/* ==========================================================
   COLLECTION
========================================================== */

const employeeRef = collection(db, "employees");

/* ==========================================================
   DOM
========================================================== */

const tableBody = document.getElementById("employeeTableBody");

const modal = document.getElementById("employeeModal");

const btnAdd = document.getElementById("addEmployeeBtn");

const btnSave = document.getElementById("saveEmployee");

const btnCancel = document.getElementById("cancelModal");
const btnClose = document.getElementById("closeModal");
const searchInput = document.getElementById("searchEmployee");

const departmentFilter = document.getElementById("departmentFilter");

const previewPhoto = document.getElementById("previewPhoto");

const photoInput = document.getElementById("employeePhoto");

/* ==========================================================
   VARIABLES
========================================================== */

let editId = null;

let photoURL = "";

/* ==========================================================
   OPEN MODAL
========================================================== */

btnAdd.onclick = () => {

    clearForm();

    modal.style.display = "flex";

};

/* ==========================================================
   CLOSE MODAL
========================================================== */

btnCancel.onclick = closeModal;

btnClose.onclick = closeModal;

window.onclick = function(e){

    if(e.target===modal){

        closeModal();

    }

};
/* =====================================
   ESC KEY
===================================== */

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        closeModal();

    }

});
function closeModal(){

    modal.style.display="none";

    clearForm();

    btnSave.style.display="inline-block";

    document.querySelectorAll(

        "#employeeModal input,#employeeModal select,#employeeModal textarea"

    ).forEach(el=>{

        el.disabled=false;

    });

    photoInput.disabled=false;

}

/* ==========================================================
   PHOTO PREVIEW
========================================================== */

photoInput.addEventListener("change",function(){

    const file=this.files[0];

    if(!file) return;

    previewPhoto.src=URL.createObjectURL(file);

});

/* ==========================================================
   CLEAR FORM
========================================================== */

function clearForm(){

    editId=null;

    photoURL="";

    document.querySelectorAll(

        "#employeeModal input,#employeeModal select,#employeeModal textarea"

    ).forEach(el=>{

        if(el.type!=="file"){

            el.value="";

        }

    });

    previewPhoto.src="../assets/images/default-user.png";

}

/* ==========================================================
   GENERATE EMPLOYEE ID
========================================================== */

async function generateEmployeeID(){

    const snapshot=await getDocs(employeeRef);

    const total=snapshot.size+1;

    return "EMP-"+String(total).padStart(5,"0");

}
/* ==========================================================
   UPLOAD PHOTO TO FIREBASE STORAGE
========================================================== */

async function uploadEmployeePhoto() {

    const file = photoInput.files[0];

    if (!file) return photoURL;

    const fileName =
        "employees/" + Date.now() + "_" + file.name;

    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);

    return await getDownloadURL(storageRef);

}

/* ==========================================================
   GET FORM DATA
========================================================== */

function getFormData() {

    return {

        employeeId: document.getElementById("empId").value,

        firstName: document.getElementById("firstName").value.trim(),

        middleName: document.getElementById("middleName").value.trim(),

        lastName: document.getElementById("lastName").value.trim(),

        birthday: document.getElementById("birthday").value,

        gender: document.getElementById("gender").value,

        civilStatus: document.getElementById("civilStatus").value,

        nationality: document.getElementById("nationality").value,

        email: document.getElementById("email").value.trim(),

        mobile: document.getElementById("mobile").value.trim(),

        address: document.getElementById("address").value.trim(),

        department: document.getElementById("department").value,

        position: document.getElementById("position").value,

        employmentStatus:
            document.getElementById("employmentStatus").value,

        dateHired:
            document.getElementById("dateHired").value,

        salaryRate:
            Number(document.getElementById("salaryRate").value || 0),

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

        accountName:
            document.getElementById("accountName")?.value || "",

        branch:
            document.getElementById("branch")?.value || "",

        emergencyPerson:
            document.getElementById("emergencyPerson").value,

        relationship:
            document.getElementById("relationship").value,

        emergencyMobile:
            document.getElementById("emergencyMobile").value,

        emergencyAddress:
            document.getElementById("emergencyAddress").value,

        status:
            document.getElementById("status").value,

        remarks:
            document.getElementById("remarks").value,

        notes:
            document.getElementById("notes").value

    };

}

/* ==========================================================
   VALIDATE REQUIRED FIELDS
========================================================== */

function validateEmployee(data) {

    if (!data.firstName) {

        alert("First Name is required.");

        return false;

    }

    if (!data.lastName) {

        alert("Last Name is required.");

        return false;

    }

    if (!data.department) {

        alert("Please select Department.");

        return false;

    }

    if (!data.position) {

        alert("Please enter Position.");

        return false;

    }

    return true;

}
/* ==========================================================
   SAVE / UPDATE EMPLOYEE
========================================================== */

btnSave.addEventListener("click", async () => {

    try {

        let data = getFormData();

        if (!validateEmployee(data)) return;

        /* ==========================
           PHOTO
        ========================== */

        data.photoURL = await uploadEmployeePhoto();

        /* ==========================
           ADD NEW EMPLOYEE
        ========================== */

        if (!editId) {

            data.employeeId = await generateEmployeeID();

            data.createdAt = serverTimestamp();

            data.updatedAt = serverTimestamp();

            await addDoc(employeeRef, data);

            alert("Employee added successfully.");

        }

        /* ==========================
           UPDATE EMPLOYEE
        ========================== */

        else {

            data.updatedAt = serverTimestamp();

            await updateDoc(

                doc(db, "employees", editId),

                data

            );

            alert("Employee updated successfully.");

        }

        closeModal();

        loadEmployees();

    }

    catch (error) {

        console.error(error);

        alert(error.message);

    }

});

/* ==========================================================
   RESET FORM WHEN ADDING
========================================================== */

btnAdd.addEventListener("click", async () => {

    clearForm();

    document.getElementById("empId").value =

        await generateEmployeeID();

});

/* ==========================================================
   FORMAT STATUS BADGE
========================================================== */

function statusBadge(status) {

    const value = (status || "Active").toLowerCase();

    return `

        <span class="status ${value}">

            ${status || "Active"}

        </span>

    `;

}
/* ==========================================================
   LOAD EMPLOYEES
========================================================== */

async function loadEmployees() {

    try {

        tableBody.innerHTML = "";

        const q = query(
            employeeRef,
            orderBy("employeeId", "asc")
        );

        const snapshot = await getDocs(q);

        snapshot.forEach((employee) => {

            const data = employee.data();

            const tr = document.createElement("tr");

            tr.innerHTML = `

            <td>

                <img
                    src="${data.photoURL || "../assets/images/default-user.png"}"
                    class="photo"
                    alt="Employee">

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

                ${statusBadge(data.status)}

            </td>

            <td>

                <div class="action-group">

                    <button
                        class="view-btn"
                        data-id="${employee.id}">

                        View

                    </button>

                    <button
                        class="edit-btn"
                        data-id="${employee.id}">

                        Edit

                    </button>

                    <button
                        class="delete-btn"
                        data-id="${employee.id}">

                        Delete

                    </button>

                </div>

            </td>

            `;

            tableBody.appendChild(tr);

        });

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================================
   INITIAL LOAD
========================================================== */

loadEmployees();
/* ==========================================================
   VIEW / EDIT / DELETE EMPLOYEE
========================================================== */

tableBody.addEventListener("click", async (e) => {

    const button = e.target;

    const id = button.dataset.id;

    if (!id) return;

    /* ==========================
       VIEW / EDIT
    ========================== */

    if (
        button.classList.contains("view-btn") ||
        button.classList.contains("edit-btn")
    ) {

        try {

            const employeeDoc = await getDoc(
                doc(db, "employees", id)
            );

            if (!employeeDoc.exists()) {

                alert("Employee not found.");

                return;

            }

            const data = employeeDoc.data();

            editId = id;

            document.getElementById("empId").value = data.employeeId || "";
            document.getElementById("firstName").value = data.firstName || "";
            document.getElementById("middleName").value = data.middleName || "";
            document.getElementById("lastName").value = data.lastName || "";
            document.getElementById("birthday").value = data.birthday || "";
            document.getElementById("gender").value = data.gender || "";
            document.getElementById("civilStatus").value = data.civilStatus || "";
            document.getElementById("nationality").value = data.nationality || "";

            document.getElementById("email").value = data.email || "";
            document.getElementById("mobile").value = data.mobile || "";
            document.getElementById("address").value = data.address || "";

            document.getElementById("department").value = data.department || "";
            document.getElementById("position").value = data.position || "";
            document.getElementById("employmentStatus").value =
                data.employmentStatus || "";

            document.getElementById("dateHired").value =
                data.dateHired || "";

            document.getElementById("salaryRate").value =
                data.salaryRate || "";

            document.getElementById("sss").value = data.sss || "";
            document.getElementById("philhealth").value =
                data.philhealth || "";

            document.getElementById("pagibig").value =
                data.pagibig || "";

            document.getElementById("tin").value =
                data.tin || "";

            document.getElementById("bank").value =
                data.bank || "";

            document.getElementById("accountNo").value =
                data.accountNo || "";

            document.getElementById("accountName").value =
                data.accountName || "";

            document.getElementById("branch").value =
                data.branch || "";

            document.getElementById("emergencyPerson").value =
                data.emergencyPerson || "";

            document.getElementById("relationship").value =
                data.relationship || "";

            document.getElementById("emergencyMobile").value =
                data.emergencyMobile || "";

            document.getElementById("emergencyAddress").value =
                data.emergencyAddress || "";

            document.getElementById("status").value =
                data.status || "Active";

            document.getElementById("remarks").value =
                data.remarks || "";

            document.getElementById("notes").value =
                data.notes || "";

            photoURL = data.photoURL || "";

            previewPhoto.src =
                photoURL || "../assets/images/default-user.png";

            modal.style.display = "flex";

            /* ==========================
               VIEW ONLY MODE
            ========================== */

            const isView =
                button.classList.contains("view-btn");

            document
                .querySelectorAll(
                    "#employeeModal input, #employeeModal select, #employeeModal textarea"
                )
                .forEach(el => {

                    if (el.type !== "file") {

                        el.disabled = isView;

                    }

                });

            photoInput.disabled = isView;

            btnSave.style.display =
                isView ? "none" : "inline-block";

        }

        catch (error) {

            console.error(error);

            alert(error.message);

        }

    }

    /* ==========================
       DELETE EMPLOYEE
    ========================== */

    if (button.classList.contains("delete-btn")) {

        const confirmDelete = confirm(
            "Are you sure you want to delete this employee?"
        );

        if (!confirmDelete) return;

        try {

            await deleteDoc(
                doc(db, "employees", id)
            );

            alert("Employee deleted successfully.");

            loadEmployees();

        }

        catch (error) {

            console.error(error);

            alert(error.message);

        }

    }

});
/* ==========================================================
   SEARCH EMPLOYEE
========================================================== */

searchInput.addEventListener("input", () => {

    const keyword = searchInput.value
        .toLowerCase()
        .trim();

    const rows = tableBody.querySelectorAll("tr");

    rows.forEach(row => {

        const text = row.innerText.toLowerCase();

        row.style.display = text.includes(keyword)
            ? ""
            : "none";

    });

});

/* ==========================================================
   FILTER BY DEPARTMENT
========================================================== */

departmentFilter.addEventListener("change", () => {

    const department = departmentFilter.value;

    const rows = tableBody.querySelectorAll("tr");

    rows.forEach(row => {

        if (department === "") {

            row.style.display = "";

            return;

        }

        const rowDepartment = row.cells[7].textContent.trim();

        row.style.display =
            rowDepartment === department
                ? ""
                : "none";

    });

});

/* ==========================================================
   TOTAL EMPLOYEE COUNTER
========================================================== */

function updateEmployeeCount() {

    const visibleRows = Array.from(
        tableBody.querySelectorAll("tr")
    ).filter(row => row.style.display !== "none");

    const counter = document.getElementById("employeeCount");

    if (counter) {

        counter.textContent =
            `Total Employees : ${visibleRows.length}`;

    }

}

/* ==========================================================
   OBSERVE TABLE CHANGES
========================================================== */

const observer = new MutationObserver(() => {

    updateEmployeeCount();

});

observer.observe(tableBody, {

    childList: true,
    subtree: true

});

/* ==========================================================
   UPDATE COUNTER WHEN FILTERING
========================================================== */

searchInput.addEventListener("input", updateEmployeeCount);

departmentFilter.addEventListener(
    "change",
    updateEmployeeCount
);

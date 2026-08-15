/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE ONBOARDING JS
   VERSION 1
========================================== */

import {
    db
} from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   GLOBAL VARIABLES
========================================== */

let onboardingRecords = [];

let currentOnboardingId = null;

let employees = [];


/* ==========================================
   CHECKLIST
========================================== */

const checklistItems = [

    {
        id:"checkEmployeeInfo",
        name:"Employee Information"
    },

    {
        id:"checkContract",
        name:"Employment Contract"
    },

    {
        id:"checkGovernmentIds",
        name:"Government IDs"
    },

    {
        id:"checkBankAccount",
        name:"Bank Account"
    },

    {
        id:"checkCompanyId",
        name:"Company ID"
    },

    {
        id:"checkUniform",
        name:"Uniform"
    },

    {
        id:"checkSystemAccount",
        name:"System Account"
    },

    {
        id:"checkHrOrientation",
        name:"HR Orientation"
    },

    {
        id:"checkCompanyOrientation",
        name:"Company Orientation"
    },

    {
        id:"checkDepartmentOrientation",
        name:"Department Orientation"
    },

    {
        id:"checkAttendanceSetup",
        name:"Attendance Setup"
    },

    {
        id:"checkPayrollSetup",
        name:"Payroll Setup"
    },

    {
        id:"checkDocuments",
        name:"Documents Completed"
    },

    {
        id:"checkOrientation",
        name:"Employee Orientation"
    },

    {
        id:"checkSupervisor",
        name:"Supervisor Assignment"
    },

    {
        id:"checkWorkstation",
        name:"Workstation / Equipment"
    }

];


/* ==========================================
   ELEMENTS
========================================== */

const onboardingBody =
    document.getElementById(
        "onboardingBody"
    );


const onboardingSearch =
    document.getElementById(
        "onboardingSearch"
    );


const onboardingStatusFilter =
    document.getElementById(
        "onboardingStatusFilter"
    );


const onboardingDepartmentFilter =
    document.getElementById(
        "onboardingDepartmentFilter"
    );


const onboardingFormSection =
    document.getElementById(
        "onboardingFormSection"
    );


const onboardingEmployeeId =
    document.getElementById(
        "onboardingEmployeeId"
    );


const onboardingEmployeeName =
    document.getElementById(
        "onboardingEmployeeName"
    );


const onboardingPosition =
    document.getElementById(
        "onboardingPosition"
    );


const onboardingDepartment =
    document.getElementById(
        "onboardingDepartment"
    );


const onboardingDateHired =
    document.getElementById(
        "onboardingDateHired"
    );


const onboardingStartDate =
    document.getElementById(
        "onboardingStartDate"
    );


const onboardingNotes =
    document.getElementById(
        "onboardingNotes"
    );


const onboardingModal =
    document.getElementById(
        "onboardingModal"
    );


const modalEmployeeName =
    document.getElementById(
        "modalEmployeeName"
    );


const modalProgress =
    document.getElementById(
        "modalProgress"
    );


const modalProgressBar =
    document.getElementById(
        "modalProgressBar"
    );


const modalProgressText =
    document.getElementById(
        "modalProgressText"
    );


const modalChecklist =
    document.getElementById(
        "modalChecklist"
    );


/* ==========================================
   SUMMARY ELEMENTS
========================================== */

const totalNewHires =
    document.getElementById(
        "totalNewHires"
    );


const pendingOnboarding =
    document.getElementById(
        "pendingOnboarding"
    );


const inProgressOnboarding =
    document.getElementById(
        "inProgressOnboarding"
    );


const completedOnboarding =
    document.getElementById(
        "completedOnboarding"
    );


/* ==========================================
   HELPER
========================================== */

function text(value){

    return String(
        value ?? ""
    )
    .trim();

}


function escapeHTML(value){

    return text(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ==========================================
   FULL NAME
========================================== */

function getFullName(
    employee
){

    return [

        employee.firstname,

        employee.middlename,

        employee.lastname

    ]

    .filter(
        value =>
            text(value)
    )

    .join(" ")

    .replace(
        /\s+/g,
        " "
    )

    .trim();

}


/* ==========================================
   LOAD EMPLOYEES
========================================== */

async function loadEmployees(){

    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "employees"
                )
            );


        employees = [];


        snapshot.forEach(
            docSnap => {

                const employee =
                    docSnap.data();


                employees.push({

                    id:
                        docSnap.id,

                    ...employee

                });

            }
        );


        populateEmployeeOptions();

        populateDepartments();

    }catch(error){

        console.error(
            "Employee Load Error:",
            error
        );

    }

}


/* ==========================================
   POPULATE EMPLOYEE OPTIONS
========================================== */

function populateEmployeeOptions(){

    /*
     * Employee ID is an input field
     * in the HTML.
     *
     * We keep it as input so HR can
     * manually enter an employee ID.
     *
     * Auto-fill happens when the ID
     * matches an employee.
     */

}


/* ==========================================
   POPULATE DEPARTMENTS
========================================== */

function populateDepartments(){

    const departments = [];


    employees.forEach(
        employee => {

            const department =
                text(
                    employee.department
                );


            if(
                department &&
                !departments.includes(
                    department
                )
            ){

                departments.push(
                    department
                );

            }

        }
    );


    departments.sort(
        (a,b) =>
            a.localeCompare(b)
    );


    if(onboardingDepartment){

        onboardingDepartment.innerHTML = `

<option value="">
SELECT DEPARTMENT
</option>

`;

        departments.forEach(
            department => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    department;


                option.textContent =
                    department;


                onboardingDepartment.appendChild(
                    option
                );

            }
        );

    }


    if(onboardingDepartmentFilter){

        onboardingDepartmentFilter.innerHTML = `

<option value="">
ALL DEPARTMENTS
</option>

`;

        departments.forEach(
            department => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    department;


                option.textContent =
                    department;


                onboardingDepartmentFilter.appendChild(
                    option
                );

            }
        );

    }

}


/* ==========================================
   FIND EMPLOYEE
========================================== */

function findEmployeeById(
    employeeId
){

    const id =
        text(
            employeeId
        )
        .toUpperCase();


    if(!id){

        return null;

    }


    return employees.find(
        employee => {

            return (

                text(
                    employee.employeeid
                )
                .toUpperCase()
                ===
                id

            );

        }
    ) || null;

}


/* ==========================================
   AUTO FILL EMPLOYEE
========================================== */

function autoFillEmployee(){

    if(!onboardingEmployeeId){

        return;

    }


    const employee =
        findEmployeeById(
            onboardingEmployeeId.value
        );


    if(!employee){

        return;

    }


    if(onboardingEmployeeName){

        onboardingEmployeeName.value =
            getFullName(
                employee
            );

    }


    if(onboardingPosition){

        onboardingPosition.value =
            text(
                employee.position
            );

    }


    if(onboardingDepartment){

        onboardingDepartment.value =
            text(
                employee.department
            );

    }


    if(
        onboardingDateHired &&
        employee.datehired
    ){

        onboardingDateHired.value =
            employee.datehired;

    }

}


/* ==========================================
   GET CHECKLIST DATA
========================================== */

function getChecklistData(){

    return checklistItems.map(
        item => {

            const element =
                document.getElementById(
                    item.id
                );


            return {

                id:
                    item.id,

                name:
                    item.name,

                completed:
                    element
                    ?
                    element.checked
                    :
                    false

            };

        }
    );

}


/* ==========================================
   SET CHECKLIST DATA
========================================== */

function setChecklistData(
    checklist
){

    checklistItems.forEach(
        item => {

            const element =
                document.getElementById(
                    item.id
                );


            if(!element){

                return;

            }


            const saved =
                Array.isArray(
                    checklist
                )
                ?
                checklist.find(
                    check =>
                        check.id ===
                        item.id
                )
                :
                null;


            element.checked =
                saved
                ?
                Boolean(
                    saved.completed
                )
                :
                false;

        }
    );

}


/* ==========================================
   CALCULATE PROGRESS
========================================== */

function calculateProgress(
    checklist
){

    if(
        !Array.isArray(
            checklist
        ) ||
        checklist.length === 0
    ){

        return {

            completed:0,

            total:checklistItems.length,

            percent:0

        };

    }


    const completed =
        checklist.filter(
            item =>
                item.completed
        ).length;


    const total =
        checklist.length;


    const percent =
        Math.round(
            (
                completed /
                total
            ) *
            100
        );


    return {

        completed,

        total,

        percent

    };

}


/* ==========================================
   GET STATUS
========================================== */

function getStatus(
    checklist
){

    const progress =
        calculateProgress(
            checklist
        );


    if(
        progress.completed === 0
    ){

        return "PENDING";

    }


    if(
        progress.completed >=
        progress.total
    ){

        return "COMPLETED";

    }


    return "IN PROGRESS";

}


/* ==========================================
   LOAD ONBOARDING
========================================== */

async function loadOnboarding(){

    if(onboardingBody){

        onboardingBody.innerHTML = `

<tr>

<td
    colspan="8"
    class="empty-message">

    Loading onboarding records...

</td>

</tr>

`;

    }


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "onboarding"
                )
            );


        onboardingRecords = [];


        snapshot.forEach(
            docSnap => {

                onboardingRecords.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        renderOnboarding();

        updateSummary();

    }catch(error){

        console.error(
            "Onboarding Load Error:",
            error
        );


        if(onboardingBody){

            onboardingBody.innerHTML = `

<tr>

<td
    colspan="8"
    class="empty-message">

    Failed to load onboarding records.

</td>

</tr>

`;

        }

    }

}


/* ==========================================
   RENDER ONBOARDING
========================================== */

function renderOnboarding(){

    if(!onboardingBody){

        return;

    }


    const search =
        text(
            onboardingSearch
            ?
            onboardingSearch.value
            :
            ""
        )
        .toLowerCase();


    const statusFilter =
        text(
            onboardingStatusFilter
            ?
            onboardingStatusFilter.value
            :
            ""
        )
        .toUpperCase();


    const departmentFilter =
        text(
            onboardingDepartmentFilter
            ?
            onboardingDepartmentFilter.value
            :
            ""
        );


    const filtered =
        onboardingRecords.filter(
            record => {

                const employeeId =
                    text(
                        record.employeeId
                    )
                    .toLowerCase();


                const employeeName =
                    text(
                        record.employeeName
                    )
                    .toLowerCase();


                const position =
                    text(
                        record.position
                    )
                    .toLowerCase();


                const department =
                    text(
                        record.department
                    );


                const status =
                    text(
                        record.status
                    )
                    .toUpperCase();


                const matchesSearch =
                    !search
                    ||
                    employeeId.includes(
                        search
                    )
                    ||
                    employeeName.includes(
                        search
                    )
                    ||
                    position.includes(
                        search
                    );


                const matchesStatus =
                    !statusFilter
                    ||
                    status ===
                    statusFilter;


                const matchesDepartment =
                    !departmentFilter
                    ||
                    department ===
                    departmentFilter;


                return (

                    matchesSearch &&
                    matchesStatus &&
                    matchesDepartment

                );

            }
        );


    onboardingBody.innerHTML =
        "";


    if(
        filtered.length === 0
    ){

        onboardingBody.innerHTML = `

<tr>

<td
    colspan="8"
    class="empty-message">

    NO ONBOARDING RECORDS

</td>

</tr>

`;

        return;

    }


    filtered.forEach(
        record => {

            const checklist =
                Array.isArray(
                    record.checklist
                )
                ?
                record.checklist
                :
                [];


            const progress =
                calculateProgress(
                    checklist
                );


            const status =
                text(
                    record.status
                    ||
                    getStatus(
                        checklist
                    )
                )
                .toUpperCase();


            const statusClass =
                status
                .toLowerCase()
                .replace(
                    /\s+/g,
                    "-"
                );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

<td>

${escapeHTML(
    record.employeeId || "-"
)}

</td>


<td>

<strong>

${escapeHTML(
    record.employeeName || "-"
)}

</strong>

</td>


<td>

${escapeHTML(
    record.position || "-"
)}

</td>


<td>

${escapeHTML(
    record.department || "-"
)}

</td>


<td>

${escapeHTML(
    record.dateHired || "-"
)}

</td>


<td>

<div
    class="progress-info">

<span>
${progress.completed}/${progress.total}
</span>

<strong>
${progress.percent}%
</strong>

</div>


<div
    class="progress-track">

<div
    class="progress-fill"
    style="width:${progress.percent}%">

</div>

</div>

</td>


<td>

<span
    class="status ${statusClass}">

${escapeHTML(
    status
)}

</span>

</td>


<td>

<button
    type="button"
    class="btn primary-btn"
    onclick="viewOnboarding('${record.id}')">

<span
    class="material-icons">

    visibility

</span>

VIEW

</button>

</td>

`;


            onboardingBody.appendChild(
                row
            );

        }
    );

}


/* ==========================================
   UPDATE SUMMARY
========================================== */

function updateSummary(){

    const total =
        onboardingRecords.length;


    let pending = 0;

    let inProgress = 0;

    let completed = 0;


    onboardingRecords.forEach(
        record => {

            const status =
                text(
                    record.status
                )
                .toUpperCase();


            if(
                status ===
                "PENDING"
            ){

                pending++;

            }

            else if(
                status ===
                "IN PROGRESS"
            ){

                inProgress++;

            }

            else if(
                status ===
                "COMPLETED"
            ){

                completed++;

            }

        }
    );


    if(totalNewHires){

        totalNewHires.textContent =
            total;

    }


    if(pendingOnboarding){

        pendingOnboarding.textContent =
            pending;

    }


    if(inProgressOnboarding){

        inProgressOnboarding.textContent =
            inProgress;

    }


    if(completedOnboarding){

        completedOnboarding.textContent =
            completed;

    }

}


/* ==========================================
   OPEN FORM
========================================== */

window.openOnboardingForm =
function(){

    if(!onboardingFormSection){

        return;

    }


    onboardingFormSection.style.display =
        "block";


    onboardingFormSection.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

};


/* ==========================================
   CLOSE FORM
========================================== */

window.closeOnboardingForm =
function(){

    if(!onboardingFormSection){

        return;

    }


    onboardingFormSection.style.display =
        "none";

};


/* ==========================================
   CLEAR FORM
========================================== */

window.clearOnboardingForm =
function(){

    if(onboardingEmployeeId){

        onboardingEmployeeId.value =
            "";

    }


    if(onboardingEmployeeName){

        onboardingEmployeeName.value =
            "";

    }


    if(onboardingPosition){

        onboardingPosition.value =
            "";

    }


    if(onboardingDepartment){

        onboardingDepartment.value =
            "";

    }


    if(onboardingDateHired){

        onboardingDateHired.value =
            "";

    }


    if(onboardingStartDate){

        onboardingStartDate.value =
            "";

    }


    if(onboardingNotes){

        onboardingNotes.value =
            "";

    }


    checklistItems.forEach(
        item => {

            const element =
                document.getElementById(
                    item.id
                );


            if(element){

                element.checked =
                    false;

            }

        }
    );

};


/* ==========================================
   SAVE ONBOARDING
========================================== */

window.saveOnboarding =
async function(){

    const employeeId =
        text(
            onboardingEmployeeId
            ?
            onboardingEmployeeId.value
            :
            ""
        )
        .toUpperCase();


    const employeeName =
        text(
            onboardingEmployeeName
            ?
            onboardingEmployeeName.value
            :
            ""
        );


    const position =
        text(
            onboardingPosition
            ?
            onboardingPosition.value
            :
            ""
        );


    const department =
        text(
            onboardingDepartment
            ?
            onboardingDepartment.value
            :
            ""
        );


    const dateHired =
        text(
            onboardingDateHired
            ?
            onboardingDateHired.value
            :
            ""
        );


    const startDate =
        text(
            onboardingStartDate
            ?
            onboardingStartDate.value
            :
            ""
        );


    const notes =
        text(
            onboardingNotes
            ?
            onboardingNotes.value
            :
            ""
        );


    if(!employeeId){

        alert(
            "Please enter Employee ID."
        );

        return;

    }


    if(!employeeName){

        alert(
            "Please enter Employee Name."
        );

        return;

    }


    if(!position){

        alert(
            "Please enter Position."
        );

        return;

    }


    if(!department){

        alert(
            "Please select Department."
        );

        return;

    }


    if(!dateHired){

        alert(
            "Please select Date Hired."
        );

        return;

    }


    if(!startDate){

        alert(
            "Please select Start Date."
        );

        return;

    }


    /*
     * Prevent duplicate onboarding
     */

    const existing =
        onboardingRecords.find(
            record =>
                text(
                    record.employeeId
                )
                .toUpperCase()
                ===
                employeeId
        );


    if(existing){

        alert(
            "This employee already has an onboarding record."
        );

        return;

    }


    const checklist =
        getChecklistData();


    const status =
        getStatus(
            checklist
        );


    const progress =
        calculateProgress(
            checklist
        );


    try{

        await addDoc(

            collection(
                db,
                "onboarding"
            ),

            {

                employeeId,

                employeeName,

                position,

                department,

                dateHired,

                startDate,

                checklist,

                status,

                progress:

                    progress.percent,

                notes,

                createdAt:
                    serverTimestamp(),

                updatedAt:
                    serverTimestamp()

            }

        );


        alert(
            "Onboarding successfully saved."
        );


        clearOnboardingForm();

        closeOnboardingForm();

        await loadOnboarding();

    }catch(error){

        console.error(
            "Save Onboarding Error:",
            error
        );


        alert(
            "Unable to save onboarding.\n\n" +
            error.message
        );

    }

};


/* ==========================================
   VIEW ONBOARDING
========================================== */

window.viewOnboarding =
function(
    id
){

    const record =
        onboardingRecords.find(
            item =>
                item.id ===
                id
        );


    if(!record){

        alert(
            "Onboarding record not found."
        );

        return;

    }


    currentOnboardingId =
        id;


    if(modalEmployeeName){

        modalEmployeeName.textContent =
            record.employeeName ||
            "Employee";

    }


    const checklist =
        Array.isArray(
            record.checklist
        )
        ?
        record.checklist
        :
        [];


    renderModalChecklist(
        checklist
    );


    updateModalProgress(
        checklist
    );


    if(onboardingModal){

        onboardingModal.style.display =
            "flex";

    }

};


/* ==========================================
   RENDER MODAL CHECKLIST
========================================== */

function renderModalChecklist(
    checklist
){

    if(!modalChecklist){

        return;

    }


    modalChecklist.innerHTML =
        "";


    checklistItems.forEach(
        item => {

            const saved =
                checklist.find(
                    check =>
                        check.id ===
                        item.id
                );


            const completed =
                saved
                ?
                Boolean(
                    saved.completed
                )
                :
                false;


            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "checklist-item";


            label.innerHTML = `

<input
    type="checkbox"
    data-checklist-id="${escapeHTML(item.id)}"
    ${completed ? "checked" : ""}>


<span
    class="checkmark">

</span>


<span>

${escapeHTML(
    item.name
)}

</span>

`;


            const checkbox =
                label.querySelector(
                    "input"
                );


            checkbox.addEventListener(
                "change",
                () => {

                    updateModalProgressFromUI();

                }
            );


            modalChecklist.appendChild(
                label
            );

        }
    );

}


/* ==========================================
   GET MODAL CHECKLIST
========================================== */

function getModalChecklist(){

    if(!modalChecklist){

        return [];

    }


    return checklistItems.map(
        item => {

            const checkbox =
                modalChecklist.querySelector(
                    `input[data-checklist-id="${item.id}"]`
                );


            return {

                id:
                    item.id,

                name:
                    item.name,

                completed:
                    checkbox
                    ?
                    checkbox.checked
                    :
                    false

            };

        }
    );

}


/* ==========================================
   UPDATE MODAL PROGRESS
========================================== */

function updateModalProgress(
    checklist
){

    const progress =
        calculateProgress(
            checklist
        );


    if(modalProgress){

        modalProgress.textContent =
            progress.percent +
            "%";

    }


    if(modalProgressBar){

        modalProgressBar.style.width =
            progress.percent +
            "%";

    }


    if(modalProgressText){

        modalProgressText.textContent =

            progress.completed +

            " / " +

            progress.total +

            " COMPLETED";

    }

}


/* ==========================================
   UPDATE MODAL PROGRESS FROM UI
========================================== */

function updateModalProgressFromUI(){

    const checklist =
        getModalChecklist();


    updateModalProgress(
        checklist
    );

}


/* ==========================================
   UPDATE ONBOARDING
========================================== */

window.updateOnboarding =
async function(){

    if(!currentOnboardingId){

        alert(
            "No onboarding record selected."
        );

        return;

    }


    const checklist =
        getModalChecklist();


    const status =
        getStatus(
            checklist
        );


    const progress =
        calculateProgress(
            checklist
        );


    try{

        await updateDoc(

            doc(
                db,
                "onboarding",
                currentOnboardingId
            ),

            {

                checklist,

                status,

                progress:
                    progress.percent,

                updatedAt:
                    serverTimestamp()

            }

        );


        alert(
            "Onboarding successfully updated."
        );


        closeOnboardingModal();

        currentOnboardingId =
            null;


        await loadOnboarding();

    }catch(error){

        console.error(
            "Update Onboarding Error:",
            error
        );


        alert(
            "Unable to update onboarding.\n\n" +
            error.message
        );

    }

};


/* ==========================================
   CLOSE MODAL
========================================== */

window.closeOnboardingModal =
function(){

    if(onboardingModal){

        onboardingModal.style.display =
            "none";

    }


    currentOnboardingId =
        null;

};


/* ==========================================
   SEARCH
========================================== */

if(onboardingSearch){

    onboardingSearch.addEventListener(
        "input",
        renderOnboarding
    );

}


/* ==========================================
   STATUS FILTER
========================================== */

if(onboardingStatusFilter){

    onboardingStatusFilter.addEventListener(
        "change",
        renderOnboarding
    );

}


/* ==========================================
   DEPARTMENT FILTER
========================================== */

if(onboardingDepartmentFilter){

    onboardingDepartmentFilter.addEventListener(
        "change",
        renderOnboarding
    );

}


/* ==========================================
   EMPLOYEE ID AUTO FILL
========================================== */

if(onboardingEmployeeId){

    onboardingEmployeeId.addEventListener(
        "blur",
        autoFillEmployee
    );


    onboardingEmployeeId.addEventListener(
        "change",
        autoFillEmployee
    );

}


/* ==========================================
   MODAL OUTSIDE CLICK
========================================== */

if(onboardingModal){

    onboardingModal.addEventListener(
        "click",
        event => {

            if(
                event.target ===
                onboardingModal
            ){

                closeOnboardingModal();

            }

        }
    );

}


/* ==========================================
   INITIALIZE
========================================== */

async function initializeOnboarding(){

    try{

        await loadEmployees();

        await loadOnboarding();


        console.log(
            "PAPPRITO Onboarding Ready"
        );

    }catch(error){

        console.error(
            "Onboarding Initialization Error:",
            error
        );

    }

}


initializeOnboarding();

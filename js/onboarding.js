/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE ONBOARDING JS
   COMPLETE VERSION
========================================== */

import {
    db
} from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   GLOBAL VARIABLES
========================================== */

let onboardingRecords = [];

let currentOnboardingId = null;

let employees = [];

let editMode = false;


/* ==========================================
   ONBOARDING CHECKLIST
========================================== */

const checklistItems = [

    {
        id: "checkEmployeeInfo",
        name: "Employee Information"
    },

    {
        id: "checkContract",
        name: "Employment Contract"
    },

    {
        id: "checkGovernmentIds",
        name: "Government IDs"
    },

    {
        id: "checkBankAccount",
        name: "Bank Account"
    },

    {
        id: "checkCompanyId",
        name: "Company ID"
    },

    {
        id: "checkUniform",
        name: "Uniform"
    },

    {
        id: "checkSystemAccount",
        name: "System Account"
    },

    {
        id: "checkHrOrientation",
        name: "HR Orientation"
    },

    {
        id: "checkCompanyOrientation",
        name: "Company Orientation"
    },

    {
        id: "checkDepartmentOrientation",
        name: "Department Orientation"
    },

    {
        id: "checkAttendanceSetup",
        name: "Attendance Setup"
    },

    {
        id: "checkPayrollSetup",
        name: "Payroll Setup"
    },

    {
        id: "checkDocuments",
        name: "Documents Completed"
    },

    {
        id: "checkOrientation",
        name: "Employee Orientation"
    },

    {
        id: "checkSupervisor",
        name: "Supervisor Assignment"
    },

    {
        id: "checkWorkstation",
        name: "Workstation / Equipment"
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


const onboardingEmployeeSelect =
    document.getElementById(
        "onboardingEmployeeSelect"
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


/* ==========================================
   ESCAPE HTML
========================================== */

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
   GET FULL NAME
========================================== */

function getFullName(
    employee
){

    const firstName =
        text(
            employee.firstname ||
            employee.firstName ||
            employee.first_name
        );


    const middleName =
        text(
            employee.middlename ||
            employee.middleName ||
            employee.middle_name
        );


    const lastName =
        text(
            employee.lastname ||
            employee.lastName ||
            employee.last_name
        );


    const completeName =
        text(
            employee.name ||
            employee.fullname ||
            employee.fullName ||
            employee.employeeName
        );


    if(
        firstName ||
        middleName ||
        lastName
    ){

        return [

            firstName,

            middleName,

            lastName

        ]

        .filter(
            value =>
                value
        )

        .join(" ")

        .replace(
            /\s+/g,
            " "
        )

        .trim();

    }


    return completeName;

}


/* ==========================================
   GET EMPLOYEE ID
========================================== */

function getEmployeeId(
    employee,
    firestoreId = ""
){

    return text(

        employee.employeeid ||

        employee.employeeId ||

        employee.employeeID ||

        employee.empid ||

        employee.empId ||

        employee.idNumber ||

        firestoreId

    );

}


/* ==========================================
   GET POSITION
========================================== */

function getPosition(
    employee
){

    return text(

        employee.position ||

        employee.jobtitle ||

        employee.jobTitle ||

        employee.job_position ||

        employee.designation

    );

}


/* ==========================================
   GET DEPARTMENT
========================================== */

function getDepartment(
    employee
){

    return text(

        employee.department ||

        employee.departmentName ||

        employee.dept

    );

}


/* ==========================================
   FORMAT DATE
========================================== */

function formatDateForInput(
    value
){

    if(!value){

        return "";

    }


    if(
        typeof value === "object" &&
        typeof value.toDate === "function"
    ){

        return toInputDate(
            value.toDate()
        );

    }


    if(
        value instanceof Date
    ){

        return toInputDate(
            value
        );

    }


    const stringValue =
        text(value);


    if(
        /^\d{4}-\d{2}-\d{2}$/.test(
            stringValue
        )
    ){

        return stringValue;

    }


    const parsed =
        new Date(
            stringValue
        );


    if(
        !Number.isNaN(
            parsed.getTime()
        )
    ){

        return toInputDate(
            parsed
        );

    }


    return "";

}


/* ==========================================
   DATE TO INPUT
========================================== */

function toInputDate(
    date
){

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        )
        .padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* ==========================================
   GET DATE HIRED
========================================== */

function getDateHired(
    employee
){

    return formatDateForInput(

        employee.datehired ||

        employee.dateHired ||

        employee.hireDate ||

        employee.hiredDate ||

        employee.date_hired

    );

}


/* ==========================================
   LOAD EMPLOYEES
========================================== */

async function loadEmployees(){

    try{

        console.log(
            "Loading employees..."
        );


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

                employees.push({

                    firestoreId:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        employees.sort(
            (
                a,
                b
            ) => {

                const nameA =
                    getFullName(
                        a
                    )
                    .toLowerCase();


                const nameB =
                    getFullName(
                        b
                    )
                    .toLowerCase();


                return nameA.localeCompare(
                    nameB
                );

            }
        );


        populateEmployeeDropdown();

        populateDepartments();


        console.log(
            "Employees loaded:",
            employees.length
        );

    }catch(error){

        console.error(
            "Employee Load Error:",
            error
        );


        if(
            onboardingEmployeeSelect
        ){

            onboardingEmployeeSelect.innerHTML = `

<option value="">
UNABLE TO LOAD EMPLOYEES
</option>

`;

        }

    }

}


/* ==========================================
   POPULATE EMPLOYEE DROPDOWN
========================================== */

function populateEmployeeDropdown(){

    if(
        !onboardingEmployeeSelect
    ){

        return;

    }


    onboardingEmployeeSelect.innerHTML = `

<option value="">
SELECT EMPLOYEE
</option>

`;


    if(
        employees.length === 0
    ){

        const option =
            document.createElement(
                "option"
            );


        option.value = "";

        option.textContent =
            "NO EMPLOYEES FOUND";

        option.disabled = true;


        onboardingEmployeeSelect.appendChild(
            option
        );


        return;

    }


    employees.forEach(
        employee => {

            const employeeId =
                getEmployeeId(
                    employee,
                    employee.firestoreId
                );


            const employeeName =
                getFullName(
                    employee
                );


            if(
                !employeeName &&
                !employeeId
            ){

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                employee.firestoreId;


            option.textContent =

                employeeName

                +

                (
                    employeeId
                    ?
                    ` — ${employeeId}`
                    :
                    ""
                );


            onboardingEmployeeSelect.appendChild(
                option
            );

        }
    );

}


/* ==========================================
   HANDLE EMPLOYEE SELECTION
========================================== */

function handleEmployeeSelection(){

    if(
        !onboardingEmployeeSelect
    ){

        return;

    }


    const firestoreId =
        onboardingEmployeeSelect.value;


    if(
        !firestoreId
    ){

        clearSelectedEmployeeFields();

        return;

    }


    const employee =
        employees.find(
            item =>
                item.firestoreId ===
                firestoreId
        );


    if(!employee){

        console.error(
            "Selected employee not found:",
            firestoreId
        );

        return;

    }


    fillEmployeeFields(
        employee
    );

}


/* ==========================================
   FILL EMPLOYEE FIELDS
========================================== */

function fillEmployeeFields(
    employee
){

    const employeeId =
        getEmployeeId(
            employee,
            employee.firestoreId
        );


    const employeeName =
        getFullName(
            employee
        );


    const position =
        getPosition(
            employee
        );


    const department =
        getDepartment(
            employee
        );


    const dateHired =
        getDateHired(
            employee
        );


    if(
        onboardingEmployeeId
    ){

        onboardingEmployeeId.value =
            employeeId;

    }


    if(
        onboardingEmployeeName
    ){

        onboardingEmployeeName.value =
            employeeName;

    }


    if(
        onboardingPosition
    ){

        onboardingPosition.value =
            position;

    }


    if(
        onboardingDepartment
    ){

        onboardingDepartment.value =
            department;

    }


    if(
        onboardingDateHired
    ){

        onboardingDateHired.value =
            dateHired;

    }

}


/* ==========================================
   CLEAR EMPLOYEE FIELDS
========================================== */

function clearSelectedEmployeeFields(){

    if(
        onboardingEmployeeId
    ){

        onboardingEmployeeId.value =
            "";

    }


    if(
        onboardingEmployeeName
    ){

        onboardingEmployeeName.value =
            "";

    }


    if(
        onboardingPosition
    ){

        onboardingPosition.value =
            "";

    }


    if(
        onboardingDepartment
    ){

        onboardingDepartment.value =
            "";

    }


    if(
        onboardingDateHired
    ){

        onboardingDateHired.value =
            "";

    }

}


/* ==========================================
   POPULATE DEPARTMENTS
========================================== */

function populateDepartments(){

    if(
        !onboardingDepartmentFilter
    ){

        return;

    }


    const departments = [];


    employees.forEach(
        employee => {

            const department =
                getDepartment(
                    employee
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
        (
            a,
            b
        ) =>
            a.localeCompare(
                b
            )
    );


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


/* ==========================================
   GET CHECKLIST
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
                    Boolean(
                        element.checked
                    )
                    :
                    false

            };

        }
    );

}


/* ==========================================
   SET CHECKLIST
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

    const total =
        checklistItems.length;


    if(
        !Array.isArray(
            checklist
        )
    ){

        return {

            completed: 0,

            total,

            percent: 0

        };

    }


    const completed =
        checklist.filter(
            item =>
                item.completed
        ).length;


    const percent =
        total === 0
        ?
        0
        :
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
   LOAD ONBOARDING RECORDS
========================================== */

async function loadOnboarding(){

    if(
        onboardingBody
    ){

        onboardingBody.innerHTML = `

<tr>

<td
    colspan="8"
    class="empty-message">

    LOADING ONBOARDING RECORDS...

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


        if(
            onboardingBody
        ){

            onboardingBody.innerHTML = `

<tr>

<td
    colspan="8"
    class="empty-message">

    FAILED TO LOAD ONBOARDING RECORDS.

</td>

</tr>

`;

        }

    }

}


/* ==========================================
   RENDER ONBOARDING TABLE
========================================== */

function renderOnboarding(){

    if(
        !onboardingBody
    ){

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


    onboardingBody.innerHTML = "";


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

<div class="action-buttons">


    <!-- VIEW -->

    <button
        type="button"
        class="btn primary-btn"
        onclick="viewOnboarding('${record.id}')"
        title="View">

        <span class="material-icons">
            visibility
        </span>

        VIEW

    </button>


    <!-- EDIT -->

    <button
        type="button"
        class="btn edit-btn"
        onclick="editOnboarding('${record.id}')"
        title="Edit">

        <span class="material-icons">
            edit
        </span>

        EDIT

    </button>


    <!-- DELETE -->

    <button
        type="button"
        class="btn delete-btn"
        onclick="deleteOnboarding('${record.id}')"
        title="Delete">

        <span class="material-icons">
            delete
        </span>

        DELETE

    </button>


</div>

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

    let pending = 0;

    let inProgress = 0;

    let completed = 0;


    onboardingRecords.forEach(
        record => {

            const checklist =
                Array.isArray(
                    record.checklist
                )
                ?
                record.checklist
                :
                [];


            const status =
                text(
                    record.status
                    ||
                    getStatus(
                        checklist
                    )
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


    if(
        totalNewHires
    ){

        totalNewHires.textContent =
            onboardingRecords.length;

    }


    if(
        pendingOnboarding
    ){

        pendingOnboarding.textContent =
            pending;

    }


    if(
        inProgressOnboarding
    ){

        inProgressOnboarding.textContent =
            inProgress;

    }


    if(
        completedOnboarding
    ){

        completedOnboarding.textContent =
            completed;

    }

}


/* ==========================================
   OPEN NEW ONBOARDING FORM
========================================== */

window.openOnboardingForm =
function(){

    editMode = false;

    currentOnboardingId = null;


    resetFormButton();


    if(
        onboardingFormSection
    ){

        onboardingFormSection.style.display =
            "block";


        onboardingFormSection.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

};


/* ==========================================
   CLOSE FORM
========================================== */

window.closeOnboardingForm =
function(){

    if(
        onboardingFormSection
    ){

        onboardingFormSection.style.display =
            "none";

    }


    editMode = false;

    currentOnboardingId = null;


    resetFormButton();

};


/* ==========================================
   RESET FORM BUTTON
========================================== */

function resetFormButton(){

    const button =
        document.querySelector(
            "#onboardingFormSection .form-actions .primary-btn"
        );


    if(!button){

        return;

    }


    button.innerHTML = `

<span class="material-icons">
    save
</span>

SAVE ONBOARDING

`;

}


/* ==========================================
   CLEAR FORM
========================================== */

window.clearOnboardingForm =
function(){

    editMode = false;

    currentOnboardingId = null;


    if(
        onboardingEmployeeSelect
    ){

        onboardingEmployeeSelect.value =
            "";

    }


    clearSelectedEmployeeFields();


    if(
        onboardingStartDate
    ){

        onboardingStartDate.value =
            "";

    }


    if(
        onboardingNotes
    ){

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


    resetFormButton();

};


/* ==========================================
   SAVE / UPDATE ONBOARDING
========================================== */

window.saveOnboarding =
async function(){

    const firestoreId =
        onboardingEmployeeSelect
        ?
        onboardingEmployeeSelect.value
        :
        "";


    if(
        !firestoreId
    ){

        alert(
            "Please select an employee."
        );

        return;

    }


    const employee =
        employees.find(
            item =>
                item.firestoreId ===
                firestoreId
        );


    if(!employee){

        alert(
            "Selected employee was not found."
        );

        return;

    }


    const employeeId =
        getEmployeeId(
            employee,
            employee.firestoreId
        )
        .toUpperCase();


    const employeeName =
        getFullName(
            employee
        );


    const position =
        getPosition(
            employee
        );


    const department =
        getDepartment(
            employee
        );


    const dateHired =
        getDateHired(
            employee
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


    if(
        !employeeName
    ){

        alert(
            "Selected employee has no employee name."
        );

        return;

    }


    if(
        !startDate
    ){

        alert(
            "Please select Start Date."
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


    /* ======================================
       EDIT EXISTING RECORD
    ======================================= */

    if(
        editMode &&
        currentOnboardingId
    ){

        try{

            await updateDoc(

                doc(
                    db,
                    "onboarding",
                    currentOnboardingId
                ),

                {

                    employeeFirestoreId:
                        firestoreId,

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

                    updatedAt:
                        serverTimestamp()

                }

            );


            alert(
                "Onboarding successfully updated."
            );


            window.clearOnboardingForm();

            window.closeOnboardingForm();

            await loadOnboarding();


            return;

        }catch(error){

            console.error(
                "Update Onboarding Error:",
                error
            );


            alert(

                "Unable to update onboarding.\n\n" +

                error.message

            );


            return;

        }

    }


    /* ======================================
       CHECK DUPLICATE FOR NEW RECORD
    ======================================= */

    const existing =
        onboardingRecords.find(
            record => {

                const existingFirestoreId =
                    text(
                        record.employeeFirestoreId
                    );


                const existingEmployeeId =
                    text(
                        record.employeeId
                    )
                    .toUpperCase();


                return (

                    (
                        existingFirestoreId &&
                        existingFirestoreId ===
                        firestoreId
                    )

                    ||

                    (
                        employeeId &&
                        existingEmployeeId ===
                        employeeId
                    )

                );

            }
        );


    if(existing){

        alert(
            "This employee already has an onboarding record."
        );

        return;

    }


    /* ======================================
       CREATE NEW RECORD
    ======================================= */

    try{

        await addDoc(

            collection(
                db,
                "onboarding"
            ),

            {

                employeeFirestoreId:
                    firestoreId,

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


        window.clearOnboardingForm();

        window.closeOnboardingForm();

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
   EDIT ONBOARDING
========================================== */

window.editOnboarding =
function(id){

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


    editMode = true;

    currentOnboardingId =
        id;


    /*
     * Open form
     */

    if(
        onboardingFormSection
    ){

        onboardingFormSection.style.display =
            "block";

    }


    /*
     * Select employee
     */

    if(
        onboardingEmployeeSelect
    ){

        onboardingEmployeeSelect.value =
            record.employeeFirestoreId || "";


        handleEmployeeSelection();

    }


    /*
     * Fallback if old record
     * does not have employeeFirestoreId.
     */

    if(
        onboardingEmployeeSelect &&
        !onboardingEmployeeSelect.value
    ){

        const employee =
            employees.find(
                item => {

                    const idValue =
                        getEmployeeId(
                            item,
                            item.firestoreId
                        )
                        .toUpperCase();


                    return (

                        idValue ===
                        text(
                            record.employeeId
                        )
                        .toUpperCase()

                    );

                }
            );


        if(employee){

            onboardingEmployeeSelect.value =
                employee.firestoreId;


            handleEmployeeSelection();

        }

    }


    /*
     * Start Date
     */

    if(
        onboardingStartDate
    ){

        onboardingStartDate.value =
            record.startDate || "";

    }


    /*
     * Notes
     */

    if(
        onboardingNotes
    ){

        onboardingNotes.value =
            record.notes || "";

    }


    /*
     * Checklist
     */

    setChecklistData(
        record.checklist || []
    );


    /*
     * Change save button
     */

    const button =
        document.querySelector(
            "#onboardingFormSection .form-actions .primary-btn"
        );


    if(button){

        button.innerHTML = `

<span class="material-icons">
    save
</span>

UPDATE ONBOARDING

`;

    }


    /*
     * Scroll to form
     */

    if(
        onboardingFormSection
    ){

        onboardingFormSection.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

};


/* ==========================================
   DELETE ONBOARDING
========================================== */

window.deleteOnboarding =
async function(id){

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


    const employeeName =
        record.employeeName ||
        "this employee";


    const confirmed =
        confirm(

            "Are you sure you want to delete the onboarding record for " +

            employeeName +

            "?\n\n" +

            "This action cannot be undone."

        );


    if(!confirmed){

        return;

    }


    try{

        await deleteDoc(

            doc(
                db,
                "onboarding",
                id
            )

        );


        alert(
            "Onboarding record deleted successfully."
        );


        await loadOnboarding();

    }catch(error){

        console.error(
            "Delete Onboarding Error:",
            error
        );


        alert(

            "Unable to delete onboarding record.\n\n" +

            error.message

        );

    }

};


/* ==========================================
   VIEW ONBOARDING
========================================== */

window.viewOnboarding =
function(id){

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


    if(
        modalEmployeeName
    ){

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


    if(
        onboardingModal
    ){

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

    if(
        !modalChecklist
    ){

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
                function(){

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

    if(
        !modalChecklist
    ){

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
   MODAL PROGRESS
========================================== */

function updateModalProgress(
    checklist
){

    const progress =
        calculateProgress(
            checklist
        );


    if(
        modalProgress
    ){

        modalProgress.textContent =
            progress.percent +
            "%";

    }


    if(
        modalProgressBar
    ){

        modalProgressBar.style.width =
            progress.percent +
            "%";

    }


    if(
        modalProgressText
    ){

        modalProgressText.textContent =

            progress.completed +

            " / " +

            progress.total +

            " COMPLETED";

    }

}


/* ==========================================
   MODAL PROGRESS FROM UI
========================================== */

function updateModalProgressFromUI(){

    const checklist =
        getModalChecklist();


    updateModalProgress(
        checklist
    );

}


/* ==========================================
   UPDATE MODAL ONBOARDING
========================================== */

window.updateOnboarding =
async function(){

    if(
        !currentOnboardingId
    ){

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


        window.closeOnboardingModal();


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

    if(
        onboardingModal
    ){

        onboardingModal.style.display =
            "none";

    }


    currentOnboardingId =
        null;

};


/* ==========================================
   SEARCH
========================================== */

if(
    onboardingSearch
){

    onboardingSearch.addEventListener(
        "input",
        renderOnboarding
    );

}


/* ==========================================
   STATUS FILTER
========================================== */

if(
    onboardingStatusFilter
){

    onboardingStatusFilter.addEventListener(
        "change",
        renderOnboarding
    );

}


/* ==========================================
   DEPARTMENT FILTER
========================================== */

if(
    onboardingDepartmentFilter
){

    onboardingDepartmentFilter.addEventListener(
        "change",
        renderOnboarding
    );

}


/* ==========================================
   EMPLOYEE DROPDOWN
========================================== */

if(
    onboardingEmployeeSelect
){

    onboardingEmployeeSelect.addEventListener(
        "change",
        handleEmployeeSelection
    );

}


/* ==========================================
   MODAL OUTSIDE CLICK
========================================== */

if(
    onboardingModal
){

    onboardingModal.addEventListener(
        "click",
        function(event){

            if(
                event.target ===
                onboardingModal
            ){

                window.closeOnboardingModal();

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

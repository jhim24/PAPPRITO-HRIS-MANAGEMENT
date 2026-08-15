/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE ONBOARDING JS
   VERSION 2
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


/*
 * NEW EMPLOYEE DROPDOWN
 */

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

    /*
     * Support several possible
     * employee field naming styles.
     */

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


    /*
     * If the employee collection
     * already has a complete name,
     * use it as fallback.
     */

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


    /*
     * Firestore Timestamp
     */

    if(
        typeof value === "object" &&
        typeof value.toDate === "function"
    ){

        const date =
            value.toDate();


        return toInputDate(
            date
        );

    }


    /*
     * JavaScript Date
     */

    if(
        value instanceof Date
    ){

        return toInputDate(
            value
        );

    }


    /*
     * String date
     */

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

                const employee =
                    docSnap.data();


                employees.push({

                    firestoreId:
                        docSnap.id,

                    ...employee

                });

            }
        );


        /*
         * Sort employees alphabetically.
         */

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
Unable to load employees
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

        console.error(
            "Employee dropdown not found."
        );

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


            const position =
                getPosition(
                    employee
                );


            const department =
                getDepartment(
                    employee
                );


            /*
             * Don't add empty names.
             */

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


            /*
             * Use Firestore document ID
             * as the dropdown value.
             */

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


            /*
             * Store useful information
             * directly on option.
             */

            option.dataset.employeeId =
                employeeId;


            option.dataset.position =
                position;


            option.dataset.department =
                department;


            option.dataset.dateHired =
                getDateHired(
                    employee
                );


            onboardingEmployeeSelect.appendChild(
                option
            );

        }
    );

}


/* ==========================================
   EMPLOYEE SELECTED
========================================== */

function handleEmployeeSelection(){

    if(
        !onboardingEmployeeSelect
    ){

        return;

    }


    const firestoreId =
        onboardingEmployeeSelect.value;


    /*
     * Clear fields when no employee
     * is selected.
     */

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


    /*
     * The HTML has no visible
     * employee name input anymore,
     * but keep compatibility if it
     * exists.
     */

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


    console.log(
        "Selected employee:",
        employeeName
    );

}


/* ==========================================
   CLEAR SELECTED EMPLOYEE
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


    /*
     * Form department
     */

    if(
        onboardingDepartment
    ){

        /*
         * Department is disabled
         * because it is automatically
         * populated from employee.
         *
         * Don't overwrite selected
         * employee's department here.
         */

    }


    /*
     * Filter department
     */

    if(
        onboardingDepartmentFilter
    ){

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

            completed:0,

            total,

            percent:0

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
   LOAD ONBOARDING
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


        if(
            onboardingBody
        ){

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
   RENDER TABLE
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
   SUMMARY
========================================== */

function updateSummary(){

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
   OPEN FORM
========================================== */

window.openOnboardingForm =
function(){

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

};


/* ==========================================
   CLEAR FORM
========================================== */

window.clearOnboardingForm =
function(){

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

};


/* ==========================================
   SAVE ONBOARDING
========================================== */

window.saveOnboarding =
async function(){

    /*
     * Employee must be selected
     * from dropdown.
     */

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


    /*
     * Prevent duplicate onboarding.
     */

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


    if(
        modalEmployeeName
    ){

        modalEmployeeName.textContent =

            record.employeeName

            ||

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
   UPDATE ONBOARDING
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

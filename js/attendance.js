/* ==========================================
   PAPPRITO HRIS
   EMPLOYEE ATTENDANCE JAVASCRIPT
========================================== */

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   CONFIGURATION
========================================== */

const WORK_START_HOUR = 8;
const WORK_START_MINUTE = 0;

const REGULAR_HOURS = 8;

const LATE_GRACE_MINUTES = 0;


/* ==========================================
   DATA
========================================== */

let employees = [];

let attendanceRecords = [];

let selectedEmployee = null;


/* ==========================================
   ELEMENTS
========================================== */

const employeeSelect =
    document.getElementById("employeeSelect");

const fromDate =
    document.getElementById("fromDate");

const toDate =
    document.getElementById("toDate");

const employeeIdElement =
    document.getElementById("employeeId");

const employeeNameElement =
    document.getElementById("employeeName");

const clockElement =
    document.getElementById("clock");

const todayDateElement =
    document.getElementById("todayDate");

const todayStatus =
    document.getElementById("todayStatus");

const todayRegularHours =
    document.getElementById("todayRegularHours");

const todayOvertime =
    document.getElementById("todayOvertime");

const todayLate =
    document.getElementById("todayLate");

const attendanceBody =
    document.getElementById("attendanceBody");

const timeInBtn =
    document.getElementById("timeInBtn");

const breakOutBtn =
    document.getElementById("breakOutBtn");

const breakInBtn =
    document.getElementById("breakInBtn");

const timeOutBtn =
    document.getElementById("timeOutBtn");

const filterBtn =
    document.getElementById("filterBtn");

const summaryBtn =
    document.getElementById("summaryBtn");

const clearFilterBtn =
    document.getElementById("clearFilterBtn");

const printBtn =
    document.getElementById("printBtn");

const backBtn =
    document.getElementById("backBtn");


/* ==========================================
   BASIC HELPERS
========================================== */

function clean(value){

    return String(
        value ?? ""
    ).trim();

}


function numeric(value){

    const result =
        Number(value || 0);

    return Number.isFinite(result)
        ? result
        : 0;

}


function escapeHTML(value){

    return String(
        value ?? ""
    )

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
   DATE
========================================== */

function getToday(){

    const date =
        new Date();

    return [

        date.getFullYear(),

        String(
            date.getMonth() + 1
        ).padStart(2, "0"),

        String(
            date.getDate()
        ).padStart(2, "0")

    ].join("-");

}


function formatDate(value){

    const date =
        clean(value);

    if(!date){

        return "-";

    }

    const parts =
        date.split("-");

    if(parts.length !== 3){

        return date;

    }

    const result =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );

    if(
        Number.isNaN(
            result.getTime()
        )
    ){

        return date;

    }

    return result.toLocaleDateString(
        "en-US",
        {
            month:"short",
            day:"2-digit",
            year:"numeric"
        }
    );

}


/* ==========================================
   TIME
========================================== */

function getCurrentTime(){

    const date =
        new Date();

    return [

        String(
            date.getHours()
        ).padStart(2, "0"),

        String(
            date.getMinutes()
        ).padStart(2, "0"),

        String(
            date.getSeconds()
        ).padStart(2, "0")

    ].join(":");

}


function timeToMinutes(value){

    const time =
        clean(value);

    if(!time){

        return null;

    }

    const parts =
        time.split(":");

    if(parts.length < 2){

        return null;

    }

    const hours =
        Number(parts[0]);

    const minutes =
        Number(parts[1]);

    if(
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes)
    ){

        return null;

    }

    return (
        hours * 60
    ) + minutes;

}


function hoursFromMinutes(minutes){

    return numeric(minutes) / 60;

}


function formatHours(value){

    return numeric(value)
        .toFixed(2);

}


/* ==========================================
   EMPLOYEE HELPERS
========================================== */

function getEmployeeName(employee){

    if(!employee){

        return "";

    }

    const name = [

        employee.firstname,

        employee.middlename,

        employee.lastname

    ]

    .filter(
        value =>
            clean(value)
    )

    .join(" ")

    .replace(
        /\s+/g,
        " "
    )

    .trim();

    return (
        name ||
        employee.name ||
        employee.fullname ||
        ""
    );

}


function getRecordEmployeeId(record){

    return clean(

        record.employeeid ??
        record.empid ??
        record.employeeId ??
        ""

    );

}


function getRecordEmployeeName(record){

    return clean(

        record.employee ??
        record.employeeName ??
        record.name ??
        ""

    );

}


/* ==========================================
   COMPATIBILITY WITH OLD/NEW FIELDS
========================================== */

function getTimeIn(record){

    return clean(

        record.timeIn ??
        record.timein ??
        ""

    );

}


function getBreakOut(record){

    return clean(

        record.breakOut ??
        record.breakout ??
        ""

    );

}


function getBreakIn(record){

    return clean(

        record.breakIn ??
        record.breakin ??
        ""

    );

}


function getTimeOut(record){

    return clean(

        record.timeOut ??
        record.timeout ??
        ""

    );

}


/* ==========================================
   DEFAULT DATE
========================================== */

function setDefaultDates(){

    const today =
        getToday();

    if(fromDate){

        fromDate.value =
            today;

    }

    if(toDate){

        toDate.value =
            today;

    }

}


/* ==========================================
   CLOCK
========================================== */

function updateClock(){

    const now =
        new Date();

    if(clockElement){

        clockElement.textContent =
            now.toLocaleTimeString(
                "en-US",
                {
                    hour12:true
                }
            );

    }

    if(todayDateElement){

        todayDateElement.textContent =
            now.toLocaleDateString(
                "en-US",
                {
                    weekday:"long",
                    month:"long",
                    day:"numeric",
                    year:"numeric"
                }
            );

    }

}


updateClock();

setInterval(
    updateClock,
    1000
);


/* ==========================================
   LOAD EMPLOYEES
========================================== */

async function loadEmployees(){

    try{

        employees = [];

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "employees"
                )
            );

        snapshot.forEach(
            employeeDoc => {

                employees.push({

                    id:
                        employeeDoc.id,

                    ...employeeDoc.data()

                });

            }
        );


        employees.sort(
            (a,b) => {

                const nameA =
                    getEmployeeName(a)
                    .toLowerCase();

                const nameB =
                    getEmployeeName(b)
                    .toLowerCase();

                return nameA.localeCompare(
                    nameB
                );

            }
        );


        populateEmployees();


    }catch(error){

        console.error(
            "LOAD EMPLOYEES ERROR:",
            error
        );

        alert(
            "Unable to load employees.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   POPULATE EMPLOYEE SELECT
========================================== */

function populateEmployees(){

    if(!employeeSelect){

        return;

    }

    employeeSelect.innerHTML = `
        <option value="">
            Select Employee
        </option>
    `;


    employees.forEach(
        employee => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                employee.id;

            const employeeID =
                clean(
                    employee.employeeid ??
                    employee.empid ??
                    ""
                );

            const employeeName =
                getEmployeeName(
                    employee
                );


            option.textContent =
                employeeID
                ?
                `${employeeID} - ${employeeName}`
                :
                employeeName;


            employeeSelect.appendChild(
                option
            );

        }
    );

}


/* ==========================================
   SELECT EMPLOYEE
========================================== */

employeeSelect?.addEventListener(
    "change",
    async function(){

        selectedEmployee =
            employees.find(
                employee =>
                    employee.id ===
                    this.value
            ) || null;


        displayEmployee();


        updateActionButtons();


        updateTodaySummary();


        renderAttendance();

    }
);


/* ==========================================
   DISPLAY EMPLOYEE
========================================== */

function displayEmployee(){

    if(!selectedEmployee){

        if(employeeIdElement){

            employeeIdElement.textContent =
                "EMPLOYEE ID : -";

        }

        if(employeeNameElement){

            employeeNameElement.textContent =
                "EMPLOYEE NAME : -";

        }

        return;

    }


    const employeeID =
        clean(
            selectedEmployee.employeeid ??
            selectedEmployee.empid ??
            ""
        );


    const employeeName =
        getEmployeeName(
            selectedEmployee
        );


    if(employeeIdElement){

        employeeIdElement.textContent =
            `EMPLOYEE ID : ${
                employeeID || "-"
            }`;

    }


    if(employeeNameElement){

        employeeNameElement.textContent =
            `EMPLOYEE NAME : ${
                employeeName || "-"
            }`;

    }

}


/* ==========================================
   LOAD ATTENDANCE
========================================== */

async function loadAttendance(){

    try{

        attendanceRecords = [];


        if(attendanceBody){

            attendanceBody.innerHTML = `

                <tr>

                    <td
                    colspan="13"
                    class="empty-row">

                        <span
                        class="material-icons">

                            sync

                        </span>

                        <p>
                            Loading attendance...
                        </p>

                    </td>

                </tr>

            `;

        }


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "attendance"
                )
            );


        snapshot.forEach(
            attendanceDoc => {

                const data =
                    attendanceDoc.data();


                attendanceRecords.push({

                    id:
                        attendanceDoc.id,

                    ...data

                });

            }
        );


        attendanceRecords.sort(
            (a,b) => {

                const dateA =
                    clean(a.date);

                const dateB =
                    clean(b.date);


                if(
                    dateA !==
                    dateB
                ){

                    return dateB.localeCompare(
                        dateA
                    );

                }


                return clean(
                    getTimeIn(b)
                ).localeCompare(
                    clean(
                        getTimeIn(a)
                    )
                );

            }
        );


        renderAttendance();

        updateTodaySummary();

        updateActionButtons();


    }catch(error){

        console.error(
            "LOAD ATTENDANCE ERROR:",
            error
        );


        if(attendanceBody){

            attendanceBody.innerHTML = `

                <tr>

                    <td
                    colspan="13"
                    class="empty-row error-row">

                        <span
                        class="material-icons">

                            error_outline

                        </span>

                        <p>
                            Failed to load attendance.
                        </p>

                    </td>

                </tr>

            `;

        }


        alert(
            "Unable to load attendance.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   FILTER RECORDS
========================================== */

function getFilteredRecords(){

    const selectedID =
        selectedEmployee
        ?
        clean(
            selectedEmployee.employeeid ??
            selectedEmployee.empid ??
            ""
        ).toLowerCase()
        :
        "";


    const from =
        clean(
            fromDate?.value
        );


    const to =
        clean(
            toDate?.value
        );


    return attendanceRecords.filter(
        record => {

            const recordID =
                getRecordEmployeeId(
                    record
                ).toLowerCase();


            if(
                selectedID &&
                recordID !==
                selectedID
            ){

                return false;

            }


            const recordDate =
                clean(
                    record.date
                );


            if(
                from &&
                recordDate <
                from
            ){

                return false;

            }


            if(
                to &&
                recordDate >
                to
            ){

                return false;

            }


            return true;

        }
    );

}


/* ==========================================
   FILTER
========================================== */

function filterAttendance(){

    renderAttendance();

    updateTodaySummary();

}


/* ==========================================
   RENDER TABLE
========================================== */

function renderAttendance(){

    if(!attendanceBody){

        return;

    }


    const records =
        getFilteredRecords();


    attendanceBody.innerHTML =
        "";


    if(records.length === 0){

        attendanceBody.innerHTML = `

            <tr>

                <td
                colspan="13"
                class="empty-row">

                    <span
                    class="material-icons">

                        event_busy

                    </span>

                    <p>
                        No attendance records found.
                    </p>

                </td>

            </tr>

        `;

        return;

    }


    records.forEach(
        record => {

            const row =
                document.createElement(
                    "tr"
                );


            const breakHours =
                calculateBreakHours(
                    record
                );


            const regularHours =
                calculateRegularHours(
                    record
                );


            const overtime =
                calculateOvertime(
                    record
                );


            const late =
                calculateLateMinutes(
                    record
                );


            const status =
                getStatus(
                    record,
                    late
                );


            const statusClass =
                getStatusClass(
                    status
                );


            row.innerHTML = `

                <td>
                    ${
                        escapeHTML(
                            formatDate(
                                record.date
                            )
                        )
                    }
                </td>


                <td>
                    ${
                        escapeHTML(
                            getRecordEmployeeId(
                                record
                            ) || "-"
                        )
                    }
                </td>


                <td>
                    ${
                        escapeHTML(
                            getRecordEmployeeName(
                                record
                            ) || "-"
                        )
                    }
                </td>


                <td>
                    ${
                        escapeHTML(
                            getTimeIn(
                                record
                            ) || "-"
                        )
                    }
                </td>


                <td>
                    ${
                        escapeHTML(
                            getBreakOut(
                                record
                            ) || "-"
                        )
                    }
                </td>


                <td>
                    ${
                        escapeHTML(
                            getBreakIn(
                                record
                            ) || "-"
                        )
                    }
                </td>


                <td>
                    ${
                        escapeHTML(
                            getTimeOut(
                                record
                            ) || "-"
                        )
                    }
                </td>


                <td>
                    ${
                        formatHours(
                            breakHours
                        )
                    }
                </td>


                <td>
                    ${
                        formatHours(
                            regularHours
                        )
                    }
                </td>


                <td>
                    ${
                        formatHours(
                            overtime
                        )
                    }
                </td>


                <td>
                    ${late}
                </td>


                <td>

                    <span
                    class="status-badge ${
                        statusClass
                    }">

                        ${
                            escapeHTML(
                                status
                            )
                        }

                    </span>

                </td>


                <td class="action-cell">

                    <button
                    type="button"
                    class="table-icon-btn edit-action"
                    data-action="edit"
                    data-id="${
                        escapeHTML(
                            record.id
                        )
                    }"
                    title="Edit Attendance">

                        <span
                        class="material-icons">

                            edit

                        </span>

                    </button>


                    <button
                    type="button"
                    class="table-icon-btn delete-action"
                    data-action="delete"
                    data-id="${
                        escapeHTML(
                            record.id
                        )
                    }"
                    title="Delete Attendance">

                        <span
                        class="material-icons">

                            delete

                        </span>

                    </button>

                </td>

            `;


            attendanceBody.appendChild(
                row
            );

        }
    );

}


/* ==========================================
   TABLE ACTIONS
========================================== */

attendanceBody?.addEventListener(
    "click",
    function(event){

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if(!button){

            return;

        }


        const id =
            button.dataset.id;


        if(
            button.dataset.action ===
            "edit"
        ){

            editAttendance(id);

        }


        if(
            button.dataset.action ===
            "delete"
        ){

            deleteAttendance(id);

        }

    }
);


/* ==========================================
   BREAK HOURS
========================================== */

function calculateBreakHours(
    record
){

    const breakOut =
        timeToMinutes(
            getBreakOut(
                record
            )
        );


    const breakIn =
        timeToMinutes(
            getBreakIn(
                record
            )
        );


    if(
        breakOut === null ||
        breakIn === null
    ){

        return 0;

    }


    if(
        breakIn <=
        breakOut
    ){

        return 0;

    }


    return hoursFromMinutes(
        breakIn -
        breakOut
    );

}


/* ==========================================
   TOTAL WORK MINUTES
========================================== */

function calculateWorkMinutes(
    record
){

    const timeIn =
        timeToMinutes(
            getTimeIn(
                record
            )
        );


    const timeOut =
        timeToMinutes(
            getTimeOut(
                record
            )
        );


    if(
        timeIn === null ||
        timeOut === null
    ){

        return 0;

    }


    let totalMinutes =
        timeOut -
        timeIn;


    if(
        totalMinutes < 0
    ){

        totalMinutes +=
            24 * 60;

    }


    const breakMinutes =
        Math.round(
            calculateBreakHours(
                record
            ) * 60
        );


    totalMinutes -=
        breakMinutes;


    return Math.max(
        totalMinutes,
        0
    );

}


/* ==========================================
   REGULAR HOURS
========================================== */

function calculateRegularHours(
    record
){

    const totalMinutes =
        calculateWorkMinutes(
            record
        );


    const regularMinutes =
        REGULAR_HOURS *
        60;


    return hoursFromMinutes(

        Math.min(
            totalMinutes,
            regularMinutes
        )

    );

}


/* ==========================================
   OVERTIME
========================================== */

function calculateOvertime(
    record
){

    const totalMinutes =
        calculateWorkMinutes(
            record
        );


    const regularMinutes =
        REGULAR_HOURS *
        60;


    if(
        totalMinutes <=
        regularMinutes
    ){

        return 0;

    }


    return hoursFromMinutes(

        totalMinutes -
        regularMinutes

    );

}


/* ==========================================
   LATE
========================================== */

function calculateLateMinutes(
    record
){

    const timeIn =
        timeToMinutes(
            getTimeIn(
                record
            )
        );


    if(
        timeIn === null
    ){

        return 0;

    }


    const scheduledStart =
        (
            WORK_START_HOUR *
            60
        )
        +
        WORK_START_MINUTE;


    const late =
        timeIn -
        scheduledStart -
        LATE_GRACE_MINUTES;


    return late > 0
        ? late
        : 0;

}


/* ==========================================
   STATUS
========================================== */

function getStatus(
    record,
    late
){

    const savedStatus =
        clean(
            record.status
        );


    if(
        savedStatus
    ){

        return savedStatus;

    }


    if(
        !getTimeIn(record)
    ){

        return "Absent";

    }


    return late > 0
        ? "Late"
        : "Present";

}


/* ==========================================
   STATUS CLASS
========================================== */

function getStatusClass(
    status
){

    const value =
        clean(
            status
        ).toLowerCase();


    if(
        value === "present"
    ){

        return "status-present";

    }


    if(
        value === "late"
    ){

        return "status-late";

    }


    if(
        value === "absent"
    ){

        return "status-absent";

    }


    if(
        value.includes("leave")
    ){

        return "status-leave";

    }


    return "status-default";

}


/* ==========================================
   FIND TODAY RECORD
========================================== */

function findTodayRecord(){

    if(!selectedEmployee){

        return null;

    }


    const selectedID =
        clean(
            selectedEmployee.employeeid ??
            selectedEmployee.empid ??
            ""
        ).toLowerCase();


    return attendanceRecords.find(
        record => {

            const recordID =
                getRecordEmployeeId(
                    record
                ).toLowerCase();


            return (

                recordID ===
                selectedID

                &&

                clean(
                    record.date
                ) ===
                getToday()

            );

        }
    ) || null;

}


/* ==========================================
   CREATE TODAY RECORD
========================================== */

async function createTodayRecord(){

    if(!selectedEmployee){

        alert(
            "Please select an employee first."
        );

        return null;

    }


    const employeeID =
        clean(
            selectedEmployee.employeeid ??
            selectedEmployee.empid ??
            ""
        );


    const employeeName =
        getEmployeeName(
            selectedEmployee
        );


    const data = {

        date:
            getToday(),

        employeeid:
            employeeID,

        empid:
            employeeID,

        employee:
            employeeName,

        employeeName:
            employeeName,

        timeIn:
            "",

        breakOut:
            "",

        breakIn:
            "",

        timeOut:
            "",

        status:
            "Present",

        createdAt:
            Date.now(),

        updatedAt:
            Date.now()

    };


    const reference =
        await addDoc(
            collection(
                db,
                "attendance"
            ),
            data
        );


    const record = {

        id:
            reference.id,

        ...data

    };


    attendanceRecords.push(
        record
    );


    return record;

}


/* ==========================================
   GET OR CREATE TODAY
========================================== */

async function getTodayRecord(){

    let record =
        findTodayRecord();


    if(record){

        return record;

    }


    try{

        record =
            await createTodayRecord();


        return record;

    }catch(error){

        console.error(
            "CREATE TODAY RECORD ERROR:",
            error
        );


        alert(
            "Unable to create attendance record.\n\n" +
            error.message
        );


        return null;

    }

}


/* ==========================================
   UPDATE FIREBASE RECORD
========================================== */

async function saveAttendance(
    record,
    changes
){

    if(!record){

        return false;

    }


    try{

        const updateData = {

            ...changes,

            updatedAt:
                Date.now()

        };


        await updateDoc(

            doc(
                db,
                "attendance",
                record.id
            ),

            updateData

        );


        Object.assign(
            record,
            updateData
        );


        renderAttendance();

        updateTodaySummary();

        updateActionButtons();


        return true;


    }catch(error){

        console.error(
            "SAVE ATTENDANCE ERROR:",
            error
        );


        alert(
            "Unable to save attendance.\n\n" +
            error.message
        );


        return false;

    }

}


/* ==========================================
   TIME IN
========================================== */

async function timeIn(){

    if(!selectedEmployee){

        alert(
            "Please select an employee first."
        );

        return;

    }


    const record =
        await getTodayRecord();


    if(!record){

        return;

    }


    if(
        getTimeIn(record)
    ){

        alert(
            "Time In has already been recorded."
        );

        return;

    }


    const currentTime =
        getCurrentTime();


    const late =
        calculateLateMinutes({

            timeIn:
                currentTime

        });


    const status =
        late > 0
            ? "Late"
            : "Present";


    const saved =
        await saveAttendance(
            record,
            {

                timeIn:
                    currentTime,

                status:
                    status

            }
        );


    if(saved){

        alert(

            late > 0

            ?

            `Time In recorded.\n\nLate: ${late} minute(s).`

            :

            "Time In recorded successfully."

        );

    }

}


/* ==========================================
   BREAK OUT
========================================== */

async function breakOut(){

    if(!selectedEmployee){

        alert(
            "Please select an employee first."
        );

        return;

    }


    const record =
        await getTodayRecord();


    if(!record){

        return;

    }


    if(
        !getTimeIn(record)
    ){

        alert(
            "Please record Time In first."
        );

        return;

    }


    if(
        getBreakOut(record)
    ){

        alert(
            "Break Out has already been recorded."
        );

        return;

    }


    if(
        getTimeOut(record)
    ){

        alert(
            "Time Out has already been recorded."
        );

        return;

    }


    const saved =
        await saveAttendance(
            record,
            {

                breakOut:
                    getCurrentTime()

            }
        );


    if(saved){

        alert(
            "Break Out recorded successfully."
        );

    }

}


/* ==========================================
   BREAK IN
========================================== */

async function breakIn(){

    if(!selectedEmployee){

        alert(
            "Please select an employee first."
        );

        return;

    }


    const record =
        await getTodayRecord();


    if(!record){

        return;

    }


    if(
        !getTimeIn(record)
    ){

        alert(
            "Please record Time In first."
        );

        return;

    }


    if(
        !getBreakOut(record)
    ){

        alert(
            "Please record Break Out first."
        );

        return;

    }


    if(
        getBreakIn(record)
    ){

        alert(
            "Break In has already been recorded."
        );

        return;

    }


    if(
        getTimeOut(record)
    ){

        alert(
            "Time Out has already been recorded."
        );

        return;

    }


    const saved =
        await saveAttendance(
            record,
            {

                breakIn:
                    getCurrentTime()

            }
        );


    if(saved){

        alert(
            "Break In recorded successfully."
        );

    }

}


/* ==========================================
   TIME OUT
========================================== */

async function timeOut(){

    if(!selectedEmployee){

        alert(
            "Please select an employee first."
        );

        return;

    }


    const record =
        await getTodayRecord();


    if(!record){

        return;

    }


    if(
        !getTimeIn(record)
    ){

        alert(
            "Please record Time In first."
        );

        return;

    }


    if(
        getTimeOut(record)
    ){

        alert(
            "Time Out has already been recorded."
        );

        return;

    }


    if(
        getBreakOut(record) &&
        !getBreakIn(record)
    ){

        alert(
            "Please record Break In before Time Out."
        );

        return;

    }


    const currentTime =
        getCurrentTime();


    const late =
        calculateLateMinutes(
            record
        );


    const status =
        late > 0
            ? "Late"
            : "Present";


    const saved =
        await saveAttendance(
            record,
            {

                timeOut:
                    currentTime,

                status:
                    status

            }
        );


    if(saved){

        const regular =
            calculateRegularHours(
                record
            );


        const overtime =
            calculateOvertime(
                record
            );


        alert(

            "Time Out recorded successfully.\n\n" +

            "Regular Hours: " +
            formatHours(
                regular
            ) +

            "\n" +

            "Overtime: " +
            formatHours(
                overtime
            )

        );

    }

}


/* ==========================================
   TODAY SUMMARY
========================================== */

function updateTodaySummary(){

    const record =
        findTodayRecord();


    if(!record){

        if(todayStatus){

            todayStatus.textContent =
                "-";

        }

        if(todayRegularHours){

            todayRegularHours.textContent =
                "0.00";

        }

        if(todayOvertime){

            todayOvertime.textContent =
                "0.00";

        }

        if(todayLate){

            todayLate.textContent =
                "0";

        }

        return;

    }


    const late =
        calculateLateMinutes(
            record
        );


    const regular =
        calculateRegularHours(
            record
        );


    const overtime =
        calculateOvertime(
            record
        );


    const status =
        getStatus(
            record,
            late
        );


    if(todayStatus){

        todayStatus.textContent =
            status;

    }


    if(todayRegularHours){

        todayRegularHours.textContent =
            formatHours(
                regular
            );

    }


    if(todayOvertime){

        todayOvertime.textContent =
            formatHours(
                overtime
            );

    }


    if(todayLate){

        todayLate.textContent =
            String(late);

    }

}


/* ==========================================
   BUTTON STATES
========================================== */

function updateActionButtons(){

    if(!selectedEmployee){

        timeInBtn.disabled =
            true;

        breakOutBtn.disabled =
            true;

        breakInBtn.disabled =
            true;

        timeOutBtn.disabled =
            true;

        return;

    }


    const record =
        findTodayRecord();


    if(!record){

        timeInBtn.disabled =
            false;

        breakOutBtn.disabled =
            true;

        breakInBtn.disabled =
            true;

        timeOutBtn.disabled =
            true;

        return;

    }


    const hasTimeIn =
        Boolean(
            getTimeIn(record)
        );


    const hasBreakOut =
        Boolean(
            getBreakOut(record)
        );


    const hasBreakIn =
        Boolean(
            getBreakIn(record)
        );


    const hasTimeOut =
        Boolean(
            getTimeOut(record)
        );


    timeInBtn.disabled =
        hasTimeIn ||
        hasTimeOut;


    breakOutBtn.disabled =
        !hasTimeIn ||
        hasBreakOut ||
        hasTimeOut;


    breakInBtn.disabled =
        !hasBreakOut ||
        hasBreakIn ||
        hasTimeOut;


    timeOutBtn.disabled =
        !hasTimeIn ||
        hasTimeOut ||
        (
            hasBreakOut &&
            !hasBreakIn
        );

}


/* ==========================================
   SUMMARY
========================================== */

function showSummary(){

    const records =
        getFilteredRecords();


    let present =
        0;

    let lateCount =
        0;

    let absent =
        0;

    let totalRegular =
        0;

    let totalOvertime =
        0;

    let totalLate =
        0;


    records.forEach(
        record => {

            const late =
                calculateLateMinutes(
                    record
                );


            const regular =
                calculateRegularHours(
                    record
                );


            const overtime =
                calculateOvertime(
                    record
                );


            const status =
                getStatus(
                    record,
                    late
                ).toLowerCase();


            if(
                status === "present"
            ){

                present++;

            }


            if(
                status === "late"
            ){

                lateCount++;

            }


            if(
                status === "absent"
            ){

                absent++;

            }


            totalRegular +=
                regular;


            totalOvertime +=
                overtime;


            totalLate +=
                late;

        }
    );


    const employee =
        selectedEmployee
        ?
        getEmployeeName(
            selectedEmployee
        )
        :
        "All Employees";


    alert(

        "ATTENDANCE SUMMARY\n\n" +

        "Employee: " +
        employee +

        "\n\n" +

        "Records: " +
        records.length +

        "\n" +

        "Present: " +
        present +

        "\n" +

        "Late: " +
        lateCount +

        "\n" +

        "Absent: " +
        absent +

        "\n\n" +

        "Regular Hours: " +
        formatHours(
            totalRegular
        ) +

        "\n" +

        "Overtime: " +
        formatHours(
            totalOvertime
        ) +

        "\n" +

        "Late Minutes: " +
        totalLate

    );

}


/* ==========================================
   CLEAR FILTER
========================================== */

function clearFilter(){

    if(employeeSelect){

        employeeSelect.value =
            "";

    }


    selectedEmployee =
        null;


    setDefaultDates();

    displayEmployee();

    renderAttendance();

    updateTodaySummary();

    updateActionButtons();

}


/* ==========================================
   EDIT ATTENDANCE
========================================== */

async function editAttendance(id){

    const record =
        attendanceRecords.find(
            item =>
                item.id === id
        );


    if(!record){

        alert(
            "Attendance record not found."
        );

        return;

    }


    const newTimeIn =
        prompt(

            "TIME IN\n\n" +

            "Current: " +
            (
                getTimeIn(record) ||
                "-"
            ) +

            "\n\nEnter new time:",

            getTimeIn(record)

        );


    if(newTimeIn === null){

        return;

    }


    const newBreakOut =
        prompt(

            "BREAK OUT\n\n" +

            "Current: " +
            (
                getBreakOut(record) ||
                "-"
            ) +

            "\n\nEnter new time:",

            getBreakOut(record)

        );


    if(newBreakOut === null){

        return;

    }


    const newBreakIn =
        prompt(

            "BREAK IN\n\n" +

            "Current: " +
            (
                getBreakIn(record) ||
                "-"
            ) +

            "\n\nEnter new time:",

            getBreakIn(record)

        );


    if(newBreakIn === null){

        return;

    }


    const newTimeOut =
        prompt(

            "TIME OUT\n\n" +

            "Current: " +
            (
                getTimeOut(record) ||
                "-"
            ) +

            "\n\nEnter new time:",

            getTimeOut(record)

        );


    if(newTimeOut === null){

        return;

    }


    const late =
        calculateLateMinutes({

            timeIn:
                newTimeIn

        });


    const status =
        late > 0
            ? "Late"
            : "Present";


    const saved =
        await saveAttendance(
            record,
            {

                timeIn:
                    clean(
                        newTimeIn
                    ),

                breakOut:
                    clean(
                        newBreakOut
                    ),

                breakIn:
                    clean(
                        newBreakIn
                    ),

                timeOut:
                    clean(
                        newTimeOut
                    ),

                status:
                    status

            }
        );


    if(saved){

        alert(
            "Attendance updated successfully."
        );

    }

}


/* ==========================================
   DELETE
========================================== */

async function deleteAttendance(id){

    const record =
        attendanceRecords.find(
            item =>
                item.id === id
        );


    if(!record){

        alert(
            "Attendance record not found."
        );

        return;

    }


    const confirmed =
        confirm(

            "DELETE ATTENDANCE?\n\n" +

            "Date: " +
            (
                record.date ||
                "-"
            ) +

            "\nEmployee: " +
            (
                getRecordEmployeeName(
                    record
                ) ||
                "-"
            )

        );


    if(!confirmed){

        return;

    }


    try{

        await deleteDoc(

            doc(
                db,
                "attendance",
                id
            )

        );


        attendanceRecords =
            attendanceRecords.filter(
                item =>
                    item.id !== id
            );


        renderAttendance();

        updateTodaySummary();

        updateActionButtons();


        alert(
            "Attendance deleted successfully."
        );


    }catch(error){

        console.error(
            "DELETE ERROR:",
            error
        );


        alert(
            "Unable to delete attendance.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   PRINT
========================================== */

function printAttendance(){

    window.print();

}


/* ==========================================
   EVENTS
========================================== */

timeInBtn?.addEventListener(
    "click",
    timeIn
);


breakOutBtn?.addEventListener(
    "click",
    breakOut
);


breakInBtn?.addEventListener(
    "click",
    breakIn
);


timeOutBtn?.addEventListener(
    "click",
    timeOut
);


filterBtn?.addEventListener(
    "click",
    filterAttendance
);


summaryBtn?.addEventListener(
    "click",
    showSummary
);


clearFilterBtn?.addEventListener(
    "click",
    clearFilter
);


printBtn?.addEventListener(
    "click",
    printAttendance
);


backBtn?.addEventListener(
    "click",
    function(){

        window.location.href =
            "dashboard.html";

    }
);


fromDate?.addEventListener(
    "change",
    filterAttendance
);


toDate?.addEventListener(
    "change",
    filterAttendance
);


/* ==========================================
   GLOBAL FUNCTIONS
   COMPATIBILITY
========================================== */

window.timeIn =
    timeIn;

window.breakOut =
    breakOut;

window.breakIn =
    breakIn;

window.timeOut =
    timeOut;

window.filterAttendance =
    filterAttendance;

window.showSummary =
    showSummary;

window.clearFilter =
    clearFilter;

window.editAttendance =
    editAttendance;

window.deleteAttendance =
    deleteAttendance;

window.printAttendance =
    printAttendance;


/* ==========================================
   INITIALIZE
========================================== */

async function initialize(){

    setDefaultDates();

    updateClock();

    displayEmployee();

    updateActionButtons();

    await loadEmployees();

    await loadAttendance();

}


initialize();

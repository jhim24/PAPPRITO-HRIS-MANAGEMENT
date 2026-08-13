/* ==========================================
   PAPPRITO HRIS
   ATTENDANCE MANAGEMENT JS
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
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   GLOBAL VARIABLES
========================================== */

let employees = [];

let attendanceRecords = [];

let selectedEmployee = null;

let editingAttendanceId = null;


/*
 * Standard work schedule
 */

const WORK_START_HOUR = 8;

const WORK_START_MINUTE = 0;


/*
 * Regular working hours
 */

const REGULAR_HOURS = 8;


/*
 * Late grace period
 *
 * 08:00 = on time
 * 08:01 = late
 */

const LATE_GRACE_MINUTES = 0;


/* ==========================================
   ELEMENTS
========================================== */

const employeeSelect =
    document.getElementById(
        "employeeSelect"
    );


const fromDate =
    document.getElementById(
        "fromDate"
    );


const toDate =
    document.getElementById(
        "toDate"
    );


const attendanceBody =
    document.getElementById(
        "attendanceBody"
    );


const employeeIdElement =
    document.getElementById(
        "employeeId"
    );


const employeeNameElement =
    document.getElementById(
        "employeeName"
    );


const clockElement =
    document.getElementById(
        "clock"
    );


const todayDateElement =
    document.getElementById(
        "todayDate"
    );


const todayStatus =
    document.getElementById(
        "todayStatus"
    );


const todayRegularHours =
    document.getElementById(
        "todayRegularHours"
    );


const todayOvertime =
    document.getElementById(
        "todayOvertime"
    );


const todayLate =
    document.getElementById(
        "todayLate"
    );


/* ==========================================
   BASIC HELPERS
========================================== */

function text(
    value
){

    return String(
        value ?? ""
    ).trim();

}


function number(
    value
){

    const result =
        Number(
            value || 0
        );


    return Number.isFinite(
        result
    )
    ?
    result
    :
    0;

}


function escapeHTML(
    value
){

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
   DATE HELPERS
========================================== */

function getToday(){

    const date =
        new Date();


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
   TIME
========================================== */

function getCurrentTime(){

    const date =
        new Date();


    const hours =
        String(
            date.getHours()
        )
        .padStart(
            2,
            "0"
        );


    const minutes =
        String(
            date.getMinutes()
        )
        .padStart(
            2,
            "0"
        );


    const seconds =
        String(
            date.getSeconds()
        )
        .padStart(
            2,
            "0"
        );


    return `${hours}:${minutes}:${seconds}`;

}


/* ==========================================
   DISPLAY CLOCK
========================================== */

function updateClock(){

    if(clockElement){

        clockElement.innerText =
            getCurrentTime();

    }


    if(todayDateElement){

        const date =
            new Date();


        todayDateElement.innerText =
            date.toLocaleDateString(
                "en-US",
                {
                    weekday:"long",
                    year:"numeric",
                    month:"long",
                    day:"numeric"
                }
            );

    }

}


setInterval(
    updateClock,
    1000
);


/* ==========================================
   TIME TO MINUTES
========================================== */

function timeToMinutes(
    time
){

    if(!time){

        return null;

    }


    const parts =
        String(
            time
        )
        .split(":");


    if(parts.length < 2){

        return null;

    }


    const hours =
        Number(
            parts[0]
        );


    const minutes =
        Number(
            parts[1]
        );


    if(
        !Number.isFinite(hours)
        ||
        !Number.isFinite(minutes)
    ){

        return null;

    }


    return (
        hours * 60
    )
    +
    minutes;

}


/* ==========================================
   MINUTES TO HOURS
========================================== */

function minutesToHours(
    minutes
){

    return (
        number(minutes)
        /
        60
    );

}


/* ==========================================
   FORMAT HOURS
========================================== */

function formatHours(
    hours
){

    return number(
        hours
    )
    .toFixed(2);

}


/* ==========================================
   FULL EMPLOYEE NAME
========================================== */

function getEmployeeName(
    employee
){

    return [

        employee.firstname,

        employee.middlename,

        employee.lastname

    ]

    .filter(Boolean)

    .join(" ")

    .replace(
        /\s+/g,
        " "
    )

    .trim();

}


/* ==========================================
   SET DEFAULT DATES
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
            docSnap => {

                employees.push({

                    id:
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
                    getEmployeeName(
                        a
                    )
                    .toLowerCase();


                const nameB =
                    getEmployeeName(
                        b
                    )
                    .toLowerCase();


                return nameA.localeCompare(
                    nameB
                );

            }
        );


        populateEmployeeSelect();


    }catch(error){

        console.error(
            "Employee Load Error:",
            error
        );


        alert(
            "Failed to load employees.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   POPULATE EMPLOYEE SELECT
========================================== */

function populateEmployeeSelect(){

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

            if(
                employee.status &&
                employee.status !== "Active"
            ){

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                employee.id;


            option.textContent =

                `${employee.employeeid || ""} - ` +
                `${getEmployeeName(employee)}`;


            employeeSelect.appendChild(
                option
            );

        }
    );

}


/* ==========================================
   EMPLOYEE SELECT CHANGE
========================================== */

if(employeeSelect){

    employeeSelect.addEventListener(
        "change",
        function(){

            const employeeDocId =
                this.value;


            selectedEmployee =
                employees.find(
                    employee =>
                        employee.id ===
                        employeeDocId
                )
                ||
                null;


            displaySelectedEmployee();

            loadAttendance();

        }
    );

}


/* ==========================================
   DISPLAY SELECTED EMPLOYEE
========================================== */

function displaySelectedEmployee(){

    if(
        !selectedEmployee
    ){

        if(employeeIdElement){

            employeeIdElement.innerText =
                "EMPLOYEE ID : -";

        }


        if(employeeNameElement){

            employeeNameElement.innerText =
                "EMPLOYEE NAME : -";

        }


        return;

    }


    if(employeeIdElement){

        employeeIdElement.innerText =
            "EMPLOYEE ID : " +
            (
                selectedEmployee.employeeid
                ||
                "-"
            );

    }


    if(employeeNameElement){

        employeeNameElement.innerText =
            "EMPLOYEE NAME : " +
            (
                getEmployeeName(
                    selectedEmployee
                )
                ||
                "-"
            );

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

    <span class="material-icons">
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
            docSnap => {

                attendanceRecords.push({

                    id:
                        docSnap.id,

                    ...docSnap.data()

                });

            }
        );


        attendanceRecords.sort(
            (
                a,
                b
            ) => {

                const dateA =
                    String(
                        a.date || ""
                    );


                const dateB =
                    String(
                        b.date || ""
                    );


                if(
                    dateA !== dateB
                ){

                    return dateB.localeCompare(
                        dateA
                    );

                }


                return String(
                    b.timeIn || ""
                )
                .localeCompare(
                    String(
                        a.timeIn || ""
                    )
                );

            }
        );


        renderAttendance();

        updateTodaySummary();


    }catch(error){

        console.error(
            "Attendance Load Error:",
            error
        );


        if(attendanceBody){

            attendanceBody.innerHTML = `

<tr>

<td
    colspan="13"
    class="empty-row">

    <span class="material-icons">
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
            "Failed to load attendance.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   FILTER ATTENDANCE
========================================== */

window.filterAttendance =
function(){

    renderAttendance();

    updateTodaySummary();

};


/* ==========================================
   RENDER ATTENDANCE
========================================== */

function renderAttendance(){

    if(!attendanceBody){

        return;

    }


    attendanceBody.innerHTML =
        "";


    const selectedId =
        selectedEmployee
        ?
        String(
            selectedEmployee.employeeid ||
            ""
        )
        .trim()
        .toUpperCase()
        :
        "";


    const from =
        fromDate
        ?
        fromDate.value
        :
        "";


    const to =
        toDate
        ?
        toDate.value
        :
        "";


    let records =
        attendanceRecords.filter(
            record => {

                /*
                 * EMPLOYEE FILTER
                 */

                if(selectedId){

                    const recordEmployeeId =
                        String(
                            record.employeeid ||
                            record.empid ||
                            ""
                        )
                        .trim()
                        .toUpperCase();


                    if(
                        recordEmployeeId !==
                        selectedId
                    ){

                        return false;

                    }

                }


                /*
                 * DATE FILTER
                 */

                const date =
                    String(
                        record.date || ""
                    );


                if(
                    from &&
                    date < from
                ){

                    return false;

                }


                if(
                    to &&
                    date > to
                ){

                    return false;

                }


                return true;

            }
        );


    if(records.length === 0){

        attendanceBody.innerHTML = `

<tr>

<td
    colspan="13"
    class="empty-row">

    <span class="material-icons">
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
                getAttendanceStatus(
                    record,
                    late
                );


            const statusClass =
                getStatusClass(
                    status
                );


            row.innerHTML = `

<td>
    ${escapeHTML(
        record.date || "-"
    )}
</td>


<td>
    ${escapeHTML(
        record.employeeid ||
        record.empid ||
        "-"
    )}
</td>


<td>
    ${escapeHTML(
        record.employee ||
        record.employeeName ||
        "-"
    )}
</td>


<td>
    ${escapeHTML(
        record.timeIn ||
        "-"
    )}
</td>


<td>
    ${escapeHTML(
        record.breakOut ||
        "-"
    )}
</td>


<td>
    ${escapeHTML(
        record.breakIn ||
        "-"
    )}
</td>


<td>
    ${escapeHTML(
        record.timeOut ||
        "-"
    )}
</td>


<td>
    ${formatHours(
        breakHours
    )}
</td>


<td>
    ${formatHours(
        regularHours
    )}
</td>


<td>
    ${formatHours(
        overtime
    )}
</td>


<td>
    ${late}
</td>


<td class="${statusClass}">
    ${escapeHTML(
        status
    )}
</td>


<td>

<button
    class="table-icon-btn"
    type="button"
    title="Edit Attendance"
    onclick="editAttendance(
        '${record.id}'
    )">

    <span class="material-icons">
        edit
    </span>

</button>


<button
    class="table-icon-btn"
    type="button"
    title="Delete Attendance"
    onclick="deleteAttendance(
        '${record.id}'
    )">

    <span class="material-icons">
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
   CALCULATE BREAK HOURS
========================================== */

function calculateBreakHours(
    record
){

    const breakOut =
        timeToMinutes(
            record.breakOut
        );


    const breakIn =
        timeToMinutes(
            record.breakIn
        );


    if(
        breakOut === null ||
        breakIn === null
    ){

        return 0;

    }


    if(
        breakIn <= breakOut
    ){

        return 0;

    }


    return minutesToHours(
        breakIn -
        breakOut
    );

}


/* ==========================================
   CALCULATE WORK HOURS
========================================== */

function calculateWorkMinutes(
    record
){

    const timeIn =
        timeToMinutes(
            record.timeIn
        );


    const timeOut =
        timeToMinutes(
            record.timeOut
        );


    if(
        timeIn === null ||
        timeOut === null
    ){

        return 0;

    }


    let minutes =
        timeOut -
        timeIn;


    if(minutes < 0){

        minutes +=
            24 * 60;

    }


    /*
     * Remove break
     */

    const breakMinutes =
        Math.round(
            calculateBreakHours(
                record
            )
            *
            60
        );


    minutes -=
        breakMinutes;


    if(minutes < 0){

        minutes = 0;

    }


    return minutes;

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
        Math.min(
            totalMinutes,
            REGULAR_HOURS * 60
        );


    return minutesToHours(
        regularMinutes
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
        REGULAR_HOURS * 60;


    if(
        totalMinutes <=
        regularMinutes
    ){

        return 0;

    }


    return minutesToHours(

        totalMinutes -
        regularMinutes

    );

}


/* ==========================================
   LATE MINUTES
========================================== */

function calculateLateMinutes(
    record
){

    const timeIn =
        timeToMinutes(
            record.timeIn
        );


    if(timeIn === null){

        return 0;

    }


    const scheduledStart =
        (
            WORK_START_HOUR * 60
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
   ATTENDANCE STATUS
========================================== */

function getAttendanceStatus(
    record,
    late
){

    if(
        record.status
        &&
        record.status !== "Present"
        &&
        record.status !== "Late"
    ){

        return record.status;

    }


    if(
        !record.timeIn
    ){

        return "Absent";

    }


    if(
        record.timeOut
    ){

        return late > 0
            ? "Late"
            : "Present";

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

    const normalized =
        String(
            status || ""
        )
        .toLowerCase();


    if(
        normalized === "present"
    ){

        return "status-present";

    }


    if(
        normalized === "late"
    ){

        return "status-late";

    }


    if(
        normalized === "absent"
    ){

        return "status-absent";

    }


    if(
        normalized.includes(
            "leave"
        )
    ){

        return "status-leave";

    }


    return "";

}


/* ==========================================
   FIND TODAY RECORD
========================================== */

function findTodayRecord(){

    if(
        !selectedEmployee
    ){

        return null;

    }


    const employeeId =
        String(
            selectedEmployee.employeeid ||
            ""
        )
        .trim()
        .toUpperCase();


    const today =
        getToday();


    return attendanceRecords.find(
        record => {

            const recordEmployeeId =
                String(
                    record.employeeid ||
                    record.empid ||
                    ""
                )
                .trim()
                .toUpperCase();


            return (

                recordEmployeeId ===
                employeeId

            )
            &&
            (
                record.date ===
                today
            );

        }
    )
    ||
    null;

}


/* ==========================================
   CREATE OR FIND TODAY RECORD
========================================== */

async function getOrCreateTodayRecord(){

    if(
        !selectedEmployee
    ){

        alert(
            "Please select an employee first."
        );

        return null;

    }


    const today =
        getToday();


    let record =
        findTodayRecord();


    if(record){

        return record;

    }


    const employeeName =
        getEmployeeName(
            selectedEmployee
        );


    const employeeId =
        text(
            selectedEmployee.employeeid
        );


    try{

        const newRecord = {

            date:
                today,

            employeeid:
                employeeId,

            empid:
                employeeId,

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

                newRecord

            );


        record = {

            id:
                reference.id,

            ...newRecord

        };


        attendanceRecords.push(
            record
        );


        return record;


    }catch(error){

        console.error(
            "Create Attendance Error:",
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
   SAVE ATTENDANCE RECORD
========================================== */

async function saveAttendanceRecord(
    record,
    changes
){

    if(!record){

        return false;

    }


    try{

        const updatedData = {

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

            updatedData

        );


        Object.assign(
            record,
            updatedData
        );


        renderAttendance();

        updateTodaySummary();


        return true;


    }catch(error){

        console.error(
            "Attendance Save Error:",
            error
        );


        alert(
            "Failed to save attendance.\n\n" +
            error.message
        );


        return false;

    }

}


/* ==========================================
   TIME IN
========================================== */

window.timeIn =
async function(){

    if(
        !selectedEmployee
    ){

        alert(
            "Please select an employee first."
        );

        return;

    }


    let record =
        await getOrCreateTodayRecord();


    if(!record){

        return;

    }


    if(record.timeIn){

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
        await saveAttendanceRecord(

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
            `Time In recorded.\nLate: ${late} minute(s)`
            :
            "Time In recorded successfully."
        );

    }

};


/* ==========================================
   BREAK OUT
========================================== */

window.breakOut =
async function(){

    if(
        !selectedEmployee
    ){

        alert(
            "Please select an employee first."
        );

        return;

    }


    let record =
        await getOrCreateTodayRecord();


    if(!record){

        return;

    }


    if(!record.timeIn){

        alert(
            "Please record Time In first."
        );

        return;

    }


    if(record.breakOut){

        alert(
            "Break Out has already been recorded."
        );

        return;

    }


    if(record.timeOut){

        alert(
            "Time Out has already been recorded."
        );

        return;

    }


    const saved =
        await saveAttendanceRecord(

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

};


/* ==========================================
   BREAK IN
========================================== */

window.breakIn =
async function(){

    if(
        !selectedEmployee
    ){

        alert(
            "Please select an employee first."
        );

        return;

    }


    let record =
        await getOrCreateTodayRecord();


    if(!record){

        return;

    }


    if(!record.breakOut){

        alert(
            "Please record Break Out first."
        );

        return;

    }


    if(record.breakIn){

        alert(
            "Break In has already been recorded."
        );

        return;

    }


    if(record.timeOut){

        alert(
            "Time Out has already been recorded."
        );

        return;

    }


    const saved =
        await saveAttendanceRecord(

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

};


/* ==========================================
   TIME OUT
========================================== */

window.timeOut =
async function(){

    if(
        !selectedEmployee
    ){

        alert(
            "Please select an employee first."
        );

        return;

    }


    let record =
        await getOrCreateTodayRecord();


    if(!record){

        return;

    }


    if(!record.timeIn){

        alert(
            "Please record Time In first."
        );

        return;

    }


    if(record.timeOut){

        alert(
            "Time Out has already been recorded."
        );

        return;

    }


    if(
        record.breakOut &&
        !record.breakIn
    ){

        alert(
            "Please record Break In before Time Out."
        );

        return;

    }


    const currentTime =
        getCurrentTime();


    const late =
        calculateLateMinutes({

            timeIn:
                record.timeIn

        });


    const status =
        late > 0
        ? "Late"
        : "Present";


    const saved =
        await saveAttendanceRecord(

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

};


/* ==========================================
   UPDATE TODAY SUMMARY
========================================== */

function updateTodaySummary(){

    const record =
        findTodayRecord();


    if(!record){

        if(todayStatus){

            todayStatus.innerText =
                "-";

        }


        if(todayRegularHours){

            todayRegularHours.innerText =
                "0.00";

        }


        if(todayOvertime){

            todayOvertime.innerText =
                "0.00";

        }


        if(todayLate){

            todayLate.innerText =
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
        getAttendanceStatus(
            record,
            late
        );


    if(todayStatus){

        todayStatus.innerText =
            status;

    }


    if(todayRegularHours){

        todayRegularHours.innerText =
            formatHours(
                regular
            );

    }


    if(todayOvertime){

        todayOvertime.innerText =
            formatHours(
                overtime
            );

    }


    if(todayLate){

        todayLate.innerText =
            late;

    }

}


/* ==========================================
   SUMMARY
========================================== */

window.showAttendanceSummary =
function(){

    const selectedId =
        selectedEmployee
        ?
        String(
            selectedEmployee.employeeid ||
            ""
        )
        .trim()
        .toUpperCase()
        :
        "";


    const from =
        fromDate
        ?
        fromDate.value
        :
        "";


    const to =
        toDate
        ?
        toDate.value
        :
        "";


    const records =
        attendanceRecords.filter(
            record => {

                if(selectedId){

                    const id =
                        String(
                            record.employeeid ||
                            record.empid ||
                            ""
                        )
                        .trim()
                        .toUpperCase();


                    if(
                        id !==
                        selectedId
                    ){

                        return false;

                    }

                }


                const date =
                    String(
                        record.date || ""
                    );


                if(
                    from &&
                    date < from
                ){

                    return false;

                }


                if(
                    to &&
                    date > to
                ){

                    return false;

                }


                return true;

            }
        );


    let present = 0;

    let lateCount = 0;

    let absent = 0;

    let totalRegular = 0;

    let totalOT = 0;

    let totalLate = 0;


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
                getAttendanceStatus(
                    record,
                    late
                );


            if(
                status ===
                "Present"
            ){

                present++;

            }


            if(
                status ===
                "Late"
            ){

                lateCount++;

            }


            if(
                status ===
                "Absent"
            ){

                absent++;

            }


            totalRegular +=
                regular;


            totalOT +=
                overtime;


            totalLate +=
                late;

        }
    );


    const employeeName =
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
        employeeName +
        "\n" +

        "Period: " +
        (
            from ||
            "All"
        ) +
        " to " +
        (
            to ||
            "All"
        ) +
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
            totalOT
        ) +
        "\n" +

        "Late Minutes: " +
        totalLate

    );

};


/* ==========================================
   CLEAR FILTER
========================================== */

window.clearAttendanceFilter =
function(){

    if(employeeSelect){

        employeeSelect.value =
            "";

    }


    selectedEmployee =
        null;


    setDefaultDates();

    displaySelectedEmployee();

    renderAttendance();

    updateTodaySummary();

};


/* ==========================================
   REFRESH
========================================== */

window.refreshAttendance =
async function(){

    await loadEmployees();

    await loadAttendance();


    /*
     * Restore selected employee
     */

    if(
        employeeSelect &&
        selectedEmployee
    ){

        employeeSelect.value =
            selectedEmployee.id;

    }

};


/* ==========================================
   EDIT ATTENDANCE
========================================== */

window.editAttendance =
function(
    id
){

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


    editingAttendanceId =
        id;


    const newTimeIn =
        prompt(
            "TIME IN\n\nCurrent: " +
            (
                record.timeIn ||
                ""
            ) +
            "\n\nEnter new time (HH:MM:SS):",
            record.timeIn ||
            ""
        );


    if(
        newTimeIn ===
        null
    ){

        return;

    }


    const newBreakOut =
        prompt(
            "BREAK OUT\n\nCurrent: " +
            (
                record.breakOut ||
                ""
            ) +
            "\n\nEnter new time:",
            record.breakOut ||
            ""
        );


    if(
        newBreakOut ===
        null
    ){

        return;

    }


    const newBreakIn =
        prompt(
            "BREAK IN\n\nCurrent: " +
            (
                record.breakIn ||
                ""
            ) +
            "\n\nEnter new time:",
            record.breakIn ||
            ""
        );


    if(
        newBreakIn ===
        null
    ){

        return;

    }


    const newTimeOut =
        prompt(
            "TIME OUT\n\nCurrent: " +
            (
                record.timeOut ||
                ""
            ) +
            "\n\nEnter new time:",
            record.timeOut ||
            ""
        );


    if(
        newTimeOut ===
        null
    ){

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


    saveAttendanceRecord(

        record,

        {

            timeIn:
                newTimeIn,

            breakOut:
                newBreakOut,

            breakIn:
                newBreakIn,

            timeOut:
                newTimeOut,

            status:
                status

        }

    )

    .then(
        saved => {

            if(saved){

                alert(
                    "Attendance updated successfully."
                );

            }

        }
    );

};


/* ==========================================
   DELETE ATTENDANCE
========================================== */

window.deleteAttendance =
async function(
    id
){

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

            "Delete this attendance record?\n\n" +

            "Date: " +
            (
                record.date ||
                "-"
            ) +
            "\n" +

            "Employee: " +
            (
                record.employee ||
                record.employeeName ||
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


        alert(
            "Attendance deleted successfully."
        );


    }catch(error){

        console.error(
            "Delete Attendance Error:",
            error
        );


        alert(
            "Failed to delete attendance.\n\n" +
            error.message
        );

    }

};


/* ==========================================
   PRINT
========================================== */

window.printAttendance =
function(){

    window.print();

};


/* ==========================================
   BACK TO DASHBOARD
========================================== */

window.backToDashboard =
function(){

    window.location.href =
        "dashboard.html";

};


/* ==========================================
   BUTTON STATE
========================================== */

function updateActionButtons(){

    const timeInBtn =
        document.getElementById(
            "timeInBtn"
        );


    const breakOutBtn =
        document.getElementById(
            "breakOutBtn"
        );


    const breakInBtn =
        document.getElementById(
            "breakInBtn"
        );


    const timeOutBtn =
        document.getElementById(
            "timeOutBtn"
        );


    if(
        !selectedEmployee
    ){

        if(timeInBtn)
            timeInBtn.disabled = true;

        if(breakOutBtn)
            breakOutBtn.disabled = true;

        if(breakInBtn)
            breakInBtn.disabled = true;

        if(timeOutBtn)
            timeOutBtn.disabled = true;

        return;

    }


    const record =
        findTodayRecord();


    if(!record){

        if(timeInBtn)
            timeInBtn.disabled = false;

        if(breakOutBtn)
            breakOutBtn.disabled = true;

        if(breakInBtn)
            breakInBtn.disabled = true;

        if(timeOutBtn)
            timeOutBtn.disabled = true;

        return;

    }


    if(timeInBtn){

        timeInBtn.disabled =
            Boolean(
                record.timeIn
            );

    }


    if(breakOutBtn){

        breakOutBtn.disabled =
            !record.timeIn
            ||
            Boolean(
                record.breakOut
            )
            ||
            Boolean(
                record.timeOut
            );

    }


    if(breakInBtn){

        breakInBtn.disabled =
            !record.breakOut
            ||
            Boolean(
                record.breakIn
            )
            ||
            Boolean(
                record.timeOut
            );

    }


    if(timeOutBtn){

        timeOutBtn.disabled =
            !record.timeIn
            ||
            Boolean(
                record.timeOut
            )
            ||
            (
                Boolean(
                    record.breakOut
                )
                &&
                !record.breakIn
            );

    }

}


/* ==========================================
   UPDATE BUTTONS AFTER LOAD
========================================== */

setInterval(
    updateActionButtons,
    1000
);


/* ==========================================
   INITIALIZE
========================================== */

async function initialize(){

    updateClock();

    setDefaultDates();

    await loadEmployees();

    await loadAttendance();

    updateActionButtons();

}


/* ==========================================
   START
========================================== */

initialize();

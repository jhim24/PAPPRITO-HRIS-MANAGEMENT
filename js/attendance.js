/* ==========================================
   PAPPRITO HRIS
   ATTENDANCE SYSTEM JS
   COMPLETE VERSION
========================================== */

import {
    db
} from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* ==========================================
   GLOBAL
========================================== */

let employees = [];

let attendanceRecords = [];

let selectedEmployee = null;

let selectedRecord = null;

let clockTimer = null;


/* ==========================================
   FIRESTORE COLLECTIONS
========================================== */

const employeesCollection =
    collection(
        db,
        "employees"
    );

const attendanceCollection =
    collection(
        db,
        "attendance"
    );


/* ==========================================
   HELPER
========================================== */

function text(value){

    return String(
        value ?? ""
    ).trim();

}


/* ==========================================
   NUMBER
========================================== */

function number(value){

    const n =
        Number(value);

    return Number.isFinite(n)
        ? n
        : 0;

}


/* ==========================================
   ESCAPE HTML
========================================== */

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
   GET ELEMENT
========================================== */

function getElement(...ids){

    for(
        const id of ids
    ){

        const element =
            document.getElementById(id);

        if(element){

            return element;

        }

    }

    return null;

}


/* ==========================================
   ELEMENTS
========================================== */

const employeeSelect =
    getElement(
        "employeeSelect",
        "employee",
        "employeeDropdown"
    );


const startDate =
    getElement(
        "startDate",
        "fromDate",
        "dateFrom"
    );


const endDate =
    getElement(
        "endDate",
        "toDate",
        "dateTo"
    );


const employeeIdDisplay =
    getElement(
        "employeeId",
        "selectedEmployeeId",
        "displayEmployeeId"
    );


const employeeNameDisplay =
    getElement(
        "employeeName",
        "selectedEmployeeName",
        "displayEmployeeName"
    );


const currentTime =
    getElement(
        "currentTime",
        "clock",
        "liveTime"
    );


const currentDate =
    getElement(
        "currentDate",
        "liveDate"
    );


const todayStatus =
    getElement(
        "todayStatus",
        "status"
    );


const regularHours =
    getElement(
        "regularHours",
        "regHours"
    );


const overtime =
    getElement(
        "overtime",
        "otHours"
    );


const lateMinutes =
    getElement(
        "lateMinutes",
        "late"
    );


const recordsBody =
    document.querySelector(
        "#attendanceTable tbody"
    ) ||
    document.querySelector(
        "#empTable tbody"
    ) ||
    document.querySelector(
        "#attendanceRecords tbody"
    );


/* ==========================================
   BUTTONS
========================================== */

const timeInButton =
    getElement(
        "timeInBtn",
        "btnTimeIn"
    );


const breakOutButton =
    getElement(
        "breakOutBtn",
        "btnBreakOut"
    );


const breakInButton =
    getElement(
        "breakInBtn",
        "btnBreakIn"
    );


const timeOutButton =
    getElement(
        "timeOutBtn",
        "btnTimeOut"
    );


const filterButton =
    getElement(
        "filterBtn",
        "btnFilter"
    );


const summaryButton =
    getElement(
        "summaryBtn",
        "btnSummary"
    );


const clearButton =
    getElement(
        "clearBtn",
        "btnClear"
    );


/* ==========================================
   DATE
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

    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

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

    return (
        hours +
        ":" +
        minutes +
        ":" +
        seconds
    );

}


/* ==========================================
   DISPLAY DATE
========================================== */

function getDisplayDate(){

    return new Date()
        .toLocaleDateString(
            "en-US",
            {
                weekday:"long",
                year:"numeric",
                month:"long",
                day:"numeric"
            }
        );

}


/* ==========================================
   UPDATE CLOCK
========================================== */

function updateClock(){

    if(currentTime){

        currentTime.textContent =
            getCurrentTime();

    }


    if(currentDate){

        currentDate.textContent =
            getDisplayDate();

    }

}


/* ==========================================
   START CLOCK
========================================== */

function startClock(){

    updateClock();

    if(clockTimer){

        clearInterval(
            clockTimer
        );

    }

    clockTimer =
        setInterval(
            updateClock,
            1000
        );

}


/* ==========================================
   TIME TO MINUTES
========================================== */

function timeToMinutes(value){

    const time =
        text(value);

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
        hours * 60 +
        minutes
    );

}


/* ==========================================
   HOURS BETWEEN
========================================== */

function hoursBetween(
    start,
    end
){

    const startMinutes =
        timeToMinutes(start);


    const endMinutes =
        timeToMinutes(end);


    if(
        startMinutes === null ||
        endMinutes === null
    ){

        return 0;

    }


    let difference =
        endMinutes -
        startMinutes;


    /*
     * Handles overnight shifts.
     */

    if(
        difference < 0
    ){

        difference +=
            24 * 60;

    }


    return (
        difference / 60
    );

}


/* ==========================================
   FORMAT HOURS
========================================== */

function formatHours(value){

    const result =
        number(value);


    return result.toFixed(2);

}


/* ==========================================
   EMPLOYEE ID
========================================== */

function getEmployeeId(employee){

    return text(

        employee.employeeid ||

        employee.employeeId ||

        employee.empid ||

        employee.empID ||

        ""

    ).toUpperCase();

}


/* ==========================================
   EMPLOYEE NAME
========================================== */

function getEmployeeName(employee){

    const fullName = [

        employee.firstname,

        employee.middlename,

        employee.lastname

    ]

    .filter(
        value =>
            text(value)
    )

    .join(" ");

    return text(
        fullName
    );

}


/* ==========================================
   RECORD DATE
========================================== */

function getRecordDate(record){

    return text(

        record.date ||

        record.attendanceDate ||

        record.workDate ||

        ""

    );

}


/* ==========================================
   RECORD EMPLOYEE ID
========================================== */

function getRecordEmployeeId(record){

    return text(

        record.employeeid ||

        record.employeeId ||

        record.empid ||

        record.empID ||

        ""

    ).toUpperCase();

}


/* ==========================================
   RECORD EMPLOYEE NAME
========================================== */

function getRecordEmployeeName(record){

    return text(

        record.employeeName ||

        record.employeename ||

        record.employee ||

        record.name ||

        ""

    );

}


/* ==========================================
   FIND TODAY RECORD
========================================== */

function getTodayRecord(){

    if(
        !selectedEmployee
    ){

        return null;

    }


    const employeeId =
        getEmployeeId(
            selectedEmployee
        );


    const today =
        getToday();


    return (
        attendanceRecords.find(
            record => {

                return (

                    getRecordDate(
                        record
                    ) === today

                    &&

                    getRecordEmployeeId(
                        record
                    ) === employeeId

                );

            }
        )
        ||
        null
    );

}


/* ==========================================
   LOAD EMPLOYEES
========================================== */

async function loadEmployees(){

    try{

        const snapshot =
            await getDocs(
                employeesCollection
            );


        employees = [];


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
                    ).toLowerCase();


                const nameB =
                    getEmployeeName(
                        b
                    ).toLowerCase();


                return nameA.localeCompare(
                    nameB
                );

            }
        );


        populateEmployeeDropdown();


    }catch(error){

        console.error(
            "Load Employees Error:",
            error
        );


        alert(
            "Failed to load employees.\n\n" +
            error.message
        );

    }

}


/* ==========================================
   POPULATE EMPLOYEE DROPDOWN
========================================== */

function populateEmployeeDropdown(){

    if(
        !employeeSelect
    ){

        return;

    }


    employeeSelect.innerHTML = `

<option value="">
    Select Employee
</option>

`;


    employees.forEach(
        employee => {

            const id =
                getEmployeeId(
                    employee
                );


            const name =
                getEmployeeName(
                    employee
                );


            if(
                !id &&
                !name
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
                id
                ?
                id +
                " - " +
                name
                :
                name;


            employeeSelect.appendChild(
                option
            );

        }
    );

}


/* ==========================================
   EMPLOYEE SELECTED
========================================== */

function handleEmployeeChange(){

    const id =
        employeeSelect
        ?
        employeeSelect.value
        :
        "";


    selectedEmployee =
        employees.find(
            employee =>
                employee.id === id
        )
        ||
        null;


    displaySelectedEmployee();


    updateTodayDisplay();

}


/* ==========================================
   DISPLAY SELECTED EMPLOYEE
========================================== */

function displaySelectedEmployee(){

    if(
        !selectedEmployee
    ){

        if(employeeIdDisplay){

            employeeIdDisplay.textContent =
                "-";

        }


        if(employeeNameDisplay){

            employeeNameDisplay.textContent =
                "-";

        }


        return;

    }


    const id =
        getEmployeeId(
            selectedEmployee
        );


    const name =
        getEmployeeName(
            selectedEmployee
        );


    if(employeeIdDisplay){

        employeeIdDisplay.textContent =
            id ||
            "-";

    }


    if(employeeNameDisplay){

        employeeNameDisplay.textContent =
            name ||
            "-";

    }

}


/* ==========================================
   LOAD ATTENDANCE
========================================== */

async function loadAttendance(){

    try{

        const snapshot =
            await getDocs(
                attendanceCollection
            );


        attendanceRecords = [];


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
                    getRecordDate(a);


                const dateB =
                    getRecordDate(b);


                if(
                    dateA !==
                    dateB
                ){

                    return dateB.localeCompare(
                        dateA
                    );

                }


                return Number(
                    b.createdAt || 0
                )
                -
                Number(
                    a.createdAt || 0
                );

            }
        );


        renderAttendanceRecords();

        updateTodayDisplay();


    }catch(error){

        console.error(
            "Load Attendance Error:",
            error
        );


        attendanceRecords = [];

        renderAttendanceRecords();

        updateTodayDisplay();

    }

}


/* ==========================================
   CREATE / GET TODAY RECORD
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


    const existing =
        getTodayRecord();


    if(existing){

        return existing;

    }


    const data = {

        date:
            getToday(),

        employeeid:
            getEmployeeId(
                selectedEmployee
            ),

        employeeId:
            getEmployeeId(
                selectedEmployee
            ),

        employeeName:
            getEmployeeName(
                selectedEmployee
            ),

        timeIn:
            "",

        timein:
            "",

        breakOut:
            "",

        breakout:
            "",

        breakIn:
            "",

        breakin:
            "",

        timeOut:
            "",

        timeout:
            "",

        breakHours:
            0,

        regularHours:
            0,

        regHours:
            0,

        overtime:
            0,

        ot:
            0,

        lateMinutes:
            0,

        late:
            0,

        status:
            "PRESENT",

        createdAt:
            Date.now()

    };


    const reference =
        await addDoc(
            attendanceCollection,
            data
        );


    const record = {

        id:
            reference.id,

        ...data

    };


    attendanceRecords.unshift(
        record
    );


    return record;

}


/* ==========================================
   UPDATE ATTENDANCE RECORD
========================================== */

async function updateAttendanceRecord(
    recordId,
    data
){

    await updateDoc(

        doc(
            db,
            "attendance",
            recordId
        ),

        data

    );


    const index =
        attendanceRecords.findIndex(
            record =>
                record.id ===
                recordId
        );


    if(
        index !== -1
    ){

        attendanceRecords[index] = {

            ...attendanceRecords[index],

            ...data

        };

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


    try{

        let record =
            getTodayRecord();


        if(
            record &&
            (
                record.timeIn ||
                record.timein
            )
        ){

            alert(
                "Time In has already been recorded for today."
            );

            return;

        }


        if(
            !record
        ){

            record =
                await getOrCreateTodayRecord();

        }


        if(
            !record
        ){

            return;

        }


        const time =
            getCurrentTime();


        /*
         * Standard late calculation:
         * 08:00 AM onwards is late.
         */

        const timeMinutes =
            timeToMinutes(
                time
            );


        const regularStart =
            8 * 60;


        let late =
            0;


        if(
            timeMinutes !== null &&
            timeMinutes >
            regularStart
        ){

            late =
                timeMinutes -
                regularStart;

        }


        await updateAttendanceRecord(

            record.id,

            {

                timeIn:
                    time,

                timein:
                    time,

                lateMinutes:
                    late,

                late:
                    late,

                status:
                    late > 0
                    ?
                    "LATE"
                    :
                    "PRESENT"

            }

        );


        alert(
            "Time In recorded at " +
            time
        );


        updateTodayDisplay();

        renderAttendanceRecords();


    }catch(error){

        console.error(
            "Time In Error:",
            error
        );


        alert(
            "Failed to record Time In.\n\n" +
            error.message
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


    try{

        const record =
            getTodayRecord();


        if(
            !record
        ){

            alert(
                "Please record Time In first."
            );

            return;

        }


        const timeIn =
            record.timeIn ||
            record.timein;


        if(
            !timeIn
        ){

            alert(
                "Please record Time In first."
            );

            return;

        }


        const existing =
            record.breakOut ||
            record.breakout;


        if(existing){

            alert(
                "Break Out has already been recorded."
            );

            return;

        }


        const time =
            getCurrentTime();


        await updateAttendanceRecord(

            record.id,

            {

                breakOut:
                    time,

                breakout:
                    time

            }

        );


        alert(
            "Break Out recorded at " +
            time
        );


        updateTodayDisplay();

        renderAttendanceRecords();


    }catch(error){

        console.error(
            "Break Out Error:",
            error
        );


        alert(
            "Failed to record Break Out.\n\n" +
            error.message
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


    try{

        const record =
            getTodayRecord();


        if(
            !record
        ){

            alert(
                "Please record Time In first."
            );

            return;

        }


        const breakOut =
            record.breakOut ||
            record.breakout;


        if(
            !breakOut
        ){

            alert(
                "Please record Break Out first."
            );

            return;

        }


        const existing =
            record.breakIn ||
            record.breakin;


        if(existing){

            alert(
                "Break In has already been recorded."
            );

            return;

        }


        const time =
            getCurrentTime();


        await updateAttendanceRecord(

            record.id,

            {

                breakIn:
                    time,

                breakin:
                    time

            }

        );


        alert(
            "Break In recorded at " +
            time
        );


        updateTodayDisplay();

        renderAttendanceRecords();


    }catch(error){

        console.error(
            "Break In Error:",
            error
        );


        alert(
            "Failed to record Break In.\n\n" +
            error.message
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


    try{

        const record =
            getTodayRecord();


        if(
            !record
        ){

            alert(
                "Please record Time In first."
            );

            return;

        }


        const timeIn =
            record.timeIn ||
            record.timein;


        if(
            !timeIn
        ){

            alert(
                "Please record Time In first."
            );

            return;

        }


        const existing =
            record.timeOut ||
            record.timeout;


        if(existing){

            alert(
                "Time Out has already been recorded."
            );

            return;

        }


        const time =
            getCurrentTime();


        const breakOut =
            record.breakOut ||
            record.breakout ||
            "";


        const breakIn =
            record.breakIn ||
            record.breakin ||
            "";


        let breakHours =
            0;


        if(
            breakOut &&
            breakIn
        ){

            breakHours =
                hoursBetween(
                    breakOut,
                    breakIn
                );

        }


        const totalHours =
            Math.max(
                0,
                hoursBetween(
                    timeIn,
                    time
                )
                -
                breakHours
            );


        const regular =
            Math.min(
                8,
                totalHours
            );


        const ot =
            Math.max(
                0,
                totalHours -
                8
            );


        const late =
            number(
                record.lateMinutes ??
                record.late ??
                0
            );


        let status =
            text(
                record.status
            )
            ||
            "PRESENT";


        if(
            late > 0
        ){

            status =
                "LATE";

        }


        await updateAttendanceRecord(

            record.id,

            {

                timeOut:
                    time,

                timeout:
                    time,

                breakHours:
                    Number(
                        breakHours.toFixed(2)
                    ),

                regularHours:
                    Number(
                        regular.toFixed(2)
                    ),

                regHours:
                    Number(
                        regular.toFixed(2)
                    ),

                overtime:
                    Number(
                        ot.toFixed(2)
                    ),

                ot:
                    Number(
                        ot.toFixed(2)
                    ),

                lateMinutes:
                    late,

                late:
                    late,

                status:
                    status

            }

        );


        alert(

            "Time Out recorded at " +
            time +
            "\n\n" +

            "Regular Hours: " +
            regular.toFixed(2) +
            "\n" +

            "Overtime: " +
            ot.toFixed(2)

        );


        updateTodayDisplay();

        renderAttendanceRecords();


    }catch(error){

        console.error(
            "Time Out Error:",
            error
        );


        alert(
            "Failed to record Time Out.\n\n" +
            error.message
        );

    }

};


/* ==========================================
   UPDATE TODAY DISPLAY
========================================== */

function updateTodayDisplay(){

    const record =
        getTodayRecord();


    if(
        !record
    ){

        if(todayStatus){

            todayStatus.textContent =
                "-";

        }


        if(regularHours){

            regularHours.textContent =
                "0.00";

        }


        if(overtime){

            overtime.textContent =
                "0.00";

        }


        if(lateMinutes){

            lateMinutes.textContent =
                "0";

        }


        updateButtons(
            null
        );

        return;

    }


    const timeIn =
        record.timeIn ||
        record.timein ||
        "";


    const breakOut =
        record.breakOut ||
        record.breakout ||
        "";


    const breakIn =
        record.breakIn ||
        record.breakin ||
        "";


    const timeOut =
        record.timeOut ||
        record.timeout ||
        "";


    const late =
        number(
            record.lateMinutes ??
            record.late ??
            0
        );


    let reg =
        number(
            record.regularHours ??
            record.regHours ??
            0
        );


    let ot =
        number(
            record.overtime ??
            record.ot ??
            0
        );


    /*
     * Calculate live hours even
     * before Time Out.
     */

    if(
        timeIn &&
        !timeOut
    ){

        let liveHours =
            hoursBetween(
                timeIn,
                getCurrentTime()
            );


        let liveBreak =
            0;


        if(
            breakOut &&
            breakIn
        ){

            liveBreak =
                hoursBetween(
                    breakOut,
                    breakIn
                );

        }


        liveHours =
            Math.max(
                0,
                liveHours -
                liveBreak
            );


        reg =
            Math.min(
                8,
                liveHours
            );


        ot =
            Math.max(
                0,
                liveHours -
                8
            );

    }


    if(todayStatus){

        todayStatus.textContent =
            text(
                record.status
            ) ||
            "PRESENT";

    }


    if(regularHours){

        regularHours.textContent =
            formatHours(
                reg
            );

    }


    if(overtime){

        overtime.textContent =
            formatHours(
                ot
            );

    }


    if(lateMinutes){

        lateMinutes.textContent =
            String(
                late
            );

    }


    updateButtons(
        record
    );

}


/* ==========================================
   BUTTON SEQUENCE
========================================== */

function updateButtons(record){

    const hasTimeIn =
        !!(
            record &&
            (
                record.timeIn ||
                record.timein
            )
        );


    const hasBreakOut =
        !!(
            record &&
            (
                record.breakOut ||
                record.breakout
            )
        );


    const hasBreakIn =
        !!(
            record &&
            (
                record.breakIn ||
                record.breakin
            )
        );


    const hasTimeOut =
        !!(
            record &&
            (
                record.timeOut ||
                record.timeout
            )
        );


    if(timeInButton){

        timeInButton.disabled =
            hasTimeIn;

    }


    if(breakOutButton){

        breakOutButton.disabled =
            !hasTimeIn ||
            hasBreakOut;

    }


    if(breakInButton){

        breakInButton.disabled =
            !hasBreakOut ||
            hasBreakIn;

    }


    if(timeOutButton){

        timeOutButton.disabled =
            !hasTimeIn ||
            hasTimeOut;

    }

}


/* ==========================================
   GET STATUS CLASS
========================================== */

function getStatusClass(status){

    const value =
        text(status)
        .toUpperCase();

    if(
        value === "PRESENT"
    ){

        return "status-present";

    }


    if(
        value === "LATE"
    ){

        return "status-late";

    }


    if(
        value === "ABSENT"
    ){

        return "status-absent";

    }


    if(
        value === "LEAVE" ||
        value === "ON LEAVE"
    ){

        return "status-leave";

    }


    return "status-default";

}


/* ==========================================
   RENDER ATTENDANCE TABLE
========================================== */

function renderAttendanceRecords(
    records =
        attendanceRecords
){

    const tbody =
        recordsBody;


    if(
        !tbody
    ){

        return;

    }


    tbody.innerHTML =
        "";


    if(
        records.length === 0
    ){

        tbody.innerHTML = `

<tr>

<td
    colspan="20"
    style="
        text-align:center;
        padding:30px;
        font-weight:800;
    ">

No attendance records found.

</td>

</tr>

`;

        return;

    }


    records.forEach(
        record => {

            const date =
                getRecordDate(
                    record
                );


            const employeeId =
                getRecordEmployeeId(
                    record
                );


            const employeeName =
                getRecordEmployeeName(
                    record
                );


            const timeIn =
                record.timeIn ||
                record.timein ||
                "-";


            const breakOut =
                record.breakOut ||
                record.breakout ||
                "-";


            const breakIn =
                record.breakIn ||
                record.breakin ||
                "-";


            const timeOut =
                record.timeOut ||
                record.timeout ||
                "-";


            const breakHours =
                number(
                    record.breakHours
                );


            const regHours =
                number(
                    record.regularHours ??
                    record.regHours
                );


            const ot =
                number(
                    record.overtime ??
                    record.ot
                );


            const late =
                number(
                    record.lateMinutes ??
                    record.late
                );


            const status =
                text(
                    record.status
                )
                ||
                "-";


            const statusClass =
                getStatusClass(
                    status
                );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

<td>
${escapeHTML(date)}
</td>

<td>
${escapeHTML(employeeId)}
</td>

<td>
${escapeHTML(employeeName)}
</td>

<td>
${escapeHTML(timeIn)}
</td>

<td>
${escapeHTML(breakOut)}
</td>

<td>
${escapeHTML(breakIn)}
</td>

<td>
${escapeHTML(timeOut)}
</td>

<td>
${breakHours.toFixed(2)}
</td>

<td>
${regHours.toFixed(2)}
</td>

<td>
${ot.toFixed(2)}
</td>

<td>
${late}
</td>

<td>

<span class="status-badge ${statusClass}">

${escapeHTML(status)}

</span>

</td>

<td>

<div
    class="action-icons">

<button
    type="button"
    class="icon-btn"
    title="Delete"
    onclick="deleteAttendance('${escapeHTML(record.id)}')">

<span class="material-icons">
delete
</span>

</button>

</div>

</td>

`;


            tbody.appendChild(
                row
            );

        }
    );

}


/* ==========================================
   FILTER
========================================== */

window.filterAttendance =
function(){

    const from =
        startDate
        ?
        startDate.value
        :
        "";


    const to =
        endDate
        ?
        endDate.value
        :
        "";


    const employeeId =
        selectedEmployee
        ?
        getEmployeeId(
            selectedEmployee
        )
        :
        "";


    let filtered =
        [...attendanceRecords];


    if(from){

        filtered =
            filtered.filter(
                record =>
                    getRecordDate(
                        record
                    ) >= from
            );

    }


    if(to){

        filtered =
            filtered.filter(
                record =>
                    getRecordDate(
                        record
                    ) <= to
            );

    }


    if(employeeId){

        filtered =
            filtered.filter(
                record =>
                    getRecordEmployeeId(
                        record
                    ) === employeeId
            );

    }


    renderAttendanceRecords(
        filtered
    );

};


/* ==========================================
   FILTER ALIAS
========================================== */

window.applyFilter =
function(){

    filterAttendance();

};


/* ==========================================
   CLEAR FILTER
========================================== */

window.clearAttendance =
function(){

    if(employeeSelect){

        employeeSelect.value =
            "";

    }


    if(startDate){

        startDate.value =
            "";

    }


    if(endDate){

        endDate.value =
            "";

    }


    selectedEmployee =
        null;


    displaySelectedEmployee();

    updateTodayDisplay();

    renderAttendanceRecords();

};


/* ==========================================
   CLEAR ALIAS
========================================== */

window.clearFilter =
function(){

    clearAttendance();

};


/* ==========================================
   DELETE ATTENDANCE
========================================== */

window.deleteAttendance =
async function(id){

    if(
        !id
    ){

        return;

    }


    const confirmed =
        confirm(
            "Delete this attendance record?"
        );


    if(
        !confirmed
    ){

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
                record =>
                    record.id !== id
            );


        renderAttendanceRecords();

        updateTodayDisplay();


        alert(
            "Attendance record deleted successfully."
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
   SUMMARY
========================================== */

window.showSummary =
function(){

    const records =
        attendanceRecords;


    const total =
        records.length;


    const present =
        records.filter(
            record => {

                const status =
                    text(
                        record.status
                    )
                    .toUpperCase();


                return (
                    status ===
                    "PRESENT"
                    ||
                    status ===
                    "LATE"
                );

            }
        ).length;


    const late =
        records.filter(
            record =>
                number(
                    record.lateMinutes ??
                    record.late
                ) > 0
        ).length;


    const overtimeTotal =
        records.reduce(
            (
                sum,
                record
            ) => {

                return (
                    sum +
                    number(
                        record.overtime ??
                        record.ot
                    )
                );

            },
            0
        );


    const regularTotal =
        records.reduce(
            (
                sum,
                record
            ) => {

                return (
                    sum +
                    number(
                        record.regularHours ??
                        record.regHours
                    )
                );

            },
            0
        );


    alert(

        "ATTENDANCE SUMMARY\n\n" +

        "Total Records: " +
        total +
        "\n" +

        "Present/Late: " +
        present +
        "\n" +

        "Late Records: " +
        late +
        "\n" +

        "Regular Hours: " +
        regularTotal.toFixed(2) +
        "\n" +

        "Overtime Hours: " +
        overtimeTotal.toFixed(2)

    );

};


/* ==========================================
   PRINT
========================================== */

window.printAttendance =
function(){

    window.print();

};


/* ==========================================
   PRINT ALIAS
========================================== */

window.printDTR =
function(){

    window.print();

};


/* ==========================================
   EMPLOYEE CHANGE EVENT
========================================== */

if(employeeSelect){

    employeeSelect.addEventListener(
        "change",
        handleEmployeeChange
    );

}


/* ==========================================
   FILTER BUTTON
========================================== */

if(filterButton){

    filterButton.addEventListener(
        "click",
        filterAttendance
    );

}


/* ==========================================
   SUMMARY BUTTON
========================================== */

if(summaryButton){

    summaryButton.addEventListener(
        "click",
        showSummary
    );

}


/* ==========================================
   CLEAR BUTTON
========================================== */

if(clearButton){

    clearButton.addEventListener(
        "click",
        clearAttendance
    );

}


/* ==========================================
   TIME IN BUTTON
========================================== */

if(timeInButton){

    timeInButton.addEventListener(
        "click",
        window.timeIn
    );

}


/* ==========================================
   BREAK OUT BUTTON
========================================== */

if(breakOutButton){

    breakOutButton.addEventListener(
        "click",
        window.breakOut
    );

}


/* ==========================================
   BREAK IN BUTTON
========================================== */

if(breakInButton){

    breakInButton.addEventListener(
        "click",
        window.breakIn
    );

}


/* ==========================================
   TIME OUT BUTTON
========================================== */

if(timeOutButton){

    timeOutButton.addEventListener(
        "click",
        window.timeOut
    );

}


/* ==========================================
   LIVE HOURS UPDATE
========================================== */

setInterval(
    function(){

        updateTodayDisplay();

    },
    1000
);


/* ==========================================
   START
========================================== */

async function initAttendance(){

    startClock();

    updateTodayDisplay();

    await loadEmployees();

    await loadAttendance();

    updateTodayDisplay();

    console.log(
        "PAPPRITO HRIS Attendance Ready"
    );

}


initAttendance();

/* =========================================================
   PAPPRITO HRIS
   EMPLOYEE ATTENDANCE SYSTEM
   FINAL VERSION
========================================================= */


/* =========================================================
   FIREBASE
========================================================= */

import {
    db
} from "./firebase.js";


import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    getDoc
}
from
"https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let employees = [];

let attendanceRecords = [];

let selectedEmployee = null;

let clockTimer = null;


/* =========================================================
   ATTENDANCE SETTINGS
========================================================= */

let attendanceSettings = {

    enabled: true,

    openingTime: "08:00",

    closingTime: "17:00",

    breakStart: "12:00",

    breakEnd: "13:00",

    gracePeriod: 15,

    lateThreshold: 15,

    undertimeThreshold: 15

};


/* =========================================================
   FIRESTORE COLLECTIONS
========================================================= */

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


/* =========================================================
   ATTENDANCE SETTINGS REFERENCE
========================================================= */

function getAttendanceSettingsRef(){

    return doc(
        db,
        "systemSettings",
        "attendance"
    );

}


/* =========================================================
   HELPER
========================================================= */

function text(value){

    return String(
        value ?? ""
    ).trim();

}


/* =========================================================
   NUMBER
========================================================= */

function number(value){

    const result =
        Number(value);

    return Number.isFinite(result)
        ? result
        : 0;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

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


/* =========================================================
   GET ELEMENT
========================================================= */

function getElement(...ids){

    for(
        const id of ids
    ){

        const element =
            document.getElementById(
                id
            );

        if(element){

            return element;

        }

    }

    return null;

}


/* =========================================================
   ELEMENTS
========================================================= */

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


/* =========================================================
   CURRENT SCHEDULE ELEMENTS
========================================================= */

const scheduleOpening =
    getElement(
        "scheduleOpening"
    );


const scheduleClosing =
    getElement(
        "scheduleClosing"
    );


const scheduleBreak =
    getElement(
        "scheduleBreak"
    );


const scheduleGrace =
    getElement(
        "scheduleGrace"
    );


const scheduleStatus =
    getElement(
        "scheduleStatus"
    );


/* =========================================================
   ATTENDANCE TABLE
========================================================= */

function getAttendanceTableBody(){

    return (

        document.querySelector(
            "#attendanceTable tbody"
        )

        ||

        document.querySelector(
            "#attendanceRecords tbody"
        )

        ||

        document.querySelector(
            ".attendance-table tbody"
        )

    );

}


/* =========================================================
   BUTTONS
========================================================= */

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


const backButton =
    getElement(
        "backBtn"
    );


const printButton =
    getElement(
        "printBtn"
    );


/* =========================================================
   TODAY
========================================================= */

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


/* =========================================================
   CURRENT TIME
========================================================= */

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


/* =========================================================
   DISPLAY DATE
========================================================= */

function getDisplayDate(){

    return new Date()
        .toLocaleDateString(
            "en-US",
            {

                weekday:
                    "long",

                year:
                    "numeric",

                month:
                    "long",

                day:
                    "numeric"

            }
        );

}


/* =========================================================
   CLOCK
========================================================= */

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


/* =========================================================
   START CLOCK
========================================================= */

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


/* =========================================================
   TIME TO MINUTES
========================================================= */

function timeToMinutes(value){

    const time =
        text(value);


    if(!time){

        return null;

    }


    const parts =
        time.split(":");


    if(
        parts.length < 2
    ){

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
        hours * 60 +
        minutes
    );

}


/* =========================================================
   MINUTES TO DISPLAY TIME
========================================================= */

function formatTime12Hour(value){

    const minutes =
        timeToMinutes(
            value
        );


    if(
        minutes === null
    ){

        return "--";

    }


    let hours =
        Math.floor(
            minutes / 60
        );


    const mins =
        minutes % 60;


    const suffix =
        hours >= 12
            ?
            "PM"
            :
            "AM";


    hours =
        hours % 12;


    if(
        hours === 0
    ){

        hours = 12;

    }


    return (

        String(hours) +

        ":" +

        String(mins)
            .padStart(
                2,
                "0"
            ) +

        " " +

        suffix

    );

}


/* =========================================================
   HOURS BETWEEN
========================================================= */

function hoursBetween(
    start,
    end
){

    const startMinutes =
        timeToMinutes(
            start
        );


    const endMinutes =
        timeToMinutes(
            end
        );


    if(
        startMinutes === null
        ||
        endMinutes === null
    ){

        return 0;

    }


    let difference =
        endMinutes -
        startMinutes;


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


/* =========================================================
   MINUTES BETWEEN
========================================================= */

function minutesBetween(
    start,
    end
){

    const startMinutes =
        timeToMinutes(
            start
        );


    const endMinutes =
        timeToMinutes(
            end
        );


    if(
        startMinutes === null
        ||
        endMinutes === null
    ){

        return 0;

    }


    let difference =
        endMinutes -
        startMinutes;


    if(
        difference < 0
    ){

        difference +=
            24 * 60;

    }


    return difference;

}


/* =========================================================
   FORMAT HOURS
========================================================= */

function formatHours(value){

    return number(value)
        .toFixed(2);

}


/* =========================================================
   GET SCHEDULED WORK HOURS
========================================================= */

function getScheduledWorkHours(){

    const opening =
        timeToMinutes(
            attendanceSettings.openingTime
        );


    const closing =
        timeToMinutes(
            attendanceSettings.closingTime
        );


    if(
        opening === null
        ||
        closing === null
    ){

        return 8;

    }


    let totalMinutes =
        closing -
        opening;


    if(
        totalMinutes < 0
    ){

        totalMinutes +=
            24 * 60;

    }


    const breakMinutes =
        minutesBetween(
            attendanceSettings.breakStart,
            attendanceSettings.breakEnd
        );


    totalMinutes =
        Math.max(
            0,
            totalMinutes -
            breakMinutes
        );


    return (
        totalMinutes / 60
    );

}


/* =========================================================
   GET EMPLOYEE ID
========================================================= */

function getEmployeeId(employee){

    return text(

        employee.employeeid ||

        employee.employeeId ||

        employee.empid ||

        employee.empID ||

        ""

    )
    .toUpperCase();

}


/* =========================================================
   EMPLOYEE NAME
========================================================= */

function getEmployeeName(employee){

    return text(

        [
            employee.firstname,
            employee.middlename,
            employee.lastname
        ]

        .filter(
            value =>
                text(value)
        )

        .join(" ")

    );

}


/* =========================================================
   RECORD DATE
========================================================= */

function getRecordDate(record){

    return text(

        record.date ||

        record.attendanceDate ||

        record.workDate ||

        ""

    );

}


/* =========================================================
   RECORD EMPLOYEE ID
========================================================= */

function getRecordEmployeeId(record){

    return text(

        record.employeeid ||

        record.employeeId ||

        record.empid ||

        record.empID ||

        ""

    )
    .toUpperCase();

}


/* =========================================================
   RECORD EMPLOYEE NAME
========================================================= */

function getRecordEmployeeName(record){

    return text(

        record.employeeName ||

        record.employeename ||

        record.employee ||

        record.name ||

        ""

    );

}


/* =========================================================
   GET TODAY RECORD
========================================================= */

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


/* =========================================================
   LOAD ATTENDANCE SETTINGS
========================================================= */

async function loadAttendanceSettings(){

    try{

        const settingsRef =
            getAttendanceSettingsRef();


        const snapshot =
            await getDoc(
                settingsRef
            );


        if(
            snapshot.exists()
        ){

            const data =
                snapshot.data();


            attendanceSettings = {

                enabled:
                    data.enabled !== undefined
                        ?
                        Boolean(
                            data.enabled
                        )
                        :
                        true,

                openingTime:
                    data.openingTime ||
                    "08:00",

                closingTime:
                    data.closingTime ||
                    "17:00",

                breakStart:
                    data.breakStart ||
                    "12:00",

                breakEnd:
                    data.breakEnd ||
                    "13:00",

                gracePeriod:
                    number(
                        data.gracePeriod ??
                        15
                    ),

                lateThreshold:
                    number(
                        data.lateThreshold ??
                        15
                    ),

                undertimeThreshold:
                    number(
                        data.undertimeThreshold ??
                        15
                    )

            };

        }


        else{

            console.warn(
                "Attendance settings document not found. Using default schedule."
            );

        }


        updateScheduleDisplay();

    }

    catch(error){

        console.error(
            "Load Attendance Settings Error:",
            error
        );


        updateScheduleDisplay();

    }

}


/* =========================================================
   UPDATE SCHEDULE DISPLAY
========================================================= */

function updateScheduleDisplay(){

    if(
        scheduleOpening
    ){

        scheduleOpening.textContent =
            formatTime12Hour(
                attendanceSettings.openingTime
            );

    }


    if(
        scheduleClosing
    ){

        scheduleClosing.textContent =
            formatTime12Hour(
                attendanceSettings.closingTime
            );

    }


    if(
        scheduleBreak
    ){

        scheduleBreak.textContent =

            formatTime12Hour(
                attendanceSettings.breakStart
            )

            +

            " - "

            +

            formatTime12Hour(
                attendanceSettings.breakEnd
            );

    }


    if(
        scheduleGrace
    ){

        scheduleGrace.textContent =

            number(
                attendanceSettings.gracePeriod
            )

            +

            " min";

    }


    if(
        scheduleStatus
    ){

        scheduleStatus.textContent =
            attendanceSettings.enabled
                ?
                "ACTIVE"
                :
                "DISABLED";


        scheduleStatus.classList.toggle(
            "inactive",
            !attendanceSettings.enabled
        );

    }

}


/* =========================================================
   CALCULATE LATE MINUTES
========================================================= */

function calculateLateMinutes(
    timeIn
){

    const actual =
        timeToMinutes(
            timeIn
        );


    const opening =
        timeToMinutes(
            attendanceSettings.openingTime
        );


    if(
        actual === null
        ||
        opening === null
    ){

        return 0;

    }


    const late =
        Math.max(

            0,

            actual -
            (
                opening +
                number(
                    attendanceSettings.gracePeriod
                )
            )

        );


    if(
        late <
        number(
            attendanceSettings.lateThreshold
        )
    ){

        return 0;

    }


    return late;

}


/* =========================================================
   CALCULATE ATTENDANCE HOURS
========================================================= */

function calculateAttendanceHours(
    timeIn,
    timeOut,
    breakOut,
    breakIn
){

    if(
        !timeIn
        ||
        !timeOut
    ){

        return {

            breakHours:0,

            workedHours:0,

            regularHours:0,

            overtime:0

        };

    }


    let totalHours =
        hoursBetween(
            timeIn,
            timeOut
        );


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


    totalHours =
        Math.max(

            0,

            totalHours -
            breakHours

        );


    const scheduledHours =
        getScheduledWorkHours();


    const regular =
        Math.min(
            scheduledHours,
            totalHours
        );


    const ot =
        Math.max(
            0,
            totalHours -
            scheduledHours
        );


    return {

        breakHours:
            Number(
                breakHours.toFixed(2)
            ),

        workedHours:
            Number(
                totalHours.toFixed(2)
            ),

        regularHours:
            Number(
                regular.toFixed(2)
            ),

        overtime:
            Number(
                ot.toFixed(2)
            )

    };

}
/* =========================================================
   LOAD EMPLOYEES
========================================================= */

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

                return getEmployeeName(a)
                    .toLowerCase()
                    .localeCompare(
                        getEmployeeName(b)
                            .toLowerCase()
                    );

            }
        );


        populateEmployeeDropdown();

    }

    catch(error){

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


/* =========================================================
   POPULATE EMPLOYEE DROPDOWN
========================================================= */

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


/* =========================================================
   EMPLOYEE CHANGE
========================================================= */

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


/* =========================================================
   DISPLAY SELECTED EMPLOYEE
========================================================= */

function displaySelectedEmployee(){

    if(
        !selectedEmployee
    ){

        if(
            employeeIdDisplay
        ){

            employeeIdDisplay.textContent =
                "-";

        }


        if(
            employeeNameDisplay
        ){

            employeeNameDisplay.textContent =
                "-";

        }


        return;

    }


    if(
        employeeIdDisplay
    ){

        employeeIdDisplay.textContent =
            getEmployeeId(
                selectedEmployee
            )
            ||
            "-";

    }


    if(
        employeeNameDisplay
    ){

        employeeNameDisplay.textContent =
            getEmployeeName(
                selectedEmployee
            )
            ||
            "-";

    }

}


/* =========================================================
   LOAD ATTENDANCE
========================================================= */

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
                    dateA !== dateB
                ){

                    return dateB.localeCompare(
                        dateA
                    );

                }


                return (

                    Number(
                        b.createdAt || 0
                    )

                    -

                    Number(
                        a.createdAt || 0
                    )

                );

            }
        );


        renderAttendanceRecords();

        updateTodayDisplay();

    }

    catch(error){

        console.error(
            "Load Attendance Error:",
            error
        );


        attendanceRecords = [];

        renderAttendanceRecords();

        updateTodayDisplay();

    }

}


/* =========================================================
   CREATE TODAY RECORD
========================================================= */

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


    const employeeId =
        getEmployeeId(
            selectedEmployee
        );


    const employeeName =
        getEmployeeName(
            selectedEmployee
        );


    const data = {

        date:
            getToday(),

        employeeid:
            employeeId,

        employeeId:
            employeeId,

        employeeName:
            employeeName,

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

        undertimeMinutes:
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


/* =========================================================
   UPDATE RECORD
========================================================= */

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


/* =========================================================
   CHECK ATTENDANCE SYSTEM
========================================================= */

function checkAttendanceEnabled(){

    if(
        attendanceSettings.enabled
    ){

        return true;

    }


    alert(
        "Attendance Time Rules are currently disabled in Settings."
    );


    return false;

}


/* =========================================================
   TIME IN
========================================================= */

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


    if(
        !checkAttendanceEnabled()
    ){

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


        if(!record){

            record =
                await getOrCreateTodayRecord();

        }


        if(!record){

            return;

        }


        const time =
            getCurrentTime();


        const late =
            calculateLateMinutes(
                time
            );


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
            formatTime12Hour(time)

            +

            "\n\n" +

            (
                late > 0
                    ?
                    "Late: " +
                    late +
                    " minutes"
                    :
                    "Status: PRESENT"
            )

        );


        updateTodayDisplay();

        renderAttendanceRecords();

    }

    catch(error){

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


/* =========================================================
   BREAK OUT
========================================================= */

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


        if(!record){

            alert(
                "Please record Time In first."
            );

            return;

        }


        const timeIn =
            record.timeIn ||
            record.timein;


        if(!timeIn){

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
            formatTime12Hour(time)

        );


        updateTodayDisplay();

        renderAttendanceRecords();

    }

    catch(error){

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


/* =========================================================
   BREAK IN
========================================================= */

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


        if(!record){

            alert(
                "Please record Time In first."
            );

            return;

        }


        const breakOut =
            record.breakOut ||
            record.breakout;


        if(!breakOut){

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
            formatTime12Hour(time)

        );


        updateTodayDisplay();

        renderAttendanceRecords();

    }

    catch(error){

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


/* =========================================================
   TIME OUT
========================================================= */

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


        if(!record){

            alert(
                "Please record Time In first."
            );

            return;

        }


        const timeIn =
            record.timeIn ||
            record.timein;


        if(!timeIn){

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


        const calculations =
            calculateAttendanceHours(

                timeIn,

                time,

                breakOut,

                breakIn

            );


        const late =
            number(

                record.lateMinutes ??
                record.late ??
                calculateLateMinutes(
                    timeIn
                )

            );


        let status =
            late > 0
                ?
                "LATE"
                :
                "PRESENT";


        /* =================================================
           UNDERTIME
        ================================================= */

        const scheduledHours =
            getScheduledWorkHours();


        const missingHours =
            Math.max(

                0,

                scheduledHours -
                calculations.workedHours

            );


        const undertimeMinutes =
            Math.round(
                missingHours * 60
            );


        if(
            undertimeMinutes >=
            number(
                attendanceSettings.undertimeThreshold
            )

            &&

            calculations.workedHours <
            scheduledHours

        ){

            status =
                late > 0
                    ?
                    "LATE / UNDERTIME"
                    :
                    "UNDERTIME";

        }


        await updateAttendanceRecord(

            record.id,

            {

                timeOut:
                    time,

                timeout:
                    time,

                breakHours:
                    calculations.breakHours,

                regularHours:
                    calculations.regularHours,

                regHours:
                    calculations.regularHours,

                overtime:
                    calculations.overtime,

                ot:
                    calculations.overtime,

                lateMinutes:
                    late,

                late:
                    late,

                undertimeMinutes:
                    undertimeMinutes,

                status:
                    status

            }

        );


        alert(

            "Time Out recorded at " +
            formatTime12Hour(time)

            +

            "\n\n" +

            "Regular Hours: " +
            calculations.regularHours.toFixed(2)

            +

            "\n" +

            "Overtime: " +
            calculations.overtime.toFixed(2)

            +

            "\n" +

            "Break Hours: " +
            calculations.breakHours.toFixed(2)

            +

            "\n" +

            "Late: " +
            late +
            " minutes"

            +

            "\n" +

            "Undertime: " +
            undertimeMinutes +
            " minutes"

        );


        updateTodayDisplay();

        renderAttendanceRecords();

    }

    catch(error){

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


/* =========================================================
   UPDATE TODAY DISPLAY
========================================================= */

function updateTodayDisplay(){

    const record =
        getTodayRecord();


    if(!record){

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
            (
                timeIn
                    ?
                    calculateLateMinutes(
                        timeIn
                    )
                    :
                    0
            )

        );


    let regular =
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
     * LIVE HOURS
     */

    if(
        timeIn &&
        !timeOut
    ){

        const live =
            calculateAttendanceHours(

                timeIn,

                getCurrentTime(),

                breakOut,

                breakIn

            );


        regular =
            live.regularHours;


        ot =
            live.overtime;

    }


    if(todayStatus){

        todayStatus.textContent =
            text(
                record.status
            )
            ||
            "PRESENT";

    }


    if(regularHours){

        regularHours.textContent =
            formatHours(
                regular
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


/* =========================================================
   BUTTON SEQUENCE
========================================================= */

function updateButtons(record){

    const hasTimeIn =
        !!(

            record
            &&
            (
                record.timeIn ||
                record.timein
            )

        );


    const hasBreakOut =
        !!(

            record
            &&
            (
                record.breakOut ||
                record.breakout
            )

        );


    const hasBreakIn =
        !!(

            record
            &&
            (
                record.breakIn ||
                record.breakin
            )

        );


    const hasTimeOut =
        !!(

            record
            &&
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


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(status){

    const value =
        text(status)
            .toUpperCase();


    if(
        value ===
        "PRESENT"
    ){

        return "status-present";

    }


    if(
        value ===
        "LATE"
    ){

        return "status-late";

    }


    if(
        value ===
        "ABSENT"
    ){

        return "status-absent";

    }


    if(
        value ===
        "LEAVE"
        ||
        value ===
        "ON LEAVE"
    ){

        return "status-leave";

    }


    if(
        value.includes(
            "UNDERTIME"
        )
    ){

        return "status-late";

    }


    return "status-default";

}


/* =========================================================
   RENDER ATTENDANCE RECORDS
========================================================= */

function renderAttendanceRecords(
    records =
        attendanceRecords
){

    const tbody =
        getAttendanceTableBody();


    if(!tbody){

        console.warn(
            "Attendance table body not found."
        );

        return;

    }


    tbody.innerHTML =
        "";


    if(
        !records ||
        records.length === 0
    ){

        tbody.innerHTML = `

<tr class="empty-row">

<td colspan="13">

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

<span
    class="status-badge ${statusClass}">

${escapeHTML(status)}

</span>

</td>

<td class="action-cell">

<button
    type="button"
    class="table-icon-btn delete-action"
    title="Delete Attendance"
    data-id="${escapeHTML(record.id)}">

<span class="material-icons">
delete
</span>

</button>

</td>

`;


            const deleteButton =
                row.querySelector(
                    ".delete-action"
                );


            if(
                deleteButton
            ){

                deleteButton.addEventListener(
                    "click",
                    function(){

                        deleteAttendance(
                            record.id
                        );

                    }
                );

            }


            tbody.appendChild(
                row
            );

        }
    );

}
/* =========================================================
   FILTER ATTENDANCE
========================================================= */

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
        [
            ...attendanceRecords
        ];


    /* -----------------------------------------
       FROM DATE
    ----------------------------------------- */

    if(from){

        filtered =
            filtered.filter(
                record => {

                    return (
                        getRecordDate(
                            record
                        ) >= from
                    );

                }
            );

    }


    /* -----------------------------------------
       TO DATE
    ----------------------------------------- */

    if(to){

        filtered =
            filtered.filter(
                record => {

                    return (
                        getRecordDate(
                            record
                        ) <= to
                    );

                }
            );

    }


    /* -----------------------------------------
       EMPLOYEE
    ----------------------------------------- */

    if(employeeId){

        filtered =
            filtered.filter(
                record => {

                    return (

                        getRecordEmployeeId(
                            record
                        ) === employeeId

                    );

                }
            );

    }


    renderAttendanceRecords(
        filtered
    );

};


/* =========================================================
   APPLY FILTER ALIAS
========================================================= */

window.applyFilter =
function(){

    filterAttendance();

};


/* =========================================================
   GET FILTERED RECORDS
   USED BY SUMMARY
========================================================= */

function getFilteredAttendanceRecords(){

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


    let records =
        [
            ...attendanceRecords
        ];


    /* -----------------------------------------
       FROM
    ----------------------------------------- */

    if(from){

        records =
            records.filter(
                record => {

                    return (
                        getRecordDate(
                            record
                        ) >= from
                    );

                }
            );

    }


    /* -----------------------------------------
       TO
    ----------------------------------------- */

    if(to){

        records =
            records.filter(
                record => {

                    return (
                        getRecordDate(
                            record
                        ) <= to
                    );

                }
            );

    }


    /* -----------------------------------------
       EMPLOYEE
    ----------------------------------------- */

    if(employeeId){

        records =
            records.filter(
                record => {

                    return (

                        getRecordEmployeeId(
                            record
                        ) === employeeId

                    );

                }
            );

    }


    return records;

}


/* =========================================================
   FORMAT CUTOFF DATE
========================================================= */

function formatCutoffDate(
    value
){

    if(!value){

        return "-";

    }


    const parts =
        value.split("-");


    if(
        parts.length !== 3
    ){

        return value;

    }


    return (

        parts[1] +
        "/" +
        parts[2] +
        "/" +
        parts[0]

    );

}


/* =========================================================
   CREATE CUTOFF SUMMARY
========================================================= */

function createCutoffSummary(
    records
){

    const summaryMap =
        new Map();


    records.forEach(
        record => {

            const employeeId =
                getRecordEmployeeId(
                    record
                )
                ||
                "NO-ID";


            const employeeName =
                getRecordEmployeeName(
                    record
                )
                ||
                "Unknown Employee";


            const key =
                employeeId +
                "|" +
                employeeName;


            if(
                !summaryMap.has(
                    key
                )
            ){

                summaryMap.set(

                    key,

                    {

                        employeeId:
                            employeeId,

                        employeeName:
                            employeeName,

                        regularHours:
                            0,

                        overtime:
                            0,

                        lateMinutes:
                            0,

                        totalHours:
                            0,

                        records:
                            0

                    }

                );

            }


            const employeeSummary =
                summaryMap.get(
                    key
                );


            employeeSummary.regularHours +=

                number(

                    record.regularHours ??
                    record.regHours ??
                    0

                );


            employeeSummary.overtime +=

                number(

                    record.overtime ??
                    record.ot ??
                    0

                );


            employeeSummary.lateMinutes +=

                number(

                    record.lateMinutes ??
                    record.late ??
                    0

                );


            employeeSummary.records +=
                1;

        }
    );


    /*
     * TOTAL HOURS
     *
     * Regular Hours + OT
     */

    summaryMap.forEach(
        employeeSummary => {

            employeeSummary.totalHours =

                employeeSummary.regularHours +

                employeeSummary.overtime;

        }
    );


    const result =
        Array.from(
            summaryMap.values()
        );


    /*
     * SORT BY EMPLOYEE NAME
     */

    result.sort(
        (
            a,
            b
        ) => {

            return a.employeeName
                .toLowerCase()
                .localeCompare(
                    b.employeeName
                        .toLowerCase()
                );

        }
    );


    return result;

}


/* =========================================================
   SUMMARY CONTAINER
========================================================= */

function getSummaryContainer(){

    let container =
        document.getElementById(
            "attendanceCutoffSummary"
        );


    if(
        container
    ){

        return container;

    }


    /*
     * Create summary section
     * automatically.
     */

    container =
        document.createElement(
            "section"
        );


    container.id =
        "attendanceCutoffSummary";


    container.className =
        "attendance-cutoff-summary";


    const attendanceRecords =
        document.getElementById(
            "attendanceRecords"
        );


    if(
        attendanceRecords
        &&
        attendanceRecords.parentElement
    ){

        attendanceRecords.parentElement
            .appendChild(
                container
            );

    }

    else{

        document
            .querySelector(
                ".container"
            )
            ?.appendChild(
                container
            );

    }


    return container;

}


/* =========================================================
   RENDER CUTOFF SUMMARY
========================================================= */

function renderCutoffSummary(){

    const records =
        getFilteredAttendanceRecords();


    const summary =
        createCutoffSummary(
            records
        );


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


    const container =
        getSummaryContainer();


    if(!container){

        return;

    }


    /*
     * HEADER
     */

    let html = `

<div class="cutoff-summary-header">

    <div>

        <h2>
            Attendance Cutoff Summary
        </h2>

        <p>
            Manual cutoff employee summary
        </p>

    </div>


    <div class="cutoff-summary-actions">

        <button
            type="button"
            id="printSummaryBtn"
            class="summary-print-btn">

            <span class="material-icons">
                print
            </span>

            PRINT SUMMARY

        </button>

    </div>

</div>


<div class="cutoff-summary-period">

    <div>

        <span>
            CUTOFF FROM
        </span>

        <strong>
            ${escapeHTML(
                formatCutoffDate(
                    from
                )
            )}
        </strong>

    </div>


    <div>

        <span>
            CUTOFF TO
        </span>

        <strong>
            ${escapeHTML(
                formatCutoffDate(
                    to
                )
            )}
        </strong>

    </div>


    <div>

        <span>
            EMPLOYEES
        </span>

        <strong>
            ${summary.length}
        </strong>

    </div>


    <div>

        <span>
            RECORDS
        </span>

        <strong>
            ${records.length}
        </strong>

    </div>

</div>


<div class="cutoff-summary-table-wrapper">

<table
    id="cutoffSummaryTable"
    class="cutoff-summary-table">

<thead>

<tr>

    <th>
        #
    </th>

    <th>
        EMPLOYEE ID
    </th>

    <th>
        EMPLOYEE NAME
    </th>

    <th>
        REGULAR HOURS
    </th>

    <th>
        OT HOURS
    </th>

    <th>
        TOTAL HOURS
    </th>

    <th>
        LATE MINUTES
    </th>

    <th>
        RECORDS
    </th>

</tr>

</thead>

<tbody>
`;


    if(
        summary.length === 0
    ){

        html += `

<tr>

<td
    colspan="8"
    class="cutoff-summary-empty">

<span class="material-icons">
    event_busy
</span>

<p>
    No attendance records found for this cutoff.
</p>

</td>

</tr>

`;

    }

    else{

        summary.forEach(
            (
                employee,
                index
            ) => {

                html += `

<tr>

<td>
    ${index + 1}
</td>

<td>
    ${escapeHTML(
        employee.employeeId
    )}
</td>

<td class="summary-employee-name">
    ${escapeHTML(
        employee.employeeName
    )}
</td>

<td>
    ${employee.regularHours.toFixed(2)}
</td>

<td>
    ${employee.overtime.toFixed(2)}
</td>

<td class="summary-total-hours">
    ${employee.totalHours.toFixed(2)}
</td>

<td>
    ${employee.lateMinutes}
</td>

<td>
    ${employee.records}
</td>

</tr>

`;

            }
        );

    }


    /*
     * GRAND TOTAL
     */

    const grandRegular =
        summary.reduce(
            (
                total,
                employee
            ) => {

                return (
                    total +
                    employee.regularHours
                );

            },
            0
        );


    const grandOT =
        summary.reduce(
            (
                total,
                employee
            ) => {

                return (
                    total +
                    employee.overtime
                );

            },
            0
        );


    const grandTotal =
        summary.reduce(
            (
                total,
                employee
            ) => {

                return (
                    total +
                    employee.totalHours
                );

            },
            0
        );


    const grandLate =
        summary.reduce(
            (
                total,
                employee
            ) => {

                return (
                    total +
                    employee.lateMinutes
                );

            },
            0
        );


    const grandRecords =
        summary.reduce(
            (
                total,
                employee
            ) => {

                return (
                    total +
                    employee.records
                );

            },
            0
        );


    html += `

</tbody>


<tfoot>

<tr>

<td
    colspan="3">

    GRAND TOTAL

</td>

<td>

    ${grandRegular.toFixed(2)}

</td>

<td>

    ${grandOT.toFixed(2)}

</td>

<td>

    ${grandTotal.toFixed(2)}

</td>

<td>

    ${grandLate}

</td>

<td>

    ${grandRecords}

</td>

</tr>

</tfoot>

</table>

</div>

`;


    container.innerHTML =
        html;


    container.style.display =
        "block";


    /*
     * PRINT SUMMARY BUTTON
     */

    const printSummaryButton =
        document.getElementById(
            "printSummaryBtn"
        );


    if(
        printSummaryButton
    ){

        printSummaryButton.onclick =
            function(){

                printCutoffSummary();

            };

    }

}


/* =========================================================
   SUMMARY ALIAS
========================================================= */

window.showCutoffSummary =
function(){

    renderCutoffSummary();

};


/* =========================================================
   SUMMARY BUTTON
========================================================= */

if(
    summaryButton
){

    summaryButton.addEventListener(
        "click",
        function(event){

            event.preventDefault();

            renderCutoffSummary();

        }
    );

}


/* =========================================================
   DELETE ATTENDANCE
========================================================= */

async function deleteAttendance(
    id
){

    if(!id){

        return;

    }


    const confirmed =
        confirm(
            "Delete this attendance record?"
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
                record => {

                    return (
                        record.id !== id
                    );

                }
            );


        renderAttendanceRecords();


        updateTodayDisplay();


        /*
         * Refresh cutoff summary
         * if it is already visible.
         */

        const summaryContainer =
            document.getElementById(
                "attendanceCutoffSummary"
            );


        if(
            summaryContainer
        ){

            renderCutoffSummary();

        }


        alert(
            "Attendance record deleted successfully."
        );

    }

    catch(error){

        console.error(
            "Delete Attendance Error:",
            error
        );


        alert(

            "Failed to delete attendance.\n\n" +

            error.message

        );

    }

}


/* =========================================================
   GLOBAL DELETE
========================================================= */

window.deleteAttendance =
function(
    id
){

    return deleteAttendance(
        id
    );

};


/* =========================================================
   CLEAR FILTER
========================================================= */

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


    /*
     * Hide cutoff summary.
     */

    const summaryContainer =
        document.getElementById(
            "attendanceCutoffSummary"
        );


    if(
        summaryContainer
    ){

        summaryContainer.style.display =
            "none";

    }

};


/* =========================================================
   CLEAR ALIAS
========================================================= */

window.clearFilter =
function(){

    clearAttendance();

};


/* =========================================================
   PRINT OVERALL ATTENDANCE
========================================================= */

window.printAttendance =
function(){

    printOverallAttendance();

};


/* =========================================================
   PRINT DTR ALIAS
========================================================= */

window.printDTR =
function(){

    printOverallAttendance();

};


/* =========================================================
   PRINT OVERALL ATTENDANCE
   IMPORTANT:
   ONLY attendance records
========================================================= */

function printOverallAttendance(){

    const attendanceSection =
        document.getElementById(
            "attendanceRecords"
        );


    if(
        !attendanceSection
    ){

        alert(
            "Attendance records section not found."
        );

        return;

    }


    /*
     * Make sure cutoff summary
     * is NOT included.
     */

    const summary =
        document.getElementById(
            "attendanceCutoffSummary"
        );


    if(summary){

        summary.classList.add(
            "print-hidden"
        );

    }


    /*
     * Mark overall attendance
     * as print target.
     */

    attendanceSection.classList.add(
        "print-attendance-only"
    );


    window.print();


    setTimeout(
        function(){

            attendanceSection.classList.remove(
                "print-attendance-only"
            );


            if(summary){

                summary.classList.remove(
                    "print-hidden"
                );

            }

        },
        1000
    );

}


/* =========================================================
   PRINT CUTOFF SUMMARY
   IMPORTANT:
   ONLY SUMMARY
========================================================= */

function printCutoffSummary(){

    const summary =
        document.getElementById(
            "attendanceCutoffSummary"
        );


    if(
        !summary
    ){

        alert(
            "Cutoff Summary not found."
        );

        return;

    }


    /*
     * Make sure summary exists.
     */

    if(
        summary.style.display ===
        "none"
    ){

        renderCutoffSummary();

    }


    /*
     * Hide overall attendance
     * during summary printing.
     */

    const attendanceSection =
        document.getElementById(
            "attendanceRecords"
        );


    if(
        attendanceSection
    ){

        attendanceSection.classList.add(
            "print-hidden"
        );

    }


    /*
     * Mark summary as
     * print target.
     */

    summary.classList.add(
        "print-summary-only"
    );


    window.print();


    setTimeout(
        function(){

            summary.classList.remove(
                "print-summary-only"
            );


            if(
                attendanceSection
            ){

                attendanceSection.classList.remove(
                    "print-hidden"
                );

            }

        },
        1000
    );

}


/* =========================================================
   GLOBAL PRINT SUMMARY
========================================================= */

window.printCutoffSummary =
function(){

    printCutoffSummary();

};


/* =========================================================
   BACK TO DASHBOARD
========================================================= */

function goBack(){

    window.location.href =
        "dashboard.html";

}


/* =========================================================
   GLOBAL BACK
========================================================= */

window.goBack =
function(){

    goBack();

};


/* =========================================================
   BACK ALIASES
========================================================= */

window.backToDashboard =
function(){

    goBack();

};


window.backToHome =
function(){

    goBack();

};


/* =========================================================
   BACK BUTTON
========================================================= */

if(
    backButton
){

    backButton.addEventListener(
        "click",
        function(event){

            event.preventDefault();

            goBack();

        }
    );

}


/* =========================================================
   EMPLOYEE CHANGE
========================================================= */

if(
    employeeSelect
){

    employeeSelect.addEventListener(
        "change",
        handleEmployeeChange
    );

}


/* =========================================================
   FILTER BUTTON
========================================================= */

if(
    filterButton
){

    filterButton.addEventListener(
        "click",
        function(event){

            event.preventDefault();

            filterAttendance();

        }
    );

}


/* =========================================================
   CLEAR BUTTON
========================================================= */

if(
    clearButton
){

    clearButton.addEventListener(
        "click",
        function(event){

            event.preventDefault();

            clearAttendance();

        }
    );

}


/* =========================================================
   TIME IN BUTTON
========================================================= */

if(
    timeInButton
){

    timeInButton.addEventListener(
        "click",
        window.timeIn
    );

}


/* =========================================================
   BREAK OUT BUTTON
========================================================= */

if(
    breakOutButton
){

    breakOutButton.addEventListener(
        "click",
        window.breakOut
    );

}


/* =========================================================
   BREAK IN BUTTON
========================================================= */

if(
    breakInButton
){

    breakInButton.addEventListener(
        "click",
        window.breakIn
    );

}


/* =========================================================
   TIME OUT BUTTON
========================================================= */

if(
    timeOutButton
){

    timeOutButton.addEventListener(
        "click",
        window.timeOut
    );

}


/* =========================================================
   PRINT BUTTON
========================================================= */

if(
    printButton
){

    printButton.addEventListener(
        "click",
        function(event){

            event.preventDefault();

            printOverallAttendance();

        }
    );

}


/* =========================================================
   LIVE UPDATE
========================================================= */

setInterval(
    function(){

        updateTodayDisplay();

    },
    1000
);


/* =========================================================
   INITIALIZE ATTENDANCE
========================================================= */

async function initAttendance(){

    try{

        /*
         * Start clock first.
         */

        startClock();


        /*
         * Settings must load
         * before attendance calculations.
         */

        await loadAttendanceSettings();


        updateTodayDisplay();


        /*
         * Load employees.
         */

        await loadEmployees();


        /*
         * Load attendance records.
         */

        await loadAttendance();


        updateTodayDisplay();


        console.log(
            "PAPPRITO HRIS Attendance Ready"
        );

    }

    catch(error){

        console.error(
            "Attendance Initialization Error:",
            error
        );

    }

}


/* =========================================================
   START SYSTEM
========================================================= */

initAttendance();

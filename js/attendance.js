/* =========================================================
   PAPPRITO HRIS
   ATTENDANCE SYSTEM JS
   SETTINGS-INTEGRATED VERSION
   MANUAL CUTOFF SUMMARY
   FULL UPDATED VERSION
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
   CUTOFF SUMMARY SECTION
========================================================= */

const attendanceSummary =
    getElement(
        "attendanceSummary",
        "summarySection",
        "cutoffSummary"
    );


/* =========================================================
   CUTOFF DATE INPUTS
========================================================= */

const summaryFromDate =
    getElement(
        "summaryFromDate",
        "cutoffFromDate"
    );


const summaryToDate =
    getElement(
        "summaryToDate",
        "cutoffToDate"
    );


/* =========================================================
   CUTOFF SUMMARY ELEMENTS
========================================================= */

/*
 * IMPORTANT:
 *
 * Current attendance.html uses:
 *
 * #cutoffSummaryTable tbody
 *
 * There is NO tbody id.
 *
 * Therefore we intentionally find the tbody
 * using the actual table selector.
 */

function getCutoffSummaryTable(){

    return (

        document.getElementById(
            "cutoffSummaryTable"
        )

        ||

        document.getElementById(
            "summaryTable"
        )

        ||

        document.querySelector(
            "#cutoffSummary table"
        )

        ||

        null

    );

}


function getCutoffSummaryTableBody(){

    const table =
        getCutoffSummaryTable();


    if(!table){

        return null;

    }


    return table.querySelector(
        "tbody"
    );

}


/* =========================================================
   CUTOFF SUMMARY INFO ELEMENTS
========================================================= */

const cutoffPeriod =
    getElement(
        "cutoffPeriod",
        "summaryDisplayPeriod"
    );


const cutoffEmployeeCount =
    getElement(
        "cutoffEmployeeCount",
        "summaryTotalEmployees",
        "totalEmployees"
    );


const cutoffRegularTotal =
    getElement(
        "cutoffRegularTotal",
        "summaryTotalRegular",
        "totalRegularHours"
    );


const cutoffOtTotal =
    getElement(
        "cutoffOtTotal",
        "summaryTotalOT",
        "totalOvertimeHours"
    );


const cutoffTotalHours =
    getElement(
        "cutoffTotalHours",
        "summaryGrandTotal",
        "grandTotalHours"
    );


const cutoffLateTotal =
    getElement(
        "cutoffLateTotal",
        "summaryTotalLate",
        "totalLateMinutes"
    );


/* =========================================================
   CUTOFF FOOTER ELEMENTS
========================================================= */

const cutoffFooterRegular =
    getElement(
        "cutoffFooterRegular"
    );


const cutoffFooterOT =
    getElement(
        "cutoffFooterOT"
    );


const cutoffFooterLate =
    getElement(
        "cutoffFooterLate"
    );


const cutoffFooterTotal =
    getElement(
        "cutoffFooterTotal"
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

        ||

        null

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


const generateCutoffButton =
    getElement(
        "generateCutoffBtn"
    );


const printCutoffButton =
    getElement(
        "printCutoffBtn"
    );


const clearCutoffButton =
    getElement(
        "clearCutoffBtn"
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

    const fullName =
        text(

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


    if(fullName){

        return fullName;

    }


    return text(

        employee.employeeName ||

        employee.employeename ||

        employee.name ||

        ""

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


        console.log(
            "Attendance Settings:",
            attendanceSettings
        );

    }

    catch(error){

        console.error(
            "Load Attendance Settings Error:",
            error
        );


        attendanceSettings = {

            enabled:true,

            openingTime:"08:00",

            closingTime:"17:00",

            breakStart:"12:00",

            breakEnd:"13:00",

            gracePeriod:15,

            lateThreshold:15,

            undertimeThreshold:15

        };


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

        if(
            attendanceSettings.enabled
        ){

            scheduleStatus.textContent =
                "ACTIVE";

            scheduleStatus.classList.remove(
                "inactive"
            );

        }

        else{

            scheduleStatus.textContent =
                "DISABLED";

            scheduleStatus.classList.add(
                "inactive"
            );

        }

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
   DISPLAY EMPLOYEE
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
   RENDER ATTENDANCE
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
   FILTER
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


/* =========================================================
   FILTER ALIAS
========================================================= */

window.applyFilter =
function(){

    filterAttendance();

};


/* =========================================================
   CLEAR ATTENDANCE
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


    if(summaryFromDate){

        summaryFromDate.value =
            "";

    }


    if(summaryToDate){

        summaryToDate.value =
            "";

    }


    selectedEmployee =
        null;


    displaySelectedEmployee();

    updateTodayDisplay();

    renderAttendanceRecords();


    clearCutoffSummaryDisplay();

};


/* =========================================================
   CLEAR ALIAS
========================================================= */

window.clearFilter =
function(){

    clearAttendance();

};


/* =========================================================
   DELETE ATTENDANCE
========================================================= */

async function deleteAttendance(id){

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
                record =>
                    record.id !== id
            );


        renderAttendanceRecords();

        updateTodayDisplay();


        /*
         * Refresh cutoff summary
         * if a cutoff is already selected.
         */

        const dates =
            getCutoffDates();


        if(
            dates.from ||
            dates.to
        ){

            generateCutoffSummary(
                false
            );

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
function(id){

    return deleteAttendance(
        id
    );

};


/* =========================================================
   GET CUTOFF DATES
========================================================= */

function getCutoffDates(){

    const from =
        summaryFromDate &&
        summaryFromDate.value
            ?
            summaryFromDate.value
            :
            "";


    const to =
        summaryToDate &&
        summaryToDate.value
            ?
            summaryToDate.value
            :
            "";


    return {

        from:
            from,

        to:
            to

    };

}


/* =========================================================
   FORMAT CUTOFF PERIOD
========================================================= */

function formatCutoffPeriod(
    from,
    to
){

    if(
        !from &&
        !to
    ){

        return "ALL DATES";

    }


    if(
        from &&
        to
    ){

        return (
            formatDateDisplay(from) +
            " - " +
            formatDateDisplay(to)
        );

    }


    if(from){

        return (
            "FROM " +
            formatDateDisplay(from)
        );

    }


    return (
        "UNTIL " +
        formatDateDisplay(to)
    );

}


/* =========================================================
   FORMAT DATE DISPLAY
========================================================= */

function formatDateDisplay(
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

        parts[2] +
        "/" +
        parts[1] +
        "/" +
        parts[0]

    );

}


/* =========================================================
   FILTER RECORDS FOR CUTOFF
========================================================= */

function getCutoffRecords(
    from,
    to
){

    let records =
        [
            ...attendanceRecords
        ];


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


    /*
     * IMPORTANT:
     *
     * Manual cutoff summary is intended
     * to summarize ALL employees.
     *
     * Therefore we DO NOT filter by
     * selectedEmployee here.
     *
     * The employee dropdown can still
     * be used for the normal attendance
     * filter.
     */

    return records;

}


/* =========================================================
   BUILD EMPLOYEE SUMMARY
========================================================= */

function buildEmployeeSummary(
    employee,
    records
){

    const employeeId =
        getEmployeeId(
            employee
        );


    const employeeName =
        getEmployeeName(
            employee
        );


    const employeeRecords =
        records.filter(
            record => {

                return (

                    getRecordEmployeeId(
                        record
                    ) === employeeId

                );

            }
        );


    let regular =
        0;


    let ot =
        0;


    let late =
        0;


    let totalHours =
        0;


    employeeRecords.forEach(
        record => {

            const regularHoursValue =
                number(

                    record.regularHours ??
                    record.regHours ??
                    0

                );


            const overtimeValue =
                number(

                    record.overtime ??
                    record.ot ??
                    0

                );


            const lateValue =
                number(

                    record.lateMinutes ??
                    record.late ??
                    0

                );


            regular +=
                regularHoursValue;


            ot +=
                overtimeValue;


            late +=
                lateValue;


            /*
             * TOTAL HOURS
             *
             * Regular Hours + OT Hours
             */

            totalHours +=
                regularHoursValue +
                overtimeValue;

        }
    );


    return {

        employeeId:
            employeeId,

        employeeName:
            employeeName,

        regularHours:
            Number(
                regular.toFixed(2)
            ),

        overtime:
            Number(
                ot.toFixed(2)
            ),

        lateMinutes:
            Math.round(
                late
            ),

        totalHours:
            Number(
                totalHours.toFixed(2)
            )

    };

}


/* =========================================================
   GET EMPLOYEES FOR SUMMARY
========================================================= */

function getEmployeesForSummary(
    records
){

    /*
     * Start with Employee Masterlist.
     */

    const employeeMap =
        new Map();


    employees.forEach(
        employee => {

            const id =
                getEmployeeId(
                    employee
                );


            if(id){

                employeeMap.set(
                    id,
                    employee
                );

            }

        }
    );


    /*
     * Fallback:
     *
     * If an attendance record has an
     * employee that is not currently
     * present in the employee masterlist,
     * still include that employee.
     */

    records.forEach(
        record => {

            const id =
                getRecordEmployeeId(
                    record
                );


            if(
                id &&
                !employeeMap.has(id)
            ){

                employeeMap.set(

                    id,

                    {

                        employeeid:
                            id,

                        employeeId:
                            id,

                        employeeName:
                            getRecordEmployeeName(
                                record
                            )

                    }

                );

            }

        }
    );


    return Array.from(
        employeeMap.values()
    )

    .sort(
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

}


/* =========================================================
   GET ALL EMPLOYEE SUMMARIES
========================================================= */

function getEmployeeSummaries(
    records
){

    const employeeList =
        getEmployeesForSummary(
            records
        );


    return employeeList.map(
        employee => {

            return buildEmployeeSummary(
                employee,
                records
            );

        }
    );

}


/* =========================================================
   CLEAR CUTOFF SUMMARY DISPLAY
========================================================= */

function clearCutoffSummaryDisplay(){

    if(cutoffPeriod){

        cutoffPeriod.textContent =
            "-";

    }


    if(cutoffEmployeeCount){

        cutoffEmployeeCount.textContent =
            "0";

    }


    if(cutoffRegularTotal){

        cutoffRegularTotal.textContent =
            "0.00";

    }


    if(cutoffOtTotal){

        cutoffOtTotal.textContent =
            "0.00";

    }


    if(cutoffTotalHours){

        cutoffTotalHours.textContent =
            "0.00";

    }


    if(cutoffLateTotal){

        cutoffLateTotal.textContent =
            "0";

    }


    if(cutoffFooterRegular){

        cutoffFooterRegular.textContent =
            "0.00";

    }


    if(cutoffFooterOT){

        cutoffFooterOT.textContent =
            "0.00";

    }


    if(cutoffFooterLate){

        cutoffFooterLate.textContent =
            "0";

    }


    if(cutoffFooterTotal){

        cutoffFooterTotal.textContent =
            "0.00";

    }


    const tbody =
        getCutoffSummaryTableBody();


    if(tbody){

        tbody.innerHTML = `

<tr>

<td
    colspan="7"
    class="empty-row">

<span class="material-icons">
date_range
</span>

<p>
Select a cutoff period and generate the summary.
</p>

</td>

</tr>

`;

    }

}


/* =========================================================
   RENDER CUTOFF SUMMARY
========================================================= */

function renderCutoffSummary(
    summaries,
    from,
    to
){

    /*
     * THIS IS THE IMPORTANT FIX.
     *
     * Current HTML:
     *
     * <table id="cutoffSummaryTable">
     *     <tbody>
     *     </tbody>
     * </table>
     */

    const tbody =
        getCutoffSummaryTableBody();


    /*
     * Activate section.
     */

    const summarySection =
        attendanceSummary
        ||
        document.getElementById(
            "cutoffSummary"
        );


    if(
        summarySection
    ){

        summarySection.classList.add(
            "active"
        );

    }


    /*
     * CUTOFF PERIOD
     */

    if(cutoffPeriod){

        cutoffPeriod.textContent =
            formatCutoffPeriod(
                from,
                to
            );

    }


    /*
     * TOTALS
     */

    let totalRegular =
        0;


    let totalOT =
        0;


    let totalLate =
        0;


    let totalHours =
        0;


    summaries.forEach(
        summary => {

            totalRegular +=
                summary.regularHours;

            totalOT +=
                summary.overtime;

            totalLate +=
                summary.lateMinutes;

            totalHours +=
                summary.totalHours;

        }
    );


    /*
     * EMPLOYEE COUNT
     */

    if(cutoffEmployeeCount){

        cutoffEmployeeCount.textContent =
            String(
                summaries.length
            );

    }


    /*
     * REGULAR TOTAL
     */

    if(cutoffRegularTotal){

        cutoffRegularTotal.textContent =
            formatHours(
                totalRegular
            );

    }


    /*
     * OT TOTAL
     */

    if(cutoffOtTotal){

        cutoffOtTotal.textContent =
            formatHours(
                totalOT
            );

    }


    /*
     * TOTAL HOURS
     */

    if(cutoffTotalHours){

        cutoffTotalHours.textContent =
            formatHours(
                totalHours
            );

    }


    /*
     * LATE TOTAL
     */

    if(cutoffLateTotal){

        cutoffLateTotal.textContent =
            String(
                totalLate
            );

    }


    /*
     * FOOTER TOTALS
     */

    if(cutoffFooterRegular){

        cutoffFooterRegular.textContent =
            formatHours(
                totalRegular
            );

    }


    if(cutoffFooterOT){

        cutoffFooterOT.textContent =
            formatHours(
                totalOT
            );

    }


    if(cutoffFooterLate){

        cutoffFooterLate.textContent =
            String(
                totalLate
            );

    }


    if(cutoffFooterTotal){

        cutoffFooterTotal.textContent =
            formatHours(
                totalHours
            );

    }


    /*
     * TABLE BODY NOT FOUND
     */

    if(!tbody){

        console.warn(
            "Attendance summary table body not found."
        );

        return;

    }


    tbody.innerHTML =
        "";


    /*
     * NO EMPLOYEES
     */

    if(
        summaries.length === 0
    ){

        tbody.innerHTML = `

<tr>

<td
    colspan="7"
    class="empty-row">

<span class="material-icons">
summarize
</span>

<p>
No employees found for this cutoff.
</p>

</td>

</tr>

`;

        return;

    }


    /*
     * RENDER EACH EMPLOYEE
     *
     * EXACT HTML ORDER:
     *
     * # 
     * EMPLOYEE ID
     * EMPLOYEE NAME
     * REGULAR HOURS
     * OT HOURS
     * LATE MINUTES
     * TOTAL HOURS
     */

    summaries.forEach(
        (
            summary,
            index
        ) => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

<td>
${index + 1}
</td>

<td>
${escapeHTML(
    summary.employeeId || "-"
)}
</td>

<td>
${escapeHTML(
    summary.employeeName || "-"
)}
</td>

<td>
${summary.regularHours.toFixed(2)}
</td>

<td>
${summary.overtime.toFixed(2)}
</td>

<td>
${summary.lateMinutes}
</td>

<td class="summary-total-hours">
${summary.totalHours.toFixed(2)}
</td>

`;


            tbody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   GENERATE CUTOFF SUMMARY
========================================================= */

function generateCutoffSummary(
    showAttendanceTable = true
){

    const dates =
        getCutoffDates();


    const from =
        dates.from;


    const to =
        dates.to;


    /*
     * Require manual cutoff dates.
     */

    if(
        !from ||
        !to
    ){

        alert(
            "Please select both CUTOFF FROM and CUTOFF TO dates."
        );

        return;

    }


    /*
     * Validate date order.
     */

    if(
        from > to
    ){

        alert(
            "CUTOFF FROM date cannot be later than CUTOFF TO date."
        );

        return;

    }


    /*
     * Get records.
     */

    const records =
        getCutoffRecords(
            from,
            to
        );


    /*
     * Build employee summary.
     */

    const summaries =
        getEmployeeSummaries(
            records
        );


    /*
     * Render summary.
     */

    renderCutoffSummary(
        summaries,
        from,
        to
    );


    /*
     * Optional:
     * Show only records in cutoff
     * in the attendance table.
     */

    if(
        showAttendanceTable
    ){

        renderAttendanceRecords(
            records
        );

    }


    console.log(
        "Cutoff Summary Generated:",
        {

            from:
                from,

            to:
                to,

            employees:
                summaries.length,

            regularHours:
                summaries.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        item.regularHours,
                    0
                ),

            overtime:
                summaries.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        item.overtime,
                    0
                ),

            lateMinutes:
                summaries.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        item.lateMinutes,
                    0
                ),

            totalHours:
                summaries.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        item.totalHours,
                    0
                )

        }

    );

}


/* =========================================================
   GLOBAL GENERATE SUMMARY
========================================================= */

window.generateCutoffSummary =
function(){

    generateCutoffSummary();

};


/* =========================================================
   SUMMARY
========================================================= */

window.showSummary =
function(){

    generateCutoffSummary();

};


/* =========================================================
   SUMMARY ALIAS
========================================================= */

window.generateSummary =
function(){

    generateCutoffSummary();

};


/* =========================================================
   LEGACY SUMMARY
========================================================= */

window.showLegacySummary =
function(){

    let records =
        [
            ...attendanceRecords
        ];


    const dates =
        getCutoffDates();


    if(dates.from){

        records =
            records.filter(
                record =>
                    getRecordDate(
                        record
                    ) >= dates.from
            );

    }


    if(dates.to){

        records =
            records.filter(
                record =>
                    getRecordDate(
                        record
                    ) <= dates.to
            );

    }


    const total =
        records.length;


    const present =
        records.filter(
            record =>
                text(
                    record.status
                )
                .toUpperCase()
                ===
                "PRESENT"
        ).length;


    const late =
        records.filter(
            record =>
                number(

                    record.lateMinutes ??
                    record.late

                ) > 0
        ).length;


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


    alert(

        "PAPPRITO HRIS\n" +
        "ATTENDANCE SUMMARY\n\n" +

        "Total Records: " +
        total +
        "\n\n" +

        "Present: " +
        present +
        "\n" +

        "Late: " +
        late +
        "\n\n" +

        "Regular Hours: " +
        regularTotal.toFixed(2) +
        "\n" +

        "Overtime Hours: " +
        overtimeTotal.toFixed(2) +
        "\n" +

        "Total Hours: " +
        (
            regularTotal +
            overtimeTotal
        ).toFixed(2)

    );

};


/* =========================================================
   PRINT ATTENDANCE
========================================================= */

window.printAttendance =
function(){

    printAttendanceRecords();

};


/* =========================================================
   PRINT DTR ALIAS
========================================================= */

window.printDTR =
function(){

    printAttendanceRecords();

};


/* =========================================================
   PRINT ATTENDANCE RECORDS
========================================================= */

function printAttendanceRecords(){

    const table =
        document.getElementById(
            "attendanceTable"
        );


    if(!table){

        alert(
            "Attendance table not found."
        );

        return;

    }


    window.print();

}


/* =========================================================
   PRINT CUTOFF SUMMARY
========================================================= */

function printCutoffSummary(){

    const table =
        getCutoffSummaryTable();


    if(!table){

        alert(
            "Cutoff summary table not found."
        );

        return;

    }


    const dates =
        getCutoffDates();


    if(
        !dates.from ||
        !dates.to
    ){

        alert(
            "Please generate a cutoff summary first."
        );

        return;

    }


    window.print();

}


/* =========================================================
   GLOBAL PRINT CUTOFF
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
   EMPLOYEE EVENT
========================================================= */

if(employeeSelect){

    employeeSelect.addEventListener(
        "change",
        handleEmployeeChange
    );

}


/* =========================================================
   FILTER EVENT
========================================================= */

if(filterButton){

    filterButton.addEventListener(
        "click",
        function(event){

            event.preventDefault();

            filterAttendance();

        }
    );

}


/* =========================================================
   SUMMARY EVENT
========================================================= */

if(summaryButton){

    summaryButton.addEventListener(
        "click",
        function(event){

            event.preventDefault();

            generateCutoffSummary();

        }
    );

}


/* =========================================================
   CUTOFF GENERATE EVENT
========================================================= */

if(generateCutoffButton){

    generateCutoffButton.addEventListener(
        "click",
        function(event){

            event.preventDefault();

            generateCutoffSummary();

        }
    );

}


/* =========================================================
   CUTOFF PRINT EVENT
========================================================= */

if(printCutoffButton){

    printCutoffButton.addEventListener(
        "click",
        function(event){

            event.preventDefault();

            printCutoffSummary();

        }
    );

}


/* =========================================================
   CUTOFF CLEAR EVENT
========================================================= */

if(clearCutoffButton){

    clearCutoffButton.addEventListener(
        "click",
        function(event){

            event.preventDefault();


            if(summaryFromDate){

                summaryFromDate.value =
                    "";

            }


            if(summaryToDate){

                summaryToDate.value =
                    "";

            }


            clearCutoffSummaryDisplay();

        }
    );

}


/* =========================================================
   CUTOFF DATE EVENTS
========================================================= */

if(summaryFromDate){

    summaryFromDate.addEventListener(
        "change",
        function(){

            /*
             * Do NOT automatically generate.
             *
             * User wants manual cutoff.
             */

        }
    );

}


if(summaryToDate){

    summaryToDate.addEventListener(
        "change",
        function(){

            /*
             * Do NOT automatically generate.
             *
             * User must click GENERATE SUMMARY.
             */

        }
    );

}


/* =========================================================
   CLEAR EVENT
========================================================= */

if(clearButton){

    clearButton.addEventListener(
        "click",
        function(event){

            event.preventDefault();

            clearAttendance();

        }
    );

}


/* =========================================================
   BACK BUTTON EVENT
========================================================= */

if(backButton){

    backButton.addEventListener(
        "click",
        function(event){

            event.preventDefault();

            goBack();

        }
    );

}


/* =========================================================
   PRINT BUTTON EVENT
========================================================= */

if(printButton){

    printButton.addEventListener(
        "click",
        function(event){

            event.preventDefault();

            printAttendanceRecords();

        }
    );

}


/* =========================================================
   TIME IN EVENT
========================================================= */

if(timeInButton){

    timeInButton.addEventListener(
        "click",
        window.timeIn
    );

}


/* =========================================================
   BREAK OUT EVENT
========================================================= */

if(breakOutButton){

    breakOutButton.addEventListener(
        "click",
        window.breakOut
    );

}


/* =========================================================
   BREAK IN EVENT
========================================================= */

if(breakInButton){

    breakInButton.addEventListener(
        "click",
        window.breakIn
    );

}


/* =========================================================
   TIME OUT EVENT
========================================================= */

if(timeOutButton){

    timeOutButton.addEventListener(
        "click",
        window.timeOut
    );

}


/* =========================================================
   LIVE HOURS
========================================================= */

setInterval(
    function(){

        updateTodayDisplay();

    },
    1000
);


/* =========================================================
   INITIALIZE
========================================================= */

async function initAttendance(){

    try{

        startClock();


        /*
         * Load settings BEFORE loading
         * attendance calculations.
         */

        await loadAttendanceSettings();


        updateTodayDisplay();


        await loadEmployees();


        await loadAttendance();


        updateTodayDisplay();


        /*
         * Make sure cutoff summary starts
         * in a clean state.
         */

        clearCutoffSummaryDisplay();


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

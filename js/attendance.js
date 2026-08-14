/* =========================================================
   PAPPRITO HRIS
   ATTENDANCE SYSTEM JS
   COMPLETE / FUNCTIONAL VERSION
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
    updateDoc
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
   HELPER
========================================================= */

function text(value) {

    return String(
        value ?? ""
    ).trim();

}


/* =========================================================
   NUMBER
========================================================= */

function number(value) {

    const result =
        Number(value);

    return Number.isFinite(result)
        ? result
        : 0;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

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

function getElement(...ids) {

    for (
        const id of ids
    ) {

        const element =
            document.getElementById(
                id
            );

        if (element) {

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
   ATTENDANCE TABLE
========================================================= */

function getAttendanceTableBody() {

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

function getToday() {

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

function getCurrentTime() {

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

function getDisplayDate() {

    return new Date()
        .toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

}


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    if (currentTime) {

        currentTime.textContent =
            getCurrentTime();

    }

    if (currentDate) {

        currentDate.textContent =
            getDisplayDate();

    }

}


/* =========================================================
   START CLOCK
========================================================= */

function startClock() {

    updateClock();

    if (clockTimer) {

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

function timeToMinutes(value) {

    const time =
        text(value);

    if (!time) {

        return null;

    }

    const parts =
        time.split(":");

    if (
        parts.length < 2
    ) {

        return null;

    }

    const hours =
        Number(parts[0]);

    const minutes =
        Number(parts[1]);

    if (
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes)
    ) {

        return null;

    }

    return (
        hours * 60 +
        minutes
    );

}


/* =========================================================
   HOURS BETWEEN
========================================================= */

function hoursBetween(
    start,
    end
) {

    const startMinutes =
        timeToMinutes(start);

    const endMinutes =
        timeToMinutes(end);

    if (
        startMinutes === null ||
        endMinutes === null
    ) {

        return 0;

    }

    let difference =
        endMinutes -
        startMinutes;

    if (
        difference < 0
    ) {

        difference +=
            24 * 60;

    }

    return (
        difference / 60
    );

}


/* =========================================================
   FORMAT HOURS
========================================================= */

function formatHours(value) {

    return number(value)
        .toFixed(2);

}


/* =========================================================
   EMPLOYEE ID
========================================================= */

function getEmployeeId(employee) {

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

function getEmployeeName(employee) {

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

function getRecordDate(record) {

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

function getRecordEmployeeId(record) {

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

function getRecordEmployeeName(record) {

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

function getTodayRecord() {

    if (
        !selectedEmployee
    ) {

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
   LOAD EMPLOYEES
========================================================= */

async function loadEmployees() {

    try {

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

    catch (error) {

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

function populateEmployeeDropdown() {

    if (
        !employeeSelect
    ) {

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

            if (
                !id &&
                !name
            ) {

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

function handleEmployeeChange() {

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

function displaySelectedEmployee() {

    if (
        !selectedEmployee
    ) {

        if (
            employeeIdDisplay
        ) {

            employeeIdDisplay.textContent =
                "-";

        }

        if (
            employeeNameDisplay
        ) {

            employeeNameDisplay.textContent =
                "-";

        }

        return;

    }


    if (
        employeeIdDisplay
    ) {

        employeeIdDisplay.textContent =
            getEmployeeId(
                selectedEmployee
            )
            ||
            "-";

    }


    if (
        employeeNameDisplay
    ) {

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

async function loadAttendance() {

    try {

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

                if (
                    dateA !== dateB
                ) {

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

    catch (error) {

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

async function getOrCreateTodayRecord() {

    if (
        !selectedEmployee
    ) {

        alert(
            "Please select an employee first."
        );

        return null;

    }


    const existing =
        getTodayRecord();

    if (existing) {

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
) {

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


    if (
        index !== -1
    ) {

        attendanceRecords[index] = {

            ...attendanceRecords[index],

            ...data

        };

    }

}


/* =========================================================
   TIME IN
========================================================= */

window.timeIn =
async function () {

    if (
        !selectedEmployee
    ) {

        alert(
            "Please select an employee first."
        );

        return;

    }


    try {

        let record =
            getTodayRecord();


        if (
            record &&
            (
                record.timeIn ||
                record.timein
            )
        ) {

            alert(
                "Time In has already been recorded for today."
            );

            return;

        }


        if (!record) {

            record =
                await getOrCreateTodayRecord();

        }


        if (!record) {

            return;

        }


        const time =
            getCurrentTime();


        const timeMinutes =
            timeToMinutes(
                time
            );


        /*
         * Regular start:
         * 08:00
         */

        const regularStart =
            8 * 60;


        let late =
            0;


        if (
            timeMinutes !== null &&
            timeMinutes >
            regularStart
        ) {

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

    }

    catch (error) {

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
async function () {

    if (
        !selectedEmployee
    ) {

        alert(
            "Please select an employee first."
        );

        return;

    }


    try {

        const record =
            getTodayRecord();


        if (!record) {

            alert(
                "Please record Time In first."
            );

            return;

        }


        const timeIn =
            record.timeIn ||
            record.timein;


        if (!timeIn) {

            alert(
                "Please record Time In first."
            );

            return;

        }


        const existing =
            record.breakOut ||
            record.breakout;


        if (existing) {

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

    }

    catch (error) {

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
async function () {

    if (
        !selectedEmployee
    ) {

        alert(
            "Please select an employee first."
        );

        return;

    }


    try {

        const record =
            getTodayRecord();


        if (!record) {

            alert(
                "Please record Time In first."
            );

            return;

        }


        const breakOut =
            record.breakOut ||
            record.breakout;


        if (!breakOut) {

            alert(
                "Please record Break Out first."
            );

            return;

        }


        const existing =
            record.breakIn ||
            record.breakin;


        if (existing) {

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

    }

    catch (error) {

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
async function () {

    if (
        !selectedEmployee
    ) {

        alert(
            "Please select an employee first."
        );

        return;

    }


    try {

        const record =
            getTodayRecord();


        if (!record) {

            alert(
                "Please record Time In first."
            );

            return;

        }


        const timeIn =
            record.timeIn ||
            record.timein;


        if (!timeIn) {

            alert(
                "Please record Time In first."
            );

            return;

        }


        const existing =
            record.timeOut ||
            record.timeout;


        if (existing) {

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


        if (
            breakOut &&
            breakIn
        ) {

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
                totalHours - 8
            );


        const late =
            number(
                record.lateMinutes ??
                record.late ??
                0
            );


        const status =
            late > 0
                ?
                "LATE"
                :
                "PRESENT";


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

    }

    catch (error) {

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

function updateTodayDisplay() {

    const record =
        getTodayRecord();


    if (!record) {

        if (todayStatus) {

            todayStatus.textContent =
                "-";

        }

        if (regularHours) {

            regularHours.textContent =
                "0.00";

        }

        if (overtime) {

            overtime.textContent =
                "0.00";

        }

        if (lateMinutes) {

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

    if (
        timeIn &&
        !timeOut
    ) {

        let liveHours =
            hoursBetween(
                timeIn,
                getCurrentTime()
            );


        let liveBreak =
            0;


        if (
            breakOut &&
            breakIn
        ) {

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


        regular =
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


    if (todayStatus) {

        todayStatus.textContent =
            text(
                record.status
            )
            ||
            "PRESENT";

    }


    if (regularHours) {

        regularHours.textContent =
            formatHours(
                regular
            );

    }


    if (overtime) {

        overtime.textContent =
            formatHours(
                ot
            );

    }


    if (lateMinutes) {

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

function updateButtons(record) {

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


    if (timeInButton) {

        timeInButton.disabled =
            hasTimeIn;

    }


    if (breakOutButton) {

        breakOutButton.disabled =
            !hasTimeIn ||
            hasBreakOut;

    }


    if (breakInButton) {

        breakInButton.disabled =
            !hasBreakOut ||
            hasBreakIn;

    }


    if (timeOutButton) {

        timeOutButton.disabled =
            !hasTimeIn ||
            hasTimeOut;

    }

}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(status) {

    const value =
        text(status)
            .toUpperCase();


    if (
        value ===
        "PRESENT"
    ) {

        return "status-present";

    }


    if (
        value ===
        "LATE"
    ) {

        return "status-late";

    }


    if (
        value ===
        "ABSENT"
    ) {

        return "status-absent";

    }


    if (
        value ===
        "LEAVE"
        ||
        value ===
        "ON LEAVE"
    ) {

        return "status-leave";

    }


    return "status-default";

}


/* =========================================================
   RENDER ATTENDANCE
========================================================= */

function renderAttendanceRecords(
    records =
        attendanceRecords
) {

    const tbody =
        getAttendanceTableBody();


    if (!tbody) {

        console.warn(
            "Attendance table body not found."
        );

        return;

    }


    tbody.innerHTML =
        "";


    if (
        !records ||
        records.length === 0
    ) {

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


            if (
                deleteButton
            ) {

                deleteButton.addEventListener(
                    "click",
                    function () {

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
function () {

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


    if (from) {

        filtered =
            filtered.filter(
                record =>
                    getRecordDate(
                        record
                    ) >= from
            );

    }


    if (to) {

        filtered =
            filtered.filter(
                record =>
                    getRecordDate(
                        record
                    ) <= to
            );

    }


    if (employeeId) {

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
function () {

    filterAttendance();

};


/* =========================================================
   CLEAR FILTER
========================================================= */

window.clearAttendance =
function () {

    if (employeeSelect) {

        employeeSelect.value =
            "";

    }


    if (startDate) {

        startDate.value =
            "";

    }


    if (endDate) {

        endDate.value =
            "";

    }


    selectedEmployee =
        null;


    displaySelectedEmployee();

    updateTodayDisplay();

    renderAttendanceRecords();

};


/* =========================================================
   CLEAR ALIAS
========================================================= */

window.clearFilter =
function () {

    clearAttendance();

};


/* =========================================================
   DELETE ATTENDANCE
========================================================= */

async function deleteAttendance(id) {

    if (!id) {

        return;

    }


    const confirmed =
        confirm(
            "Delete this attendance record?"
        );


    if (!confirmed) {

        return;

    }


    try {

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

    }

    catch (error) {

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
function(id) {

    return deleteAttendance(
        id
    );

};


/* =========================================================
   SUMMARY
========================================================= */

window.showSummary =
function () {

    let records =
        [...attendanceRecords];


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


    /*
     * Summary follows current filters.
     */

    if (from) {

        records =
            records.filter(
                record =>
                    getRecordDate(
                        record
                    ) >= from
            );

    }


    if (to) {

        records =
            records.filter(
                record =>
                    getRecordDate(
                        record
                    ) <= to
            );

    }


    if (employeeId) {

        records =
            records.filter(
                record =>
                    getRecordEmployeeId(
                        record
                    ) === employeeId
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


    const absent =
        records.filter(
            record =>
                text(
                    record.status
                )
                .toUpperCase()
                ===
                "ABSENT"
        ).length;


    const leave =
        records.filter(
            record =>
                text(
                    record.status
                )
                .toUpperCase()
                ===
                "LEAVE"
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
        "\n" +

        "Absent: " +
        absent +
        "\n" +

        "Leave: " +
        leave +
        "\n\n" +

        "Regular Hours: " +
        regularTotal.toFixed(2) +
        "\n" +

        "Overtime Hours: " +
        overtimeTotal.toFixed(2)

    );

};


/* =========================================================
   PRINT ATTENDANCE
========================================================= */

window.printAttendance =
function () {

    printAttendanceRecords();

};


/* =========================================================
   PRINT DTR ALIAS
========================================================= */

window.printDTR =
function () {

    printAttendanceRecords();

};


/* =========================================================
   PRINT FUNCTION
========================================================= */

function printAttendanceRecords() {

    /*
     * Find the attendance section.
     */

    const table =
        document.getElementById(
            "attendanceTable"
        );


    if (!table) {

        alert(
            "Attendance table not found."
        );

        return;

    }


    /*
     * Find the main attendance section.
     */

    let printArea =
        document.getElementById(
            "attendanceRecords"
        );


    if (!printArea) {

        printArea =
            table.closest(
                ".attendance-section"
            );

    }


    if (!printArea) {

        printArea =
            table.parentElement;
        
    }


    if (!printArea) {

        alert(
            "Attendance print area not found."
        );

        return;

    }


    /*
     * Save original ID.
     */

    const originalId =
        printArea.id;


    /*
     * CSS print area expects:
     *
     * #attendanceRecords
     */

    if (
        originalId !==
        "attendanceRecords"
    ) {

        printArea.id =
            "attendanceRecords";

    }


    /*
     * Make sure browser has
     * time to apply the print CSS.
     */

    setTimeout(
        function () {

            window.print();

        },
        100
    );


    /*
     * Restore after print.
     */

    const restore =
        function () {

            if (
                originalId
            ) {

                printArea.id =
                    originalId;

            }

            else {

                printArea.removeAttribute(
                    "id"
                );

            }

        };


    if (
        "onafterprint"
        in
        window
    ) {

        window.addEventListener(
            "afterprint",
            restore,
            {
                once: true
            }
        );

    }

    else {

        setTimeout(
            restore,
            1500
        );

    }

}


/* =========================================================
   PRINT BUTTON EVENT
========================================================= */

if (printButton) {

    printButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            printAttendanceRecords();

        }
    );

}


/* =========================================================
   BACK TO DASHBOARD
========================================================= */

function goBack() {

    window.location.href =
        "dashboard.html";

}


/* =========================================================
   GLOBAL BACK
========================================================= */

window.goBack =
function () {

    goBack();

};


/* =========================================================
   BACK ALIASES
========================================================= */

window.backToDashboard =
function () {

    goBack();

};


window.backToHome =
function () {

    goBack();

};


/* =========================================================
   BACK BUTTON EVENT
========================================================= */

if (backButton) {

    backButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            goBack();

        }
    );

}
/* =========================================================
   EMPLOYEE EVENT
========================================================= */

if (employeeSelect) {

    employeeSelect.addEventListener(
        "change",
        handleEmployeeChange
    );

}


/* =========================================================
   FILTER EVENT
========================================================= */

if (filterButton) {

    filterButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            filterAttendance();

        }
    );

}


/* =========================================================
   SUMMARY EVENT
========================================================= */

if (summaryButton) {

    summaryButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            showSummary();

        }
    );

}


/* =========================================================
   CLEAR EVENT
========================================================= */

if (clearButton) {

    clearButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            clearAttendance();

        }
    );

}


/* =========================================================
   TIME IN EVENT
========================================================= */

if (timeInButton) {

    timeInButton.addEventListener(
        "click",
        window.timeIn
    );

}


/* =========================================================
   BREAK OUT EVENT
========================================================= */

if (breakOutButton) {

    breakOutButton.addEventListener(
        "click",
        window.breakOut
    );

}


/* =========================================================
   BREAK IN EVENT
========================================================= */

if (breakInButton) {

    breakInButton.addEventListener(
        "click",
        window.breakIn
    );

}


/* =========================================================
   TIME OUT EVENT
========================================================= */

if (timeOutButton) {

    timeOutButton.addEventListener(
        "click",
        window.timeOut
    );

}


/* =========================================================
   LIVE HOURS
========================================================= */

setInterval(
    function () {

        updateTodayDisplay();

    },
    1000
);


/* =========================================================
   INITIALIZE
========================================================= */

async function initAttendance() {

    try {

        startClock();

        updateTodayDisplay();

        await loadEmployees();

        await loadAttendance();

        updateTodayDisplay();

        console.log(
            "PAPPRITO HRIS Attendance Ready"
        );

    }

    catch (error) {

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

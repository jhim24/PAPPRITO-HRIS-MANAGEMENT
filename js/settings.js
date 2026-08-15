/* ==========================================
   PAPPRITO HRIS
   SYSTEM SETTINGS
   ATTENDANCE TIME SETTINGS
   COMPLETE RESET
========================================== */


/* ==========================================
   FIREBASE
========================================== */

import {

    db

} from "./firebase.js";


import {

    doc,

    getDoc,

    setDoc,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";



/* ==========================================
   FIREBASE SETTINGS LOCATION
========================================== */

const SETTINGS_COLLECTION =
    "systemSettings";


const ATTENDANCE_DOCUMENT =
    "attendance";



/* ==========================================
   DEFAULT SETTINGS
========================================== */

const DEFAULT_ATTENDANCE_SETTINGS = {

    enabled: true,

    openingTime: "08:00",

    closingTime: "17:00",

    breakStart: "12:00",

    breakEnd: "13:00",

    gracePeriod: 15,

    lateThreshold: 15,

    undertimeThreshold: 15

};



/* ==========================================
   ELEMENTS
========================================== */

const attendanceEnabled =
    document.getElementById(
        "attendanceEnabled"
    );


const openingTime =
    document.getElementById(
        "openingTime"
    );


const closingTime =
    document.getElementById(
        "closingTime"
    );


const breakStart =
    document.getElementById(
        "breakStart"
    );


const breakEnd =
    document.getElementById(
        "breakEnd"
    );


const gracePeriod =
    document.getElementById(
        "gracePeriod"
    );


const lateThreshold =
    document.getElementById(
        "lateThreshold"
    );


const undertimeThreshold =
    document.getElementById(
        "undertimeThreshold"
    );


const attendanceStatus =
    document.getElementById(
        "attendanceStatus"
    );


const lastSavedText =
    document.getElementById(
        "lastSavedText"
    );



/* ==========================================
   FIRESTORE REFERENCE
========================================== */

function getAttendanceSettingsRef(){

    return doc(

        db,

        SETTINGS_COLLECTION,

        ATTENDANCE_DOCUMENT

    );

}



/* ==========================================
   SAFE NUMBER
========================================== */

function getNumber(
    value,
    fallback = 0
){

    const number =
        Number(value);


    if(
        Number.isFinite(number)
    ){

        return number;

    }


    return fallback;

}



/* ==========================================
   SET STATUS
========================================== */

function setStatus(
    text,
    type = "default"
){

    if(
        !attendanceStatus
    ){

        return;

    }


    attendanceStatus.textContent =
        text;


    attendanceStatus.classList.remove(

        "status-success",

        "status-saving",

        "status-error"

    );


    if(
        type ===
        "success"
    ){

        attendanceStatus.classList.add(
            "status-success"
        );

    }


    if(
        type ===
        "saving"
    ){

        attendanceStatus.classList.add(
            "status-saving"
        );

    }


    if(
        type ===
        "error"
    ){

        attendanceStatus.classList.add(
            "status-error"
        );

    }

}



/* ==========================================
   FORMAT SAVED DATE
========================================== */

function formatSavedDate(
    timestamp
){

    if(
        !timestamp
    ){

        return "";

    }


    try{

        let date;


        if(
            typeof timestamp.toDate ===
            "function"
        ){

            date =
                timestamp.toDate();

        }

        else if(
            timestamp instanceof Date
        ){

            date =
                timestamp;

        }

        else{

            date =
                new Date(
                    timestamp
                );

        }


        if(
            Number.isNaN(
                date.getTime()
            )
        ){

            return "";

        }


        return date.toLocaleString(
            undefined,
            {

                year:
                    "numeric",

                month:
                    "short",

                day:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit"

            }
        );

    }

    catch(error){

        console.error(
            "Date formatting error:",
            error
        );


        return "";

    }

}



/* ==========================================
   UPDATE LAST SAVED TEXT
========================================== */

function updateLastSaved(
    timestamp
){

    if(
        !lastSavedText
    ){

        return;

    }


    const formatted =
        formatSavedDate(
            timestamp
        );


    if(
        formatted
    ){

        lastSavedText.textContent =

            "Last saved: " +

            formatted;

    }

    else{

        lastSavedText.textContent =

            "Settings loaded.";

    }

}



/* ==========================================
   APPLY SETTINGS TO FORM
========================================== */

function applyAttendanceSettings(
    settings
){

    const data = {

        ...DEFAULT_ATTENDANCE_SETTINGS,

        ...(settings || {})

    };


    if(
        attendanceEnabled
    ){

        attendanceEnabled.checked =
            Boolean(
                data.enabled
            );

    }


    if(
        openingTime
    ){

        openingTime.value =
            data.openingTime ||
            DEFAULT_ATTENDANCE_SETTINGS.openingTime;

    }


    if(
        closingTime
    ){

        closingTime.value =
            data.closingTime ||
            DEFAULT_ATTENDANCE_SETTINGS.closingTime;

    }


    if(
        breakStart
    ){

        breakStart.value =
            data.breakStart ||
            DEFAULT_ATTENDANCE_SETTINGS.breakStart;

    }


    if(
        breakEnd
    ){

        breakEnd.value =
            data.breakEnd ||
            DEFAULT_ATTENDANCE_SETTINGS.breakEnd;

    }


    if(
        gracePeriod
    ){

        gracePeriod.value =
            getNumber(
                data.gracePeriod,
                DEFAULT_ATTENDANCE_SETTINGS.gracePeriod
            );

    }


    if(
        lateThreshold
    ){

        lateThreshold.value =
            getNumber(
                data.lateThreshold,
                DEFAULT_ATTENDANCE_SETTINGS.lateThreshold
            );

    }


    if(
        undertimeThreshold
    ){

        undertimeThreshold.value =
            getNumber(
                data.undertimeThreshold,
                DEFAULT_ATTENDANCE_SETTINGS.undertimeThreshold
            );

    }

}



/* ==========================================
   GET SETTINGS FROM FORM
========================================== */

function getAttendanceSettingsFromForm(){

    return {

        enabled:
            attendanceEnabled
            ?
            attendanceEnabled.checked
            :
            true,


        openingTime:
            openingTime
            ?
            openingTime.value
            :
            "08:00",


        closingTime:
            closingTime
            ?
            closingTime.value
            :
            "17:00",


        breakStart:
            breakStart
            ?
            breakStart.value
            :
            "12:00",


        breakEnd:
            breakEnd
            ?
            breakEnd.value
            :
            "13:00",


        gracePeriod:
            getNumber(
                gracePeriod
                ?
                gracePeriod.value
                :
                15,
                15
            ),


        lateThreshold:
            getNumber(
                lateThreshold
                ?
                lateThreshold.value
                :
                15,
                15
            ),


        undertimeThreshold:
            getNumber(
                undertimeThreshold
                ?
                undertimeThreshold.value
                :
                15,
                15
            )

    };

}



/* ==========================================
   VALIDATE TIME SETTINGS
========================================== */

function validateAttendanceSettings(
    settings
){

    if(
        !settings.openingTime
    ){

        return {

            valid:false,

            message:
                "Please enter the Store Opening Time."

        };

    }


    if(
        !settings.closingTime
    ){

        return {

            valid:false,

            message:
                "Please enter the Store Closing Time."

        };

    }


    if(
        !settings.breakStart
    ){

        return {

            valid:false,

            message:
                "Please enter the Break Start time."

        };

    }


    if(
        !settings.breakEnd
    ){

        return {

            valid:false,

            message:
                "Please enter the Break End time."

        };

    }


    /*
     * Basic same-day schedule validation.
     */

    if(
        settings.openingTime >=
        settings.closingTime
    ){

        return {

            valid:false,

            message:
                "Store Closing Time must be later than Store Opening Time."

        };

    }


    if(
        settings.breakStart >=
        settings.breakEnd
    ){

        return {

            valid:false,

            message:
                "Break End must be later than Break Start."

        };

    }


    /*
     * Break should normally be
     * inside the working schedule.
     */

    if(
        settings.breakStart <
        settings.openingTime
        ||

        settings.breakEnd >
        settings.closingTime
    ){

        return {

            valid:false,

            message:
                "Break time must be within the Store Opening and Closing time."

        };

    }


    if(
        settings.gracePeriod < 0
    ){

        return {

            valid:false,

            message:
                "Grace Period cannot be negative."

        };

    }


    if(
        settings.lateThreshold < 0
    ){

        return {

            valid:false,

            message:
                "Late Threshold cannot be negative."

        };

    }


    if(
        settings.undertimeThreshold < 0
    ){

        return {

            valid:false,

            message:
                "Undertime Threshold cannot be negative."

        };

    }


    return {

        valid:true,

        message:""

    };

}



/* ==========================================
   LOAD ATTENDANCE SETTINGS
========================================== */

window.loadAttendanceSettings =
async function(){

    setStatus(
        "LOADING...",
        "saving"
    );


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


            applyAttendanceSettings(
                data
            );


            updateLastSaved(
                data.updatedAt ||
                data.createdAt
            );


            setStatus(
                "SAVED",
                "success"
            );

        }

        else{

            /*
             * No Firebase document yet.
             * Use default settings.
             */

            applyAttendanceSettings(
                DEFAULT_ATTENDANCE_SETTINGS
            );


            if(
                lastSavedText
            ){

                lastSavedText.textContent =

                    "No settings saved yet. Default values are currently being used.";

            }


            setStatus(
                "DEFAULT",
                "default"
            );

        }

    }

    catch(error){

        console.error(
            "Load Attendance Settings Error:",
            error
        );


        /*
         * Keep default values available
         * even if Firebase loading fails.
         */

        applyAttendanceSettings(
            DEFAULT_ATTENDANCE_SETTINGS
        );


        setStatus(
            "LOAD ERROR",
            "error"
        );


        if(
            lastSavedText
        ){

            lastSavedText.textContent =

                "Unable to load settings from Firebase.";

        }

    }

};



/* ==========================================
   SAVE ATTENDANCE SETTINGS
========================================== */

window.saveAttendanceSettings =
async function(){

    const settings =
        getAttendanceSettingsFromForm();


    const validation =
        validateAttendanceSettings(
            settings
        );


    if(
        !validation.valid
    ){

        alert(
            validation.message
        );

        return;

    }


    setStatus(
        "SAVING...",
        "saving"
    );


    try{

        const settingsRef =
            getAttendanceSettingsRef();


        await setDoc(

            settingsRef,

            {

                ...settings,

                updatedAt:
                    serverTimestamp()

            },

            {

                merge:true

            }

        );


        /*
         * Get the document again so
         * the saved timestamp can be
         * displayed.
         */

        const savedSnapshot =
            await getDoc(
                settingsRef
            );


        if(
            savedSnapshot.exists()
        ){

            const savedData =
                savedSnapshot.data();


            applyAttendanceSettings(
                savedData
            );


            updateLastSaved(
                savedData.updatedAt ||
                savedData.createdAt
            );

        }


        setStatus(
            "SAVED",
            "success"
        );


        alert(
            "Attendance Time Settings saved successfully."
        );

    }

    catch(error){

        console.error(
            "Save Attendance Settings Error:",
            error
        );


        setStatus(
            "SAVE ERROR",
            "error"
        );


        alert(

            "Unable to save Attendance Time Settings.\n\n" +

            error.message

        );

    }

};



/* ==========================================
   SETTINGS NAVIGATION
========================================== */

window.showSettingsSection =
function(section){

    const sections = {

        attendance:
            "attendanceSettings",

        general:
            "generalSettings",

        payroll:
            "payrollSettings",

        system:
            "systemSettings"

    };


    /*
     * Hide all sections.
     */

    Object.values(
        sections
    )
    .forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if(element){

                element.classList.remove(
                    "active"
                );

            }

        }
    );


    /*
     * Remove active state
     * from navigation buttons.
     */

    document
        .querySelectorAll(
            ".settings-nav-item"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


    /*
     * Activate requested section.
     */

    const sectionId =
        sections[
            section
        ];


    if(
        sectionId
    ){

        const sectionElement =
            document.getElementById(
                sectionId
            );


        if(sectionElement){

            sectionElement.classList.add(
                "active"
            );

        }

    }


    /*
     * Activate matching navigation button.
     */

    const buttons =
        document.querySelectorAll(
            ".settings-nav-item"
        );


    buttons.forEach(
        button => {

            const clickValue =
                button
                    .getAttribute(
                        "onclick"
                    );


            if(
                clickValue &&
                clickValue.includes(
                    `'${section}'`
                )
            ){

                button.classList.add(
                    "active"
                );

            }

        }
    );

};



/* ==========================================
   BACK TO DASHBOARD
========================================== */

window.goBackToDashboard =
function(){

    window.location.href =
        "dashboard.html";

};



/* ==========================================
   INPUT CHANGE DETECTION
========================================== */

function markSettingsAsChanged(){

    /*
     * Don't overwrite the form.
     * Just change the visual status.
     */

    setStatus(
        "UNSAVED",
        "default"
    );


    if(
        lastSavedText
    ){

        lastSavedText.textContent =

            "You have unsaved changes.";

    }

}



/* ==========================================
   ADD CHANGE LISTENERS
========================================== */

[
    attendanceEnabled,

    openingTime,

    closingTime,

    breakStart,

    breakEnd,

    gracePeriod,

    lateThreshold,

    undertimeThreshold

]
.forEach(
    element => {

        if(!element){

            return;

        }


        element.addEventListener(
            "change",
            markSettingsAsChanged
        );


        element.addEventListener(
            "input",
            markSettingsAsChanged
        );

    }
);



/* ==========================================
   INITIALIZE
========================================== */

async function initializeSettings(){

    console.log(
        "PAPPRITO HRIS Settings initializing..."
    );


    /*
     * Make sure Attendance Time
     * section is active.
     */

    window.showSettingsSection(
        "attendance"
    );


    /*
     * Load Firebase settings.
     */

    await window.loadAttendanceSettings();


    console.log(
        "PAPPRITO HRIS Settings ready."
    );

}



/* ==========================================
   START
========================================== */

initializeSettings();

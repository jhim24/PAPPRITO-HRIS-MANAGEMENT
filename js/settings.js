/* ==========================================
   PAPPRITO HRIS
   ATTENDANCE SETTINGS
========================================== */

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

import { db } from "./firebase.js";


/* ==========================================
   FIRESTORE LOCATION
========================================== */

const attendanceRef = doc(
    db,
    "systemSettings",
    "attendance"
);


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
   ELEMENT HELPER
========================================== */

function el(id) {

    return document.getElementById(id);

}


/* ==========================================
   STATUS
========================================== */

function setStatus(
    message,
    type = ""
) {

    const status = el("attendanceStatus");

    if (!status) return;

    status.textContent = message;

    status.className =
        "status-badge";

    if (type) {

        status.classList.add(
            type
        );

    }

}


/* ==========================================
   LAST SAVED
========================================== */

function setLastSaved(
    message,
    type = ""
) {

    const target =
        el("lastSavedText");

    if (!target) return;

    target.textContent =
        message;

    target.className =
        "save-status";

    if (type) {

        target.classList.add(
            type
        );

    }

}


/* ==========================================
   GET FORM DATA
========================================== */

function getAttendanceFormData() {

    return {

        enabled:
            Boolean(
                el("attendanceEnabled")?.checked
            ),

        openingTime:
            el("openingTime")?.value ||
            DEFAULT_ATTENDANCE_SETTINGS.openingTime,

        closingTime:
            el("closingTime")?.value ||
            DEFAULT_ATTENDANCE_SETTINGS.closingTime,

        breakStart:
            el("breakStart")?.value ||
            DEFAULT_ATTENDANCE_SETTINGS.breakStart,

        breakEnd:
            el("breakEnd")?.value ||
            DEFAULT_ATTENDANCE_SETTINGS.breakEnd,

        gracePeriod:
            Number(
                el("gracePeriod")?.value
            ) || 0,

        lateThreshold:
            Number(
                el("lateThreshold")?.value
            ) || 0,

        undertimeThreshold:
            Number(
                el("undertimeThreshold")?.value
            ) || 0

    };

}


/* ==========================================
   SET FORM DATA
========================================== */

function setAttendanceFormData(
    data
) {

    const settings = {

        ...DEFAULT_ATTENDANCE_SETTINGS,

        ...(data || {})

    };


    if (el("attendanceEnabled")) {

        el("attendanceEnabled").checked =
            Boolean(settings.enabled);

    }


    if (el("openingTime")) {

        el("openingTime").value =
            settings.openingTime;

    }


    if (el("closingTime")) {

        el("closingTime").value =
            settings.closingTime;

    }


    if (el("breakStart")) {

        el("breakStart").value =
            settings.breakStart;

    }


    if (el("breakEnd")) {

        el("breakEnd").value =
            settings.breakEnd;

    }


    if (el("gracePeriod")) {

        el("gracePeriod").value =
            settings.gracePeriod;

    }


    if (el("lateThreshold")) {

        el("lateThreshold").value =
            settings.lateThreshold;

    }


    if (el("undertimeThreshold")) {

        el("undertimeThreshold").value =
            settings.undertimeThreshold;

    }

}


/* ==========================================
   LOAD ATTENDANCE SETTINGS
========================================== */

async function loadAttendanceSettings() {

    try {

        setStatus(
            "Loading...",
            "loading"
        );

        const snapshot =
            await getDoc(
                attendanceRef
            );


        if (snapshot.exists()) {

            const data =
                snapshot.data();

            setAttendanceFormData(
                data
            );

            setStatus(
                "Loaded",
                "success"
            );

            if (data.updatedAt) {

                setLastSaved(
                    "Saved settings loaded from Firestore.",
                    "status-success"
                );

            } else {

                setLastSaved(
                    "Settings loaded.",
                    "status-success"
                );

            }

        } else {

            setAttendanceFormData(
                DEFAULT_ATTENDANCE_SETTINGS
            );

            setStatus(
                "Default",
                "default"
            );

            setLastSaved(
                "No saved settings yet. Default values are being used."
            );

        }

    } catch (error) {

        console.error(
            "Attendance settings load error:",
            error
        );


        setAttendanceFormData(
            DEFAULT_ATTENDANCE_SETTINGS
        );


        setStatus(
            "Error",
            "error"
        );


        setLastSaved(
            "Unable to load Firestore settings. Default values loaded.",
            "status-error"
        );

    }

}


/* ==========================================
   SAVE ATTENDANCE SETTINGS
========================================== */

async function saveAttendanceSettings() {

    const button =
        el("attendanceSaveBtn");


    try {

        if (button) {

            button.disabled = true;

        }


        setStatus(
            "Saving...",
            "saving"
        );


        setLastSaved(
            "Saving settings...",
            "status-saving"
        );


        const data =
            getAttendanceFormData();


        await setDoc(
            attendanceRef,
            {

                ...data,

                updatedAt:
                    serverTimestamp()

            },
            {
                merge: true
            }
        );


        setStatus(
            "Saved",
            "success"
        );


        setLastSaved(
            "Attendance settings saved successfully.",
            "status-success"
        );


    } catch (error) {

        console.error(
            "Attendance settings save error:",
            error
        );


        setStatus(
            "Error",
            "error"
        );


        setLastSaved(
            "Failed to save attendance settings.",
            "status-error"
        );


        alert(
            "Failed to save Attendance Settings.\n\n" +
            "Check your Firebase configuration and Firestore rules."
        );


    } finally {

        if (button) {

            button.disabled = false;

        }

    }

}


/* ==========================================
   RESET ATTENDANCE SETTINGS
========================================== */

function resetAttendanceSettings() {

    const confirmed =
        confirm(
            "Reset Attendance Settings to default values?"
        );


    if (!confirmed) return;


    setAttendanceFormData(
        DEFAULT_ATTENDANCE_SETTINGS
    );


    setStatus(
        "Default",
        "default"
    );


    setLastSaved(
        "Default values restored. Click Save to apply them."
    );

}


/* ==========================================
   SHOW SETTINGS SECTION
========================================== */

function showSettingsSection(
    section
) {

    const sections =
        document.querySelectorAll(
            ".settings-section"
        );


    const buttons =
        document.querySelectorAll(
            ".settings-nav-btn"
        );


    sections.forEach(
        item => {

            item.classList.remove(
                "active"
            );

        }
    );


    buttons.forEach(
        button => {

            button.classList.remove(
                "active"
            );

        }
    );


    const target =
        document.getElementById(
            section + "Settings"
        );


    const button =
        document.querySelector(
            `[data-section="${section}"]`
        );


    if (target) {

        target.classList.add(
            "active"
        );

    }


    if (button) {

        button.classList.add(
            "active"
        );

    }

}


/* ==========================================
   NAVIGATION
========================================== */

function initializeNavigation() {

    document
        .querySelectorAll(
            ".settings-nav-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const section =
                            button.dataset.section;

                        showSettingsSection(
                            section
                        );

                    }
                );

            }
        );

}


/* ==========================================
   DASHBOARD BUTTON
========================================== */

function initializeDashboardButton() {

    const button =
        el("dashboardBtn");


    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            window.location.href =
                "dashboard.html";

        }
    );

}


/* ==========================================
   ATTENDANCE EVENTS
========================================== */

function initializeAttendanceEvents() {

    const saveButton =
        el("attendanceSaveBtn");

    const resetButton =
        el("attendanceResetBtn");


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveAttendanceSettings
        );

    }


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            resetAttendanceSettings
        );

    }


    const enabled =
        el("attendanceEnabled");


    if (enabled) {

        enabled.addEventListener(
            "change",
            () => {

                if (enabled.checked) {

                    setStatus(
                        "Enabled",
                        "success"
                    );

                } else {

                    setStatus(
                        "Disabled",
                        "disabled"
                    );

                }

            }
        );

    }

}


/* ==========================================
   GLOBAL FUNCTIONS
========================================== */

window.loadAttendanceSettings =
    loadAttendanceSettings;

window.saveAttendanceSettings =
    saveAttendanceSettings;

window.showSettingsSection =
    showSettingsSection;


/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        initializeNavigation();

        initializeDashboardButton();

        initializeAttendanceEvents();

        showSettingsSection(
            "attendance"
        );

        await loadAttendanceSettings();

    }
);

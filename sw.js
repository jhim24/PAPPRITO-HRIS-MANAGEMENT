/* ==========================================
   PAPPRITO HRIS
   PWA SERVICE WORKER
========================================== */

const CACHE_NAME = "papprito-hris-v4";

const APP_SHELL = [
    "/",
    "/manifest.json",
    "/pages/dashboard.html",
    "/pages/employee.html",
    "/pages/attendance.html",
    "/pages/trackleaves.html",
    "/pages/autopayroll.html",
    "/pages/payroll.html",
    "/pages/payslip.html",
    "/pages/hrapproval.html",
    "/pages/employeeportal.html",
    "/pages/settings.html",
    "/css/dashboard.css",
    "/css/attendance.css",
    "/css/trackleaves.css",
    "/css/autopayroll.css",
    "/assets/images/logo.png",
    "/assets/images/icon-192.png",
    "/assets/images/icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys =>
                Promise.all(
                    keys
                        .filter(key => key !== CACHE_NAME)
                        .map(key => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response && response.status === 200 && response.type !== "opaque") {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

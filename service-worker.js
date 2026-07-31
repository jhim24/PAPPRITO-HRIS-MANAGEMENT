/* ==========================================
   PAPPRITO HRIS
   SERVICE WORKER
========================================== */

const CACHE_NAME = "papprito-hris-v1";

const FILES_TO_CACHE = [

    "/",

    "/index.html",

    "/manifest.json",

    "/assets/css/login.css",
    "/assets/css/dashboard.css",
    "/assets/css/employee.css",

    "/assets/js/login.js",
    "/assets/js/dashboard.js",
    "/assets/js/employee.js",

    "/assets/images/logo.png"

];

/* ==========================================
   INSTALL
========================================== */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => cache.addAll(FILES_TO_CACHE))

    );

    self.skipWaiting();

});

/* ==========================================
   ACTIVATE
========================================== */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys =>

            Promise.all(

                keys.map(key => {

                    if (key !== CACHE_NAME) {

                        return caches.delete(key);

                    }

                })

            )

        )

    );

    self.clients.claim();

});

/* ==========================================
   FETCH
========================================== */

self.addEventListener("fetch", event => {

    /* Huwag i-cache ang POST request */
    if (event.request.method !== "GET") {

        return;

    }

    /* Huwag i-cache ang Firebase requests */
    if (

        event.request.url.includes("firestore") ||

        event.request.url.includes("firebase") ||

        event.request.url.includes("googleapis")

    ) {

        return;

    }

    event.respondWith(

        caches.match(event.request)

        .then(response => {

            return response ||

                fetch(event.request)

                .then(networkResponse => {

                    return caches.open(CACHE_NAME)

                    .then(cache => {

                        cache.put(

                            event.request,

                            networkResponse.clone()

                        );

                        return networkResponse;

                    });

                });

        })

    );

});

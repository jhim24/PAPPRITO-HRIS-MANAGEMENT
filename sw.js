/* ==========================================
   PAPPRITO HRIS
   SERVICE WORKER
========================================== */

const CACHE_NAME = "papprito-hris-v1";


const APP_SHELL = [

    "./",

    "./manifest.json",

    "./pages/dashboard.html",

    "./pages/employee.html",

    "./pages/attendance.html",

    "./pages/trackleaves.html",

    "./pages/autopayroll.html",

    "./pages/payroll.html",

    "./pages/hrapproval.html",

    "./pages/employeeportal.html",

    "./pages/settings.html",

    "./css/dashboard.css",

    "./css/attendance.css",

    "./css/trackleaves.css",

    "./css/autopayroll.css",

    "./assets/images/logo.png",

    "./assets/images/icon-192.png",

    "./assets/images/icon-512.png"

];


/* ==========================================
   INSTALL
========================================== */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches.open(
                CACHE_NAME
            )
            .then(
                cache => {

                    return cache.addAll(
                        APP_SHELL
                    );

                }
            )

        );

        self.skipWaiting();

    }
);


/* ==========================================
   ACTIVATE
========================================== */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()
            .then(
                keys => {

                    return Promise.all(

                        keys
                        .filter(
                            key =>
                                key !== CACHE_NAME
                        )
                        .map(
                            key =>
                                caches.delete(
                                    key
                                )
                        )

                    );

                }
            )

        );

        self.clients.claim();

    }
);


/* ==========================================
   FETCH
========================================== */

self.addEventListener(
    "fetch",
    event => {

        if(
            event.request.method !== "GET"
        ){

            return;

        }


        event.respondWith(

            caches.match(
                event.request
            )
            .then(
                cachedResponse => {

                    if(
                        cachedResponse
                    ){

                        return cachedResponse;

                    }


                    return fetch(
                        event.request
                    )
                    .then(
                        response => {

                            if(
                                !response ||
                                response.status !== 200 ||
                                response.type === "opaque"
                            ){

                                return response;

                            }


                            const responseClone =
                                response.clone();


                            caches.open(
                                CACHE_NAME
                            )
                            .then(
                                cache => {

                                    cache.put(
                                        event.request,
                                        responseClone
                                    );

                                }
                            );


                            return response;

                        }
                    )
                    .catch(
                        () =>
                            caches.match(
                                "./pages/dashboard.html"
                            )
                    );

                }
            )

        );

    }
);

/* ==========================================
   PAPPRITO HRIS
   SERVICE WORKER V2
========================================== */

const CACHE_NAME = "papprito-hr-v2";


/* ==========================================
   STATIC FILES
========================================== */

const urlsToCache = [

    "/",

    "/index.html",

    "/login.html",

    "/loading.html",

    "/dashboard.html",

    "/employee.html",

    "/attendance.html",

    "/qrattendance.html",

    "/payroll.html",

    "/autopayroll.html",

    "/autoattendance.html",

    "/employeeportal.html",

    "/payslip.html",

    "/hrapproval.html",

    "/attendance-approval.html",

    "/trackleaves.html",

    "/settings.html",

    "/manifest.json",

    "/logo.png",

    "/icon-192.png"

];


/* ==========================================
   INSTALL
========================================== */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches.open(CACHE_NAME)

                .then(cache => {

                    return cache.addAll(
                        urlsToCache
                    );

                })

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

                .then(keys => {

                    return Promise.all(

                        keys.map(key => {

                            if(
                                key !== CACHE_NAME
                            ){

                                return caches.delete(
                                    key
                                );

                            }

                        })

                    );

                })

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

        /*

        Only handle GET requests.

        Do NOT intercept:
        POST
        PUT
        PATCH
        DELETE

        */

        if(
            event.request.method !== "GET"
        ){

            return;

        }


        const request =
            event.request;


        /*
        Firebase and external resources
        should go directly to the network.
        */

        const url =
            new URL(
                request.url
            );


        if(

            url.hostname.includes(
                "googleapis.com"
            )

            ||

            url.hostname.includes(
                "gstatic.com"
            )

            ||

            url.hostname.includes(
                "firebaseio.com"
            )

            ||

            url.hostname.includes(
                "firebaseapp.com"
            )

        ){

            return;

        }


        /* ======================================
           CACHE FIRST
        ====================================== */

        event.respondWith(

            caches.match(request)

                .then(cachedResponse => {

                    if(cachedResponse){

                        return cachedResponse;

                    }


                    return fetch(request)

                        .then(response => {

                            /*
                            Only cache successful
                            basic responses.
                            */

                            if(

                                response.status === 200

                                &&

                                response.type === "basic"

                            ){

                                const responseClone =
                                    response.clone();


                                caches.open(
                                    CACHE_NAME
                                )
                                .then(cache => {

                                    cache.put(
                                        request,
                                        responseClone
                                    );

                                });

                            }


                            return response;

                        });

                })

                .catch(() => {

                    return caches.match(
                        "/index.html"
                    );

                })

        );

    }
);


/* ==========================================
   MESSAGE
========================================== */

self.addEventListener(
    "message",
    event => {

        if(
            event.data ===
            "SKIP_WAITING"
        ){

            self.skipWaiting();

        }

    }
);

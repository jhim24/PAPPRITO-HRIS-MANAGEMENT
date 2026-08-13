/* ==========================================
   PAPPRITO HRIS
   SERVICE WORKER V3
========================================== */

const CACHE_NAME = "papprito-hr-v3";


/* ==========================================
   INSTALL
========================================== */

self.addEventListener(
    "install",
    event => {

        /*
           Activate new service worker
           immediately.
        */

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

            caches.keys().then(
                keys => {

                    return Promise.all(

                        keys.map(
                            key => {

                                /*
                                   Delete all old
                                   PAPPRITO caches.
                                */

                                return caches.delete(
                                    key
                                );

                            }
                        )

                    );

                }
            )

        );


        /*
           Take control of all pages
           immediately.
        */

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
           Always get the latest file
           from the server first.

           If server is unavailable,
           use cache as fallback.
        */

        event.respondWith(

            fetch(event.request)

                .then(response => {

                    /*
                       Clone response before
                       returning it.
                    */

                    const responseClone =
                        response.clone();


                    /*
                       Cache successful
                       GET requests only.
                    */

                    if(
                        event.request.method ===
                        "GET"
                    ){

                        caches.open(
                            CACHE_NAME
                        )
                        .then(cache => {

                            cache.put(
                                event.request,
                                responseClone
                            );

                        });

                    }


                    return response;

                })

                .catch(() => {

                    return caches.match(
                        event.request
                    );

                })

        );

    }
);

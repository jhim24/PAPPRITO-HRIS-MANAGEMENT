const CACHE_NAME = "papprito-hr";

const urlsToCache = [

"/",
"/index.html",
"/employee.html",
"/attendance.html",
"/payroll.html",
"/employeeportal.html",
"/hrapproval.html",
"/payslip.html",
"/trackleaves.html",
"/manifest.json",
"/logo.png",
"/icon-192.png"

];

/* INSTALL */

self.addEventListener("install",event=>{

self.skipWaiting();

event.waitUntil(

caches.open(CACHE_NAME)
.then(cache=>{

return cache.addAll(urlsToCache);

})

);

});

/* ACTIVATE */

self.addEventListener("activate",event=>{

event.waitUntil(

caches.keys().then(keys=>{

return Promise.all(

keys.map(key=>{

if(key !== CACHE_NAME){

return caches.delete(key);

}

})

);

})

);

self.clients.claim();

});

/* FETCH */

self.addEventListener("fetch",event=>{

event.respondWith(

fetch(event.request)

.then(response=>{

const responseClone =
response.clone();

caches.open(CACHE_NAME)
.then(cache=>{

cache.put(
event.request,
responseClone
);

});

return response;

})

.catch(()=>{

return caches.match(
event.request
);

})

);

});

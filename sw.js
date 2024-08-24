// importScripts(
//   "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js",
// );
// importScripts(
//   "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js",
// );
// const f_app = initializeApp({
//   apiKey: "AIzaSyAv8QaZaRjJ6HRHX7ymQWoUalNYx2lSRUA",
//   authDomain: "wmcd-site.firebaseapp.com",
//   projectId: "wmcd-site",
//   storageBucket: "wmcd-site.appspot.com",
//   messagingSenderId: "853912113754",
//   appId: "1:853912113754:web:14aa98bbd15ceab7aa3e63",
// });
// const f_msg = getMessaging(f_app);
// onMessage(f_msg, (payload) => {
//   console.log(`onMessage: ${payload}`);
// });
// onBackgroundMessage(f_msg, (payload) => {
//   console.log(`onMessage: ${payload}`);
// });
self.addEventListener("install", event => {
  console.log("service worker installing...");
  event.waitUntil(caches.open("static-v1").then(cache => cache.add("/ficus/icons/192.png")));
});
self.addEventListener("activate", event => {
  console.log("V1 now ready to handle fetches!");
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  console.log(`intercepting request for ${event.request.url}`);

  if (url.pathname.includes("fuck")) {
    console.log("how does this work");
    event.respondWith(new Response("ok bro", {
      status: 200
    }));
    return;
  }

  event.respondWith((async () => {
    try {
      return await fetch(event.request);
    } catch (error) {
      console.error("Fetch error:", error);
      return new Response("An unknown error occurred", {
        status: 500
      });
    }
  })());
});
console.log("service worker hello ffs");
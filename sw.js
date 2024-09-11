const VERSION = 1;
self.addEventListener("install", event => {
  console.log("service worker installing..."); // TODO: Enumerate all the assets that the app needs to function offline
  // TODO: Also figure out how to cache transactions and other app data
  // like budgets

  event.waitUntil(caches.open("static-v1").then(cache => cache.add("/ficus/icons/192.png")));
});
self.addEventListener("activate", event => {
  console.log("V1 now ready to handle fetches!");
});
self.addEventListener("push", event => {
  console.log("Push message received:", event);
  const title = "New Push Notification";
  const options = {
    body: event.data ? event.data.text() : "No payload",
    icon: "/ficus/icons/192.png",
    badge: "/ficus/icons/192.png"
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  console.log(`intercepting request for ${event.request.url}`);

  if (url.pathname == "/swtest") {
    console.log(`sw is alive and well, version ${VERSION}`);
    event.respondWith(new Response(JSON.stringify({
      ok: "true",
      version: VERSION
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
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
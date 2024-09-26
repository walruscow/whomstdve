const VERSION = 1;
self.addEventListener("install", event => {
  console.log("service worker installing...");

  // activate immediately
  self.skipWaiting();
  event.waitUntil(
  // cache necessary static assets
  cache_assets());
});
async function cache_assets() {
  // TODO: Also figure out how to cache transactions and other app data
  // like budgets
  const static_assets = [
  // html stuff
  "/stylin.css", "/ficus/icons/192.png", "/ficus/icons/512.png", "/ficus/index.html", "/ficus/stylin.css",
  // js
  "/auth.js", "/wapi.js",
  // ficus
  "/ficus/account.js", "/ficus/app.js", "/ficus/ficus.js", "/ficus/history.js", "/ficus/overview.js", "/ficus/review.js"];
  let cache = await caches.open(`static-v${VERSION}`);
  await Promise.all(static_assets.map(u => cache.add(u)));
}
self.addEventListener("activate", event => {
  console.log(`v${VERSION} now ready to handle fetches!`);
  event.waitUntil(self.clients.claim());
});
self.addEventListener("push", event => {
  console.log("Push message received:", event);
  const txn = event.data.json().txn;
  const paddedCents = Math.abs(txn.cents).toString().padStart(3, "0");
  const dollars = paddedCents.slice(0, -2);
  const cents = paddedCents.slice(-2);
  const options = {
    body: `$${dollars}.${cents} at ${txn.description}`,
    icon: "/ficus/icons/192.png",
    badge: "/ficus/icons/192.png",
    data: txn,
    tag: txn.id
  };
  const title = txn.cents < 0 ? "Money Well Spent 💸" : "Money Received 💰";
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  console.log(`intercepting request for ${event.request.url}`);
  if (url.pathname == "/_swtest") {
    // A special path to check if the service worker is online
    console.log(`hello from sw version ${VERSION}`);
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
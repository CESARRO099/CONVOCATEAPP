const CACHE_NAME = "convocate-v1";
const ASSETS = ["./index.html", "./manifest.json", "./icon.png"];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  // Datos de Supabase: siempre a la red (necesitamos info actualizada).
  if (event.request.url.includes("supabase.co")) return;
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      // Safari/iOS no acepta que un service worker devuelva una respuesta
      // que vino de una redirección (ej: Vercel redirigiendo "/" a
      // "/index.html"). Se reconstruye una respuesta "limpia".
      if (response.redirected) {
        const body = await response.blob();
        return new Response(body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      }
      return response;
    })()
  );
});
// ---------------------------------------------------------
// Notificaciones push
// ---------------------------------------------------------
self.addEventListener("push", (event) => {
  let data = { title: "Convocate", body: "Tenés una novedad." };
  try { data = event.data.json(); } catch (e) {}
  event.waitUntil(
    self.registration.showNotification(data.title || "Convocate", {
      body: data.body || "",
      icon: "./icon.png",
      badge: "./icon.png",
      data: { url: data.url || "./index.html" }
    })
  );
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "./index.html";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((all) => {
      for (const c of all) if (c.url.includes(url) && "focus" in c) return c.focus();
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

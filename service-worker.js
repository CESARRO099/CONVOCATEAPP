const CACHE_NAME = "convocate-v3";
const ASSETS = ["./manifest.json", "./icon.png"];
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
  const url = event.request.url;
  // Datos de Supabase: siempre a la red (necesitamos info actualizada).
  if (url.includes("supabase.co")) return;

  // El documento HTML y el propio código (index.html, /, y cualquier
  // navegación): SIEMPRE a la red primero, para no quedar pegados con
  // una versión vieja del código. Solo si no hay conexión, se usa la
  // copia guardada como respaldo.
  const esDocumento = event.request.mode === "navigate" || url.endsWith("index.html") || url.endsWith("/");
  if (esDocumento) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request, { cache: "no-store" });
          return response;
        } catch (e) {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          throw e;
        }
      })()
    );
    return;
  }

  // El resto (imágenes, fuentes, manifest): cache primero, más rápido.
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
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

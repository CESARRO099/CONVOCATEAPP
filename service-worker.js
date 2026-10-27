const CACHE_NAME = "convocate-v5";
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
          // Guardamos una copia de la pantalla para poder abrirla sin conexión.
          if (response.ok && response.status === 200 && !response.redirected && event.request.method === "GET") {
            const copia = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((c) => c.put(event.request, copia)).catch(() => {}));
          }
          return response;
        } catch (e) {
          const cached = await caches.match(event.request, { ignoreSearch: true });
          if (cached) return cached;
          return new Response(
            "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><title>Sin conexión</title><body style='font-family:sans-serif;text-align:center;padding:40px 20px'><h2>Sin conexión</h2><p>No hay internet en este momento. Cuando vuelva la señal, abrí la app de nuevo.</p></body>",
            { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
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
// Solo se abren enlaces de esta misma app; cualquier otro se cambia por la pantalla principal.
function urlSegura(u) {
  try {
    const abs = new URL(u || "./index.html", self.registration.scope);
    if (abs.origin === self.location.origin) return abs.href;
  } catch (e) {}
  return new URL("./index.html", self.registration.scope).href;
}
self.addEventListener("push", (event) => {
  let data = { title: "Convocate", body: "Tenés una novedad." };
  try { data = event.data.json(); } catch (e) {}
  event.waitUntil(
    self.registration.showNotification(data.title || "Convocate", {
      body: data.body || "",
      icon: "./icon.png",
      badge: "./icon.png",
      data: { url: urlSegura(data.url) }
    })
  );
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = urlSegura(event.notification.data?.url);
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((all) => {
      for (const c of all) if (c.url.includes(url) && "focus" in c) return c.focus();
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

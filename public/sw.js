if (!self.define) {
  let e,
    i = {};
  const n = (n, s) => (
    (n = new URL(n + ".js", s).href),
    i[n] ||
      new Promise((i) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = n), (e.onload = i), document.head.appendChild(e);
        } else (e = n), importScripts(n), i();
      }).then(() => {
        let e = i[n];
        if (!e) throw new Error(`Module ${n} didn’t register its module`);
        return e;
      })
  );
  self.define = (s, t) => {
    const a =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (i[a]) return;
    let c = {};
    const r = (e) => n(e, a),
      u = { module: { uri: a }, exports: c, require: r };
    i[a] = Promise.all(s.map((e) => u[e] || r(e))).then((e) => (t(...e), c));
  };
}
define(["./workbox-f52fd911"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/app-build-manifest.json",
          revision: "95f07bf2554cbe5a8750ae692a231e81",
        },
        {
          url: "/_next/static/J9DEdi82qutFI7kRQYJ4n/_buildManifest.js",
          revision: "c155cce658e53418dec34664328b51ac",
        },
        {
          url: "/_next/static/J9DEdi82qutFI7kRQYJ4n/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/chunks/117-d8b42f138b0e30d9.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/145-7f80673f17a4c375.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/210-b1bce75a7c1b1b92.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/408-2bc8f9626c96dd0c.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/41ade5dc-e6840933a2201c74.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/438-8ebe893049f235d4.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/479-4bf017912028b8df.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/670-45e7ed0782d32d1c.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/972-211b74ebdec155c1.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-4d1f1e5ae4dcd19a.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/app/auth/signin/page-175b672716d4f01d.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/app/auth/signup/page-399554b72b674529.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/app/downloaded-recipes/page-f08a316e568e5923.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/app/error-0a007f1fa363b252.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/app/favorites/page-ac6831a52e88af5e.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/app/layout-44cac73a081db79a.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/app/loading-0c84d000ba243508.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/app/not-found-19db4eb1ec84a579.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/app/page-f42141b3778d360e.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/app/profile/page-2e258a1fb60df8b6.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/app/recipes/%5Bid%5D/page-e947010415b6cb46.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/app/shopping-list/page-6b5d78a4d96708be.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/fd9d1056-52bf880d6adf56a0.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/framework-f66176bb897dc684.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/main-a195cf55ab9c2a96.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/main-app-1446eeeac3e62efd.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/pages/_app-72b849fbd24ac258.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/pages/_error-7ba65e1336b92748.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-68d128f78d0676ff.js",
          revision: "J9DEdi82qutFI7kRQYJ4n",
        },
        {
          url: "/_next/static/css/7f24e8b14813d054.css",
          revision: "7f24e8b14813d054",
        },
        {
          url: "/android-chrome-192x192.png",
          revision: "0b1ea54e1cab7482905ed7f81eb6ef4b",
        },
        {
          url: "/android-chrome-512x512.png",
          revision: "c260dba8539adc195714077544dd3040",
        },
        {
          url: "/apple-touch-icon-72x72.png",
          revision: "21f2aa7ba259aff14a02519bf501ec80",
        },
        {
          url: "/favicon-16x16.png",
          revision: "96332a57728eb690913064f95e58df7d",
        },
        {
          url: "/favicon-32x32.png",
          revision: "948cb0d52ca1739250e404d15397ce49",
        },
        { url: "/favicon.ico", revision: "238a414c811c0a47793bfafa8bacedc3" },
        {
          url: "/hero_section1.jpg",
          revision: "5bf05d15424b8b83af977d21c7ec6875",
        },
        { url: "/logo.png", revision: "4a89d4109d583314e0fa020d161eaf3a" },
        {
          url: "/service-worker.js",
          revision: "00abf7209eca3871bcd6d9f0742cabdb",
        },
        {
          url: "/site.webmanifest",
          revision: "42f249531950d3f8f751c617da809a68",
        },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: i,
              event: n,
              state: s,
            }) =>
              i && "opaqueredirect" === i.type
                ? new Response(i.body, {
                    status: 200,
                    statusText: "OK",
                    headers: i.headers,
                  })
                : i,
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/.*\.(?:png|jpg|jpeg|webp|svg|gif)$/,
      new e.CacheFirst({
        cacheName: "image-cache",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 2592e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/api\..*\.com\/.*$/,
      new e.NetworkFirst({
        cacheName: "api-cache",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    );
});

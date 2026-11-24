// js/loader.js — FIX l-mohem: Babel + fichiers mfr9in
// L-mochkil l-9dim: <script type="text/babel" src="..."> kay-jib l-fichiers async
// w main.js kay-khdm 9bel data.js => I18N / mkField = undefined => page khawya.
// Hna kan-jibohom b tartib, wa7d b wa7d, w kan-executiwhom b tartib.
(async function () {
  const files = ["./js/data.js", "./js/app.js", "./js/main.js"];
  try {
    for (const url of files) {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Ma l9itch fichier: " + url + " (" + res.status + ")");
      const code = await res.text();
      // Babel kay-7awel JSX l React.createElement
      const out = Babel.transform(code, { presets: ["react"] }).code;
      // executa f global scope (bach data.js y-b9a visible l app.js w main.js)
      // eval hna m9soud, machi eval 3adi f function scope
      (0, eval)(out);
    }
  } catch (err) {
    console.error(err);
    document.getElementById("root").innerHTML =
      '<div style="padding:24px;font-family:sans-serif;max-width:640px;margin:40px auto;background:#fff;border:1px solid #fca5a5;border-radius:16px;color:#991b1b">' +
      '<h2 style="margin:0 0 8px">⚠ Ma khdmch l-app</h2>' +
      '<p style="margin:0;color:#374151">7l Console b F12 w chof l-error. L-error l-aktar chyo3an:</p>' +
      '<ul style="color:#374151"><li>CodeSandbox khasso y-khdm b <b>http</b> machi b file:// — fetch() ma kay-khdmch f file://</li>' +
      '<li>Chi fichier na9s f l-dossier js/ — khass ykono data.js + app.js + main.js + loader.js</li>' +
      '<li>Internet ma9to3 — React / Babel / Tailwind jayin mn CDN</li></ul>' +
      '<pre style="background:#fef2f2;padding:12px;border-radius:8px;overflow:auto;white-space:pre-wrap">' + String(err && err.message ? err.message : err) + '</pre></div>';
  }
})();

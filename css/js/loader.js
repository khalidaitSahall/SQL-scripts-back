// js/loader.js — FIX v2: jm3 kolchi f eval WA7DA
// L-khata l-9dim: eval() l kol fichier bo7do + Babel kay-zid "use strict"
// => const dyal data.js ma kay-wsloch l main.js => crash => page khawya.
// Hna: fetch 3 fichiers -> jm3hom f string wa7da -> Babel mra wa7da -> eval mra wa7da.
(async function () {
  const files = ["./js/data.js", "./js/app.js", "./js/main.js"];
  const root = document.getElementById("root");
  function showError(title, err) {
    console.error("[Schema Canvas]", title, err);
    const msg = err && err.stack ? err.stack : String(err);
    root.innerHTML =
      '<div style="padding:24px;font-family:sans-serif;max-width:720px;margin:40px auto;background:#fff;border:1px solid #fca5a5;border-radius:16px;color:#991b1b">' +
      '<h2 style="margin:0 0 8px">⚠ ' + title + '</h2>' +
      '<p style="margin:0 0 12px;color:#374151">Copie had l-error w siftou liya, ghadi n3rf b dabt fin l-mochkil:</p>' +
      '<pre style="background:#fef2f2;padding:12px;border-radius:8px;overflow:auto;white-space:pre-wrap;font-size:12px;line-height:1.5">' + msg.replace(/</g,"&lt;") + '</pre>' +
      '<p style="color:#374151;font-size:13px">Checklist rapide: 1) fichiers js/ kamlin kaynin? 2) Preview b http machi file:// ? 3) Internet khdam (React/Babel mn CDN)?</p></div>';
  }
  try {
    if (typeof React === "undefined") throw new Error("React ma t-chargach mn CDN. Internet ma9to3 wla unpkg.com m-bloki.");
    if (typeof Babel === "undefined") throw new Error("Babel ma t-chargach mn CDN. Internet ma9to3 wla unpkg.com m-bloki.");
    let combined = "";
    for (const url of files) {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Ma l9itch fichier: " + url + " — HTTP " + res.status + ". Wach l-fichier kayn f CodeSandbox f nafs l-blassa?");
      const code = await res.text();
      if (!code.trim()) throw new Error("Fichier khawi: " + url);
      combined += "\n// ===== " + url + " =====\n" + code;
    }
    const out = Babel.transform(combined, { presets: ["react"] }).code;
    // eval WA7DA l kolchi, bach const dyal data.js y-b9aw visible l main.js
    (0, eval)(out);
    console.log("[Schema Canvas] OK - app khdmat");
  } catch (err) {
    showError("Ma khdmch l-app", err);
  }
})();

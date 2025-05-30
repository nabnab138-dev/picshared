// CHANGE THIS to your deployed backend API URL!
const API = "https://6daa38e6-3bfb-4337-bb6c-a622fc84bf33-00-3iweonu4xllbf.picard.replit.dev";

// Utility functions
function show(el) { el.style.display = ""; }
function hide(el) { el.style.display = "none"; }
function $(id) { return document.getElementById(id); }

// =====================
// Auth/session UI logic
// =====================

async function checkSession() {
  let res = await fetch(API + "/api/session", { credentials: "include" });
  let js = await res.json();
  if (js.loggedIn) {
    $("welcome").textContent = "Welcome, " + js.username + "!";
    show($("logout-btn")); show($("upload-btn"));
    hide($("login-btn")); hide($("register-btn"));
  } else {
    $("welcome").textContent = "";
    hide($("logout-btn")); hide($("upload-btn"));
    show($("login-btn")); show($("register-btn"));
  }
}
checkSession();

// =============
// Photo gallery
// =============

async function loadPhotos() {
  let res = await fetch(API + "/api/photos");
  let js = await res.json();
  let ul = $("photos");
  ul.innerHTML = "";
  if (!js.length) {
    ul.innerHTML = "<li>No photos uploaded yet.</li>";
  } else {
    js.forEach(photo => {
      let li = document.createElement("li");
      li.innerHTML = `
        <a href="photo.html?id=${photo.id}"><strong>${photo.title}</strong></a><br>
        <img src="${API}/uploads/${photo.filename}" alt="thumb" style="height: 100px;"><br>
        By ${photo.uploader}, ${new Date(photo.date).toLocaleString()}
      `;
      ul.appendChild(li);
    });
  }
}
if ($("photos")) loadPhotos();

// ============
// Modal logic
// ============

if ($("login-btn")) $("login-btn").onclick = () => { show($("login-modal")); };
if ($("register-btn")) $("register-btn").onclick = () => { show($("register-modal")); };
if ($("logout-btn")) $("logout-btn").onclick = async () => {
  await fetch(API + "/api/logout", { method: "POST", credentials: "include" });
  checkSession(); if ($("photos")) loadPhotos();
};
if ($("upload-btn")) $("upload-btn").onclick = () => { show($("upload-modal")); };

window.onclick = e => {
  if (e.target.className === "modal") hide(e.target);
};

// ===========
// Login logic
// ===========

if ($("login-form")) $("login-form").onsubmit = async e => {
  e.preventDefault();
  let form = new FormData(e.target);
  let res = await fetch(API + "/api/login", {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: form.get("username"), password: form.get("password") })
  });
  let js = await res.json();
  if (js.success) { hide($("login-modal")); checkSession(); }
  else $("login-error").textContent = js.error || "Login failed";
};

// ===============
// Register logic
// ===============

if ($("register-form")) $("register-form").onsubmit = async e => {
  e.preventDefault();
  let form = new FormData(e.target);
  let res = await fetch(API + "/api/register", {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: form.get("username"), password: form.get("password") })
  });
  let js = await res.json();
  if (js.success) { hide($("register-modal")); checkSession(); }
  else $("register-error").textContent = js.error || "Register failed";
};

// ==============
// Upload logic
// ==============

if ($("upload-form")) $("upload-form").onsubmit = async e => {
  e.preventDefault();
  let form = new FormData(e.target);
  let res = await fetch(API + "/api/upload", {
    method: "POST", credentials: "include",
    body: form
  });
  let js = await res.json();
  if (js.success) { hide($("upload-modal")); if ($("photos")) loadPhotos(); }
  else $("upload-error").textContent = js.error || "Upload failed";
};

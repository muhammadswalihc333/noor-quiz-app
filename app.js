/* ============================================================
   NOOR AI MADRASA QUIZ
   COMPLETE FIXED JAVASCRIPT
   Google Mobile Redirect Login + Firebase + REST + Local
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyD-vcPSpB3LVCBObQsrHvBQ8N_Zyty0pgg",
  authDomain: "noor-ai-madrasa-app.firebaseapp.com",
  databaseURL: "https://noor-ai-madrasa-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "noor-ai-madrasa-app",
  storageBucket: "noor-ai-madrasa-app.firebasestorage.app",
  messagingSenderId: "150380342282",
  appId: "1:150380342282:web:5f5c459e30a072cf1dc3f3"
};

const REST_URL =
  "https://noor-ai-madrasa-app-default-rtdb.asia-southeast1.firebasedatabase.app";

let firebaseDB = null;

/* ============================================================
   FIREBASE INITIALIZATION
   ============================================================ */

try {
  if (window.firebase) {

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    firebaseDB = firebase.database();

    setTimeout(() => {

      const s = document.getElementById("firebaseStatus");

      if (s) {
        s.innerText =
          "✅ Firebase 8.10.1 + REST + Local - Connected - V9.17.2 FINAL SECURE";
      }

      const si = document.getElementById("storageInfo");

      if (si) {
        si.innerText =
          "✅ Secure - Firebase + REST + Local Backup - All Options Fixed";
      }

    }, 800);

  } else {

    const s = document.getElementById("firebaseStatus");

    if (s) {
      s.innerText =
        "⚠️ Firebase SDK not loaded - REST mode available";
    }
  }

} catch (e) {

  console.error("Firebase initialization error:", e);

  const s = document.getElementById("firebaseStatus");

  if (s) {
    s.innerText =
      "⚠️ Firebase SDK Failed - REST mode available";
  }
}


/* ============================================================
   GLOBAL VARIABLES
   ============================================================ */

let currentEventId = "";
let questions = [];
let totalMinutes = 10;
let eventQuestionCount = 20;
let randomMode = true;
let currentQ = 0;
let score = 0;
let timerInt = null;
let startTime = null;
let lastGeneratedLink = "";

let currentLogoBase64 = "";
let currentBannerBase64 = "";
let currentCertBase64 = "";

let showCorrectWrong = true;

let certPos = {
  x: "50",
  y: "60",
  s: "24"
};

let eventPhoneLock = true;
let eventDeviceLock = true;

const MASTER_ADMIN_EMAIL =
  "muhammadswalihc333@gmail.com";

let masterLoggedIn = false;

let sessionRole = "none";
// none | organizer | master

let activeOrganizerId =
  localStorage.getItem("noor_organizer_id") || "";


/* ============================================================
   ROLE
   ============================================================ */

function getUserRole() {
  return sessionRole;
}

function getOrganizerId() {
  return activeOrganizerId;
}


/* ============================================================
   INITIALIZATION
   ============================================================ */

function init() {

  const params =
    new URLSearchParams(window.location.search);

  const urlId =
    params.get("event");

  const orgId =
    params.get("org");

  if (urlId) {

    currentEventId = urlId;

  } else {

    currentEventId =
      localStorage.getItem("currentEventId_v17") ||
      localStorage.getItem("currentEventId_v16") ||
      "";
  }

  if (
    orgId &&
    (
      params.get("activate") === "1" ||
      params.get("activate") === "true"
    )
  ) {

    window._pendingOrganizerId = orgId;

    setTimeout(
      showOrganizerActivation,
      250
    );
  }

  if (params.get("master") === "1") {

    setTimeout(
      openMasterAdmin,
      350
    );
  }

  try {

    questions = JSON.parse(
      localStorage.getItem("questions_v13") || "[]"
    );

  } catch {

    questions = [];
  }

  try {

    const sp = JSON.parse(
      localStorage.getItem("certPos_v13") ||
      '{"x":"50","y":"60","s":"24"}'
    );

    certPos = sp;

  } catch {

    certPos = {
      x: "50",
      y: "60",
      s: "24"
    };
  }

  if (document.getElementById("certX")) {

    document.getElementById("certX").value =
      certPos.x;

    document.getElementById("certY").value =
      certPos.y;

    document.getElementById("certS").value =
      certPos.s;

    updateCertLive();
  }

  const lastLink =
    localStorage.getItem(
      "lastGeneratedLink_v14"
    );

  if (
    lastLink &&
    document.getElementById("generatedLink")
  ) {

    lastGeneratedLink = lastLink;

    document.getElementById(
      "generatedLink"
    ).innerText = lastLink;
  }
}


/* ============================================================
   ORGANIZER LOGIN
   ============================================================ */

function getAdminPhone() {

  return localStorage.getItem(
    "noor_admin_phone"
  ) || "";
}

function getAdminPass() {

  return localStorage.getItem(
    "noor_admin_pass"
  ) || "";
}


async function getOrganizerRecord(id) {

  if (!id) return null;

  try {

    return await masterDb(
      "masterAdmin/organizers/" + id
    );

  } catch {

    return null;
  }
}


async function activateOrganizer() {

  const email =
    prompt("Organizer email:", "");

  if (email === null) return;

  const code =
    prompt("Activation code:", "");

  if (code === null) return;

  const e =
    email.trim().toLowerCase();

  const c =
    code.trim();

  if (!e || !c) {

    alert(
      "Email and activation code are required."
    );

    return;
  }

  try {

    const data =
      await masterDb(
        "masterAdmin/organizers"
      );

    const match =
      Object.entries(data || {})
        .find(
          ([id, o]) =>
            String(o.email || "")
              .trim()
              .toLowerCase() === e &&
            String(o.activationCode || "") === c &&
            o.active !== false
        );

    if (!match) {

      alert(
        "Invalid activation code/email or this organizer is disabled."
      );

      return;
    }

    const [id] = match;

    const phone =
      prompt(
        "Set your Admin phone number:",
        ""
      );

    if (phone === null) return;

    const pass =
      prompt(
        "Set your Admin password (minimum 6 characters):",
        ""
      );

    if (pass === null) return;

    if (
      !phone.trim() ||
      pass.trim().length < 6
    ) {

      alert(
        "Phone number is required and password must be at least 6 characters."
      );

      return;
    }

    localStorage.setItem(
      "noor_organizer_id",
      id
    );

    localStorage.setItem(
      "noor_admin_phone",
      phone.trim()
    );

    localStorage.setItem(
      "noor_admin_pass",
      pass.trim()
    );

    activeOrganizerId = id;

    sessionRole = "organizer";

    await masterDb(
      "masterAdmin/organizers/" + id,
      "PATCH",
      {
        activated: true,
        activatedAt: Date.now()
      }
    );

    alert(
      "✅ Organizer activated.\n\nYou can now login with your Admin phone and password."
    );

  } catch (err) {

    console.error(err);

    alert(
      "Activation failed. Please check Firebase connection."
    );
  }
}


/* ============================================================
   ADMIN LOGIN
   ============================================================ */

async function loginAdmin() {

  const phone =
    (
      document.getElementById(
        "adminPhone"
      )?.value || ""
    ).trim();

  const input =
    (
      document.getElementById(
        "adminPass"
      )?.value || ""
    ).trim();

  const err =
    document.getElementById(
      "loginError"
    );

  if (!phone || !input) {

    if (err) {

      err.innerText =
        "Phone number and password are required.";

      err.classList.remove("hidden");
    }

    return;
  }

  const savedPhone =
    getAdminPhone();

  const savedPass =
    getAdminPass();

  if (!savedPhone || !savedPass) {

    if (err) {

      err.innerText =
        "Admin login is not configured. Use Organizer Activation first.";

      err.classList.remove("hidden");
    }

    return;
  }

  if (
    phone === savedPhone &&
    input === savedPass
  ) {

    if (activeOrganizerId) {

      const org =
        await getOrganizerRecord(
          activeOrganizerId
        );

      if (
        !org ||
        org.active === false
      ) {

        if (err) {

          err.innerText =
            "This organizer account has been disabled by Master Admin.";

          err.classList.remove("hidden");
        }

        return;
      }

      sessionRole = "organizer";

    } else {

      sessionRole = "organizer";
    }

    document
      .getElementById("competitorView")
      ?.classList.add("hidden");

    document
      .getElementById("adminView")
      ?.classList.remove("hidden");

    err?.classList.add("hidden");

    const ap =
      document.getElementById(
        "adminPhone"
      );

    const aw =
      document.getElementById(
        "adminPass"
      );

    if (ap) ap.value = "";
    if (aw) aw.value = "";

    removeMasterControlButton();

    try {
      renderQuestions();
    } catch {}

    try {
      loadPastEvents();
    } catch {}

    try {
      loadResults();
    } catch {}

  } else {

    if (err) {

      err.innerText =
        "Incorrect phone number or password.";

      err.classList.remove("hidden");
    }
  }
}


/* ============================================================
   ADMIN CREDENTIAL SETUP
   ============================================================ */

function openAdminCredentialSetup() {

  const currentPhone =
    getAdminPhone();

  const currentPass =
    getAdminPass();

  const phone =
    prompt(
      "Admin phone number:",
      currentPhone
    );

  if (phone === null) return;

  const pass =
    prompt(
      "New admin password:",
      currentPass
    );

  if (pass === null) return;

  const p =
    phone.trim();

  const pw =
    pass.trim();

  if (!p || !pw) {

    alert(
      "Phone number and password are required."
    );

    return;
  }

  if (pw.length < 6) {

    alert(
      "Use at least 6 characters for the password."
    );

    return;
  }

  localStorage.setItem(
    "noor_admin_phone",
    p
  );

  localStorage.setItem(
    "noor_admin_pass",
    pw
  );

  alert(
    "Admin login details updated."
  );
}


/* ============================================================
   MASTER BUTTON
   ============================================================ */

function addMasterControlButton() {

  const admin =
    document.getElementById(
      "adminView"
    );

  if (!admin) return;

  removeMasterControlButton();

  const b =
    document.createElement("button");

  b.id =
    "masterControlBtn";

  b.className =
    "bg-purple-700 text-white py-3 px-4 rounded-xl font-black mt-3 w-full";

  b.textContent =
    "👑 MASTER CONTROL";

  b.onclick =
    openMasterAdmin;

  const target =
    admin.querySelector(
      ".max-w-\\[650px\\]"
    );

  if (target) {

    target.prepend(b);

  } else {

    admin.prepend(b);
  }
}


function removeMasterControlButton() {

  document
    .getElementById(
      "masterControlBtn"
    )
    ?.remove();
}


/* ============================================================
   LOGOUT
   ============================================================ */

function logoutAdmin() {

  document
    .getElementById("adminView")
    ?.classList.add("hidden");

  document
    .getElementById("competitorView")
    ?.classList.remove("hidden");

  if (sessionRole === "master") {

    masterLoggedIn = false;

    try {

      if (
        window.firebase &&
        firebase.auth
      ) {

        firebase.auth().signOut();
      }

    } catch {}

    const overlay =
      document.getElementById(
        "masterOverlay"
      );

    if (overlay) {
      overlay.style.display = "none";
    }
  }

  sessionRole = "none";

  removeMasterControlButton();
}


/* ============================================================
   CATEGORY
   ============================================================ */

function handleCategoryChange(v) {

  const box =
    document.getElementById(
      "customCategoryBox"
    );

  if (box) {

    box.classList.toggle(
      "hidden",
      v !== "Other"
    );
  }
}


/* ============================================================
   CERTIFICATE
   ============================================================ */

function switchCert(t) {

  document
    .getElementById("certOpt1")
    ?.classList.toggle(
      "hidden",
      t !== 1
    );

  document
    .getElementById("certOpt2")
    ?.classList.toggle(
      "hidden",
      t !== 2
    );

  const b1 =
    document.getElementById(
      "opt1Btn"
    );

  const b2 =
    document.getElementById(
      "opt2Btn"
    );

  if (b1) {

    b1.className =
      t === 1
        ? "bg-[#14532d] text-white px-5 py-2.5 rounded-xl text-[11px] font-bold shadow"
        : "bg-gray-200 px-5 py-2.5 rounded-xl text-[11px] font-bold";
  }

  if (b2) {

    b2.className =
      t === 2
        ? "bg-[#14532d] text-white px-5 py-2.5 rounded-xl text-[11px] font-bold shadow"
        : "bg-gray-200 px-5 py-2.5 rounded-xl text-[11px] font-bold";
  }
}


/* ============================================================
   IMAGE COMPRESSION
   ============================================================ */

function compressImage(
  file,
  maxW,
  q,
  cb
) {

  const r =
    new FileReader();

  r.onload =
    e => {

      const i =
        new Image();

      i.onload =
        () => {

          const c =
            document.createElement(
              "canvas"
            );

          let w =
            i.width;

          let h =
            i.height;

          if (w > maxW) {

            h =
              h *
              (maxW / w);

            w =
              maxW;
          }

          c.width =
            w;

          c.height =
            h;

          const ctx =
            c.getContext(
              "2d"
            );

          ctx.drawImage(
            i,
            0,
            0,
            w,
            h
          );

          cb(
            c.toDataURL(
              "image/jpeg",
              q
            )
          );
        };

      i.src =
        e.target.result;
    };

  r.readAsDataURL(file);
}


/* ============================================================
   LOGO / BANNER
   ============================================================ */

async function handleLogoBanner(
  e,
  type
) {

  const f =
    e.target.files[0];

  if (!f) return;

  compressImage(
    f,
    type === "logo"
      ? 300
      : 800,
    0.5,
    async c => {

      if (type === "logo") {

        currentLogoBase64 =
          c;

        const img =
          document.getElementById(
            "logoPreview"
          );

        if (img) {

          img.src = c;
          img.classList.remove(
            "hidden"
          );
        }

        const info =
          document.getElementById(
            "logoSizeInfo"
          );

        if (info) {

          info.innerText =
            `✅ Logo: ${(c.length / 1024).toFixed(1)}KB`;
        }

        localStorage.setItem(
          "temp_logo",
          c
        );

      } else {

        currentBannerBase64 =
          c;

        const img =
          document.getElementById(
            "bannerPreview"
          );

        if (img) {

          img.src = c;
          img.classList.remove(
            "hidden"
          );
        }

        const info =
          document.getElementById(
            "bannerSizeInfo"
          );

        if (info) {

          info.innerText =
            `✅ Banner: ${(c.length / 1024).toFixed(1)}KB`;
        }

        localStorage.setItem(
          "temp_banner",
          c
        );
      }
    }
  );
}


/* ============================================================
   CERTIFICATE IMAGE
   ============================================================ */

function handleCertFull(e) {

  const f =
    e.target.files[0];

  if (!f) return;

  compressImage(
    f,
    800,
    0.5,
    c => {

      currentCertBase64 =
        c;

      const img =
        document.getElementById(
          "certPreviewImg"
        );

      if (img) {

        img.src = c;

        img.classList.remove(
          "hidden"
        );
      }

      document
        .getElementById(
          "certPreviewPlaceholder"
        )
        ?.classList.add(
          "hidden"
        );

      const info =
        document.getElementById(
          "certSizeInfo"
        );

      if (info) {

        info.innerText =
          `✅ Certificate: ${(c.length / 1024).toFixed(1)}KB`;
      }

      localStorage.setItem(
        "certFullImage",
        c
      );
    }
  );
}


function handleCertFile(
  e,
  type
) {

  const f =
    e.target.files[0];

  if (!f) return;

  compressImage(
    f,
    800,
    0.5,
    c => {

      const img =
        document.getElementById(
          "certPreviewImg"
        );

      if (img) {

        img.src = c;
        img.classList.remove(
          "hidden"
        );
      }

      document
        .getElementById(
          "certPreviewPlaceholder"
        )
        ?.classList.add(
          "hidden"
        );

      localStorage.setItem(
        "cert_" + type,
        c
      );

      updateCertLive();
    }
  );
}


/* ============================================================
   CERTIFICATE POSITION
   ============================================================ */

function updateCertLive() {

  const xEl =
    document.getElementById(
      "certX"
    );

  const yEl =
    document.getElementById(
      "certY"
    );

  const sEl =
    document.getElementById(
      "certS"
    );

  if (!xEl || !yEl || !sEl) {
    return;
  }

  const x =
    xEl.value;

  const y =
    yEl.value;

  const s =
    sEl.value;

  const xv =
    document.getElementById(
      "xVal"
    );

  const yv =
    document.getElementById(
      "yVal"
    );

  const sv =
    document.getElementById(
      "sVal"
    );

  if (xv) xv.innerText = x;
  if (yv) yv.innerText = y;
  if (sv) sv.innerText = s;

  const d =
    document.getElementById(
      "certNameOnImage"
    );

  if (d) {

    d.style.left =
      x + "%";

    d.style.top =
      y + "%";

    d.style.fontSize =
      s + "px";

    d.style.transform =
      "translate(-50%,-50%)";
  }

  certPos = {
    x,
    y,
    s
  };

  localStorage.setItem(
    "certPos_v13",
    JSON.stringify(
      certPos
    )
  );
}


/* ============================================================
   QUESTION NORMALIZATION
   ============================================================ */

/*
   Main quiz uses:

   {
      q: "...",
      opts: [...],
      ans: 0
   }

   V4 manager may use:

   {
      q: "...",
      options: [...],
      correct: "A"
   }

   This function converts both formats to the main format.
*/

function normalizeQuestion(q) {

  if (!q) return null;

  const text =
    q.q ||
    q.question ||
    "";

  let opts =
    q.opts ||
    q.options ||
    [
      q.a,
      q.b,
      q.c,
      q.d
    ];

  opts =
    Array.isArray(opts)
      ? opts.map(x =>
          String(x ?? "").trim()
        )
      : [];

  let ans = 0;

  if (
    typeof q.ans === "number"
  ) {

    ans =
      q.ans;

  } else if (
    typeof q.correct === "number"
  ) {

    ans =
      q.correct;

  } else {

    const correct =
      String(
        q.correct ||
        q.answer ||
        "A"
      )
        .trim()
        .toUpperCase();

    if (
      ["A", "B", "C", "D"]
        .includes(correct)
    ) {

      ans =
        correct.charCodeAt(0) -
        65;
    } else {

      const n =
        parseInt(correct);

      if (!isNaN(n)) {

        ans =
          n;
      }
    }
  }

  if (!text || opts.length < 2) {
    return null;
  }

  ans =
    Math.max(
      0,
      Math.min(
        ans,
        opts.length - 1
      )
    );

  return {
    id:
      q.id ||
      "q_" + Date.now() + "_" +
      Math.random()
        .toString(36)
        .slice(2),

    q: text,

    opts,

    ans
  };
}


function normalizeQuestions(
  arr
) {

  if (!Array.isArray(arr)) {
    return [];
  }

  return arr
    .map(normalizeQuestion)
    .filter(Boolean);
}


/* ============================================================
   QUESTION RENDER
   ============================================================ */

function renderQuestions() {

  const l =
    document.getElementById(
      "qList"
    );

  const t =
    document.getElementById(
      "totalQCount"
    );

  const s =
    document.getElementById(
      "showQCount"
    );

  if (!l) return;

  questions =
    normalizeQuestions(
      questions
    );

  if (t) {
    t.innerText =
      questions.length;
  }

  if (s) {

    s.innerText =
      Math.min(
        eventQuestionCount ||
        questions.length,
        questions.length
      );
  }

  if (!questions.length) {

    l.innerHTML =
      '<p class="text-center py-6 text-gray-500">No Questions - Bulk Add ചെയ്യൂ!</p>';

    const quota =
      document.getElementById(
        "quota"
      );

    if (quota) {
      quota.innerText =
        "Quota: 0";
    }

    return;
  }

  l.innerHTML =
    "";

  const d =
    Math.min(
      eventQuestionCount ||
      questions.length,
      questions.length
    );

  questions
    .slice(0, d)
    .forEach(
      (q, i) => {

        l.innerHTML += `
          <div class="bg-white border-2 rounded-xl p-3 mb-2 flex justify-between gap-2 shadow-sm">

            <div class="flex-1">

              <p class="font-bold text-[13px]">
                ${i + 1}. ${escapeHtml(q.q)}
                ${randomMode ? " 🔀 Random" : ""}
              </p>

              <p class="text-[11px] text-gray-600 mt-1">
                ${q.opts.map(
                  (o, idx) =>
                    idx === q.ans
                      ? `✅ ${escapeHtml(o)}`
                      : escapeHtml(o)
                ).join(" | ")}
              </p>

            </div>

            <button
              onclick="deleteQuestion(${i})"
              class="bg-red-100 text-red-600 border-2 px-4 py-1 rounded-full text-[11px] font-black">
              🗑️ Delete
            </button>

          </div>
        `;
      }
    );

  const quota =
    document.getElementById(
      "quota"
    );

  if (quota) {

    quota.innerText =
      "Total: " +
      questions.length +
      " | Show: " +
      d +
      " | Random:" +
      (
        randomMode
          ? "ON"
          : "OFF"
      );
  }

  localStorage.setItem(
    "questions_v13",
    JSON.stringify(
      questions
    )
  );
}


/* ============================================================
   BULK ADD
   ============================================================ */

function bulkAdd() {

  const box =
    document.getElementById(
      "qBulk"
    );

  if (!box) return;

  const txt =
    box.value.trim();

  if (!txt) {

    alert(
      "Type Questions!"
    );

    return;
  }

  let a = 0;

  txt
    .split("\n")
    .forEach(line => {

      if (!line.trim()) return;

      const p =
        line.split("|");

      if (p.length < 2) return;

      const q =
        p[0].trim();

      const o =
        p[1]
          .split(",")
          .map(
            x => x.trim()
          )
          .filter(Boolean);

      let ans = 0;

      if (p[2]) {

        ans =
          parseInt(
            p[2].trim()
          );

        if (isNaN(ans)) {
          ans = 0;
        }
      }

      if (
        q &&
        o.length >= 2
      ) {

        questions.push({

          q,

          opts: o,

          ans:
            Math.min(
              ans,
              o.length - 1
            )
        });

        a++;
      }
    });

  questions =
    normalizeQuestions(
      questions
    );

  localStorage.setItem(
    "questions_v13",
    JSON.stringify(
      questions
    )
  );

  box.value =
    "";

  renderQuestions();

  alert(
    "✅ " + a + " Added!"
  );
}


function deleteQuestion(i) {

  if (
    !confirm(
      "Delete Q " +
      (i + 1) +
      "?"
    )
  ) {
    return;
  }

  questions.splice(
    i,
    1
  );

  localStorage.setItem(
    "questions_v13",
    JSON.stringify(
      questions
    )
  );

  renderQuestions();
}


/* ============================================================
   PAST EVENTS
   ============================================================ */

async function loadPastEvents() {

  const c =
    document.getElementById(
      "pastEventsList"
    );

  const role =
    getUserRole();

  const ownerId =
    getOrganizerId();

  if (!c) return;

  c.innerHTML =
    '<p class="text-xs text-center py-6">☁️ Loading TRUE CLOUD...</p>';

  try {

    const res =
      await fetch(
        `${REST_URL}/events.json`
      );

    if (res.ok) {

      const data =
        await res.json();

      if (
        data &&
        Object.keys(data).length > 0
      ) {

        c.innerHTML =
          "";

        Object.keys(data)
          .reverse()
          .filter(
            id =>
              role === "master" ||
              (
                data[id] &&
                data[id].ownerId ===
                ownerId
              )
          )
          .forEach(
            id => {

              const ev =
                data[id];

              c.innerHTML += `
                <div class="bg-white border-[3px] rounded-xl p-4 mb-3 shadow-md">

                  <div class="flex justify-between gap-3">

                    <div class="flex-1">

                      <p class="font-black text-[14px] text-green-800">
                        ${escapeHtml(ev.title || "Noor Event")}

                        <span class="bg-green-100 px-2 py-1 rounded-full text-[10px]">
                          ${ev.minute || 10} Min
                        </span>

                        <span class="bg-blue-100 px-2 py-1 rounded-full text-[10px]">
                          Count:${ev.count || 20}
                        </span>

                        <span class="bg-orange-100 px-2 py-1 rounded-full text-[10px]">
                          Random:${ev.randomMode ? "ON" : "OFF"}
                        </span>
                      </p>

                      <p class="text-[12px] font-black text-gray-800 mt-2">
                        📍 ${escapeHtml(ev.place || "No Place")}
                        |
                        ${escapeHtml(ev.category || "")}
                        |
                        Qs:${ev.questions?.length || 0}
                      </p>

                      <p class="text-[11px] text-gray-600 mt-1">
                        Logo:${ev.logo ? "✅" : "❌"}
                        Banner:${ev.banner ? "✅" : "❌"}
                        Cert:${ev.certificate ? "✅" : "❌"}
                        | ID:${escapeHtml(id)}
                      </p>

                    </div>

                    <div class="flex flex-col gap-2">

                      <button
                        onclick="copyEventLink('${escapeHtml(id)}')"
                        class="bg-green-600 text-white px-5 py-2.5 rounded-full text-[11px] font-black shadow">
                        📋 Copy Link
                      </button>

                      <button
                        onclick="editEventById('${escapeHtml(id)}')"
                        class="bg-blue-700 text-white px-5 py-2.5 rounded-full text-[11px] font-black shadow">
                        ✏️ Edit
                      </button>

                      <button
                        onclick="deleteEvent('${escapeHtml(id)}')"
                        class="bg-red-100 text-red-600 border-2 px-5 py-2.5 rounded-full text-[11px] font-black">
                        🗑️ Delete
                      </button>

                    </div>

                  </div>

                </div>
              `;
            }
          );

        const storage =
          document.getElementById(
            "storageInfo"
          );

        if (storage) {

          storage.innerText =
            "✅ REST API SUCCESS - " +
            Object.keys(data).length +
            " Events Loaded";
        }

        localStorage.setItem(
          "pastEvents_backup",
          JSON.stringify(
            data
          )
        );

        return;
      }

      c.innerHTML =
        '<p class="text-xs text-center py-6 text-green-600 font-black">✅ REST Connected! No Events Yet!</p>';

      return;
    }

  } catch (e) {

    console.warn(
      "REST events load failed:",
      e
    );
  }


  /* Firebase fallback */

  try {

    if (firebaseDB) {

      const snap =
        await firebaseDB
          .ref("events")
          .once("value");

      const data =
        snap.val();

      if (data) {

        c.innerHTML =
          "";

        Object.keys(data)
          .reverse()
          .filter(
            id =>
              role === "master" ||
              (
                data[id] &&
                data[id].ownerId ===
                ownerId
              )
          )
          .forEach(
            id => {

              const ev =
                data[id];

              c.innerHTML += `
                <div class="bg-white border-2 rounded-xl p-3 mb-2">

                  <div class="flex justify-between">

                    <div class="flex-1">

                      <p class="font-black text-xs">
                        ${escapeHtml(ev.title || "Event")}
                        -
                        ${escapeHtml(ev.place || "")}
                      </p>

                      <p class="text-[10px]">
                        ID:${escapeHtml(id)}
                        |
                        Logo:${ev.logo ? "✅" : "❌"}
                        |
                        Banner:${ev.banner ? "✅" : "❌"}
                      </p>

                    </div>

                    <div class="flex flex-col gap-1">

                      <button
                        onclick="copyEventLink('${escapeHtml(id)}')"
                        class="bg-green-600 text-white px-4 py-1.5 rounded-full text-[11px] font-black">
                        📋 Copy
                      </button>

                      <button
                        onclick="editEventById('${escapeHtml(id)}')"
                        class="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[11px] font-black">
                        ✏️ Edit
                      </button>

                    </div>

                  </div>

                </div>
              `;
            }
          );

        localStorage.setItem(
          "pastEvents_backup",
          JSON.stringify(
            data
          )
        );

        return;
      }
    }

  } catch (e) {

    console.warn(
      "Firebase events fallback failed:",
      e
    );
  }


  /* Local backup */

  try {

    const localData =
      JSON.parse(
        localStorage.getItem(
          "pastEvents_backup"
        ) || "{}"
      );

    if (
      localData &&
      Object.keys(localData).length > 0
    ) {

      c.innerHTML =
        '<p class="text-[11px] text-center py-2 bg-yellow-100 rounded-full border">⚠️ Showing Local Backup</p>';

      Object.keys(localData)
        .reverse()
        .filter(
          id =>
            role === "master" ||
            (
              localData[id] &&
              localData[id].ownerId ===
              ownerId
            )
        )
        .forEach(
          id => {

            const ev =
              localData[id];

            c.innerHTML += `
              <div class="bg-yellow-50 border-2 rounded-xl p-3 mb-2">

                <div class="flex justify-between">

                  <div class="flex-1">

                    <p class="font-black text-xs">
                      ${escapeHtml(ev.title || "Event")}
                      - Local Backup
                    </p>

                    <p class="text-[10px]">
                      ${escapeHtml(ev.place || "")}
                      |
                      ID:${escapeHtml(id)}
                    </p>

                  </div>

                  <div class="flex flex-col gap-1">

                    <button
                      onclick="copyEventLink('${escapeHtml(id)}')"
                      class="bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-bold">
                      📋 Copy
                    </button>

                    <button
                      onclick="editEventById('${escapeHtml(id)}')"
                      class="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold">
                      ✏️ Edit
                    </button>

                  </div>

                </div>

              </div>
            `;
          }
        );

      return;
    }

  } catch {}

  c.innerHTML =
    `<p class="text-xs text-center py-6 text-red-600 font-bold">❌ Connection Failed!</p>`;
}


/* ============================================================
   EVENT DELETE
   ============================================================ */

function clearAllEvents() {

  if (
    !confirm(
      "Delete ALL?"
    )
  ) return;

  fetch(
    `${REST_URL}/events.json`,
    {
      method: "DELETE"
    }
  )
    .then(
      () => {

        localStorage.removeItem(
          "pastEvents_backup"
        );

        loadPastEvents();
      }
    )
    .catch(
      () => {

        if (firebaseDB) {

          firebaseDB
            .ref("events")
            .remove()
            .then(
              () => {

                localStorage.removeItem(
                  "pastEvents_backup"
                );

                loadPastEvents();
              }
            );
        }
      }
    );
}


/* ============================================================
   EVENT LINK
   ============================================================ */

function copyEventLink(id) {

  const l =
    window.location.origin +
    window.location.pathname +
    "?event=" +
    encodeURIComponent(id);

  if (
    navigator.clipboard
  ) {

    navigator.clipboard
      .writeText(l)
      .then(
        () =>
          alert(
            "✅ Link Copied:\n\n" +
            l
          )
      )
      .catch(
        () =>
          prompt(
            "Copy this link:",
            l
          )
      );

  } else {

    prompt(
      "Copy this link:",
      l
    );
  }
}


/* ============================================================
   DELETE EVENT
   ============================================================ */

async function deleteEvent(id) {

  if (
    getUserRole() !== "master" &&
    getUserRole() !== "organizer"
  ) {
    return;
  }

  if (
    getUserRole() ===
    "organizer"
  ) {

    try {

      const r =
        await fetch(
          `${REST_URL}/events/${id}.json`
        );

      const ev =
        await r.json();

      if (
        !ev ||
        ev.ownerId !==
        getOrganizerId()
      ) {

        alert(
          "You can only delete your own events."
        );

        return;
      }

    } catch {

      return;
    }
  }

  if (
    !confirm(
      "Delete " + id + "?"
    )
  ) {
    return;
  }

  try {

    const r =
      await fetch(
        `${REST_URL}/events/${id}.json`,
        {
          method: "DELETE"
        }
      );

    if (!r.ok) {
      throw new Error(
        "REST delete failed"
      );
    }

    loadPastEvents();

  } catch {

    if (firebaseDB) {

      firebaseDB
        .ref(
          "events/" + id
        )
        .remove()
        .then(
          () =>
            loadPastEvents()
        );
    }
  }
}


/* ============================================================
   EDIT EVENT
   ============================================================ */

async function editEventById(id) {

  try {

    let data =
      null;

    try {

      const res =
        await fetch(
          `${REST_URL}/events/${id}.json`
        );

      if (res.ok) {

        data =
          await res.json();
      }

    } catch {}


    if (
      !data &&
      firebaseDB
    ) {

      try {

        const snap =
          await firebaseDB
            .ref(
              "events/" + id
            )
            .once("value");

        data =
          snap.val();

      } catch {}
    }


    if (!data) {

      try {

        const local =
          JSON.parse(
            localStorage.getItem(
              "pastEvents_backup"
            ) || "{}"
          );

        data =
          local[id];

      } catch {}
    }


    if (!data) {

      alert(
        "Event Not Found! ID:" +
        id
      );

      return;
    }


    if (
      getUserRole() ===
      "organizer" &&
      data.ownerId !==
      getOrganizerId()
    ) {

      alert(
        "This event belongs to another organizer."
      );

      return;
    }


    currentEventId =
      "event_" + id;


    const setVal =
      (elementId, value) => {

        const el =
          document.getElementById(
            elementId
          );

        if (el) {
          el.value =
            value ?? "";
        }
      };


    setVal(
      "eventName",
      data.title || ""
    );

    setVal(
      "eventPlace",
      data.place || ""
    );

    setVal(
      "eventCategory",
      data.category ||
      "Madrasa"
    );

    setVal(
      "setMinute",
      data.minute ||
      10
    );

    setVal(
      "setCount",
      data.count ||
      20
    );


    eventQuestionCount =
      data.count ||
      20;

    randomMode =
      data.randomMode !== false;

    showCorrectWrong =
      data.showCorrect !== false;


    const randomEl =
      document.getElementById(
        "setRandom"
      );

    const showEl =
      document.getElementById(
        "setShowCorrect"
      );

    const onlineEl =
      document.getElementById(
        "setOnline"
      );

    const phoneEl =
      document.getElementById(
        "setPhoneLock"
      );

    const deviceEl =
      document.getElementById(
        "setDeviceLock"
      );


    if (randomEl)
      randomEl.checked =
        randomMode;

    if (showEl)
      showEl.checked =
        showCorrectWrong;

    if (onlineEl)
      onlineEl.checked =
        data.onlineMode !== false;

    if (phoneEl)
      phoneEl.checked =
        data.phoneLock !== false;

    if (deviceEl)
      deviceEl.checked =
        data.deviceLock !== false;


    questions =
      normalizeQuestions(
        data.questions ||
        []
      );

    localStorage.setItem(
      "questions_v13",
      JSON.stringify(
        questions
      )
    );

    renderQuestions();


    if (data.logo) {

      currentLogoBase64 =
        data.logo;

      const img =
        document.getElementById(
          "logoPreview"
        );

      if (img) {

        img.src =
          data.logo;

        img.classList.remove(
          "hidden"
        );
      }
    }


    if (data.banner) {

      currentBannerBase64 =
        data.banner;

      const img =
        document.getElementById(
          "bannerPreview"
        );

      if (img) {

        img.src =
          data.banner;

        img.classList.remove(
          "hidden"
        );
      }
    }


    if (data.certificate) {

      currentCertBase64 =
        data.certificate;

      const img =
        document.getElementById(
          "certPreviewImg"
        );

      if (img) {

        img.src =
          data.certificate;

        img.classList.remove(
          "hidden"
        );
      }

      document
        .getElementById(
          "certPreviewPlaceholder"
        )
        ?.classList.add(
          "hidden"
        );
    }


    if (data.certPos) {

      certPos =
        data.certPos;

      setVal(
        "certX",
        data.certPos.x
      );

      setVal(
        "certY",
        data.certPos.y
      );

      setVal(
        "certS",
        data.certPos.s
      );

      updateCertLive();
    }


    setVal(
      "certTitle",
      data.certTitle ||
      "Certificate of Appreciation"
    );

    setVal(
      "certSub",
      data.certSub ||
      "Noor Al Madrasa - Meelad Quiz 2K26"
    );

    setVal(
      "certSub2",
      data.certSub2 ||
      "For Excellent Participation"
    );


    setVal(
      "eventIdShow",
      id
    );


    lastGeneratedLink =
      window.location.origin +
      window.location.pathname +
      "?event=" +
      encodeURIComponent(id);


    const gl =
      document.getElementById(
        "generatedLink"
      );

    if (gl) {
      gl.innerText =
        lastGeneratedLink;
    }


    const linkBox =
      document.getElementById(
        "linkBox"
      );

    if (linkBox) {
      linkBox.style.display =
        "block";
    }


    localStorage.setItem(
      "lastGeneratedLink_v14",
      lastGeneratedLink
    );

    localStorage.setItem(
      "currentEventId_v17",
      currentEventId
    );


    const cloud =
      document.getElementById(
        "cloudStatus"
      );

    if (cloud) {

      cloud.innerText =
        `✅ Edit Loaded! Event:${data.title || ""}`;
    }


    window.scrollTo({
      top: 100,
      behavior: "smooth"
    });


    alert(
      `✅ Edit Loaded:\n\nEvent: ${
        data.title || ""
      }\nPlace: ${
        data.place || ""
      }`
    );

  } catch (e) {

    console.error(e);

    alert(
      "Edit Failed: " +
      e.message
    );
  }
}


/* ============================================================
   CREATE / SAVE LINK
   ============================================================ */

function editCurrentEvent() {

  if (
    !currentEventId ||
    currentEventId === "event_"
  ) {

    alert(
      "Past Events-ൽ Edit Button അടിക്കൂ"
    );

    return;
  }

  editEventById(
    currentEventId.replace(
      /event_/g,
      ""
    )
  );
}


function createNewLink() {

  currentEventId =
    "event_" +
    Date.now();

  createOrUpdateLink(
    true
  );
}


function saveCloudSameLink() {

  let eid =
    document.getElementById(
      "eventIdShow"
    )?.value.trim() ||
    currentEventId ||
    "";

  if (eid) {

    eid =
      eid.replace(
        /event_/g,
        ""
      );

    currentEventId =
      "event_" +
      eid;
  }

  if (
    !currentEventId ||
    currentEventId === "event_"
  ) {

    currentEventId =
      "event_" +
      Date.now();
  }

  createOrUpdateLink(
    false
  );
}


/* ============================================================
   CREATE / UPDATE EVENT
   ============================================================ */

async function createOrUpdateLink(
  isNew
) {

  let minute =
    parseInt(
      document.getElementById(
        "setMinute"
      )?.value
    ) || 10;


  if (
    document.getElementById(
      "setMinute"
    )?.value === "custom"
  ) {

    const c =
      document.getElementById(
        "setMinuteCustom"
      )?.value;

    if (c) {

      minute =
        parseInt(c) ||
        10;
    }
  }


  const title =
    document.getElementById(
      "eventName"
    )?.value.trim() ||
    "Noor Quiz";


  const place =
    document.getElementById(
      "eventPlace"
    )?.value.trim() ||
    "";


  let category =
    document.getElementById(
      "eventCategory"
    )?.value ||
    "Madrasa";


  if (
    category === "Other"
  ) {

    const cc =
      document.getElementById(
        "customCategory"
      )?.value.trim();

    if (cc) {
      category =
        cc;
    }
  }


  const count =
    parseInt(
      document.getElementById(
        "setCount"
      )?.value
    ) || 20;


  eventQuestionCount =
    count;


  const random =
    document.getElementById(
      "setRandom"
    )?.checked ??
    true;


  const showC =
    document.getElementById(
      "setShowCorrect"
    )?.checked ??
    true;


  randomMode =
    random;

  showCorrectWrong =
    showC;


  questions =
    normalizeQuestions(
      questions
    );


  if (!questions.length) {

    alert(
      "⚠️ Questions Add ചെയ്യൂ!"
    );

    return;
  }


  const cleanId =
    currentEventId.replace(
      /event_/g,
      ""
    );


  const link =
    window.location.origin +
    window.location.pathname +
    "?event=" +
    encodeURIComponent(
      cleanId
    );


  lastGeneratedLink =
    link;


  localStorage.setItem(
    "lastGeneratedLink_v14",
    link
  );

  localStorage.setItem(
    "currentEventId_v17",
    currentEventId
  );


  const gl =
    document.getElementById(
      "generatedLink"
    );

  if (gl) {
    gl.innerText =
      link;
  }


  const linkBox =
    document.getElementById(
      "linkBox"
    );

  if (linkBox) {
    linkBox.style.display =
      "block";
  }


  const cloud =
    document.getElementById(
      "cloudStatus"
    );

  if (cloud) {

    cloud.innerText =
      "☁️ Saving via REST + Firebase + Local...";
  }


  const createBtn =
    document.getElementById(
      "createLinkBtn"
    );

  if (createBtn) {

    createBtn.innerText =
      "⏳ Saving...";
  }


  setTimeout(
    () => {

      linkBox?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    },
    300
  );


  if (!currentLogoBase64) {

    currentLogoBase64 =
      localStorage.getItem(
        "temp_logo"
      ) || "";
  }


  if (!currentBannerBase64) {

    currentBannerBase64 =
      localStorage.getItem(
        "temp_banner"
      ) || "";
  }


  const certTitle =
    document.getElementById(
      "certTitle"
    )?.value ||
    "Certificate of Appreciation";


  const certSub =
    document.getElementById(
      "certSub"
    )?.value ||
    "Noor Al Madrasa - Meelad Quiz 2K26";


  const certSub2 =
    document.getElementById(
      "certSub2"
    )?.value ||
    "For Excellent Participation";


  const role =
    getUserRole();


  const ownerId =
    role === "master"
      ? (
          document.getElementById(
            "masterEventOwner"
          )?.value || ""
        )
      : (
          role === "organizer"
            ? getOrganizerId()
            : ""
        );


  const eventData = {

    title,

    place,

    category,

    questions,

    minute,

    count,

    onlineMode:
      document.getElementById(
        "setOnline"
      )?.checked !== false,

    showCorrect:
      showC,

    randomMode:
      random,

    phoneLock:
      document.getElementById(
        "setPhoneLock"
      )?.checked !== false,

    deviceLock:
      document.getElementById(
        "setDeviceLock"
      )?.checked !== false,

    logo:
      currentLogoBase64 || "",

    banner:
      currentBannerBase64 || "",

    certificate:
      currentCertBase64 || "",

    certPos,

    certTitle,

    certSub,

    certSub2,

    ownerId,

    updated:
      Date.now()
  };


  let saved =
    false;


  /* REST */

  try {

    const res =
      await fetch(
        `${REST_URL}/events/${cleanId}.json`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(
              eventData
            )
        }
      );

    if (res.ok) {
      saved = true;
    }

  } catch (e) {

    console.warn(
      "REST save failed:",
      e
    );
  }


  /* Firebase */

  try {

    if (firebaseDB) {

      await firebaseDB
        .ref(
          "events/" +
          cleanId
        )
        .set(
          eventData
        );

      saved = true;
    }

  } catch (e) {

    console.warn(
      "Firebase save failed:",
      e
    );
  }


  /* Local */

  try {

    const backup =
      JSON.parse(
        localStorage.getItem(
          "pastEvents_backup"
        ) || "{}"
      );

    backup[cleanId] =
      eventData;

    localStorage.setItem(
      "pastEvents_backup",
      JSON.stringify(
        backup
      )
    );

    localStorage.setItem(
      "last_event_" +
      cleanId,
      JSON.stringify(
        eventData
      )
    );

    saved = true;

  } catch {}


  if (saved) {

    if (cloud) {

      cloud.innerText =
        isNew
          ? `✅ SUCCESS! Event:${title} ID:${cleanId}`
          : `✅ SAME LINK UPDATED! Event:${title}`;
    }


    if (createBtn) {

      createBtn.innerText =
        "💚 CREATE NEW LINK";
    }


    const saveBtn =
      document.getElementById(
        "saveCloudBtn"
      );

    if (saveBtn) {

      saveBtn.innerText =
        "💾 SAVE CLOUD SAME LINK";
    }


    if (
      navigator.clipboard
    ) {

      navigator.clipboard
        .writeText(link)
        .catch(
          () => {}
        );
    }


    loadPastEvents();

    renderQuestions();

  } else {

    if (cloud) {

      cloud.innerText =
        "❌ Failed to save to cloud!";
    }

    if (createBtn) {

      createBtn.innerText =
        "CREATE LINK";
    }
  }
}


/* ============================================================
   COPY / WHATSAPP
   ============================================================ */

function copyLink() {

  if (!lastGeneratedLink) {

    const l =
      localStorage.getItem(
        "lastGeneratedLink_v14"
      );

    if (l) {

      lastGeneratedLink =
        l;

    } else {

      alert(
        "Create Link First!"
      );

      return;
    }
  }


  if (
    navigator.clipboard
  ) {

    navigator.clipboard
      .writeText(
        lastGeneratedLink
      )
      .then(
        () =>
          alert(
            "✅ Link Copied:\n\n" +
            lastGeneratedLink
          )
      );

  } else {

    prompt(
      "Copy this link:",
      lastGeneratedLink
    );
  }
}


function shareWhatsApp() {

  if (!lastGeneratedLink) {

    const l =
      localStorage.getItem(
        "lastGeneratedLink_v14"
      );

    if (l) {

      lastGeneratedLink =
        l;

    } else {

      return;
    }
  }


  window.open(
    "https://wa.me/?text=" +
    encodeURIComponent(
      "🌙 Noor Quiz:\n\n" +
      lastGeneratedLink
    ),
    "_blank"
  );
}


/* ============================================================
   COMPETITOR EVENT
   ============================================================ */

async function loadCompetitorEvent() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const eventId =
    params.get("event");


  if (!eventId) {

    const status =
      document.getElementById(
        "cloudLoadStatus"
      );

    if (status) {

      status.innerText =
        "ℹ️ No Event ID - Default View";
    }


    document
      .getElementById(
        "compEventNameBelow"
      )
      ?.replaceChildren(
        document.createTextNode(
          "Noor Al Madrasa"
        )
      );


    const place =
      document.getElementById(
        "compPlaceShow"
      );

    if (place) {

      place.innerText =
        "Meelad Quiz 2K26";
    }


    const details =
      document.getElementById(
        "compDetailsBelow"
      );

    if (details) {

      details.innerText =
        "Create Link in Admin";
    }

    return;
  }


  const status =
    document.getElementById(
      "cloudLoadStatus"
    );

  if (status) {

    status.innerText =
      "☁️ Loading Event: " +
      eventId;
  }


  let data =
    null;


  /* REST */

  try {

    const res =
      await fetch(
        `${REST_URL}/events/${eventId}.json`
      );

    if (res.ok) {

      data =
        await res.json();
    }

  } catch {}


  /* Firebase */

  if (
    !data &&
    firebaseDB
  ) {

    try {

      const snap =
        await firebaseDB
          .ref(
            "events/" +
            eventId
          )
          .once("value");

      data =
        snap.val();

    } catch {}
  }


  /* Backup */

  if (!data) {

    try {

      const backup =
        JSON.parse(
          localStorage.getItem(
            "pastEvents_backup"
          ) || "{}"
        );

      data =
        backup[eventId];

    } catch {}
  }


  if (!data) {

    try {

      data =
        JSON.parse(
          localStorage.getItem(
            "last_event_" +
            eventId
          ) || "null"
        );

    } catch {}
  }


  if (!data) {

    if (status) {

      status.innerText =
        "❌ Event Not Found! ID:" +
        eventId;
    }

    return;
  }


  currentEventId =
    "event_" +
    eventId;


  questions =
    normalizeQuestions(
      data.questions ||
      []
    );


  totalMinutes =
    data.minute ||
    10;


  eventQuestionCount =
    data.count ||
    20;


  showCorrectWrong =
    data.showCorrect !== false;


  randomMode =
    data.randomMode !== false;


  eventPhoneLock =
    data.phoneLock !== false;


  eventDeviceLock =
    data.deviceLock !== false;


  currentCertBase64 =
    data.certificate ||
    "";


  certPos =
    data.certPos ||
    {
      x: "50",
      y: "60",
      s: "24"
    };


  const setText =
    (id, value) => {

      const el =
        document.getElementById(
          id
        );

      if (el) {

        el.innerText =
          value ?? "";
      }
    };


  setText(
    "compTitle",
    data.title ||
    "🌙 Noor Al Madrasa"
  );


  setText(
    "compEventNameBelow",
    data.title ||
    "Noor Al Madrasa"
  );


  setText(
    "compPlaceShow",
    data.place ||
    ""
  );


  setText(
    "compDetailsBelow",
    `${data.category || "Madrasa"} | ${totalMinutes} Min | ${Math.min(
      eventQuestionCount,
      questions.length
    )} Qs`
  );


  setText(
    "eventNameDisplay",
    data.title ||
    ""
  );


  setText(
    "eventCountDisplay",
    `📝 Total:${questions.length} Show:${Math.min(
      eventQuestionCount,
      questions.length
    )} Time:${totalMinutes}Min`
  );


  setText(
    "eventRandomDisplay",
    `${randomMode ? "🔀 Random ON" : "📝 Same"} | ${
      showCorrectWrong
        ? "✅ Show Correct Green"
        : ""
    }`
  );


  setText(
    "compSubTitle",
    data.category ||
    "Meelad Quiz 2K26"
  );


  if (status) {

    status.innerText =
      `✅ Loaded! ${
        data.title || "Noor Quiz"
      }`;
  }


  if (data.logo) {

    const img =
      document.getElementById(
        "compLogoImg"
      );

    if (img) {

      img.src =
        data.logo;

      img.classList.remove(
        "hidden"
      );
    }

    document
      .getElementById(
        "compLogoText"
      )
      ?.classList.add(
        "hidden"
      );
  }


  if (data.banner) {

    const img =
      document.getElementById(
        "compBannerImg"
      );

    if (img) {

      img.src =
        data.banner;

      img.classList.remove(
        "hidden"
      );
    }

    document
      .getElementById(
        "compBannerDefault"
      )
      ?.classList.add(
        "hidden"
      );
  }


  if (data.certificate) {

    localStorage.setItem(
      "certFullImage",
      data.certificate
    );
  }


  if (data.certPos) {

    localStorage.setItem(
      "certPos_v13",
      JSON.stringify(
        data.certPos
      )
    );
  }


  localStorage.setItem(
    "questions_v13",
    JSON.stringify(
      questions
    )
  );
}


/* ============================================================
   START QUIZ
   ============================================================ */

function startQuiz() {

  const name =
    document.getElementById(
      "nameInput"
    )?.value.trim() ||
    "";

  const phone =
    document.getElementById(
      "phoneInput"
    )?.value.trim() ||
    "";

  const err =
    document.getElementById(
      "errorMsg"
    );


  if (!name || !phone) {

    if (err) {

      err.innerText =
        "Name & Phone Required";

      err.classList.remove(
        "hidden"
      );
    }

    return;
  }


  const phoneLock =
    document.getElementById(
      "setPhoneLock"
    )?.checked ??
    eventPhoneLock;


  const eid =
    new URLSearchParams(
      window.location.search
    ).get("event") ||
    currentEventId;


  if (phoneLock) {

    const used =
      JSON.parse(
        localStorage.getItem(
          "usedPhones"
        ) || "[]"
      );

    if (
      used.includes(
        phone + "_" + eid
      )
    ) {

      if (err) {

        err.innerText =
          "❌ ഈ ഫോൺ ഉപയോഗിച്ചു!";

        err.classList.remove(
          "hidden"
        );
      }

      return;
    }
  }


  const deviceLock =
    document.getElementById(
      "setDeviceLock"
    )?.checked ??
    eventDeviceLock;


  if (deviceLock) {

    const used =
      JSON.parse(
        localStorage.getItem(
          "usedDevices"
        ) || "[]"
      );

    if (
      used.includes(eid)
    ) {

      if (err) {

        err.innerText =
          "❌ ഈ Device-ൽ ചെയ്തു!";

        err.classList.remove(
          "hidden"
        );
      }

      return;
    }
  }


  err?.classList.add(
    "hidden"
  );


  questions =
    normalizeQuestions(
      questions
    );


  if (!questions.length) {

    try {

      const s =
        normalizeQuestions(
          JSON.parse(
            localStorage.getItem(
              "questions_v13"
            ) || "[]"
          )
        );

      if (s.length) {

        questions =
          s;

      } else {

        questions = [
          {
            q:
              "നബി ജന്മദേശം?",
            opts: [
              "മക്ക",
              "മദീന",
              "ത്വാഇഫ്",
              "യമൻ"
            ],
            ans: 0
          }
        ];
      }

    } catch {

      questions = [
        {
          q:
            "നബി ജന്മദേശം?",
          opts: [
            "മക്ക",
            "മദീന",
            "ത്വാഇഫ്",
            "യമൻ"
          ],
          ans: 0
        }
      ];
    }
  }


  const cnt =
    Math.min(
      eventQuestionCount ||
      questions.length,
      questions.length
    );


  let fq;


  if (randomMode) {

    fq =
      [...questions]
        .sort(
          () =>
            0.5 -
            Math.random()
        )
        .slice(
          0,
          cnt
        );

  } else {

    fq =
      questions.slice(
        0,
        cnt
      );
  }


  questions =
    fq;


  document
    .getElementById(
      "registrationBox"
    )
    ?.classList.add(
      "hidden"
    );


  document
    .getElementById(
      "quizCard"
    )
    ?.classList.remove(
      "hidden"
    );


  currentQ =
    0;

  score =
    0;

  startTime =
    Date.now();


  window._quizData = {

    name,

    phone,

    place:
      document.getElementById(
        "placeInput"
      )?.value.trim() ||
      ""
  };


  showQ();

  startTimer();
}


/* ============================================================
   SHOW QUESTION
   ============================================================ */

function showQ() {

  if (
    currentQ >=
    questions.length
  ) {

    finishQuiz();

    return;
  }


  const qq =
    questions[currentQ];


  const qCount =
    document.getElementById(
      "qCount"
    );

  if (qCount) {

    qCount.innerText =
      `Q ${
        currentQ + 1
      }/${
        questions.length
      } ${
        randomMode
          ? "🔀 Random"
          : ""
      }`;
  }


  const progress =
    document.getElementById(
      "progressBar"
    );

  if (progress) {

    progress.style.width =
      (
        currentQ /
        questions.length *
        100
      ) +
      "%";
  }


  const qText =
    document.getElementById(
      "qText"
    );

  if (qText) {

    qText.innerText =
      qq.q;
  }


  const od =
    document.getElementById(
      "options"
    );

  if (!od) return;


  od.innerHTML =
    "";


  const fb =
    document.getElementById(
      "quizFeedback"
    );

  fb?.classList.add(
    "hidden"
  );


  qq.opts.forEach(
    (o, i) => {

      const b =
        document.createElement(
          "button"
        );

      b.id =
        `opt-${i}`;

      b.className =
        "w-full text-left px-4 py-4 border-2 rounded-xl text-sm bg-white hover:bg-green-50 transition-all font-medium shadow-sm";

      b.innerText =
        `${String.fromCharCode(
          65 + i
        )}. ${o}`;


      b.onclick =
        () => {

          Array.from(
            od.children
          ).forEach(
            x =>
              x.disabled =
                true
          );


          const ok =
            i === qq.ans;


          if (ok) {

            b.style.background =
              "#16a34a";

            b.style.color =
              "white";

            b.style.borderColor =
              "#16a34a";

            b.innerText =
              `✅ ${
                String.fromCharCode(
                  65 + i
                )
              }. ${o} - ശരി!`;


            score++;


            if (fb) {

              fb.innerText =
                "✅ Excellent! ശരി!";

              fb.className =
                "text-center font-black mt-4 text-sm p-4 rounded-xl bg-green-100 text-green-700 border-2 border-green-500";

              fb.classList.remove(
                "hidden"
              );
            }


          } else {

            b.style.background =
              "#dc2626";

            b.style.color =
              "white";

            b.style.borderColor =
              "#dc2626";

            b.innerText =
              `❌ ${
                String.fromCharCode(
                  65 + i
                )
              }. ${o} - തെറ്റ്!`;


            if (
              showCorrectWrong
            ) {

              const cb =
                document.getElementById(
                  `opt-${qq.ans}`
                );

              if (cb) {

                cb.style.background =
                  "#16a34a";

                cb.style.color =
                  "white";

                cb.style.borderColor =
                  "#16a34a";

                cb.style.borderWidth =
                  "3px";

                cb.innerText =
                  `✅ ${
                    String.fromCharCode(
                      65 +
                      qq.ans
                    )
                  }. ${
                    qq.opts[
                      qq.ans
                    ]
                  } - ശരി!`;
              }


              if (fb) {

                fb.innerText =
                  `❌ തെറ്റ്! ശരി: ${
                    String.fromCharCode(
                      65 +
                      qq.ans
                    )
                  }. ${
                    qq.opts[
                      qq.ans
                    ]
                  }`;

                fb.className =
                  "text-center font-black mt-4 text-sm p-4 rounded-xl bg-red-100 text-red-700 border-2 border-red-400";

                fb.classList.remove(
                  "hidden"
                );
              }
            }
          }


          setTimeout(
            () => {

              currentQ++;

              showQ();

            },
            2200
          );
        };


      od.appendChild(
        b
      );
    }
  );
}


/* ============================================================
   TIMER
   ============================================================ */

function startTimer() {

  let t =
    totalMinutes *
    60;


  const el =
    document.getElementById(
      "timer"
    );


  const upd =
    () => {

      if (!el) return;

      el.innerText =
        Math.floor(
          t / 60
        ) +
        ":" +
        String(
          t % 60
        ).padStart(
          2,
          "0"
        );
    };


  upd();


  clearInterval(
    timerInt
  );


  timerInt =
    setInterval(
      () => {

        t--;

        upd();

        if (t <= 0) {

          clearInterval(
            timerInt
          );

          finishQuiz();
        }

      },
      1000
    );
}


/* ============================================================
   FINISH QUIZ
   ============================================================ */

function finishQuiz() {

  clearInterval(
    timerInt
  );


  if (!window._quizData) {

    return;
  }


  const tt =
    Math.floor(
      (
        Date.now() -
        startTime
      ) /
      1000
    );


  const m =
    Math.floor(
      tt / 60
    );


  const s =
    tt % 60;


  const r = {

    name:
      window._quizData.name,

    phone:
      window._quizData.phone,

    place:
      window._quizData.place,

    score,

    total:
      questions.length,

    time:
      tt,

    timeStr:
      `${m}:${String(
        s
      ).padStart(
        2,
        "0"
      )}`,

    timestamp:
      Date.now()
  };


  let rs =
    JSON.parse(
      localStorage.getItem(
        "results_v13"
      ) || "[]"
    );


  rs.push(
    r
  );


  localStorage.setItem(
    "results_v13",
    JSON.stringify(
      rs
    )
  );


  const eid =
    new URLSearchParams(
      window.location.search
    ).get("event") ||
    currentEventId;


  let up =
    JSON.parse(
      localStorage.getItem(
        "usedPhones"
      ) || "[]"
    );


  up.push(
    window._quizData.phone +
    "_" +
    eid
  );


  localStorage.setItem(
    "usedPhones",
    JSON.stringify(
      up
    )
  );


  let ud =
    JSON.parse(
      localStorage.getItem(
        "usedDevices"
      ) || "[]"
    );


  ud.push(
    eid
  );


  localStorage.setItem(
    "usedDevices",
    JSON.stringify(
      ud
    )
  );


  document
    .getElementById(
      "quizCard"
    )
    ?.classList.add(
      "hidden"
    );


  document
    .getElementById(
      "resultCard"
    )
    ?.classList.remove(
      "hidden"
    );


  const fs =
    document.getElementById(
      "finalScore"
    );

  if (fs) {

    fs.innerText =
      `${score}/${questions.length}`;
  }


  const ft =
    document.getElementById(
      "finalTime"
    );

  if (ft) {

    ft.innerText =
      `Time: ${m}:${String(
        s
      ).padStart(
        2,
        "0"
      )} ⏱️`;
  }


  loadResults();


  if (firebaseDB) {

    const ee =
      new URLSearchParams(
        window.location.search
      ).get("event");


    if (ee) {

      firebaseDB
        .ref(
          "results/" +
          ee
        )
        .push(
          r
        )
        .catch(
          e =>
            console.warn(
              "Result upload failed:",
              e
            )
        );
    }
  }


  setTimeout(
    generateCertificate,
    500
  );
}


/* ============================================================
   CERTIFICATE GENERATOR
   ============================================================ */

function generateCertificate() {

  const c =
    document.getElementById(
      "certCanvas"
    );

  if (!c) return;


  const ctx =
    c.getContext(
      "2d"
    );


  const imgData =
    currentCertBase64 ||
    localStorage.getItem(
      "certFullImage"
    );


  const name =
    window._quizData?.name ||
    "Sample";


  c.width =
    1000;

  c.height =
    700;


  if (imgData) {

    const im =
      new Image();


    im.onload =
      () => {

        ctx.drawImage(
          im,
          0,
          0,
          c.width,
          c.height
        );


        const x =
          c.width *
          parseInt(
            certPos.x
          ) /
          100;


        const y =
          c.height *
          parseInt(
            certPos.y
          ) /
          100;


        ctx.font =
          `bold ${
            parseInt(
              certPos.s
            ) * 2
          }px sans-serif`;


        ctx.fillStyle =
          "#14532d";


        ctx.textAlign =
          "center";


        ctx.textBaseline =
          "middle";


        ctx.fillText(
          name,
          x,
          y
        );


        const area =
          document.getElementById(
            "certDownloadArea"
          );

        if (area) {

          area.classList.remove(
            "hidden"
          );
        }


        const link =
          document.getElementById(
            "certDownloadLink"
          );

        if (link) {

          link.href =
            c.toDataURL(
              "image/png"
            );
        }
      };


    im.src =
      imgData;


  } else {

    ctx.fillStyle =
      "#fff";

    ctx.fillRect(
      0,
      0,
      c.width,
      c.height
    );


    ctx.fillStyle =
      "#14532d";


    ctx.font =
      "bold 36px sans-serif";


    ctx.textAlign =
      "center";


    ctx.fillText(
      "Certificate of Participation",
      c.width / 2,
      100
    );


    ctx.font =
      `bold ${
        parseInt(
          certPos.s
        ) * 2
      }px sans-serif`;


    ctx.fillText(
      name,
      c.width *
        parseInt(
          certPos.x
        ) /
        100,
      c.height *
        parseInt(
          certPos.y
        ) /
        100
    );


    document
      .getElementById(
        "certDownloadArea"
      )
      ?.classList.remove(
        "hidden"
      );


    const link =
      document.getElementById(
        "certDownloadLink"
      );

    if (link) {

      link.href =
        c.toDataURL(
          "image/png"
        );
    }
  }
}


function downloadCertificate() {

  generateCertificate();


  setTimeout(
    () => {

      const area =
        document.getElementById(
          "certDownloadArea"
        );

      if (area) {

        area.classList.remove(
          "hidden"
        );

        area.scrollIntoView({
          behavior:
            "smooth"
        });
      }

    },
    300
  );
}


/* ============================================================
   RESULTS
   ============================================================ */

function loadResults() {

  const l =
    document.getElementById(
      "resultsList"
    );

  if (!l) return;


  let r =
    JSON.parse(
      localStorage.getItem(
        "results_v13"
      ) || "[]"
    );


  if (!r.length) {

    l.innerHTML =
      '<p class="text-center py-6 text-gray-500">No Results Yet</p>';

    return;
  }


  r.sort(
    (a, b) => {

      if (
        b.score !==
        a.score
      ) {

        return (
          b.score -
          a.score
        );
      }

      return (
        a.time -
        b.time
      );
    }
  );


  l.innerHTML =
    "";


  r.forEach(
    (x, i) => {

      const med =
        i === 0
          ? "🥇"
          : i === 1
            ? "🥈"
            : i === 2
              ? "🥉"
              : `${i + 1}.`;


      l.innerHTML += `
        <div class="flex justify-between py-2.5 border-b text-xs hover:bg-yellow-50 px-2 rounded">

          <span>
            ${med}
            ${escapeHtml(x.name)}
            -
            ${x.score}/${x.total}
          </span>

          <span class="font-bold">
            ${escapeHtml(x.timeStr)}
          </span>

        </div>
      `;
    }
  );
}


function downloadResults() {

  let r =
    JSON.parse(
      localStorage.getItem(
        "results_v13"
      ) || "[]"
    );


  if (!r.length) {

    alert(
      "No Results"
    );

    return;
  }


  let csv =
    "Rank,Name,Phone,Place,Score,Total,Time\n";


  r.forEach(
    (x, i) => {

      csv +=
        [
          i + 1,
          csvEscape(
            x.name
          ),
          csvEscape(
            x.phone
          ),
          csvEscape(
            x.place || ""
          ),
          x.score,
          x.total,
          csvEscape(
            x.timeStr
          )
        ].join(",") +
        "\n";
    }
  );


  const b =
    new Blob(
      [csv],
      {
        type:
          "text/csv"
      }
    );


  const u =
    URL.createObjectURL(
      b
    );


  const a =
    document.createElement(
      "a"
    );


  a.href =
    u;

  a.download =
    "Results.csv";

  a.click();


  setTimeout(
    () =>
      URL.revokeObjectURL(
        u
      ),
    1000
  );
}


function clearAllResults() {

  if (
    !confirm(
      "Delete All Results?"
    )
  ) return;


  localStorage.removeItem(
    "results_v13"
  );


  loadResults();
}


/* ============================================================
   MASTER ADMIN
   ============================================================ */

function openMasterAdmin() {

  const overlay =
    document.getElementById(
      "masterOverlay"
    );

  const loginBox =
    document.getElementById(
      "masterLoginBox"
    );

  const panel =
    document.getElementById(
      "masterPanel"
    );


  if (overlay) {

    overlay.style.display =
      "flex";
  }


  if (loginBox) {

    loginBox.style.display =
      masterLoggedIn
        ? "none"
        : "block";
  }


  if (panel) {

    panel.style.display =
      masterLoggedIn
        ? "block"
        : "none";
  }


  if (masterLoggedIn) {

    loadOrganizers();
  }
}


function closeMaster() {

  const overlay =
    document.getElementById(
      "masterOverlay"
    );

  if (overlay) {

    overlay.style.display =
      "none";
  }
}


/* ============================================================
   MASTER ADMIN — GOOGLE LOGIN
   ============================================================
   Popup flow is intentional. Firebase documents popup as the
   alternative to redirect for browsers that block third-party
   storage, which avoids the mobile/GitHub Pages "missing initial
   state" problem.
   ============================================================ */

async function masterGoogleLogin() {
  const status = document.getElementById("masterStatus");

  try {
    if (!window.firebase || !firebase.auth) {
      alert("Firebase Auth SDK is not loaded.");
      return;
    }

    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    if (status) status.innerText = "⏳ Google Login തുറക്കുന്നു...";

    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

    // Do NOT use signInWithRedirect here: on GitHub Pages/mobile
    // it can lose the Firebase redirect state in sessionStorage.
    const result = await auth.signInWithPopup(provider);
    const user = result && result.user;
    const email = (user?.email || "").trim().toLowerCase();

    if (email !== MASTER_ADMIN_EMAIL.trim().toLowerCase()) {
      await auth.signOut().catch(() => {});
      if (status) status.innerText = "❌ Unauthorized Google account";
      alert("Access Denied.\n\nOnly the authorized Master Admin Gmail can access this panel.");
      return;
    }

    masterLoggedIn = true;
    sessionRole = "master";
    localStorage.setItem("noor_role", "master");

    const loginBox = document.getElementById("masterLoginBox");
    const panel = document.getElementById("masterPanel");
    const overlay = document.getElementById("masterOverlay");

    if (loginBox) loginBox.style.display = "none";
    if (panel) panel.style.display = "block";
    if (status) status.innerText = "👑 Master Admin active — " + user.email;

    document.getElementById("competitorView")?.classList.add("hidden");
    document.getElementById("adminView")?.classList.remove("hidden");

    addMasterControlButton();
    try { renderQuestions(); } catch {}
    try { loadPastEvents(); } catch {}
    try { loadResults(); } catch {}
    try { await loadOrganizers(); } catch {}

    if (overlay) overlay.style.display = "flex";
    console.log("✅ Master Admin Google popup login success");
  } catch (err) {
    console.error("Google Login Error:", err);
    if (status) status.innerText = "❌ Google Login Failed";

    if (err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request") return;

    if (err?.code === "auth/unauthorized-domain") {
      alert("❌ Firebase Authorized Domain പ്രശ്നം.\n\nFirebase Console → Authentication → Settings → Authorized domains-ൽ നിങ്ങളുടെ website domain ചേർക്കുക.");
      return;
    }

    if (err?.code === "auth/popup-blocked") {
      alert("❌ Google Login popup browser തടഞ്ഞു.\n\nGoogle Login button വീണ്ടും നേരിട്ട് tap ചെയ്യുക.");
      return;
    }

    alert("Google Sign-In failed.\n\n" + (err?.message || "Unknown error"));
  }
}

/* ============================================================
   MASTER LOGOUT
   ============================================================ */

async function masterLogout() {

  try {

    if (
      window.firebase &&
      firebase.auth
    ) {

      await firebase
        .auth()
        .signOut();
    }

  } catch {}


  masterLoggedIn =
    false;

  sessionRole =
    "none";
  localStorage.removeItem("noor_role");


  document
    .getElementById(
      "masterLoginBox"
    )
    ?.style
    &&
    (
      document.getElementById(
        "masterLoginBox"
      ).style.display =
        "block"
    );


  const panel =
    document.getElementById(
      "masterPanel"
    );

  if (panel) {

    panel.style.display =
      "none";
  }


  const overlay =
    document.getElementById(
      "masterOverlay"
    );

  if (overlay) {

    overlay.style.display =
      "none";
  }


  document
    .getElementById(
      "adminView"
    )
    ?.classList.add(
      "hidden"
    );


  document
    .getElementById(
      "competitorView"
    )
    ?.classList.remove(
      "hidden"
    );


  removeMasterControlButton();
}


/* ============================================================
   MASTER DATABASE
   ============================================================ */

async function masterDb(
  path,
  method = "GET",
  body = null
) {

  let token =
    "";


  try {

    if (
      firebase.auth()
        .currentUser
    ) {

      token =
        await firebase
          .auth()
          .currentUser
          .getIdToken();
    }

  } catch {}


  const opts = {

    method,

    headers: {
      "Content-Type":
        "application/json"
    }
  };


  if (body !== null) {

    opts.body =
      JSON.stringify(
        body
      );
  }


  const url =
    `${REST_URL}/${path}.json` +
    (
      token
        ? `?auth=${encodeURIComponent(token)}`
        : ""
    );


  const r =
    await fetch(
      url,
      opts
    );


  if (!r.ok) {

    throw new Error(
      "Firebase request failed: " +
      r.status
    );
  }


  return r.json();
}


/* ============================================================
   CREATE ORGANIZER
   ============================================================ */

async function createOrganizer() {

  if (!masterLoggedIn) return;


  const name =
    document.getElementById(
      "orgName"
    )?.value.trim() ||
    "";


  const email =
    document.getElementById(
      "orgEmail"
    )?.value.trim() ||
    "";


  const code =
    document.getElementById(
      "orgCode"
    )?.value.trim() ||
    "";


  if (
    !name ||
    !email ||
    !code
  ) {

    alert(
      "Name, email and activation code are required."
    );

    return;
  }


  const id =
    "org_" +
    Date.now();


  await masterDb(
    "masterAdmin/organizers/" +
    id,
    "PUT",
    {

      name,

      email,

      activationCode:
        code,

      active:
        true,

      activated:
        false,

      created:
        Date.now()
    }
  );


  const n =
    document.getElementById(
      "orgName"
    );

  const e =
    document.getElementById(
      "orgEmail"
    );

  const c =
    document.getElementById(
      "orgCode"
    );


  if (n) n.value = "";
  if (e) e.value = "";
  if (c) c.value = "";


  loadOrganizers();
}


/* ============================================================
   LOAD ORGANIZERS
   ============================================================ */

async function loadOrganizers() {

  const box =
    document.getElementById(
      "organizerList"
    );


  if (!box) return;


  try {

    const data =
      await masterDb(
        "masterAdmin/organizers"
      );


    const items =
      Object.entries(
        data || {}
      );


    if (!items.length) {

      box.innerHTML =
        '<div style="padding:10px;color:#6b7280">No organizers yet.</div>';

      return;
    }


    box.innerHTML =
      items
        .map(
          ([id, o]) => `

            <div class="master-item">

              <div>

                <b>
                  ${escapeHtml(
                    o.name || ""
                  )}
                </b>

                <br>

                <small>

                  ${escapeHtml(
                    o.email || ""
                  )}

                  <br>

                  Code:
                  ${escapeHtml(
                    o.activationCode || ""
                  )}

                  ·

                  ${
                    o.active
                      ? "Active"
                      : "Disabled"
                  }

                  ·

                  ${
                    o.activated
                      ? "Activated"
                      : "Not activated"
                  }

                </small>

              </div>


              <div
                style="
                  display:flex;
                  gap:6px;
                  flex-wrap:wrap
                "
              >

                <button
                  class="master-btn ${
                    o.active
                      ? "master-danger"
                      : "master-primary"
                  }"
                  onclick="
                    toggleOrganizer(
                      '${escapeHtml(id)}',
                      ${!!o.active}
                    )
                  "
                >
                  ${
                    o.active
                      ? "Disable"
                      : "Enable"
                  }
                </button>


                <button
                  class="master-btn master-muted"
                  onclick="
                    resetOrganizer(
                      '${escapeHtml(id)}'
                    )
                  "
                >
                  Reset
                </button>


                <button
                  class="master-btn master-danger"
                  onclick="
                    deleteOrganizer(
                      '${escapeHtml(id)}'
                    )
                  "
                >
                  Delete
                </button>

              </div>

            </div>
          `
        )
        .join("");


  } catch (e) {

    console.error(e);

    box.innerHTML =
      '<div style="color:#b91c1c">Could not load organizers.</div>';
  }
}


/* ============================================================
   ORGANIZER CONTROLS
   ============================================================ */

async function toggleOrganizer(
  id,
  active
) {

  if (!masterLoggedIn) return;


  try {

    await masterDb(
      "masterAdmin/organizers/" +
      id +
      "/active",
      "PUT",
      !active
    );

    loadOrganizers();

  } catch (e) {

    alert(
      "Failed to update organizer."
    );
  }
}


async function resetOrganizer(
  id
) {

  if (!masterLoggedIn) return;


  if (
    !confirm(
      "Reset this organizer activation?"
    )
  ) {
    return;
  }


  try {

    await masterDb(
      "masterAdmin/organizers/" +
      id,
      "PATCH",
      {
        activated:
          false,

        activatedAt:
          null
      }
    );

    loadOrganizers();

  } catch {

    alert(
      "Failed to reset organizer."
    );
  }
}


async function deleteOrganizer(
  id
) {

  if (!masterLoggedIn) return;


  if (
    !confirm(
      "Delete this organizer account?"
    )
  ) {
    return;
  }


  try {

    await masterDb(
      "masterAdmin/organizers/" +
      id,
      "DELETE"
    );

    loadOrganizers();

  } catch {

    alert(
      "Failed to delete organizer."
    );
  }
}


/* ============================================================
   V4 QUESTION MANAGER
   ============================================================ */

let v4Questions = [];


function v4GetQuestions() {

  try {

    const qs =
      Array.isArray(
        questions
      ) &&
      questions.length
        ? questions
        : JSON.parse(
            localStorage.getItem(
              "questions_v13"
            ) || "[]"
          );


    return normalizeQuestions(
      qs
    );

  } catch {

    return [];
  }
}


function v4SetQuestions(qs) {

  v4Questions =
    normalizeQuestions(
      qs
    );

  questions =
    v4Questions;


  localStorage.setItem(
    "questions_v13",
    JSON.stringify(
      v4Questions
    )
  );


  if (
    typeof renderQuestions ===
    "function"
  ) {

    renderQuestions();
  }


  v4RenderQuestions();
}


function v4OpenQuestions() {

  v4Questions =
    v4GetQuestions();


  const overlay =
    document.getElementById(
      "v4QuestionOverlay"
    );


  if (overlay) {

    overlay.style.display =
      "flex";
  }


  v4RenderQuestions();
}


function v4CloseQuestions() {

  const overlay =
    document.getElementById(
      "v4QuestionOverlay"
    );


  if (overlay) {

    overlay.style.display =
      "none";
  }
}


function v4OpenImport() {

  document
    .getElementById(
      "v4File"
    )
    ?.click();
}


/* ============================================================
   V4 ADD
   ============================================================ */

function v4AddQuestion() {

  const q =
    document.getElementById(
      "v4q"
    )?.value.trim() ||
    "";


  const opts =
    [
      "v4a",
      "v4b",
      "v4c",
      "v4d"
    ]
      .map(
        id =>
          document
            .getElementById(
              id
            )
            ?.value.trim() ||
          ""
      );


  const correct =
    document.getElementById(
      "v4correct"
    )?.value ||
    "A";


  if (
    !q ||
    opts.some(
      x => !x
    )
  ) {

    alert(
      "Question and all four options are required."
    );

    return;
  }


  const id =
    "q_" +
    Date.now();


  const answerIndex =
    Math.max(
      0,
      Math.min(
        3,
        correct
          .toUpperCase()
          .charCodeAt(0) -
          65
      )
    );


  v4SetQuestions(
    [
      ...v4Questions,
      {
        id,

        q,

        opts,

        ans:
          answerIndex
      }
    ]
  );


  [
    "v4q",
    "v4a",
    "v4b",
    "v4c",
    "v4d"
  ].forEach(
    id => {

      const el =
        document.getElementById(
          id
        );

      if (el) {
        el.value =
          "";
      }
    }
  );
}


/* ============================================================
   V4 RENDER
   ============================================================ */

function v4RenderQuestions() {

  const box =
    document.getElementById(
      "v4QuestionList"
    );


  if (!box) return;


  v4Questions =
    normalizeQuestions(
      v4Questions
    );


  if (!v4Questions.length) {

    box.innerHTML =
      '<p style="color:#6b7280">No questions yet.</p>';

    return;
  }


  box.innerHTML =
    v4Questions
      .map(
        (x, i) => {

          const opts =
            x.opts ||
            [];


          const correctLetter =
            String.fromCharCode(
              65 + x.ans
            );


          return `

            <div class="v4-qbox">

              <label>

                <input
                  type="checkbox"
                  class="v4sel"
                  data-i="${i}"
                >

                <b>
                  ${i + 1}.
                </b>

              </label>


              <textarea
                id="v4editq_${i}"
              >${escV4(x.q)}</textarea>


              <div
                class="v4-grid"
              >

                ${opts
                  .map(
                    (o, j) => `

                      <input
                        id="v4e_${i}_${j}"
                        value="${escV4(o)}"
                      >

                    `
                  )
                  .join("")}

              </div>


              <select
                id="v4ec_${i}"
              >

                ${[
                  "A",
                  "B",
                  "C",
                  "D"
                ]
                  .map(
                    k => `

                      <option
                        ${
                          correctLetter === k
                            ? "selected"
                            : ""
                        }
                      >
                        ${k}
                      </option>

                    `
                  )
                  .join("")}

              </select>


              <div
                style="margin-top:6px"
              >

                <button
                  class="v4-btn v4-primary"
                  onclick="
                    v4SaveQuestion(${i})
                  "
                >
                  💾 Save
                </button>


                <button
                  class="v4-btn v4-secondary"
                  onclick="
                    v4Duplicate(${i})
                  "
                >
                  Copy
                </button>


                <button
                  class="v4-btn v4-danger"
                  onclick="
                    v4DeleteOne(${i})
                  "
                >
                  Delete
                </button>

              </div>

            </div>
          `;
        }
      )
      .join("");
}


/* ============================================================
   V4 SAVE
   ============================================================ */

function v4SaveQuestion(i) {

  const opts =
    [0, 1, 2, 3]
      .map(
        j =>
          document
            .getElementById(
              `v4e_${i}_${j}`
            )
            ?.value.trim() ||
          ""
      );


  const q =
    document
      .getElementById(
        `v4editq_${i}`
      )
      ?.value.trim() ||
    "";


  const correct =
    document
      .getElementById(
        `v4ec_${i}`
      )
      ?.value ||
    "A";


  if (
    !q ||
    opts.some(
      x => !x
    )
  ) {

    alert(
      "Complete all fields."
    );

    return;
  }


  const ans =
    Math.max(
      0,
      Math.min(
        3,
        correct
          .charCodeAt(0) -
          65
      )
    );


  v4Questions[i] = {

    ...v4Questions[i],

    q,

    opts,

    ans
  };


  v4SetQuestions(
    v4Questions
  );
}


function v4DeleteOne(i) {

  if (
    confirm(
      "Delete this question?"
    )
  ) {

    v4Questions.splice(
      i,
      1
    );

    v4SetQuestions(
      v4Questions
    );
  }
}


function v4DeleteSelected() {

  const idx =
    [
      ...document.querySelectorAll(
        ".v4sel:checked"
      )
    ]
      .map(
        x =>
          +x.dataset.i
      )
      .sort(
        (a, b) =>
          b - a
      );


  if (!idx.length) {

    alert(
      "Select questions first."
    );

    return;
  }


  if (
    confirm(
      `Delete ${idx.length} selected question(s)?`
    )
  ) {

    idx.forEach(
      i =>
        v4Questions.splice(
          i,
          1
        )
    );

    v4SetQuestions(
      v4Questions
    );
  }
}


function v4Duplicate(i) {

  const original =
    v4Questions[i];


  v4Questions.splice(
    i + 1,
    0,
    {
      ...original,

      id:
        "q_" +
        Date.now() +
        "_" +
        Math.random()
          .toString(36)
          .slice(2)
    }
  );


  v4SetQuestions(
    v4Questions
  );
}


/* ============================================================
   V4 CSV EXPORT
   ============================================================ */

function v4ExportCSV() {

  const qs =
    v4GetQuestions();


  let s =
    "Question,Option A,Option B,Option C,Option D,Correct\n";


  qs.forEach(
    x => {

      const o =
        x.opts ||
        [];


      const correct =
        String.fromCharCode(
          65 +
          (
            typeof x.ans ===
            "number"
              ? x.ans
              : 0
          )
        );


      s +=
        [
          x.q ||
            "",
          o[0] ||
            "",
          o[1] ||
            "",
          o[2] ||
            "",
          o[3] ||
            "",
          correct
        ]
          .map(
            csvV4
          )
          .join(",") +
        "\n";
    }
  );


  const a =
    document.createElement(
      "a"
    );


  a.href =
    URL.createObjectURL(
      new Blob(
        [s],
        {
          type:
            "text/csv"
        }
      )
    );


  a.download =
    "Noor_Quiz_Questions.csv";


  a.click();
}


/* ============================================================
   V4 CSV IMPORT
   ============================================================ */

function v4ImportFile(ev) {

  const f =
    ev.target.files[0];


  if (!f) return;


  if (
    f.name
      .toLowerCase()
      .endsWith(".csv")
  ) {

    const r =
      new FileReader();


    r.onload =
      () =>
        v4ParseCSV(
          r.result
        );


    r.readAsText(
      f
    );

  } else {

    alert(
      "Please export the sheet as CSV."
    );
  }
}


/* ============================================================
   V4 CSV PARSER
   ============================================================ */

function v4ParseCSV(
  text
) {

  const rows =
    [];

  let row =
    [];

  let cell =
    "";

  let q =
    false;


  for (
    let i = 0;
    i < text.length;
    i++
  ) {

    const c =
      text[i];

    const n =
      text[i + 1];


    if (
      c === '"' &&
      q &&
      n === '"'
    ) {

      cell +=
        '"';

      i++;

      continue;
    }


    if (
      c === '"'
    ) {

      q =
        !q;

      continue;
    }


    if (
      c === "," &&
      !q
    ) {

      row.push(
        cell
      );

      cell =
        "";

      continue;
    }


    if (
      (
        c === "\n" ||
        c === "\r"
      ) &&
      !q
    ) {

      if (
        c === "\r" &&
        n === "\n"
      ) {

        i++;
      }


      row.push(
        cell
      );


      if (
        row.some(
          x =>
            x.trim()
        )
      ) {

        rows.push(
          row
        );
      }


      row =
        [];

      cell =
        "";

      continue;
    }


    cell +=
      c;
  }


  if (
    cell ||
    row.length
  ) {

    row.push(
      cell
    );

    rows.push(
      row
    );
  }


  const first =
    rows[0] || [];


  const hasHeader =
    first[0] &&
    first[0]
      .toLowerCase()
      .includes(
        "question"
      );


  const data =
    rows.slice(
      hasHeader
        ? 1
        : 0
    );


  const imported =
    data
      .map(
        (r, i) => {

          const correct =
            (
              r[5] ||
              "A"
            )
              .trim()
              .toUpperCase();


          const ans =
            [
              "A",
              "B",
              "C",
              "D"
            ].includes(
              correct
            )
              ? correct.charCodeAt(
                  0
                ) -
                65
              : 0;


          return {

            id:
              "q_" +
              Date.now() +
              "_" +
              i,

            q:
              r[0] ||
              "",

            opts: [
              r[1] ||
                "",
              r[2] ||
                "",
              r[3] ||
                "",
              r[4] ||
                ""
            ],

            ans
          };
        }
      )
      .filter(
        x =>
          x.q &&
          x.opts.every(
            Boolean
          )
      );


  if (!imported.length) {

    alert(
      "No valid rows found."
    );

    return;
  }


  v4SetQuestions(
    [
      ...v4Questions,
      ...imported
    ]
  );


  alert(
    `${imported.length} questions imported.`
  );
}


/* ============================================================
   HELPERS
   ============================================================ */

function csvV4(v) {

  const s =
    String(
      v ?? ""
    );


  return /[",\n]/.test(
    s
  )
    ? '"' +
      s.replace(
        /"/g,
        '""'
      ) +
      '"'
    : s;
}


function csvEscape(v) {

  const s =
    String(
      v ?? ""
    );


  return /[",\n]/.test(
    s
  )
    ? '"' +
      s.replace(
        /"/g,
        '""'
      ) +
      '"'
    : s;
}


function escV4(s) {

  return String(
    s ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


function escapeHtml(s) {

  return String(
    s ?? ""
  ).replace(
    /[&<>"']/g,
    m =>
      ({
        "&":
          "&amp;",
        "<":
          "&lt;",
        ">":
          "&gt;",
        '"':
          "&quot;",
        "'":
          "&#039;"
      })[m]
  );
}


/* ============================================================
   GLOBAL EXPORTS
   ============================================================ */

window.openMasterAdmin =
  openMasterAdmin;

window.masterGoogleLogin =
  masterGoogleLogin;

window.masterLogout =
  masterLogout;

window.loginAdmin =
  loginAdmin;

window.activateOrganizer =
  activateOrganizer;

window.createOrganizer =
  createOrganizer;

window.loadOrganizers =
  loadOrganizers;

window.toggleOrganizer =
  toggleOrganizer;

window.resetOrganizer =
  resetOrganizer;

window.deleteOrganizer =
  deleteOrganizer;

window.v4OpenQuestions =
  v4OpenQuestions;

window.v4CloseQuestions =
  v4CloseQuestions;

window.v4AddQuestion =
  v4AddQuestion;

window.v4SaveQuestion =
  v4SaveQuestion;

window.v4DeleteOne =
  v4DeleteOne;

window.v4DeleteSelected =
  v4DeleteSelected;

window.v4Duplicate =
  v4Duplicate;

window.v4ExportCSV =
  v4ExportCSV;

window.v4OpenImport =
  v4OpenImport;

window.v4ImportFile =
  v4ImportFile;

window.bulkAdd =
  bulkAdd;

window.deleteQuestion =
  deleteQuestion;

window.createNewLink =
  createNewLink;

window.saveCloudSameLink =
  saveCloudSameLink;

window.editCurrentEvent =
  editCurrentEvent;

window.editEventById =
  editEventById;

window.deleteEvent =
  deleteEvent;

window.copyEventLink =
  copyEventLink;

window.copyLink =
  copyLink;

window.shareWhatsApp =
  shareWhatsApp;

window.startQuiz =
  startQuiz;

window.downloadCertificate =
  downloadCertificate;

window.downloadResults =
  downloadResults;

window.clearAllResults =
  clearAllResults;

window.clearAllEvents =
  clearAllEvents;


/* ============================================================
   PAGE LOAD
   ============================================================ */

window.addEventListener(
  "load",
  async () => {

    /*
       1. Normal initialization
    */

    init();


    /*
       2. Google Master login uses popup; no redirect-result handling
       is needed. This avoids mobile sessionStorage/partitioning issues.
    */


    /*
       3. Load competitor event
    */

    try {

      await loadCompetitorEvent();

    } catch (e) {

      console.error(
        "Competitor event load failed:",
        e
      );
    }


    /*
       4. Certificate local cache
    */

    const sc =
      localStorage.getItem(
        "certFullImage"
      );


    if (sc) {

      currentCertBase64 =
        sc;


      const i =
        document.getElementById(
          "certPreviewImg"
        );


      if (i) {

        i.src =
          sc;

        i.classList.remove(
          "hidden"
        );

        document
          .getElementById(
            "certPreviewPlaceholder"
          )
          ?.classList.add(
            "hidden"
          );
      }
    }


    /*
       5. Certificate position
    */

    try {

      const sp =
        JSON.parse(
          localStorage.getItem(
            "certPos_v13"
          ) ||
          '{"x":"50","y":"60","s":"24"}'
        );


      if (
        document.getElementById(
          "certX"
        )
      ) {

        document.getElementById(
          "certX"
        ).value =
          sp.x;

        document.getElementById(
          "certY"
        ).value =
          sp.y;

        document.getElementById(
          "certS"
        ).value =
          sp.s;

        updateCertLive();
      }

    } catch {}


    /*
       6. Questions
    */

    questions =
      normalizeQuestions(
        questions
      );


    if (
      questions.length
    ) {

      renderQuestions();
    }


    /*
       7. Past events
    */

    try {

      await loadPastEvents();

    } catch (e) {

      console.error(
        "Past event load failed:",
        e
      );
    }


    /*
       8. Results
    */

    try {

      loadResults();

    } catch {}


    /*
       9. Master URL
    */

    if (
      new URLSearchParams(
        location.search
      ).get("master") ===
      "1"
    ) {

      setTimeout(
        openMasterAdmin,
        250
      );
    }


    /*
       10. Organizer activation button
    */

    const adminLoginBox =
      document.getElementById(
        "adminLoginBox"
      );


    if (
      adminLoginBox &&
      !document.getElementById(
        "organizerActivateBtn"
      )
    ) {

      const b =
        document.createElement(
          "button"
        );


      b.id =
        "organizerActivateBtn";


      b.className =
        "w-full mt-2 bg-purple-50 text-purple-700 border-2 border-purple-200 py-3 rounded-xl font-bold text-xs";


      b.textContent =
        "🔑 Activate Organizer Account";


      b.onclick =
        activateOrganizer;


      adminLoginBox.appendChild(
        b
      );
    }


    /*
       11. V4 Question Manager
    */

    const admin =
      document.getElementById(
        "adminView"
      );


    if (
      admin &&
      !document.getElementById(
        "v4QuestionBtn"
      )
    ) {

      const b =
        document.createElement(
          "button"
        );


      b.id =
        "v4QuestionBtn";


      b.className =
        "v4-btn v4-primary";


      b.style.margin =
        "8px 0";


      b.textContent =
        "📝 QUESTION MANAGER V4";


      b.onclick =
        v4OpenQuestions;


      admin.prepend(
        b
      );
    }


    /*
       12. Input listeners
    */

    document
      .getElementById(
        "certX"
      )
      ?.addEventListener(
        "input",
        updateCertLive
      );


    document
      .getElementById(
        "certY"
      )
      ?.addEventListener(
        "input",
        updateCertLive
      );


    document
      .getElementById(
        "certS"
      )
      ?.addEventListener(
        "input",
        updateCertLive
      );


    document
      .getElementById(
        "setMinute"
      )
      ?.addEventListener(
        "change",
        function () {

          const c =
            document.getElementById(
              "setMinuteCustom"
            );

          if (!c) return;


          if (
            this.value ===
            "custom"
          ) {

            c.classList.remove(
              "hidden"
            );

          } else {

            c.classList.add(
              "hidden"
            );
          }
        }
      );


    /*
       13. Restore temp images
    */

    const tempLogo =
      localStorage.getItem(
        "temp_logo"
      );


    if (
      tempLogo &&
      !currentLogoBase64
    ) {

      currentLogoBase64 =
        tempLogo;
    }


    const tempBanner =
      localStorage.getItem(
        "temp_banner"
      );


    if (
      tempBanner &&
      !currentBannerBase64
    ) {

      currentBannerBase64 =
        tempBanner;
    }


    console.log(
      "✅ Noor Quiz initialized successfully."
    );
  }
);


/* ============================================================
   EXTRA AUTH STATE LISTENER
   ============================================================ */

try {

  if (
    window.firebase &&
    firebase.auth
  ) {

    firebase
      .auth()
      .onAuthStateChanged(
        user => {

          if (
            user &&
            user.email &&
            user.email
              .trim()
              .toLowerCase() ===
            MASTER_ADMIN_EMAIL
              .trim()
              .toLowerCase()
          ) {

            console.log(
              "👑 Authorized Master Firebase user:",
              user.email
            );
          }
        }
      );
  }

} catch (e) {

  console.warn(
    "Auth state listener unavailable:",
    e
  );
}


/* ============================================================
   END
   ============================================================ */

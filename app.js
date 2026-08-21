/* ============================================================
   NOOR AI MADRASA QUIZ — PRODUCTION CLOUD ENGINE
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

const REST_URL = "https://noor-ai-madrasa-app-default-rtdb.asia-southeast1.firebasedatabase.app";

let firebaseDB = null;
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
let showResultsToParticipants = true;
let eventOpeningTime = null;
let eventEndingTime = null;
let timeCheckInterval = null;

let certPos = { x: "50", y: "60", s: "24" };
let eventPhoneLock = true;
let eventDeviceLock = true;

const MASTER_ADMIN_EMAIL = "muhammadswalihc333@gmail.com";
let masterLoggedIn = false;
let sessionRole = "none";
let activeOrganizerId = localStorage.getItem("noor_organizer_id") || "";

/* ============================================================
   INITIALIZATION & AUTHENTICATION
   ============================================================ */

window.addEventListener("DOMContentLoaded", () => {
  initFirebase();
  initApp();
});

function initFirebase() {
  try {
    if (window.firebase) {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      firebaseDB = firebase.database();

      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          if (!user.isAnonymous && user.email === MASTER_ADMIN_EMAIL) {
            masterLoggedIn = true;
            sessionRole = "master";
          }
        } else {
          firebase.auth().signInAnonymously().catch((err) => {
            console.error("Anonymous auth failed:", err);
          });
        }
      });
    }
  } catch (e) {
    console.error("Firebase Auth/DB Init error:", e);
  }
}

function initApp() {
  const params = new URLSearchParams(window.location.search);
  const urlId = params.get("event");
  
  if (urlId) {
    currentEventId = urlId.replace(/^event_/, "");
  } else {
    currentEventId = localStorage.getItem("currentEventId_v17") || "";
  }

  if (params.get("master") === "1") {
    setTimeout(openMasterAdmin, 300);
  }

  if (currentEventId) {
    loadCompetitorEvent();
  }

  setupResultDropdownListener();
}

function getUserRole() {
  return sessionRole;
}

function getOrganizerId() {
  return activeOrganizerId;
}

/* ============================================================
   EVENT TIME WINDOW & STATUS MANAGEMENT
   ============================================================ */

function startEventTimeMonitor(opening, ending) {
  if (timeCheckInterval) clearInterval(timeCheckInterval);

  const updateUI = () => {
    const now = Date.now();
    const startBtn = document.getElementById("startQuizBtn");
    const statusBox = document.getElementById("eventStatusBox");

    let isOpen = true;
    let statusText = "Quiz Open";

    if (opening && now < new Date(opening).getTime()) {
      isOpen = false;
      const diff = Math.ceil((new Date(opening).getTime() - now) / 1000);
      statusText = `Quiz opens at: ${new Date(opening).toLocaleString()} (In ${Math.floor(diff/60)}m ${diff%60}s)`;
    } else if (ending && now > new Date(ending).getTime()) {
      isOpen = false;
      statusText = "Quiz Closed";
    }

    if (statusBox) {
      statusBox.innerText = statusText;
      statusBox.className = isOpen 
        ? "p-3 rounded-xl bg-green-100 text-green-800 font-bold text-center my-2" 
        : "p-3 rounded-xl bg-yellow-100 text-yellow-800 font-bold text-center my-2";
    }

    if (startBtn) {
      startBtn.disabled = !isOpen;
      startBtn.className = isOpen
        ? "w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl shadow-lg transition-all"
        : "w-full bg-gray-400 text-white font-black py-4 rounded-xl cursor-not-allowed";
    }
  };

  updateUI();
  timeCheckInterval = setInterval(updateUI, 1000);
}

/* ============================================================
   COMPETITOR EVENT LOADER
   ============================================================ */

async function loadCompetitorEvent() {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("event") || currentEventId;

  if (!eventId) return;

  const cleanId = eventId.replace(/^event_/, "");
  let data = null;

  try {
    const res = await fetch(`${REST_URL}/events/${cleanId}.json`);
    if (res.ok) data = await res.json();
  } catch (e) {
    console.warn("REST load error:", e);
  }

  if (!data && firebaseDB) {
    try {
      const snap = await firebaseDB.ref("events/" + cleanId).once("value");
      data = snap.val();
    } catch (e) {}
  }

  if (!data) return;

  currentEventId = cleanId;
  questions = normalizeQuestions(data.questions || []);
  totalMinutes = data.minute || 10;
  eventQuestionCount = data.count || 20;
  showCorrectWrong = data.showCorrect !== false;
  showResultsToParticipants = data.showResultsToParticipants !== false;
  randomMode = data.randomMode !== false;
  eventOpeningTime = data.openingTime || null;
  eventEndingTime = data.endingTime || null;

  // Banner and Logo display setup
  if (data.logo) {
    const img = document.getElementById("compLogoImg");
    if (img) { img.src = data.logo; img.classList.remove("hidden"); }
  }
  if (data.banner) {
    const img = document.getElementById("compBannerImg");
    if (img) { img.src = data.banner; img.classList.remove("hidden"); }
  }

  const titleEl = document.getElementById("compTitle");
  if (titleEl) titleEl.innerText = data.title || "Noor Quiz";

  startEventTimeMonitor(eventOpeningTime, eventEndingTime);
}

/* ============================================================
   CREATE / UPDATE / SAVE EVENT
   ============================================================ */

async function createOrUpdateLink(isNew) {
  const cleanId = isNew ? Date.now().toString() : (currentEventId || Date.now().toString()).replace(/^event_/, "");
  currentEventId = cleanId;

  const title = document.getElementById("eventName")?.value.trim() || "Noor Quiz";
  const place = document.getElementById("eventPlace")?.value.trim() || "";
  const category = document.getElementById("eventCategory")?.value || "Madrasa";
  const minute = parseInt(document.getElementById("setMinute")?.value) || 10;
  const count = parseInt(document.getElementById("setCount")?.value) || 20;
  const openingTime = document.getElementById("eventOpeningTime")?.value || null;
  const endingTime = document.getElementById("eventEndingTime")?.value || null;
  const showResults = document.getElementById("setShowResultsToParticipants")?.checked ?? true;

  const eventData = {
    title,
    place,
    category,
    questions: normalizeQuestions(questions),
    minute,
    count,
    openingTime,
    endingTime,
    showResultsToParticipants: showResults,
    showCorrect: document.getElementById("setShowCorrect")?.checked ?? true,
    randomMode: document.getElementById("setRandom")?.checked ?? true,
    logo: currentLogoBase64 || "",
    banner: currentBannerBase64 || "",
    certificate: currentCertBase64 || "",
    ownerId: getOrganizerId(),
    updated: Date.now()
  };

  try {
    if (firebaseDB) {
      await firebaseDB.ref("events/" + cleanId).set(eventData);
    } else {
      await fetch(`${REST_URL}/events/${cleanId}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData)
      });
    }

    alert(`✅ Event Saved Successfully!\nEvent ID: ${cleanId}`);
    loadPastEvents();
    populateEventFilterDropdown();
  } catch (err) {
    console.error("Save failed:", err);
    alert("❌ Error saving event to Firebase: " + err.message);
  }
}

/* ============================================================
   SUBMIT QUIZ & WRITE RESULTS TO FIREBASE
   ============================================================ */

async function finishQuiz() {
  if (timerInt) clearInterval(timerInt);

  if (!window._quizData) return;

  const duration = Math.floor((Date.now() - startTime) / 1000);
  const cleanId = (new URLSearchParams(window.location.search).get("event") || currentEventId).replace(/^event_/, "");

  const resultPayload = {
    name: window._quizData.name,
    phone: window._quizData.phone,
    place: window._quizData.place || "",
    score: score,
    total: questions.length,
    time: duration,
    timeStr: `${Math.floor(duration/60)}:${String(duration%60).padStart(2,"0")}`,
    eventId: cleanId,
    timestamp: Date.now()
  };

  let writtenToCloud = false;

  if (firebaseDB) {
    try {
      await firebaseDB.ref("results/" + cleanId).push(resultPayload);
      writtenToCloud = true;
    } catch (e) {
      console.error("Firebase Database write error:", e);
    }
  }

  if (!writtenToCloud) {
    try {
      const res = await fetch(`${REST_URL}/results/${cleanId}.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resultPayload)
      });
      if (res.ok) writtenToCloud = true;
    } catch (e) {
      console.error("REST write error:", e);
    }
  }

  if (!writtenToCloud) {
    alert("⚠️ Could not upload result to Cloud. Please check connection.");
  }

  document.getElementById("quizCard")?.classList.add("hidden");
  document.getElementById("resultCard")?.classList.remove("hidden");

  const scoreDisplay = document.getElementById("finalScore");
  const timeDisplay = document.getElementById("finalTime");

  if (showResultsToParticipants) {
    if (scoreDisplay) scoreDisplay.innerText = `${score}/${questions.length}`;
    if (timeDisplay) timeDisplay.innerText = `Time: ${resultPayload.timeStr} ⏱️`;
  } else {
    if (scoreDisplay) scoreDisplay.innerText = "Submitted Successfully!";
    if (timeDisplay) timeDisplay.innerText = "Results hidden by Admin.";
  }
}

/* ============================================================
   ADMIN RESULTS & DYNAMIC EVENT SELECTOR
   ============================================================ */

function setupResultDropdownListener() {
  const select = document.getElementById("eventFilterSelect");
  if (select) {
    select.addEventListener("change", (e) => {
      loadResultsForEvent(e.target.value);
    });
  }
}

async function populateEventFilterDropdown() {
  const select = document.getElementById("eventFilterSelect");
  if (!select) return;

  select.innerHTML = '<option value="ALL">All Events</option>';

  try {
    let events = {};
    if (firebaseDB) {
      const snap = await firebaseDB.ref("events").once("value");
      events = snap.val() || {};
    } else {
      const res = await fetch(`${REST_URL}/events.json`);
      events = await res.json() || {};
    }

    Object.keys(events).forEach((id) => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.innerText = events[id].title ? `${events[id].title} (${id})` : `Event ${id}`;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error("Dropdown populate error:", e);
  }
}

async function loadResults() {
  await populateEventFilterDropdown();
  const select = document.getElementById("eventFilterSelect");
  const selectedEvent = select ? select.value : "ALL";
  loadResultsForEvent(selectedEvent);
}

async function loadResultsForEvent(selectedEventId) {
  const listEl = document.getElementById("resultsList");
  if (!listEl) return;

  listEl.innerHTML = '<p class="text-center py-4 text-gray-500">Loading Cloud Results...</p>';

  try {
    let rawResults = {};
    if (firebaseDB) {
      if (selectedEventId && selectedEventId !== "ALL") {
        const snap = await firebaseDB.ref("results/" + selectedEventId).once("value");
        rawResults[selectedEventId] = snap.val();
      } else {
        const snap = await firebaseDB.ref("results").once("value");
        rawResults = snap.val() || {};
      }
    } else {
      const url = (selectedEventId && selectedEventId !== "ALL")
        ? `${REST_URL}/results/${selectedEventId}.json`
        : `${REST_URL}/results.json`;
      const res = await fetch(url);
      const data = await res.json();
      if (selectedEventId && selectedEventId !== "ALL") {
        rawResults[selectedEventId] = data;
      } else {
        rawResults = data || {};
      }
    }

    let flatResults = [];
    if (selectedEventId && selectedEventId !== "ALL") {
      const eventRes = rawResults[selectedEventId] || {};
      Object.values(eventRes).forEach(r => flatResults.push(r));
    } else {
      Object.keys(rawResults).forEach(eId => {
        const eventRes = rawResults[eId] || {};
        Object.values(eventRes).forEach(r => flatResults.push(r));
      });
    }

    if (!flatResults.length) {
      listEl.innerHTML = '<p class="text-center py-4 text-gray-500">No submission records found.</p>';
      return;
    }

    flatResults.sort((a, b) => (b.score - a.score) || (a.time - b.time));

    listEl.innerHTML = "";
    flatResults.forEach((x, i) => {
      const rank = i + 1;
      listEl.innerHTML += `
        <div class="flex justify-between py-2.5 border-b text-xs hover:bg-yellow-50 px-2 rounded">
          <span><b>#${rank}</b> ${escapeHtml(x.name || "Anonymous")} (${escapeHtml(x.phone || "")})</span>
          <span class="font-bold text-green-700">${x.score}/${x.total} | ${x.timeStr || "0:00"}</span>
        </div>
      `;
    });
  } catch (err) {
    console.error("Results fetch error:", err);
    listEl.innerHTML = '<p class="text-center py-4 text-red-500">Failed to load results from Firebase.</p>';
  }
}

/* Utility Safe HTML Escape */
function escapeHtml(str) {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function normalizeQuestion(q) {
  if (!q) return null;
  const text = q.q || q.question || "";
  let opts = q.opts || q.options || [q.a, q.b, q.c, q.d];
  opts = Array.isArray(opts) ? opts.map(x => String(x ?? "").trim()) : [];
  let ans = typeof q.ans === "number" ? q.ans : 0;
  if (!text || opts.length < 2) return null;
  return { id: q.id || "q_" + Date.now() + "_" + Math.random().toString(36).slice(2), q: text, opts, ans };
}

function normalizeQuestions(arr) {
  return Array.isArray(arr) ? arr.map(normalizeQuestion).filter(Boolean) : [];
}

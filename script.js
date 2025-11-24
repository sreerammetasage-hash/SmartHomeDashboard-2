// ------------------------------
// FIREBASE IMPORT
// ------------------------------
import { initializeApp } 
from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

import { 
    getDatabase, 
    ref, 
    set, 
    onValue 
} 
from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// ------------------------------
// FIREBASE CONFIG
// ------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAFBFu6HQ6er6cFvF6kRTJdd0YgU75xtP0",
  authDomain: "smart-home-dashboard-3f5b2.firebaseapp.com",
  databaseURL: "https://smart-home-dashboard-3f5b2-default-rtdb.firebaseio.com",
  projectId: "smart-home-dashboard-3f5b2",
  storageBucket: "smart-home-dashboard-3f5b2.firebasestorage.app",
  messagingSenderId: "967923717630",
  appId: "1:967923717630:web:1c52a975d5c446e53f9caf"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// small helper to write a single string safely
async function writeString(key, value) {
  try {
    await set(ref(db, key), value);
  } catch (e) {
    console.error("Write failed:", key, e);
  }
}

// ------------------------------
// LIVE DATABASE LISTENER
// ------------------------------
onValue(ref(db, '/'), (snap) => {
    const data = snap.val();
    if (!data) return;

    // Update UI safely
    if (data.mode !== undefined) document.getElementById("modeStatus").innerText = data.mode;
    if (data.fan !== undefined) document.getElementById("fanStatus").innerText = data.fan;
    if (data.light !== undefined) document.getElementById("lightStatus").innerText = data.light;
    if (data.pirLight !== undefined) document.getElementById("pirLightStatus").innerText = data.pirLight;

    if (data.sensors) {
      if (data.sensors.temperature !== undefined) document.getElementById("tempVal").innerText = data.sensors.temperature;
      if (data.sensors.light !== undefined) document.getElementById("lightVal").innerText = data.sensors.light;
      if (data.sensors.motion !== undefined) document.getElementById("motionVal").innerText = data.sensors.motion;
      if (data.sensors.gas !== undefined) document.getElementById("gasVal").innerText = data.sensors.gas;
    }

    if (data.ai !== undefined) document.getElementById("aiStatus").innerText = data.ai;

    // Run AI only when mode is AUTO
    if (String(data.mode).toUpperCase() === "AUTO") {
      runAIMode(data);
    }
});

// ------------------------------
// AUTO MODE AI LOGIC (fixed for digital LDR and thresholds)
// ------------------------------
function runAIMode(data) {
    // safe defaults
    const temp = data.sensors?.temperature ?? -999;
    const light = data.sensors?.light ?? 1; // digital: 1 = bright, 0 = dark (module dependent)
    const motion = data.sensors?.motion ?? 0;
    const gas = data.sensors?.gas ?? 0;

    // 1) Emergency gas shutdown (80% -> 800)
    if (Number(gas) >= 800) {
        // only write when needed to avoid spamming DB
        writeString('fan', "OFF");
        writeString('light', "OFF");
        writeString('pirLight', "OFF");
        writeString('ai', "⚠ GAS detected! All appliances turned OFF.");
        return;
    }

    // 2) Temperature logic: ON if >35°C, OFF if <=33 (small hysteresis)
    if (Number(temp) > 35) {
        writeString('fan', "ON");
        writeString('ai', `Temp ${temp}°C → Fan ON`);
    } else if (Number(temp) <= 33) {
        // keep a small hysteresis to avoid flip-flop
        writeString('fan', "OFF");
        writeString('ai', `Temp ${temp}°C → Fan OFF`);
    }

    // 3) Light sensor (digital): assume 0 = dark, 1 = bright
    // If dark -> turn main light ON
    if (Number(light) === 0) {
        writeString('light', "ON");
        writeString('ai', "Dark detected → Main Light ON");
    } else {
        writeString('light', "OFF");
        writeString('ai', "Bright → Main Light OFF");
    }

    // 4) Motion sensor -> PIR light
    if (Number(motion) === 1) {
        writeString('pirLight', "ON");
        writeString('ai', "Motion detected → PIR Light ON");
    } else {
        writeString('pirLight', "OFF");
        writeString('ai', "No motion → PIR Light OFF");
    }
}

// ------------------------------
// MANUAL CONTROL BUTTONS (UI -> DB)
// ------------------------------
window.setFan = function(state) {
    writeString('fan', state);
    writeString('ai', `Manual: Fan ${state}`);
};

window.setLight = function(state) {
    writeString('light', state);
    writeString('ai', `Manual: Light ${state}`);
};

window.setPirLight = function(state) {
    writeString('pirLight', state);
    writeString('ai', `Manual: PIR Light ${state}`);
};

window.setMode = function(state) {
    writeString('mode', state);
    writeString('ai', "Mode switched to " + state);
};

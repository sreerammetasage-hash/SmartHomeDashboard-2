// ------------------------------------------------------
// FIREBASE IMPORTS
// ------------------------------------------------------
import { initializeApp } 
from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

import { 
    getDatabase, 
    ref, 
    set, 
    onValue 
} 
from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";


// ------------------------------------------------------
// FIXED FIREBASE CONFIG  (100% CORRECT FOR YOUR REGION)
// ------------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyAFBFu6HQ6er6cFvF6kRTJdd0YgU75xtP0",
    authDomain: "smart-home-dashboard-3f5b2.firebaseapp.com",
    databaseURL: "https://smart-home-dashboard-3f5b2-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-home-dashboard-3f5b2",
    storageBucket: "smart-home-dashboard-3f5b2.firebasestorage.app",
    messagingSenderId: "967923717630",
    appId: "1:967923717630:web:1c52a975d5c446e53f9caf"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


// ------------------------------------------------------
// REALTIME LISTENER – NOW WORKING
// ------------------------------------------------------
onValue(ref(db, '/'), (snap) => {

    const data = snap.val();
    if (!data) return;

    // MODE
    document.getElementById("modeStatus").innerText = data.mode;

    // APPLIANCES
    document.getElementById("fanStatus").innerText = data.fan;
    document.getElementById("lightStatus").innerText = data.light;
    document.getElementById("pirLightStatus").innerText = data.pirLight;

    // SENSOR VALUES
    document.getElementById("tempVal").innerText = data.sensors.temperature;
    document.getElementById("lightVal").innerText = data.sensors.light;
    document.getElementById("motionVal").innerText = data.sensors.motion;
    document.getElementById("gasVal").innerText = data.sensors.gas;

    // AI MESSAGE
    document.getElementById("aiStatus").innerText = data.ai;

    // AUTO MODE LOGIC (works now)
    if (data.mode === "AUTO") {
        runAIMode(data);
    }
});


// ------------------------------------------------------
// AUTO MODE AI LOGIC
// ------------------------------------------------------
function runAIMode(data) {

    const temp = data.sensors.temperature;
    const light = data.sensors.light;
    const motion = data.sensors.motion;
    const gas = data.sensors.gas;

    // GAS CHECK
    if (gas > 800) {
        set(ref(db, 'fan'), "OFF");
        set(ref(db, 'light'), "OFF");
        set(ref(db, 'pirLight'), "OFF");
        set(ref(db, 'ai'), "⚠ GAS detected → All OFF");
        return;
    }

    // TEMP LOGIC
    if (temp > 35) {
        set(ref(db, 'fan'), "ON");
        set(ref(db, 'ai'), "High temp → Fan ON");
    } else {
        set(ref(db, 'fan'), "OFF");
    }

    // LDR LOGIC
    if (light == 0) {
        set(ref(db, 'light'), "ON");
    } else {
        set(ref(db, 'light'), "OFF");
    }

    // PIR LOGIC
    if (motion == 1) {
        set(ref(db, 'pirLight'), "ON");
    } else {
        set(ref(db, 'pirLight'), "OFF");
    }
}


// ------------------------------------------------------
// MANUAL BUTTONS
// ------------------------------------------------------
window.setFan = (s) => set(ref(db, 'fan'), s);
window.setLight = (s) => set(ref(db, 'light'), s);
window.setPirLight = (s) => set(ref(db, 'pirLight'), s);
window.setMode = (s) => {
    set(ref(db, 'mode'), s);
    set(ref(db, 'ai'), "Mode switched to " + s);
};

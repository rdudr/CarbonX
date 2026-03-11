/**
 * CarbonX Firebase Telemetry Pusher
 * --------------------------------
 * This script pushes mock industrial telemetry packets to your 'AI_Logs' collection.
 * 
 * SETUP:
 * 1. Go to Firebase Console -> Project Settings -> Service Accounts.
 * 2. Click "Generate new private key" and save it as 'serviceAccountKey.json' in this folder.
 * 3. Run: npm install firebase-admin
 * 4. Run: node scripts/push-telemetry.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(keyPath)) {
    console.error('\x1b[31m%s\x1b[0m', 'CRITICAL ERROR: serviceAccountKey.json is missing!');
    console.log('\n\x1b[36m%s\x1b[0m', 'INSTRUCTIONS:');
    console.log('1. Go to Firebase Console -> Project Settings -> Service Accounts');
    console.log('2. Click "Generate new private key"');
    console.log(`3. Save the downloaded JSON as 'serviceAccountKey.json' in: ${__dirname}`);
    console.log('4. Run this script again.\n');
    process.exit(1);
}

const serviceAccount = require(keyPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://techfusion-930cf-default-rtdb.firebaseio.com"
});

const db = admin.firestore();
const rtdb = admin.database();

const kwhAccumulator = {}; // Simple in-memory tracker

async function pushMockData() {
    const nodeIds = ["D-001", "D-002", "TX-1", "D-003"]; // Matching config
    const nodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    const zones = ["Zone-A", "Zone-B"];

    if (!kwhAccumulator[nodeId]) kwhAccumulator[nodeId] = Math.random() * 500;

    // Simulate consumption
    const power = parseFloat((Math.random() * 40 + 5).toFixed(2));
    kwhAccumulator[nodeId] += (power / 3600) * 5; // 5 seconds worth of kwh

    const r_a = parseFloat((power / 3).toFixed(2));
    const y_a = parseFloat((power / 3 + 0.5).toFixed(2));
    const b_a = parseFloat((power / 3 - 0.2).toFixed(2));

    const packet = {
        nodeId: nodeId,         // Identification
        R_V: Math.floor(220 + Math.random() * 5),
        Y_V: Math.floor(221 + Math.random() * 5),
        B_V: Math.floor(219 + Math.random() * 5),
        R_A: r_a,
        Y_A: y_a,
        B_A: b_a,
        Temp: parseFloat((35 + Math.random() * 20).toFixed(1)),
        CO2: 400 + Math.floor(Math.random() * 250),
        Vib: Math.random() > 0.9 ? "HIGH" : "NORM",
        Time: new Date().toISOString(),
        kwh: parseFloat(kwhAccumulator[nodeId].toFixed(3)),
        kvarh: parseFloat((kwhAccumulator[nodeId] * 0.15).toFixed(3)),
        status: "OPERATIONAL"
    };

    try {
        // --- 1. Firestore Push ---
        await db.collection('AI_Logs').add(packet);

        // --- 2. Realtime Database Push ---
        await rtdb.ref('AI_Logs').push(packet);

        console.log(`[${new Date().toLocaleTimeString()}] Industrial Sync (Firestore & RTDB): ${nodeId} | ${packet.CO2}PPM | ${packet.R_V}V | ${packet.R_A}A`);
    } catch (error) {
        console.error("Firebase Sync Error:", error);
    }
}

// Push a packet every 5 seconds
console.log("CarbonX Telemetry Pusher Started...");
setInterval(pushMockData, 5000);

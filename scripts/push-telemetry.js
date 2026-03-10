/**
 * CarbonX Firebase Telemetry Pusher
 * --------------------------------
 * This script pushes mock industrial telemetry packets to your 'ai_logs' collection.
 * 
 * SETUP:
 * 1. Go to Firebase Console -> Project Settings -> Service Accounts.
 * 2. Click "Generate new private key" and save it as 'serviceAccountKey.json' in this folder.
 * 3. Run: npm install firebase-admin
 * 4. Run: node scripts/push-telemetry.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function pushMockData() {
    const nodeId = "TX-" + Math.floor(Math.random() * 5 + 1);
    const zones = ["Zone-A", "Zone-B", "Zone-C"];

    const packet = {
        timestamp: new Date().toISOString(),
        node_id: nodeId,
        zone: zones[Math.floor(Math.random() * zones.length)],
        telemetry: {
            active_power_kw: parseFloat((Math.random() * 50 + 10).toFixed(2)),
            voltage_l1: 400 + (Math.random() - 0.5) * 5,
            power_factor: parseFloat((0.85 + Math.random() * 0.15).toFixed(2)),
            temperature_c: parseFloat((40 + Math.random() * 30).toFixed(1))
        },
        health_score: Math.floor(Math.random() * 20 + 80),
        status: Math.random() > 0.95 ? "WARNING" : "OPERATIONAL",
        alerts: []
    };

    try {
        const res = await db.collection('ai_logs').add(packet);
        console.log(`[${new Date().toLocaleTimeString()}] Packet pushed successfully: ${res.id} (${nodeId})`);
    } catch (error) {
        console.error("Error pushing packet:", error);
    }
}

// Push a packet every 5 seconds
console.log("CarbonX Telemetry Pusher Started...");
setInterval(pushMockData, 5000);

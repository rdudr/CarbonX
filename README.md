# CarbonX PowerByte

**CarbonX PowerByte** is an AI-Driven Industrial IoT Platform designed to monitor energy usage, carbon footprint, and machine health in industrial environments. The platform helps industries reduce carbon emissions and improve energy efficiency through real-time monitoring, predictive analytics, and AI-based anomaly detection.

## Key Features

1. **RX-TX Architecture**: Scales from individual machines (TX nodes) to plant-wide gateways (RX nodes).
2. **Machine Performance Analysis**: Phase-level power and energy calculation for each connected machine.
3. **RX Level Energy Monitoring**: Aggregates TX data to detect hidden energy losses or leaks across the plant.
4. **AI Machine Health Score**: Calculates a comprehensive 0-100 health score based on voltage/current stability, vibration, and temperature.
5. **AI Performance Analysis**: Uses XGBoost Regressors to forecast future energy consumption and machine failures natively over a 24-hr/7-day horizon.
6. **Data Export & Reporting**: Provides CSV, PDF, and Excel reports on machine performance and AI-ready datasets for training ML models.

## Technology Stack

*   **Frontend**: Next.js, Tailwind CSS, shadcn/ui.
*   **Design Language**: Glassmorphism / Liquid Glass (Colors: `#F7F0F0`, `#25671E`, `#48A111`, `#F2B50B`).
*   **Backend**: Node.js & Express.
*   **Database**: Firebase Realtime Database (streaming) & MongoDB (historical).
*   **IoT Protocol**: MQTT (ESP32 Nodes).
*   **AI Engine**: Python (Scikit-Learn, XGBoost).

## Installation

*(Coming Setup Instructions...)*

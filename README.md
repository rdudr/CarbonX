# CarbonX 

CarbonX is an **AI-Driven Industrial IoT Platform** deployed in Next.js using a responsive **Liquid Glass UI**. It is designed to monitor **energy usage, carbon footprint, and machine health** in industrial environments using an RX (Gateway) and TX (Node) architecture.

## Project Description & Features

1. **RX-TX Architecture**: Scales from individual machines (TX nodes) to plant-wide gateways (RX nodes).
2. **Machine Performance Analysis**: Phase-level power calculations for predictive monitoring.
3. **RX Level Energy Monitoring**: Aggregates TX data to detect hidden energy losses or leaks across the plant.
4. **AI Machine Health Score**: Calculates a 0-100 health score dynamically based on power, voltage, and environment stability.
5. **AI Performance Analysis**: Uses regression modeling (mocked on frontend via Recharts) to forecast future energy consumption and machine failures over a 24-hr/7-day horizon.
6. **Data Export & Reporting**: Provides simulated API endpoints (/api/export) for downloading AI-ready CSV datasets and PDF Health Reports.
7. **Responsive Liquid Glass UI**: Custom Dashboard styled with Shadcn elements and a translucent glass UI featuring the requested `#25671E`, `#48A111`, `#F2B50B`, and `#F7F0F0` aesthetic palette.

## Getting Started

1. Clone Repository: `git clone https://github.com/rdudr/CarbonX.git`
2. Install Dependencies: `npm install`
3. Start the Next.js Client: `npm run dev`
4. Access the Dashboard at: `http://localhost:3000`

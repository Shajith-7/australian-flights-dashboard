# ✈️ Australian Flights Explorer Dashboard

An interactive, high-performance web dashboard designed to visualize historical airline traffic data across Australia. Built using modern React tools, this project transforms raw CSV records into an intuitive, filterable graphical interface.

![Australian Flights Dashboard](https://via.placeholder.com/800x450.png?text=Australian+Flights+Dashboard+Preview) <!-- Note: Replace with a real screenshot once you upload one to GitHub! -->

## ✨ Features

- **Dynamic Date Filtering**: Select specific "Start" and "End" months to instantly recalculate all KPIs and re-render every chart on the screen.
- **Interactive Visualizations**: 
  - Smooth **Area Charts** tracking historical flight volume over time.
  - Categorical **Bar Charts** ranking the Top 10 Airlines and Busiest Australian Domestic Hubs.
  - Regional **Bar Charts** detailing the top international connection regions.
  - A comprehensive **Donut Chart** splitting inbound versus outbound traffic.
- **Custom Aesthetic**: A "Dark Mode Glassmorphism" UI built purely with custom CSS Grid and Flexbox variables—no heavy UI libraries attached.
- **Backend Optimization Pipeline**: Includes a custom Node.js script utilizing read-streams to process massive CSV files into a lightweight, pre-aggregated JSON structure to ensure lightning-fast dashboard loads.

## 🛠️ Technology Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite (for optimized HMR and production bundling)
- **Charting Library**: Recharts
- **Icons**: Lucide React
- **Data Preprocessing**: Node.js (`fs`, `readline` streams)
- **Styling**: Vanilla CSS3 (Custom Variables & Keyframe Animations)

## 🚀 Getting Started

### Prerequisites

You must have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shajith-7/australian-flights-dashboard.git
   cd australian-flights-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **View the Application:**
   Open your browser and navigate to `http://localhost:5173` or the port provided in your terminal.

## 🗃️ Data Source

The dashboard relies on an aggregated `.json` file generated from a larger historical Australian flights dataset. The aggregation script (`aggregate.mjs`) is included in the root directory to demonstrate how the raw data streams were processed and grouped by time period for the frontend application.

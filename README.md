# 🏙️ CityPulse AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/)

An AI-first urban "pulse" analysis system that transforms Google's 3D city model of Kuala Lumpur into a living sustainability dashboard at the address level. CityPulse AI addresses critical visibility, decision, and trust gaps in urban environmental data by making risks like heat exposure and flooding as easy to see and act on as traffic conditions on Google Maps today.

![CityPulse AI Demo](./demo.gif)
_(**Note:** It is highly recommended to add a screen recording or GIF of your application in action here and name it `demo.gif` in your repository.)_

---

## 1. Technical Implementation Overview

This project is a full-stack web application built on a modern JavaScript framework, leveraging a comprehensive suite of Google's AI and geospatial technologies to deliver a real-time, interactive user experience.

#### **1.1 Core Technologies Used**

- **Frontend:**
  - **Framework:** [Next.js](https://nextjs.org/) with [React](https://reactjs.org/) for building a responsive, server-rendered user interface.
  - **Mapping:** [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript) using a Vector Map ID and Photorealistic 3D Tiles for the immersive city model.
  - **Data Visualization:** [Deck.gl](https://deck.gl/) for high-performance, WebGL-accelerated rendering of analytical data layers (heatmaps, scatterplots) on top of the base map.

- **Backend (Next.js App Router API Routes):**
  - The backend is built entirely within the Next.js framework using stateless API Routes. This server-side environment orchestrates calls to all Google APIs, manages API keys securely, and normalizes data before sending it to the client.

- **Google AI and Developer Tech Used:**
  - **Google Maps Platform (Data & Geospatial Backbone):**
    - `Maps JavaScript API` (Vector map rendering)
    - `Elevation API` (Topographic analysis & basin depth calculation)
    - `Weather API` (Real-time temperature, wind, and precipitation probability)
    - `Air Quality API` (Pollution indicators for the thermal modifier)
    - `Solar API` (Building Insights for renewable energy potential)
    - `Street View Static API & Metadata` (Street-level visual context)
    - `Maps Static API` (Satellite imagery context)
    - `Geocoding API` (Reverse geocoding for user interactions)
  - **Google AI:**
    - `Gemini Flash-lite`: The core AI engine, used for its multimodal capabilities. It handles two distinct tasks: a quick analysis based on Street View imagery and a full, multimodal report generation combining imagery and structured data.

#### **1.2 System Architecture**

The architecture is designed with two key principles: responsive client-side visualization and server-orchestrated data. The frontend focuses purely on rendering and interaction, while the backend centralizes API key handling, data fetching, and normalization. This prevents exposing API keys on the client and reduces cross-origin complexity.

## 2. Explanation of Implementation, Innovation, and Challenges

#### 2.1 Implementation Details

The system's core logic is divided into several data pipelines that generate the analytical layers and AI reports.

- **Thermal Heatmap Pipeline:** The `/api/thermal-grid` endpoint generates a `12x12` grid of jittered points around the user's target location. It makes a single call to the Weather API to get the ambient temperature and a batch call to the Elevation API for all 144 points. On the frontend, a final "heat weight" is computed for each point by combining its elevation (lower areas are hotter) with modifiers from real-time weather (temperature, wind) and air quality data.

- **Flood Heatmap Pipeline:** This pipeline provides a _relative inundation susceptibility proxy_. The backend calls the Weather API to get the current precipitation probability, which modulates the flood severity. It then generates a `20x20` grid and computes the "relative basin depth" for each point by finding the difference between the maximum elevation in the grid and the point's own elevation. The final weight is a function of this squared depth, amplifying deeper basins.

- **Solar Potential Pipeline:** The `/api/solar-grid` endpoint calls the Google Solar API's `buildingInsights:findClosest` endpoint on a grid around the target location. It deduplicates the returned buildings by their identifiers and sends a list of valid solar candidates to the frontend for rendering as a scatterplot.

- **Multimodal AI Analysis:** The `/api/analyze` and `/api/generate-report` endpoints are the AI core. The `analyze` endpoint provides a rapid assessment using only a Street View image, returning a 4-key JSON with scores. The `generate-report` endpoint is fully multimodal, feeding Gemini a combination of Street View imagery, satellite imagery, and structured numeric data (like AQI, wind speed, and flood probability) to generate a comprehensive, structured JSON report.

#### 2.2 Innovation

The project's innovation lies in several key areas that combine to create a novel user experience:

1.  **Lightweight Environmental Proxy Models:** Instead of relying on complex and slow hydrological or meteorological models, CityPulse AI uses clever, real-time proxies. For example, flood risk is modeled as a function of _topography and live rain probability_, and heat risk is modeled as a function of _elevation and live weather_. This is what makes the near-real-time interactivity possible.

2.  **Structured AI Output for UI Consumption:** The Gemini prompts are explicitly designed to return machine-readable **JSON** (scores, risks, recommendations) rather than unstructured text. This is a crucial engineering decision that enables a consistent, reliable UI presentation and allows for future extensions without needing to parse natural language on the frontend.

3.  **Human-Centric Data Visualization:** Several UX-focused innovations were implemented based on user feedback. The backend uses **stochastic jittering** to transform rigid data grids into an organic "thermal cloud." The frontend uses **adaptive opacity and thresholding** on heatmaps to prevent visual overload and ensure 3D building textures remain visible for spatial orientation.

#### 2.3 Challenges Faced

The primary technical challenge encountered was a critical performance issue when integrating Deck.gl with Google Maps Photorealistic 3D Tiles.

- **The Challenge:** When both Deck.gl and the Google Maps 3D Tiles engine were active, they attempted to "interleave" their rendering operations on the same WebGL context. This led to a `WebGL: INVALID_OPERATION: drawBuffers` error, as they conflicted over memory buffer attachments. The browser would hang, and the frame rate would drop to under 5fps, making the application unusable.

- **Technical Decision & Resolution:** The critical decision was to disable interleaving by setting `interleaved: false` in the `GoogleMapsOverlay` configuration. This forced the browser to create a separate, synchronized WebGL canvas specifically for the Deck.gl data layers. While this required more complex manual synchronization code to keep the layers perfectly aligned during camera movements, it permanently resolved the hardware-level conflict and eliminated the system lag, restoring a consistent 60fps experience.

```

```

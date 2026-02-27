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

<details>
<summary>Click to expand Architecture Diagram</summary>

```mermaid
graph TD
    subgraph Frontend
        A[User] --> B{Next.js Frontend\nReact + Google Maps JS + Deck.gl};
    end

    subgraph Backend (Next.js API Routes)
        B -- user triggers --> C[/api/thermal-grid];
        B -- user triggers --> D[/api/flood-grid];
        B -- user triggers --> E[/api/solar-grid];
        B -- user triggers --> F[/api/analyze];
        B -- user triggers --> G[/api/generate-report];
    end

    subgraph Google_APIs [Google Developer Platform]
        C --> H1[Google Weather API];
        C --> H2[Google Air Quality API];
        C --> H3[Google Elevation API];

        D --> I1[Google Weather API];
        D --> I2[Google Elevation API];

        E --> J[Google Solar API];

        F --> K1[Street View API];
        F --> K2[Gemini Flash-lite];

        G --> L1[Street View API];
        G --> L2[Maps Static API];
        G --> L3[Gemini Flash-lite];
    end

    subgraph Visualizations
        H3 --> V1[Deck.gl Heatmap - Thermal];
        I2 --> V2[Deck.gl Heatmap - Flood];
        J --> V3[Deck.gl Scatterplot - Solar];
        K2 --> V4[Quick Analysis Panel];
        L3 --> V5[Full Report UI];
    end

    subgraph Caching
        CACHE[localStorage\nbbox-based cache];
        C --> CACHE;
        D --> CACHE;
        B <--> CACHE;
    end

    style User fill:#f9f,stroke:#333,stroke-width:2px
    style Frontend fill:#bbf,stroke:#333,stroke-width:2px
    style Backend fill:#9f9,stroke:#333,stroke-width:2px
    style Google_APIs fill:#fca,stroke:#333,stroke-width:2px
</details>
2. Explanation of Implementation, Innovation, and Challenges
2.1 Implementation Details
The system's core logic is divided into several data pipelines that generate the analytical layers and AI reports.
Thermal Heatmap Pipeline: The /api/thermal-grid endpoint generates a 12x12 grid of jittered points around the user's target location. It makes a single call to the Weather API to get the ambient temperature and a batch call to the Elevation API for all 144 points. On the frontend, a final "heat weight" is computed for each point by combining its elevation (lower areas are hotter) with modifiers from real-time weather (temperature, wind) and air quality data.
Flood Heatmap Pipeline: This pipeline provides a relative inundation susceptibility proxy. The backend calls the Weather API to get the current precipitation probability, which modulates the flood severity. It then generates a 20x20 grid and computes the "relative basin depth" for each point by finding the difference between the maximum elevation in the grid and the point's own elevation. The final weight is a function of this squared depth, amplifying deeper basins.
Solar Potential Pipeline: The /api/solar-grid endpoint calls the Google Solar API's buildingInsights:findClosest endpoint on a grid around the target location. It deduplicates the returned buildings by their identifiers and sends a list of valid solar candidates to the frontend for rendering as a scatterplot.
Multimodal AI Analysis: The /api/analyze and /api/generate-report endpoints are the AI core. The analyze endpoint provides a rapid assessment using only a Street View image, returning a 4-key JSON with scores. The generate-report endpoint is fully multimodal, feeding Gemini a combination of Street View imagery, satellite imagery, and structured numeric data (like AQI, wind speed, and flood probability) to generate a comprehensive, structured JSON report.
2.2 Innovation
The project's innovation lies in several key areas that combine to create a novel user experience:
Lightweight Environmental Proxy Models: Instead of relying on complex and slow hydrological or meteorological models, CityPulse AI uses clever, real-time proxies. For example, flood risk is modeled as a function of topography and live rain probability, and heat risk is modeled as a function of elevation and live weather. This is what makes the near-real-time interactivity possible.
Structured AI Output for UI Consumption: The Gemini prompts are explicitly designed to return machine-readable JSON (scores, risks, recommendations) rather than unstructured text. This is a crucial engineering decision that enables a consistent, reliable UI presentation and allows for future extensions without needing to parse natural language on the frontend.
Human-Centric Data Visualization: Several UX-focused innovations were implemented based on user feedback. The backend uses stochastic jittering to transform rigid data grids into an organic "thermal cloud." The frontend uses adaptive opacity and thresholding on heatmaps to prevent visual overload and ensure 3D building textures remain visible for spatial orientation.
2.3 Challenges Faced
The primary technical challenge encountered was a critical performance issue when integrating Deck.gl with Google Maps Photorealistic 3D Tiles.
The Challenge: When both Deck.gl and the Google Maps 3D Tiles engine were active, they attempted to "interleave" their rendering operations on the same WebGL context. This led to a WebGL: INVALID_OPERATION: drawBuffers error, as they conflicted over memory buffer attachments. The browser would hang, and the frame rate would drop to under 5fps, making the application unusable.
Technical Decision & Resolution: The critical decision was to disable interleaving by setting interleaved: false in the GoogleMapsOverlay configuration. This forced the browser to create a separate, synchronized WebGL canvas specifically for the Deck.gl data layers. While this required more complex manual synchronization code to keep the layers perfectly aligned during camera movements, it permanently resolved the hardware-level conflict and eliminated the system lag, restoring a consistent 60fps experience.
3. Scalability and Next Steps
The current architecture is designed to be scalable and extensible.
Scaling: The backend is entirely stateless, allowing for seamless horizontal scaling on serverless platforms like Vercel or Google Cloud Run. The frontend uses localStorage bounding-box caching to prevent redundant API calls for previously viewed areas.
Future Steps / Expansion:
Asynchronous AI Processing: Transition the Gemini report generation to a WebSockets or Server-Sent Events (SSE) stream to improve perceived performance by streaming the JSON report token-by-token.
Integration of More Dynamic Layers: Expand the backend to ingest real-time local data (e.g., live traffic, localized flood sensors) via Google Cloud Pub/Sub.
Personalized Routing: Utilize the Google Routes API to allow users to navigate through the city using "heat-optimized" or "low-flood-risk" pathways based on the computed data layers.
4. Getting Started
Follow these steps to set up and run the project locally.
4.1 Prerequisites
Node.js (v18.0 or later)
npm, yarn, or pnpm
A Google Cloud Platform project with the required APIs enabled.
4.2 Installation
Clone the Repository
code
Bash
git clone https://github.com/your-username/citypulse-ai.git
cd citypulse-ai
Install Dependencies
code
Bash
npm install
4.3 Configuration
Create a file named .env.local in the root of the project.
Enable the following APIs in your Google Cloud project:
Maps JavaScript API
Elevation API
Weather API
Air Quality API
Solar API
Vertex AI API (for Gemini)
Add your API keys and project details to the .env.local file:
code
Code
# .env.local

# Google Maps Platform API Key (for client-side JS API)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_MAPS_API_KEY"

# Google Cloud Project ID (for server-side APIs)
GOOGLE_PROJECT_ID="YOUR_GOOGLE_CLOUD_PROJECT_ID"

# Gemini API Key (ensure the Vertex AI API is enabled)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
4.4 Running the Development Server
code
Bash
npm run dev
Open http://localhost:3000 with your browser to see the result.
5. License
This project is licensed under the MIT License - see the LICENSE file for details.
6. Acknowledgements
This project is built entirely on the powerful and integrated ecosystem of Google Developer Tech.
Special thanks to the teams behind Next.js, React, and Deck.gl for their incredible open-source tools.
```

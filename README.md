# 🏙️ CityPulse AI | Urban Data Engine

**KitaHack 2026 — Addressing SDG 3 (Health), 11 (Sustainable Cities), and 13 (Climate Action)**

CityPulse AI is an AI-first urban intelligence system that transforms Google’s 3D city model into a living sustainability dashboard. By visualizing "invisible" environmental risks—such as the Urban Heat Island effect and topographical flood basins—we provide citizens and planners with the data needed to build a more resilient city.

## 🏗️ 1. Technical Architecture

The system utilizes a **Decoupled Full-Stack Architecture** designed for high performance and high-fidelity geospatial visualization.

## 🖥️ Frontend (Rendering Engine)

- Built with **Next.js 15** and **Tailwind CSS v4**
- Uses **Deck.gl** for high-resolution geospatial overlays
- Renders on **Google Maps Photorealistic 3D Tiles** via WebGL
- Provides real-time, interactive environmental visualization

---

## ⚙️ Backend (Data Orchestration Layer)

- Stateless **Next.js App Router API**
- Handles:
  - Server-side data fetching
  - API key protection
  - Data normalization & aggregation
- Designed for scalability and low-latency batch processing

---

## 🧠 Intelligence Layer

- **Gemini 1.5 Pro** performs multimodal vision analysis and environmental reasoning
- **Google Maps Environment APIs** provide scientific ground truth data
- Outputs structured JSON insights for frontend visualization

## 🛠️ 2. Implementation Details

---

## 2.1 Core Data Pipelines & Scientific Logic

Instead of relying on static layers, our engine performs **Real-Time Data Fusion** to dynamically generate environmental risk models.

---

### 🌡️ Thermal Pulse (SDG 11)

Performs a **144-node topographical scan** to calculate localized heat stagnation:

\[
W*{thermal} = \frac{T*{ambient}}{10} + (H*{max} - H*{point}) \times 0.5
\]

**Where:**

- \(T\_{ambient}\) = Real-time temperature from Google Weather API
- \(H\_{max}\) = Maximum elevation in scan radius
- \(H\_{point}\) = Elevation at selected coordinate (Google Elevation API)

This models micro heat traps caused by terrain variation and thermal mass accumulation.

---

### 🌊 Flood Guardian (SDG 11)

A hydrological vulnerability model that detects **Topographical Depressions (Basins)** and scales risk using live precipitation data:

\[
W*{flood} = (H*{max} - H*{point})^2 \times \left(1 + \frac{P*{rain}}{50}\right)
\]

**Where:**

- \(H\_{max}\) = Highest elevation in local radius
- \(H\_{point}\) = Ground elevation at target coordinate
- \(P\_{rain}\) = Precipitation probability (Google Weather API)

This amplifies flood risk in low-lying areas during high rainfall probability.

---

### ☀️ Solar Goldmine (SDG 13)

- Integrates the **Google Solar API**
- Performs high-resolution rooftop geometry analysis
- Calculates projected annual **RM savings** based on local energy tariffs
- Generates ROI insights for homeowners

---

### 🧠 Multimodal AI Audit (SDG 3)

- Combines **Google Street View Static API**
- Processes imagery using **Gemini 1.5 Pro**
- AI analyzes urban fabric (walkability, shading, density, infrastructure condition)
- Outputs a structured environmental & safety scorecard

---

## 2.2 Impact (Cause and Effect)

### 🌞 Renewable Energy Adoption (SDG 13)

**Cause:**  
Providing real-time RM savings projections via the Google Solar API.

**Effect:**  
Reduces the _information gap_ for homeowners, increasing measurable intent to transition to renewable energy.

---

### 🌳 Targeted Urban Cooling (SDG 11)

**Cause:**  
Visualizing "Critical" heat zones through topographical synthesis.

**Effect:**  
Empowers city councils to prioritize urban greening (tree planting and cooling corridors) in high thermal-mass zones.

## 🧪 3. Feedback, Testing & Iteration

Conducted usability testing with **5 university students and local residents** using the **“Think Aloud” protocol**.

---

### 🎨 Feedback: Visual Overload

**Issue:**  
High-intensity heatmaps were overwhelming. Solid color overlays obscured 3D buildings, reducing spatial orientation.

**Implementation:**  
Developed a **Dynamic Transparency Engine** with a noise-gate threshold to preserve architectural textures while maintaining data clarity.

---

### 🟦 Feedback: Robotic Patterns

**Issue:**  
Thermal layers appeared in rigid square grids, making the visualization feel artificial and computer-generated.

**Implementation:**  
Introduced **Backend Stochastic Jittering** within API routes to generate organic, cloud-like thermal diffusion patterns.

---

### ⚡ Feedback: Performance Stutter (Lag)

**Issue:**  
3D map panning with active overlays caused frame drops on standard laptops.

**Implementation:**

- Implemented **BBox (Bounding Box) Caching** via `localStorage`
- Throttled React state updates
- Optimized rendering pipeline to maintain a consistent **60 FPS experience**

---

## 🚧 4. Technical Challenges & Decisions

### **Challenge 1: The WebGL Context Conflict (Graphics)**

Integrating **Deck.gl** with **Google Maps Photorealistic 3D Tiles** initially caused a critical `WebGL: INVALID_OPERATION: drawBuffers` error. Because both engines attempted to "interleave" (sharing the same GPU render loop), they conflicted over memory buffer attachments. This led to a significant performance degradation, dropping the frame rate from 60 FPS to under 5 FPS and occasionally causing the browser to hang.

- **Resolution:** I made the strategic decision to set `interleaved: false` in our `GoogleMapsOverlay` configuration. This forced the browser to create a separate, synchronized WebGL canvas specifically for our data layers, effectively isolating the memory pools. To maintain visual sync, I implemented custom state-throttling logic to ensure the data overlays perfectly followed the 3D terrain during high-speed camera movements.

### **Challenge 2: AI Output Integrity & Imagery Resilience (AI)**

We encountered two major hurdles with the **Gemini 1.5 Pro** integration. First, the AI frequently included conversational markdown text and backticks (e.g., ` ```json `) instead of a pure JSON object, which crashed the frontend parser. Second, many residential coordinates in Malaysia lacked immediate Street View coverage, resulting in "404 Not Found" errors for the AI's visual input.

- **Resolution:**
  1.  **Regex Extraction Engine:** I implemented a backend extraction layer using Regular Expressions (`/\{[\s\S]*\}/`) to isolate valid JSON strings from the AI's response before parsing.
  2.  **Recursive Radius Expansion:** I developed an automated "scouting" algorithm that probes the **Street View Metadata API** in expanding circles (from 0m to 6.4km). This ensures the engine always locates the nearest valid outdoor imagery to analyze, preventing the AI audit from failing in low-coverage or rural areas.

## 🗺️ 5. Future Roadmap

- **Asynchronous AI Processing**: Transition Gemini report generation to Server-Sent Events (SSE) to stream results token-by-token for lower perceived latency.
- **Real-time Sensor Ingestion**: Integrate Google Cloud Pub/Sub to ingest live traffic and localized flood sensor data from local authorities.
- **Heat-Optimized Wayfinding**: Utilize the Google Routes API to provide "cool-path" navigation, helping pedestrians avoid high-heat-mass streets.

## 🚀 6. Getting Started

### 6.1 Prerequisites

- **Node.js**: v20.x or later
- **Google Cloud Project**: Enable Maps JS, Map Tiles, Solar, Weather, Air Quality, and Elevation APIs.

### 6.2 Installation

```bash
git clone https://github.com/your-username/citypulse-ai.git
cd citypulse-ai
npm install --legacy-peer-deps
npm run dev
```

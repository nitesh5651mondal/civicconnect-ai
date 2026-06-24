# CivicConnect AI 🏙️

> AI-powered civic issue reporting and tracking system. Upload a photo, let AI identify the problem, auto-assign the right department, and track resolution — all in one place.

![CivicConnect AI](https://img.shields.io/badge/CivicConnect-AI--Powered-1D9E75?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## 🚩 Problem Statement

Citizens face significant delays and frustration when reporting civic issues such as:

- 🕳️ Potholes and road damage
- 💡 Broken streetlights
- 🗑️ Garbage accumulation
- 💧 Water leakage and pipe bursts
- 🚽 Sewage overflows
- 🌳 Fallen trees / road obstructions

Existing municipal complaint systems are **slow, fragmented, non-transparent**, and require citizens to manually identify the correct department — a process prone to errors and delays.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 📸 **Photo upload** | Drag-and-drop or click to upload a photo of the civic issue |
| 🤖 **AI issue detection** | AI analyzes the image filename and description to auto-identify the problem type |
| 🏢 **Auto department routing** | Automatically assigns the complaint to the correct municipal department |
| 📊 **Priority scoring** | AI generates a priority score (1–10) based on issue type and reported severity |
| 📍 **Complaint tracking** | Citizens can track complaint status: Pending → In Progress → Resolved |
| 🔍 **Search & filter** | Filter by status (Pending / In Progress / Resolved) and search by ID, area, or category |
| 📈 **Admin dashboard** | Real-time stats, category breakdown charts, resolution rates, and AI-generated insights |
| 📱 **Mobile responsive** | Fully responsive design — works on phones, tablets, and desktops |
| 🌙 **Clean UI** | Minimal, accessible civic-green design with DM Sans typography |

---

## 🗂️ Project Structure

```
civicconnect/
├── index.html          ` Main application (single-page)
├── css/
│   └── style.css       ~ All styling — responsive, accessible
├── js/
│   ├── data.js         ~ AI routing engine, complaint data, utility functions
│   └── app.js          ~ Application logic — tabs, upload, AI, modal, toast
└── README.md
```

---

## 🚀 Getting Started

### Option 1 — Open directly
Just open `index.html` in any modern browser. No server required.

```bash
git clone https://github.com/nitesh5651mondal/civicconnect-ai.git
cd civicconnect-ai
open index.html   # macOS
# or double-click index.html on Windows/Linux
```

### Option 2 — Live Server (VS Code)
1. Install the **Live Server** extension in VS Code
2. Right-click `index.html` → **Open with Live Server**

### Option 3 — GitHub Pages (free hosting)
1. Push to GitHub
2. Go to repo → **Settings → Pages**
3. Set source to `main` branch, root `/`
4. Your app is live at `https://nitesh5651mondal.github.io/civicconnect-ai/`

---

## 🤖 How the AI Engine Works

The AI routing system (`js/data.js`) uses a **keyword matching + scoring algorithm**:

1. **Issue detection** — Scans the image filename and text description for keywords mapped to issue types (e.g. "pothole", "crack", "road" → `pothole` category)
2. **Department routing** — Each issue type maps to a municipal department with a standard routing table
3. **Priority scoring** — Base score per issue type × severity multiplier (0.6× for minor → 1.35× for critical)
4. **ETA estimation** — Department-specific expected resolution windows
5. **Similar complaint clustering** — Random nearby report count (in production: geospatial query)

**In production**,

```javascript

---

## 🏛️ AI Routing Table

| Issue Type | Department | Base Priority | Avg ETA |
|-----------|------------|---------------|---------|
| Pothole / Road damage | PWD – Roads & Infrastructure | 8.2 | 2–4 days |
| Broken streetlight | Municipal Electrical Dept | 6.4 | 3–5 days |
| Garbage accumulation | Sanitation & Solid Waste | 7.0 | 1–2 days |
| Water leakage | JWSSB – Water Supply Wing | 8.5 | 1–3 days |
| Sewage overflow | JWSSB – Sewage & Drainage | 9.3 | 4–24 hrs |
| Fallen tree / debris | Horticulture & Parks Dept | 8.8 | 2–8 hrs |
| Illegal dumping | Enforcement & Sanitation | 5.8 | 3–5 days |
| Other | Municipal Control Room | 4.0 | 5–7 days |

---

## 📱 Screenshots

| Report Issue | Track Complaints | Dashboard |
|-------------|-----------------|-----------|
| Upload photo, AI analyzes | Search/filter all reports | Stats, charts, AI insights |

---

## 🔮 Roadmap / Production Additions

- [ ] **Backend API** — Node.js / Python FastAPI with PostgreSQL
- [ ] **Real Claude Vision** — Actual AI image classification
- [ ] **Maps integration** — Google Maps / Leaflet for geotagged complaints
- [ ] **OTP auth** — Citizen login via phone number
- [ ] **Push notifications** — SMS/WhatsApp status updates via Twilio
- [ ] **Officer portal** — Department dashboards with complaint management
- [ ] **Mobile app** — React Native wrapper
- [ ] **Multi-language** — Hindi, regional language support

---

## 🤝 Contributing

Pull requests welcome! Please open an issue first to discuss what you'd like to change.

```bash
git clone https://github.com/nitesh5651mondal/civicconnect-ai.git
cd civicconnect-ai
# Make your changes
git commit -m "feat: add XYZ"
git push origin main
```

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 👤 Author

~ Nitesh Mondal

Built with ❤️ using HTML, CSS, JavaScript, and AI assistance.

> "Every city's problems are solvable. The bottleneck is reporting them fast and routing them right."

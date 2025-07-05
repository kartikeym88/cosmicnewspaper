
# 🪐 The Cosmic Times

_A Daily Digital Newspaper of Space History – Brought to You by ZENCODERS_

**“On This Day, But Make It Cosmic”**  
The Cosmic Times is a dynamic, interactive, and gamified web app that brings space history to life in the style of a retro-futuristic newspaper. Each day gets its own digital edition, packed with images, rocket launches, space milestones, and more.

---

## 🚀 Features

- **Front Page Headline**: NASA’s Astronomy Picture of the Day (APOD)
- **Launch Reports**: Rockets, missions, and agencies launched on that day
- **Space Discoveries and Milestones**: Space-related historical events via Wikipedia
- **Gamification**: A game to make space exploration fun and habit-forming
- **Quiz**: To make learning interactive and fun while testing knowledge
---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/the-cosmic-times.git
cd the-cosmic-times
```

### 2. Install Dependencies
If you're using a bundler like Vite or Webpack:
```bash
npm install
```

### 3. Add API Keys
Create a `.env` file in the root directory and include:
```env
VITE_NASA_API_KEY=your_nasa_api_key
```

For APIs without auth (Wikipedia, Launch Library), direct access is used.

### 4. Run Locally
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

---

## 🌐 Technologies Used

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**
- **CSS Grid** for newspaper-style layout
- **Framer Motion** for animations
- **Google Fonts + FontAwesome / Lucide** for styling
- **LocalStorage** for data storage

### APIs
- **NASA APOD API** – Astronomy Picture of the Day
- **Launch Library 2.0** – Rocket launches by date
- **Wikipedia On This Day API** – “On This Day” space events
- **SpaceDev**- For more launch data

### Tools
- **Figma / Penpot** – UI desig
- **particles.js / SVG.js (optional)** – Starfield effects
- **Vite / Webpack** – Optional build optimization
- **Lighthouse / PageSpeed Insights** – Performance testing

---

## 📦 Folder Structure

```
/
├── README.md
├── apod.html
├── game.html
├── history.html
├── index.html           # Main entry point 
├── launch_history.json  # Local data store for launch events
├── main.html
├── quiz.html            # Space trivia or gamification
├── script.js            # Main JavaScripct Logic
├── style.css

---

## 🧩 Future Enhancements

- User login & cloud sync
- Badge tooltips with trivia
- Make versions downloadable
- Dark mode toggle
- Sound FX on badge unlocks

---

## 🎯 Motivation & Impact

By treating each day as the front page of a space history newspaper, The Cosmic Times aims to:
- Build a **daily learning habit**
- Make astronomy **personal and nostalgic**
- Encourage users to **collect, explore, and celebrate** cosmic events

---

## 💫 Made with ❤️ by ZENCODERS

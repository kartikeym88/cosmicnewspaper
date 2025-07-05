
# 🪐 The Cosmic Times

_A Daily Digital Newspaper of Space History – Brought to You by ZENCODERS_

**“On This Day, But Make It Cosmic”**  
The Cosmic Times is a dynamic, interactive, and gamified web app that brings space history to life in the style of a retro-futuristic newspaper. Each day gets its own digital edition, packed with images, rocket launches, space milestones, and more.

---

## 🚀 Features

- **Front Page Headline**: NASA’s Astronomy Picture of the Day (APOD)
- **Launch Reports**: Rockets, missions, and agencies launched on that day
- **On This Day in Space**: Space-related historical events via Wikipedia
- **Editor’s Note**: Tracks user streaks and awards badges
- **My Cosmic Archive**: Users can save and revisit editions they've explored
- **Gamification**: Badges and streaks make space exploration fun and habit-forming
- **Print Support**: Export any edition as a printable PDF

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
- **LocalStorage** for user streaks and badge data

### APIs
- **NASA APOD API** – Astronomy Picture of the Day
- **Launch Library 2.0** – Rocket launches by date
- **Wikipedia REST API** – “On This Day” space events
- *(Optional)* ESA archives, In-the-Sky.org for extra data

### Tools
- **Figma / Penpot** – UI design
- **html2pdf.js** – For exporting editions as PDFs
- **Tippy.js (optional)** – Hover tooltips for badges
- **particles.js / SVG.js (optional)** – Starfield effects
- **Vite / Webpack** – Optional build optimization
- **Lighthouse / PageSpeed Insights** – Performance testing

---

## 📦 Folder Structure

```
/public
/src
  /components
  /assets
  /utils
  App.js
  main.js
.env
index.html
README.md
package.json
```

---

## 🧩 Future Enhancements

- User login & cloud sync
- Badge tooltips with trivia
- Space quiz mini-game
- Dark mode toggle
- Sound FX on badge unlocks

---

## 🎯 Motivation & Impact

By treating each day as the front page of a space history newspaper, The Cosmic Times aims to:
- Build a **daily learning habit**
- Make astronomy **personal and nostalgic**
- Encourage users to **collect, explore, and celebrate** cosmic events

---

## 📜 License

This project is open source and free to use under the [MIT License](LICENSE).

---

## 💫 Made with ❤️ by ZENCODERS

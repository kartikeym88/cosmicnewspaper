const API_KEY = "bT8GecFG6RdFe2ywdkafe1wMsMwmoXNcyMGi5CqO"; // Replace with your NASA key
const launchAPI = "https://ll.thespacedevs.com/2.2.0/launch/";

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date-input').value = today;
  fetchCosmicNews();
});

document.getElementById("date-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") fetchCosmicNews();
});

async function fetchCosmicNews() {
  const date = document.getElementById("date-input").value;
  const mainContent = document.getElementById("main-content");

  mainContent.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Scanning the cosmos for stories from ${formatDate(date)}...</p>
    </div>
  `;

  try {
    const [apod, launches, history] = await Promise.all([
      fetchAPOD(date),
      fetchLaunches(date),
      fetchSpaceHistory(date),
    ]);
    renderNewspaper(apod, launches, history, date);
  } catch (error) {
    console.error(error);
    mainContent.innerHTML = `
      <div class="error">
        <h3><i class="fas fa-exclamation-triangle"></i> Cosmic Communication Error</h3>
        <p>Could not fetch data. Please try again later.</p>
      </div>
    `;
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function fetchAPOD(date) {
  const cached = localStorage.getItem("apod-" + date);
  if (cached) return JSON.parse(cached);

  const response = await fetch(
    `https://api.nasa.gov/planetary/apod?date=${date}&api_key=${API_KEY}`
  );
  if (!response.ok) throw new Error("Failed to fetch APOD");

  const data = await response.json();
  localStorage.setItem("apod-" + date, JSON.stringify(data));
  return data;
}

async function fetchLaunches(date) {
  const response = await fetch(
    `${launchAPI}?window_start__date=${date}&window_end__date=${date}&limit=5`
  );
  if (!response.ok) throw new Error("Failed to fetch launches");
  const data = await response.json();
  return data.results;
}

async function fetchSpaceHistory(date) {
  const month = new Date(date).getMonth() + 1;
  const day = new Date(date).getDate();

  const response = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`);
  if (!response.ok) throw new Error("Failed to fetch history");

  const data = await response.json();
  return data.events.filter(event =>
    ["space", "apollo", "nasa", "launch", "moon", "cosmos", "satellite"]
      .some(keyword => event.text.toLowerCase().includes(keyword))
  );
}

function renderNewspaper(apod, launches, history, date) {
  const formattedDate = formatDate(date);
  const mainContent = document.getElementById("main-content");

  mainContent.innerHTML = `
    <div class="main-content">
      <article class="headline-section visible">
        ${apod.media_type === "image"
          ? `<img src="${apod.url}" alt="${apod.title}" class="apod-image" />`
          : `<div class="apod-image" style="display:flex;justify-content:center;align-items:center;background:#222;color:#fff;height:300px;">Video: <a href="${apod.url}" style="color:#0f0;">View</a></div>`
        }
        <h2 class="headline">${apod.title}</h2>
        <p class="byline">
          <i class="fas fa-calendar-alt"></i> ${formattedDate} |
          <i class="fas fa-camera"></i> NASA Astronomy Picture of the Day
          ${apod?.copyright ? `| © ${apod?.copyright}` : ""}
        </p>
        <div class="article-content">${apod.explanation}</div>
      </article>
      ${history.length ? `
        <section class="section">
          <h3 class="section-title"><i class="fas fa-history"></i> On This Day in Space</h3>
          ${history.map(event => `
            <div class="history-item">
              <div class="history-title">${event.year} - ${event.text}</div>
              <div class="history-details"><i class="fas fa-calendar"></i> ${event.year}</div>
            </div>
          `).join("")}
        </section>
      ` : ""}
    </div>
    

    <aside class="sidebar">
      <section class="section stats-section">
        <h3 class="section-title"><i class="fas fa-chart-bar"></i> Cosmic Stats</h3>
        <div class="stats-grid">
          <div class="stat-item"><span class="stat-number">${launches.length}</span> Launches</div>
          <div class="stat-item"><span class="stat-number">${history.length}</span> Historic Events</div>
        </div>
      </section>

      ${launches.length ? `
        <section class="section">
          <h3 class="section-title"><i class="fas fa-rocket"></i> Launch Reports</h3>
          ${launches.map(launch => `
            <div class="launch-item">
              <div class="launch-name">${launch.name}</div>
              <div class="launch-details">
                <i class="fas fa-building"></i> ${launch.launch_service_provider?.name || "Unknown"}<br>
                <i class="fas fa-map-marker-alt"></i> ${launch.pad?.location?.name || "Unknown Location"}<br>
                <i class="fas fa-clock"></i> ${launch.status?.name || "Unknown"}
              </div>
            </div>
          `).join("")}
        </section>
      ` : ""}

      

      <section class="section badges-section">
        <h3 class="section-title">
          <i class="fas fa-medal"></i> Space Explorer Status
        </h3>
        <div class="badge">🚀 First Edition</div>
        <div class="badge">🌟 Cosmic Curious</div>
        <div class="badge">📅 Time Traveler</div>
        <p style="margin-top: 15px; opacity: 0.8;">
          Keep exploring to unlock more badges and build your cosmic archive!
        </p>
      </section>
    </aside>
    
  `;
}
for (let i = 0; i < 120; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + 'vw';
    star.style.top = Math.random() * 100 + 'vh';
    star.style.width = star.style.height = (Math.random() * 2 + 1) + 'px';
    star.style.opacity = Math.random() * 0.7 + 0.3;
    star.style.animationDuration = (Math.random() * 2 + 2) + 's';
    document.body.appendChild(star);
  }
  // --- Animated Starfield and Shooting Stars ---
const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d');
let w = window.innerWidth, h = window.innerHeight;
canvas.width = w; canvas.height = h;

function randomStar() {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.2 + 0.5,
    speed: Math.random() * 0.2 + 0.05,
    twinkle: Math.random() * 100,
  };
}
let stars = Array.from({length: 160}, randomStar);

function drawStars() {
  ctx.clearRect(0, 0, w, h);
  stars.forEach(star => {
    ctx.save();
    ctx.globalAlpha = 0.7 + 0.3 * Math.sin((Date.now()/300) + star.twinkle);
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = "#0ff";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
    star.x += star.speed;
    if (star.x > w) { star.x = 0; star.y = Math.random() * h; }
  });
}





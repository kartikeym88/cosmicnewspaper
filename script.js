const API_KEY = "bT8GecFG6RdFe2ywdkafe1wMsMwmoXNcyMGi5CqO";
const launchAPI = "https://ll.thespacedevs.com/2.2.0/launch/";
const memoryStorage = {};

document.getElementById("date-input").max = new Date().toISOString().split("T")[0];

async function fetchCosmicNews() {
  const date = document.getElementById("date-input").value;
  const main = document.getElementById("main-content");
  main.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Scanning the cosmos for ${date}...</p>
    </div>`;

  let apod = null;
  let spaceMilestones = [];
  let upcomingLaunches = [];
  let pastLaunches = [];


  try {
    apod = await fetchAPOD(date);
  } catch (err) {
    console.error("APOD error:", err);
  }

  try {
    spaceMilestones = await fetchWikipediaSpaceMilestones(date);
  } catch (err) {
    console.error("Wikipedia error:", err);
  }

  try {
    upcomingLaunches = await fetchUpcomingLaunches();
  } catch (err) {
    console.error("SpaceDevs upcoming error:", err);
  }
   try {
    pastLaunches = await fetchPastLaunches(date);
  } catch (err) {
    console.error("Past launches error:", err);
  }



  renderAll(apod, pastLaunches, spaceMilestones, upcomingLaunches, date);
}
async function fetchPastLaunches(date) {
  const res = await fetch("launch_history.json");
  if (!res.ok) throw new Error("Could not load launch history data.");
  const data = await res.json();

  // Extract MM-DD
  const [, month, day] = date.split("-");
  const dateKey = `${month}-${day}`;

  // Collect all launches matching this MM-DD across years
  const launches = [];

  for (const [fullDate, entries] of Object.entries(data)) {
    const [, m, d] = fullDate.split("-");
    if (m === month && d === day) {
      launches.push(...entries);
    }
  }

  return launches;
}



async function fetchAPOD(date) {
  const key = `apod-${date}`;
  if (memoryStorage[key]) return memoryStorage[key];

  const res = await fetch(`https://api.nasa.gov/planetary/apod?date=${date}&api_key=${API_KEY}`);
  if (!res.ok) throw new Error("Failed to fetch APOD.");
  const data = await res.json();
  memoryStorage[key] = data;
  return data;
}

async function fetchUpcomingLaunches() {
  const key = "upcoming-launches";
  const cached = localStorage.getItem(key);
  const cachedTime = localStorage.getItem(`${key}-time`);
  const now = Date.now();

  if (cached && cachedTime && now - Number(cachedTime) < 60 * 60 * 1000) {
    return JSON.parse(cached);
  }

  const res = await fetch(`${launchAPI}upcoming/?limit=20&ordering=net`);
  if (!res.ok) throw new Error("Failed to fetch upcoming launches.");
  const data = await res.json();

  const nowDate = new Date();
  const endDate = new Date(nowDate.getTime() + 10 * 24 * 60 * 60 * 1000);

  const filtered = data.results.filter(l => {
    const launchDate = new Date(l.net);
    return launchDate >= nowDate && launchDate <= endDate;
  });

  localStorage.setItem(key, JSON.stringify(filtered));
  localStorage.setItem(`${key}-time`, String(now));
  return filtered;
}

async function fetchWikipediaSpaceMilestones(date) {
  const [year, month, day] = date.split("-");
  const key = `wiki-${month}-${day}`;
  if (memoryStorage[key]) return memoryStorage[key];

  const textKeywords = [
    "space", "nasa", "apollo", "moon", "mars", "venus", "astronaut", "cosmonaut", "shuttle",
    "galileo", "hubble", "rover", "lander", "saturn", "voyager", "new horizons",
    "pluto", "solar system", "iss", "spacecraft", "launch", "sputnik", "gagarin"
  ];

  const categoryKeywords = [
    "space", "apollo", "nasa", "astronomy", "moon", "mars", "planet", "astronaut",
    "rocket", "shuttle", "cosmonaut", "satellite", "spaceflight", "mission",
    "exploration", "lunar", "orbiter"
  ];

  const excludeKeywords = [
    "navy", "ship", "fleet", "submarine", "battle", "war", "tank",
    "military", "revolution", "government", "election", "conflict",
    "soldier", "weapons", "battleship", "airliner", "train", "railway"
  ];

  async function getPageCategories(title) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=categories&format=json&origin=*&titles=${encodeURIComponent(title)}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      const pages = json.query?.pages;
      const pg = pages && Object.values(pages)[0];
      return pg?.categories?.map(c => c.title.replace("Category:", "")) || [];
    } catch {
      return [];
    }
  }

  async function getIntroParagraph(title) {
    const key = `summary-${title}`;
    if (memoryStorage[key]) return memoryStorage[key];
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      const ext = json.extract || "";
      memoryStorage[key] = ext;
      return ext;
    } catch {
      return "";
    }
  }

  const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch Wikipedia events.");
  const json = await res.json();
  const events = json.events;

  const spaceEvents = [];

  for (const ev of events) {
    const text = ev.text.toLowerCase();
    const textMatch = textKeywords.some(k => text.includes(k));
    const excludeMatch = excludeKeywords.some(k => text.includes(k));
    const pg = ev.pages?.[0];
    if (!pg?.title || excludeMatch) continue;

    const cats = await getPageCategories(pg.title);
    const categoryMatch = cats.some(cat =>
      categoryKeywords.some(k => cat.toLowerCase().includes(k))
    );
    const excludeCatMatch = cats.some(cat =>
      excludeKeywords.some(k => cat.toLowerCase().includes(k))
    );

    if ((textMatch || categoryMatch) && !excludeCatMatch) {
      const fullDesc = await getIntroParagraph(pg.title);
      spaceEvents.push({
        label: ev.text,
        description: fullDesc || pg.description || "Space milestone",
        type: "Space Milestone",
        date: `${ev.year}-${month}-${day}`
      });
    }
  }

  memoryStorage[key] = spaceEvents;
  return spaceEvents;
}

function toggleReadMore(btn) {
  const moreText = btn.previousElementSibling;
  if (moreText.style.display === "block") {
    moreText.style.display = "none";
    btn.textContent = "Read more";
  } else {
    moreText.style.display = "block";
    btn.textContent = "Show less";
  }
}

function renderAll(apod, launches, wikiEvents, upcomingLaunches, date) {
  const main = document.getElementById("main-content");
  const upcomingDiv = document.getElementById("upcoming-launches");

  const format = d => new Date(d).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

const launchHTML = launches.length > 0
  ? launches.map(l => `
    <div class="event-item">
      <h4>🚀 ${l.name}</h4>
      ${l.image_url ? `<img src="${l.image_url}" alt="${l.name}" style="width:100%; max-height:200px; object-fit:cover; border-radius:8px; margin:10px 0;">` : ""}
      <p><strong>Provider:</strong> ${l.provider}</p>
      <p><strong>Window:</strong> ${new Date(l.window_start).toLocaleString()}</p>
      <p><strong>Location:</strong> ${l.location}</p>
      <p>${l.description}</p>
    </div>
  `).join("")
  : "<p>No rocket launches recorded for this date.</p>";


  const milestoneHTML = wikiEvents.length > 0 ? wikiEvents.map((e, i) => `
    <div class="event-item">
      <h4>📜 ${e.label}</h4>
      <p><strong>Type:</strong> ${e.type}</p>
      <p><strong>Date:</strong> ${format(e.date)}</p>
      <div id="desc-${i}" style="display:none; margin-top: 8px;">${e.description}</div>
      <button onclick="toggleReadMore(this)" style="margin-top:8px;">Read more</button>
    </div>
  `).join("") : "<p>No major space discoveries or milestones found for this date.</p>";

  const upcomingHTML = upcomingLaunches.length > 0 ? upcomingLaunches.map(l => `
    <div class="event-item">
      <h4>🚀 ${l.name}</h4>
      <p><strong>Provider:</strong> ${l.launch_service_provider?.name || "Unknown"}</p>
      <p><strong>Window:</strong> ${format(l.window_start)}</p>
      ${l.mission?.description ? `<p>${l.mission.description.slice(0, 120)}...</p>` : ""}
    </div>
  `).join("") : "<p>No upcoming launches found or API is unavailable.</p>";

  main.innerHTML = `
    <div class="main-content">
      <article class="headline-section">
        ${apod && apod.media_type === "image"
          ? `<div class="image-container">
              <img src="${apod.url}" alt="${apod.title}" class="apod-image" style="opacity:1;" />
            </div>`
          : apod && apod.media_type === "video"
          ? `<div class="apod-image" style="display:flex;justify-content:center;align-items:center;background:#222;color:#fff;height:300px;">
              Video: <a href="${apod.url}" target="_blank" style="color:#00eaff; margin-left:10px;">View Video</a>
            </div>`
          : `<p style="color:#aaa;">APOD unavailable</p>`}
        <h2 class="headline">Astronomy Picture of the Day</h2>
        <p style="margin-top: 10px;">
          <a href="apod.html" onclick="localStorage.setItem('cosmic-selected-date', '${date}')" style="color:#00eaff; font-weight: bold; text-decoration: underline;">

            Click to know more →
          </a>
        </p>
      </article>

      <section class="event-section">
        <h3 class="section-title">🚀 Rocket Launches (Archived Placeholder)</h3>
        ${launchHTML}
      </section>

      <section class="event-section">
        <h3 class="section-title">📜 Space Discoveries & Milestones</h3>
        ${milestoneHTML}
      </section>
    </div>
  `;

  if (upcomingDiv) {
    upcomingDiv.innerHTML = `
      <h3 class="section-title">🛰️ Upcoming Launches (Next 10 Days)</h3>
      ${upcomingHTML}
    `;
  }
}

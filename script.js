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

  const [, month, day] = date.split("-");
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
    return launchDate > nowDate && launchDate <= endDate;
  });

  localStorage.setItem(key, JSON.stringify(filtered));
  localStorage.setItem(`${key}-time`, String(now));
  return filtered;
}

// ✅ Exact match from history.html for accurate space milestone filtering
async function fetchWikipediaSpaceMilestones(date) {
  const [year, month, day] = date.split("-");
  const key = `wiki-${month}-${day}`;
  if (memoryStorage[key]) return memoryStorage[key];

  const textKeywords = [
    "space", "nasa", "apollo", "moon", "mars", "venus", "astronaut", "cosmonaut", "shuttle",
    "galileo", "hubble", "rover", "lander", "saturn", "voyager", "new horizons", "pluto",
    "solar system", "iss", "spacecraft", "launch", "sputnik", "gagarin", "rocket", "orbit",
    "probe", "cosmos", "telescope", "spacex", "soyuz", "starlink", "mission"
  ];

  const categoryKeywords = [
    "space", "apollo", "nasa", "astronomy", "moon", "mars", "planet", "astronaut", "rocket",
    "shuttle", "cosmonaut", "satellite", "spaceflight", "mission", "exploration", "lunar",
    "orbiter", "cosmos", "spacex", "iss", "observatory"
  ];

  const excludeKeywords = [
    "navy", "ship", "fleet", "submarine", "battle", "war", "military", "revolution", "government",
    "election", "politician", "death", "murder", "conflict", "soldier", "weapons", "airliner",
    "music", "film", "pageant", "beauty", "queen", "festival", "actor", "actress", "cinema",
    "president", "football", "cricket", "soccer", "sports", "race", "olympics"
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
    const title = ev.pages?.[0]?.title;
    const eventYear = ev.year;

    if (!title) continue;

    const keywordMatchCount = textKeywords.filter(k => text.includes(k)).length;
    const excludeMatch = excludeKeywords.some(k => text.includes(k));
    if (excludeMatch || keywordMatchCount < 2) continue;

    const categories = await getPageCategories(title);
    const categoryMatch = categories.some(cat =>
      categoryKeywords.some(k => cat.toLowerCase().includes(k))
    );
    const categoryExclude = categories.some(cat =>
      excludeKeywords.some(k => cat.toLowerCase().includes(k))
    );

    if (!categoryMatch || categoryExclude) continue;

    const description = await getIntroParagraph(title);

    spaceEvents.push({
      label: title.replace(/_/g, " "),
      description: description || ev.text,
      type: "Space Milestone",
      date: `${eventYear}-${month}-${day}`
    });
  }

  memoryStorage[key] = spaceEvents;
  return spaceEvents;
}

function renderAll(apod, launches, wikiEvents, upcomingLaunches, date) {
  const main = document.getElementById("main-content");
  const upcomingDiv = document.getElementById("upcoming-launches");

  const format = d => new Date(d).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const milestoneHTML = wikiEvents.length > 0 ? wikiEvents.map((e, i) => `
    <div class="event-item">
      <h4>📜 ${e.label}</h4>
      <p><strong>Type:</strong> ${e.type}</p>
      <p><strong>Date:</strong> ${format(e.date)}</p>
      <a href="history.html?event=${encodeURIComponent(e.label)}" class="read-more-btn">Read more</a>
    </div>
  `).join("") : "<p>No space milestones for this date.</p>";

  main.innerHTML = `
    <div class="headline-section">
      <h2 class="headline">Astronomy Picture of the Day</h2>
      ${apod?.url ? `<img src="${apod.url}" class="apod-image">` : ""}
      <p class="byline">${apod?.title || "No title"}</p>
      <p class="article-content">${apod?.explanation || "No explanation available."}</p>
    </div>

    <div class="event-section">
      <h3 class="section-title">🚀 Launch History</h3>
      ${launches.map(l => `
        <div class="event-item">
          <h4>🚀 ${l.name}</h4>
          <p><strong>Provider:</strong> ${l.provider}</p>
          <p><strong>Window:</strong> ${new Date(l.window_start).toLocaleString()}</p>
          <p><strong>Location:</strong> ${l.location}</p>
          <p>${l.description}</p>
        </div>
      `).join("")}
    </div>

    <div class="event-section">
      <h3 class="section-title">📜 Space Discoveries & Milestones</h3>
      ${milestoneHTML}
    </div>
  `;

  upcomingDiv.innerHTML = `
    <h3 class="section-title">Upcoming Launches</h3>
    ${upcomingLaunches.map(l => `
      <div class="event-item">
        <h4>${l.name}</h4>
        <p><strong>Provider:</strong> ${l.launch_service_provider?.name || "N/A"}</p>
        <p><strong>Launch Window:</strong> ${new Date(l.net).toLocaleString()}</p>
        <p><strong>Location:</strong> ${l.pad?.location?.name || "N/A"}</p>
      </div>
    `).join("")}
  `;
}

window.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("date-input");
  const saved = localStorage.getItem("cosmic-selected-date");

  setInterval(() => {
    localStorage.removeItem("upcoming-launches");
    localStorage.removeItem("upcoming-launches-time");
    fetchCosmicNews();
  }, 30 * 60 * 1000);

  if (saved) {
    dateInput.value = saved;
    fetchCosmicNews();
  }

  dateInput.addEventListener("change", () => {
    localStorage.setItem("cosmic-selected-date", dateInput.value);
    fetchCosmicNews();
  });
});

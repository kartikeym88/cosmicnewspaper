const API_KEY = "bT8GecFG6RdFe2ywdkafe1wMsMwmoXNcyMGi5CqO";
const LAUNCH_CACHE_DURATION = 15 * 60 * 1000;
const launchAPI = `https://ll.thespacedevs.com/2.2.0/launch/`;

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('date-input');
  dateInput.value = today;
  dateInput.max = today;
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
    const [apod, upcomingLaunches, launchesOnDate, wikiEvents] = await Promise.all([
      fetchAPOD(date),
      fetchLaunchesCached(),
      fetchLaunchesOnDate(date),
      fetchWikidataEvents(date),
    ]);

    const allEvents = [
      ...launchesOnDate.map(launch => ({
        name: launch.name,
        image: launch.image,
        launch_service_provider: launch.launch_service_provider,
        pad: launch.pad,
        window_start: launch.window_start,
        status: launch.status?.name,
      })),
      ...wikiEvents.map(event => ({
        name: event.name,
        image: null,
        launch_service_provider: { name: "Wikidata" },
        pad: { location: { name: "Unknown" } },
        window_start: event.time,
        status: event.status,
      })),
    ];

    renderNewspaper(apod, upcomingLaunches, allEvents, date);
  } catch (error) {
    console.error("Error in fetchCosmicNews:", error);
    mainContent.innerHTML = `
      <div class="error">
        <h3><i class="fas fa-exclamation-triangle"></i> Cosmic Communication Error</h3>
        <p>${error.message || "Could not fetch data. Please try again later."}</p>
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

  const response = await fetch(`https://api.nasa.gov/planetary/apod?date=${date}&api_key=${API_KEY}`);
  if (!response.ok) throw new Error("Failed to fetch APOD");

  const data = await response.json();
  localStorage.setItem("apod-" + date, JSON.stringify(data));
  return data;
}

async function fetchLaunchesCached() {
  const cacheKey = "launches-upcoming";
  const cached = localStorage.getItem(cacheKey);
  const cachedTime = localStorage.getItem(cacheKey + "-time");

  if (cached && cachedTime) {
    const age = Date.now() - parseInt(cachedTime, 10);
    if (age < LAUNCH_CACHE_DURATION) {
      return JSON.parse(cached);
    }
  }

  const launches = await fetchLaunchesFromAPI();
  localStorage.setItem(cacheKey, JSON.stringify(launches));
  localStorage.setItem(cacheKey + "-time", Date.now().toString());
  return launches;
}

async function fetchLaunchesFromAPI() {
  const response = await fetch(`${launchAPI}upcoming/?limit=10&ordering=window_start`);
  if (!response.ok) throw new Error("Failed to fetch launches");
  const data = await response.json();
  return data.results;
}

async function fetchLaunchesOnDate(date) {
  const cacheKey = `launches-on-${date}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const start = `${date}T00:00:00Z`;
  const end = `${date}T23:59:59Z`;
  const url = `${launchAPI}?window_start__gte=${start}&window_end__lte=${end}&ordering=window_start`;

  const response = await fetch(url);
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After") || 30;
    throw new Error(`Too many requests. Try again in ${retryAfter} seconds.`);
  }

  if (!response.ok) throw new Error("Failed to fetch launches for selected date.");

  const data = await response.json();
  localStorage.setItem(cacheKey, JSON.stringify(data.results));
  return data.results;
}

async function fetchWikidataEvents(date) {
  const sparql = `
    SELECT ?item ?itemLabel ?eventDate WHERE {
      ?item wdt:P31 ?type;
            wdt:P585 ?eventDate.
      FILTER(STR(?eventDate) = "${date}T00:00:00Z")
      FILTER(?type IN (
        wd:Q5916,        # space mission
        wd:Q40218,       # space probe
        wd:Q290903,      # artificial satellite
        wd:Q813,         # discovery
        wd:Q32612,       # astronomical discovery
        wd:Q618123,      # astronomical object
        wd:Q223557,      # exoplanet
        wd:Q74791        # planet
      ))
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    }
    ORDER BY DESC(?eventDate)
    LIMIT 10
  `;

  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch from Wikidata");

  const data = await res.json();
  return data.results.bindings.map(b => ({
    name: b.itemLabel.value,
    time: b.eventDate.value,
    status: "Historic Discovery",
  }));
}

function renderNewspaper(apod, upcomingLaunches, eventsOnDate, date) {
  const formattedDate = formatDate(date);
  const mainContent = document.getElementById("main-content");

  const now = new Date();
  const filteredUpcoming = upcomingLaunches.filter(launch => {
    const launchTime = new Date(launch.window_start);
    const diffInDays = (launchTime - now) / (1000 * 60 * 60 * 24);
    return launchTime > now && diffInDays <= 3;
  });

  const satelliteEvents = eventsOnDate.filter(e => e.launch_service_provider?.name !== "Wikidata");
  const discoveryEvents = eventsOnDate.filter(e => e.launch_service_provider?.name === "Wikidata");

  mainContent.innerHTML = `
    <div class="main-content">
      <article class="headline-section visible">
        ${apod.media_type === "image"
          ? `<img src="${apod.url}" alt="${apod.title}" class="apod-image" />`
          : `<div class="apod-image" style="display:flex;justify-content:center;align-items:center;background:#222;color:#fff;height:300px;">Video: <a href="${apod.url}" style="color:#0f0;">View</a></div>`}
        <h2 class="headline">${apod.title}</h2>
        <p class="byline">
          <i class="fas fa-calendar-alt"></i> ${formattedDate} |
          <i class="fas fa-camera"></i> NASA Astronomy Picture of the Day
          ${apod?.copyright ? `| © ${apod?.copyright}` : ""}
        </p>
        <div class="article-content">${apod.explanation}</div>
      </article>

      <section class="event-section">
        <h3 class="section-title"><i class="fas fa-rocket"></i> Satellite Launches</h3>
        ${
          satelliteEvents.length > 0
            ? satelliteEvents.map(event => `
              <div class="event-item">
                ${event.image ? `<img src="${event.image}" class="apod-image" alt="${event.name}" />` : ""}
                <h4>${event.name}</h4>
                <p><strong>Provider:</strong> ${event.launch_service_provider?.name || "Unknown"}</p>
                <p><strong>Location:</strong> ${event.pad?.location?.name || "Unknown"}</p>
                <p><strong>Time:</strong> ${new Date(event.window_start).toLocaleString()}</p>
                <p><strong>Status:</strong> ${getFriendlyStatus(event.status)}</p>
              </div>
            `).join("")
            : `<p>No launches recorded on this date.</p>`
        }
      </section>

      <section class="event-section">
        <h3 class="section-title"><i class="fas fa-atom"></i> Space Discoveries & Milestones</h3>
        ${
          discoveryEvents.length > 0
            ? discoveryEvents.map(event => `
              <div class="event-item">
                <h4>${event.name}</h4>
                <p><strong>Provider:</strong> Wikidata</p>
                <p><strong>Time:</strong> ${new Date(event.window_start).toLocaleString()}</p>
                <p><strong>Status:</strong> ${getFriendlyStatus(event.status)}</p>
              </div>
            `).join("")
            : `<p>No notable space discoveries on this date.</p>`
        }
      </section>
    </div>

    <aside class="sidebar">
      <section class="section stats-section">
        <h3 class="section-title"><i class="fas fa-chart-bar"></i> Cosmic Stats</h3>
        <div class="stats-grid">
          <div class="stat-item"><span class="stat-number">${filteredUpcoming.length}</span> Upcoming Launches</div>
        </div>
      </section>

      ${filteredUpcoming.length ? `
        <section class="section">
          <h3 class="section-title"><i class="fas fa-rocket"></i> Upcoming Launches</h3>
          ${filteredUpcoming.map(launch => `
            <div class="launch-item">
              <div class="launch-name">${launch.name}</div>
              <div class="launch-details">
                <i class="fas fa-building"></i> ${launch.launch_service_provider?.name || "Unknown"}<br>
                <i class="fas fa-map-marker-alt"></i> ${launch.pad?.location?.name || "Unknown Location"}<br>
                <i class="fas fa-clock"></i> ${new Date(launch.window_start).toLocaleString()}<br>
                <strong>Status:</strong> ${getFriendlyStatus(launch.status?.name)}
              </div>
            </div>
          `).join("")}
        </section>
      ` : ""}

      <section class="section badges-section">
        <h3 class="section-title"><i class="fas fa-medal"></i> Space Explorer Status</h3>
        <div class="badge">🚀 First Edition</div>
        <div class="badge">🌟 Cosmic Curious</div>
        <div class="badge">📅 Time Traveler</div>
        <p style="margin-top: 15px; opacity: 0.8;">Keep exploring to unlock more badges!</p>
      </section>
    </aside>
  `;
}

function getFriendlyStatus(status) {
  switch ((status || "").toLowerCase()) {
    case "go for launch": return "🚀 All Systems Go!";
    case "to be confirmed":
    case "tbc": return "🕓 Awaiting Confirmation";
    case "hold": return "⏸️ On Hold";
    case "in flight": return "🛰️ In Flight";
    case "success": return "✅ Launched Successfully";
    case "failure": return "❌ Launch Failed";
    case "partial failure": return "⚠️ Partial Success";
    case "scheduled": return "📅 Scheduled";
    case "ready": return "🟢 Ready for Liftoff";
    case "canceled":
    case "cancelled": return "🚫 Cancelled";
    case "historic discovery": return "📚 Historic Discovery";
    default: return "🔭 Status Unknown";
  }
}

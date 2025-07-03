// ✅ FIXED script.js for The Cosmic Times
// - Proper syntax and string handling

const API_KEY = "bT8GecFG6RdFe2ywdkafe1wMsMwmoXNcyMGi5CqO";
const launchAPI = "https://ll.thespacedevs.com/2.2.0/launch/";

let memoryStorage = {};

document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('date-input');
  dateInput.max = today;

  const selectedDate = localStorage.getItem('cosmic-selected-date');
  if (selectedDate) {
    dateInput.value = selectedDate;
    localStorage.removeItem('cosmic-selected-date');
    fetchCosmicNews();
  } else {
    dateInput.value = today;
    fetchCosmicNews();
  }
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
    const apod = await fetchAPOD(date);
    const eventsOnDate = await fetchLaunchesOnDate(date);
    renderNewspaper(apod, eventsOnDate, date);
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
  const cacheKey = "apod-" + date;
  const cached = memoryStorage[cacheKey];
  if (cached) return cached;

  const response = await fetch(`https://api.nasa.gov/planetary/apod?date=${date}&api_key=${API_KEY}`);
  if (!response.ok) throw new Error("Failed to fetch APOD");
  const data = await response.json();
  memoryStorage[cacheKey] = data;
  return data;
}

async function fetchLaunchesOnDate(date) {
  const cacheKey = `launches-on-${date}`;
  const cached = memoryStorage[cacheKey];
  if (cached) return cached;

  const start = `${date}T00:00:00Z`;
  const end = `${date}T23:59:59Z`;
  const url = `${launchAPI}?window_start__gte=${start}&window_end__lte=${end}&ordering=window_start&limit=5`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch events for selected date.");

  const data = await response.json();
  memoryStorage[cacheKey] = data.results;
  return data.results;
}

function renderNewspaper(apod, eventsOnDate, date) {
  const formattedDate = formatDate(date);
  const mainContent = document.getElementById("main-content");

  mainContent.innerHTML = `
    <div class="main-content">
      <article class="headline-section visible">
        ${apod.media_type === "image"
          ? `<div class="image-container">
              <img src="${apod.url}" alt="${apod.title}" class="apod-image" style="opacity:1;" />
            </div>`
          : `<div class="apod-image" style="display:flex;justify-content:center;align-items:center;background:#222;color:#fff;height:300px;">
              Video: <a href="${apod.url}" target="_blank" style="color:#00eaff; margin-left:10px;">View Video</a>
            </div>`}
        <h2 class="headline">Astronomy Picture of the Day</h2>
        <p style="margin-top: 10px;">
          <a href="apod.html" style="color:#00eaff; font-weight: bold; text-decoration: underline;">
            Click to know more →
          </a>
        </p>
      </article>

      <section class="event-section">
        <h3 class="section-title"><i class="fas fa-meteor"></i> Events on This Day</h3>
        ${eventsOnDate && eventsOnDate.length > 0 ? eventsOnDate.map(event => `
          <div class="event-item">
            ${event.image ? `<img src="${event.image}" class="event-image" alt="${event.name}" loading="lazy" style="width:100%; max-height:200px; object-fit:cover; margin-bottom:10px; border-radius:8px;" />` : ""}
            <h4>${event.name}</h4>
            <p><strong>Provider:</strong> ${event.launch_service_provider?.name || "Unknown"}</p>
            <p><strong>Location:</strong> ${event.pad?.location?.name || "Unknown"}</p>
            <p><strong>Time:</strong> ${new Date(event.window_start).toLocaleString()}</p>
            <p><strong>Status:</strong> ${getFriendlyStatus(event.status?.name)}</p>
          </div>
        `).join("") : `<p>No known launches or space events on this date.</p>`}
      </section>
    </div>
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
    default: return "🔭 Status Unknown";
  }
}

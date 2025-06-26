const apodSection = document.getElementById("apodSection");
const datePicker = document.getElementById("datePicker");
const editionDate = document.getElementById("editionDate");

const API_KEY = "DEMO_KEY"; // Replace with your NASA API key

datePicker.addEventListener("change", () => {
  const selectedDate = datePicker.value;
  editionDate.textContent = `Edition: ${selectedDate}`;
  fetchAPOD(selectedDate);
});

function fetchAPOD(date) {
  fetch(`https://api.nasa.gov/planetary/apod?date=${date}&api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      apodSection.innerHTML = `
        <h3>${data.title}</h3>
        ${data.media_type === "image"
          ? `<img src="${data.url}" alt="${data.title}" width="100%" />`
          : `<iframe width="100%" height="400" src="${data.url}" frameborder="0"></iframe>`
        }
        <p>${data.explanation}</p>
        <small>📅 Date: ${data.date} | 📷 Credit: ${data.copyright || "NASA"}</small>
      `;
    })
    .catch(err => {
      apodSection.innerHTML = `<p>🚫 Failed to load APOD.</p>`;
    });
}
const launchSection = document.getElementById("launchSection");

datePicker.addEventListener("change", () => {
  const selectedDate = datePicker.value;
  editionDate.textContent = `Edition: ${selectedDate}`;
  fetchAPOD(selectedDate);
  fetchLaunches(selectedDate);
});

function fetchLaunches(date) {
  launchSection.innerHTML = "🔄 Fetching launch data...";

  const url = `https://ll.thespacedevs.com/2.2.0/launch/?window_start__date=${date}&window_end__date=${date}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const launches = data.results;

      if (launches.length === 0) {
        launchSection.innerHTML = `<p>📭 No launches recorded on this day.</p>`;
        return;
      }

      launchSection.innerHTML = launches.map(launch => `
        <div class="launch-card">
          <h3>🚀 ${launch.name}</h3>
          <p><strong>Agency:</strong> ${launch.launch_service_provider?.name || "Unknown"}</p>
          <p><strong>Status:</strong> ${launch.status?.name}</p>
          <p><strong>Location:</strong> ${launch.pad?.location?.name}</p>
          <p><strong>Time:</strong> ${new Date(launch.window_start).toLocaleTimeString()}</p>
        </div>
      `).join('');
    })
    .catch(err => {
      launchSection.innerHTML = `<p>🚫 Could not fetch launch data.</p>`;
    });
}
const wikiSection = document.getElementById("wikiSection");

datePicker.addEventListener("change", () => {
  const selectedDate = datePicker.value;
  editionDate.textContent = `Edition: ${selectedDate}`;
  fetchAPOD(selectedDate);
  fetchLaunches(selectedDate);
  fetchWikiEvents(selectedDate);
});
function fetchWikiEvents(date) {
  wikiSection.innerHTML = "🔄 Loading history...";

  const [year, month, day] = date.split("-");
  const wikiURL = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;

  fetch(wikiURL)
    .then(res => res.json())
    .then(data => {
      const allEvents = data.events;
      const spaceKeywords = ["NASA", "Apollo", "space", "launch", "orbiter", "moon", "satellite", "telescope", "astronaut", "cosmonaut", "mission"];
      
      const spaceEvents = allEvents.filter(event =>
        spaceKeywords.some(keyword => event.text.toLowerCase().includes(keyword))
      );

      if (spaceEvents.length === 0) {
        wikiSection.innerHTML = `<p>📭 No space-related events found today.</p>`;
        return;
      }

      wikiSection.innerHTML = spaceEvents.map(event => `
        <div class="wiki-card">
          <p><strong>${event.year}</strong>: ${event.text}</p>
        </div>
      `).join('');
    })
    .catch(err => {
      wikiSection.innerHTML = `<p>🚫 Could not load Wikipedia events.</p>`;
    });
}
const streakDisplay = document.getElementById("streak");
const badgeList = document.getElementById("badgeList");

function updateStreak(date) {
  const today = new Date(date).toDateString();
  const lastVisit = localStorage.getItem("lastVisit");
  let streak = parseInt(localStorage.getItem("streak") || "0");

  if (lastVisit) {
    const yesterday = new Date(new Date(lastVisit));
    yesterday.setDate(yesterday.getDate() + 1);

    if (new Date(today).toDateString() === yesterday.toDateString()) {
      streak += 1;
    } else if (today === lastVisit) {
      // same day – do nothing
    } else {
      streak = 1; // reset
    }
  } else {
    streak = 1; // first visit
  }

  localStorage.setItem("streak", streak);
  localStorage.setItem("lastVisit", today);
  streakDisplay.textContent = `Visit streak: ${streak} day${streak > 1 ? "s" : ""}`;

  assignBadges(streak);
}

function assignBadges(streak) {
  const badges = [];

  if (streak >= 1) badges.push("📖 First Edition");
  if (streak >= 3) badges.push("🔥 3-Day Streak");
  if (streak >= 5) badges.push("🚀 5-Day Explorer");

  badgeList.innerHTML = "";
  badges.forEach(badge => {
    const li = document.createElement("li");
    li.textContent = badge;
    badgeList.appendChild(li);
  });
}
updateStreak(datePicker.value);
document.getElementById("printBtn").addEventListener("click", () => {
  const edition = document.getElementById("newspaper");

  const options = {
    margin: 0.3,
    filename: `Cosmic_Times_${datePicker.value}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(options).from(edition).save();
});
const saveEditionBtn = document.getElementById("saveEditionBtn");
const savedEditions = document.getElementById("savedEditions");

saveEditionBtn.addEventListener("click", () => {
  const date = datePicker.value;
  if (!date) return alert("Select a date first!");

  let archive = JSON.parse(localStorage.getItem("archive") || "[]");
  if (!archive.includes(date)) {
    archive.push(date);
    localStorage.setItem("archive", JSON.stringify(archive));
    loadArchive();
    alert("✅ Edition saved to archive!");
  } else {
    alert("⚠️ Already saved.");
  }
});

function loadArchive() {
  const archive = JSON.parse(localStorage.getItem("archive") || "[]");
  savedEditions.innerHTML = "";
  archive.forEach(date => {
    const li = document.createElement("li");
    li.textContent = `📰 ${date}`;
    li.onclick = () => {
      datePicker.value = date;
      datePicker.dispatchEvent(new Event("change")); // Trigger reload
    };
    savedEditions.appendChild(li);
  });
}

window.onload = () => {
  loadArchive();
};

const API_KEY = "bT8GecFG6RdFe2ywdkafe1wMsMwmoXNcyMGi5CqO";
const launchAPI = "https://ll.thespacedevs.com/2.2.0/launch/";

// Space history events database
const spaceHistory = {
    "01-01": [
        { title: "New Year in Space", details: "Multiple space missions have celebrated New Year's in orbit" }
    ],
    "01-28": [
        { title: "Challenger Disaster", details: "1986 - Space Shuttle Challenger tragedy, remembering the crew" }
    ],
    "02-01": [
        { title: "Columbia Disaster", details: "2003 - Space Shuttle Columbia lost during re-entry" }
    ],
    "04-12": [
        { title: "Yuri Gagarin's Historic Flight", details: "1961 - First human in space aboard Vostok 1" }
    ],
    "04-24": [
        { title: "Hubble Space Telescope Launch", details: "1990 - Revolutionary space observatory begins mission" }
    ],
    "07-16": [
        { title: "Apollo 11 Launch", details: "1969 - Historic mission to land first humans on the Moon" }
    ],
    "07-20": [
        { title: "Apollo 11 Moon Landing", details: "1969 - Neil Armstrong and Buzz Aldrin walk on the Moon" }
    ],
    "10-04": [
        { title: "Sputnik 1 Launch", details: "1957 - First artificial satellite begins the Space Age" }
    ],
    "11-09": [
        { title: "Berlin Wall Falls", details: "1989 - Historic event observed from space stations" }
    ],
    "12-21": [
        { title: "Apollo 8 Launch", details: "1968 - First humans to leave Earth orbit and orbit the Moon" }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('date-input');
    
    // Set today's date as default and maximum
    dateInput.value = today;
    dateInput.setAttribute('max', today);
    
    // Prevent future dates
    dateInput.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const currentDate = new Date();
        
        if (selectedDate > currentDate) {
            alert('🚫 Future dates are not allowed! Please select a past or current date.');
            this.value = today;
        }
    });
    
    // Prevent manual input of future dates
    dateInput.addEventListener('input', function() {
        const selectedDate = new Date(this.value);
        const currentDate = new Date();
        
        if (selectedDate > currentDate) {
            this.value = today;
        }
    });
    
    fetchCosmicNews();
    createSpaceBackground();
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
        // Fetch APOD
        const apodResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${date}`);
        const apodData = await apodResponse.json();
        
        // Fetch launches for the selected date
        const launchResponse = await fetch(`${launchAPI}?net__gte=${date}T00:00:00Z&net__lte=${date}T23:59:59Z&limit=10`);
        const launchData = await launchResponse.json();
        
        displayContent(apodData, launchData.results, date);
        updateHistorySection(date);
        
    } catch (error) {
        mainContent.innerHTML = `
            <div class="error">
                <h2>🛸 Communication Error</h2>
                <p>Could not establish connection with the cosmic network. Please try again later.</p>
                <p><small>Error: ${error.message}</small></p>
            </div>
        `;
    }
}

function displayContent(apod, launches, date) {
    const mainContent = document.getElementById("main-content");
    const launchesContent = document.getElementById("launches-content");
    const launchesTitle = document.getElementById("launches-title");
    
    // Update launches section title based on date
    const selectedDate = new Date(date);
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    const isPast = selectedDate < today;
    
    if (isToday) {
        launchesTitle.textContent = "🚀 Today's Space Launches";
    } else if (isPast) {
        launchesTitle.textContent = "🚀 Space Launches on This Date";
    } else {
        launchesTitle.textContent = "🚀 Space Launches";
    }
    
    // Display APOD
    mainContent.innerHTML = `
        <div class="headline-section visible">
            ${apod.media_type === 'image' ? 
                `<img src="${apod.url}" alt="${apod.title}" class="apod-image">` : 
                `<iframe src="${apod.url}" class="apod-image" frameborder="0" allowfullscreen></iframe>`
            }
            <h1 class="headline">${apod.title}</h1>
            <p class="byline">NASA Astronomy Picture of the Day • ${formatDate(date)}</p>
            <div class="article-content">
                <p>${apod.explanation}</p>
                ${apod.copyright ? `<p><em>Image Credit: ${apod.copyright}</em></p>` : ''}
            </div>
        </div>
    `;
    
    // Display launches with complete date information
    if (launches && launches.length > 0) {
        launchesContent.innerHTML = launches.map(launch => `
            <div class="launch-item">
                <div class="launch-name">${launch.name}</div>
                <div class="launch-details">
                    <strong>📅 Launch Date:</strong> ${formatLaunchDate(launch.net)}<br>
                    <strong>🌍 Location:</strong> ${launch.pad?.location?.name || 'Unknown Location'}<br>
                    <strong>🚀 Agency:</strong> ${launch.launch_service_provider?.name || 'Unknown Agency'}<br>
                    <strong>⏰ Status:</strong> ${launch.status?.name || 'Unknown'}
                    ${launch.mission?.description ? `<br><strong>📝 Mission:</strong> ${launch.mission.description.substring(0, 100)}...` : ''}
                </div>
            </div>
        `).join('');
    } else {
        launchesContent.innerHTML = `
            <div class="launch-item">
                <div class="launch-name">No launches on ${formatDate(date)}</div>
                <div class="launch-details">
                    <strong>📅 Selected Date:</strong> ${formatDate(date)}<br>
                    🌟 No space missions were launched on this date.<br>
                    🚀 Try selecting other dates to discover exciting space missions!
                </div>
            </div>
        `;
    }
}

function updateHistorySection(date) {
    const historyContent = document.getElementById("history-content");
    const dateObj = new Date(date);
    const monthDay = String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + String(dateObj.getDate()).padStart(2, '0');
    
    const events = spaceHistory[monthDay];
    
    if (events && events.length > 0) {
        historyContent.innerHTML = events.map(event => `
            <div class="history-item">
                <div class="history-title">${event.title}</div>
                <div class="history-details">${event.details}</div>
            </div>
        `).join('');
    } else {
        historyContent.innerHTML = `
            <div class="history-item">
                <div class="history-title">Space History</div>
                <div class="history-details">Every day contributes to humanity's journey among the stars. While no major space events are recorded for ${formatDate(date)}, the cosmos continues its eternal dance.</div>
            </div>
        `;
    }
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatLaunchDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
        weekday: 'short'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function createSpaceBackground() {
    const spaceContainer = document.querySelector('.space-background');
    const starsLayer = document.querySelector('.stars-layer');
    const movingStars = document.querySelector('.moving-stars');
    const planetsLayer = document.querySelector('.planets-layer');
    const nebula = document.querySelector('.nebula');
    
    // Create static stars
    for (let i = 0; i < 400; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        starsLayer.appendChild(star);
    }
    
    // Create moving stars
    for (let i = 0; i < 100; i++) {
        const movingStar = document.createElement('div');
        movingStar.className = 'moving-star';
        movingStar.style.left = Math.random() * 100 + '%';
        movingStar.style.top = Math.random() * 100 + '%';
        movingStar.style.animationDelay = Math.random() * 10 + 's';
        movingStar.style.animationDuration = (Math.random() * 20 + 15) + 's';
        movingStars.appendChild(movingStar);
    }
    
    // Create planets with realistic space movement
    const planetData = [
        { size: 12, color: '#ff6b6b', glow: '#ff6b6b' },
        { size: 8, color: '#4834d4', glow: '#4834d4' },
        { size: 15, color: '#ff9ff3', glow: '#ff9ff3' },
        { size: 10, color: '#3742fa', glow: '#3742fa' },
        { size: 6, color: '#2ed573', glow: '#2ed573' },
        { size: 14, color: '#ffa502', glow: '#ffa502' },
        { size: 9, color: '#70a1ff', glow: '#70a1ff' },
        { size: 11, color: '#ff4757', glow: '#ff4757' },
        { size: 7, color: '#a55eea', glow: '#a55eea' },
        { size: 13, color: '#26de81', glow: '#26de81' }
    ];
    
    planetData.forEach((planet, index) => {
        const planetEl = document.createElement('div');
        planetEl.className = 'space-planet';
        planetEl.style.width = planet.size + 'px';
        planetEl.style.height = planet.size + 'px';
        planetEl.style.left = Math.random() * 100 + '%';
        planetEl.style.top = Math.random() * 100 + '%';
        planetEl.style.background = `radial-gradient(circle at 30% 30%, ${planet.color}, ${planet.color}88)`;
        planetEl.style.boxShadow = `0 0 ${planet.size * 2}px ${planet.glow}66`;
        planetEl.style.animationDelay = Math.random() * 30 + 's';
        planetEl.style.animationDuration = (Math.random() * 40 + 30) + 's';
        planetsLayer.appendChild(planetEl);
    });
    
    // Create nebula effect
    for (let i = 0; i < 5; i++) {
        const nebulaEl = document.createElement('div');
        nebulaEl.className = 'nebula-cloud';
        nebulaEl.style.left = Math.random() * 100 + '%';
        nebulaEl.style.top = Math.random() * 100 + '%';
        nebulaEl.style.animationDelay = Math.random() * 20 + 's';
        nebula.appendChild(nebulaEl);
    }
}

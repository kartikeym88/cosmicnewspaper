const API_KEY = "bT8GecFG6RdFe2ywdkafe1wMsMwmoXNcyMGi5CqO";
const launchAPI = "https://ll.thespacedevs.com/2.2.0/launch/";

document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('date-input');
    
    // Set today's date as default
    dateInput.value = today;
    
    // Disable future dates
    dateInput.setAttribute('max', today);
    
    // Add event listener for date validation
    dateInput.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const currentDate = new Date();
        
        if (selectedDate > currentDate) {
            alert('Future dates are not allowed. Please select a past or current date.');
            this.value = today;
        }
    });
    
    fetchCosmicNews();
    createStarryBackground();
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
        
        // Fetch launches
        const launchResponse = await fetch(`${launchAPI}?net__gte=${date}T00:00:00Z&net__lte=${date}T23:59:59Z&limit=5`);
        const launchData = await launchResponse.json();
        
        displayContent(apodData, launchData.results, date);
        
    } catch (error) {
        mainContent.innerHTML = `
            <div class="error">
                <h2>🛸 Communication Error</h2>
                <p>Could not fetch data from the cosmic network. Please try again later.</p>
            </div>
        `;
    }
}

function displayContent(apod, launches, date) {
    const mainContent = document.getElementById("main-content");
    const launchesContent = document.getElementById("launches-content");
    
    // Display APOD
    mainContent.innerHTML = `
        <div class="headline-section visible">
            ${apod.media_type === 'image' ? 
                `<img src="${apod.url}" alt="${apod.title}" class="apod-image">` : 
                `<iframe src="${apod.url}" class="apod-image" frameborder="0"></iframe>`
            }
            <h1 class="headline">${apod.title}</h1>
            <p class="byline">NASA Astronomy Picture of the Day • ${formatDate(date)}</p>
            <div class="article-content">
                <p>${apod.explanation}</p>
            </div>
        </div>
    `;
    
    // Display launches with dates
    if (launches && launches.length > 0) {
        launchesContent.innerHTML = launches.map(launch => `
            <div class="launch-item">
                <div class="launch-name">${launch.name}</div>
                <div class="launch-details">
                    <strong>Date:</strong> ${formatLaunchDate(launch.net)}<br>
                    <strong>Location:</strong> ${launch.pad?.location?.name || 'Unknown'}<br>
                    <strong>Agency:</strong> ${launch.launch_service_provider?.name || 'Unknown'}
                </div>
            </div>
        `).join('');
    } else {
        launchesContent.innerHTML = `
            <div class="launch-item">
                <div class="launch-name">No launches scheduled</div>
                <div class="launch-details">Check back for future missions to the stars!</div>
            </div>
        `;
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatLaunchDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function createStarryBackground() {
    const starsContainer = document.querySelector('.stars-background');
    const twinklingContainer = document.querySelector('.twinkling');
    const planetsContainer = document.querySelector('.planets');
    
    // Create stars
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        starsContainer.appendChild(star);
    }
    
    // Create twinkling effect
    for (let i = 0; i < 50; i++) {
        const twinkle = document.createElement('div');
        twinkle.className = 'twinkle';
        twinkle.style.left = Math.random() * 100 + '%';
        twinkle.style.top = Math.random() * 100 + '%';
        twinkle.style.animationDelay = Math.random() * 5 + 's';
        twinklingContainer.appendChild(twinkle);
    }
    
    // Create small planets
    for (let i = 0; i < 8; i++) {
        const planet = document.createElement('div');
        planet.className = 'small-planet';
        planet.style.left = Math.random() * 100 + '%';
        planet.style.top = Math.random() * 100 + '%';
        planet.style.animationDelay = Math.random() * 10 + 's';
        planetsContainer.appendChild(planet);
    }
}

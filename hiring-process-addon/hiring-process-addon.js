let testProgress = 0;
const totalSteps = 5;
// Remove the declaration of 's' here, as it's likely declared in the main LibreSpeed script

async function getLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        } else {
            reject("Geolocation is not supported by this browser.");
        }
    });
}

async function getSystemInfo() {
    const info = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenWidth: screen.width,
        screenHeight: screen.height,
        colorDepth: screen.colorDepth,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        localStorageAvailable: !!window.localStorage,
        connectionType: navigator.connection ? navigator.connection.effectiveType : 'Unknown'
    };
    return info;
}

async function testBandwidth() {
    console.log("Starting bandwidth test...");
    return new Promise((resolve, reject) => {
        if (typeof s === 'undefined' || s === null) {
            reject("LibreSpeed's 's' variable is not defined. Make sure LibreSpeed is properly initialized.");
            return;
        }

        s.onend = function(aborted) {
            if (aborted) {
                reject("Bandwidth test aborted");
            } else {
                console.log("Bandwidth test completed:", s.results);
                resolve({
                    downloadSpeed: (s.results.download / 1000000).toFixed(2),
                    uploadSpeed: (s.results.upload / 1000000).toFixed(2),
                    latency: s.results.ping.toFixed(2),
                    jitter: s.results.jitter.toFixed(2),
                });
            }
        };

        s.onprogress = function(progress, result) {
            console.log("Bandwidth test progress:", progress, result);
        };

        console.log("Starting bandwidth test now...");
        s.start();
    });
}

async function runTests() {
    try {
        updateProgress("Collecting system information...");
        const systemInfo = await getSystemInfo();
        document.getElementById("system-info").textContent = JSON.stringify(systemInfo, null, 2);
        
        updateProgress("Getting geolocation...");
        let latitude = 'N/A';
        let longitude = 'N/A';
        let mapLink = 'N/A';
        try {
            const position = await getLocation();
            latitude = position.coords.latitude.toFixed(6);
            longitude = position.coords.longitude.toFixed(6);
            mapLink = `https://www.openstreetmap.org/#map=15/${latitude}/${longitude}`;
        } catch (geoError) {
            console.warn("Geolocation error:", geoError);
        }
        
        updateProgress("Testing bandwidth...");
        const { downloadSpeed, uploadSpeed, latency, jitter } = await testBandwidth();
        
        updateProgress("Preparing data for submission...");
        const formData = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            address: document.getElementById("address-input").value,
            city: document.getElementById("city").value,
            state: document.getElementById("state").value,
            zip: document.getElementById("zip").value,
            phone: document.getElementById("phone").value,
            latitude,
            longitude,
            mapLink,
            downloadSpeed,
            uploadSpeed,
            latency,
            jitter,
            systemInfo
        };
        
        updateProgress("Submitting data...");
        await submitData(formData);
        
        document.getElementById("progress-container").style.display = "none";
        document.getElementById("completion-message").style.display = "block";
        document.getElementById("completion-message").innerHTML += `
            <p><i class="fas fa-tachometer-alt info-icon"></i> Download Speed: ${downloadSpeed} Mbps</p>
            <p><i class="fas fa-upload info-icon"></i> Upload Speed: ${uploadSpeed} Mbps</p>
            <p><i class="fas fa-clock info-icon"></i> Latency: ${latency} ms</p>
            <p><i class="fas fa-random info-icon"></i> Jitter: ${jitter} ms</p>
            <p><i class="fas fa-map-marker-alt info-icon"></i> Location: <a href="${mapLink}" target="_blank">${latitude}, ${longitude}</a></p>
        `;
    } catch (error) {
        console.error("Error during tests:", error);
        document.getElementById("completion-message").innerHTML += `<p class="error"><i class="fas fa-exclamation-triangle"></i> Error: ${error.message}</p>`;
        document.getElementById("completion-message").style.display = "block";
    }
}

async function submitData(formData) {
    const adaptiveCard = {
        type: "message",
        attachments: [
            {
                contentType: "application/vnd.microsoft.card.adaptive",
                contentUrl: null,
                content: {
                    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
                    type: "AdaptiveCard",
                    version: "1.2",
                    body: [
                        {
                            type: "TextBlock",
                            size: "Medium",
                            weight: "Bolder",
                            text: "Applicant Information and System Test Results"
                        },
                        {
                            type: "FactSet",
                            facts: [
                                { title: "Name:", value: formData.name },
                                { title: "Email:", value: formData.email },
                                { title: "Address:", value: formData.address },
                                { title: "City:", value: formData.city },
                                { title: "State:", value: formData.state },
                                { title: "ZIP:", value: formData.zip },
                                { title: "Phone:", value: formData.phone },
                                { title: "Latitude:", value: formData.latitude },
                                { title: "Longitude:", value: formData.longitude },
                                { title: "Map Link:", value: formData.mapLink },
                                { title: "Download Speed:", value: formData.downloadSpeed + " Mbps" },
                                { title: "Upload Speed:", value: formData.uploadSpeed + " Mbps" },
                                { title: "Latency:", value: formData.latency + " ms" },
                                { title: "Jitter:", value: formData.jitter + " ms" }
                            ]
                        },
                        {
                            type: "TextBlock",
                            size: "Medium",
                            weight: "Bolder",
                            text: "System Information"
                        },
                        {
                            type: "FactSet",
                            facts: Object.entries(formData.systemInfo).map(([key, value]) => ({
                                title: key + ":",
                                value: value.toString()
                            }))
                        }
                    ]
                }
            }
        ]
    };

    try {
        const response = await fetch(hiringProcessAddonSettings.webhook_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adaptiveCard)
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log("Server response:", responseText);

        if (responseText.trim() === "") {
            return { status: "success", message: "Data submitted successfully" };
        }

        return JSON.parse(responseText);
    } catch (error) {
        console.error("Error submitting data:", error);
        throw new Error(`Failed to submit data: ${error.message}`);
    }
}

function updateProgress(message) {
    testProgress++;
    const percentage = Math.round((testProgress / totalSteps) * 100);
    document.getElementById("progress-bar-inner").style.width = `${percentage}%`;
    document.getElementById("progress-bar-inner").textContent = `${percentage}%`;
    document.getElementById("progress-message").textContent = message;
}

function beginTest() {
    document.getElementById("progress-container").style.display = "block";
    document.getElementById("system-info-container").style.display = "block";
    runTests();
}

function initHiringProcessAddon() {
    const addonContainer = document.getElementById('hiringProcessAddon');
    if (!addonContainer) {
        console.error("Hiring process addon container not found");
        return;
    }

    addonContainer.innerHTML = `
        <div id="hiring-process-test">
            <h2>Hiring Process Test</h2>
            <form id="applicant-info">
                <input type="text" id="name" placeholder="Full Name" required>
                <input type="email" id="email" placeholder="Email" required>
                <input type="text" id="address-input" placeholder="Address" required>
                <input type="text" id="city" placeholder="City" required>
                <input type="text" id="state" placeholder="State" required>
                <input type="text" id="zip" placeholder="ZIP Code" required>
                <input type="tel" id="phone" placeholder="Phone Number" required>
                <button type="button" id="begin-test-btn">Begin Test</button>
            </form>
            <div id="progress-container" style="display:none;">
                <div id="progress-bar">
                    <div id="progress-bar-inner"></div>
                </div>
                <p id="progress-message"></p>
            </div>
            <div id="system-info-container" style="display:none;">
                <h3>System Information</h3>
                <pre id="system-info"></pre>
            </div>
            <div id="completion-message" style="display:none;">
                <h3>Test Completed</h3>
            </div>
        </div>
    `;
    
    const beginTestBtn = document.getElementById('begin-test-btn');
    if (beginTestBtn) {
        beginTestBtn.addEventListener('click', beginTest);
    } else {
        console.error("Begin Test button not found");
    }

    // Initialize LibreSpeed
    if (typeof Speedtest !== 'undefined') {
        window.s = new Speedtest();
        window.s.setParameter("telemetry_level", "basic");
    } else {
        console.error("LibreSpeed's Speedtest object is not available");
    }
}

// Make initHiringProcessAddon globally accessible
window.initHiringProcessAddon = initHiringProcessAddon;

// Initialize the addon when the page is ready
document.addEventListener('DOMContentLoaded', function() {
    initHiringProcessAddon();
});

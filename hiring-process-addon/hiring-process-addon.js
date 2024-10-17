let testProgress = 0;
const totalSteps = 5;

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
        
        updateProgress("Starting speed test...");
        window.startStop(); // Use the existing LibreSpeed startStop function
        
        // The rest of the test results will be handled by LibreSpeed's UI update function
        
        updateProgress("Test completed");
        document.getElementById("completion-message").style.display = "block";
        document.getElementById("completion-message").innerHTML += `
            <p><i class="fas fa-map-marker-alt info-icon"></i> Location: <a href="${mapLink}" target="_blank">${latitude}, ${longitude}</a></p>
        `;
    } catch (error) {
        console.error("Error during tests:", error);
        document.getElementById("completion-message").innerHTML += `<p class="error"><i class="fas fa-exclamation-triangle"></i> Error: ${error.message}</p>`;
        document.getElementById("completion-message").style.display = "block";
    }
}

async function submitData() {
    const formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        address: document.getElementById("address-input").value,
        city: document.getElementById("city").value,
        state: document.getElementById("state").value,
        zip: document.getElementById("zip").value,
        phone: document.getElementById("phone").value,
        downloadSpeed: document.getElementById("dlText").textContent,
        uploadSpeed: document.getElementById("ulText").textContent,
        latency: document.getElementById("pingText").textContent,
        jitter: document.getElementById("jitText").textContent,
        ip: document.getElementById("ip").textContent
    };

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
                            facts: Object.entries(formData).map(([key, value]) => ({
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

function validateForm() {
    const form = document.getElementById('applicant-info');
    return form.checkValidity();
}

function initHiringProcessAddon() {
    const testWrapper = document.getElementById('testWrapper');
    if (!testWrapper) {
        console.error("Test wrapper not found");
        return;
    }

    const addonForm = document.createElement('div');
    addonForm.id = 'hiring-process-test';
    addonForm.innerHTML = `
        <h2>Hiring Process Test</h2>
        <form id="applicant-info">
            <input type="text" id="name" placeholder="Full Name" required>
            <input type="email" id="email" placeholder="Email" required>
            <input type="text" id="address-input" placeholder="Address" required>
            <input type="text" id="city" placeholder="City" required>
            <input type="text" id="state" placeholder="State" required>
            <input type="text" id="zip" placeholder="ZIP Code" required>
            <input type="tel" id="phone" placeholder="Phone Number" required>
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
    `;
    
    testWrapper.insertBefore(addonForm, testWrapper.firstChild);

    // Modify the existing startStopBtn to handle form validation, test start, and data submission
    const startStopBtn = document.getElementById('startStopBtn');
    if (startStopBtn) {
        const originalOnclick = startStopBtn.onclick;
        startStopBtn.onclick = function() {
            if (this.className !== 'running') {
                // If the test is not running, validate the form before starting
                if (!validateForm()) {
                    alert('Please fill out all required fields before starting the test.');
                    return;
                }
                runTests();
            } else {
                // If the test is running, just stop it
                originalOnclick.call(this);
            }
        };
    } else {
        console.error("Start/Stop button not found");
    }

    // Modify the LibreSpeed onend callback to submit data after test completion
    if (typeof s !== 'undefined' && s.onend) {
        const originalOnend = s.onend;
        s.onend = function(aborted) {
            originalOnend.call(this, aborted);
            if (!aborted) {
                submitData();
            }
        };
    } else {
        console.error("LibreSpeed's 's' object or onend callback not found");
    }
}

// Make initHiringProcessAddon globally accessible
window.initHiringProcessAddon = initHiringProcessAddon;

// Initialize the addon when the page is ready
document.addEventListener('DOMContentLoaded', function() {
    initHiringProcessAddon();
});

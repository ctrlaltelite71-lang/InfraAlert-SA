/* ==========================
   INFRAALERT SA SCRIPT
========================== */

// Store reports
let reports = [];

// Map variables
let map;
let marker;

/* ==========================
   LANGUAGE TRANSLATIONS
========================== */

const translations = {

    English: {
        welcome: "Welcome",
        report: "📢 Report",
        track: "📍 Track",
        alerts: "🚨 Alerts",
        dashboard: "🏛️ Dashboard"
    },
	
	isiZulu: {
        welcome: "Siyakwamukela",
        report: "📢 Bika Inkinga",
        track: "📍 Landela",
        alerts: "🚨 Izexwayiso",
        dashboard: "🏛️ Ideshibhodi"
    },

    isiXhosa: {
        welcome: "Wamkelekile",
        report: "📢 Xela Ingxaki",
        track: "📍 Landela",
        alerts: "🚨 Izilumkiso",
        dashboard: "🏛️ Ideshibhodi"
    },

Afrikaans: {
        welcome: "Welkom",
        report: "📢 Rapporteer",
        track: "📍 Volg",
        alerts: "🚨 Waarskuwings",
        dashboard: "🏛️ Dashboard"
    },
};


/* ==========================
   TRANSLATION API
========================== */

async function translateText(text, targetLanguage) {

    try {

        const response = await fetch(
            "https://translate.argosopentech.com/translate",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    q: text,
                    source: "auto",
                    target: targetLanguage,
                    format: "text"
                })
            }
        );

        const data = await response.json();

        return data.translatedText;

    } catch (error) {

        console.error(error);

        return text;
    }
}

/* ==========================
   LANGUAGE CODES
========================== */

const languageCodes = {

    English: "en",
    isiZulu: "zu",
    isiXhosa: "xh",
    Afrikaans: "af",
    Sesotho: "st",
    Setswana: "tn",
    Sepedi: "nso",
    Xitsonga: "ts",
    Tshivenda: "ve",
    siswati: "ss",
    isiNdebele: "nr"
};

/* ==========================
   SCREEN NAVIGATION
========================== */

function showScreen(screenId) {

    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    document.getElementById(screenId).classList.add('active');

    if(screenId === "reportScreen"){
        setTimeout(initMap, 300);
    }
}

/* ==========================
   LANGUAGE SWITCH
========================== */

function changeLanguage(){

    const lang =
        document.getElementById("languageSelect").value;

    if(!translations[lang]){
        return;
    }

    document.getElementById("welcomeText").innerText =
        translations[lang].welcome;

    document.getElementById("reportBtn").innerText =
        translations[lang].report;

    document.getElementById("trackBtn").innerText =
        translations[lang].track;

    document.getElementById("alertsBtn").innerText =
        translations[lang].alerts;

    document.getElementById("dashboardBtn").innerText =
        translations[lang].dashboard;

    document.getElementById("notificationBar").innerText =
        `Language changed to ${lang}`;
}

/* ==========================
   MAP INITIALIZATION
========================== */

function initMap() {

    if(map) return;

    map = L.map('map').setView([-33.9249, 18.4241], 13);

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
            attribution: '&copy; OpenStreetMap'
        }
    ).addTo(map);
}

/* ==========================
   GPS LOCATION
========================== */

function getLocation() {

    if(!navigator.geolocation){

        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(

        function(position){

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            document.getElementById("locationDisplay").innerHTML =
                `Latitude: ${lat.toFixed(5)}<br>Longitude: ${lng.toFixed(5)}`;

            document.getElementById("location").value =
                `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

            if(!map){
                initMap();
            }

            map.setView([lat, lng], 16);

            if(marker){
                map.removeLayer(marker);
            }

            marker = L.marker([lat, lng]).addTo(map)
                .bindPopup("Issue Location")
                .openPopup();
        },

        function(){
            alert("Unable to retrieve location");
        }
    );
}

/* ==========================
   VOICE REPORT
========================== */

function startVoiceReport() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if(!SpeechRecognition){

        alert("Voice recognition not supported in this browser.");
        return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-ZA";
    recognition.start();

    document.getElementById("notificationBar").innerHTML =
        "🎤 Listening...";

    recognition.onresult = function(event){

        const transcript =
            event.results[0][0].transcript;

        document.getElementById("description").value =
            transcript;

        document.getElementById("notificationBar").innerHTML =
            "Voice report captured";
    };
}

/* ==========================
   REFERENCE GENERATOR
========================== */

function generateReference(){

    const random =
        Math.floor(Math.random() * 9000) + 1000;

    return `INF-${new Date().getFullYear()}-${random}`;
}

/* ==========================
   SUBMIT REPORT
========================== */

async function submitReport() {

    const fullname =
        document.getElementById("fullname").value;

    const location =
        document.getElementById("location").value;

    const issueType =
        document.getElementById("issueType").value;

    const description =
        document.getElementById("description").value;
		
	const photo =
        document.getElementById("issuePhoto").files[0];

    const selectedLanguage =
        document.getElementById("languageSelect").value;

    if (
        fullname === "" ||
        location === "" ||
        description === ""
    ) {

        alert("Please complete all fields");
        return;
    }

    document.getElementById("notificationBar").innerHTML =
        "🌍 Translating report...";

    const translatedDescription =
        await translateText(description, "en");
		
		let photoURL = "";

    if(photo){

    photoURL =
        URL.createObjectURL(photo);
}

    const reference =
        generateReference();

    const report = {

        reference,
        fullname,
        location,
        issueType,

        originalLanguage: selectedLanguage,

        originalDescription: description,

        translatedDescription:

            translatedDescription,

        status:
            "Assigned to Municipality",

        date:
            new Date().toLocaleString(),
			photoURL: photoURL
    };

    reports.push(report);

/* SAVE REPORTS */

localStorage.setItem(
    "infraReports",
    JSON.stringify(reports)
);

/* SHOW RESULT */

document.getElementById("reportResult").innerHTML = `

    <div class="alert-card">

        <h3>✅ Report Submitted</h3>

        <p><strong>Reference:</strong>
        ${reference}</p>

        <p><strong>Status:</strong>
        Assigned to Municipality</p>

        <p><strong>Original Report:</strong>
        ${description}</p>

        <p><strong>English Translation:</strong>
        ${translatedDescription}</p>
		
		${
photoURL
?
`<img src="${photoURL}"
style="width:100%;max-height:250px;margin-top:10px;">`
:
""
}

    </div>
`;

document.getElementById("notificationBar").innerHTML =
    `New report submitted: ${reference}`;

document.getElementById("fullname").value = "";
document.getElementById("location").value = "";
document.getElementById("description").value = "";
document.getElementById("issuePhoto").value = "";
}

/* ==========================
   STARTUP
========================== */

window.onload = function(){

    const savedReports =
        localStorage.getItem("infraReports");

    if(savedReports){

        reports = JSON.parse(savedReports);
    }

    document.getElementById("notificationBar").innerHTML =
        "Welcome to InfraAlert SA";

    loadDashboard();
};
// Globale Buchungsdaten
let buchung = {
    von: "Magdeburg Hbf", 
    nach: "",
    klasse: "2",
    rabatt: "kein",
    baNummer: "",
    gutscheinCode: "",
    gutscheinRabatt: 0, // Prozentualer Rabatt (z.B. 0.20 für 20%)
    echtDrucken: true   // Steuert, ob der Pi-Drucker angesteuert wird
};

// Hier speichern wir die Bahnhöfe aus der JSON-Datei
let bahnhoefe = [];
let aktivesFeld = "nach"; 

// LIVE-LADEN DER BAHNHOEFE AUS DER JSON-DATEI
async function ladeBahnhoefe() {
    try {
        const response = await fetch('bahnhoefe.json');
        bahnhoefe = await response.json();
        bahnhoefe.sort();
        console.log(`${bahnhoefe.length} Bahnhöfe erfolgreich geladen.`);
    } catch (error) {
        console.error("Fehler beim Laden der Bahnhofsdaten:", error);
        bahnhoefe = ["Magdeburg Hbf", "Zerbst/Anhalt", "Berlin Hbf"];
    }
    zeigeSchritt1();
}

function updateUhrzeit() {
    const uhrzeitElement = document.getElementById('uhrzeit');
    if (uhrzeitElement) {
        const jetzt = new Date();
        uhrzeitElement.textContent = jetzt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }
}
setInterval(updateUhrzeit, 1000);

// SCHRITT 1: Stationen wählen
function zeigeSchritt1() {
    const title = document.getElementById('menue-titel');
    if (title) title.textContent = "Start / Ziel wählen";
    
    const display = document.getElementById('display');
    if (!display) return;

    display.innerHTML = `
        <h3>Reiseverbindung eingeben</h3>
        
        <label style="font-size:0.9rem; font-weight:bold;">Abfahrtsbahnhof:</label>
        <div id="feld-von" class="input-box ${aktivesFeld==='von'?'active':''}" onclick="setzeAktivesFeld('von')">${buchung.von || 'Bitte tippen...'}</div>
        
        <label style="font-size:0.9rem; font-weight:bold;">Zielbahnhof:</label>
        <div id="feld-nach" class="input-box ${aktivesFeld==='nach'?'active':''}" onclick="setzeAktivesFeld('nach')">${buchung.nach || 'Bitte tippen...'}</div>
        
        <div id="vorschläge" class="vorschlag-liste" style="display:none;"></div>
        
        <div class="tastatur">
            ${"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => `<div class="key" onclick="tippeBuchstabe('${l}')">${l}</div>`).join("")}
            <div class="key" onclick="tippeBuchstabe(' ')">LEER</div>
            <div class="key" onclick="tippeBuchstabe('-')">-</div>
            <div class="key" onclick="tippeBuchstabe('/')">/</div>
            <div class="key wide" style="background:#e74c3c; color:white;" onclick="loescheBuchstabe()">⌫</div>
        </div>
        
        <button class="btn-weiter" onclick="pruefeSchritt1()">Weiter zur Ticket-Auswahl ➔</button>
    `;

    rendereNavigation("start");
    updateUhrzeit();
}

function setzeAktivesFeld(feld) {
    aktivesFeld = feld;
    zeigeSchritt1();
}

function tippeBuchstabe(b) {
    if(aktivesFeld === "von") buchung.von += b;
    if(aktivesFeld === "nach") buchung.nach += b;
    zeigeSchritt1();
    zeigeVorschlaege();
}

function loescheBuchstabe() {
    if(aktivesFeld === "von") buchung.von = buchung.von.slice(0, -1);
    if(aktivesFeld === "nach") buchung.nach = buchung.nach.slice(0, -1);
    zeigeSchritt1();
    zeigeVorschlaege();
}

function zeigeVorschlaege() {
    const suchText = (aktivesFeld === "von" ? buchung.von : buchung.nach).toUpperCase();
    const vDiv = document.getElementById('vorschläge');
    if(!vDiv) return;
    
    if(suchText.length < 1) { vDiv.style.display = "none"; return; }

    const treffer = bahnhoefe.filter(b => b.toUpperCase().includes(suchText));
    if(treffer.length > 0) {
        vDiv.style.display = "block";
        vDiv.innerHTML = treffer.slice(0, 5).map(t => `<div class="vorschlag-item" onclick="waehleVorschlag('${t}')">${t}</div>`).join(""); 
    } else {
        vDiv.style.display = "none";
    }
}

function waehleVorschlag(bahnhof) {
    if(aktivesFeld === "von") buchung.von = bahnhof;
    if(aktivesFeld === "nach") buchung.nach = bahnhof;
    const vDiv = document.getElementById('vorschläge');
    if (vDiv) vDiv.style.display = "none";
    zeigeSchritt1();
}

function pruefeSchritt1() {
    if(!buchung.von || !buchung.nach) {
        alert("Bitte geben Sie Start und Ziel ein!");
        return;
    }
    zeigeSchritt2();
}

// SCHRITT 2: Klasse, Sonderangebote, BA-Nummer
function zeigeSchritt2() {
    document.getElementById('menue-titel').textContent = "Klasse & Rabatte wählen";
    const display = document.getElementById('display');

    display.innerHTML = `
        <h3>Klasse & Sonderangebote</h3>
        
        <p style="font-weight:bold; margin-bottom:5px;">Wählen Sie die Wagenklasse:</p>
        <div class="optionen-grid">
            <div class="opt-card ${buchung.klasse==='2'?'selected':''}" onclick="buchung.klasse='2'; zeigeSchritt2();">2. Klasse</div>
            <div class="opt-card ${buchung.klasse==='1'?'selected':''}" onclick="buchung.klasse='1'; zeigeSchritt2();">1. Klasse</div>
        </div>
        
        <p style="font-weight:bold; margin-bottom:5px;">Tarif / Sonderangebot:</p>
        <div class="optionen-grid">
            <div class="opt-card ${buchung.rabatt==='kein'?'selected':''}" onclick="buchung.rabatt='kein'; zeigeSchritt2();">Normaltarif</div>
            <div class="opt-card ${buchung.rabatt==='bundeswehr'?'selected':''}" onclick="buchung.rabatt='bundeswehr'; zeigeSchritt2();">Bundeswehr (in Uniform)</div>
            <div class="opt-card ${buchung.rabatt==='mitarbeiter'?'selected':''}" onclick="buchung.rabatt='mitarbeiter'; zeigeSchritt2();">DB-Mitarbeiter (Fahrvergünstigung)</div>
        </div>
        
        ${buchung.rabatt === 'mitarbeiter' ? `
            <label style="font-size:0.9rem; font-weight:bold; color:var(--db-rot);">Bitte BA-Nummer (Personalnummer) eingeben:</label>
            <input type="text" id="baInput" placeholder="z.B. BA123456" value="${buchung.baNummer}" oninput="buchung.baNummer=this.value" style="width:95%; padding:10px; font-size:1.1rem; margin-top:5px; border:2px solid var(--db-rot);">
        ` : ''}
        
        <button class="btn-weiter" onclick="berechneUndZahle()">Weiter zur Zahlung ➔</button>
    `;

    rendereNavigation("schritt2");
}

// SCHRITT 3: Preisberechnung, Rabatt-Codes und Druckabfrage
function berechneUndZahle() {
    if(buchung.rabatt === 'mitarbeiter' && !buchung.baNummer) {
        alert("Für den Mitarbeitertarif wird eine gültige BA-Nummer benötigt!");
        return;
    }

    document.getElementById('menue-titel').textContent = "Zahlung & Optionen";
    const display = document.getElementById('display');

    // Basispreis-Simulation
    let preis = Math.abs(buchung.nach.length - buchung.von.length) * 2.10 + 4.20;
    if(buchung.klasse === "1") preis *= 1.6; 

    if(buchung.rabatt === 'bundeswehr') preis = 0.00; 
    if(buchung.rabatt === 'mitarbeiter') preis *= 0.10; 

    // Rabattcode-Server Abfrage
    if (buchung.gutscheinRabatt > 0) {
        preis = preis * (1 - buchung.gutscheinRabatt);
    }

    const gerundeterPreis = parseFloat(preis.toFixed(2));

    display.innerHTML = `
        <h3>Zahlung</h3>
        <div style="background:white; padding:15px; border:1px solid #ccc; margin-bottom:15px; border-radius:4px;">
            <p><strong>Verbindung:</strong> ${buchung.von} ➔ ${buchung.nach}</p>
            <p><strong>Klasse:</strong> ${buchung.klasse}. Klasse</p>
            <p><strong>Tarif:</strong> ${buchung.rabatt === 'mitarbeiter' ? `Mitarbeiter-Rabatt (BA: ${buchung.baNummer})` : buchung.rabatt === 'bundeswehr' ? 'Bundeswehr Freifahrt' : 'Normaltarif'}</p>
            ${buchung.gutscheinCode ? `<p style="color:green;"><strong>Gutschein angewendet:</strong> ${buchung.gutscheinCode} (-${buchung.gutscheinRabatt * 100}%)</p>` : ''}
        </div>

        <div class="discount-section" style="background:#eaeded; padding:12px; margin-bottom:15px; border-radius:4px;">
            <label style="font-weight:bold; font-size:0.9rem; display:block; margin-bottom:5px;">Gutscheincode / Rabattcode:</label>
            <div style="display:flex; gap:10px;">
                <input type="text" id="couponInput" placeholder="z.B. BAHN50" value="${buchung.gutscheinCode}" style="flex-grow:1; padding:8px; font-size:1rem; border:1px solid #a0a5a8; text-transform:uppercase;">
                <button onclick="loeseGutscheineInLine()" style="background:var(--db-grau-dunkel); color:white; border:none; padding:8px 15px; font-weight:bold; border-radius:4px;">Einlösen</button>
            </div>
            <div id="couponStatus" style="font-size:0.85rem; margin-top:5px; font-weight:bold;"></div>
        </div>

        <div class="print-toggle-section" style="background:white; padding:15px; border:2px solid #bdc3c7; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center; border-radius:4px;">
            <div>
                <strong style="display:block; font-size:1.05rem;">Ticket physisch drucken?</strong>
                <span style="font-size:0.85rem; color:#7f8c8d;">Schalte dies aus, um Papier auf der Bonrolle zu sparen.</span>
            </div>
            <label class="switch">
                <input type="checkbox" id="printToggle" ${buchung.echtDrucken ? 'checked' : ''} onchange="buchung.echtDrucken=this.checked">
                <span class="slider round"></span>
            </label>
        </div>
        
        <p style="font-size: 1.8rem; color: var(--db-rot); font-weight: bold; text-align:center; margin: 20px 0;">
            Gesamtpreis: ${gerundeterPreis.toFixed(2).replace('.', ',')} €
        </p>
        
        <div class="optionen-grid">
            <button class="btn-weiter" style="background:#27ae60; margin:0;" onclick="druckeTicket(${gerundeterPreis})">💳 Karte</button>
            <button class="btn-weiter" style="background:#2980b9; margin:0;" onclick="druckeTicket(${gerundeterPreis})">🪙 Bar</button>
        </div>
    `;
    rendereNavigation("zahlung");
}

function loeseGutscheineInLine() {
    const code = document.getElementById('couponInput').value.trim().toUpperCase();
    const statusDiv = document.getElementById('couponStatus');
    
    // Rabatt-Datenbank (Gutschein-Server)
    const rabattServer = {
        "PROZENT20": 0.20,
        "BAHN50": 0.50,
        "FREI": 1.00
    };

    if (code in rabattServer) {
        buchung.gutscheinCode = code;
        buchung.gutscheinRabatt = rabattServer[code];
        statusDiv.style.color = "green";
        statusDiv.innerText = `Code gültig! -${rabattServer[code]*100}% Rabatt angewendet.`;
        setTimeout(berechneUndZahle, 800);
    } else {
        statusDiv.style.color = "red";
        statusDiv.innerText = "Code ungültig oder abgelaufen!";
    }
}

// SCHRITT 4: Ticketdruck & Hardware-Schnittstelle
function druckeTicket(endPreis) {
    document.getElementById('menue-titel').textContent = "Ticket-Druck";
    const display = document.getElementById('display');
    const heute = new Date().toLocaleDateString('de-DE');
    const preisString = endPreis.toFixed(2).replace('.', ',');

    display.innerHTML = `
        <h3>${buchung.echtDrucken ? 'Fahrkarte wird ausgegeben...' : 'Virtuelles Ticket erstellt'}</h3>
        <p style="font-weight: bold; color: #27ae60; text-align:center;">
            ${buchung.echtDrucken ? 'Bitte entnehmen Sie Ihr gedrucktes Ticket am Automaten!' : 'Papierloser Druck aktiv. Ihr Ticket ist auf dem Screen sichtbar.'}
        </p>
        
        <div class="ticket-ausgabe">
            <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px;">
                <span>Deutsche Bahn</span>
                <span>${buchung.rabatt==='mitarbeiter'?'MITARBEITER-TICKET':'REGIO-TICKET'}</span>
            </div>
            <br>
            <div><strong>VON:</strong> ${buchung.von}</div>
            <div><strong>NACH:</strong> ${buchung.nach}</div>
            <br>
            <div>Klasse: ${buchung.klasse}. Klasse / 1 Erw.</div>
            <div>Tarif: ${buchung.rabatt.toUpperCase()}</div>
            ${buchung.baNummer ? `<div>Pers.-Nr (BA): ${buchung.baNummer}</div>` : ''}
            ${buchung.gutscheinCode ? `<div>RABATT-CODE: ${buchung.gutscheinCode}</div>` : ''}
            <div>Preis: ${preisString} EUR</div>
            <br>
            <div style="border-top:1px dashed #000; padding-top:5px; text-align:center; font-size:0.8rem;">
                Gültig am: ${heute}<br>
                ${buchung.echtDrucken ? '* * * PHYSISCHER DRUCK * * *' : '* * * DIGITAL-TICKET * * *'}<br>
                * * * GUTE REISE * * *
            </div>
        </div>
    `;
    rendereNavigation("fertig");

    // Nur an den Pi senden, wenn Hardware-Druck aktiv ist
    if (buchung.echtDrucken) {
        const ticketDaten = {
            von: buchung.von.trim(),
            nach: buchung.nach.trim(),
            klasse: buchung.klasse === "1" ? "1. Klasse" : "2. Klasse",
            rabatt: buchung.gutscheinCode ? `${buchung.rabatt.toUpperCase()} + ${buchung.gutscheinCode}` : buchung.rabatt,
            baNummer: buchung.baNummer,
            preis: preisString,  
            datum: "Sofortiger Fahrtantritt"
        };

        fetch('http://127.0.0.1:5000/print-ticket', {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticketDaten)
        })
        .then(response => response.json())
        .then(data => { console.log("Drucker-Server Rückmeldung:", data); })
        .catch(error => { console.warn("Drucker-Server offline.", error); });
    }
}

function rendereNavigation(schritt) {
    const nav = document.getElementById('navigation');
    if (!nav) return;
    
    if (schritt === "start") {
        nav.innerHTML = `
            <button class="btn-nav" onclick="location.reload()">🏠 Start</button>
            <button class="btn-nav">🌐 Sprache</button>
            <button class="btn-nav">❓ Hilfe</button>
        `;
    } else if (schritt === "schritt2") {
        nav.innerHTML = `
            <button class="btn-nav cancel" onclick="location.reload()">❌ Abbruch</button>
            <button class="btn-nav" onclick="zeigeSchritt1()">⬅ Zurück</button>
        `;
    } else if (schritt === "zahlung") {
        nav.innerHTML = `
            <button class="btn-nav cancel" onclick="location.reload()">❌ Abbruch</button>
            <button class="btn-nav" onclick="zeigeSchritt2()">⬅ Zurück</button>
        `;
    } else if (schritt === "fertig") {
        nav.innerHTML = `
            <button class="btn-nav" style="border-color:green; color:green;" onclick="location.reload()">🏠 Neuer Kauf</button>
        `;
    }
}

// AUTOMATISCHER TIMEOUT (INAKTIVITÄTS-RESET NACH 10 SEKUNDEN)
let inaktivitaetsTimer;
const TIMEOUT_ZEIT = 10000;

function starteInaktivitaetsTimer() {
    clearTimeout(inaktivitaetsTimer);
    inaktivitaetsTimer = setTimeout(() => {
        if (buchung.nach !== "" || buchung.baNummer !== "" || buchung.gutscheinCode !== "") {
            console.log("10s Inaktivität: Setze Automat lautlos zurück...");
            buchung = {
                von: "Magdeburg Hbf", nach: "", klasse: "2", rabatt: "kein",
                baNummer: "", gutscheinCode: "", gutscheinRabatt: 0, echtDrucken: true
            };
            aktivesFeld = "nach";
            zeigeSchritt1();
        }
    }, TIMEOUT_ZEIT);
}

function benutzerAktivitaet() { starteInaktivitaetsTimer(); }
window.addEventListener('click', benutzerAktivitaet);
window.addEventListener('touchstart', benutzerAktivitaet);

// Start-Trigger
ladeBahnhoefe();

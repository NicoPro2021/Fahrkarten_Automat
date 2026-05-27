// Globale Buchungsdaten
let buchung = {
    von: "Magdeburg Hbf", // Standard-Start
    nach: "",
    klasse: "2",
    rabatt: "kein",
    baNummer: ""
};

// Hier speichern wir die Bahnhöfe aus der JSON-Datei
let bahnhoefe = [];

// LIVE-LADEN DER BAHNHOEFE AUS DER JSON-DATEI
async function ladeBahnhoefe() {
    try {
        const response = await fetch('bahnhoefe.json');
        bahnhoefe = await response.json();
        // Sortiere die Bahnhöfe alphabetisch, wie bei der echten DB
        bahnhoefe.sort();
        console.log(`${bahnhoefe.length} Bahnhöfe erfolgreich geladen.`);
    } catch (error) {
        console.error("Fehler beim Laden der Bahnhofsdaten:", error);
        // Fallback, falls die Datei mal nicht lädt
        bahnhoefe = ["Magdeburg Hbf", "Zerbst/Anhalt", "Berlin Hbf"];
    }
    // Nach dem Laden die Startseite anzeigen
    zeigeSchritt1();
}

function updateUhrzeit() {
    const uhrzeitElement = document.getElementById('uhrzeit');
    const jetzt = new Date();
    uhrzeitElement.textContent = jetzt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateUhrzeit, 1000);
updateUhrzeit();

// SCHRITT 1: Stationen wählen
function zeigeSchritt1() {
    document.getElementById('menue-titel').textContent = "Start / Ziel wählen";
    const display = document.getElementById('display');
    
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
}

let aktivesFeld = "nach"; 

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
    if(suchText.length < 1) { vDiv.style.display = "none"; return; }
    
    // Durchsuche alle geladenen Bahnhöfe aus der JSON
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
    document.getElementById('vorschläge').style.display = "none";
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

// SCHRITT 3: Preisberechnung und Bezahlung
function berechneUndZahle() {
    if(buchung.rabatt === 'mitarbeiter' && !buchung.baNummer) {
        alert("Für den Mitarbeitertarif wird eine gültige BA-Nummer benötigt!");
        return;
    }

    document.getElementById('menue-titel').textContent = "Zahlung";
    const display = document.getElementById('display');
    
    // Basispreis-Simulation (Berechnung basierend auf Buchstaben-Länge als Platzhalter)
    let preis = Math.abs(buchung.nach.length - buchung.von.length) * 2.10 + 4.20;
    if(buchung.klasse === "1") preis *= 1.6; 
    
    if(buchung.rabatt === 'bundeswehr') preis = 0.00; 
    if(buchung.rabatt === 'mitarbeiter') preis *= 0.10; 

    display.innerHTML = `
        <h3>Zahlung</h3>
        <div style="background:white; padding:15px; border:1px solid #ccc; margin-bottom:15px;">
            <p><strong>Verbindung:</strong> ${buchung.von} ➔ ${buchung.nach}</p>
            <p><strong>Klasse:</strong> ${buchung.klasse}. Klasse</p>
            <p><strong>Tarif:</strong> ${buchung.rabatt === 'mitarbeiter' ? `Mitarbeiter-Rabatt (BA: ${buchung.baNummer})` : buchung.rabatt === 'bundeswehr' ? 'Bundeswehr Freifahrt' : 'Normaltarif'}</p>
        </div>
        
        <p style="font-size: 1.6rem; color: var(--db-rot); font-weight: bold; text-align:center; margin: 15px 0;">
            Gesamtpreis: ${preis.toFixed(2)} €
        </p>
        
        <div class="optionen-grid">
            <button class="btn-weiter" style="background:#27ae60; margin:0;" onclick="druckeTicket(${preis})">💳 Karte</button>
            <button class="btn-weiter" style="background:#2980b9; margin:0;" onclick="druckeTicket(${preis})">🪙 Bar</button>
        </div>
    `;
    rendereNavigation("zahlung");
}

// SCHRITT 4: Ticketdruck
function druckeTicket(endPreis) {
    document.getElementById('menue-titel').textContent = "Ticket-Druck";
    const display = document.getElementById('display');
    const heute = new Date().toLocaleDateString('de-DE');
    
    display.innerHTML = `
        <h3>Fahrkarte wird ausgegeben...</h3>
        
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
            <div>Preis: ${endPreis.toFixed(2)} EUR</div>
            <br>
            <div style="border-top:1px dashed #000; padding-top:5px; text-align:center; font-size:0.8rem;">
                Gültig am: ${heute}<br>
                * * * GUTE REISE * * *
            </div>
        </div>
    `;
    rendereNavigation("fertig");
}

function rendereNavigation(schritt) {
    const nav = document.getElementById('navigation');
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
            <button class="btn-nav" style="border-color:green; color:green;" onclick="location.reload()">🏠 Fertig / Neuer Kauf</button>
        `;
    }
}

// Start-Trigger: Lädt die JSON-Datei beim Website-Aufruf
ladeBahnhoefe();

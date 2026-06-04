// Globale Buchungsdaten
let buchung = {
    von: "Magdeburg Hbf", 
    nach: "",
    klasse: "2",
    rabatt: "kein",
    baNummer: "",
    gutscheinCode: "",
    gutscheinRabatt: 0, 
    echtDrucken: true   
};

let bahnhoefe = [];
let aktivesFeld = null; // null = Normalansicht, 'von'/'nach' = Vollbild-Suche aktiv

// LIVE-LADEN DER BAHNHOEFE AUS DER JSON-DATEI
async function ladeBahnhoefe() {
    try {
        const response = await fetch('bahnhoefe.json');
        bahnhoefe = await response.json();
        bahnhoefe.sort();
    } catch (error) {
        console.error("Fehler beim Laden der Bahnhofsdaten:", error);
        bahnhoefe = ["Magdeburg Hbf", "Zerbst/Anhalt", "Berlin Hbf", "Leipzig Hbf"];
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

// SCHRITT 1: Startseite / Stationsübersicht
function zeigeSchritt1() {
    const title = document.getElementById('menue-titel');
    if (title) title.textContent = "Start / Ziel wählen";
    
    const display = document.getElementById('display');
    if (!display) return;

    // Wenn ein Feld angeklickt wurde, öffnen wir die Vollbild-Suchmaske!
    if (aktivesFeld) {
        zeigeSuchMaske();
        return;
    }

    // Normalansicht im Querformat (Super clean, viel Platz)
    display.innerHTML = `
        <h3>Reiseverbindung eingeben</h3>
        
        <div class="station-container">
            <div class="station-row">
                <label>Abfahrtsbahnhof:</label>
                <div id="feld-von" class="input-box" onclick="setzeAktivesFeld('von')">
                    🚉 ${buchung.von || '<span class="placeholder">Bitte tippen...</span>'}
                </div>
            </div>
            
            <div class="station-row">
                <label>Zielbahnhof:</label>
                <div id="feld-nach" class="input-box" onclick="setzeAktivesFeld('nach')">
                    🎯 ${buchung.nach || '<span class="placeholder">Ziel eingeben (z.B. Ze)...</span>'}
                </div>
            </div>
        </div>
        
        <button class="btn-weiter" style="margin-top: auto;" onclick="pruefeSchritt1()">Weiter zur Ticket-Auswahl ➔</button>
    `;

    rendereNavigation("start");
    updateUhrzeit();
}

// NEU: Die Vollbild-Suchmaske, die sich über alles legt
function zeigeSuchMaske() {
    const display = document.getElementById('display');
    const suchText = (aktivesFeld === "von" ? buchung.von : buchung.nach).toUpperCase();
    
    let vorschlaegeHtml = "";
    if (suchText.length >= 1) {
        const treffer = bahnhoefe.filter(b => b.toUpperCase().includes(suchText));
        if (treffer.length > 0) {
            vorschlaegeHtml = treffer.slice(0, 3).map(t => `
                <div class="vorschlag-item-fullscreen" onclick="waehleVorschlag('${t}')">🚉 ${t}</div>
            `).join("");
        } else {
            vorschlaegeHtml = `<div class="such-kein-treffer">Keine Bahnhöfe gefunden...</div>`;
        }
    } else {
        vorschlaegeHtml = `<div class="such-kein-treffer">Bitte Buchstaben eintippen...</div>`;
    }

    display.innerHTML = `
        <div class="search-overlay">
            <div class="search-header-row">
                <h3>${aktivesFeld === 'von' ? 'Abfahrtsbahnhof' : 'Zielbahnhof'} suchen:</h3>
                <div class="search-current-value">${(aktivesFeld === "von" ? buchung.von : buchung.nach) || '...'}</div>
            </div>

            <div class="search-results-container">
                ${vorschlaegeHtml}
            </div>
            
            <div class="tastatur-fullscreen">
                ${"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => `<div class="key-fs" onclick="tippeBuchstabe('${l}')">${l}</div>`).join("")}
                <div class="key-fs" onclick="tippeBuchstabe(' ')">LEER</div>
                <div class="key-fs" onclick="tippeBuchstabe('-')">-</div>
                <div class="key-fs" onclick="tippeBuchstabe('/')">/</div>
                <div class="key-fs wide-fs" style="background:#e74c3c; color:white;" onclick="loescheBuchstabe()">⌫</div>
            </div>
            
            <button class="btn-schliessen-fs" onclick="schliesseTastatur()">Abbrechen / Zurück</button>
        </div>
    `;
}

function setzeAktivesFeld(feld) {
    aktivesFeld = feld;
    zeigeSchritt1();
}

function schliesseTastatur() {
    aktivesFeld = null;
    zeigeSchritt1();
}

function tippeBuchstabe(b) {
    if(!aktivesFeld) return;
    if(aktivesFeld === "von") buchung.von += b;
    if(aktivesFeld === "nach") buchung.nach += b;
    zeigeSuchMaske();
}

function loescheBuchstabe() {
    if(!aktivesFeld) return;
    if(aktivesFeld === "von") buchung.von = buchung.von.slice(0, -1);
    if(aktivesFeld === "nach") buchung.nach = buchung.nach.slice(0, -1);
    zeigeSuchMaske();
}

function waehleVorschlag(bahnhof) {
    if(aktivesFeld === "von") buchung.von = bahnhof;
    if(aktivesFeld === "nach") buchung.nach = bahnhof;
    
    aktivesFeld = null; // Suchmaske schließen
    zeigeSchritt1();    // Zurück zur Hauptseite
}

function pruefeSchritt1() {
    if(!buchung.von || !buchung.nach) {
        alert("Bitte geben Sie Start und Ziel ein!");
        return;
    }
    zeigeSchritt2();
}

// SCHRITT 2: Klasse, Sonderangebote
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
            <div class="opt-card ${buchung.rabatt==='bundeswehr'?'selected':''}" onclick="buchung.rabatt='bundeswehr'; zeigeSchritt2();">Bundeswehr</div>
            <div class="opt-card ${buchung.rabatt==='mitarbeiter'?'selected':''}" onclick="buchung.rabatt='mitarbeiter'; zeigeSchritt2();">DB-Mitarbeiter</div>
        </div>
        
        ${buchung.rabatt === 'mitarbeiter' ? `
            <label style="font-size:0.9rem; font-weight:bold; color:var(--db-rot); display:block; margin-top:5px;">BA-Nummer eingeben:</label>
            <input type="text" id="baInput" placeholder="BA123456" value="${buchung.baNummer}" oninput="buchung.baNummer=this.value" style="width:100%; padding:8px; font-size:1.1rem; border:2px solid var(--db-rot); box-sizing:border-box;">
        ` : ''}
        
        <button class="btn-weiter" style="margin-top:auto;" onclick="berechneUndZahle()">Weiter zur Zahlung ➔</button>
    `;

    rendereNavigation("schritt2");
}

// SCHRITT 3: Zahlung
function berechneUndZahle() {
    if(buchung.rabatt === 'mitarbeiter' && !buchung.baNummer) {
        alert("Für den Mitarbeitertarif wird eine gültige BA-Nummer benötigt!");
        return;
    }

    document.getElementById('menue-titel').textContent = "Zahlung & Optionen";
    const display = document.getElementById('display');

    let preis = Math.abs(buchung.nach.length - buchung.von.length) * 2.10 + 4.20;
    if(buchung.klasse === "1") preis *= 1.6; 
    if(buchung.rabatt === 'bundeswehr') preis = 0.00; 
    if(buchung.rabatt === 'mitarbeiter') preis *= 0.10; 

    if (buchung.gutscheinRabatt > 0) preis *= (1 - buchung.gutscheinRabatt);
    const gerundeterPreis = parseFloat(preis.toFixed(2));

    display.innerHTML = `
        <h3>Zahlung</h3>
        
        <div class="payment-layout">
            <div class="pay-info">
                <p><strong>Strecke:</strong> ${buchung.von} ➔ ${buchung.nach}</p>
                <p><strong>Klasse:</strong> ${buchung.klasse}. Klasse / ${buchung.rabatt.toUpperCase()}</p>
            </div>

            <div class="discount-section">
                <input type="text" id="couponInput" placeholder="GUTSCHEINCODE" value="${buchung.gutscheinCode}" style="padding:8px; font-size:1rem; text-transform:uppercase; width:120px;">
                <button onclick="loeseGutscheineInLine()" style="background:var(--db-grau-dunkel); color:white; border:none; padding:8px 12px; font-weight:bold; border-radius:4px;">Code prüfen</button>
                <div id="couponStatus" style="font-size:0.8rem; font-weight:bold; margin-top:2px;"></div>
            </div>
        </div>

        <div class="print-toggle-section">
            <span>Ticket physisch drucken?</span>
            <label class="switch">
                <input type="checkbox" id="printToggle" ${buchung.echtDrucken ? 'checked' : ''} onchange="buchung.echtDrucken=this.checked">
                <span class="slider round"></span>
            </label>
        </div>
        
        <p style="font-size: 1.6rem; color: var(--db-rot); font-weight: bold; text-align:center; margin: 10px 0;">
            Gesamtpreis: ${gerundeterPreis.toFixed(2).replace('.', ',')} €
        </p>
        
        <div class="optionen-grid">
            <button class="btn-weiter" style="background:#27ae60; margin:0;" onclick="druckeTicket(${gerundeterPreis})">💳 Karte</button>
            <button class="btn-weiter" style="background:#2980b9;
            

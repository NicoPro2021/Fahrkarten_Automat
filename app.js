// Live-Uhrzeit oben im Automaten aktualisieren
function updateUhrzeit() {
    const uhrzeitElement = document.getElementById('uhrzeit');
    const jetzt = new Date();
    uhrzeitElement.textContent = jetzt.toLocaleTimeString('de-DE');
}
setInterval(updateUhrzeit, 1000);
updateUhrzeit(); // Sofort beim Start ausführen

// Funktion: Ziel ausgewählt
function waehleZiel(zielName, preis) {
    const display = document.getElementById('display');
    
    display.innerHTML = `
        <h3>Ticket nach: ${zielName}</h3>
        <p style="font-size: 1.2rem;">Zu zahlen: <strong style="color: #27ae60;">${preis.toFixed(2)} €</strong></p>
        <p class="hinweis">Bitte wählen Sie eine fiktive Zahlungsart:</p>
        
        <div class="button-grid">
            <button class="btn-ziel" style="background: #27ae60; text-align: center; justify-content: center;" onclick="simuliereZahlung('${zielName}', ${preis})">
                💳 Mit Karte bezahlen
            </button>
            <button class="btn-ziel" style="background: #2980b9; text-align: center; justify-content: center;" onclick="simuliereZahlung('${zielName}', ${preis})">
                🪙 Bar bezahlen
            </button>
            <button class="btn-ziel" style="background: #7f8c8d; text-align: center; justify-content: center;" onclick="zurueckZurAuswahl()">
                ❌ Abbrechen
            </button>
        </div>
    `;
}

// Funktion: Zahlung simulieren und Ticket drucken
function simuliereZahlung(zielName, preis) {
    const display = document.getElementById('display');
    const heute = new Date().toLocaleDateString('de-DE');
    
    display.innerHTML = `
        <h3>Vielen Dank!</h3>
        <p>Ihre Zahlung war erfolgreich. Ticket wird gedruckt...</p>
        
        <div class="ticket-ausgabe">
            <h4 style="margin: 0 0 5px 0;">EINZELFAHRT</h4>
            <div style="font-size: 1.2rem; font-weight: bold; margin: 10px 0;">${zielName}</div>
            <div>Klasse: 2. Klasse</div>
            <div>Preis: ${preis.toFixed(2)} €</div>
            <div style="font-size: 0.8rem; margin-top: 15px; color: #555;">Gültig am: ${heute}</div>
            <div style="font-size: 0.7rem; color: #777;">ID: ${Math.floor(100000 + Math.random() * 900000)}</div>
        </div>
        
        <div class="button-grid" style="margin-top: 20px;">
            <button class="btn-ziel" style="background: #c0392b; text-align: center; justify-content: center;" onclick="zurueckZurAuswahl()">
                Fertig (Zurück zum Start)
            </button>
        </div>
    `;
}

// Funktion: Zurück zum Hauptmenü
function zurueckZurAuswahl() {
    // Lädt den ursprünglichen Zustand der Seite einfach neu
    location.reload();
}

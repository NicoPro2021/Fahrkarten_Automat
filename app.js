// Uhrzeit im DB-Format (HH:MM) aktualisieren
function updateUhrzeit() {
    const uhrzeitElement = document.getElementById('uhrzeit');
    const jetzt = new Date();
    uhrzeitElement.textContent = jetzt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateUhrzeit, 1000);
updateUhrzeit();

// Funktion: Ziel ausgewählt (Zahlungsmenü im DB-Stil)
function waehleZiel(zielName, preis) {
    const display = document.getElementById('display');
    const navigation = document.getElementById('navigation');
    
    display.innerHTML = `
        <h3>Zahlung & Tarifauswahl</h3>
        <p style="font-size: 1.1rem; color: #282d37; margin: 10px 0;">
            Gewähltes Ziel: <strong>${zielName}</strong><br>
            Reisende: 1 Erwachsener, 2. Klasse
        </p>
        <p style="font-size: 1.5rem; color: #ec0016; font-weight: bold; margin: 15px 0;">
            Gesamtpreis: ${preis.toFixed(2)} €
        </p>
        
        <div class="button-grid">
            <button class="btn-db" style="border-color: #27ae60;" onclick="simuliereZahlung('${zielName}', ${preis})">
                <span>💳 Kartenzahlung</span>
                <span class="preis-tag" style="background-color: #27ae60;">Auswählen</span>
            </button>
            <button class="btn-db" style="border-color: #2980b9;" onclick="simuliereZahlung('${zielName}', ${preis})">
                <span>🪙 Bargeld / Münzen</span>
                <span class="preis-tag" style="background-color: #2980b9;">Auswählen</span>
            </button>
        </div>
    `;
    
    // Untere Navigationsleiste anpassen (Abbrechen-Button hinzufügen)
    navigation.innerHTML = `
        <button class="btn-nav cancel" onclick="location.reload()">❌ Abbruch</button>
        <button class="btn-nav" disabled style="opacity: 0.5;">❓ Hilfe</button>
    `;
}

// Funktion: Zahlung simulieren und Ticket drucken (DB-Fahrkarten-Layout)
function simuliereZahlung(zielName, preis) {
    const display = document.getElementById('display');
    const navigation = document.getElementById('navigation');
    const heute = new Date().toLocaleDateString('de-DE');
    
    display.innerHTML = `
        <h3>Ticket-Ausgabe</h3>
        <p style="font-weight: bold; color: #27ae60;">Zahlung erfolgt. Bitte entnehmen Sie Ihr Ticket unten.</p>
        
        <div class="ticket-ausgabe">
            <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px;">
                <span>Deutsche Bahn</span>
                <span>NVR-Tarif</span>
            </div>
            <div style="margin: 15px 0; font-size: 1.3rem; font-weight: bold; text-align: center;">
                EINZELTICKET
            </div>
            <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 5px;">Von: Startbahnhof</div>
            <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 15px;">Nach: ${zielName}</div>
            
            <div style="font-size: 0.9rem;">
                Klasse: 2. Klasse / Erw. / Einzelfahrt<br>
                Gültig am: ${heute}<br>
                Preis: ${preis.toFixed(2)} EUR (inkl. MwSt.)
            </div>
            <div style="margin-top: 15px; border-top: 1px dashed #000; padding-top: 5px; font-size: 0.8rem; text-align: center; color: #555;">
                * * * GUTE REISE * * *<br>
                ID: DB-${Math.floor(100000 + Math.random() * 900000)}
            </div>
        </div>
    `;
    
    // Untere Navigationsleiste zurücksetzen auf den Start-Zustand
    navigation.innerHTML = `
        <button class="btn-nav" onclick="location.reload()">🏠 Neuer Kauf</button>
        <button class="btn-nav" disabled style="opacity: 0.5;">❓ Hilfe</button>
    `;
}

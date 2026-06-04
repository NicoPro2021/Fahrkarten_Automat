// SCHRITT 1: Stationen wählen (Optimiert für Querformat Split-Screen)
function zeigeSchritt1() {
    const title = document.getElementById('menue-titel');
    if (title) title.textContent = "Start / Ziel wählen";
    
    const display = document.getElementById('display');
    if (!display) return;

    // Filter-Logik für die Vorschläge vorbereiten
    const suchText = (aktivesFeld === "von" ? buchung.von : buchung.nach).toUpperCase();
    let vorschlaegeHtml = "";
    
    if (aktivesFeld && suchText.length >= 1) {
        const treffer = bahnhoefe.filter(b => b.toUpperCase().includes(suchText));
        if (treffer.length > 0) {
            vorschlaegeHtml = `
                <div class="such-label">Mögliche Stationen für "${suchText}":</div>
                <div class="vorschlag-liste">
                    ${treffer.slice(0, 5).map(t => `<div class="vorschlag-item" onclick="waehleVorschlag('${t}')">🚉 ${t}</div>`).join("")}
                </div>
            `;
        } else {
            vorschlaegeHtml = `<div class="such-label" style="color:#e74c3c;">Keine Bahnhöfe gefunden...</div>`;
        }
    }

    // Wenn die Tastatur aktiv ist, rendern wir den Split-Screen (querformat-wrapper)
    if (aktivesFeld) {
        display.innerHTML = `
            <div class="querformat-wrapper">
                <div class="links-box">
                    <h3>Verbindung eingeben</h3>
                    
                    <label style="font-size:0.85rem; font-weight:bold;">Abfahrtsbahnhof:</label>
                    <div id="feld-von" class="input-box ${aktivesFeld==='von'?'active':''}" onclick="setzeAktivesFeld('von')">
                        ${buchung.von || '<span class="placeholder">Bitte tippen...</span>'}
                    </div>
                    
                    <label style="font-size:0.85rem; font-weight:bold; margin-top:5px;">Zielbahnhof:</label>
                    <div id="feld-nach" class="input-box ${aktivesFeld==='nach'?'active':''}" onclick="setzeAktivesFeld('nach')">
                        ${buchung.nach || '<span class="placeholder">Ziel eingeben (z.B. Ze)...</span>'}
                    </div>
                    
                    <div id="suchErgebnisse" style="flex-grow:1; display:flex; flex-direction:column; overflow:hidden;">
                        ${vorschlaegeHtml}
                    </div>
                </div>

                <div class="tastatur-container">
                    <div class="tastatur">
                        ${"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => `<div class="key" onclick="tippeBuchstabe('${l}')">${l}</div>`).join("")}
                        <div class="key" onclick="tippeBuchstabe(' ')">LEER</div>
                        <div class="key" onclick="tippeBuchstabe('-')">-</div>
                        <div class="key" onclick="tippeBuchstabe('/')">/</div>
                        <div class="key wide" style="background:#e74c3c; color:white;" onclick="loescheBuchstabe()">⌫</div>
                    </div>
                    <button class="btn-schliessen" onclick="schliesseTastatur()">⌨ Tastatur verbergen</button>
                </div>
            </div>
            <button class="btn-weiter" style="margin-top:10px;" onclick="pruefeSchritt1()">Weiter zur Ticket-Auswahl ➔</button>
        `;
    } else {
        # Wenn KEINE Tastatur offen ist (Normalansicht im Querformat)
        display.innerHTML = `
            <h3>Reiseverbindung eingeben</h3>
            <label style="font-size:0.9rem; font-weight:bold;">Abfahrtsbahnhof:</label>
            <div id="feld-von" class="input-box" onclick="setzeAktivesFeld('von')">
                ${buchung.von || '<span class="placeholder">Bitte tippen...</span>'}
            </div>
            
            <label style="font-size:0.9rem; font-weight:bold; margin-top:10px;">Zielbahnhof:</label>
            <div id="feld-nach" class="input-box" onclick="setzeAktivesFeld('nach')">
                ${buchung.nach || '<span class="placeholder">Ziel eingeben (z.B. Ze)...</span>'}
            </div>
            
            <div style="flex-grow:1; display:flex; align-items:center; justify-content:center; color:#7f8c8d; font-style:italic;">
                Tippe auf ein Feld, um die Tastatur zu öffnen.
            </div>
            
            <button class="btn-weiter" onclick="pruefeSchritt1()">Weiter zur Ticket-Auswahl ➔</button>
        `;
    }

    rendereNavigation("start");
    updateUhrzeit();
}

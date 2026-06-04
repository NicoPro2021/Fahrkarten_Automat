const express = require('express');
const axios = require('axios');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

const app = express();
const PORT = 3000;

// Die RAW-Schnittstelle zu deiner JSON-Datei auf GitHub
const GITHUB_JSON_URL = 'https://raw.githubusercontent.com/NicoPro2021/Abfahrtstafel-/main/bad_belzig.json'; 

app.use(express.static('public'));
app.use(express.json());

// 1. API-Endpunkt: Holt die Daten von GitHub und gibt sie an die Website weiter
app.get('/api/abfahrten', async (req, res) => {
    try {
        const response = await axios.get(GITHUB_JSON_URL);
        
        // Falls deine JSON die Daten in einem Unterobjekt hat (z.B. response.data.departures), hier anpassen!
        const daten = response.data; 
        res.json(daten);
    } catch (error) {
        console.error("Fehler beim Laden der GitHub-Daten:", error.message);
        res.status(500).json({ error: "Daten konnten nicht geladen werden" });
    }
});

// 2. API-Endpunkt: Druckt die aktuellen Abfahrten sparsam aus
app.post('/api/drucken', async (req, res) => {
    try {
        const response = await axios.get(GITHUB_JSON_URL);
        let fahrten = response.data;

        // Falls die Daten verschachtelt sind, z.B. bei response.data.departures:
        if (!Array.isArray(fahrten) && fahrten.departures) {
            fahrten = fahrten.departures;
        }

        // Findet automatisch den ersten angeschlossenen USB-Thermodrucker
        const device  = new escpos.USB(); 
        const printer = new escpos.Printer(device);

        device.open(function(error) {
            if (error) {
                console.error("Drucker nicht gefunden oder blockiert:", error);
                return res.status(500).json({ success: false, error: error.message });
            }

            // Extreme Sparsamkeit: Kleinste Schrift, eng zusammen
            printer
                .font('B') 
                .align('LT') 
                .size(1, 1)
                .text('--- ABFAHRTEN BAD BELZIG ---');

            // Die nächsten 5 Abfahrten drucken
            const limitierteFahrten = Array.isArray(fahrten) ? fahrten.slice(0, 5) : [];
            
            limitierteFahrten.forEach(fahrt => {
                // Holt die Werte (unterstützt verschiedene typische Schreibweisen)
                const linie = fahrt.line || fahrt.linie || fahrt.name || "Bus";
                const ziel = fahrt.direction || fahrt.ziel || fahrt.to || "Unbekannt";
                const zeit = fahrt.time || fahrt.zeit || fahrt.when || "";

                // Format: "RE7 -> Berlin (12:45)"
                const zeile = `${linie} -> ${ziel.substring(0, 14)} (${zeit})`;
                printer.text(zeile);
            });

            printer
                .text('----------------------------')
                .feed(2) // Minimaler Vorschub, gerade genug zum Abreißen
                .close();
            
            res.json({ success: true });
        });

    } catch (error) {
        console.error("Druckfehler:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Website läuft! Öffne http://localhost:${PORT} auf dem Raspberry Pi`);
});

from flask import Flask, render_template, jsonify
import requests

app = Flask(__name__)

# Die Base-URL zu deinem GitHub Repository
GITHUB_BASE_URL = "https://raw.githubusercontent.com/nicopro2021/Abfahrtstafel-/main/"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/abfahrten/<filename>')
def get_abfahrten(filename):
    """Holt die Live-Daten für die spezifische Station vom GitHub Server."""
    try:
        # Setzt die URL aus Base-URL und dem angefragten Dateinamen (z.B. zerbst.json) zusammen
        url = f"{GITHUB_BASE_URL}{filename}"
        response = requests.get(url)
        response.raise_for_status() 
        data = response.json()
        return jsonify(data)
    except Exception as e:
        print(f"Fehler beim Abrufen der Daten für {filename}: {e}")
        return jsonify({"error": "Daten konnten nicht geladen werden"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
  

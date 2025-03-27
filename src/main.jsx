/*
Datum: 27.03.2025
Projektname: MapIntelligence
Namen: Kevin Leutwyler, Mojtaba Hasanzadeh, Narmatha Nanthakumar
Für diesen Code zuständig: Narmatha
Hauptquelle: YouTube-Tutorial von Lama Dev

Beschreibung: Dies ist der Einstiegspunkt der React-Anwendung. Hier wird die Hauptkomponente 'App' gerendert.
*/

import React from 'react' //React importieren, um Komponenten zu verwenden
import ReactDOM from 'react-dom/client' //ReactDOM für das Rendern der App im HTML-Dokument
import App from './App.jsx' //Hauptkomponente der Anwendung
import './index.css' //globale Styles importieren

//App in das Root-Element des HTML-Dokuments rendern
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
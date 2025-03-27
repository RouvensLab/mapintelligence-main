/*
Datum: 27.03.2025
Projektname: MapIntelligence
Namen: Kevin Leutwyler, Mojtaba Hasanzadeh, Narmatha Nanthakumar
Für diesen Code zuständig: Narmatha
Hauptquelle: YouTube-Tutorial von Lama Dev
  
Beschreibung: Diese Datei enthält die 'Notification'-Komponente für das Anzeigen von Benachrichtigungen. Die Bibliothek 'react-toastify' wird genutzt, um Toast-Benachrichtigungen darzustellen.
*/

import { ToastContainer } from "react-toastify"; //Toast-Komponente für Benachrichtigungen importieren
import "react-toastify/dist/ReactToastify.css"; //Styles für die Toast-Benachrichtigungen

/*
Notification-Komponente: ToastContainer-Komponente bereitstellen, um Benachrichtigungen am unteren rechten Rand anzuzeigen.
*/

const Notification = () => {
    return (
        <div className=''>
            <ToastContainer position="bottom-right"/>
        </div>
    )
}

export default Notification
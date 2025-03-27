/* 
Datum: 27.03.2025
Projektname: MapIntelligence
Namen: Kevin Leutwyler, Mojtaba Hasanzadeh, Narmatha Nanthakumar
Für diesen Code zuständig: Narmatha
Hauptquelle: YouTube-Tutorial von Lama Dev

Beschreibung: Dieses File definiert die Darstellung der 'List'-Komponente.
*/


import ChatList from "./chatList/ChatList";
import "./list.css";

const List = ({ onChatSelect }) => {
    return (
        <div className="list">
            <ChatList onChatSelect={onChatSelect} />
        </div>
    );
};

export default List;

//CSS-Datei importieren (für Styling)
import "./userInfo.css";

//Userinfo (Komponente) erstellen
const Userinfo = () => {
    return (
        <div className='userInfo'> {/*äussere Container für Userinfo*/}
            <div className="user"> {/*Container für Benutzername & Avatar*/}
                <img src="./avatar.png" alt=""/> {/*Avatar-Bild*/}
                <h2>John Doe</h2> {/*Benutzername*/}
            </div>
            <div className="icons"> {/*Container für Icons*/}
                <img src="./more.png" alt="" />
                <img src="./video.png" alt="" />
                <img src="./edit.png" alt="" />
            </div>
        </div>
    )
}

//Userinfo-Komponente exportieren, damit sie in anderen Dateien genutzt werden kann
export default Userinfo;
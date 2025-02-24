import ChatList from "./chatList/ChatList" 
import "./list.css"
import Userinfo from "./userInfo/Userinfo"

//List-Komponente kombiniert Benutzerinfo & Chatliste
const List = () => {
    return (
        <div className='list'>
            <Userinfo/> {/*Benutzerinformationen anzeigen*/}
            <ChatList/> {/*Liste der Chats anzeigen*/}
        </div>
    )
}

export default List
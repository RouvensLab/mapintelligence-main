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

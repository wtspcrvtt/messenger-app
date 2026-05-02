import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { auth } from "../firebase";


function Chat() {
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([]);
    const sendMessage = async () => {
        if (inputText.trim() === "") return;
        try {
            await addDoc(collection(db, 'messages'), {
                text: inputText,
                senderId: auth.currentUser?.uid,
                createdAt: serverTimestamp()
            });
            setInputText('');
        } catch (error) {
            console.error('Ошибка отправки ', error);
        }
    };

    return (
        <>
        <div>Чат работает</div>
        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}/>
        <button type="button" onClick={sendMessage}>Отправить</button>
        </>   
    )
}

export default Chat;
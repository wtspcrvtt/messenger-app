import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { auth } from "../firebase";


function Chat() {
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, []);

    

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
    const ref = useRef(null);

    useEffect(() => {
        if(messages.length > 0) {
            ref.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = () => {
        sendMessage();
    }

    return (
        <>
        <div>Чат работает</div>
        <div>{messages.map(msg => (
            <div key={msg.id}>
                <strong>{msg.senderId}</strong>: {msg.text}
            </div>
        ))}</div>
        <div ref={ref} />
        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}/>
        <button type="button" onClick={handleSend}>Отправить</button>
        </>   
    )
}

export default Chat;
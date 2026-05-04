import { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";

function ChatRoom({ chatId, currentUserId }: { chatId: string; currentUserId: string }) {
    console.log('ChatRoom получил chatId:', chatId);

    interface Message {
        id: string;
        text: string;
        senderId: string;
        createdAt: Timestamp;
        chatId: string;
    }
    const [messages, setMessages] = useState<Message[]>([]);;
    const [inputText, setInputText] = useState('');

    useEffect(() => {
        const q = query(
            collection(db, 'messages'),
            where('chatId', '==', chatId),
            orderBy('createdAt', 'asc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        if (inputText.trim() === "") return;
        try {
            await addDoc(collection(db, 'messages'), {
                chatId: chatId,
                text: inputText,
                senderId: auth.currentUser?.uid,
                createdAt: serverTimestamp()
            });
            setInputText('');
        } catch (error) {
            console.error('Ошибка отправки ', error);
        }
    };
    const ref = useRef<HTMLDivElement>(null);

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
        <div>Чат {chatId}</div>
        <div>
            {messages.map(msg => (
                <div key={msg.id}>
                    <strong>{msg.senderId ===  currentUserId ? 'Я' : msg.senderId}</strong>: {msg.text}
                </div>
            ))}
            <div ref={ref} />
        </div>
        <input type="text" value={inputText} placeholder="Введите текст" onChange={(e) => setInputText(e.target.value)} />
        <button onClick={handleSend}>Отправить</button>
        </>
    )

}

export default ChatRoom
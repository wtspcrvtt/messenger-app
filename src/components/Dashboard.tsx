import { useState, useEffect } from "react"
import { db, auth } from "../firebase"
import { collection, query, where, getDocs, addDoc, serverTimestamp, Timestamp } from "firebase/firestore"
import ChatRoom from "./ChatRoom";


type Chat = {
    id: string;
    participants: string[];
    type: string;
    createdAt: Timestamp;
    lastMessage: { text: string; senderId: string; createdAt: Timestamp } | null;
};
function Dashboard() {

    const [searchEmail, setSearchEmail] = useState('');
    const [foundUser, setFoundUser] = useState<{ id: string; nickname: string; email: string } | null>(null);
    const [searchError, setSearchError] = useState('');
    const [chatsError, setChatsError] = useState('');
    const [chats, setChats] = useState<Chat[] | null>(null);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);

    const handleSearch = async () => {
        setSearchError('');
        setFoundUser(null);
        try {
            const q = query(collection(db, 'users'), where('email', '==', searchEmail));
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                setSearchError('Пользователь не найден');
                return;
            }
            snapshot.forEach(doc => {
                setFoundUser({ id: doc.id, ...doc.data() } as { id: string; nickname: string; email: string });
            })
        } catch {
            setSearchError('Ошибка поиска');
        }
    };

    
    const loadChats = async () => {
        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) return;
        try {
            const q = query(collection(db, 'chats'), where ('participants', 'array-contains', currentUserId));
            const snapshot = await getDocs(q);
            const loadedChats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
            setChats(loadedChats);
        }   catch  {
            console.error('Ошибка загрузки чатов', chatsError);
            setChatsError('Не удалось загрузить чаты');
        }
        }
    useEffect(() => {
        loadChats();
    }, []);

    const createOrOpenChat = async (targetUserId: string) => {
        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) return;
        console.log('Создаём или открываем чат с ', targetUserId);
        try {
            if (!chats) return;
            const existingChat = chats.find(chat => chat.participants.includes(currentUserId) && chat.participants.includes(targetUserId));
            if (existingChat) {
                setCurrentChatId(existingChat.id);
                setFoundUser(null);
                setSearchEmail('');
            } else {
                const newChatRef = await addDoc(collection(db, 'chats'), {
                    participants: [currentUserId, targetUserId],
                    type: 'private',
                    createdAt: serverTimestamp(),
                    lastMessage: null
                });
                setCurrentChatId(newChatRef.id);
                await loadChats();
            }
            
        } catch (error) {
            console.error ('Ошибка создания чата', error);
            setChatsError ('Не удалось загрузить чат');
        }
    }

    return(
        <>
        <div>Здесь будет интерфейс с чатами</div>
        <input type="text" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} placeholder="Email Пользователя" />
        <button type="button" onClick={handleSearch}>Найти пользователя</button>
        {foundUser && (
        <div>
            <strong>{foundUser.nickname}</strong> ({foundUser.email})
            <button onClick={() => createOrOpenChat(foundUser.id)}>Начать чат</button>
        </div>
        )}
        {searchError && <div style={{ color: 'red' }}>{searchError}</div>}
        {currentChatId && auth.currentUser?.uid && (<ChatRoom chatId={currentChatId} currentUserId={auth.currentUser.uid} />)}
        </>
    )
}

export default Dashboard
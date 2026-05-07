import { useState, useEffect } from "react"
import { db, auth } from "../firebase"
import { collection, query, where, getDocs, addDoc, serverTimestamp, Timestamp, onSnapshot } from "firebase/firestore"
import ChatRoom from "./ChatRoom";
import { signOut } from "firebase/auth";
import styles from './Dashboard.module.css'


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
    const [chats, setChats] = useState<Chat[] | null>(null);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [ userNames, setUserNames] = useState<Record<string, string>>({});

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

    
    useEffect(() => {
        const currentUserId = auth.currentUser?.uid;
        if(!currentUserId) return;

        const q = query(collection(db, 'chats'), where('participants', 'array-contains', currentUserId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedChats = snapshot.docs.map(doc => ({id: doc.id, ...doc.data() } as Chat));
            setChats(loadedChats);
        });
        return () => unsubscribe();
    }, []);

    const fetchUserName = async (userId: string) => {
        if (userNames [userId]) return;
        const q = query(collection(db, 'users'), where('__name__', '==', userId));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const nickname = snapshot.docs[0].data().nickname;
            setUserNames(prev => ({ ...prev, [userId]: nickname}));
        }
    };

    useEffect(() => {
        if (!chats) return;
        chats.forEach(chat => {
            const otherId = chat.participants.find(id => id !== auth.currentUser?.uid);
            if (otherId && !userNames[otherId]) {
                fetchUserName(otherId);
            }
        });
    }, [chats]);

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
            }
            
        } catch (error) {
            console.error ('Ошибка создания чата', error);
        }
    }


    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Ошибка выхода', error);
        }
    };

    return(
        <>
        <div className={styles.dashboard}>
            <div className={styles.sidebar}>
                <button onClick={handleLogout}>Выйти</button>
                <div className={styles.search}>
                    <input className={styles.searchInput} type="text" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} placeholder="Email Пользователя" />
                    <button className={styles.findBtn} onClick={handleSearch}>Найти пользователя</button>
                    {foundUser && (
                    <div>
                            <strong>{foundUser.nickname}</strong> ({foundUser.email})
                            <button className={styles.startChatBtn} onClick={() => createOrOpenChat(foundUser.id)}>Начать чат</button>
                    </div>
                    )}
                        <div className={styles.chatList}>
                            {chats?.map(chat => {
                                const otherUserId = chat.participants.find(id => id !== auth.currentUser?.uid);
                                if (!otherUserId) return null;
                                return (
                                    <div key={chat.id} onClick={() => setCurrentChatId(chat.id)}>
                                        Чат с: {userNames[otherUserId] || 'Загрузка..'}
                                    </div>
                                );
                            })}
                        </div>
                </div>
            </div>
                                
            <div className={styles.chatArea}>
            {currentChatId && auth.currentUser?.uid && (<ChatRoom chatId={currentChatId} currentUserId={auth.currentUser.uid} />)}
            </div>
            {searchError && <div style={{ color: 'red' }}>{searchError}</div>}
        </div>
        </>
    )
}

                                    
            
            

export default Dashboard
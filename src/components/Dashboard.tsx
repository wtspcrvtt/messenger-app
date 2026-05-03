import { useState, useEffect } from "react"
import { db, auth } from "../firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
function Dashboard() {

    const [searchEmail, setSearchEmail] = useState('');
    const [foundUser, setFoundUser] = useState(null);
    const [searchError, setSearchError] = useState('');
    const [chatsError, setChatsError] = useState('');
    const [chats, setChats] = useState(null);
    const [currentChatId, setCurrentChatId] = useState(null);

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
                setFoundUser({ id: doc.id, ...doc.data() });
            })
        } catch (error) {
            setSearchError('Ошибка поиска');
        }
    };

    const loadChats = async () => {
        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) return;
        try {
            const q = query(collection(db, 'chats'), where ('participants', 'array-contains', currentUserId));
            const snapshot = await getDocs(q);
            const loadedChats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setChats(loadedChats);
        }   catch (error) {
            console.error('Ошибка загрузки чатов', error);
            setChatsError('Не удалось загрузить чаты');
        }
    }

    useEffect(() => {
        loadChats();
    }, []);

    const createOrOpenChat = async (targetUserId) => {
        console.log('Создаём или открываем чат с ', targetUserId);
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
        </>
    )
}

export default Dashboard
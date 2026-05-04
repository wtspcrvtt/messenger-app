import { useState, useEffect } from 'react'
import './App.css'
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword,} from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import Dashboard from './components/Dashboard';
import type { User } from 'firebase/auth'

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState('');

  const handleRegister = async () => {
    if (nickname.trim() === '') {
      setError('Введите никнейм');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        nickname: nickname,
        email: email,
        createdAt: serverTimestamp()
      });
    } catch (error) {
    setError(error instanceof Error ? error.message : 'Ошибка');
    }
  }


  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword (auth, email, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка');
    }
  }

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
      });
      return () => unsubscribe();
  }, []);

  if (user) {
        return <Dashboard />;
      }


      
  
  return (
    <><form>
      <input type="text" name='Email' value={email} onChange={(e) => setEmail(e.target.value)}
      placeholder='Email'/>
      <input type="text" name='Password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' />
      <input type="text" name='Nickname' value={nickname} onChange={(e) => setNickname(e.target.value)} />
      
    </form>
      <button type="button" onClick={handleRegister}>Зарегистрироваться</button>
      <button type="button" onClick={handleLogin}>Войти</button>

    {error && <div style={{color: 'red', marginTop: '8px' }}>{error}</div>}  
      </>
  )
}

export default App

import { useState, useEffect } from 'react'
import styles from './App.module.css'
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
      console.error('Ошибка регистрации', error);
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
    <>
    <div className={styles.loginContainer}>
      <h1 className={styles.h1}>Lavanda</h1>
      <form className={styles.regLoginForm}>
        <div>
          <input className={styles.inputEmail} type="text" name='Email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email'/>
        </div>  
        <input className={styles.inputPassword} type="text" name='Password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' />
        <input className={styles.inputNickname} type="text" name='Nickname' value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder='Nickname'/>
      </form>
      <div className={styles.regLogBtn}>
        <button className={styles.btnReg} type="button" onClick={handleRegister}>Зарегистрироваться</button>
        <button className={styles.btnLogin} type="button" onClick={handleLogin}>Войти</button>
      </div>
      {error && <div style={{display:'flex', backgroundColor: '#8d3f49', color: '#f4e9f8', marginTop: '32px', padding: '16px', justifyContent: 'center', borderRadius: '16px', fontWeight: '500' }}>{error}</div>}
    </div>
      </>
  )
}

export default App

import { useState, useEffect } from 'react'
import './App.css'
import { auth } from './firebase';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import Chat from './components/Chat';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword (auth, email, password);
    } catch (error) {
    setError(error.message);
    }
  }


  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword (auth, email, password);
    } catch (error) {
      setError(error.message);
    }
  }

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
      });
      return () => unsubscribe();
  }, []);

  if (user) {
        return <Chat />;
      }
  
  return (
    <><form>
      <input type="text" name='Email' value={email} onChange={(e) => setEmail(e.target.value)}
      placeholder='Email'/>
      <input type="text" name='Password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' />
      
    </form>
      <button type="button" onClick={handleRegister}>Зарегистрироваться</button>
      <button type="button" onClick={handleLogin}>Войти</button>

    {error && <div style={{color: 'red', marginTop: '8px' }}>{error}</div>}  
      </>
  )
}

export default App

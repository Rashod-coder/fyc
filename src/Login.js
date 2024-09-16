import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { FaUser, FaLock } from 'react-icons/fa';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth } from './Firebase/Firebase';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            setUser(user);
            navigate('/dashboard'); 
          } else {
            setUser(null);
          }
        });

        return () => unsubscribe();
      })
      .catch((error) => {
        console.error('Error setting persistence:', error);
      });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); 
    } catch (err) {
      setError('Incorrect login details. Please try again.');
      setTimeout(() => setError(''), 5000); 
    }
  };

  return (
    <div className="login-background">
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div
          className="p-4 rounded shadow"
          style={{
            maxWidth: '450px', 
            width: '100%', 
            padding: '4rem', 
            height: 'auto',
            minHeight: '500px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)', 
          }}
        >
          <form className="login100-form" onSubmit={handleLogin}>
            <div className="text-center mb-4">
              <span
                className="login100-form-logo"
                style={{ fontSize: '3rem', color: '#000' }}
              >
                <i className="zmdi zmdi-landscape"></i>
              </span>
            </div>
            <h2 className="text-center mb-4" style={{ color: '#000' }}>
              Login
            </h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="form-group mb-4" style={{ position: 'relative' }}>
              <FaUser
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '10px',
                  transform: 'translateY(-50%)',
                  color: '#000',
                }}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 40px', 
                  fontSize: '1rem',
                  color: '#000',
                  border: 'none',
                  borderBottom: '2px solid #000',
                  outline: 'none',
                  background: 'transparent',
                }}
              />
            </div>
            <div className="form-group mb-4" style={{ position: 'relative' }}>
              <FaLock
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '10px',
                  transform: 'translateY(-50%)',
                  color: '#000',
                }}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 40px', 
                  fontSize: '1rem',
                  color: '#000',
                  border: 'none',
                  borderBottom: '2px solid #000',
                  outline: 'none',
                  background: 'transparent',
                }}
              />
            </div>
            <div className="text-center mb-4 mt-4 py-5">
              <button
                style={{
                  width: '300px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                }}
                className="btn btn-primary btn-lg"
                type="submit"
              >
                Login
              </button>
            </div>
            <div className="text-center">
              <a
                className="text-muted"
                href="/register"
                style={{ color: '#000', textDecoration: 'none' }}
              >
                Don't have an account? Sign up here
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

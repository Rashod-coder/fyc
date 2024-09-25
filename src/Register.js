import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { auth, db } from './Firebase/Firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in 'users' collection
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        email: email,
        firstName: firstName,
        lastName: lastName,
        accountLevel: 'guest'
      });
      console.log("User document successfully written in 'users'!");

      // Create user document in 'profile' collection
      const profileDocRef = doc(db, 'profile', user.uid);
      await setDoc(profileDocRef, {
        email: email,
        firstName: firstName,
        lastName: lastName,
        accountLevel: 'guest'
      });
      console.log("Profile document successfully written in 'profile'!");

      // Alert and redirect after successful registration
      window.alert("Account Created");
      navigate("/login");
    } catch (error) {
      if (error.code === "auth/weak-password") {
        window.alert("Password must be greater than 6 characters.");
      } else if (error.code === "auth/email-already-in-use") {
        window.alert("Email is already in use.");
      } else {
        window.alert(error.message);
      }
    }
  };

  return (
    <div className='register-background'>
      <div
        className="container d-flex justify-content-center align-items-center min-vh-100"
        style={{
          backgroundImage: "url('images/bg-01.jpg')",
          backgroundSize: 'cover'
        }}
      >
        <div
          className="p-4 shadow"
          style={{
            maxWidth: '450px',
            width: '100%',
            padding: '4rem',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '10px'
          }}
        >
          <form className="login100-form" onSubmit={handleRegister}>
            <div className="text-center mb-4">
              <span className="login100-form-logo" style={{ fontSize: '3rem' }}>
                <i className="zmdi zmdi-landscape"></i>
              </span>
            </div>
            <h2 className="text-center mb-4">Register</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="form-group mb-4">
              <input
                className="form-control form-control-lg"
                type="text"
                name="firstName"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                style={{
                  border: 'none',
                  borderBottom: '2px solid #000',
                  borderRadius: '0',
                  background: 'transparent',
                  padding: '10px 0',
                  fontSize: '1rem',
                  color: '#000',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>
            <div className="form-group mb-4">
              <input
                className="form-control form-control-lg"
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                style={{
                  border: 'none',
                  borderBottom: '2px solid #000',
                  borderRadius: '0',
                  background: 'transparent',
                  padding: '10px 0',
                  fontSize: '1rem',
                  color: '#000',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>
            <div className="form-group mb-4">
              <input
                className="form-control form-control-lg"
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  border: 'none',
                  borderBottom: '2px solid #000',
                  borderRadius: '0',
                  background: 'transparent',
                  padding: '10px 0',
                  fontSize: '1rem',
                  color: '#000',
                  width: '100%',
                }}
              />
            </div>
            <div className="form-group mb-4">
              <input
                className="form-control form-control-lg"
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  border: 'none',
                  borderBottom: '2px solid #000',
                  borderRadius: '0',
                  background: 'transparent',
                  padding: '10px 0',
                  fontSize: '1rem',
                  color: '#000',
                  outline: 'none',
                  width: '100%',
                }}
              />
            </div>
            <div className="text-center mt-4 py-5">
              <button
                style={{ width: '300px', backgroundColor: '#007bff', border: 'none', color: '#fff', borderRadius: '10px', fontSize: '1.2rem', padding: '10px 20px' }}
                className="btn btn-primary btn-lg"
                type="submit"
              >
                Register
              </button>
            </div>
                  <div className="text-center">
              <a className="text-muted" href="/login">
                Already have an account? Log in here
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;

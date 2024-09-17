import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { signOut } from 'firebase/auth';
import { auth } from './Firebase/Firebase'; 

function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
      window.alert('You have signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#9c8264', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} aria-label="Offcanvas navbar large">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
        </a>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="offcanvas" 
          data-bs-target="#offcanvasNavbar2" 
          aria-controls="offcanvasNavbar2"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div 
          className="offcanvas offcanvas-start text-bg-dark" 
          tabIndex="-1" 
          id="offcanvasNavbar2" 
          aria-labelledby="offcanvasNavbar2Label"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasNavbar2Label">
              <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>FYC</a>
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              data-bs-dismiss="offcanvas" 
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav flex-grow-1 justify-content-center align-items-center mx-3" style={{ width: '100%' }}>
              <li className="nav-item">
                <a className="nav-link text-light text-center" style={{ fontSize: '20px' }} href="/#about">About</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-light text-center" style={{ fontSize: '20px' }} href="/team">Team</a>
              </li>
              <li className="nav-item dropdown">
                <a style={{ color: 'white', fontSize: '20px', textAlign: 'center' }} className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Account
                </a>
                <ul className="dropdown-menu text-center">
                  {user ? (
                    <>
                      <li><a className="dropdown-item" href="/dashboard">Dashboard</a></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><a className="dropdown-item" href="#" onClick={handleLogout}>Logout</a></li>
                    </>
                  ) : (
                    <>
                      <li><a className="dropdown-item" href="/login">Login</a></li>
                      <li><a className="dropdown-item" href="/register">Register</a></li>
                    </>
                  )}
                </ul>
              </li>
              <li className="nav-item">
                <a className="nav-link text-light text-center" style={{ fontSize: '20px' }} href="/partners">Partners</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
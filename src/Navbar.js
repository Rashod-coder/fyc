import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { signOut } from 'firebase/auth';
import { auth } from './Firebase/Firebase'; 
import { Menu, MenuItem, IconButton, Typography, Divider } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';

function Navbar() {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

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

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: 'black', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} aria-label="Offcanvas navbar large">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">FYC</a>
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
                <a className="nav-link text-light text-center" style={{ fontSize: '25px', fontFamily: 'Quicksand' }} href="/#about">About</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-light text-center" style={{ fontSize: '25px', fontFamily: 'Quicksand' }} href="/team">Team</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-light text-center" style={{ fontSize: '25px', fontFamily: 'Quicksand' }} href="/partners">Partners</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-light text-center" style={{ fontSize: '25px', fontFamily: 'Quicksand' }} href="/events">Events</a>
              </li>
              <li className="nav-item">
                <IconButton
                  aria-controls={anchorEl ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  onClick={handleMenuClick}
                  color="inherit"
                  style={{ fontSize: '40px', fontFamily: 'Quicksand' }} // Bigger icon size
                >
                  <AccountCircle fontSize="inherit" /> {/* Inherit size for consistency */}
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    style: {
                      borderRadius: 10, // Curved dropdown
                      backgroundColor: '#222', // Dark background
                      color: 'white', // White text
                    },
                  }}
                >
                  {user ? (
                    <>
                      <MenuItem onClick={handleClose}>
                        <a href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>Dashboard</a>
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem onClick={handleClose}>
                        <a href="/login" style={{ textDecoration: 'none', color: 'inherit' }}>Login</a>
                      </MenuItem>
                      <MenuItem onClick={handleClose}>
                        <a href="/register" style={{ textDecoration: 'none', color: 'inherit' }}>Register</a>
                      </MenuItem>
                    </>
                  )}
                </Menu>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
import './App.css';
import Navbar from './Navbar';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Settings from './Settings';
import PartnersPage from './Partners';
import TeamsPage from './Team';
import MembersPage from './Members';
import Events from './Events';
import DisplayEvents from './displayEvents';
import ViewEvent from './viewEvent';
import { useEffect, useState } from 'react';
import { auth } from './Firebase/Firebase'; // Use imported auth
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null means loading
    const [openDialog, setOpenDialog] = useState(false);

    // Listen for auth state changes to check if the user is logged in
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setIsAuthenticated(!!user); // Set to true if user is signed in, false otherwise
        });

        return () => unsubscribe(); // Cleanup the listener on component unmount
    }, []);

    // Function to require authentication
    const requireAuth = (element) => {
        if (isAuthenticated === null) {
            // Still checking auth status
            return null; // Don't render anything, the Dashboard should handle loading
        }

        if (isAuthenticated) {
            return element; // User is authenticated
        } else {
            setOpenDialog(true); // Show the "must be logged in" dialog
            return <Navigate to="/login" />;
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false); // Close the dialog when user clicks "Close"
    };

    return (
        <Router>
            <Navbar />

            {/* Must Be Logged In Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Authentication Required</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You must be logged in to access this page. Please log in or register to continue.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary" variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="profile-settings" element={<Settings />} />
                <Route path="partners" element={<PartnersPage />} />
                <Route path="team" element={<TeamsPage />} />
                <Route path="events" element={<DisplayEvents />} />
                <Route path="/events/:id" element={<ViewEvent />} />

                {/* Routes that require authentication */}
                <Route path="dashboard" element={requireAuth(<Dashboard />)} />
                <Route path="members" element={requireAuth(<MembersPage />)} />
                <Route path="manage-events" element={requireAuth(<Events />)} />
            </Routes>
        </Router>
    );
}

export default App;
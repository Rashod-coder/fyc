import './App.css';
import Navbar from './Navbar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null means loading

    // Listen for auth state changes to check if the user is logged in
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setIsAuthenticated(!!user); // Set to true if user is signed in, false otherwise
        });

        return () => unsubscribe(); // Cleanup the listener on component unmount
    }, []);

    return (
        <Router>
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="profile-settings" element={<Settings />} />
                <Route path="partners" element={<PartnersPage />} />
                <Route path="team" element={<TeamsPage />} />
                <Route path="events" element={<DisplayEvents />} />
                <Route path="/events/:id" element={<ViewEvent />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="manage-events" element={<Events />} />
            </Routes>
        </Router>
    );
}

export default App;
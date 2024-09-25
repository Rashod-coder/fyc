import React, { useState, useEffect } from 'react';
import { auth, db } from './Firebase/Firebase';
import { doc, getDoc, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Epartner from './editPartner';
import VerifyRoleRequest from './Verify';
import GuestDashboard from './guestDash';
import AdminDash from './adminDash';
import { Box, Typography, Button, CircularProgress, Avatar, Card, Grid } from '@mui/material';
import { AccountCircle, Star } from '@mui/icons-material';

function Dashboard() {
    const [userName, setUserName] = useState('');
    const [accountLevel, setAccountLevel] = useState('');
    const [profilePicUrl, setProfilePicUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');
    const navigate = useNavigate();

    const getGreeting = () => {
        const currentHour = new Date().getHours();
        if (currentHour < 12) {
            return 'Good Morning';
        } else if (currentHour < 18) {
            return 'Good Afternoon';
        } else if (currentHour < 21) {
            return 'Good Evening';
        } else {
            return 'Good Night';
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userDocRef = doc(collection(db, 'users'), user.uid);
                    const userSnapshot = await getDoc(userDocRef);

                    if (userSnapshot.exists()) {
                        const { firstName, lastName, accountLevel, profilePicUrl } = userSnapshot.data();
                        setUserName(`${firstName} ${lastName}`);
                        setAccountLevel(accountLevel);
                        setProfilePicUrl(profilePicUrl);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                navigate('/login');
            }
            setLoading(false);
        });

        setGreeting(getGreeting());

        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const handleEditSettings = () => {
        navigate('/profile-settings');
    };

    return (
        <Box 
            sx={{ 
                padding: '2rem', 
                background: 'linear-gradient(90deg, rgba(16,31,51,1) 0%, rgba(212,213,255,1) 52%, rgba(253,253,255,1) 95%, rgba(255,255,255,1) 100%)',
                minHeight: '100vh' 
            }}
        >
            <Card sx={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
                <Grid container alignItems="center">
                    <Grid item>
                        <Avatar src={profilePicUrl} alt={userName} sx={{ width: 60, height: 60, marginRight: 2 }} />
                    </Grid>
                    <Grid item xs>
                        <Typography variant="h4" sx={{ color: '#00796b', fontWeight: 'bold' }}>
                            {greeting}, {userName}!
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#555', display: 'flex', alignItems: 'center' }}>
                            <AccountCircle sx={{ marginRight: 1 }} />
                            Account Level: 
                            <strong style={{ color: accountLevel === 'admin' ? '#f39c12' : '#3498db', marginLeft: '0.5rem' }}> 
                                {accountLevel} 
                            </strong>
                        </Typography>
                    </Grid>
                </Grid>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: '1rem' }}
                    onClick={handleEditSettings}
                >
                    Edit Account Settings
                </Button>
            </Card>

            {accountLevel === 'admin' && (
                <Box sx={{ marginTop: '2rem' }}>
                    <Card sx={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
                        <Epartner />
                    </Card>
                    <Card sx={{ padding: '1.5rem', marginTop: '1rem', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
                        <AdminDash />
                    </Card>
                </Box>
            )}

            {accountLevel === 'guest' && (
                <Box sx={{ marginTop: '2rem' }}>
                    <Card sx={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
                        <VerifyRoleRequest />
                    </Card>
                    <Card sx={{ padding: '1.5rem', marginTop: '1rem', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
                        <GuestDashboard />
                    </Card>
                </Box>
            )}
        </Box>
    );
}

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Grid, CircularProgress, Divider, IconButton, Snackbar } from '@mui/material';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './Firebase/Firebase'; // Adjust the import based on your file structure
import { MonetizationOn, CheckCircle, CalendarToday, Favorite, Share } from '@mui/icons-material'; // Importing MUI icons

const ViewEvent = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [interested, setInterested] = useState(false); // State to track interest
    const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar

    useEffect(() => {
        const fetchEvent = async () => {
            const eventDoc = doc(db, 'events', id);
            const eventSnapshot = await getDoc(eventDoc);
            if (eventSnapshot.exists()) {
                setEvent({
                    id: eventSnapshot.id,
                    ...eventSnapshot.data(),
                    interestedCount: eventSnapshot.data().interestedCount || 0, // Ensure interestedCount has a default value
                });
                setInterested(localStorage.getItem(`interested-${eventSnapshot.id}`) === 'true'); // Check local storage
            } else {
                console.error('No such event!');
            }
            setLoading(false);
        };

        fetchEvent();
    }, [id]);

    const handleInterestToggle = async () => {
        const eventRef = doc(db, 'events', id);
        const newInterestedState = !interested;
        const updatedCount = newInterestedState ? event.interestedCount + 1 : event.interestedCount - 1;

        // Update the database and the state without refreshing the page
        await updateDoc(eventRef, { interestedCount: updatedCount });
        localStorage.setItem(`interested-${id}`, newInterestedState);
        
        // Update local state to reflect changes immediately
        setInterested(newInterestedState);
        setEvent(prevEvent => ({ ...prevEvent, interestedCount: updatedCount }));
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
            .then(() => {
                setSnackbarOpen(true); // Show Snackbar when URL is copied
            })
            .catch(err => console.error('Could not copy text: ', err));
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false); // Close Snackbar
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f7f9fc' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!event) {
        return <Typography>Event not found.</Typography>;
    }

    return (
        <Box sx={{ padding: 4, backgroundColor: '#f7f9fc', minHeight: '100vh' }}>
            <Typography variant="h4" align="center" color="primary" gutterBottom>
                {event.title}
            </Typography>
            <Paper elevation={3} sx={{ padding: 3, borderRadius: 2, backgroundColor: '#ffffff' }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            style={{
                                width: '100%',   // Make the image take full width of the container
                                height: 'auto',  // Maintain aspect ratio
                                borderRadius: '8px',
                                border: '3px solid black', // Add border to the image
                                objectFit: 'contain', // Show the full image
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                            Event Details
                        </Typography>
                        <Typography variant="body1" sx={{ marginBottom: 1 }}>
                            <strong>Description:</strong> {event.description}
                        </Typography>
                        <Divider sx={{ marginY: 2 }} />
                        <Typography variant="body1" sx={{ marginBottom: 1 }}>
                            <strong>Organization:</strong> {event.organization}
                        </Typography>
                        <Divider sx={{ marginY: 2 }} />
                        <Typography variant="body1" sx={{ marginBottom: 1 }}>
                            <strong>Location:</strong> {event.location}
                        </Typography>
                        <Divider sx={{ marginY: 2 }} />
                        <Typography variant="body1" sx={{ marginBottom: 1, display: 'flex', alignItems: 'center' }}>
                            <CalendarToday sx={{ marginRight: 1 }} />
                            <strong>Start Date:</strong> {new Date(event.startDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body1" sx={{ marginBottom: 2, display: 'flex', alignItems: 'center' }}>
                            <CalendarToday sx={{ marginRight: 1 }} />
                            <strong>End Date:</strong> {new Date(event.endDate).toLocaleDateString()}
                        </Typography>

                        {/* Cost and Free Icons */}
                        <Typography variant="body1" sx={{ marginBottom: 2, display: 'flex', alignItems: 'center' }}>
                            {event.isFree ? (
                                <>
                                    <CheckCircle sx={{ color: 'green', marginRight: 1 }} />
                                    <strong>Cost:</strong> Free (0 dollars)
                                </>
                            ) : (
                                <>
                                    <MonetizationOn sx={{ color: 'red', marginRight: 1 }} />
                                    <strong>Cost:</strong> {event.cost} dollars
                                </>
                            )}
                        </Typography>

                        {/* Interested Button */}
                        <IconButton onClick={handleInterestToggle} color={interested ? 'secondary' : 'default'}>
                            <Favorite sx={{ marginRight: 1 }} />
                            {interested ? 'Interested' : 'Mark as Interested'}
                        </IconButton>
                        <Typography variant="body2" sx={{ marginBottom: 2 }}>
                            {event.interestedCount} people interested
                        </Typography>

                        {/* Share Button */}
                        <Box sx={{ marginTop: 2, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleShare}
                                startIcon={<Share />}
                                sx={{
                                    backgroundColor: '#e3f2fd',
                                    color: '#1976d2',
                                    '&:hover': {
                                        backgroundColor: '#bbdefb',
                                    },
                                }}
                            >
                                Share Event
                            </Button>
                        </Box>

                        {/* Signup Link */}
                        <Button
                            variant="contained"
                            color="primary"
                            href={event.signUp || '#'} // Use event.signupLink if available
                            sx={{
                                marginTop: 2,
                                backgroundColor: '#1976d2',
                                '&:hover': {
                                    backgroundColor: '#115293',
                                },
                            }}
                        >
                            Sign Up Now
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
            <Button
                variant="contained"
                color="secondary"
                sx={{ marginTop: 3 }}
                onClick={() => window.history.back()}
            >
                Back to Events
            </Button>

            {/* Snackbar for URL copied notification */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                message="Event URL copied to clipboard!"
            />
        </Box>
    );
};

export default ViewEvent;
// displayEvents.js
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    TextField,
    CircularProgress,
    Fade,
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './Firebase/Firebase'; // Adjust the import based on your file structure
import EventIcon from '@mui/icons-material/Event'; // Importing Event icon

const DisplayEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchEvents = async () => {
            const eventsCollection = collection(db, 'events');
            const eventSnapshot = await getDocs(eventsCollection);
            const eventList = eventSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setEvents(eventList);
            setLoading(false);
        };

        fetchEvents();
    }, []);

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" align="center" color="primary" gutterBottom>
                Current Events
            </Typography>
            <Box sx={{ marginBottom: 3, textAlign: 'center' }}>
                <TextField
                    variant="outlined"
                    placeholder="Search Events"
                    value={searchQuery}
                    onChange={handleSearch}
                    sx={{ width: '400px', backgroundColor: 'white' }} // Increased search bar width
                />
            </Box>
            <Grid container spacing={4}>
                {filteredEvents.length > 0 ? (
                    filteredEvents.map(event => (
                        <Grid item xs={12} sm={6} md={4} key={event.id}>
                            <Fade in={true} timeout={500}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        padding: 3,
                                        textAlign: 'center',
                                        borderRadius: 2,
                                        backgroundColor: 'white', // Changed to white background
                                        color: 'black', // Changed text color to black
                                        position: 'relative',
                                        overflow: 'hidden',
                                        height: '350px', // Consistent card height
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Added shadow effect
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            marginBottom: 1,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {event.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Start Date: {event.startDate} <br />
                                        End Date: {event.endDate}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="primary" // Changed button color to primary
                                        startIcon={<EventIcon />} // Added icon
                                        href={`/events/${event.id}`} // Redirects to the detailed view
                                        sx={{ marginTop: 2 }}
                                    >
                                        View More
                                    </Button>
                                </Paper>
                            </Fade>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Typography variant="h6" align="center" color="textSecondary">
                            No events found.
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default DisplayEvents;
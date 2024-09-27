// viewEvent.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Grid } from '@mui/material';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './Firebase/Firebase'; // Adjust the import based on your file structure

const ViewEvent = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            const eventDoc = doc(db, 'events', id);
            const eventSnapshot = await getDoc(eventDoc);
            if (eventSnapshot.exists()) {
                setEvent({ id: eventSnapshot.id, ...eventSnapshot.data() });
            } else {
                console.error('No such event!');
            }
            setLoading(false);
        };

        fetchEvent();
    }, [id]);

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (!event) {
        return <Typography>Event not found.</Typography>;
    }

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" align="center" color="primary" gutterBottom>
                {event.title}
            </Typography>
            <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: '8px',
                                maxHeight: '400px',
                                objectFit: 'cover',
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
                            Details
                        </Typography>
                        <Typography variant="body1"><strong>Description:</strong> {event.description}</Typography>
                        <Typography variant="body1"><strong>Organization:</strong> {event.organization}</Typography>
                        <Typography variant="body1"><strong>Location:</strong> {event.location}</Typography>
                        <Typography variant="body1"><strong>Start Date:</strong> {new Date(event.startDate).toLocaleDateString()}</Typography>
                        <Typography variant="body1"><strong>End Date:</strong> {new Date(event.endDate).toLocaleDateString()}</Typography>
                    </Grid>
                </Grid>
            </Paper>
            <Button variant="contained" color="secondary" sx={{ marginTop: 3 }} onClick={() => window.history.back()}>
                Back to Events
            </Button>
        </Box>
    );
};

export default ViewEvent;
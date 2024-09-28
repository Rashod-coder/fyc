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
    IconButton,
    MenuItem,
    FormControl,
    Select,
    InputLabel,
    Alert,
    Collapse,
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './Firebase/Firebase';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import FilterAltIcon from '@mui/icons-material/FilterAlt'; 
import CampaignIcon from '@mui/icons-material/Campaign'; // Icon for announcement

const DisplayEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [costFilter, setCostFilter] = useState('all');
    const [announcementOpen, setAnnouncementOpen] = useState(true);

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

    const handleCostFilterChange = (event) => {
        setCostFilter(event.target.value);
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCost = costFilter === 'all' || (costFilter === 'free' && !event.cost) || (costFilter === 'paid' && event.cost);
        return matchesSearch && matchesCost;
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{
            padding: 4,
            background: 'linear-gradient(135deg, #e0f7fa 30%, #ffe0b2 70%)', // Gradient background
            minHeight: '100vh',
        }}>
            
            {/* Announcement Bar */}
            <Collapse in={announcementOpen}>
                <Alert
                    severity="info"
                    icon={<CampaignIcon />}
                    onClose={() => setAnnouncementOpen(false)}
                    sx={{
                        marginBottom: 2,
                        backgroundColor: '#e3f2fd', 
                        color: '#1976d2',
                    }}
                >
                    Welcome to our event page! Stay tuned for upcoming features and more events.
                </Alert>
            </Collapse>

            <Typography variant="h4" align="center" color="primary" gutterBottom>
                Current Events
            </Typography>

            {/* Search and Filter Options */}
            <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 3 }}>
                {/* Search Bar */}
                <Grid item xs={8}>
                    <TextField
                        variant="outlined"
                        placeholder="Search Events"
                        value={searchQuery}
                        onChange={handleSearch}
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <IconButton>
                                    <SearchIcon color="primary" />
                                </IconButton>
                            ),
                        }}
                    />
                </Grid>

                {/* Cost Filter */}
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel>Cost</InputLabel>
                        <Select
                            value={costFilter}
                            onChange={handleCostFilterChange}
                            startAdornment={<FilterAltIcon color="primary" />}
                            sx={{
                                '& .MuiSelect-select': {
                                    padding: '10px 26px 10px 16px',
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#1976d2',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#115293',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#115293',
                                },
                            }}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="free">Free</MenuItem>
                            <MenuItem value="paid">Paid</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            <Grid container spacing={4}>
                {filteredEvents.length > 0 ? (
                    filteredEvents.map(event => (
                        <Grid item xs={12} sm={6} md={4} key={event.id}>
                            <Fade in={true} timeout={500}>
                                <Paper
                                    elevation={4}
                                    sx={{
                                        padding: 2,
                                        borderRadius: 3,
                                        backgroundColor: '#ffffff',
                                        color: 'black',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        height: '400px', // Set a fixed height for uniformity
                                        width: '100%',
                                        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
                                        transition: 'transform 0.4s ease, border-color 0.3s ease',
                                        border: '2px solid transparent',
                                        display: 'flex',
                                        flexDirection: 'column', 
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    {/* Event Cover Image */}
                                    <Box
                                        component="img"
                                        src={event.coverUrl || 'default-cover.jpg'}
                                        alt={`${event.title} cover`}
                                        sx={{
                                            width: '100%',
                                            height: '200px', // Fixed height
                                            objectFit: 'cover', // Maintain aspect ratio
                                            borderRadius: '8px',
                                            marginBottom: 2,
                                        }}
                                    />

                                    {/* Event Title */}
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            marginBottom: 1,
                                            fontWeight: 'bold',
                                            color: '#1976d2',
                                        }}
                                    >
                                        {event.title}
                                    </Typography>

                                    {/* Event Date */}
                                    <Typography variant="body2" color="textSecondary">
                                        Start Date: {event.startDate} <br />
                                        End Date: {event.endDate}
                                    </Typography>

                                    {/* Event Cost */}
                                    <Typography
                                        variant="body2"
                                        sx={{ marginTop: 1, display: 'flex', alignItems: 'center' }}
                                    >
                                        {event.cost ? (
                                            <>
                                                <AttachMoneyIcon sx={{ marginRight: 1, color: 'green' }} />
                                                {`$${event.cost}`}
                                            </>
                                        ) : (
                                            <>
                                                <MoneyOffIcon sx={{ marginRight: 1, color: 'red' }} />
                                                Free of Cost
                                            </>
                                        )}
                                    </Typography>

                                    {/* View More Button */}
                                    <Box sx={{ marginTop: 'auto', mb: 2 }}> {/* Added margin to the bottom */}
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<EventIcon />}
                                            href={`/events/${event.id}`}
                                            sx={{
                                                width: '100%', // Full width
                                                boxShadow: '0px 4px 12px rgba(25, 118, 210, 0.4)', 
                                                '&': {
                                                    backgroundColor: '#115293',
                                                },
                                            }}
                                        >
                                            View More
                                        </Button>
                                    </Box>
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
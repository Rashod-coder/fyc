import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Box,
    LinearProgress,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Fade,
    Snackbar,
    Tabs,
    Tab,
    Grid,
    CircularProgress
} from '@mui/material';
import { AddAPhoto as AddAPhotoIcon } from '@mui/icons-material';
import { Event as EventIcon, LocationOn as LocationIcon, CalendarToday as CalendarIcon, Description as DescriptionIcon, Business as OrganizationIcon } from '@mui/icons-material';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { addDoc, collection, getDocs, deleteDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, storage, auth } from './Firebase/Firebase';
import ManageEvents from './manageEvents';

function Events() {
    const [activeStep, setActiveStep] = useState(0);
    const [tabValue, setTabValue] = useState(0);
    const [eventData, setEventData] = useState({
        title: '',
        organization: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
        status: 'active',
        imageUrl: '',
    });
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [uploading, setUploading] = useState(false);

    const steps = ['Announce Event', 'Upload Image', 'Confirm and Submit'];

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    if (userData.accountLevel === 'admin') {
                        setIsAdmin(true);
                    }
                }
                fetchEvents();
            }
        });
    }, []);

    const fetchEvents = async () => {
        setLoadingEvents(true);
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const eventList = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventList);
        setLoadingEvents(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            const previewUrl = URL.createObjectURL(selectedFile);
            setFilePreview(previewUrl);
        }
    };

    const handleNextStep = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBackStep = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleSubmitEvent = async () => {
        if (file) {
            const storageRef = ref(storage, `eventImages/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            setShowProgress(true);
            setUploading(true);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error('File upload error:', error);
                    setSnackbarMessage('Failed to upload image');
                    setSnackbarOpen(true);
                    setUploading(false);
                },
                async () => {
                    const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                    const eventRef = collection(db, 'events');
                    await addDoc(eventRef, {
                        ...eventData,
                        imageUrl,
                    });
                    setSnackbarMessage('Event added successfully!');
                    setSnackbarOpen(true);
                    setUploadProgress(0);
                    setShowProgress(false);
                    setUploading(false);
                    setActiveStep(0);
                    setFilePreview(null);
                    setEventData({
                        title: '',
                        organization: '',
                        location: '',
                        startDate: '',
                        endDate: '',
                        description: '',
                        status: 'active',
                        imageUrl: '',
                    });
                    fetchEvents();
                }
            );
        } else {
            setSnackbarMessage('Please upload an image');
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleDeleteEvent = async (id) => {
        await deleteDoc(doc(db, 'events', id));
        fetchEvents();
        setSnackbarMessage('Event deleted successfully');
        setSnackbarOpen(true);
    };

    const handleSuspendEvent = async (id) => {
        const eventRef = doc(db, 'events', id);
        await updateDoc(eventRef, { status: 'suspended' });
        fetchEvents();
        setSnackbarMessage('Event suspended');
        setSnackbarOpen(true);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Event Title"
                                variant="outlined"
                                fullWidth
                                name="title"
                                value={eventData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Organization"
                                variant="outlined"
                                fullWidth
                                name="organization"
                                value={eventData.organization}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Location"
                                variant="outlined"
                                fullWidth
                                name="location"
                                value={eventData.location}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Start Date (MM/DD/YYYY)"
                                fullWidth
                                name="startDate"
                                value={eventData.startDate}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="End Date (MM/DD/YYYY)"
                                fullWidth
                                name="endDate"
                                value={eventData.endDate}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={4}
                                name="description"
                                value={eventData.description}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Box textAlign="center">
                        <Button
                            variant="contained"
                            component="label"
                            color="primary"
                            startIcon={<AddAPhotoIcon />}
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload Event Flyer'}
                            <input type="file" hidden onChange={handleFileChange} accept="image/*" />
                        </Button>
                        {filePreview && (
                            <Box
                                component="img"
                                src={filePreview}
                                alt="Event Preview"
                                sx={{
                                    width: '300px',
                                    height: '300px',
                                    objectFit: 'cover',
                                    margin: '20px auto',
                                    borderRadius: '10px',
                                    border: '3px solid black',
                                }}
                            />
                        )}
                        {showProgress && (
                            <Fade in={showProgress}>
                                <Box sx={{ mt: 2 }}>
                                    <LinearProgress variant="determinate" value={uploadProgress} />
                                    <Typography align="center" sx={{ mt: 1 }}>
                                        {Math.round(uploadProgress)}% uploaded
                                    </Typography>
                                </Box>
                            </Fade>
                        )}
                    </Box>
                );
            case 2:
                return (
                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    <EventIcon fontSize="small" /> {eventData.title}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    <OrganizationIcon fontSize="small" /> {eventData.organization}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    <LocationIcon fontSize="small" /> {eventData.location}
                                </Typography>
                                <Typography variant="body2" gutterBottom>
                                    <CalendarIcon fontSize="small" /> {eventData.startDate} - {eventData.endDate}
                                </Typography>
                                <Typography variant="body2">
                                    <DescriptionIcon fontSize="small" /> {eventData.description}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Box sx={{ padding: '40px', maxWidth: '900px', margin: 'auto' }}>
            <Typography variant="h4" align="center" gutterBottom>
                Event Management
            </Typography>
            {isAdmin ? (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <Tabs value={tabValue} onChange={handleTabChange}>
                            <Tab label="Create Event" />
                            <Tab label="Manage Events" />
                        </Tabs>
                    </Box>
                    {tabValue === 0 && (
                        <Box>
                            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                                {steps.map((label, index) => (
                                    <Step key={index}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                            <Box sx={{ mb: 4 }}>
                                {renderStepContent(activeStep)}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <Button disabled={activeStep === 0} onClick={handleBackStep}>
                                        Back
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={activeStep === steps.length - 1 ? handleSubmitEvent : handleNextStep}
                                        disabled={uploading}
                                    >
                                        {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    )}
                    {tabValue === 1 && <ManageEvents/>}
                    <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose} message={snackbarMessage} />
                </>
            ) : (
                <Typography variant="h6" color="error" align="center">
                    You do not have permission to access this page.
                </Typography>
            )}
        </Box>
    );
}

export default Events;

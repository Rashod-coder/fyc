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
    CircularProgress,
    FormControlLabel,
    Checkbox,
} from '@mui/material';
import { AddAPhoto as AddAPhotoIcon } from '@mui/icons-material';
import { Event as EventIcon, LocationOn as LocationIcon, CalendarToday as CalendarIcon, Description as DescriptionIcon, Business as OrganizationIcon } from '@mui/icons-material';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { addDoc, collection, getDocs, deleteDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, storage, auth } from './Firebase/Firebase';
import { useNavigate } from 'react-router-dom';
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
        signUp: '',
        isFree: true,
        cost: '',
    });
    const [eventFile, setEventFile] = useState(null);
    const navigate = useNavigate();
    const [coverFile, setCoverFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);
    const [eventFilePreview, setEventFilePreview] = useState(null);
    const [coverFilePreview, setCoverFilePreview] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    

    const steps = ['Announce Event', 'Upload Image',  'Confirm and Submit'];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                // Fetch user data to check if they are an admin
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists() && userDoc.data().accountLevel === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                    navigate('/login'); // Navigate to login if not an admin
                }
            } else {
                navigate('/login'); // Navigate to login if user is not authenticated
            }
        });

        // Clean up the subscription on unmount
        return () => unsubscribe();
    }, [navigate]);

    if (!isAdmin) {
        return (
            <Box p={3}>
                <Typography variant="h4" gutterBottom>
                    Access Denied
                </Typography>
                <Typography variant="body1">
                    Only admin users can access this section.
                </Typography>
            </Box>
        );
    }

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

    const handleCheckboxChange = (e) => {
        setEventData((prevData) => ({ ...prevData, isFree: e.target.checked }));
    };

    const handleEventFileChange = (e) => {
        if (e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setEventFile(selectedFile);
            const previewUrl = URL.createObjectURL(selectedFile);
            setEventFilePreview(previewUrl);
        }
    };

    const handleCoverFileChange = (e) => {
        if (e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setCoverFile(selectedFile);
            const previewUrl = URL.createObjectURL(selectedFile);
            setCoverFilePreview(previewUrl);
        }
    };

    const handleNextStep = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBackStep = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleSubmitEvent = async () => {
        if (eventFile && coverFile) {
            setShowProgress(true);
            setUploading(true);

            // Upload event flyer
            const eventStorageRef = ref(storage, `eventImages/${eventFile.name}`);
            const eventUploadTask = uploadBytesResumable(eventStorageRef, eventFile);
            eventUploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error('Event flyer upload error:', error);
                    setSnackbarMessage('Failed to upload event flyer image');
                    setSnackbarOpen(true);
                    setUploading(false);
                },
                async () => {
                    const eventImageUrl = await getDownloadURL(eventUploadTask.snapshot.ref);

                    // Upload cover flyer
                    const coverStorageRef = ref(storage, `coverImages/${coverFile.name}`);
                    const coverUploadTask = uploadBytesResumable(coverStorageRef, coverFile);
                    coverUploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => {
                            console.error('Cover flyer upload error:', error);
                            setSnackbarMessage('Failed to upload cover flyer image');
                            setSnackbarOpen(true);
                            setUploading(false);
                        },
                        async () => {
                            const coverImageUrl = await getDownloadURL(coverUploadTask.snapshot.ref);

                            // Save event data to Firestore
                            const eventRef = collection(db, 'events');
                            await addDoc(eventRef, {
                                ...eventData,
                                imageUrl: eventImageUrl,
                                coverUrl: coverImageUrl, // Save cover image URL
                            });
                            setSnackbarMessage('Event added successfully!');
                            setSnackbarOpen(true);
                            setUploadProgress(0);
                            setShowProgress(false);
                            setUploading(false);
                            setActiveStep(0);
                            setEventFilePreview(null);
                            setCoverFilePreview(null);
                            setEventFile(null);
                            setCoverFile(null);
                            setEventData({
                                title: '',
                                organization: '',
                                location: '',
                                startDate: '',
                                endDate: '',
                                description: '',
                                status: 'active',
                                imageUrl: '',
                                signUp: '',
                                isFree: true,
                                cost: '',
                            });
                            fetchEvents();
                        }
                    );
                }
            );
        } else {
            setSnackbarMessage('Please upload both images');
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
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
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Sign up link"
                                fullWidth
                                name="signUp"
                                value={eventData.signUp}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Cost"
                                variant="outlined"
                                fullWidth
                                name="cost"
                                value={eventData.cost}
                                onChange={handleInputChange}
                                required={!eventData.isFree}
                                type={eventData.isFree ? 'hidden' : 'text'}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={eventData.isFree}
                                        onChange={handleCheckboxChange}
                                        color="primary"
                                    />
                                }
                                label="Is this event free?"
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
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="h6">Upload Event Flyer</Typography>
                                <input
                                    accept="image/*"
                                    id="event-file-input"
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={handleEventFileChange}
                                />
                                <label htmlFor="event-file-input">
                                    <Button variant="contained" component="span" startIcon={<AddAPhotoIcon />}>
                                        Upload Event Flyer
                                    </Button>
                                </label>
                                {eventFilePreview && (
                                    <Box mt={2}>
                                        <img src={eventFilePreview} alt="Event Flyer Preview" style={{ maxWidth: '100%', height: 'auto' }} />
                                    </Box>
                                )}
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6">Upload Cover Image</Typography>
                                <input
                                    accept="image/*"
                                    id="cover-file-input"
                                    type="file"
                                    style={{ display: 'none' }}
                                    onChange={handleCoverFileChange}
                                />
                                <label htmlFor="cover-file-input">
                                    <Button variant="contained" component="span" startIcon={<AddAPhotoIcon />}>
                                        Upload Cover Image
                                    </Button>
                                </label>
                                {coverFilePreview && (
                                    <Box mt={2}>
                                        <img src={coverFilePreview} alt="Cover Image Preview" style={{ maxWidth: '100%', height: 'auto' }} />
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    );
            case 2:
                return (
                    <Box textAlign="center">
                        <Typography variant="h6">Confirm Event Details</Typography>
                        <Typography variant="body1">Title: {eventData.title}</Typography>
                        <Typography variant="body1">Organization: {eventData.organization}</Typography>
                        <Typography variant="body1">Location: {eventData.location}</Typography>
                        <Typography variant="body1">Start Date: {eventData.startDate}</Typography>
                        <Typography variant="body1">End Date: {eventData.endDate}</Typography>
                        <Typography variant="body1">Description: {eventData.description}</Typography>
                        <Typography variant="body1">Is Free: {eventData.isFree ? 'Yes' : 'No'}</Typography>
                        {!eventData.isFree && <Typography variant="body1">Cost: ${eventData.cost}</Typography>}
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Create New Event
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            {activeStep === steps.length ? (
                <Box mt={2}>
                    <Typography variant="h6">All steps completed - you can now view your events!</Typography>
                    <Button onClick={() => setActiveStep(0)} variant="contained" color="primary">
                        Create Another Event
                    </Button>
                </Box>
            ) : (
                <Box sx={{ mt: 2 }}>
                    {renderStepContent(activeStep)}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        {activeStep > 0 && (
                            <Button onClick={handleBackStep} sx={{ mr: 1 }}>
                                Back
                            </Button>
                        )}
                        <Button
                            onClick={activeStep === steps.length - 1 ? handleSubmitEvent : handleNextStep}
                            variant="contained"
                            color="primary"
                            disabled={showProgress} // Disable button if upload is in progress
                        >
                            {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                        </Button>
                    </Box>
                    {showProgress && (
                        <Box sx={{ width: '100%', mt: 2 }}>
                            <LinearProgress variant="determinate" value={uploadProgress} />
                        </Box>
                    )}
                </Box>
            )}
            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
            />
            
        </Box>
    );
            }

export default Events;
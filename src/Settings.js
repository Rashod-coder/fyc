import React, { useState, useEffect } from 'react';
import { auth, db, storage } from './Firebase/Firebase'; // Firebase imports
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'; // For file upload with progress
import { TextField, Button, Box, LinearProgress, Typography, CircularProgress, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Settings() {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({
        name: '',
        linkedin: '',
        instagram: '',
        bio: '',
        school: '',
        role: '',
        profilePicUrl: '',
    });
    const [file, setFile] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false); // To show/hide progress bar
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userSnapshot = await getDoc(userDocRef);
                    if (userSnapshot.exists()) {
                        setUserData(userSnapshot.data());
                    }
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                navigate('/login');
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            const previewUrl = URL.createObjectURL(selectedFile);
            setFilePreview(previewUrl);
        }
    };

    const handleSaveChanges = async () => {
        setUpdating(true);
        setUpdateSuccess(false);
        setShowProgress(false); // Reset progress bar visibility
        const user = auth.currentUser;

        try {
            const userDocRef = doc(db, 'users', user.uid);

            if (file) {
                const storageRef = ref(storage, `profilePictures/${user.uid}`);
                const uploadTask = uploadBytesResumable(storageRef, file);

                setShowProgress(true); // Show progress bar when upload starts

                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                        // Simulate a delay for smoother progress
                        setTimeout(() => {
                            setUploadProgress(progress);
                        }, 200); // Small delay to smoothen out fast uploads
                    },
                    (error) => {
                        console.error('File upload error:', error);
                        setUpdating(false);
                    },
                    async () => {
                        const profilePicUrl = await getDownloadURL(uploadTask.snapshot.ref);
                        await updateDoc(userDocRef, { ...userData, profilePicUrl });
                        setUpdateSuccess(true);
                        setUpdating(false);
                        setTimeout(() => setShowProgress(false), 500); // Fade out progress bar after upload completes
                    }
                );
            } else {
                await updateDoc(userDocRef, userData);
                setUpdateSuccess(true);
                setUpdating(false);
            }
        } catch (error) {
            console.error('Error updating user profile:', error);
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                backgroundColor: '#f0f4f8',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 3,
            }}
        >
            <Box
                sx={{
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    boxShadow: 3,
                    padding: 4,
                    width: '90%', // Wider layout
                    maxWidth: '950px', // Increased max-width for wider form
                    color: '#333',
                }}
            >
                <Typography variant="h4" align="center" color="primary" gutterBottom>
                    Edit Profile
                </Typography>

                {updateSuccess && (
                    <Typography align="center" sx={{ color: 'green', mb: 2 }}>
                        Profile updated successfully!
                    </Typography>
                )}

                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        component="label"
                        sx={{ mb: 2 }}
                        color="primary"
                    >
                        Upload Profile Picture
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </Button>
                    {filePreview && (
                        <Box
                            component="img"
                            src={filePreview}
                            alt="Profile Preview"
                            sx={{
                                width: '200px',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '50%',
                                display: 'block',
                                margin: 'auto',
                                border: '3px solid black',
                                mb: 2
                            }}
                        />
                    )}

                    {/* Progress bar */}
                    {showProgress && (
                        <Fade in={showProgress} timeout={500}>
                            <Box sx={{ mb: 2 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={uploadProgress}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: '#f0f0f0',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: '#3f51b5', // Progress bar color
                                        },
                                    }}
                                />
                                <Typography align="center" sx={{ mt: 1 }}>
                                    {Math.round(uploadProgress)}% uploaded
                                </Typography>
                            </Box>
                        </Fade>
                    )}
                </Box>

                <TextField
                    label="Name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                />

                <TextField
                    label="LinkedIn"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    name="linkedin"
                    value={userData.linkedin}
                    onChange={handleInputChange}
                />

                <TextField
                    label="Instagram"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    name="instagram"
                    value={userData.instagram}
                    onChange={handleInputChange}
                />

                <TextField
                    label="School"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    name="school"
                    value={userData.school}
                    onChange={handleInputChange}
                />

                <TextField
                    label="Role"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    name="role"
                    value={userData.role}
                    onChange={handleInputChange}
                />

                <TextField
                    label="Bio"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                    name="bio"
                    value={userData.bio}
                    onChange={handleInputChange}
                />

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSaveChanges}
                    disabled={updating}
                    sx={{ mt: 3, padding: 1.5, fontSize: '1.2rem', borderRadius: '30px' }}
                >
                    {updating ? 'Saving...' : 'Save Changes'}
                </Button>
            </Box>
        </Box>
    );
}

export default Settings;

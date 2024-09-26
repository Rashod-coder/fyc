import React, { useState } from 'react';
import { storage, db } from './Firebase/Firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { TextField, Button, Box, CircularProgress, Typography, LinearProgress, Stepper, Step, StepLabel } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function EditPartnerPage() {
    const [title, setTitle] = useState('');
    const [websiteLink, setWebsiteLink] = useState('');
    const [orgHead, setOrgHead] = useState(''); // Organization Head Name
    const [groupDescription, setGroupDescription] = useState(''); // Simple text area for description
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false); // State to manage loading status
    const [progress, setProgress] = useState(0); // For linear progress

    const steps = ['Title', 'Website Link', 'Organization Head', 'Description', 'Upload Image'];

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
        } else {
            alert('Please upload a valid image file.');
            setFile(null); 
        }
    };

    // Check if each field is filled to determine step completion
    const isStepCompleted = (step) => {
        switch (step) {
            case 0:
                return title;
            case 1:
                return websiteLink;
            case 2:
                return orgHead;
            case 3:
                return groupDescription;
            case 4:
                return file;
            default:
                return false;
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert('Please select an image to upload.');
            return;
        }

        setLoading(true);
        setProgress(25);

        try {
            const storageRef = ref(storage, `logos/${file.name}`);
            await uploadBytes(storageRef, file);
            setProgress(50);

            const downloadURL = await getDownloadURL(storageRef);
            setProgress(75);

            const partnerData = {
                title,
                websiteLink,
                groupDescription,
                logoURL: downloadURL,
                orgHead
            };

            const partnersCollection = collection(db, 'partner');
            await addDoc(partnersCollection, partnerData);
            setProgress(100);

            alert('Upload successful!');
            setTitle('');
            setWebsiteLink('');
            setOrgHead('');
            setGroupDescription('');
            setFile(null);
            setProgress(0);

            document.getElementById('fileUpload').value = ''; 
        } catch (error) {
            console.error('Error uploading partner info:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box 
            sx={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '50px',
            }}
        >
            <Box 
                sx={{
                    width: '100%',  // Increase width to 90% of the screen
                    maxWidth: '1400px',  // Max width increased to 1100px
                    backgroundColor: '#e4e7ed', 
                    padding: '32px', 
                    borderRadius: '16px', 
                    boxShadow: 6,
                }}
            >
                <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                    Add a new Partner
                </Typography>
                <ul>
    <li>Please include "https://" before the link</li>
    <li className='mb-4'>If the Club doesn't have a website link, use one of their socials</li>
</ul>


<Stepper activeStep={steps.findIndex((_, idx) => !isStepCompleted(idx))} alternativeLabel>
    {steps.map((label, index) => (
        <Step key={label} completed={isStepCompleted(index)}>
            <StepLabel 
                StepIconComponent={({ active, completed }) => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {completed ? (
                            <CheckCircleIcon color="success" />
                        ) : (
                            <div style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: active ? '#1976d2' : 'transparent', // Blue when active
                                border: '2px solid #ccc', // Outline for inactive steps
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                {active && <div style={{
                                    width: 12,
                                    height: 12,
                                    backgroundColor: '#1976d2',
                                    borderRadius: '50%',
                                }} />}
                            </div>
                        )}
                    </div>
                )}
            >
                {label}
            </StepLabel>
        </Step>
    ))}
</Stepper>


                <form onSubmit={handleSubmit}>
                    {/* Title Input */}
                    <TextField
                        id="title"
                        label="Title"
                        variant="standard"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        sx={{ mb: 4 }}
                    />

                    {/* Website Link Input */}
                    <TextField
                        id="websiteLink"
                        label="Website Link"
                        variant="standard"
                        fullWidth
                        value={websiteLink}
                        onChange={(e) => setWebsiteLink(e.target.value)}
                        required
                        sx={{ mb: 4 }}
                    />

                    {/* Organization Head Input */}
                    <TextField
                        id="orgHead"
                        label="Organization Head Name"
                        variant="standard"
                        fullWidth
                        value={orgHead}
                        onChange={(e) => setOrgHead(e.target.value)}
                        sx={{ mb: 4 }}
                    />

                    {/* Description Input */}
                    <TextField
                        id="groupDescription"
                        label="Group Description"
                        variant="standard"
                        multiline
                        fullWidth
                        rows={4}
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        sx={{ mb: 4 }}
                    />

                    {/* File Upload Button */}
                    <Button
                        variant="contained"
                        component="label"
                        color="primary"
                        fullWidth
                        startIcon={<UploadFileIcon />}
                        sx={{
                            backgroundColor: '#1E3A8A',
                            mb: 4,
                            padding: '12px', 
                            textTransform: 'none',
                        }}
                    >
                        {file ? file.name : 'Upload Logo Image'}
                        <input
                            type="file"
                            id="fileUpload"
                            onChange={handleFileChange}
                            accept="image/*"
                            hidden
                        />
                    </Button>

                    {/* Progress bar displayed when the upload starts */}
                    {progress > 0 && (
                        <LinearProgress variant="determinate" value={progress} sx={{ mb: 4 }} />
                    )}

                    <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        type="submit"
                        disabled={loading}
                        sx={{ backgroundColor: '#1E3A8A', padding: '12px', fontWeight: 'bold' }}
                    >
                        {loading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Upload Partner Info'}
                    </Button>
                </form>

                {loading && (
                    <Typography variant="body2" sx={{ color: '#1E3A8A', mt: 2 }}>
                        Uploading your information, please wait...
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export default EditPartnerPage;
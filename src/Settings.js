import React, { useState, useEffect } from 'react';
import { auth, db, storage } from './Firebase/Firebase'; // Firebase imports
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'; // For file uploads
import 'bootstrap/dist/css/bootstrap.min.css';
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
    const [updateSuccess, setUpdateSuccess] = useState(false); // To show success message
    const [filePreview, setFilePreview] = useState(null); // State for file preview
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
            // Create a preview URL for the selected file
            const previewUrl = URL.createObjectURL(selectedFile);
            setFilePreview(previewUrl); // Update preview state
        }
    };

    const handleSaveChanges = async () => {
        setUpdating(true);
        setUpdateSuccess(false); // Reset success state before updating
        const user = auth.currentUser;
        try {
            const userDocRef = doc(db, 'users', user.uid);

            // If a new profile picture is selected, upload it
            if (file) {
                const storageRef = ref(storage, `profilePictures/${user.uid}`);
                await uploadBytes(storageRef, file);
                const profilePicUrl = await getDownloadURL(storageRef);
                await updateDoc(userDocRef, { ...userData, profilePicUrl });
            } else {
                await updateDoc(userDocRef, userData); // If no file, just update text fields
            }

            setUpdateSuccess(true); // Set success message when update is done
            setUpdating(false);
        } catch (error) {
            console.error('Error updating user profile:', error);
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            background: 'linear-gradient(to right, #e0f7fa, #f0f4f8)',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.2)', // Frosted glass effect
                backdropFilter: 'blur(10px)', // Glass blur
                padding: '40px',
                borderRadius: '20px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                maxWidth: '90%', // Increased max width
                width: '100%',
                color: '#333'
            }}>
                <h2 className="text-center mb-4" style={{ fontSize: '2.5rem', color: '#0277bd' }}>Edit Profile</h2>

                {updateSuccess && (
                    <div className="alert alert-success text-center" role="alert">
                        Profile updated successfully!
                    </div>
                )}

                <div className="mb-4 text-center">    
                    <label htmlFor="profilePic" style={{
                        display: 'inline-block',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#007BFF', // Bootstrap primary color
                        color: '#ffffff',            // White text color
                        borderRadius: '5px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s',
                        border: '2px dashed #007BFF', // Dashed border for upload indication
                        width: '200px', // Fixed width
                        margin: '1rem 30px' // Increased horizontal margin
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'} // Darker shade on hover
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007BFF'} // Original color on leave
                    >
                        <i className="bi bi-upload" style={{ marginRight: '0.5rem' }}></i> Upload Profile Picture Here
                    </label>

                    <input
                        type="file"
                        className="form-control"
                        id="profilePic"
                        onChange={handleFileChange}
                        accept="image/*" // Restrict to image file types
                        style={{
                            display: 'none'
                        }}
                    />
                    
                    {/* Show the preview of the new profile picture or existing one */}
                    <img
                        src={filePreview || userData.profilePicUrl}
                        alt="Profile"
                        className="mt-3 rounded-circle"
                        style={{
                            width: '200px',
                            height: '200px',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            border: '3px solid black',
                            padding: '5px',
                            transition: 'all 0.3s ease-in-out',
                            marginTop: '20px', // Add margin to separate from the button
                            marginLeft: '30px', // Increased left margin for more spacing
                            marginRight: '30px' // Increased right margin for more spacing
                        }}
                    />
                </div>

                <div className="row">
                    <div className="col-md-6 mb-4">
                        <label htmlFor="name" className="form-label" style={{ fontSize: '1.2rem', fontWeight: 'lighter' }}>Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={userData.name || ''}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 40px', 
                                fontSize: '1rem',
                                color: '#000',
                                border: 'none',
                                borderBottom: '2px solid #000',
                                outline: 'none',
                                background: 'transparent',
                              }}
                        />
                    </div>

                    <div className="col-md-6 mb-4">
                        <label htmlFor="linkedin" className="form-label" style={{ fontSize: '1.2rem', fontWeight: 'lighter' }}>LinkedIn</label>
                        <input
                            type="text"
                            className="form-control"
                            id="linkedin"
                            name="linkedin"
                            value={userData.linkedin || ''}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 40px', 
                                fontSize: '1rem',
                                color: '#000',
                                border: 'none',
                                borderBottom: '2px solid #000',
                                outline: 'none',
                                background: 'transparent',
                              }}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-4">
                        <label htmlFor="instagram" className="form-label" style={{ fontSize: '1.2rem', fontWeight: 'lighter' }}>Instagram</label>
                        <input
                            type="text"
                            className="form-control"
                            id="instagram"
                            name="instagram"
                            value={userData.instagram || ''}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 40px', 
                                fontSize: '1rem',
                                color: '#000',
                                border: 'none',
                                borderBottom: '2px solid #000',
                                outline: 'none',
                                background: 'transparent',
                              }}
                        />
                    </div>

                    <div className="col-md-6 mb-4">
                        <label htmlFor="school" className="form-label" style={{ fontSize: '1.2rem', fontWeight: 'lighter' }}>Current School</label>
                        <input
                            type="text"
                            className="form-control"
                            id="school"
                            name="school"
                            value={userData.school || ''}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: '10px 10px 10px 40px', 
                                fontSize: '1rem',
                                color: '#000',
                                border: 'none',
                                borderBottom: '2px solid #000',
                                outline: 'none',
                                background: 'transparent',
                              }}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="role" className="form-label" style={{ fontSize: '1.2rem', fontWeight: 'lighter' }}>Role in Club</label>
                    <input
                        type="text"
                        className="form-control"
                        id="role"
                        name="role"
                        value={userData.role || ''}
                        onChange={handleInputChange}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px', 
                            fontSize: '1rem',
                            color: '#000',
                            border: 'none',
                            borderBottom: '2px solid #000',
                            outline: 'none',
                            background: 'transparent',
                          }}
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="bio" className="form-label" style={{ fontSize: '1.2rem', fontWeight: 'lighter' }}>About Me</label>
                    <textarea
                        className="form-control"
                        id="bio"
                        name="bio"
                        rows="4"
                        value={userData.bio || ''}
                        onChange={handleInputChange}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px', 
                            fontSize: '1rem',
                            color: '#000',
                            border: 'none',
                            borderBottom: '2px solid #000',
                            outline: 'none',
                            background: 'transparent',
                          }}
                    ></textarea>
                </div>

                <button
                    className="btn w-100"
                    onClick={handleSaveChanges}
                    disabled={updating}
                    style={{
                        fontSize: '1.2rem',
                        padding: '15px',
                        borderRadius: '30px',
                        backgroundColor: '#0277bd',
                        color: 'white',
                        border: 'none',
                        transition: 'background 0.3s ease'
                    }}
                >
                    {updating ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                        'Save Changes'
                    )}
                </button>
            </div>
        </div>
    );
}

export default Settings;

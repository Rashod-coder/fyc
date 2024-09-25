import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill stylesheet
import { storage, db } from './Firebase/Firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

function EditPartnerPage() {
    const [editorContent, setEditorContent] = useState('');
    const [title, setTitle] = useState('');
    const [websiteLink, setWebsiteLink] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false); // State to manage loading status

    // Handle editor content change
    const handleEditorChange = (value) => {
        setEditorContent(value);
    };

    // Handle file input change
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
        } else {
            alert('Please upload a valid image file.');
            setFile(null); // Reset if the file is not an image
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if a file is selected
        if (!file) {
            alert('Please select an image to upload.');
            return;
        }

        setLoading(true); // Start loading

        try {
            // Upload the image to Firebase Storage
            const storageRef = ref(storage, `logos/${file.name}`);
            await uploadBytes(storageRef, file);
            console.log('File uploaded successfully');

            // Get the download URL
            const downloadURL = await getDownloadURL(storageRef);

            // Prepare the partner data to store in Firestore
            const partnerData = {
                title,
                websiteLink,
                groupDescription: editorContent,
                logoURL: downloadURL // Store the download link of the logo
            };

            // Add the partner data to Firestore
            const partnersCollection = collection(db, 'partner');
            await addDoc(partnersCollection, partnerData);
            console.log('Partner info uploaded successfully');

            // Show success alert
            alert('Upload successful!');

            // Reset form fields after successful submission
            setTitle('');
            setWebsiteLink('');
            setEditorContent('');
            setFile(null); // Clear the file input

            // Clear the file input in the form
            document.getElementById('fileUpload').value = ''; // Reset the input field
        } catch (error) {
            console.error('Error uploading partner info:', error);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className="container mt-5">
            <div className="card p-4 shadow-sm" style={{ backgroundColor: '#F0F4FF', borderRadius: '12px' }}>
                <h2 className="mb-4" style={{ color: '#1E3A8A' }}>Add Partner Page</h2>

                <form onSubmit={handleSubmit}>
                    {/* Title input */}
                    <div className="form-group mb-4">
                        <label htmlFor="title" style={{ color: '#1E3A8A' }}>Title</label>
                        <input
                            type="text"
                            id="title"
                            className="form-control"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={{ backgroundColor: '#E0E7FF', color: '#1E3A8A', border: '1px solid #1E3A8A' }}
                        />
                    </div>

                    {/* Website link input */}
                    <div className="form-group mb-4">
                        <label htmlFor="websiteLink" style={{ color: '#1E3A8A' }}>Website Link</label>
                        <input
                            type="url"
                            id="websiteLink"
                            className="form-control"
                            value={websiteLink}
                            onChange={(e) => setWebsiteLink(e.target.value)}
                            style={{ backgroundColor: '#E0E7FF', color: '#1E3A8A', border: '1px solid #1E3A8A' }}
                        />
                    </div>

                    {/* Group Description (using ReactQuill) */}
                    <div className="form-group mb-4">
                        <label htmlFor="description" style={{ color: '#1E3A8A' }}>Group Description</label>
                        <ReactQuill 
                            value={editorContent} 
                            onChange={handleEditorChange} 
                            style={{ backgroundColor: '#E0E7FF', color: '#1E3A8A', border: '1px solid #1E3A8A' }}
                        />
                    </div>

                    {/* File input */}
                    <div className="form-group mb-4">
                        <label htmlFor="fileUpload" style={{ color: '#1E3A8A' }}>Upload Group Logo</label>
                        <input
                            type="file"
                            id="fileUpload"
                            className="form-control"
                            onChange={handleFileChange}
                            accept="image/*" // Only allow image files
                            style={{ backgroundColor: '#E0E7FF', color: '#1E3A8A', border: '1px solid #1E3A8A' }}
                        />
                    </div>

                    {/* Submit button */}
                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        style={{ backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' }}
                        disabled={loading} // Disable button during loading
                    >
                        {loading ? 'Uploading...' : 'Upload Partner Info'}
                    </button>
                </form>

                {/* Optional loading spinner or message */}
                {loading && (
                    <div className="mt-3" style={{ color: '#1E3A8A' }}>
                        <p>Uploading your information, please wait...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EditPartnerPage;
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill stylesheet

function EditPartnerPage() {
    const [editorContent, setEditorContent] = useState('');
    const [title, setTitle] = useState('');
    const [websiteLink, setWebsiteLink] = useState('');
    const [files, setFiles] = useState([]);

    // Handle editor content change
    const handleEditorChange = (value) => {
        setEditorContent(value);
    };

    // Handle file input change
    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Prepare the form data
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', editorContent);
        formData.append('websiteLink', websiteLink);

        // Append files to form data
        Array.from(files).forEach((file, index) => {
            formData.append(`file${index}`, file);
        });

        // Log the data to the console (for demonstration purposes)
        console.log('Form Data:', formData);

        // You can proceed to save this data to a database or Firestore here
        // Example: upload form data to a server or Firebase
        // fetch('your-api-endpoint', {
        //     method: 'POST',
        //     body: formData,
        // })
        // .then(response => response.json())
        // .then(data => console.log(data))
        // .catch(error => console.error(error));
    };

    return (
        <div className="container mt-5">
            <div className="card p-4 shadow-sm" style={{ backgroundColor: '#FAF3E0', borderRadius: '12px' }}>
                <h2 className="mb-4" style={{ color: '#6B4226' }}>Edit Partner Page</h2>

                <form onSubmit={handleSubmit}>
                    {/* Title input */}
                    <div className="form-group mb-4">
                        <label htmlFor="title" style={{ color: '#6B4226' }}>Title</label>
                        <input
                            type="text"
                            id="title"
                            className="form-control"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={{ backgroundColor: '#FFF5E1', color: '#6B4226' }}
                        />
                    </div>

                    {/* Website link input */}
                    <div className="form-group mb-4">
                        <label htmlFor="websiteLink" style={{ color: '#6B4226' }}>Website Link</label>
                        <input
                            type="url"
                            id="websiteLink"
                            className="form-control"
                            value={websiteLink}
                            onChange={(e) => setWebsiteLink(e.target.value)}
                            style={{ backgroundColor: '#FFF5E1', color: '#6B4226' }}
                        />
                    </div>

                    <div className="form-group mb-4">
                        <label htmlFor="websiteLink" style={{ color: '#6B4226' }}>Group Description</label>
                        <input
                            type="text"
                            id="description"
                            className="form-control"
                            value={editorContent}
                            onChange={(e) => setEditorContent(e.target.value)}
                            required
                            style={{ backgroundColor: '#FFF5E1', color: '#6B4226' }}
                        />
                    </div>

                    {/* File input */}
                    <div className="form-group mb-4">
                        <label htmlFor="fileUpload" style={{ color: '#6B4226' }}>Upload Group Logo</label>
                        <input
                            type="file"
                            id="fileUpload"
                            className="form-control"
                            onChange={handleFileChange}

                            style={{ backgroundColor: '#FFF5E1', color: '#6B4226' }}
                        />
                    </div>

                    {/* Submit button */}
                    <button type="submit" className="btn btn-success" style={{ backgroundColor: '#B5651D', borderColor: '#B5651D' }}>
                        Upload Partner Info
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EditPartnerPage;
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './Firebase/Firebase';
import 'bootstrap/dist/css/bootstrap.min.css';

function GuestDashboard() {
    const [partnershipStatus, setPartnershipStatus] = useState('');
    const [partnerName, setPartnerName] = useState('');
    const [partnerDescription, setPartnerDescription] = useState('');
    const [orgHeadName, setOrgHeadName] = useState(''); // Organization Head's Name
    const [bestContact, setBestContact] = useState(''); // Best Contact Information
    const [pastRequests, setPastRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Fetch partnership status and past requests from Firebase
    useEffect(() => {
        const fetchPartnershipInfo = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userSnapshot = await getDoc(userDocRef);

                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.data();
                        setPartnershipStatus(userData.partnershipStatus || '');

                        // Fetch past requests for this user
                        const requestsQuery = query(collection(db, 'partnerRequests'), where('uid', '==', user.uid));
                        const requestsSnapshot = await getDocs(requestsQuery);

                        const requests = [];
                        requestsSnapshot.forEach((doc) => {
                            requests.push(doc.data());
                        });

                        setPastRequests(requests);
                    }
                } catch (error) {
                    console.error('Error fetching partnership information:', error);
                }
            }
            setLoading(false);
        };

        fetchPartnershipInfo();
    }, []);

    // Handle partnership request form submission
    const handlePartnershipRequest = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const user = auth.currentUser;

        if (user) {
            try {
                const userDocRef = doc(db, 'users', user.uid);

                // Update partnership status in the user's document
                await updateDoc(userDocRef, {
                    partnershipStatus: 'pending',
                });

                // Prepare the new request data
                const newRequest = {
                    uid: user.uid,
                    email: user.email,
                    partnerName: partnerName,
                    partnerDescription: partnerDescription,
                    orgHeadName: orgHeadName,
                    bestContact: bestContact,
                    status: 'pending',
                    timestamp: new Date(), // Store as JavaScript Date object
                };

                // Add the request to the "partnerRequests" collection
                const partnerRequestDocRef = doc(db, 'partnerRequests', user.uid); // Each request is stored using the user's UID
                await setDoc(partnerRequestDocRef, newRequest);

                // Update state to include the new request
                setPastRequests((prevRequests) => [...prevRequests, newRequest]);

                setPartnershipStatus('pending'); // Update status to pending
            } catch (error) {
                console.error('Error updating partnership request:', error);
            } finally {
                setSubmitting(false);
            }
        }
    };

    // Loading spinner while fetching partnership status
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ marginTop: '2rem', backgroundColor: 'white', padding: '2rem', borderRadius: '12px' }}>


            {/* Only render request button and form if partnershipStatus is not "pending" */}
            {partnershipStatus !== 'pending' ? (
                <>
                    <div className="text-center mb-4">
                        <button
                            className="btn"
                            onClick={() => setPartnershipStatus('showForm')}
                            style={{ backgroundColor: '#a35709', color: '#fff', fontWeight: 'bold' }}
                        >
                            Request Partnership
                        </button>
                    </div>

                    {partnershipStatus === 'showForm' && (
                        <div className="card shadow-sm mb-4" style={{ padding: '2rem', borderRadius: '10px', backgroundColor: '#d9b593' }}>
                            <h3 className="text-center mb-4" style={{ color: '#a35709', fontWeight: 'bold' }}>Request Partnership</h3>
                            <form onSubmit={handlePartnershipRequest}>
                                <div className="form-group mb-3">
                                    <label htmlFor="partnerName" className="fw-bold" style={{ color: '#b04e0f' }}>Partnership Name</label>
                                    <input
                                        type="text"
                                        id="partnerName"
                                        className="form-control"
                                        value={partnerName}
                                        onChange={(e) => setPartnerName(e.target.value)}
                                        placeholder="Enter partnership name"
                                        required
                                        style={{ borderColor: '#a35709' }}
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="partnerDescription" className="fw-bold" style={{ color: '#b04e0f' }}>Partnership Description</label>
                                    <textarea
                                        id="partnerDescription"
                                        className="form-control"
                                        value={partnerDescription}
                                        onChange={(e) => setPartnerDescription(e.target.value)}
                                        placeholder="Enter partnership description"
                                        rows="4"
                                        required
                                        style={{ borderColor: '#a35709' }}
                                    ></textarea>
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="orgHeadName" className="fw-bold" style={{ color: '#b04e0f' }}>Organization Head's Name</label>
                                    <input
                                        type="text"
                                        id="orgHeadName"
                                        className="form-control"
                                        value={orgHeadName}
                                        onChange={(e) => setOrgHeadName(e.target.value)}
                                        placeholder="Enter organization head's name"
                                        required
                                        style={{ borderColor: '#a35709' }}
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label htmlFor="bestContact" className="fw-bold" style={{ color: '#b04e0f' }}>Best Contact Information</label>
                                    <input
                                        type="text"
                                        id="bestContact"
                                        className="form-control"
                                        value={bestContact}
                                        onChange={(e) => setBestContact(e.target.value)}
                                        placeholder="Enter best contact info"
                                        required
                                        style={{ borderColor: '#a35709' }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn w-100"
                                    disabled={submitting}
                                    style={{ backgroundColor: '#a35709', color: '#fff', fontWeight: 'bold' }}
                                >
                                    {submitting ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        'Submit Request'
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center text-success" style={{ fontWeight: 'bold', color: '#b04e0f' }}>
                    <h4>Request submitted, keep a look out in your email!</h4>
                </div>
            )}

            {/* Previous Partnership Requests */}
            <div className="card shadow-sm" style={{ padding: '2rem', borderRadius: '10px', marginTop: '2rem', backgroundColor: '#f5e9df' }}>
                <h3 className="text-center mb-4" style={{ color: '#a35709', fontWeight: 'bold' }}>Previous Partnership Requests</h3>
                {pastRequests.length > 0 ? (
                    <ul className="list-group">
                        {pastRequests.map((request, index) => (
                            <li key={index} className="list-group-item" style={{ backgroundColor: '#d9b28a' }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="mb-1" style={{ color: '#a35709', fontWeight: 'bold' }}>{request.partnerName}</h5>
                                        <p className="mb-1">{request.partnerDescription}</p>
                                        <small style={{ color: '#b04e0f' }}>Organization Head: {request.orgHeadName}</small>
                                        <br />
                                        <small style={{ color: '#b04e0f' }}>Contact: {request.bestContact}</small>
                                    </div>
                                    <span className={`badge bg-${request.status === 'pending' ? 'warning' : 'success'} text-dark`}>
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <small className="text-muted">{new Date(request.timestamp).toLocaleDateString()}</small>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-muted">No previous requests found.</p>
                )}
            </div>
        </div>
    );
}

export default GuestDashboard;

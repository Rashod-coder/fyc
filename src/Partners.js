import React, { useEffect, useState } from 'react';
import { storage, db } from './Firebase/Firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './PartnersPage.css'; // Import CSS for animations

function PartnersPage({ currentUser }) { // Assuming currentUser is passed as a prop
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const fetchPartners = async () => {
            setLoading(true); // Set loading to true before fetching
            try {
                const partnersCollection = collection(db, 'partner');
                const partnerSnapshot = await getDocs(partnersCollection);
                const partnerList = partnerSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setPartners(partnerList);
            } catch (error) {
                console.error("Error fetching partners:", error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchPartners();
    }, []);

    const handleDelete = async (partnerId) => {
        if (window.confirm("Are you sure you want to delete this partnership?")) {
            try {
                await deleteDoc(doc(db, 'partner', partnerId));
                setPartners(partners.filter(partner => partner.id !== partnerId)); // Update state
            } catch (error) {
                console.error("Error deleting partner:", error);
            }
        }
    };

    return (
        <div className="partners-page" style={{ position: 'relative', padding: '30px' }}>
            {loading && (
                <div className="loading-overlay d-flex justify-content-center align-items-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only"></span>
                    </div>
                </div>
            )}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', maxWidth: '1200px', margin: '10px auto', padding: '30px' }}>
                <h1 style={{ textAlign: 'center', color: '#1E3A8A', marginBottom: '40px', fontSize: '2.5em', fontWeight: 'bold' }}>Our Partners</h1>
                
                {/* Instructions Section */}
                <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#EAEAEA', borderRadius: '8px', textAlign: 'center' }}>
                    <h2 style={{ color: '#1E3A8A', fontSize: '1.8em', marginBottom: '10px' }}>Become a Partner</h2>
                    <p style={{ color: '#4B5563', fontSize: '1.1em' }}>
                        We are always looking to expand our network of partners. If you are interested in collaborating with us, please follow these simple steps:
                    </p>
                    <ul style={{ listStyleType: 'none', padding: 0, color: '#4B5563', fontSize: '1.1em' }}>
                        <li>1. Create an account and go to Dashboard</li>
                        <li>2. Fill out the partnership application form.</li>
                        <li>3. Provide details about your organization.</li>
                        <li>4. Submit your application for review.</li>
                    </ul>
                    <p style={{ color: '#4B5563', fontSize: '1.1em' }}>
                        We will get back to you shortly!
                    </p>
                </div>

                {partners.map(partner => (
                    <div className="card mb-4" key={partner.id} style={{ width: '100%', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', padding: '20px', transition: 'transform 0.2s', margin: '0 auto' }}>
                        <div className="d-flex flex-column flex-md-row align-items-center">
                            <img 
                                src={partner.logoURL} 
                                alt={partner.title} 
                                style={{ 
                                    maxWidth: '300px', 
                                    height: 'auto', 
                                    borderRadius: '12px', 
                                    marginRight: '30px', 
                                    marginBottom: '20px', 
                                    objectFit: 'contain', 
                                }} 
                            />
                            <div style={{ flex: 1, textAlign: 'left', marginBottom: '20px' }}>
                                <h2 style={{ color: '#1E3A8A', fontSize: '2em', marginBottom: '10px', fontWeight: 'bold' }}>{partner.title}</h2>
                                <div style={{ color: '#4B5563', fontSize: '1.2em', marginBottom: '15px' }} dangerouslySetInnerHTML={{ __html: partner.groupDescription }} />
                                {partner.websiteLink && (
                                    <a 
                                        href={partner.websiteLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        style={{ 
                                            display: 'inline-block', 
                                            padding: '12px 24px', 
                                            backgroundColor: '#1E3A8A', 
                                            color: '#FFFFFF', 
                                            borderRadius: '5px', 
                                            textDecoration: 'none', 
                                            fontSize: '1em', 
                                            transition: 'background-color 0.2s' 
                                        }} 
                                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#1E3A8A'; }}
                                    >
                                        Visit Website
                                    </a>
                                )}
                                {currentUser?.isAdmin && ( // Check if the current user is admin
                                    <button 
                                        onClick={() => handleDelete(partner.id)} 
                                        style={{ 
                                            marginTop: '10px', 
                                            padding: '10px 20px', 
                                            backgroundColor: '#dc3545', 
                                            color: '#ffffff', 
                                            border: 'none', 
                                            borderRadius: '5px', 
                                            cursor: 'pointer',
                                            fontSize: '1em',
                                            transition: 'background-color 0.2s',
                                        }} 
                                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#c82333'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#dc3545'; }}
                                    >
                                        Delete Partnership
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PartnersPage;
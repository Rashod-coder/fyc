import React, { useEffect, useState } from 'react';
import { storage, db } from './Firebase/Firebase';
import { collection, getDocs } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

function PartnersPage() {
    const [partners, setPartners] = useState([]);

    useEffect(() => {
        const fetchPartners = async () => {
            const partnersCollection = collection(db, 'partner');
            const partnerSnapshot = await getDocs(partnersCollection);
            const partnerList = partnerSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPartners(partnerList);
        };

        fetchPartners();
    }, []);

    return (
        <div style={{ padding: '30px', backgroundColor: '#ffffff', borderRadius: '12px', maxWidth: '1200px', margin: '10px auto' }}>
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
                <div className="card mb-4" key={partner.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', padding: '20px', transition: 'transform 0.2s' }}>
                    <div className="d-flex flex-column flex-md-row align-items-center">
                        <img 
                            src={partner.logoURL} 
                            alt={partner.title} 
                            style={{ 
                                maxWidth: '300px', // Increased logo size
                                height: 'auto', 
                                borderRadius: '12px', 
                                marginRight: '30px', 
                                marginBottom: '20px', 
                                objectFit: 'contain', 
                                display: 'block', // Center on smaller screens
                                marginLeft: 'auto', // Center alignment
                                marginRight: 'auto', // Center alignment
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
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default PartnersPage;
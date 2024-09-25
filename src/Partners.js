import React, { useEffect, useState } from 'react';
import { storage, db } from './Firebase/Firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './PartnersPage.css'; // Import CSS for animations

function PartnersPage({ currentUser }) {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPartners = async () => {
            setLoading(true);
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
                setLoading(false);
            }
        };

        fetchPartners();
    }, []);

    const handleDelete = async (partnerId) => {
        if (window.confirm("Are you sure you want to delete this partnership?")) {
            try {
                await deleteDoc(doc(db, 'partner', partnerId));
                setPartners(partners.filter(partner => partner.id !== partnerId));
            } catch (error) {
                console.error("Error deleting partner:", error);
            }
        }
    };

    return (
        <div className="partners-page container my-5">
            {loading && (
                <div className="loading-overlay d-flex justify-content-center align-items-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only"></span>
                    </div>
                </div>
            )}
            <div className="bg-white rounded shadow p-4">
                <h1 className="text-center text-primary mb-4">Our Partners</h1>
                
                <div className="mb-4 p-3 bg-light rounded text-center">
                    <h2 className="text-primary">Become a Partner</h2>
                    <p className="text-secondary">
                        We are always looking to expand our network of partners. If you are interested in collaborating with us, please follow these simple steps:
                    </p>
                    <ul className="list-unstyled text-secondary">
                        <li>1. Create an account and go to Dashboard</li>
                        <li>2. Fill out the partnership application form.</li>
                        <li>3. Provide details about your organization.</li>
                        <li>4. Submit your application for review.</li>
                    </ul>
                    <p className="text-secondary">
                        We will get back to you shortly!
                    </p>
                </div>

                <div className="row">
                    {partners.map(partner => (
                        <div className="col-lg-4 col-md-6 mb-4" key={partner.id}>
                            <div className="card h-100 d-flex flex-column">
                                <img 
                                    src={partner.logoURL} 
                                    alt={partner.title} 
                                    className="card-img-top img-fluid mt-3" 
                                    style={{ objectFit: 'contain', maxHeight: '200px' }}
                                />
                                <div className="card-body flex-grow-1">
                                    <h5 className="card-title text-primary">{partner.title}</h5>
                                    <p className="card-text text-secondary" dangerouslySetInnerHTML={{ __html: partner.groupDescription }} />
                                </div>
                                <div className="card-footer d-flex justify-content-between align-items-center">
                                    {partner.websiteLink ? (
                                        <a 
                                            href={partner.websiteLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="btn btn-primary"
                                            style={{ flexGrow: 1 }}
                                        >
                                            Visit Website
                                        </a>
                                    ) : (
                                        <p className="text-muted mb-0" style={{ flexGrow: 1 }}>Organization website not available</p>
                                    )}
                                    {currentUser?.isAdmin && (
                                        <button 
                                            onClick={() => handleDelete(partner.id)} 
                                            className="btn btn-danger"
                                            style={{ marginLeft: '10px' }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default PartnersPage;
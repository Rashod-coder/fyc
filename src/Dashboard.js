import React, { useState, useEffect } from 'react';
import { auth, db } from './Firebase/Firebase';
import { doc, getDoc, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Epartner from './editPartner';
import VerifyRoleRequest from './Verify'; // Import the new component
import GuestDashboard from './guestDash';

function Dashboard() {
    const [userName, setUserName] = useState('');
    const [accountLevel, setAccountLevel] = useState('');
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');
    const navigate = useNavigate();

    const getGreeting = () => {
        const currentHour = new Date().getHours();
        if (currentHour < 12) {
            return 'Good Morning';
        } else if (currentHour < 18) {
            return 'Good Afternoon';
        } else if (currentHour < 21) {
            return 'Good Evening';
        } else {
            return 'Good Night';
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userDocRef = doc(collection(db, 'users'), user.uid);
                    const userSnapshot = await getDoc(userDocRef);

                    if (userSnapshot.exists()) {
                        const { firstName, lastName, accountLevel } = userSnapshot.data();
                        setUserName(`${firstName} ${lastName}`);
                        setAccountLevel(accountLevel);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                navigate('/login');
            }
            setLoading(false);
        });

        setGreeting(getGreeting());

        return () => unsubscribe();
    }, [navigate]);

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
        <div style={{ padding: '1rem' }}>
            <div style={{ backgroundColor: '#FAF3E0', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <h1 style={{ color: '#6B4226', fontSize: '2rem' }}>{greeting}, {userName}!</h1>
                <button className="btn btn-dark mt-4 btn-sm" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>
                    Edit Account Settings
                </button>     
            </div>

            {accountLevel === 'admin' && (
                <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#F9F9F9', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                    <Epartner />
                </div>
            )}

            {accountLevel === 'guest' && (
                
                <div style={{ marginTop: '2rem' }}>

                    
                    
                    <div className='mt-3'>
                    <VerifyRoleRequest />

                    </div>
                    <GuestDashboard/>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
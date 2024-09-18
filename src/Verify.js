import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './Firebase/Firebase';
import 'bootstrap/dist/css/bootstrap.min.css';

function VerifyRoleRequest() {
    const [requestedRole, setRequestedRole] = useState('');
    const [roleStatus, setRoleStatus] = useState(''); // Track role status from Firebase
    const [loading, setLoading] = useState(false); // Track loading state

    // Fetch user's role status from Firebase
    useEffect(() => {
        const fetchUserRoleStatus = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userSnapshot = await getDoc(userDocRef);
                    
                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.data();
                        setRoleStatus(userData.roleStatus || '');
                    }
                } catch (error) {
                    console.error('Error fetching role status:', error);
                }
            }
        };

        fetchUserRoleStatus();
    }, []);

    const handleRequest = async (e) => {
        e.preventDefault();
        setLoading(true); // Show loading indicator
        const user = auth.currentUser;
        
        if (user) {
            try {
                const userDocRef = doc(db, 'users', user.uid);

                // Update roleStatus to 'pending' in Firebase
                await updateDoc(userDocRef, {
                    roleStatus: 'pending',
                    requestedRole: requestedRole,
                });

                setRoleStatus('pending');
            } catch (error) {
                console.error('Error updating role status:', error);
            } finally {
                setLoading(false); // Hide loading indicator
            }
        }
    };

    if (roleStatus === 'pending') {
        return (
            <div className="card" style={styles.card}>
                <div style={styles.iconWrapper}>
                    <i className="fas fa-hourglass-start" style={styles.icon}></i>
                </div>
                <h3 style={styles.title}>Request Status</h3>
                <p style={styles.message}>
                    Your role change request is currently <strong>pending</strong>. Please wait until it is reviewed.
                </p>
            </div>
        );
    }

    return (
        <div className="card" style={styles.card}>
            <div style={styles.iconWrapper}>
                <i className="fas fa-user-tag" style={styles.icon}></i>
            </div>
            <h3 style={styles.title}>Request Role Upgrade</h3>
            <form onSubmit={handleRequest} style={styles.form}>
                <div className="form-group">
                    <label htmlFor="roleSelect" style={styles.label}>Select Role</label>
                    <select
                        id="roleSelect"
                        className="form-control"
                        style={styles.select}
                        value={requestedRole}
                        onChange={(e) => setRequestedRole(e.target.value)}
                        required
                        disabled={loading} // Disable select when loading
                    >
                        <option value="" disabled>Select role...</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                        <option value="partner">Partner</option>

                    </select>
                </div>
                <button type="submit" className="btn btn-primary" style={styles.button} disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Request'}
                </button>

                {/* Show loading bar when submitting */}
                {loading && (
                    <div className="progress mt-3">
                        <div
                            className="progress-bar progress-bar-striped progress-bar-animated"
                            role="progressbar"
                            aria-valuenow="100"
                            aria-valuemin="0"
                            aria-valuemax="100"
                            style={styles.progressBar}
                        ></div>
                    </div>
                )}
            </form>
        </div>
    );
}

const styles = {
    card: {
        marginTop: '3rem',
        padding: '2rem',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        margin: '0 auto',
        textAlign: 'center',
    },
    iconWrapper: {
        marginBottom: '1.5rem',
    },
    icon: {
        fontSize: '3rem',
        color: '#4A90E2',
    },
    title: {
        fontSize: '1.8rem',
        fontWeight: '600',
        color: '#333',
    },
    message: {
        fontSize: '1.1rem',
        color: '#666',
        marginTop: '1rem',
    },
    form: {
        marginTop: '1.5rem',
    },
    label: {
        fontSize: '1.1rem',
        fontWeight: '500',
        color: '#555',
    },
    select: {
        fontSize: '1.2rem',
        padding: '0.75rem',
        marginBottom: '1rem',
        borderRadius: '8px',
        border: '1px solid #ccc',
    },
    button: {
        width: '100%',
        padding: '0.75rem',
        fontSize: '1.2rem',
        fontWeight: '600',
        borderRadius: '8px',
        backgroundColor: '#4A90E2',
        border: 'none',
        color: '#fff',
        transition: 'background-color 0.3s ease',
    },
    progressBar: {
        width: '100%',
        backgroundColor: '#4A90E2',
    },
};

export default VerifyRoleRequest;
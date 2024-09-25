import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './Firebase/Firebase'; // Your Firebase import
import 'bootstrap/dist/css/bootstrap.min.css';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const TeamsPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch data from Firebase Firestore
  useEffect(() => {
    const fetchTeamMembers = async () => {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => doc.data());
      setTeamMembers(usersList);
      setLoading(false); // Set loading to false after fetching data
    };

    fetchTeamMembers();
  }, []);

  return (
    <div className="container my-5">
      {loading ? ( // Show loading spinner while fetching data
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      ) : (
        
        <div className="row">
                <h2 className="text-center mb-5" style={{ color: '#343a40', fontWeight: 'bold' }}>Meet Our Team</h2>

          {teamMembers
            .filter(member => member.accountLevel === 'staff' || member.accountLevel === 'admin')
            .map((member, index) => (
              <div className="col-md-4 d-flex align-items-stretch" key={index}>
                <div className="card mb-4 shadow-sm" style={{ borderRadius: '15px', width: '100%', minHeight: '450px' }}>
                  <div className="text-center pt-4">
                    <img
                      src={member.profilePicUrl || 'https://via.placeholder.com/100'}
                      className="rounded-circle"
                      alt={`${member.name || 'No name'}'s profile`}
                      style={{ width: '250px', height: '250px', objectFit: 'cover', border: '2px solid black' }}
                    />
                  </div>
                  <div className="card-body text-center">
                    <h5 className="card-title">{member.name || 'Name not provided'}</h5>
                    <p className="card-text font-oxygen"><strong>Role:</strong> {member.role || 'Role not provided'}</p>
                    <p className="card-text"><strong>School:</strong> {member.school || 'School not provided'}</p>
                    <p className="card-text"><strong>Bio:</strong> {member.bio || 'Bio not provided'}</p>
                    <div className="social-links">
                      <a
                        href={member.linkedin || '#'}
                        className="btn btn-outline-primary btn-sm mx-1"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ pointerEvents: member.linkedin ? 'auto' : 'none' }}
                      >
                        LinkedIn
                      </a>
                      <a
                        href={member.instagram || '#'}
                        className="btn btn-outline-danger btn-sm mx-1"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ pointerEvents: member.instagram ? 'auto' : 'none' }}
                      >
                        Instagram
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
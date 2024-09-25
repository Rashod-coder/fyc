import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Box, Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, LinearProgress, Grid, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { Delete, Check, Clear } from '@mui/icons-material';
import { db } from './Firebase/Firebase';

const AdminDash = () => {
  const [partnerRequests, setPartnerRequests] = useState([]);
  const [roleRequests, setRoleRequests] = useState([]);
  const [currentPartners, setCurrentPartners] = useState([]);
  const [staffAndAdmins, setStaffAndAdmins] = useState([]);
  const [openStaffModal, setOpenStaffModal] = useState(false);

  const fetchPartnerRequests = async () => {
    const partnerCollection = collection(db, 'partnerRequests');
    const partnerSnapshot = await getDocs(partnerCollection);
    const partners = partnerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPartnerRequests(partners.filter(req => req.status === 'pending'));
  };

  const fetchCurrentPartners = async () => {
    const partnersCollection = collection(db, 'partner');
    const partnersSnapshot = await getDocs(partnersCollection);
    const partners = partnersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCurrentPartners(partners);
  };

  const fetchRoleRequests = async () => {
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);
    const users = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRoleRequests(users.filter(user => user.roleStatus === 'pending'));
    setStaffAndAdmins(users.filter(user => user.accountLevel === 'staff' || user.accountLevel === 'admin'));
  };

  useEffect(() => {
    fetchPartnerRequests();
    fetchCurrentPartners();
    fetchRoleRequests();
  }, []);

  const handlePartnerAction = async (id, action) => {
    const requestDoc = doc(db, 'partnerRequests', id);
    await updateDoc(requestDoc, {
      status: action === 'approve' ? 'approved' : 'rejected',
    });
    fetchPartnerRequests();
  };

  const handleRoleAction = async (id, action, requestedRole) => {
    const userDoc = doc(db, 'users', id);
    await updateDoc(userDoc, {
      roleStatus: action === 'approve' ? 'approved' : 'rejected',
      accountLevel: action === 'approve' ? requestedRole : 'guest',
    });
    fetchRoleRequests();
  };

  const handleRemoveStaff = async (id) => {
    const userDoc = doc(db, 'users', id);
    await updateDoc(userDoc, {
      accountLevel: 'guest',
      roleStatus: 'inactive', // Optionally set this to manage the user's status further
    });
    fetchRoleRequests();
  };

  const handleDeletePartner = async (title) => {
    const partnersCollection = collection(db, 'partner');
    const partnersSnapshot = await getDocs(partnersCollection);
    const partnerToDelete = partnersSnapshot.docs.find(doc => doc.data().title === title);
    if (partnerToDelete) {
      const partnerDoc = doc(db, 'partner', partnerToDelete.id);
      await deleteDoc(partnerDoc);
      fetchCurrentPartners();
    } else {
      console.error("Partner not found");
    }
  };

  const handleOpenStaffModal = () => {
    setOpenStaffModal(true);
  };

  const handleCloseStaffModal = () => {
    setOpenStaffModal(false);
  };

  return (
    <Box sx={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ marginBottom: '20px' }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: '20px', borderRadius: '15px', backgroundColor: '#ffffff' }}>
            <Typography variant="h5" sx={{ marginBottom: '10px', color: '#1976d2' }}>Total Partners</Typography>
            <Typography variant="h3">{currentPartners.length}</Typography>
            <LinearProgress variant="determinate" value={(currentPartners.length / 100) * 100} sx={{ marginTop: '10px' }} />
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: '20px', borderRadius: '15px', backgroundColor: '#ffffff' }}>
            <Typography variant="h5" sx={{ marginBottom: '10px', color: '#1976d2' }}>Total Staff & Admins</Typography>
            <Typography variant="h3">{staffAndAdmins.length}</Typography>
            <LinearProgress variant="determinate" value={(staffAndAdmins.length / 100) * 100} sx={{ marginTop: '10px' }} />
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ padding: '20px', borderRadius: '15px', backgroundColor: '#ffffff' }}>
            <Typography variant="h5" sx={{ marginBottom: '10px', color: '#1976d2' }}>Pending Requests</Typography>
            <Typography variant="h3">{partnerRequests.length + roleRequests.length}</Typography>
            <LinearProgress variant="determinate" value={((partnerRequests.length + roleRequests.length) / 50) * 100} sx={{ marginTop: '10px' }} />
          </Card>
        </Grid>
      </Grid>

      {/* Partnership Requests */}
      <Card sx={{ padding: '20px', marginBottom: '20px', borderRadius: '15px', backgroundColor: 'white' }}>
        <Typography variant="h4" sx={{ marginBottom: '20px', color: '#1976d2' }}>Partnership Requests</Typography>
        {partnerRequests.length === 0 ? (
          <Typography>No Incoming Requests</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Partner Name</TableCell>
                  <TableCell>Best Contact</TableCell>
                  <TableCell>Partner Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partnerRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.partnerName}</TableCell>
                    <TableCell>{request.bestContact}</TableCell>
                    <TableCell>{request.partnerDescription}</TableCell>
                    <TableCell>{request.status}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handlePartnerAction(request.id, 'approve')} color="success">
                        <Check />
                      </IconButton>
                      <IconButton onClick={() => handlePartnerAction(request.id, 'reject')} color="error">
                        <Clear />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Manage Current Partners */}
      <Card sx={{ padding: '20px', marginBottom: '20px', borderRadius: '15px', backgroundColor: 'white' }}>
        <Typography variant="h4" sx={{ marginBottom: '20px', color: '#1976d2' }}>Manage Current Partners</Typography>
        {currentPartners.length === 0 ? (
          <Typography>No Current Partners</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Partner Name</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentPartners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>{partner.title}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleDeletePartner(partner.title)} color="error">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Role Change Requests */}
      <Card sx={{ padding: '20px', marginBottom: '20px', borderRadius: '15px', backgroundColor: 'white' }}>
        <Typography variant="h4" sx={{ marginBottom: '20px', color: '#1976d2' }}>Team Verification Requests</Typography>
        {roleRequests.length === 0 ? (
          <Typography>No Incoming Requests</Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Requested Role</TableCell>
                  <TableCell>Current Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roleRequests.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.requestedRole}</TableCell>
                    <TableCell>{user.roleStatus}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRoleAction(user.id, 'approve', user.requestedRole)} color="success">
                        <Check />
                      </IconButton>
                      <IconButton onClick={() => handleRoleAction(user.id, 'reject', user.requestedRole)} color="error">
                        <Clear />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* View Staff & Admins Button */}
      <Button variant="outlined" onClick={handleOpenStaffModal} sx={{ marginBottom: '20px' }}>View Staff & Admins</Button>

      {/* Staff & Admins Modal */}
      <Dialog open={openStaffModal} onClose={handleCloseStaffModal}>
        <DialogTitle>Staff & Admins</DialogTitle>
        <DialogContent>
          {staffAndAdmins.length === 0 ? (
            <Typography>No Staff or Admins Available</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Level</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staffAndAdmins.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.firstName} {member.lastName}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.accountLevel}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleRemoveStaff(member.id)} color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminDash;

import React, { useState, useEffect } from 'react';
import { auth, db } from './Firebase/Firebase'; 
import { doc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Snackbar,
  IconButton,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Card,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart'; 
import { Bar } from 'react-chartjs-2'; 
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registering the required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [tabValue, setTabValue] = useState(0); // State to manage tabs

  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userDocRef);

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            if (userData.accountLevel !== 'admin') {
              navigate('/dashboard', { state: { message: 'You do not have permission to access this page.' } });
            } else {
              const membersCollection = collection(db, 'users');
              const membersSnapshot = await getDocs(membersCollection);
              const membersList = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              setMembers(membersList);
              setLoading(false);
            }
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      } else {
        navigate('/login');
      }
    };

    checkAdmin();
  }, [navigate]);

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const userDocRef = doc(db, 'users', memberId);
      await updateDoc(userDocRef, { accountLevel: newRole });
      setMembers(prevMembers => prevMembers.map(member => member.id === memberId ? { ...member, accountLevel: newRole } : member));
      setSnackbarMessage('Role updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating user role:', error);
      setSnackbarMessage('Error updating role');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteMember = async () => {
    if (memberToDelete) {
      try {
        const userDocRef = doc(db, 'users', memberToDelete);
        await deleteDoc(userDocRef);
        setMembers(prevMembers => prevMembers.filter(member => member.id !== memberToDelete));
        setSnackbarMessage('Member deleted successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Error deleting member:', error);
        setSnackbarMessage('Error deleting member');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setDeleteDialogOpen(false);
        setMemberToDelete(null);
      }
    }
  };

  const handleOpenDeleteDialog = (memberId) => {
    setMemberToDelete(memberId);
    setDeleteDialogOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMemberToDelete(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredMembers = members.filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.accountLevel.toLowerCase().includes(searchTerm.toLowerCase())

  );

  const memberStats = {
    admin: members.filter(member => member.accountLevel === 'admin').length,
    guest: members.filter(member => member.accountLevel === 'guest').length,
    staff: members.filter(member => member.accountLevel === 'staff').length,
  };

  const data = {
    labels: ['Admins', 'Guests', 'Staff'],
    datasets: [
      {
        label: 'Number of Members',
        data: [memberStats.admin, memberStats.guest, memberStats.staff],
        backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <Box sx={{ padding: '2rem 1%', backgroundColor: '#f5f5f5', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
             Managment
          </Typography>
    
        </Toolbar>
      </AppBar>
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ marginTop: '1rem' }}>
        <Tab label="Manage Members" />
        <Tab label="Member Statistics" />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3} sx={{ marginTop: '1rem' }}>
            
          <Grid item xs={12}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
             You can filter by role and name in the search bar
        </Typography>
            <Card variant="outlined" sx={{ padding: '2rem' }}>
              <TextField
                label="Search Members"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ marginBottom: '1rem' }}
                InputProps={{
                  startAdornment: (
                    <IconButton>
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />

              <Typography variant="h6" sx={{ marginBottom: '1rem' }}>
                Total Members: {members.length}
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>First Name</TableCell>
                      <TableCell>Last Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Account Level</TableCell>
                      <TableCell>Change Role</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredMembers.map((member, index) => (
                      <TableRow key={member.id} sx={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                        <TableCell><strong>{member.firstName}</strong></TableCell>
                        <TableCell><strong>{member.lastName}</strong></TableCell>
                        <TableCell><strong>{member.email}</strong></TableCell>
                        <TableCell><strong>{member.accountLevel}</strong></TableCell>
                        <TableCell>
                          <Select
                            value={member.accountLevel}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            variant="outlined"
                            size="small"
                          >
                            <MenuItem value="guest">Guest</MenuItem>
                            <MenuItem value="staff">Staff</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleOpenDeleteDialog(member.id)}>
                            <DeleteIcon />
                          </IconButton>
                          <Dialog
                            open={deleteDialogOpen}
                            onClose={handleCloseDeleteDialog}
                          >
                            <DialogTitle>Confirm Delete</DialogTitle>
                            <DialogContent>
                              <Typography>
                                Are you sure you want to delete this member?
                              </Typography>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleCloseDeleteDialog} color="primary">
                                Cancel
                              </Button>
                              <Button onClick={handleDeleteMember} color="secondary">
                                Delete
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3} sx={{ marginTop: '1rem' }}>
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ padding: '2rem' }}>
              <Typography variant="h4" sx={{ marginBottom: '2rem', textAlign: 'center' }}>
                Member Statistics
              </Typography>
              <Bar data={data} />
            </Card>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        severity={snackbarSeverity}
      />
    </Box>
  );
};

export default MembersPage;

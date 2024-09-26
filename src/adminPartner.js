import React, { useState, useEffect } from 'react';
import { db } from './Firebase/Firebase';
import { doc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  Grid,
  Box,
  Select,
  MenuItem,
  Snackbar,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const PartnersPage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchStatus, setSearchStatus] = useState('');

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const partnersCollection = collection(db, 'partner');
        const partnersSnapshot = await getDocs(partnersCollection);
        const partnersList = partnersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPartners(partnersList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching partners:', error);
      }
    };

    fetchPartners();
  }, []);

  const handleDeletePartner = async () => {
    try {
      const partnerDocRef = doc(db, 'partner', selectedPartner.id);
      await deleteDoc(partnerDocRef);
      setPartners((prevPartners) => prevPartners.filter((partner) => partner.id !== selectedPartner.id));
      handleCloseConfirmationDialog();
      showSnackbar('Partner deleted successfully!');
    } catch (error) {
      console.error('Error deleting partner:', error);
    }
  };

  const handleUpdatePartnerStatus = async () => {
    try {
      const partnerDocRef = doc(db, 'partner', selectedPartner.id);
      await updateDoc(partnerDocRef, { status: newStatus });
      setPartners((prevPartners) =>
        prevPartners.map((partner) =>
          partner.id === selectedPartner.id ? { ...partner, status: newStatus } : partner
        )
      );
      handleCloseConfirmationDialog();
      showSnackbar(`Status updated to "${newStatus}" successfully!`);
    } catch (error) {
      console.error('Error updating partner status:', error);
    }
  };

  const handleOpenDescriptionDialog = (partner) => {
    setSelectedPartner(partner);
    setDescriptionDialogOpen(true);
  };

  const handleCloseDescriptionDialog = () => {
    setSelectedPartner(null);
    setDescriptionDialogOpen(false);
  };

  const handleOpenConfirmationDialog = (partner, status) => {
    setSelectedPartner(partner);
    setNewStatus(status);
    setConfirmationDialogOpen(true);
  };

  const handleCloseConfirmationDialog = () => {
    setSelectedPartner(null);
    setConfirmationDialogOpen(false);
  };

  const handleChangeStatus = (event, partner) => {
    const status = event.target.value;
    if (status !== 'select') {
      handleOpenConfirmationDialog(partner, status);
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Filter partners based on title and status
  const filteredPartners = partners.filter((partner) => {
    return (
      partner.title.toLowerCase().includes(searchTitle.toLowerCase()) &&
      (searchStatus === '' || partner.status === searchStatus)
    );
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </div>
    );
  }

  return (
    <Box sx={{ padding: '2rem', backgroundColor: '#f5f5f5', height: 'auto' }}>
      <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: '2rem' }}>
        Partner Organizations
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ padding: '2rem' }}>
            {/* Search Bar */}
            <Box display="flex" justifyContent="space-between" mb={2}>
              <TextField
                label="Search by Title"
                variant="outlined"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                sx={{ flex: 1, marginRight: '1rem' }}
              />
              <Select
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
                displayEmpty
                sx={{ width: '150px', marginLeft: '1rem', backgroundColor: '#fff' }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </Box>
            <TableContainer component={Paper} sx={{ maxHeight: 500, overflowY: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Owner</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#333', fontSize: '1rem' }}>
  {partner.orgHead}
</TableCell>
<TableCell sx={{ color: '#555', fontSize: '0.95rem' }}>
  {partner.title}
</TableCell>
<TableCell sx={{ color: '#555', fontSize: '0.95rem' }}>
  {partner.status}
</TableCell>
                      <TableCell>
                        <Button onClick={() => handleOpenDescriptionDialog(partner)} variant="outlined" color="primary">
                          View Description
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={partner.status}
                          onChange={(event) => handleChangeStatus(event, partner)}
                          displayEmpty
                          sx={{ marginRight: '1rem', backgroundColor: '#fff' }}
                        >
                          <MenuItem value="select">Select Action</MenuItem>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="suspended">Suspend</MenuItem>
                        </Select>
                        <IconButton onClick={() => handleOpenConfirmationDialog(partner, 'delete')}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Description Dialog */}
      {selectedPartner && (
        <Dialog open={descriptionDialogOpen} onClose={handleCloseDescriptionDialog}>
          <DialogTitle>{selectedPartner.title} - Group Description</DialogTitle>
          <DialogContent>
            <Typography>{selectedPartner.groupDescription}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDescriptionDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmationDialogOpen} onClose={handleCloseConfirmationDialog}>
        <DialogTitle>
          {newStatus === 'delete' ? 'Confirm Deletion' : 'Confirm Status Update'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to{' '}
            {newStatus === 'delete' ? 'delete this partner?' : `change the status to "${newStatus}"?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmationDialog} color="primary">
            Cancel
          </Button>
          {newStatus === 'delete' ? (
            <Button onClick={handleDeletePartner} color="error">
              Delete
            </Button>
          ) : (
            <Button onClick={handleUpdatePartnerStatus} color="primary">
              Confirm
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <Button color="inherit" onClick={handleSnackbarClose}>
            Close
          </Button>
        }
      />
    </Box>
  );
};

export default PartnersPage;

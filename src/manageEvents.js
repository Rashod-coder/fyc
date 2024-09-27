import React, { useState, useEffect } from 'react';
import { db } from './Firebase/Firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
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
  Select,
  MenuItem,
  Snackbar,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import WarningIcon from '@mui/icons-material/Warning';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [searchTitle, setSearchTitle] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsList = eventsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEvents(eventsList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleDeleteEvent = async () => {
    try {
      const eventDocRef = doc(db, 'events', selectedEvent.id);
      await deleteDoc(eventDocRef);
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== selectedEvent.id));
      handleCloseConfirmationDialog();
      showSnackbar('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleStatusUpdate = async (event, status) => {
    try {
      const eventDocRef = doc(db, 'events', event.id);
      await updateDoc(eventDocRef, { status });
      setEvents((prevEvents) =>
        prevEvents.map((ev) => (ev.id === event.id ? { ...ev, status } : ev))
      );
      showSnackbar(`Status updated to "${status}" successfully!`);
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  };

  const handleOpenDescriptionDialog = (event) => {
    setSelectedEvent(event);
    setDescriptionDialogOpen(true);
  };

  const handleCloseDescriptionDialog = () => {
    setSelectedEvent(null);
    setDescriptionDialogOpen(false);
  };

  const handleOpenConfirmationDialog = (event) => {
    setSelectedEvent(event);
    setConfirmationDialogOpen(true);
  };

  const handleCloseConfirmationDialog = () => {
    setSelectedEvent(null);
    setConfirmationDialogOpen(false);
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const filteredEvents = events.filter((event) => event.title.toLowerCase().includes(searchTitle.toLowerCase()));

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon style={{ color: 'green' }} />;
      case 'cancelled':
        return <HighlightOffIcon style={{ color: 'red' }} />;
      case 'pending':
        return <WarningIcon style={{ color: 'orange' }} />;
      default:
        return <WarningIcon style={{ color: 'grey' }} />;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '2rem' }}>
      <Typography variant="h4" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Manage Events
      </Typography>

      <Grid container spacing={2}>
        {/* Search Bar */}
        <Grid item xs={12} md={12} lg={12}>
          <TextField
            label="Search by Title"
            variant="outlined"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            fullWidth
          />
        </Grid>

        {/* Table Section */}
        <Grid item xs={12}>
          <Card variant="outlined" style={{ padding: '1rem' }}>
            <TableContainer component={Paper} style={{ maxHeight: 800, overflowY: 'auto', overflowX: 'auto', width: '100%' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Actions</TableCell>
                    <TableCell>Update Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{getStatusIcon(event.status)} {event.status}</TableCell>
                      <TableCell>{event.title}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenDescriptionDialog(event)}>
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>{event.startDate}</TableCell>
                      <TableCell>{event.endDate}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenConfirmationDialog(event)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={event.status}
                          onChange={(e) => handleStatusUpdate(event, e.target.value)}
                          displayEmpty
                          style={{ backgroundColor: '#fff' }}
                        >
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="suspended">Suspended</MenuItem>
                        </Select>
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
      {selectedEvent && (
        <Dialog open={descriptionDialogOpen} onClose={handleCloseDescriptionDialog}>
          <DialogTitle>{selectedEvent.title} - Description</DialogTitle>
          <DialogContent>
            <Typography>{selectedEvent.description}</Typography>
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
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this event?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmationDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteEvent} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <Button color="inherit" onClick={handleSnackbarClose}>
            Close
          </Button>
        }
      />
    </div>
  );
};

export default EventsPage;
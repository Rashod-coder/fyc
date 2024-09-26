import React, { useEffect, useState } from 'react';
import { storage, db } from './Firebase/Firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';
import './PartnersPage.css'; // Import CSS for animations
import { Box, Typography, TextField, Button, Grid, Card, CardContent, CardMedia, Pagination, CircularProgress } from '@mui/material';

function PartnersPage({ currentUser }) {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [partnersPerPage] = useState(9);

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

    // Search filter for active partners only
    const filteredPartners = partners.filter(partner =>
        partner.status === 'active' && partner.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const indexOfLastPartner = currentPage * partnersPerPage;
    const indexOfFirstPartner = indexOfLastPartner - partnersPerPage;
    const currentPartners = filteredPartners.slice(indexOfFirstPartner, indexOfLastPartner);

    return (
        <Box className="partners-page container my-5">
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ backgroundColor: '#f9f9f9', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
                    <Typography variant="h4" align="center" color="primary" gutterBottom>
                        Our Partners
                    </Typography>

                    <TextField
                        label="Search Partners"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ backgroundColor: '#fff', borderRadius: '4px' }}
                    />

                    <Grid container spacing={3}>
                        {currentPartners.map(partner => (
                            <Grid item xs={12} sm={6} md={4} key={partner.id}>
                                <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
                                    <CardMedia
                                        component="img"
                                        image={partner.logoURL}
                                        alt={partner.title}
                                        sx={{ objectFit: 'contain', maxHeight: '200px', padding: '1rem' }}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h5" color="primary">{partner.title}</Typography>
                                        <Typography color="textSecondary" dangerouslySetInnerHTML={{ __html: partner.groupDescription }} />
                                    </CardContent>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" padding="1rem">
                                        {partner.websiteLink ? (
                                            <Button 
                                                variant="contained" 
                                                color="primary" 
                                                href={partner.websiteLink} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                sx={{ flexGrow: 1, marginRight: '10px' }}
                                            >
                                                Visit Website
                                            </Button>
                                        ) : (
                                            <Typography color="textSecondary" variant="body2">Website not available</Typography>
                                        )}
                                        {currentUser?.isAdmin && (
                                            <Button 
                                                variant="outlined" 
                                                color="error" 
                                                onClick={() => handleDelete(partner.id)}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Pagination Component */}
                    <Pagination 
                        count={Math.ceil(filteredPartners.length / partnersPerPage)} 
                        page={currentPage} 
                        onChange={(event, value) => setCurrentPage(value)} 
                        sx={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }} 
                    />
                </Box>
            )}
        </Box>
    );
}

export default PartnersPage;

import React, { useEffect, useState } from 'react';
import { auth, db } from './Firebase/Firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminDash = () => {
  const [partnerRequests, setPartnerRequests] = useState([]);
  const [roleRequests, setRoleRequests] = useState([]);
  const [currentPartners, setCurrentPartners] = useState([]);
  const [staffAndAdmins, setStaffAndAdmins] = useState([]);
  const [showPartners, setShowPartners] = useState(false);
  const [showStaffAndAdmins, setShowStaffAndAdmins] = useState(false);

  const fetchPartnerRequests = async () => {
    const partnerCollection = collection(db, 'partnerRequests');
    const partnerSnapshot = await getDocs(partnerCollection);
    const partners = partnerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPartnerRequests(partners.filter(req => req.status === 'pending'));
    setCurrentPartners(partners.filter(req => req.status === 'approved'));
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
    await deleteDoc(userDoc);
    fetchRoleRequests();
  };

  return (
    <div className="container mt-4">

      {/* Partnership Requests */}
      <div className="mb-5">
        <h3 className="mb-3">Partnership Requests</h3>
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Partner Name</th>
                <th>Best Contact</th>
                <th>Partner Description</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {partnerRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.partnerName}</td>
                  <td>{request.bestContact}</td>
                  <td>{request.partnerDescription}</td>
                  <td>{request.status}</td>
                  <td>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                      <button
                        className="btn btn-success me-md-2 mb-2"
                        onClick={() => handlePartnerAction(request.id, 'approve')}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger mb-2"
                        onClick={() => handlePartnerAction(request.id, 'reject')}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toggle for Current Partners */}
      <div className="mb-5">
        <button className="btn btn-primary" onClick={() => setShowPartners(!showPartners)}>
          {showPartners ? 'Hide Current Partners' : 'Show Current Partners'}
        </button>
        <div className={`collapse ${showPartners ? 'show' : ''} mt-3`}>
          <h4>Current Partners</h4>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Partner Name</th>
                  <th>Best Contact</th>
                  <th>Partner Description</th>
                  <th>Org Head Name</th>
                </tr>
              </thead>
              <tbody>
                {currentPartners.map((partner) => (
                  <tr key={partner.id}>
                    <td>{partner.partnerName}</td>
                    <td>{partner.bestContact}</td>
                    <td>{partner.partnerDescription}</td>
                    <td>{partner.orgHeadName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role Change Requests */}
      <div className="mb-5">
        <h3 className="mb-3">Team Verification Requests</h3>
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Requested Role</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {roleRequests.map((user) => (
                <tr key={user.id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.requestedRole}</td>
                  <td>{user.roleStatus}</td>
                  <td>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                      <button
                        className="btn btn-success me-md-2 mb-2"
                        onClick={() => handleRoleAction(user.id, 'approve', user.requestedRole)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-danger mb-2"
                        onClick={() => handleRoleAction(user.id, 'reject', user.requestedRole)}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toggle for Staff and Admins */}
      <div>
        <button className="btn btn-primary" onClick={() => setShowStaffAndAdmins(!showStaffAndAdmins)}>
          {showStaffAndAdmins ? 'Hide Staff & Admins' : 'Show Staff & Admins'}
        </button>
        <div className={`collapse ${showStaffAndAdmins ? 'show' : ''} mt-3`}>
          <h4>Staff & Admins</h4>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {staffAndAdmins.map((user) => (
                  <tr key={user.id}>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.accountLevel}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleRemoveStaff(user.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDash;
import logo from './logo.svg';
import './App.css';
import Navbar from './Navbar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home'
import Login from './Login'
import Register from './Register'
import Dashboard from './Dashboard';
import Settings from './Settings';
import PartnersPage from './Partners';


function App() {
  return (
   <Router>
    <Navbar/>
      <Routes>
       <Route path="/" element={<Home />} />
       <Route path="login" element={<Login />} />
       <Route path="register" element={<Register />} />
       <Route path="dashboard" element={<Dashboard />} />
       <Route path="profile-settings" element={<Settings />} />
       <Route path="partners" element={<PartnersPage />} />
      </Routes>
   </Router>
  );
}

export default App;

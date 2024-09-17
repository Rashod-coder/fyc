import logo from './logo.svg';
import './App.css';
import Navbar from './Navbar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home'
import Login from './Login'
import Register from './Register'
import Dashboard from './Dashboard';


function App() {
  return (
   <Router>
    <Navbar/>
      <Routes>
       <Route path="/" element={<Home />} />
       <Route path="login" element={<Login />} />
       <Route path="register" element={<Register />} />
       <Route path="dashboard" element={<Dashboard />} />
      </Routes>
   </Router>
  );
}

export default App;

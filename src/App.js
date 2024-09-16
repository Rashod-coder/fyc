import logo from './logo.svg';
import './App.css';
import Navbar from './Navbar'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home'
import Login from './Login'


function App() {
  return (
   <Router>
    <Navbar/>
      <Routes>
       <Route path="/" element={<Home />} />
       <Route path="login" element={<Login />} />
      </Routes>
   </Router>
  );
}

export default App;

import React from 'react';
import './index.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/home/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import { Toaster } from 'react-hot-toast';
import { useAuthContext } from './context/AuthContext';
import Profile from './pages/profile/Profile';
import TextEncode from './pages/textencode/TextEncode';
import ImageEncode from './pages/imageencode/ImageEncode';
import AudiEncode from './pages/audioencode/AudiEncode';
import ShareImage from './pages/shareimages/ShareImage';
import Uploadfiles from './pages/uploadfiles/Uploadfiles';
import AdminDash from './pages/adminDash/AdminDash';

function App() {
  const {authUser} = useAuthContext();
  return (
    <Router>
      <Routes>
        <Route path="/" element={authUser?<Home /> : <Navigate to = {'/login'} /> } />
        <Route path="/login" element={authUser?<Navigate to ='/' /> : <Login/>} />
        <Route path="/signup" element={authUser?<Navigate to ='/' /> : <Signup/>} />
        <Route path="/profile" element={authUser? <Profile/>: <Navigate to ={'/login'} /> } />
        <Route path="/textencode" element={authUser? <TextEncode/>: <Navigate to ={'/login'} /> } />
        <Route path="/imageencode" element={authUser? <ImageEncode/>: <Navigate to ={'/login'} /> } />
        <Route path="/audioencode" element={authUser? <AudiEncode/>: <Navigate to ={'/login'} /> } />
        <Route path="/shareimage" element={authUser? <ShareImage/>: <Navigate to ={'/login'} /> } />
        <Route path="/upload" element={authUser? <Uploadfiles/>: <Navigate to ={'/login'} /> } />
        <Route path="/admin-dash" element={authUser?.isAdmin ? <AdminDash /> : <Navigate to={'/'} />} /> {/* Admin route */}
      </Routes>
      <Toaster/>
    </Router>
  );
}

export default App;

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Registration from './pages/auth/Register'
import ClientDashboard from './pages/client/ClientDasshboard';
import AdminDashBoard from './pages/admin/AdminDashBoard'

import React from 'react'
import './App.css'
import LoginPage from './pages/auth/LoginPage'

const App = () => {
 
  return (
    <Router>
      <Routes>

        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<Registration />} />
        <Route path="/complete-profile" element={<div>Lawyer Complete Profile Details</div>} />

        <Route path="/client/client-dashboard" element={<ClientDashboard />} />
        <Route path="/client/appointment-scheduling" element={<div>appointment scheduling</div>} />
        <Route path="/client/appointment-confirmation" element={<div>appointment confirmation</div>} />

        <Route path="/lawyer/lawyer-dashboard" element={<div>Lawyer Dashboard</div>} />
        <Route path="/lawyer/lawyer-profile" element={<div>Lawyer Profile</div>} />

        <Route path="/admin/admin-dashboard" element={<AdminDashBoard/>} />
        <Route path="/admin/manage-users" element={<div>Manage Users</div>} />
        <Route path="/admin/manage-lawyers" element={<div>Manage Lawyers</div>} />

      </Routes>
    </Router>
  )
}

export default App

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Registration from './pages/auth/Register'
import ClientDashboard from './pages/client/ClientDasshboard'
import React from 'react'
import './App.css'
import LoginPage from './pages/auth/LoginPage'
import LawyerDashboard from './pages/lawyer/LawyerDashboard'
import LawyersList from './pages/client/LawyersList'
import MyAppointments from './pages/client/MyAppointments'
import Home from './pages/Home'

const App = () => {
 
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<Registration />} />

        <Route path="/client/client-dashboard" element={<ClientDashboard />} />
        <Route path="/client/appointment-scheduling" element={<MyAppointments />} />
        <Route path="/client/appointment-confirmation" element={<div>appointment confirmation</div>} />
        <Route path="/client/lawyer-list" element={<LawyersList />} />

        <Route path="/lawyer/lawyer-dashboard" element={<LawyerDashboard/>} />

        <Route path="/admin/admin-dashboard" element={<div>Admin Dashboard</div>} />
        <Route path="/admin/manage-users" element={<div>Manage Users</div>} />
        <Route path="/admin/manage-lawyers" element={<div>Manage Lawyers</div>} />

      </Routes>
    </Router>
  )
}

export default App

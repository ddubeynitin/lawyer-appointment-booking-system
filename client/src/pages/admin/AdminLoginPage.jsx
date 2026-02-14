import React, { useState } from 'react'
import axios from 'axios';

const AdminLoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
 
    const handleAdminLogin = (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert("Please fill in all fields");
            return;
        }
        
        setRole("admin");
        // Handle admin login logic here
        console.log("Admin Email:", email);
        console.log("Admin Password:", password);

        axios.post(`${VITE_API_BASE_URL}/api/admin/login`, { email, password, role })
            .then(response => {
                // Handle successful login, e.g., store token, redirect to dashboard
                console.log("Login successful:", response.data);
            })
            .catch(error => {
                // Handle login error, e.g., show error message
                console.error("Login failed:", error);
                alert("Invalid email or password");
            });
    }

  return (
    <>
     {/* //admin login page    */}
        <div className='flex items-center justify-center h-screen bg-gray-100'>
            <div className='w-full max-w-md p-8 space-y-6 bg-white rounded shadow'>
                <h2 className='text-2xl font-bold text-center'>Admin Login</h2>
                <form className='space-y-6'>
                    <div>
                        <label htmlFor='email' className='block text-sm font-medium text-gray-700'>Email</label>
                        <input type='email' id='email' onChange={(e) => setEmail(e.target.value)} className='w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300'/></div>
                    <div>
                        <label htmlFor='password' className='block text-sm font-medium text-gray-700'>Password</label>
                        <input type='password' id='password' onChange={(e) => setPassword(e.target.value)} className='w-full px-3 py-2 mt-1 border rounded focus:outline-none focus:ring focus:border-blue-300'/></div>
                    <button onClick={handleAdminLogin} className='w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-300'>Login</button>
                </form>
            </div>
        </div>
    </>
  )
}

export default AdminLoginPage
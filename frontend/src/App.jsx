import { useState } from 'react'
import HomePage from './pages/HomePage'
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import NavBar from './components/Navbar';
import HomePage from './pages/HomePage';
import Dashboard from './pages/DashboardPage';
import Jobs from './pages/JobsPage';
import Login from './pages/LoginPage';
import Register from './pages/RegisterPage';
import SavedJobs from './pages/SavedJobsPage';
import Profile from './pages/ProfilePage';
import JobDetails from './pages/JobsDetailsPage';
import Alerts from "./pages/AlertsPage";


import PageNotFound from './pages/404';



function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
    <NavBar />

    <Routes>

    <Route path="/" element={HomePage} />
    <Route path="/Dashboard" element={Dashboard} />
    <Route path="/jobss" element={Jobs} />
    <Route path="/login" element={Login} />
    <Route path="/register" element={Register} />
    <Route path="/profile" element={Profile} />
    <Route path="/savedjobs" element={SavedJobs} />
    <Route path="/jobdetails" element={JobDetails} />
    <Route path="/alerts" element={Alerts} />



    <Route path="*" element={PageNotFound} />

    </Routes>
    
    
    
    
    
    
    </BrowserRouter>

  )
}

export default App

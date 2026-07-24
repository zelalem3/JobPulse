import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';
import PageNotFound from './pages/404';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
      
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
      
        <Route path="/jobs" element={<Jobs />} />
        
      
        <Route path="/jobs/:id" element={<JobDetails />} />

  
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/saved" 
          element={
            <ProtectedRoute>
              <SavedJobs />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/alerts" 
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          } 
        />

       
        <Route path="*" element={<PageNotFound />} />
      </Routes>


      <Footer />
    </BrowserRouter>
  );
}

export default App;
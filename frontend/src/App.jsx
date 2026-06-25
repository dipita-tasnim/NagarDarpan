import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ReportProblem from './pages/ReportProblem';
import AllProblems from './pages/AllProblems';
import MyProblems from './pages/MyProblems';
import ProblemDetail from './pages/ProblemDetail';
import TrackProblem from './pages/TrackProblem';
import ProblemMap from './pages/ProblemMap';
import AreaStats from './pages/AreaStats';
import AdminPanel from './pages/AdminPanel';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Toaster position="top-right" />
          <ChatWidget />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/report" element={<ProtectedRoute><ReportProblem /></ProtectedRoute>} />
            <Route path="/problems" element={<ProtectedRoute><AllProblems /></ProtectedRoute>} />
            <Route path="/problem-map" element={<ProtectedRoute><ProblemMap /></ProtectedRoute>} />
            <Route path="/my-problems" element={<ProtectedRoute><MyProblems /></ProtectedRoute>} />
            <Route path="/problems/:id" element={<ProtectedRoute><ProblemDetail /></ProtectedRoute>} />
            <Route path="/track" element={<ProtectedRoute><TrackProblem /></ProtectedRoute>} />
            <Route path="/area-stats" element={<ProtectedRoute><AreaStats /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

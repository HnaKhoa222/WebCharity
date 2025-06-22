import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth } from "./firebase";
import AuthPage from "./components/AuthPage/AuthPage";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Interests from "./pages/Interests";
import Create from "./pages/Create";
import Guide from "./pages/Guide/Guide";
import ProjectDetails from "./components/ProjectDetails/ProjectDetails";
import Web3Payment from "./components/Web3Payment/Web3Payment";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { AuthProvider } from './contexts/AuthContext';
import { InterestProvider } from './contexts/InterestContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <InterestProvider>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/interests" element={<Interests />} />
                <Route 
                  path="/create" 
                  element={
                    <ProtectedRoute>
                      <Create />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/guide" element={<Guide />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/projects/:projectId" element={<ProjectDetails />} />
                <Route 
                  path="/projects/:projectId/payment" 
                  element={
                    <ProtectedRoute>
                      <Web3Payment />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </InterestProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

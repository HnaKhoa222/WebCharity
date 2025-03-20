import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Verify from "./pages/Verify";
import Guide from "./pages/Guide";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/guide" element={<Guide />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

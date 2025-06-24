import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Add styles if needed

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="navbar-brand">Exam Seating</h2>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/student" className="nav-link">Student</Link>
        <Link to="/admin" className="nav-link">Admin</Link>
      </div>
    </nav>
  );
}

export default Navbar;
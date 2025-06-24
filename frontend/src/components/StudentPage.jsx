import React, { useState } from 'react';
import axios from 'axios';
import './StudentPage.css';

function StudentPage() {
  const [rollNumber, setRollNumber] = useState('');
  const [seatInfo, setSeatInfo] = useState(null);
  const [error, setError] = useState('');

  const validateRollNumber = (rollNumber) => {
    const pattern = /^1601-22-73[2-7]-[0-3][0-9][0-9]$/;
    if (!rollNumber || !pattern.test(rollNumber)) {
      return {
        isValid: false,
        message: "Invalid format. Use 1601-22-73X-YYY (X: 2-7, YYY: 001-320).",
      };
    }

    const [, , branchCode, rollNum] = rollNumber.split("-");
    const validBranchCodes = ["732", "733", "734", "735", "736", "737"];
    const rollNumInt = parseInt(rollNum, 10);

    if (!validBranchCodes.includes(branchCode)) {
      return {
        isValid: false,
        message: "Invalid branch code. Must be 732–737.",
      };
    }

    if (rollNumInt < 1 || rollNumInt > 320) {
      return {
        isValid: false,
        message: "Roll number must be between 001 and 320.",
      };
    }

    return { isValid: true, message: "Valid roll number." };
  };

  const handleSearch = async () => {
    setError('');
    setSeatInfo(null);

    const validation = validateRollNumber(rollNumber);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/lookup-room", {
        roll_number: rollNumber,
      });
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      setSeatInfo({
        roomNumber: response.data.room,
        lookupDate: currentDate,
      });
    } catch (error) {
      setError(error.response?.data?.error || "Failed to fetch room.");
    }
  };

  return (
    <div className="student-container">
      <h2>Student Room Lookup</h2>
      <p>Enter your roll number</p>
      <input
        type="text"
        placeholder="Enter Roll Number (e.g., 1601-22-733-001)"
        value={rollNumber}
        onChange={(e) => setRollNumber(e.target.value)}
        className="input-field"
      />
      <button onClick={handleSearch} className="search-button">
        Find Room
      </button>

      {seatInfo && (
        <div className="result-card">
          <h3>Room Details</h3>
          <p><strong>Room Number:</strong> {seatInfo.roomNumber}</p>
          <p><strong>Date:</strong> {seatInfo.lookupDate}</p>
        </div>
      )}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default StudentPage;
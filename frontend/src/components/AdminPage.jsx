import React, { useState } from "react";
import axios from "axios";
import "./AdminPage.css";

const AdminPage = () => {
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [branchData, setBranchData] = useState({});
  const [popupMessage, setPopupMessage] = useState("");

  const branchOptions = ["Civil", "CSE", "EEE", "ECE", "MECH", "IT"];
  const ROOM_CAPACITY = 30;

  const handleBranchChange = (event) => {
    const branch = event.target.value;
    if (branch && !selectedBranches.includes(branch)) {
      setSelectedBranches([...selectedBranches, branch]);
      setBranchData({ ...branchData, [branch]: { startRoll: "", endRoll: "" } });
    }
  };

  const handleRollNumberChange = (branch, field, value) => {
    setBranchData({
      ...branchData,
      [branch]: { ...branchData[branch], [field]: value },
    });
  };

  const validateRollNumber = (rollNumber, branch) => {
    const pattern = /^1601-22-73[2-7]-[0-3][0-9][0-9]$/;
    if (!rollNumber || !pattern.test(rollNumber)) {
      return {
        isValid: false,
        message: "Invalid format. Use 1601-22-73X-YYY (X: 2-7, YYY: 001-320).",
      };
    }

    const [, , branchCode, rollNum] = rollNumber.split("-");
    const branchCodeMap = {
      Civil: "732",
      CSE: "733",
      EEE: "734",
      ECE: "735",
      MECH: "736",
      IT: "737",
    };
    const rollNumInt = parseInt(rollNum, 10);

    if (branchCode !== branchCodeMap[branch]) {
      return {
        isValid: false,
        message: `Invalid branch code for ${branch}. Must be ${branchCodeMap[branch]}.`,
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

  const validateForm = async () => {
    if (!selectedRoom || selectedBranches.length === 0) {
      setPopupMessage("Please select a room and at least one branch.");
      return false;
    }

    let totalStudents = 0;
    const roll_numbers = {};
    for (const branch of selectedBranches) {
      const { startRoll, endRoll } = branchData[branch] || {};
      if (!startRoll || !endRoll) {
        setPopupMessage(`Please enter start and end roll numbers for ${branch}.`);
        return false;
      }

      const startValidation = validateRollNumber(startRoll, branch);
      if (!startValidation.isValid) {
        setPopupMessage(`Start roll number for ${branch}: ${startValidation.message}`);
        return false;
      }

      const endValidation = validateRollNumber(endRoll, branch);
      if (!endValidation.isValid) {
        setPopupMessage(`End roll number for ${branch}: ${endValidation.message}`);
        return false;
      }

      const startRollNum = parseInt(startRoll.split("-")[3], 10);
      const endRollNum = parseInt(endRoll.split("-")[3], 10);
      if (startRollNum > endRollNum) {
        setPopupMessage(`Start roll number for ${branch} must be less than or equal to end roll number.`);
        return false;
      }

      totalStudents += endRollNum - startRollNum + 1;
      roll_numbers[branch] = [startRollNum, endRollNum];
    }

    if (totalStudents > ROOM_CAPACITY) {
      setPopupMessage(`Total students (${totalStudents}) exceed room capacity (${ROOM_CAPACITY}).`);
      return false;
    }

    // Check for duplicate roll numbers
    try {
      const response = await axios.post("http://localhost:5000/api/check-roll-numbers", {
        roll_numbers,
      });
      if (response.data.has_duplicates) {
        setPopupMessage(`Duplicate roll numbers detected: ${response.data.duplicates.join(', ')}. Please use unique roll numbers.`);
        return false;
      }
    } catch (error) {
      setPopupMessage("Failed to check roll numbers. Please try again.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const data = {
      roomCapacity: { room_name: selectedRoom, total_seats: ROOM_CAPACITY },
      selectedRoom,
      branchData,
    };
    try {
      const res = await axios.post("http://localhost:5000/api/save-seating-data", data);
      setPopupMessage(res.data?.message || "Data submitted successfully!");
    } catch (error) {
      console.error("Error submitting data:", error);
      setPopupMessage("Submission failed. Please try again.");
    }
  };

  const handleGenerate = async () => {
    if (!(await validateForm())) return;

    const roll_numbers = {};
    selectedBranches.forEach((branch) => {
      const { startRoll, endRoll } = branchData[branch];
      roll_numbers[branch] = [parseInt(startRoll.split("-")[3], 10), parseInt(endRoll.split("-")[3], 10)];
    });

    const payload = {
      room_capacity: {
        room_name: selectedRoom,
        total_seats: ROOM_CAPACITY,
      },
      branches: selectedBranches,
      roll_numbers: roll_numbers,
    };

    try {
      const response = await axios.post("http://localhost:5000/api/generate-seating", payload);
      setPopupMessage("Seating arrangement generated successfully!");
      console.log("Seating Arrangement:", response.data);
    } catch (error) {
      console.error("Error generating seating arrangement:", error);
      setPopupMessage("Failed to generate seating arrangement.");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/download-seating-pdf", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "seating_arrangement.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      setPopupMessage("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      setPopupMessage("Failed to download PDF.");
    }
  };

  return (
    <div className="admin-container">
      <h2>Admin - Seating Arrangement</h2>

      <label>Block-Room:</label>
      <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
        <option value="">Block-Room</option>
        <option value="A-101">A-101</option>
        <option value="A-102">A-102</option>
        <option value="A-103">A-103</option>
        <option value="B-201">B-201</option>
        <option value="B-202">B-202</option>
        <option value="B-203">B-203</option>
        <option value="C-301">C-301</option>
        <option value="C-302">C-302</option>
        <option value="C-303">C-303</option>
      </select>

      <label>Select Branches:</label>
      <select onChange={handleBranchChange}>
        <option value="">Select Branch</option>
        {branchOptions
          .filter((branch) => !selectedBranches.includes(branch))
          .map((branch, index) => (
            <option key={index} value={branch}>
              {branch}
            </option>
          ))}
      </select>

      {selectedBranches.map((branch) => (
        <div key={branch} className="branch-inputs">
          <h4>{branch}</h4>
          <input
            type="text"
            placeholder="Start Roll No (e.g., 1601-22-733-001)"
            value={branchData[branch]?.startRoll || ""}
            onChange={(e) => handleRollNumberChange(branch, "startRoll", e.target.value)}
          />
          <input
            type="text"
            placeholder="End Roll No (e.g., 1601-22-733-320)"
            value={branchData[branch]?.endRoll || ""}
            onChange={(e) => handleRollNumberChange(branch, "endRoll", e.target.value)}
          />
        </div>
      ))}

      {popupMessage && (
        <div className="popup-message">
          <p>{popupMessage}</p>
          <button onClick={() => setPopupMessage("")}>Close</button>
        </div>
      )}
      <button className="submit-btn" onClick={handleSubmit}>Submit</button>
      <button className="generate-btn" onClick={handleGenerate}>Generate</button>
      <button className="download-pdf-btn" onClick={handleDownloadPDF}>Download PDF</button>
    </div>
  );
};

export default AdminPage;
import React, { useState } from "react";

const Seating = () => {
    const [room, setRoom] = useState("");
    const [branches, setBranches] = useState([]);
    const [seating, setSeating] = useState([]);

    const handleBranchChange = (event) => {
        const branch = event.target.value;
        if (!branches.includes(branch)) {
            setBranches([...branches, { branch, startRoll: "", endRoll: "" }]);
        }
    };

    const handleInputChange = (index, field, value) => {
        const updatedBranches = [...branches];
        updatedBranches[index][field] = value;
        setBranches(updatedBranches);
    };

    const handleSeatingArrangement = async () => {
        const response = await fetch("http://localhost:5000/api/seating/arrange-seating", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomName: room, branchData: branches })
        });

        const data = await response.json();
        setSeating(data.seating || []);
    };

    return (
        <div className="container">
            <h2>Seating Arrangement</h2>

            <label>Select Room:</label>
            <select onChange={(e) => setRoom(e.target.value)}>
                <option value="">Select a Room</option>
                <option value="Room A">Room A</option>
                <option value="Room B">Room B</option>
            </select>

            <label>Select Branch:</label>
            <select onChange={handleBranchChange}>
                <option value="">Select Branch</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
            </select>

            {branches.map((branch, index) => (
                <div key={index}>
                    <h4>{branch.branch}</h4>
                    <label>Start Roll:</label>
                    <input type="text" onChange={(e) => handleInputChange(index, "startRoll", e.target.value)} />
                    <label>End Roll:</label>
                    <input type="text" onChange={(e) => handleInputChange(index, "endRoll", e.target.value)} />
                </div>
            ))}

            <button onClick={handleSeatingArrangement}>Arrange Seating</button>

            <h3>Seating Arrangement</h3>
            {seating.length > 0 ? (
                <ul>
                    {seating.map((seat, index) => (
                        <li key={index}>
                            Seat {index + 1}: Roll {seat?.rollNumber} ({seat?.branch})
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No seating arrangement yet</p>
            )}
        </div>
    );
};

export default Seating;

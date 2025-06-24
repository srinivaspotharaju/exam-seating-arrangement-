// MongoDB Models
const Room = require('../models/Room');
const Student = require('../models/Student');

// Graph Coloring Algorithm for Seating
const assignSeats = async (req, res) => {
    try {
        const { roomName, branchData } = req.body;

        const room = await Room.findOne({ name: roomName });
        if (!room) return res.status(404).json({ message: "Room not found" });

        let students = [];
        branchData.forEach(({ branch, startRoll, endRoll }) => {
            for (let roll = startRoll; roll <= endRoll; roll++) {
                students.push({ rollNumber: roll, branch });
            }
        });

        students.sort((a, b) => a.rollNumber - b.rollNumber);

        let seating = new Array(room.capacity).fill(null);
        let branchSeats = {};

        for (let i = 0; i < students.length; i++) {
            for (let seat = 0; seat < room.capacity; seat++) {
                if (!seating[seat] && (!branchSeats[students[i].branch] || Math.abs(branchSeats[students[i].branch] - seat) > 1)) {
                    seating[seat] = students[i];
                    branchSeats[students[i].branch] = seat;
                    break;
                }
            }
        }

        for (let i = 0; i < seating.length; i++) {
            if (seating[i]) {
                await Student.create({
                    rollNumber: seating[i].rollNumber,
                    branch: seating[i].branch,
                    roomAssigned: room.name,
                    seatNumber: i + 1
                });
            }
        }

        res.json({ message: "Seating Arrangement Completed", seating });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { assignSeats };

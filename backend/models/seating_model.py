from pymongo import MongoClient

class SeatingArrangement:
    def __init__(self, db):
        self.db = db
        self.rooms = db.rooms  # Collection for storing rooms
        self.students = db.students  # Collection for student details

    def arrange_seating(self, room_id, branches_with_rolls):
        """
        Arranges seating using a Graph Coloring approach.
        Ensures students from the same branch are not seated next to each other.
        """
        room = self.rooms.find_one({"_id": room_id})
        if not room:
            return {"error": "Room not found"}

        total_seats = room["total_seats"]
        seating_chart = [-1] * total_seats  # -1 represents an empty seat

        # Generate list of students
        students = []
        for branch, (start_roll, end_roll) in branches_with_rolls.items():
            for roll in range(start_roll, end_roll + 1):
                students.append({"roll": roll, "branch": branch})

        if len(students) > total_seats:
            return {"error": "Not enough seats available"}

        # Function to check if a branch can be seated at a position
        def is_safe(seat_index, branch):
            # Check left neighbor
            if seat_index > 0 and seating_chart[seat_index - 1] == branch:
                return False
            # Check right neighbor
            if seat_index < total_seats - 1 and seating_chart[seat_index + 1] == branch:
                return False
            return True

        # Backtracking algorithm to assign students to seats
        def assign_seats(index=0):
            if index >= len(students):
                return True  # All students are assigned

            for seat in range(total_seats):
                if seating_chart[seat] == -1 and is_safe(seat, students[index]["branch"]):
                    seating_chart[seat] = index  # Store student index
                    if assign_seats(index + 1):
                        return True
                    seating_chart[seat] = -1  # Backtrack

            return False

        if not assign_seats():
            return {"error": "Could not find a valid seating arrangement"}

        # Generate final seating output
        final_seating = [
            {"seat": i + 1, "roll_number": students[seating_chart[i]]["roll"], "branch": students[seating_chart[i]]["branch"]}
            for i in range(total_seats) if seating_chart[i] != -1
        ]

        return final_seating

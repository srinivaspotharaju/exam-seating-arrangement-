def generate_seating_arrangement(room, branches, roll_numbers):
    total_seats = room["total_seats"]
    seating_plan = [-1] * total_seats

    students = []
    for branch, (start_roll, end_roll) in roll_numbers.items():
        start_roll = int(start_roll)
        end_roll = int(end_roll)
        for roll in range(start_roll, end_roll + 1):
            students.append({"roll": roll, "branch": branch})

    if len(students) > total_seats:
        return {"error": "Not enough seats available"}

    num_branches = len(branches)

    if num_branches == 2:
        branch1, branch2 = branches
        for i in range(total_seats):
            seating_plan[i] = branch1 if i % 2 == 0 else branch2

    elif num_branches == 3:
        branch_list = list(branches)
        for i in range(0, total_seats, 2):
            seating_plan[i] = branch_list[i % 3]
            if i + 1 < total_seats:
                seating_plan[i + 1] = branch_list[(i + 1) % 3]

    return seating_plan

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import re
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

client = MongoClient("mongodb://localhost:27017/")
db = client["exam_seating"]
raw_collection = db["raw_data"]
seating_collection = db["seating_arrangement"]

def validate_roll_number(roll_number, branch=None):
    pattern = r'^1601-22-73[2-7]-[0-3][0-9][0-9]$'
    if not re.match(pattern, roll_number):
        return {
            "is_valid": False,
            "message": "Invalid format. Use 1601-22-73X-YYY (X: 2-7, YYY: 001-320)."
        }
    
    _, _, branch_code, roll_num = roll_number.split('-')
    branch_code_map = {
        'Civil': '732',
        'CSE': '733',
        'EEE': '734',
        'ECE': '735',
        'MECH': '736',
        'IT': '737'
    }
    try:
        roll_num_int = int(roll_num)
    except ValueError:
        return {
            "is_valid": False,
            "message": "Roll number must be numeric."
        }
    
    if branch and branch_code != branch_code_map.get(branch):
        return {
            "is_valid": False,
            "message": f"Invalid branch code for {branch}. Must be {branch_code_map.get(branch)}."
        }
    
    if roll_num_int < 1 or roll_num_int > 320:
        return {
            "is_valid": False,
            "message": "Roll number must be between 001 and 320."
        }
    
    return {"is_valid": True, "message": "Valid roll number."}

# Mock generate_seating_arrangement (replace with graphcoloring.py)
def generate_seating_arrangement(room_capacity, branches, roll_numbers):
    seating_plan = []
    total_seats = room_capacity["total_seats"]  # Fixed at 30
    branch_counts = {branch: roll_numbers[branch][1] - roll_numbers[branch][0] + 1 for branch in branches}
    branch_code_map = {'Civil': '732', 'CSE': '733', 'EEE': '734', 'ECE': '735', 'MECH': '736', 'IT': '737'}
    
    total_students = sum(branch_counts.values())
    if total_students > total_seats:
        raise ValueError(f"Total students ({total_students}) exceed room capacity ({total_seats})")
    
    current_rolls = {branch: roll_numbers[branch][0] for branch in branches}
    assigned = 0
    while assigned < total_students and assigned < total_seats:
        for branch in branches:
            if current_rolls[branch] <= roll_numbers[branch][1]:
                roll_number = f"1601-22-{branch_code_map[branch]}-{current_rolls[branch]:03d}"
                seating_plan.append({"roll_number": roll_number, "branch": branch})
                current_rolls[branch] += 1
                assigned += 1
                if assigned >= total_students:
                    break
    
    while len(seating_plan) < total_seats:
        seating_plan.append({"roll_number": "", "branch": ""})
    
    return seating_plan

@app.route('/api/save-seating-data', methods=['POST'])
def save_seating_data():
    try:
        data = request.json
        print("Received data to save:", data)
        
        for branch, roll_data in data.get("branchData", {}).items():
            start_roll = roll_data.get("startRoll")
            end_roll = roll_data.get("endRoll")
            
            if not start_roll or not end_roll:
                return jsonify({"error": f"Missing roll numbers for {branch}."}), 400
                
            start_validation = validate_roll_number(start_roll, branch)
            if not start_validation["is_valid"]:
                return jsonify({"error": f"Start roll number for {branch}: {start_validation['message']}"}), 400
                
            end_validation = validate_roll_number(end_roll, branch)
            if not end_validation["is_valid"]:
                return jsonify({"error": f"End roll number for {branch}: {end_validation['message']}"}), 400
                
            start_roll_num = int(start_roll.split("-")[3])
            end_roll_num = int(end_roll.split("-")[3])
            if start_roll_num > end_roll_num:
                return jsonify({"error": f"Start roll number for {branch} must be less than or equal to end roll number."}), 400

        raw_collection.insert_one(data)
        return jsonify({"message": "Room data saved successfully!"}), 200
    except Exception as e:
        print("Error in /api/save-seating-data:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate-seating', methods=['POST'])
def generate_seating():
    try:
        data = request.json
        print("Received data for seating generation:", data)

        for branch, roll_range in data.get("roll_numbers", {}).items():
            start_roll_num, end_roll_num = roll_range
            start_roll = f"1601-22-{branch == 'Civil' and '732' or branch == 'CSE' and '733' or branch == 'EEE' and '734' or branch == 'ECE' and '735' or branch == 'MECH' and '736' or '737'}-{start_roll_num:03d}"
            end_roll = f"1601-22-{branch == 'Civil' and '732' or branch == 'CSE' and '733' or branch == 'EEE' and '734' or branch == 'ECE' and '735' or branch == 'MECH' and '736' or '737'}-{end_roll_num:03d}"
            
            start_validation = validate_roll_number(start_roll, branch)
            if not start_validation["is_valid"]:
                return jsonify({"error": f"Start roll number for {branch}: {start_validation['message']}"}), 400
                
            end_validation = validate_roll_number(end_roll, branch)
            if not end_validation["is_valid"]:
                return jsonify({"error": f"End roll number for {branch}: {end_validation['message']}"}), 400
                
            if start_roll_num > end_roll_num:
                return jsonify({"error": f"Start roll number for {branch} must be less than or equal to end roll number."}), 400

        room_capacity = {
            "room_name": data["room_capacity"]["room_name"],
            "total_seats": 30
        }
        branches = data["branches"]
        roll_numbers = data["roll_numbers"]

        total_students = sum(end - start + 1 for start, end in roll_numbers.values())
        if total_students > 30:
            return jsonify({"error": f"Total students ({total_students}) exceed room capacity (30)."}), 400

        seating_plan = generate_seating_arrangement(room_capacity, branches, roll_numbers)

        seating_collection.insert_one({
            "room": room_capacity["room_name"],
            "seating_plan": seating_plan
        })

        return jsonify({
            "message": "Seating arrangement generated successfully!",
            "seating_plan": seating_plan
        }), 200

    except Exception as e:
        print("Error in /api/generate-seating:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/download-seating-pdf', methods=['GET'])
def download_seating_pdf():
    try:
        latest_seating = seating_collection.find().sort([('_id', -1)]).limit(1)[0]
        room = latest_seating["room"]
        seating_plan = latest_seating["seating_plan"]

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []

        styles = getSampleStyleSheet()
        elements.append(Paragraph(f"Seating Arrangement for {room} (5x6 Classroom Layout)", styles['Title']))
        elements.append(Spacer(1, 12))
        elements.append(Paragraph("This layout arranges up to 30 seats in 5 columns and 6 rows, with empty seats left blank.", styles['Normal']))
        elements.append(Spacer(1, 12))

        table_data = []
        for i in range(6):
            row = []
            for j in range(5):
                index = i * 5 + j
                if index < len(seating_plan) and seating_plan[index]["roll_number"]:
                    cell = f"{seating_plan[index]['roll_number']} ({seating_plan[index]['branch']})"
                else:
                    cell = ""
                row.append(cell)
            table_data.append(row)
        
        table = Table(table_data, colWidths=[100]*5, rowHeights=[40]*6)
        table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ]))
        elements.append(table)

        doc.build(elements)
        buffer.seek(0)

        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"seating_arrangement_{room}.pdf",
            mimetype="application/pdf"
        )

    except Exception as e:
        print("Error in /api/download-seating-pdf:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/lookup-room', methods=['POST'])
def lookup_room():
    try:
        data = request.json
        roll_number = data.get("roll_number")
        if not roll_number:
            return jsonify({"error": "Roll number is required."}), 400

        validation = validate_roll_number(roll_number)
        if not validation["is_valid"]:
            return jsonify({"error": validation["message"]}), 400

        # Search all seating_arrangement documents (not just the latest)
        room_found = None
        for doc in seating_collection.find():
            for seat in doc["seating_plan"]:
                if seat["roll_number"] == roll_number:
                    room_found = doc["room"]
                    break
            if room_found:
                break

        if room_found:
            return jsonify({"room": room_found}), 200
        else:
            return jsonify({"error": "Roll number not found in any seating arrangement."}), 404

    except Exception as e:
        print("Error in /api/lookup-room:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/api/check-roll-numbers', methods=['POST'])
def check_roll_numbers():
    try:
        data = request.json
        roll_numbers = data.get("roll_numbers", {})  # {branch: [start, end]}
        if not roll_numbers:
            return jsonify({"error": "Roll number ranges are required."}), 400

        branch_code_map = {'Civil': '732', 'CSE': '733', 'EEE': '734', 'ECE': '735', 'MECH': '736', 'IT': '737'}
        existing_rolls = set()
        
        # Generate all roll numbers from input ranges
        input_rolls = set()
        for branch, roll_range in roll_numbers.items():
            start, end = roll_range
            for num in range(start, end + 1):
                roll_number = f"1601-22-{branch_code_map[branch]}-{num:03d}"
                input_rolls.add(roll_number)
        
        # Check existing seating_arrangement documents
        for doc in seating_collection.find():
            for seat in doc["seating_plan"]:
                if seat["roll_number"]:
                    existing_rolls.add(seat["roll_number"])
        
        # Find duplicates
        duplicates = input_rolls.intersection(existing_rolls)
        if duplicates:
            return jsonify({
                "has_duplicates": True,
                "duplicates": list(duplicates)
            }), 200
        else:
            return jsonify({"has_duplicates": False}), 200

    except Exception as e:
        print("Error in /api/check-roll-numbers:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    return "<h2>Exam Seating Arrangement Backend is Running</h2>"

@app.route('/favicon.ico')
def favicon():
    return '', 204

if __name__ == '__main__':
    app.run(debug=True)
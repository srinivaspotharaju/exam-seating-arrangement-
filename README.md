
# 🪑 Exam Seating Arrangement System

A web-based application designed to manage and generate seating arrangements for college examinations. Built using modern web development technologies with a clean and user-friendly interface.

## 🔍 Overview

This project provides a platform for both **Students** and **Admins**:

- **Students** can check their seating details using their roll number.
- **Admins** can configure seating layouts, allocate rooms based on capacity and roll numbers, and ensure no two students from the same branch sit adjacent to each other using a Graph Coloring Algorithm.

### ✨ Features

- 📄 **Homepage** with introduction and credits
- 👨‍🎓 **Student Panel** to check room allocation
- 🛠️ **Admin Panel** for room and student management
- 🧠 Intelligent **Graph Coloring**-based arrangement
- 📦 MongoDB for persistent data storage
- 🧾 PDF & Excel report generation
- 📧 Email notifications for seating information

## 🖥️ Screenshot

![Homepage](https://github.com/srinivaspotharaju/EXAM-SEATING-ARRANGMENT/blob/deeea251376975678e5fc402cd2828b9acaf2565/homepage.png)

## 👨‍💻 Designed By

- **P. Srinivas**
- **E. Krishna**

## 🛠️ Tech Stack

| Frontend      | Backend       | Database  |
| ------------- | ------------- | ----------|
| React.js      | Flask (Python)| MongoDB   |

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/exam-seating.git
   cd exam-seating










..................................................
## 🧑‍💼 Admin - Seating Arrangement

The Admin interface allows for dynamic configuration of seating based on branch and room capacity. Key functionalities include:

![Admin Seating Panel](https://github.com/srinivaspotharaju/EXAM-SEATING-ARRANGMENT/blob/deeea251376975678e5fc402cd2828b9acaf2565/adminpage.png)

### 🔧 Features Shown:
- **Room Selection:** Dropdown to choose a block/room (e.g., C-301).
- **Branch Selection:** Multi-branch dropdown to enable input sections for each selected branch.
- **Roll Number Input:**
  - Admin inputs **start** and **end** roll numbers for each branch (CSE, IT, MECH).
  - Format: `1601-22-XXX-NNN` (e.g., `1601-22-733-001` to `1601-22-733-010`).

### 🟢 Actions:
- ✅ **Submit:** Saves input data to the database (MongoDB).
- 🔵 **Generate:** Triggers the seating algorithm (e.g., graph coloring) to assign seats ensuring no two students from the same branch sit adjacent.
- 🟠 **Download PDF:** Exports the generated seating plan as a downloadable PDF report.

📌 This panel is central to managing room-wise exam arrangements with fair and conflict-free seat allocation.

...............................................................................
## 🗃️ MongoDB - Seating Arrangement Storage

The seating arrangement data is stored in the `exam_seating` database under the `seating_arrangement` collection.

![MongoDB Compass - Seating Arrangement](https://github.com/srinivaspotharaju/EXAM-SEATING-ARRANGMENT/blob/deeea251376975678e5fc402cd2828b9acaf2565/database.png)




.........................................................................................................................
## 🪑 Seating Arrangement Output (PDF)

The system generates a classroom-wise seating layout in a **tabular PDF format** after applying the graph coloring algorithm.

![Seating Arrangement PDF](https://github.com/srinivaspotharaju/EXAM-SEATING-ARRANGMENT/blob/deeea251376975678e5fc402cd2828b9acaf2565/seating%20arrangement.png?raw=true)

### 📐 Layout Specifications:
- **Room:** C-301
- **Dimensions:** 5 columns × 6 rows (total 30 seats)
- **Empty Seats:** Automatically left blank when student count is < 30.
- **Format:** Each cell includes:
  - Full **Roll Number**
  - **Branch Code** (e.g., CSE, IT, MECH)

### 🎯 Objective:
Ensures no two students of the same branch are seated **adjacent** (front, back, left, right), thereby minimizing cheating risks and maintaining discipline.

### 📥 How to Use:
- Click the **Download PDF** button from the Admin Panel after generating seating.
- PDF auto-downloads in a printable format for physical distribution.
.......................................................................................................................
## 🎓 Student Room Lookup

Students can check their allotted **exam room** by entering their roll number in the Student Portal.

![Student Room Lookup](https://github.com/srinivaspotharaju/EXAM-SEATING-ARRANGMENT/blob/deeea251376975678e5fc402cd2828b9acaf2565/student%20lookup.png?raw=true)

### 🔍 Features:
- Input field to **enter roll number**
- On clicking **Find Room**:
  - Displays **Room Number**
  - Displays **Exam Date**

### ✅ Example:
- **Input:** `1601-22-733-010`
- **Output:**
  - 🏫 **Room Number:** C-301  
  - 📅 **Date:** April 25, 2025

This feature ensures quick and accurate seat lookup without requiring printed lists or manual queries.

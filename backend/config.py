
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

def connect_db():
    client = MongoClient(MONGO_URI)
    db = client["exam_seating"]
    return db


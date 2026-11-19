
from flask import Flask, jsonify, request, send_from_directory, session
from werkzeug.utils import secure_filename
from functools import wraps
import sqlite3
import os
import secrets

BASE = os.path.dirname(os.path.abspath(__file__))
FRONTEND = os.path.abspath(os.path.join(BASE, "../frontend"))
IMAGES = os.path.abspath(os.path.join(BASE, "../images"))
UPLOADS = os.path.join(BASE, "uploads")
DATABASE = os.path.join(BASE, "consultations.db")

os.makedirs(UPLOADS, exist_ok=True)

app = Flask(__name__, static_folder=FRONTEND, static_url_path="")
app.secret_key = os.environ.get("SECRET_KEY", secrets.token_hex(32))
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024

NP_PASSWORD = os.environ.get("NP_PASSWORD")


def connect():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db


def create_database():
    with connect() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS consultations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                concern TEXT NOT NULL,
                treatment TEXT NOT NULL,
                status TEXT NOT NULL,
                name TEXT,
                phone TEXT,
                photo TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        columns = [
            row["name"]
            for row in db.execute("PRAGMA table_info(consultations)")
        ]

        for name in ["name", "phone", "photo", "created_at"]:
            if name not in columns:
                db.execute(
                    "ALTER TABLE consultations ADD COLUMN "
                    + name + " TEXT"
                )


def np_required(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        if not session.get("np"):
            return jsonify({"error": "NP login required"}), 401
        return function(*args, **kwargs)
    return wrapper


def recommendation(concern):
    options = {
        "dry skin": "Hydrating facials and moisturizing skincare may help with dry skin.",
        "acne": "Acne skincare and a professional skin evaluation may help.",
        "fine lines": "Botox may help certain expression lines. Microneedling may help some fine lines.",
        "uneven skin tone": "Chemical peels or certain laser treatments may help with uneven skin tone."
    }
    return options.get(concern)


@app.route("/")
def home():
    return app.send_static_file("index.html")


@app.route("/images/<path:filename>")
def images(filename):
    return send_from_directory(IMAGES, filename)


@app.route("/dashboard.html")
def dashboard_page():
    if not session.get("np"):
        return app.send_static_file("login.html")
    return app.send_static_file("dashboard.html")


@app.route("/api/status")
def status():
    return jsonify({"project": "Aesthetic Island", "status": "working"})


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    password = data.get("password", "")

    if not NP_PASSWORD:
        return jsonify({"error": "NP_PASSWORD is not configured"}), 503

    if isinstance(password, str) and secrets.compare_digest(
        password, NP_PASSWORD
    ):
        session.clear()
        session["np"] = True
        return jsonify({"message": "Login successful"})

    return jsonify({"error": "Incorrect password"}), 401


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out"})


@app.route("/api/consultation", methods=["POST"])
def consultation():
    name = request.form.get("name", "").strip()
    phone = request.form.get("phone", "").strip()
    concern = request.form.get("concern", "").strip().lower()
    photo = request.files.get("photo")

    if not 2 <= len(name) <= 100:
        return jsonify({"error": "Enter a valid name"}), 400

    if not 7 <= len(phone) <= 25:
        return jsonify({"error": "Enter a valid phone number"}), 400

    treatment = recommendation(concern)
    if not treatment:
        return jsonify({"error": "Select a valid concern"}), 400

    filename = None

    if photo and photo.filename:
        allowed = {"image/jpeg": ".jpg", "image/png": ".png"}
        extension = allowed.get(photo.mimetype)

        if not extension:
            return jsonify({"error": "Only JPG or PNG photos allowed"}), 400

        header = photo.stream.read(8)
        photo.stream.seek(0)

        valid = (
            header.startswith(b"\xff\xd8\xff")
            if extension == ".jpg"
            else header == b"\x89PNG\r\n\x1a\n"
        )

        if not valid:
            return jsonify({"error": "Invalid image file"}), 400

        filename = secrets.token_hex(16) + extension
        photo.save(os.path.join(UPLOADS, filename))

    with connect() as db:
        cursor = db.execute("""
            INSERT INTO consultations
            (name, phone, concern, treatment, status, photo)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (name, phone, concern, treatment, "Pending", filename))
        consultation_id = cursor.lastrowid

    return jsonify({
        "id": consultation_id,
        "treatment": treatment,
        "status": "Pending",
        "message": "Consultation submitted for professional review."
    }), 201


@app.route("/api/consultations")
@np_required
def get_consultations():
    with connect() as db:
        rows = db.execute(
            "SELECT * FROM consultations ORDER BY id DESC"
        ).fetchall()

    return jsonify([dict(row) for row in rows])


@app.route("/api/photos/<int:consultation_id>")
@np_required
def get_photo(consultation_id):
    with connect() as db:
        row = db.execute(
            "SELECT photo FROM consultations WHERE id = ?",
            (consultation_id,)
        ).fetchone()

    if not row or not row["photo"]:
        return jsonify({"error": "Photo not found"}), 404

    return send_from_directory(UPLOADS, row["photo"])


@app.route("/api/consultations/<int:consultation_id>/status", methods=["POST"])
@np_required
def update_status(consultation_id):
    data = request.get_json(silent=True) or {}
    new_status = data.get("status")

    if new_status not in ["Pending", "Reviewed", "Completed"]:
        return jsonify({"error": "Invalid status"}), 400

    with connect() as db:
        cursor = db.execute(
            "UPDATE consultations SET status = ? WHERE id = ?",
            (new_status, consultation_id)
        )

        if cursor.rowcount == 0:
            return jsonify({"error": "Not found"}), 404

    return jsonify({"status": new_status})


create_database()

if __name__ == "__main__":
    app.run(debug=False)


from flask import Flask, jsonify, request, send_from_directory
import sqlite3

# create my backend
app = Flask(__name__, static_folder="../frontend", static_url_path="")

# my database file
database = "consultations.db"


# create my database table
def create_database():

    connection = sqlite3.connect(database)
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS consultations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            concern TEXT NOT NULL,
            treatment TEXT NOT NULL,
            status TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


# show my website
@app.route("/")
def home():
    return app.send_static_file("index.html")


# show my images
@app.route("/images/<path:filename>")
def images(filename):
    return send_from_directory("../images", filename)


# check my backend
@app.route("/api/status")
def status():
    return jsonify({
        "project": "aesthetic island",
        "status": "working"
    })


# receive a test consultation
@app.route("/api/consultation", methods=["POST"])
def consultation():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "invalid information"}), 400

    if set(data.keys()) != {"concern"}:
        return jsonify({"error": "only test concerns are allowed"}), 400

    concern = data.get("concern", "")

    if concern == "dry skin":
        treatment = "Hydrating facials and moisturizing skincare may help with dry skin."

    elif concern == "acne":
        treatment = "Acne skincare and professional skin evaluations may help with acne concerns."

    elif concern == "fine lines":
        treatment = "Botox may help certain expression lines. Microneedling may help some fine lines."

    elif concern == "uneven skin tone":
        treatment = "Chemical peels and certain laser treatments may help with uneven skin tone."

    else:
        return jsonify({"error": "invalid test concern"}), 400

    # connect to my database
    connection = sqlite3.connect(database)
    cursor = connection.cursor()

    # save my test consultation
    cursor.execute(
        "INSERT INTO consultations (concern, treatment, status) VALUES (?, ?, ?)",
        (concern, treatment, "test")
    )

    connection.commit()
    connection.close()

    # send information to my website
    return jsonify({
        "concern": concern,
        "treatment": treatment,
        "message": "general educational information only. professional review is required.",
        "status": "success"
    })


# show saved test consultations
@app.route("/api/consultations")
def get_consultations():

    connection = sqlite3.connect(database)
    cursor = connection.cursor()

    cursor.execute("SELECT * FROM consultations")
    rows = cursor.fetchall()

    connection.close()

    consultations = []

    for row in rows:
        consultations.append({
            "id": row[0],
            "concern": row[1],
            "treatment": row[2],
            "status": row[3]
        })

    return jsonify(consultations)


# create my database when the app starts
create_database()


# start my backend
if __name__ == "__main__":
    app.run(debug=True)

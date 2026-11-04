
from flask import Flask, jsonify, request, send_from_directory

# create my aesthetic island backend
app = Flask(__name__, static_folder="../frontend", static_url_path="")

# show my website
@app.route("/")
def home():
    return app.send_static_file("index.html")

# show my website images
@app.route("/images/<path:filename>")
def images(filename):
    return send_from_directory("../images", filename)

# check if my backend is working
@app.route("/api/status")
def status():
    return jsonify({
        "project": "aesthetic island",
        "status": "working"
    })

# receive a test consultation
@app.route("/api/consultation", methods=["POST"])
def consultation():

    # get information from my website
    data = request.get_json(silent=True)

    # check if information was sent
    if not isinstance(data, dict):
        return jsonify({"error": "invalid information"}), 400

    # only accept a test concern
    if set(data.keys()) != {"concern"}:
        return jsonify({"error": "only test concerns are allowed"}), 400

    concern = data.get("concern", "")

    # check if the concern is empty
    if not isinstance(concern, str) or not concern.strip():
        return jsonify({"error": "please enter a concern"}), 400

    # send a message back to the website
    return jsonify({
        "message": "test consultation received successfully",
        "status": "success"
    })

# start my backend
if __name__ == "__main__":
    app.run(debug=True)

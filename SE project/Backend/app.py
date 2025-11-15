from flask import Flask, request, jsonify, render_template # render_template is imported
from flask_cors import CORS

# Configure the app to look for templates and static files in the '../frontend' directory
# This assumes the Flask app.py is in a subdirectory (like 'backend/') and 'frontend/' is its sibling.
app = Flask(__name__, template_folder='../frontend',
    static_folder='../frontend', # Keep this for CSS/JS access
    static_url_path='/')

# Initialize CORS
CORS(app)

# Temporary in-memory storage for users (replace with database in production)
users = {}

@app.route('/', methods=['GET'])
def home():
    # Corrected the typo from 'rendrer_template' to 'render_template'
    return render_template('login.html')

@app.route('/api/signup', methods=['POST'])
def signup():
    """Handles user registration."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"success": False, "message": "Missing email or password."}), 400

    if email in users:
        return jsonify({"success": False, "message": "User already exists."}), 409
    
    # In a real application, the password would be hashed before storage (e.g., using bcrypt)
    users[email] = password
    print(f"User signed up: {email}. Current users: {users}") 

    return jsonify({"success": True, "message": "Registration successful."}), 201

@app.route('/api/login', methods=['POST'])
def login():
    """Handles user login."""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"success": False, "message": "Missing email or password."}), 400

    # In a real application, you would verify the password hash
    if email in users and users[email] == password:
        return jsonify({"success": True, "message": "Login successful."}), 200
    else:
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

if __name__ == '__main__':
    app.run(debug=True)
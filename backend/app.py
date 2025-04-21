# Main Flask application
# This file initializes the Flask app, sets up MongoDB, and registers routes.
from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.face_routes import face_bp
from config import Config
from flask_pymongo import PyMongo
import os

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Setup MongoDB
mongo = PyMongo(app)

# Enable CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(face_bp, url_prefix='/api/face')

@app.route('/')
def index():
    return {'status': 'API is running'}

if __name__ == '__main__':
    app.run(debug=True)
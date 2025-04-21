# Configuration file for the backend
# This file contains the configuration settings for the backend application
import os
from datetime import timedelta

class Config:
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    
    # MongoDB settings
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/faceauth')
    
    # JWT settings
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    
    # Email Configuration
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = '20051889@kiit.ac.in'  # Replace with your email
    MAIL_PASSWORD = 'sxks bgmz auyy tcew'     # Replace with your app password
    MAIL_DEFAULT_SENDER = '20051889@kiit.ac.in'
    
    # Face recognition settings
    FACE_RECOGNITION_TOLERANCE = 0.5
    FACE_ENCODINGS_PATH = os.environ.get('FACE_ENCODINGS_PATH', 'face_encodings')
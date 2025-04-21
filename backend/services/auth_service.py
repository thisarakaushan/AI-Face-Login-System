# Authentication service
import secrets
import datetime
import jwt
from flask import current_app
from models.user import User
from werkzeug.security import generate_password_hash
import numpy as np

class AuthService:
    def __init__(self, db):
        self.db = db
    
    def register_user(self, email, password=None, face_encoding=None):
        # Check if user already exists
        existing_user = self.db.users.find_one({'email': email})
        if existing_user:
            return {'success': False, 'message': 'Email already registered'}
        
        # At least one authentication method is required
        if not password and face_encoding is None:
            return {'success': False, 'message': 'Password or face encoding is required'}

        # Create new user
        user = User(email=email, password=password, face_encoding=face_encoding)
        
        # Convert face_encoding from numpy array to list if present
        user_dict = {
            'email': user.email,
            'password_hash': user.password_hash,
            'face_encoding': user.face_encoding.tolist() if isinstance(user.face_encoding, np.ndarray) else user.face_encoding,
            'created_at': datetime.datetime.utcnow()
        }
        
        result = self.db.users.insert_one(user_dict)
        return {'success': True, 'user_id': str(result.inserted_id)}
    
    def login_with_password(self, email, password):
        user_data = self.db.users.find_one({'email': email})
        if not user_data or not user_data.get('password_hash'):
            return {'success': False, 'message': 'Invalid email or password'}
        
        user = User.from_dict(user_data)
        if not user.check_password(password):
            return {'success': False, 'message': 'Invalid email or password'}
        
        # Generate JWT token
        token = self._generate_token(str(user_data['_id']), user_data['email'])
        return {'success': True, 'token': token, 'user': user.to_dict()}
    
    def login_with_face(self, email, face_encoding):
        from face_recognition import compare_faces
        
        user_data = self.db.users.find_one({'email': email})
        if not user_data or not user_data.get('face_encoding'):
            return {'success': False, 'message': 'User not found or face not registered'}
        
        # Convert stored face encoding from list back to numpy array
        stored_encoding = np.array(user_data['face_encoding'])
        
        # Compare faces
        tolerance = current_app.config['FACE_RECOGNITION_TOLERANCE']
        match = compare_faces([stored_encoding], face_encoding, tolerance=tolerance)[0]
        
        if not match:
            return {'success': False, 'message': 'Face verification failed'}
        
        # Generate JWT token
        token = self._generate_token(str(user_data['_id']), user_data['email'])
        
        user = User.from_dict(user_data)
        return {'success': True, 'token': token, 'user': user.to_dict()}
    
    def generate_password_reset_token(self, email):
        user_data = self.db.users.find_one({'email': email})
        if not user_data:
            # Don't reveal that email doesn't exist for security
            return {'success': True, 'message': 'If your email is registered, you will receive a password reset link'}
        
        # Generate token and expiration (24 hours from now)
        token = secrets.token_urlsafe(32)
        token_exp = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        
        # Update user with reset token
        self.db.users.update_one(
            {'_id': user_data['_id']},
            {'$set': {
                'reset_token': token,
                'reset_token_exp': token_exp
            }}
        )
        
        return {
            'success': True, 
            'message': 'Password reset email sent',
            'token': token,  # In production, you would send this via email
            'email': email
        }
    
    def reset_password(self, token, new_password):
        user_data = self.db.users.find_one({
            'reset_token': token,
            'reset_token_exp': {'$gt': datetime.datetime.utcnow()}
        })
        
        if not user_data:
            return {'success': False, 'message': 'Invalid or expired token'}
        
        # Update password and clear reset token
        password_hash = generate_password_hash(new_password)
        self.db.users.update_one(
            {'_id': user_data['_id']},
            {'$set': {'password_hash': password_hash},
             '$unset': {'reset_token': '', 'reset_token_exp': ''}}
        )
        
        return {'success': True, 'message': 'Password reset successful'}
    
    def _generate_token(self, user_id, email):
        payload = {
            'exp': datetime.datetime.utcnow() + current_app.config['JWT_ACCESS_TOKEN_EXPIRES'],
            'iat': datetime.datetime.utcnow(),
            'sub': user_id,
            'email': email
        }
        return jwt.encode(
            payload,
            current_app.config['JWT_SECRET_KEY'],
            algorithm='HS256'
        )
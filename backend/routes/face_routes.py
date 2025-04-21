# Face recognition routes
import face_recognition
from flask import Blueprint, request, jsonify, current_app
import numpy as np
from services.face_service import FaceService
from flask_pymongo import PyMongo
import jwt

face_bp = Blueprint('face', __name__)

# Middleware to verify JWT token
def token_required(f):
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'message': 'No token provided'}), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            # Verify token
            payload = jwt.decode(
                token,
                current_app.config['JWT_SECRET_KEY'],
                algorithms=['HS256']
            )
            
            # Add user info to request
            request.user = {
                'id': payload['sub'],
                'email': payload['email']
            }
            
            return f(*args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            return jsonify({'success': False, 'message': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'success': False, 'message': 'Invalid token'}), 401
    
    # Preserve the original function name
    decorated.__name__ = f.__name__
    return decorated

@face_bp.route('/update', methods=['POST'])
@token_required
def update_face():
    data = request.get_json()
    face_image = data.get('faceImage')
    
    if not face_image:
        return jsonify({'success': False, 'message': 'Face image is required'}), 400
    
    # Initialize services
    mongo = PyMongo(current_app)
    face_service = FaceService(mongo.db)
    
    # Extract face encoding
    result = face_service.extract_face_encoding(face_image)
    if not result['success']:
        return jsonify(result), 400
    
    face_encoding = result['face_encoding']
    
    # Update face encoding
    update_result = face_service.update_face_encoding(request.user['email'], face_encoding)
    
    if not update_result['success']:
        return jsonify(update_result), 400
    
    return jsonify(update_result)

@face_bp.route('/delete', methods=['DELETE'])
@token_required
def delete_face():
    # Initialize services
    mongo = PyMongo(current_app)
    face_service = FaceService(mongo.db)
    
    # Delete face encoding
    result = face_service.delete_face_encoding(request.user['email'])
    
    if not result['success']:
        return jsonify(result), 400
    
    return jsonify(result)

@face_bp.route('/verify', methods=['POST'])
def verify_face():
    data = request.get_json()
    email = data.get('email')
    face_image = data.get('faceImage')
    
    if not email or not face_image:
        return jsonify({'success': False, 'message': 'Email and face image are required'}), 400
    
    # Initialize services
    mongo = PyMongo(current_app)
    face_service = FaceService(mongo.db)
    
    # Extract face encoding from the captured image
    result = face_service.extract_face_encoding(face_image)
    if not result['success']:
        return jsonify(result), 400
    
    face_encoding = result['face_encoding']
    
    # Find user and get stored face encoding
    user_data = mongo.db.users.find_one({'email': email})
    if not user_data or 'face_encoding' not in user_data:
        return jsonify({'success': False, 'message': 'User not found or face not registered'}), 404
    
    try:
        # Compare faces with lower tolerance for better accuracy
        stored_encoding = np.array(user_data['face_encoding'])
        tolerance = 0.5  # Adjust this value as needed (lower = stricter)
        
        # Calculate face distance and match
        matches = face_recognition.compare_faces([stored_encoding], face_encoding, tolerance=tolerance)
        face_distance = face_recognition.face_distance([stored_encoding], face_encoding)[0]
        
        is_match = matches[0] and face_distance < tolerance
        
        return jsonify({
            'success': True,
            'match': bool(is_match),
            'distance': float(face_distance),
            'message': 'Face recognized successfully!' if is_match else 'Face not recognized',
            'confidence': float(1 - face_distance)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error comparing faces: {str(e)}'}), 500
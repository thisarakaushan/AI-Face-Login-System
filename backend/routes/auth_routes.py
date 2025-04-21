# Authentication routes
from flask import Blueprint, request, jsonify, current_app
from services.auth_service import AuthService
from services.face_service import FaceService
from flask_pymongo import PyMongo
import jwt
from utils.email_sender import send_password_reset_email
from utils.validators import validate_email, validate_password

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate inputs
    email = data.get('email')
    password = data.get('password')
    face_image = data.get('faceImage')
    
    if not validate_email(email):
        return jsonify({'success': False, 'message': 'Invalid email format'}), 400
    
    if password and not validate_password(password):
        return jsonify({'success': False, 'message': 'Password must be at least 8 characters with letters and numbers'}), 400
    
    # Initialize services
    mongo = PyMongo(current_app)
    auth_service = AuthService(mongo.db)
    
    # Process face image if provided
    face_encoding = None
    if face_image:
        face_service = FaceService(mongo.db)
        result = face_service.extract_face_encoding(face_image)
        if not result['success']:
            return jsonify(result), 400
        face_encoding = result['face_encoding']
    
    # Register user
    result = auth_service.register_user(email, password, face_encoding)
    
    if not result['success']:
        return jsonify(result), 400
    
    return jsonify(result), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Initialize services
    mongo = PyMongo(current_app)
    auth_service = AuthService(mongo.db)
    
    # Login method
    login_method = data.get('method', 'password')
    email = data.get('email')
    
    if not validate_email(email):
        return jsonify({'success': False, 'message': 'Invalid email format'}), 400
    
    if login_method == 'password':
        password = data.get('password')
        if not password:
            return jsonify({'success': False, 'message': 'Password is required'}), 400
            
        result = auth_service.login_with_password(email, password)
    
    elif login_method == 'face':
        face_image = data.get('faceImage')
        if not face_image:
            return jsonify({'success': False, 'message': 'Face image is required'}), 400
            
        # Process face image
        face_service = FaceService(mongo.db)
        face_result = face_service.extract_face_encoding(face_image)
        
        if not face_result['success']:
            return jsonify(face_result), 400
            
        face_encoding = face_result['face_encoding']
        result = auth_service.login_with_face(email, face_encoding)
    
    else:
        return jsonify({'success': False, 'message': 'Invalid login method'}), 400
    
    if not result['success']:
        return jsonify(result), 401
    
    return jsonify(result)

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    if not validate_email(email):
        return jsonify({'success': False, 'message': 'Invalid email format'}), 400
    
    # Initialize services
    mongo = PyMongo(current_app)
    auth_service = AuthService(mongo.db)
    
    # Generate reset token
    result = auth_service.generate_password_reset_token(email)
    
    # Send email with reset link
    if result.get('token'):
        reset_url = f"{request.origin}/reset-password?token={result['token']}&email={email}"
        send_password_reset_email(email, reset_url)
    
    # Always return success to prevent email enumeration
    return jsonify({'success': True, 'message': 'If your email is registered, you will receive a password reset link'})

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')
    
    if not token or not new_password:
        return jsonify({'success': False, 'message': 'Token and new password are required'}), 400
    
    if not validate_password(new_password):
        return jsonify({'success': False, 'message': 'Password must be at least 8 characters with letters and numbers'}), 400
    
    # Initialize services
    mongo = PyMongo(current_app)
    auth_service = AuthService(mongo.db)
    
    # Reset password
    result = auth_service.reset_password(token, new_password)
    
    if not result['success']:
        return jsonify(result), 400
    
    return jsonify(result)

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
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
        
        # Get user info
        mongo = PyMongo(current_app)
        user_data = mongo.db.users.find_one({'_id': payload['sub']})
        
        if not user_data:
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        # Return user info
        return jsonify({
            'success': True,
            'user': {
                'id': str(user_data['_id']),
                'email': user_data['email']
            }
        })
        
    except jwt.ExpiredSignatureError:
        return jsonify({'success': False, 'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'success': False, 'message': 'Invalid token'}), 401
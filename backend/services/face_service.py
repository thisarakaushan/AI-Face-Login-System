# Face recognition service 
import face_recognition
import numpy as np
import base64
import cv2
import io
from PIL import Image

class FaceService:
    def __init__(self, db):
        self.db = db
    
    def extract_face_encoding(self, face_image_base64):
        """
        Extract face encoding from a base64 encoded image
        """
        try:
            # Decode base64 image
            image_data = base64.b64decode(face_image_base64.split(',')[1])
            image = np.array(Image.open(io.BytesIO(image_data)))
            
            # Convert RGB to BGR (OpenCV format)
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            
            # Detect face locations
            face_locations = face_recognition.face_locations(image)
            
            if not face_locations:
                return {'success': False, 'message': 'No face detected in the image'}
            
            if len(face_locations) > 1:
                return {'success': False, 'message': 'Multiple faces detected. Please ensure only one face is visible.'}
            
            # Get face encoding
            face_encoding = face_recognition.face_encodings(image, face_locations)[0]
            
            return {'success': True, 'face_encoding': face_encoding}
        
        except Exception as e:
            return {'success': False, 'message': f'Error processing image: {str(e)}'}
    
    def update_face_encoding(self, email, face_encoding):
        """
        Update or add face encoding for a user
        """
        result = self.db.users.update_one(
            {'email': email},
            {'$set': {'face_encoding': face_encoding.tolist()}}
        )
        
        if result.matched_count == 0:
            return {'success': False, 'message': 'User not found'}
        
        return {'success': True, 'message': 'Face encoding updated successfully'}
    
    def delete_face_encoding(self, email):
        """
        Remove face encoding for a user
        """
        result = self.db.users.update_one(
            {'email': email},
            {'$unset': {'face_encoding': ''}}
        )
        
        if result.matched_count == 0:
            return {'success': False, 'message': 'User not found'}
        
        return {'success': True, 'message': 'Face encoding removed successfully'}
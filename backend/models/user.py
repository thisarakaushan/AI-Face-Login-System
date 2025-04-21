# User Model
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId

class User:
    def __init__(self, email, password=None, face_encoding=None, 
                 reset_token=None, reset_token_exp=None, _id=None):
        self.email = email
        self.password_hash = generate_password_hash(password) if password else None
        self.face_encoding = face_encoding
        self.reset_token = reset_token
        self.reset_token_exp = reset_token_exp
        self._id = _id
    
    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            "_id": str(self._id) if self._id else None,
            "email": self.email,
            "has_password": self.password_hash is not None,
            "has_face": self.face_encoding is not None
        }
    
    @classmethod
    def from_dict(cls, data):
        if not data:
            return None
            
        user = cls(
            email=data.get('email'),
            _id=data.get('_id')
        )
        user.password_hash = data.get('password_hash')
        user.face_encoding = data.get('face_encoding')
        user.reset_token = data.get('reset_token')
        user.reset_token_exp = data.get('reset_token_exp')
        return user
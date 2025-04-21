# Input validation
import re

def validate_email(email):
    """
    Validate email format
    """
    if not email:
        return False
        
    email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    return bool(email_pattern.match(email))

def validate_password(password):
    """
    Validate password requirements:
    - At least 8 characters
    - Contains at least one letter and one number
    """
    if not password or len(password) < 8:
        return False
        
    # Check for at least one letter and one number
    has_letter = re.search(r'[a-zA-Z]', password)
    has_number = re.search(r'[0-9]', password)
    
    return bool(has_letter and has_number)
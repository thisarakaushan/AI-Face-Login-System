# Email sender for password reset
from flask import current_app
from flask_mail import Mail, Message

def send_password_reset_email(recipient, reset_url):
    """
    Send password reset email to user
    """
    # Initialize Flask-Mail
    mail = Mail(current_app)
    
    # Create email message
    subject = "Password Reset Request"
    body = f"""
    Hello,
    
    You recently requested to reset your password. Click the link below to reset it:
    
    {reset_url}
    
    This link will expire in 24 hours. If you did not request a password reset, please ignore this email.
    
    Regards,
    The Face Auth Team
    """
    
    msg = Message(
        subject=subject,
        recipients=[recipient],
        body=body
    )
    
    try:
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send email: {str(e)}")
        return False
# Email sender for password reset
from flask_mail import Mail, Message

def send_password_reset_email(to_email, reset_url, app):
    """
    Send password reset email to user
    """
    # Initialize Flask-Mail
    mail = Mail(app)
    
    # Create email message
    msg = Message(
        'Password Reset Request',
        sender=app.config['MAIL_DEFAULT_SENDER'],
        recipients=[to_email]
    )
    
    msg.body = f'''To reset your password, visit the following link:
{reset_url}

If you did not make this request then simply ignore this email and no changes will be made.
'''
    
    msg.html = f'''
<p>To reset your password, click the following link:</p>
<p><a href="{reset_url}">Reset Password</a></p>
<p>If you did not make this request then simply ignore this email and no changes will be made.</p>
'''
    
    try:
        mail.send(msg)
        return True
    except Exception as e:
        app.logger.error(f"Failed to send email: {str(e)}")
        return False
import secrets
import string
import os
from app.models import URL

def generate_short_code(length=None):
    """Generate a random short code for URLs"""
    if length is None:
        length = int(os.getenv('SHORT_CODE_LENGTH', 6))
    
    # Use base62 characters (a-z, A-Z, 0-9)
    characters = string.ascii_letters + string.digits
    
    # Generate codes until we find one that doesn't exist
    max_attempts = 100
    for _ in range(max_attempts):
        short_code = ''.join(secrets.choice(characters) for _ in range(length))
        
        # Check if this code already exists
        if not URL.query.filter_by(short_code=short_code).first():
            return short_code
    
    # If we couldn't generate a unique code after max_attempts, raise an error
    raise Exception(f"Could not generate unique short code after {max_attempts} attempts")

def generate_access_token(length=64):
    """Generate a secure access token for users and admins"""
    # Use URL-safe characters for tokens
    characters = string.ascii_letters + string.digits + '-_'
    return ''.join(secrets.choice(characters) for _ in range(length))

def is_valid_url(url):
    """Basic URL validation"""
    import validators
    return validators.url(url)

def build_short_url(short_code, request):
    """Build the full short URL from a short code"""
    return f"{request.scheme}://{request.host}/{short_code}"

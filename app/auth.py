from functools import wraps
from flask import request, jsonify, g
from app.models import User, Admin

def require_user_auth(f):
    """Decorator to require user authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Authorization header is required'}), 401
        
        try:
            # Extract token from "Bearer <token>" format
            token_type, token = auth_header.split(' ', 1)
            if token_type.lower() != 'bearer':
                return jsonify({'error': 'Invalid authorization header format. Use "Bearer <token>"'}), 401
        except ValueError:
            return jsonify({'error': 'Invalid authorization header format. Use "Bearer <token>"'}), 401
        
        # Find user by token
        user = User.query.filter_by(access_token=token, is_active=True).first()
        if not user:
            return jsonify({'error': 'Invalid or inactive user token'}), 401
        
        # Store user in Flask's g object for use in the route
        g.current_user = user
        return f(*args, **kwargs)
    
    return decorated_function

def require_admin_auth(f):
    """Decorator to require admin authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Authorization header is required'}), 401
        
        try:
            # Extract token from "Bearer <token>" format
            token_type, token = auth_header.split(' ', 1)
            if token_type.lower() != 'bearer':
                return jsonify({'error': 'Invalid authorization header format. Use "Bearer <token>"'}), 401
        except ValueError:
            return jsonify({'error': 'Invalid authorization header format. Use "Bearer <token>"'}), 401
        
        # Find admin by token
        admin = Admin.query.filter_by(access_token=token, is_active=True).first()
        if not admin:
            return jsonify({'error': 'Invalid or inactive admin token'}), 401
        
        # Store admin in Flask's g object for use in the route
        g.current_admin = admin
        return f(*args, **kwargs)
    
    return decorated_function

def get_current_user():
    """Get the current authenticated user"""
    return getattr(g, 'current_user', None)

def get_current_admin():
    """Get the current authenticated admin"""
    return getattr(g, 'current_admin', None)

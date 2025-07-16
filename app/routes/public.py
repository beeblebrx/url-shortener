from flask import Blueprint, redirect, jsonify, abort, request, make_response
from app.models import User, URL
from app import db
from app.auth import generate_jwt, require_user_auth, get_current_user
import bcrypt
import secrets

public_bp = Blueprint('public', __name__)

@public_bp.route('/<short_code>')
def redirect_url(short_code):
    """Redirect to the original URL using the short code"""
    # Find the URL by short code
    url = URL.query.filter_by(short_code=short_code).first()
    
    if not url:
        abort(404)
    
    # Check if URL has expired
    if url.is_expired:
        abort(404)
    
    # Increment click count and update last accessed time
    url.increment_click_count()
    
    # Redirect to the original URL
    return redirect(url.original_url, code=302)

@public_bp.route('/stats/<short_code>')
def get_url_stats(short_code):
    """Get statistics for a shortened URL"""
    # Find the URL by short code
    url = URL.query.filter_by(short_code=short_code).first()
    
    if not url:
        return jsonify({'error': 'Short URL not found'}), 404
    
    # Check if URL has expired
    if url.is_expired:
        return jsonify({'error': 'Short URL has expired'}), 404
    
    # Return URL statistics
    return jsonify({
        'short_code': url.short_code,
        'original_url': url.original_url,
        'created_at': url.created_at.isoformat() if url.created_at else None,
        'expires_at': url.expires_at.isoformat() if url.expires_at else None,
        'is_permanent': url.is_permanent,
        'click_count': url.click_count,
        'last_accessed': url.last_accessed.isoformat() if url.last_accessed else None
    })

@public_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    username = data['username']
    password = data['password']

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 409

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    access_token = secrets.token_hex(16)

    new_user = User(
        username=username,
        password=hashed_password.decode('utf-8'),
        access_token=access_token
    )
    db.session.add(new_user)
    db.session.commit()

    jwt_token = generate_jwt(username, 'user', access_token)

    response = make_response(jsonify({}), 201)
    response.set_cookie('auth_token', jwt_token, 
                       httponly=True, 
                       secure=False,  # Set to True for production HTTPS
                       samesite='Lax',
                       max_age=86400)  # 24 hours
    return response

@public_bp.route('/login', methods=['POST'])
def login():
    """Log in a user"""
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    username = data['username']
    password = data['password']

    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({'error': 'Invalid username or password'}), 401

    # Generate a new access token for the user
    user.access_token = secrets.token_hex(16)
    db.session.commit()

    jwt_token = generate_jwt(username, 'user', user.access_token)

    response = make_response(jsonify({}), 200)
    response.set_cookie('auth_token', jwt_token, 
                       httponly=True, 
                       secure=False,  # Set to True for production HTTPS
                       samesite='Lax',
                       max_age=86400)  # 24 hours
    return response

@public_bp.route('/logout', methods=['POST'])
@require_user_auth
def logout():
    """Log out a user, nullify their access token, and clear the auth cookie"""
    current_user = get_current_user()
    
    if current_user:
        current_user.access_token = None
        db.session.commit()

    response = make_response(jsonify({}), 200)
    response.set_cookie('auth_token', '', 
                       httponly=True, 
                       secure=False,  # Set to True for production HTTPS
                       samesite='Lax',
                       expires=0)  # Expire immediately
    
    return response

@public_bp.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'url-shortener'})

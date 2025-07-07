from flask import Blueprint, redirect, jsonify, abort, request
from app.models import User, URL
from app import db
from app.auth import generate_jwt
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

    return jsonify({'token': jwt_token}), 201

@public_bp.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'url-shortener'})

@public_bp.route('/urls', methods=['GET'])
def list_all_urls():
    """List all URLs with pagination and sorting"""
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        # Get sorting parameters
        sort_by = request.args.get('sort_by', 'created_at')
        order = request.args.get('order', 'desc')
        
        # Validate sort_by parameter
        valid_sort_fields = ['created_at', 'expires_at', 'click_count', 'short_code']
        if sort_by not in valid_sort_fields:
            return jsonify({'error': f'Invalid sort_by field. Valid options: {valid_sort_fields}'}), 400
        
        # Validate order parameter
        if order not in ['asc', 'desc']:
            return jsonify({'error': 'Invalid order. Valid options: asc, desc'}), 400
        
        # Build query
        query = URL.query
        
        # Apply sorting
        sort_column = getattr(URL, sort_by)
        if order == 'desc':
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # Apply pagination
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Convert URLs to dictionaries with user information
        urls = [url.to_dict(include_user=True) for url in pagination.items]
        
        return jsonify({
            'urls': urls,
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            },
            'sort': {
                'sort_by': sort_by,
                'order': order
            }
        })
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

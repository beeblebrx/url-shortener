from flask import Blueprint, request, jsonify
from app.models import URL
from app.auth import require_user_auth, get_current_user
from app.utils import generate_short_code, is_valid_url, build_short_url
from app import db

user_bp = Blueprint('user', __name__)

@user_bp.route('/auth-status', methods=['GET'])
@require_user_auth
def auth_status():
    """Check authentication status and return current user info"""
    current_user = get_current_user()
    return jsonify({
        'authenticated': True,
        'username': current_user.username,
    })

@user_bp.route('/shorten', methods=['POST'])
@require_user_auth
def shorten_url():
    """Create a shortened URL (requires user authentication)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'JSON data is required'}), 400
        
        original_url = data.get('url')
        is_permanent = data.get('permanent', False)
        
        # Validate required fields
        if not original_url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Validate URL format
        if not is_valid_url(original_url):
            return jsonify({'error': 'Invalid URL format'}), 400
        
        # Get current user
        current_user = get_current_user()
        
        # Generate unique short code
        try:
            short_code = generate_short_code()
        except Exception as e:
            return jsonify({'error': 'Could not generate unique short code'}), 500
        
        # Create new URL entry
        url = URL(
            original_url=original_url,
            short_code=short_code,
            user_id=current_user.id,
            is_permanent=is_permanent
        )
        
        # Save to database
        db.session.add(url)
        db.session.commit()
        
        # Build response
        short_url = build_short_url(short_code, request)
        
        response_data = {
            'short_url': short_url,
            'short_code': short_code,
            'original_url': original_url,
            'created_at': url.created_at.isoformat(),
            'is_permanent': url.is_permanent
        }
        
        # Add expiration info if not permanent
        if not url.is_permanent:
            response_data['expires_at'] = url.expires_at.isoformat()
        
        return jsonify(response_data), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@user_bp.route('/my-urls', methods=['GET'])
@require_user_auth
def get_my_urls():
    """Get all URLs created by the current user"""
    try:
        current_user = get_current_user()
        
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
        query = URL.query.filter_by(user_id=current_user.id)
        
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
        
        # Convert URLs to dictionaries
        urls = [url.to_dict() for url in pagination.items]
        
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

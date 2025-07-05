from flask import Blueprint, redirect, jsonify, abort
from app.models import URL
from app import db

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

@public_bp.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'url-shortener'})

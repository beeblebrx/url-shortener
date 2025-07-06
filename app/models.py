from datetime import datetime, timedelta, timezone
from app import db
import os

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    access_token = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationship with URLs
    urls = db.relationship('URL', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'

class Admin(db.Model):
    __tablename__ = 'admins'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    access_token = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    is_active = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<Admin {self.username}>'

class URL(db.Model):
    __tablename__ = 'urls'
    
    id = db.Column(db.Integer, primary_key=True)
    original_url = db.Column(db.Text, nullable=False)
    short_code = db.Column(db.String(10), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = db.Column(db.DateTime(timezone=True), nullable=True)
    is_permanent = db.Column(db.Boolean, default=False)
    click_count = db.Column(db.Integer, default=0)
    last_accessed = db.Column(db.DateTime(timezone=True), nullable=True)
    
    def __init__(self, **kwargs):
        super(URL, self).__init__(**kwargs)
        if not self.is_permanent and not self.expires_at:
            # Set default expiration to 6 months from now
            expiration_months = int(os.getenv('DEFAULT_EXPIRATION_MONTHS', 6))
            self.expires_at = datetime.now(timezone.utc) + timedelta(days=30 * expiration_months)
    
    @property
    def is_expired(self):
        """Check if the URL has expired"""
        if self.is_permanent:
            return False
        return self.expires_at and datetime.now(timezone.utc) > self.expires_at
    
    def increment_click_count(self):
        """Increment click count and update last accessed time"""
        self.click_count += 1
        self.last_accessed = datetime.now(timezone.utc)
        db.session.commit()
    
    def to_dict(self, include_user=False):
        """Convert URL object to dictionary for JSON responses"""
        result = {
            'original_url': self.original_url,
            'short_code': self.short_code,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_permanent': self.is_permanent,
            'click_count': self.click_count,
            'last_accessed': self.last_accessed.isoformat() if self.last_accessed else None
        }
        
        if include_user and self.user:
            result['user'] = {
                'username': self.user.username
            }
        
        return result
    
    def __repr__(self):
        return f'<URL {self.short_code}: {self.original_url}>'

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration class"""
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("No SECRET_KEY set for the application")
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://username:password@localhost:5432/url_shortener')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Application settings
    DEFAULT_EXPIRATION_MONTHS = int(os.getenv('DEFAULT_EXPIRATION_MONTHS', 6))
    SHORT_CODE_LENGTH = int(os.getenv('SHORT_CODE_LENGTH', 6))

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    FLASK_ENV = 'development'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    FLASK_ENV = 'production'

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

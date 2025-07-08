from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

def create_app(config_name=None):
    app = Flask(__name__)
    
    # Load configuration
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    from app.config import config
    app.config.from_object(config[config_name])
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Configure CORS
    CORS(app, 
         origins=['http://localhost:3000', 'http://192.168.1.242:3000'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         supports_credentials=True)
    
    # Import models to ensure they're registered with SQLAlchemy
    from app import models
    
    # Register blueprints
    from app.routes.public import public_bp
    from app.routes.user import user_bp
    from app.routes.admin import admin_bp
    
    app.register_blueprint(public_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')
    
    return app

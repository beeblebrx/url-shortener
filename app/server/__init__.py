from flask import Flask, send_from_directory, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()


def create_app(config_name=None):
    app = Flask(__name__, static_folder="../static", static_url_path="/static")

    # Load configuration
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development")

    from .config import config

    app.config.from_object(config[config_name])

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)

    # Configure CORS
    CORS(
        app,
        origins=["*"],  # Allow all origins (in production ALB will handle this)
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        supports_credentials=True,
    )

    # Import models to ensure they're registered with SQLAlchemy
    from . import models

    # Serve React frontend
    @app.route("/")
    def serve_frontend():
        return send_file(os.path.join(app.static_folder, "index.html"))

    # Register blueprints
    from .routes.public import public_bp
    from .routes.user import user_bp
    from .routes.admin import admin_bp

    app.register_blueprint(public_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(admin_bp, url_prefix="/admin")

    return app

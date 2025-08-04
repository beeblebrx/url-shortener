import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """Base configuration class"""

    SECRET_KEY = os.getenv("SECRET_KEY")
    if not SECRET_KEY:
        raise ValueError("No SECRET_KEY set for the application")

    # Database configuration - support both DATABASE_URL and individual components
    DATABASE_URL = os.getenv("DATABASE_URL")
    if DATABASE_URL:
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        # Build DATABASE_URL from individual components (for AWS deployment)
        db_host = os.getenv("DATABASE_HOST", "localhost")
        db_port = os.getenv("DATABASE_PORT", "5432")
        db_name = os.getenv("DATABASE_NAME", "url_shortener")
        db_user = os.getenv("DATABASE_USER", "username")
        db_password = os.getenv("DATABASE_PASSWORD", "password")
        SQLALCHEMY_DATABASE_URI = (
            f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Application settings
    DEFAULT_EXPIRATION_MONTHS = int(os.getenv("DEFAULT_EXPIRATION_MONTHS", 6))
    SHORT_CODE_LENGTH = int(os.getenv("SHORT_CODE_LENGTH", 6))


class DevelopmentConfig(Config):
    """Development configuration"""

    DEBUG = True
    FLASK_ENV = "development"


class ProductionConfig(Config):
    """Production configuration"""

    DEBUG = False
    FLASK_ENV = "production"


# Configuration dictionary
config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}

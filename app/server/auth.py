from functools import wraps
from flask import request, jsonify, g
from app.server.models import User, Admin
import jwt
import os
from datetime import datetime, timedelta, timezone

SECRET_KEY = os.getenv("SECRET_KEY")


def generate_jwt(username, role, access_token):
    """Generate JWT"""
    payload = {
        "username": username,
        "role": role,
        "access_token": access_token,
        "exp": datetime.now(timezone.utc) + timedelta(days=1),  # Token expires in 1 day
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def require_user_auth(f):
    """Decorator to require user authentication"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.cookies.get("auth_token")

        if not token:
            return jsonify({"error": "Authentication required"}), 401

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            username = payload["username"]
            role = payload["role"]
            access_token = payload["access_token"]

            if role != "user":
                return jsonify({"error": "Invalid token role"}), 401

            user = User.query.filter_by(
                username=username, access_token=access_token, is_active=True
            ).first()
            if not user:
                return jsonify({"error": "Invalid or inactive user token"}), 401

            g.current_user = user
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated_function


def require_admin_auth(f):
    """Decorator to require admin authentication"""

    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.cookies.get("auth_token")

        if not token:
            return jsonify({"error": "Authentication required"}), 401

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            username = payload["username"]
            role = payload["role"]
            access_token = payload["access_token"]

            if role != "admin":
                return jsonify({"error": "Invalid token role"}), 401

            admin = Admin.query.filter_by(
                username=username, access_token=access_token, is_active=True
            ).first()
            if not admin:
                return jsonify({"error": "Invalid or inactive admin token"}), 401

            g.current_admin = admin
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Session has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated_function


def get_current_user():
    """Get the current authenticated user"""
    return getattr(g, "current_user", None)


def get_current_admin():
    """Get the current authenticated admin"""
    return getattr(g, "current_admin", None)

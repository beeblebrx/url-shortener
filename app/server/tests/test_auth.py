import pytest
from unittest.mock import patch, MagicMock
from flask import g, Flask
from app.server.auth import (
    generate_jwt,
    require_user_auth,
    require_admin_auth,
    get_current_user,
    get_current_admin,
)
import jwt
import os
from datetime import datetime, timedelta, timezone


@pytest.fixture
def app():
    """Create a Flask app context for tests."""
    app = Flask(__name__)
    app.config["TESTING"] = True
    app.config["SECRET_KEY"] = "testing-key"
    with app.app_context():
        yield app


def test_generate_jwt(app):
    """Test JWT generation."""
    username = "testuser"
    role = "user"
    access_token = "test_token"
    token = generate_jwt(username, role, access_token)
    decoded_payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
    assert decoded_payload["username"] == username
    assert decoded_payload["role"] == role
    assert decoded_payload["access_token"] == access_token


@patch("app.server.auth.User")
def test_require_user_auth_success(mock_user, app):
    """Test user authentication success."""
    mock_user.query.filter_by.return_value.first.return_value = MagicMock(
        username="testuser", access_token="test_token", is_active=True
    )

    @require_user_auth
    def dummy_route():
        return "Success", 200

    with app.test_request_context(
        headers={
            "Cookie": f'auth_token={generate_jwt("testuser", "user", "test_token")}'
        }
    ):
        response, status_code = dummy_route()
        assert status_code == 200
        assert g.current_user is not None


def test_require_user_auth_no_token(app):
    """Test user authentication with no token."""

    @require_user_auth
    def dummy_route():
        return "Success", 200

    with app.test_request_context():
        response, status_code = dummy_route()
        assert status_code == 401
        assert response.json["error"] == "Authentication required"


@patch("app.server.auth.Admin")
def test_require_admin_auth_success(mock_admin, app):
    """Test admin authentication success."""
    mock_admin.query.filter_by.return_value.first.return_value = MagicMock(
        username="admin", access_token="admin_token", is_active=True
    )

    @require_admin_auth
    def dummy_route():
        return "Success", 200

    with app.test_request_context(
        headers={
            "Cookie": f'auth_token={generate_jwt("admin", "admin", "admin_token")}'
        }
    ):
        response, status_code = dummy_route()
        assert status_code == 200
        assert g.current_admin is not None


def test_require_admin_auth_no_token(app):
    """Test admin authentication with no token."""

    @require_admin_auth
    def dummy_route():
        return "Success", 200

    with app.test_request_context():
        response, status_code = dummy_route()
        assert status_code == 401
        assert response.json["error"] == "Authentication required"


def test_get_current_user(app):
    """Test getting the current user."""
    with app.app_context():
        g.current_user = "test_user"
        assert get_current_user() == "test_user"
        del g.current_user
        assert get_current_user() is None


def test_get_current_admin(app):
    """Test getting the current admin."""
    with app.app_context():
        g.current_admin = "test_admin"
        assert get_current_admin() == "test_admin"
        del g.current_admin
        assert get_current_admin() is None


def test_require_user_auth_wrong_role(app):
    """Test user authentication with wrong role."""

    @require_user_auth
    def dummy_route():
        return "Success", 200

    with app.test_request_context(
        headers={
            "Cookie": f'auth_token={generate_jwt("testadmin", "admin", "test_token")}'
        }
    ):
        response, status_code = dummy_route()
        assert status_code == 401
        assert response.json["error"] == "Invalid token role"


@patch("app.server.auth.User")
def test_require_user_auth_inactive_user(mock_user, app):
    """Test user authentication with inactive user."""
    mock_user.query.filter_by.return_value.first.return_value = None

    @require_user_auth
    def dummy_route():
        return "Success", 200

    with app.test_request_context(
        headers={
            "Cookie": f'auth_token={generate_jwt("testuser", "user", "test_token")}'
        }
    ):
        response, status_code = dummy_route()
        assert status_code == 401
        assert response.json["error"] == "Invalid or inactive user token"


def test_require_user_auth_expired_token(app):
    """Test user authentication with an expired token."""
    expired_token = jwt.encode(
        {
            "username": "testuser",
            "role": "user",
            "access_token": "test_token",
            "exp": datetime.now(timezone.utc) - timedelta(seconds=1),
        },
        app.config["SECRET_KEY"],
        algorithm="HS256",
    )

    @require_user_auth
    def dummy_route():
        return "Success", 200

    with app.test_request_context(headers={"Cookie": f"auth_token={expired_token}"}):
        try:
            dummy_route()
        except jwt.ExpiredSignatureError:
            # This is the expected exception
            pass
        except Exception as e:
            pytest.fail(f"Unexpected exception raised: {e}")


def test_require_user_auth_invalid_token(app):
    """Test user authentication with an invalid token."""

    @require_user_auth
    def dummy_route():
        return "Success", 200

    with app.test_request_context(headers={"Cookie": "auth_token=invalidtoken"}):
        response, status_code = dummy_route()
        assert status_code == 401
        assert response.json["error"] == "Invalid token"


def test_require_admin_auth_wrong_role(app):
    """Test admin authentication with wrong role."""

    @require_admin_auth
    def dummy_route():
        return "Success", 200

    with app.test_request_context(
        headers={
            "Cookie": f'auth_token={generate_jwt("testuser", "user", "test_token")}'
        }
    ):
        response, status_code = dummy_route()
        assert status_code == 401
        assert response.json["error"] == "Invalid token role"


@patch("app.server.auth.Admin")
def test_require_admin_auth_inactive_admin(mock_admin, app):
    """Test admin authentication with inactive admin."""
    mock_admin.query.filter_by.return_value.first.return_value = None

    @require_admin_auth
    def dummy_route():
        return "Success", 200

    with app.test_request_context(
        headers={
            "Cookie": f'auth_token={generate_jwt("admin", "admin", "admin_token")}'
        }
    ):
        response, status_code = dummy_route()
        assert status_code == 401
        assert response.json["error"] == "Invalid or inactive admin token"


def test_require_admin_auth_expired_token(app):
    """Test admin authentication with an expired token."""
    expired_token = jwt.encode(
        {
            "username": "admin",
            "role": "admin",
            "access_token": "admin_token",
            "exp": datetime.now(timezone.utc) - timedelta(seconds=1),
        },
        app.config["SECRET_KEY"],
        algorithm="HS256",
    )

    @require_admin_auth
    def dummy_route():
        return "Success", 200

    with app.test_request_context(headers={"Cookie": f"auth_token={expired_token}"}):
        try:
            dummy_route()
        except jwt.ExpiredSignatureError:
            # This is the expected exception
            pass
        except Exception as e:
            pytest.fail(f"Unexpected exception raised: {e}")


def test_require_admin_auth_invalid_token(app):
    """Test admin authentication with an invalid token."""

    @require_admin_auth
    def dummy_route():
        return "Success", 200

    with app.test_request_context(headers={"Cookie": "auth_token=invalidtoken"}):
        response, status_code = dummy_route()
        assert status_code == 401
        assert response.json["error"] == "Invalid token"

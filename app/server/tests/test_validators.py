import pytest
import pytest
from app.server.validators import (
    validate_username,
    validate_password,
    validate_credentials,
    MINIMUM_USERNAME_LENGTH,
)


@pytest.mark.parametrize(
    "username",
    [
        "user",
        "testuser",
        "user123",
        "test_user",
        "a" * MINIMUM_USERNAME_LENGTH,
        "a" * 20,
    ],
)
def test_validate_username_valid(username):
    """Test valid usernames"""
    is_valid, error = validate_username(username)
    assert is_valid
    assert error is None


def test_validate_username_empty():
    """Test empty username"""
    is_valid, error = validate_username("")
    assert not is_valid
    assert error == "Empty username"


@pytest.mark.parametrize("username", [" ", "  ", "\t", "\n", "   \t  \n  "])
def test_validate_username_whitespace_only(username):
    """Test username with only whitespace"""
    is_valid, error = validate_username(username)
    assert not is_valid
    assert error == "Empty username"


@pytest.mark.parametrize(
    "username", ["a", "ab", "abc", "a" * (MINIMUM_USERNAME_LENGTH - 1)]
)
def test_validate_username_too_short(username):
    """Test usernames that are too short"""
    is_valid, error = validate_username(username)
    assert not is_valid
    assert error == "Too short username"


@pytest.mark.parametrize(
    "username, should_be_valid",
    [
        (" user ", True),
        ("  testuser  ", True),
        ("   ab   ", False),
        ("   a   ", False),
    ],
)
def test_validate_username_with_whitespace(username, should_be_valid):
    """Test usernames with leading/trailing whitespace"""
    is_valid, error = validate_username(username)
    if should_be_valid:
        assert is_valid
        assert error is None
    else:
        assert not is_valid
        assert error == "Too short username"


@pytest.mark.parametrize(
    "password",
    [
        "Password1",
        "MySecure123",
        "Test1234",
        "Abcdefgh1",
        "ComplexPass123",
        "A1bcdefgh",
        "Password123456789",
    ],
)
def test_validate_password_valid(password):
    """Test valid passwords"""
    is_valid, error = validate_password(password)
    assert is_valid
    assert error is None


@pytest.mark.parametrize("password", ["Pass1", "Ab1", "Test12", "Abcd123"])
def test_validate_password_too_short(password):
    """Test passwords that are too short"""
    is_valid, error = validate_password(password)
    assert not is_valid
    assert (
        error
        == "Password must be at least 8 characters long and have lower and uppercase letters and numbers"
    )


@pytest.mark.parametrize("password", ["PASSWORD1", "MYTEST123", "ABCDEFGH1"])
def test_validate_password_missing_lowercase(password):
    """Test passwords missing lowercase letters"""
    is_valid, error = validate_password(password)
    assert not is_valid
    assert (
        error
        == "Password must be at least 8 characters long and have lower and uppercase letters and numbers"
    )


@pytest.mark.parametrize("password", ["password1", "mytest123", "abcdefgh1"])
def test_validate_password_missing_uppercase(password):
    """Test passwords missing uppercase letters"""
    is_valid, error = validate_password(password)
    assert not is_valid
    assert (
        error
        == "Password must be at least 8 characters long and have lower and uppercase letters and numbers"
    )


@pytest.mark.parametrize("password", ["Password", "MyTestPass", "AbcdefghI"])
def test_validate_password_missing_numbers(password):
    """Test passwords missing numbers"""
    is_valid, error = validate_password(password)
    assert not is_valid
    assert (
        error
        == "Password must be at least 8 characters long and have lower and uppercase letters and numbers"
    )


@pytest.mark.parametrize("password", ["Abcdefgh", "TestPassword", "MySecurePass"])
def test_validate_password_only_letters(password):
    """Test passwords with only letters (no numbers)"""
    is_valid, error = validate_password(password)
    assert not is_valid
    assert (
        error
        == "Password must be at least 8 characters long and have lower and uppercase letters and numbers"
    )


@pytest.mark.parametrize("password", ["12345678", "123456789"])
def test_validate_password_only_numbers(password):
    """Test passwords with only numbers"""
    is_valid, error = validate_password(password)
    assert not is_valid
    assert (
        error
        == "Password must be at least 8 characters long and have lower and uppercase letters and numbers"
    )


def test_validate_password_empty():
    """Test empty password"""
    is_valid, error = validate_password("")
    assert not is_valid
    assert (
        error
        == "Password must be at least 8 characters long and have lower and uppercase letters and numbers"
    )


@pytest.mark.parametrize(
    "username, password",
    [
        ("user", "Password1"),
        ("testuser", "MySecure123"),
        ("admin", "Test1234"),
        ("longusername", "ComplexPass123"),
    ],
)
def test_validate_credentials_valid(username, password):
    """Test valid username and password combinations"""
    is_valid, error = validate_credentials(username, password)
    assert is_valid
    assert error is None


@pytest.mark.parametrize(
    "username, password, expected_error",
    [
        ("", "Password1", "Empty username"),
        ("ab", "Password1", "Too short username"),
        ("   ", "Password1", "Empty username"),
    ],
)
def test_validate_credentials_invalid_username(username, password, expected_error):
    """Test invalid username with valid password"""
    is_valid, error = validate_credentials(username, password)
    assert not is_valid
    assert error == expected_error


@pytest.mark.parametrize(
    "username, password",
    [
        ("user", "pass"),
        ("testuser", "password"),
        ("admin", "PASSWORD1"),
        ("longusername", "Password"),
    ],
)
def test_validate_credentials_invalid_password(username, password):
    """Test valid username with invalid password"""
    is_valid, error = validate_credentials(username, password)
    assert not is_valid
    assert (
        error
        == "Password must be at least 8 characters long and have lower and uppercase letters and numbers"
    )


@pytest.mark.parametrize(
    "username, password", [("", "pass"), ("ab", "short"), ("   ", "password")]
)
def test_validate_credentials_both_invalid(username, password):
    """Test invalid username and password"""
    is_valid, _ = validate_credentials(username, password)
    assert not is_valid

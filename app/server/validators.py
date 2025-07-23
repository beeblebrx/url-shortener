import re

MINIMUM_USERNAME_LENGTH = 4


def validate_username(username):
    username_length = len(username.strip())
    if username_length == 0:
        return False, "Empty username"

    if username_length < MINIMUM_USERNAME_LENGTH:
        return False, "Too short username"

    return True, None


def validate_password(password):
    if not re.match("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$", password):
        return (
            False,
            "Password must be at least 8 characters long and have lower and uppercase letters and numbers",
        )

    return True, None


def validate_credentials(username, password):
    """
    Validate both username and password credentials.

    Returns:
        tuple: (True, None) if all validations pass, or (False, error_message) for the first failure
    """
    # Validate username first
    username_valid, username_error = validate_username(username)
    if not username_valid:
        return False, username_error

    # Validate password if username is valid
    password_valid, password_error = validate_password(password)
    if not password_valid:
        return False, password_error

    # All validations passed
    return True, None

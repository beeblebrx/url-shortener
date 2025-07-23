import unittest
import sys
import os

# Add the parent directory to the path so we can import the validators module directly
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "app"))

# Import directly from validators module to avoid Flask dependencies
import validators

validate_username = validators.validate_username
validate_password = validators.validate_password
validate_credentials = validators.validate_credentials
MINIMUM_USERNAME_LENGTH = validators.MINIMUM_USERNAME_LENGTH


class TestValidateUsername(unittest.TestCase):
    """Test cases for validate_username function"""

    def test_valid_username(self):
        """Test valid usernames"""
        valid_usernames = [
            "user",
            "testuser",
            "user123",
            "test_user",
            "a" * MINIMUM_USERNAME_LENGTH,
            "a" * 20,  # longer username
        ]

        for username in valid_usernames:
            with self.subTest(username=username):
                is_valid, error = validate_username(username)
                self.assertTrue(is_valid)
                self.assertIsNone(error)

    def test_empty_username(self):
        """Test empty username"""
        is_valid, error = validate_username("")
        self.assertFalse(is_valid)
        self.assertEqual(error, "Empty username")

    def test_whitespace_only_username(self):
        """Test username with only whitespace"""
        whitespace_usernames = [
            " ",
            "  ",
            "\t",
            "\n",
            "   \t  \n  ",
        ]

        for username in whitespace_usernames:
            with self.subTest(username=repr(username)):
                is_valid, error = validate_username(username)
                self.assertFalse(is_valid)
                self.assertEqual(error, "Empty username")

    def test_too_short_username(self):
        """Test usernames that are too short"""
        short_usernames = [
            "a",
            "ab",
            "abc",
            "a" * (MINIMUM_USERNAME_LENGTH - 1),
        ]

        for username in short_usernames:
            with self.subTest(username=username):
                is_valid, error = validate_username(username)
                self.assertFalse(is_valid)
                self.assertEqual(error, "Too short username")

    def test_username_with_leading_trailing_whitespace(self):
        """Test usernames with leading/trailing whitespace that become valid after stripping"""
        test_cases = [
            (" user ", True),  # Valid after stripping
            ("  testuser  ", True),  # Valid after stripping
            ("   ab   ", False),  # Still too short after stripping
            ("   a   ", False),  # Still too short after stripping
        ]

        for username, should_be_valid in test_cases:
            with self.subTest(username=repr(username)):
                is_valid, error = validate_username(username)
                if should_be_valid:
                    self.assertTrue(is_valid)
                    self.assertIsNone(error)
                else:
                    self.assertFalse(is_valid)
                    self.assertEqual(error, "Too short username")


class TestValidatePassword(unittest.TestCase):
    """Test cases for validate_password function"""

    def test_valid_password(self):
        """Test valid passwords"""
        valid_passwords = [
            "Password1",
            "MySecure123",
            "Test1234",
            "Abcdefgh1",
            "ComplexPass123",
            "A1bcdefgh",
            "Password123456789",  # longer password
        ]

        for password in valid_passwords:
            with self.subTest(password=password):
                is_valid, error = validate_password(password)
                self.assertTrue(is_valid)
                self.assertIsNone(error)

    def test_password_too_short(self):
        """Test passwords that are too short"""
        short_passwords = [
            "Pass1",
            "Ab1",
            "Test12",
            "Abcd123",  # 7 characters
        ]

        expected_error = "Password must be at least 8 characters long and have lower and uppercase letters and numbers"

        for password in short_passwords:
            with self.subTest(password=password):
                is_valid, error = validate_password(password)
                self.assertFalse(is_valid)
                self.assertEqual(error, expected_error)

    def test_password_missing_lowercase(self):
        """Test passwords missing lowercase letters"""
        passwords_no_lowercase = [
            "PASSWORD1",
            "MYTEST123",
            "ABCDEFGH1",
        ]

        expected_error = "Password must be at least 8 characters long and have lower and uppercase letters and numbers"

        for password in passwords_no_lowercase:
            with self.subTest(password=password):
                is_valid, error = validate_password(password)
                self.assertFalse(is_valid)
                self.assertEqual(error, expected_error)

    def test_password_missing_uppercase(self):
        """Test passwords missing uppercase letters"""
        passwords_no_uppercase = [
            "password1",
            "mytest123",
            "abcdefgh1",
        ]

        expected_error = "Password must be at least 8 characters long and have lower and uppercase letters and numbers"

        for password in passwords_no_uppercase:
            with self.subTest(password=password):
                is_valid, error = validate_password(password)
                self.assertFalse(is_valid)
                self.assertEqual(error, expected_error)

    def test_password_missing_numbers(self):
        """Test passwords missing numbers"""
        passwords_no_numbers = [
            "Password",
            "MyTestPass",
            "AbcdefghI",
        ]

        expected_error = "Password must be at least 8 characters long and have lower and uppercase letters and numbers"

        for password in passwords_no_numbers:
            with self.subTest(password=password):
                is_valid, error = validate_password(password)
                self.assertFalse(is_valid)
                self.assertEqual(error, expected_error)

    def test_password_only_letters(self):
        """Test passwords with only letters (no numbers)"""
        passwords_only_letters = [
            "Abcdefgh",
            "TestPassword",
            "MySecurePass",
        ]

        expected_error = "Password must be at least 8 characters long and have lower and uppercase letters and numbers"

        for password in passwords_only_letters:
            with self.subTest(password=password):
                is_valid, error = validate_password(password)
                self.assertFalse(is_valid)
                self.assertEqual(error, expected_error)

    def test_password_only_numbers(self):
        """Test passwords with only numbers"""
        passwords_only_numbers = [
            "12345678",
            "123456789",
        ]

        expected_error = "Password must be at least 8 characters long and have lower and uppercase letters and numbers"

        for password in passwords_only_numbers:
            with self.subTest(password=password):
                is_valid, error = validate_password(password)
                self.assertFalse(is_valid)
                self.assertEqual(error, expected_error)

    def test_empty_password(self):
        """Test empty password"""
        expected_error = "Password must be at least 8 characters long and have lower and uppercase letters and numbers"

        is_valid, error = validate_password("")
        self.assertFalse(is_valid)
        self.assertEqual(error, expected_error)


class TestValidateCredentials(unittest.TestCase):
    """Test cases for validate_credentials function"""

    def test_valid_credentials(self):
        """Test valid username and password combinations"""
        valid_combinations = [
            ("user", "Password1"),
            ("testuser", "MySecure123"),
            ("admin", "Test1234"),
            ("longusername", "ComplexPass123"),
        ]

        for username, password in valid_combinations:
            with self.subTest(username=username, password=password):
                is_valid, error = validate_credentials(username, password)
                self.assertTrue(is_valid)
                self.assertIsNone(error)

    def test_invalid_username_valid_password(self):
        """Test invalid username with valid password - should fail on username"""
        test_cases = [
            ("", "Password1", "Empty username"),
            ("ab", "Password1", "Too short username"),
            ("   ", "Password1", "Empty username"),
        ]

        for username, password, expected_error in test_cases:
            with self.subTest(username=repr(username), password=password):
                is_valid, error = validate_credentials(username, password)
                self.assertFalse(is_valid)
                self.assertEqual(error, expected_error)

    def test_valid_username_invalid_password(self):
        """Test valid username with invalid password - should fail on password"""
        expected_error = "Password must be at least 8 characters long and have lower and uppercase letters and numbers"

        test_cases = [
            ("user", "pass"),
            ("testuser", "password"),
            ("admin", "PASSWORD1"),
            ("longusername", "Password"),
        ]

        for username, password in test_cases:
            with self.subTest(username=username, password=password):
                is_valid, error = validate_credentials(username, password)
                self.assertFalse(is_valid)
                self.assertEqual(error, expected_error)

    def test_both_invalid_credentials(self):
        """Test invalid username and password"""
        test_cases = [
            ("", "pass"),
            ("ab", "short"),
            ("   ", "password"),
        ]

        for username, password in test_cases:
            with self.subTest(username=repr(username), password=password):
                is_valid, _ = validate_credentials(username, password)
                self.assertFalse(is_valid)


if __name__ == "__main__":
    unittest.main()

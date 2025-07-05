#!/usr/bin/env python3
"""
Script to create regular users for the URL shortener application.
Usage: python create_user.py --username <username>
"""

import argparse
import sys
from app import create_app, db
from app.models import User
from app.utils import generate_access_token
from app.auth import generate_jwt

def create_user(username):
    """Create a new user with a generated access token"""
    app = create_app()
    
    with app.app_context():
        # Check if user already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            print(f"Error: User '{username}' already exists!")
            return False
        
        # Generate access token
        access_token = generate_access_token()
        
        # Create new user
        user = User(
            username=username,
            access_token=access_token
        )
        
        try:
            db.session.add(user)
            db.session.commit()

            # Generate JWT
            jwt_token = generate_jwt(username, 'user', access_token)
            
            print(f"User created successfully!")
            print(f"Username: {username}")
            print(f"JWT Token: {jwt_token}")
            print(f"User ID: {user.id}")
            print(f"Created At: {user.created_at}")
            print("\nSave this JWT token securely - it won't be shown again!")
            
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating user: {str(e)}")
            return False

def main():
    parser = argparse.ArgumentParser(description='Create a new user for the URL shortener')
    parser.add_argument('--username', required=True, help='Username for the new user')
    
    args = parser.parse_args()
    
    if not args.username.strip():
        print("Error: Username cannot be empty!")
        sys.exit(1)
    
    success = create_user(args.username.strip())
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()

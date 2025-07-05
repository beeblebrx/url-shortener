#!/usr/bin/env python3
"""
Script to create admin users for the URL shortener application.
Usage: python create_admin.py --username <username>
"""

import argparse
import sys
from app import create_app, db
from app.models import Admin
from app.utils import generate_access_token

def create_admin(username):
    """Create a new admin with a generated access token"""
    app = create_app()
    
    with app.app_context():
        # Check if admin already exists
        existing_admin = Admin.query.filter_by(username=username).first()
        if existing_admin:
            print(f"Error: Admin '{username}' already exists!")
            return False
        
        # Generate access token
        access_token = generate_access_token()
        
        # Create new admin
        admin = Admin(
            username=username,
            access_token=access_token
        )
        
        try:
            db.session.add(admin)
            db.session.commit()
            
            print(f"Admin created successfully!")
            print(f"Username: {username}")
            print(f"Access Token: {access_token}")
            print(f"Admin ID: {admin.id}")
            print(f"Created At: {admin.created_at}")
            print("\nSave this access token securely - it won't be shown again!")
            print("This token provides full administrative access to the system.")
            
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating admin: {str(e)}")
            return False

def main():
    parser = argparse.ArgumentParser(description='Create a new admin for the URL shortener')
    parser.add_argument('--username', required=True, help='Username for the new admin')
    
    args = parser.parse_args()
    
    if not args.username.strip():
        print("Error: Username cannot be empty!")
        sys.exit(1)
    
    success = create_admin(args.username.strip())
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()

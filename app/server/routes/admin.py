from flask import Blueprint, request, jsonify
from datetime import datetime
from app.server.models import URL, User
from app.server.auth import require_admin_auth
from app.server import db

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/cleanup", methods=["DELETE"])
@require_admin_auth
def cleanup_expired_urls():
    """Remove expired URLs from the database (admin only)"""
    try:
        current_time = datetime.utcnow()

        # Find all expired URLs (non-permanent URLs that have passed their expiration date)
        expired_urls = URL.query.filter(
            URL.is_permanent == False, URL.expires_at < current_time
        ).all()

        # Count expired URLs before deletion
        expired_count = len(expired_urls)

        # Delete expired URLs
        for url in expired_urls:
            db.session.delete(url)

        # Commit the changes
        db.session.commit()

        return jsonify(
            {
                "message": f"Successfully cleaned up {expired_count} expired URLs",
                "deleted_count": expired_count,
                "cleanup_time": current_time.isoformat(),
            }
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error during cleanup"}), 500


@admin_bp.route("/stats", methods=["GET"])
@require_admin_auth
def get_system_stats():
    """Get system-wide statistics (admin only)"""
    try:
        current_time = datetime.utcnow()

        # Total URLs
        total_urls = URL.query.count()

        # Active URLs (non-expired)
        active_urls = URL.query.filter(
            db.or_(URL.is_permanent == True, URL.expires_at > current_time)
        ).count()

        # Expired URLs
        expired_urls = URL.query.filter(
            URL.is_permanent == False, URL.expires_at < current_time
        ).count()

        # Permanent URLs
        permanent_urls = URL.query.filter_by(is_permanent=True).count()

        # Total clicks
        total_clicks = db.session.query(db.func.sum(URL.click_count)).scalar() or 0

        # Total users
        total_users = User.query.count()

        # Active users (users with at least one URL)
        active_users = db.session.query(User.id).join(URL).distinct().count()

        return jsonify(
            {
                "urls": {
                    "total": total_urls,
                    "active": active_urls,
                    "expired": expired_urls,
                    "permanent": permanent_urls,
                },
                "clicks": {"total": total_clicks},
                "users": {"total": total_users, "active": active_users},
                "generated_at": current_time.isoformat(),
            }
        )

    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@admin_bp.route("/urls", methods=["GET"])
@require_admin_auth
def list_all_urls():
    """List all URLs with pagination and sorting"""
    try:
        # Get pagination parameters
        page = request.args.get("page", 1, type=int)
        per_page = min(request.args.get("per_page", 20, type=int), 100)

        # Get sorting parameters
        sort_by = request.args.get("sort_by", "created_at")
        order = request.args.get("order", "desc")

        # Validate sort_by parameter
        valid_sort_fields = ["created_at", "expires_at", "click_count", "short_code"]
        if sort_by not in valid_sort_fields:
            return (
                jsonify(
                    {
                        "error": f"Invalid sort_by field. Valid options: {valid_sort_fields}"
                    }
                ),
                400,
            )

        # Validate order parameter
        if order not in ["asc", "desc"]:
            return jsonify({"error": "Invalid order. Valid options: asc, desc"}), 400

        # Build query
        query = URL.query

        # Apply sorting
        sort_column = getattr(URL, sort_by)
        if order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        # Apply pagination
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        # Convert URLs to dictionaries with user information
        urls = [url.to_dict(include_user=True) for url in pagination.items]

        return jsonify(
            {
                "urls": urls,
                "pagination": {
                    "page": pagination.page,
                    "per_page": pagination.per_page,
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "has_next": pagination.has_next,
                    "has_prev": pagination.has_prev,
                },
                "sort": {"sort_by": sort_by, "order": order},
            }
        )

    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500


@admin_bp.route("/users", methods=["GET"])
@require_admin_auth
def list_users():
    """List all users with their URL counts (admin only)"""
    try:
        # Get pagination parameters
        page = request.args.get("page", 1, type=int)
        per_page = min(request.args.get("per_page", 20, type=int), 100)

        # Build query with URL counts
        query = (
            db.session.query(User, db.func.count(URL.id).label("url_count"))
            .outerjoin(URL)
            .group_by(User.id)
            .order_by(User.created_at.desc())
        )

        # Apply pagination
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        # Convert to response format
        users = []
        for user, url_count in pagination.items:
            users.append(
                {
                    "id": user.id,
                    "username": user.username,
                    "created_at": user.created_at.isoformat(),
                    "is_active": user.is_active,
                    "url_count": url_count,
                }
            )

        return jsonify(
            {
                "users": users,
                "pagination": {
                    "page": pagination.page,
                    "per_page": pagination.per_page,
                    "total": pagination.total,
                    "pages": pagination.pages,
                    "has_next": pagination.has_next,
                    "has_prev": pagination.has_prev,
                },
            }
        )

    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

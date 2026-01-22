"""
User Management API routes.
Admin-only endpoints for managing users
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Optional
from backend.services.auth_service import AuthService, Role, InvalidTokenError, InsufficientPermissionsError


router = APIRouter(prefix="/users", tags=["User Management"])


class UserResponse(BaseModel):
    """User response model"""
    username: str
    roles: List[str]
    created_at: Optional[str] = None
    last_login: Optional[str] = None


class CreateUserRequest(BaseModel):
    """Create user request"""
    username: str
    password: str
    roles: List[str]


class ChangePasswordRequest(BaseModel):
    """Change password request"""
    username: str
    new_password: str


class UserListResponse(BaseModel):
    """User list response"""
    users: List[UserResponse]
    total: int


# In-memory user store (in production, use a real database)
USER_STORE = {
    "engineer": {"password": "engineer123", "roles": [Role.MAINTENANCE_ENGINEER], "created_at": "2024-01-01T00:00:00"},
    "manager": {"password": "manager123", "roles": [Role.STORE_MANAGER], "created_at": "2024-01-01T00:00:00"},
    "finance": {"password": "finance123", "roles": [Role.FINANCE_OFFICER], "created_at": "2024-01-01T00:00:00"},
    "admin": {"password": "admin123", "roles": [Role.ADMIN], "created_at": "2024-01-01T00:00:00"},
}


def get_auth_service() -> AuthService:
    """Dependency to get auth service"""
    return AuthService()


def require_admin(authorization: str = Header(None), auth_service: AuthService = Depends(get_auth_service)):
    """Dependency to require admin role"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        payload = auth_service.validate_token(token)
        if Role.ADMIN not in payload.roles:
            raise HTTPException(status_code=403, detail="Admin role required")
        return payload
    except InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("", response_model=UserListResponse)
async def list_users(
    _admin = Depends(require_admin),
):
    """
    List all users (admin only).
    """
    users = [
        UserResponse(
            username=username,
            roles=[r.value for r in user_data["roles"]],
            created_at=user_data.get("created_at"),
            last_login=user_data.get("last_login"),
        )
        for username, user_data in USER_STORE.items()
    ]
    
    return UserListResponse(
        users=users,
        total=len(users),
    )


@router.post("", response_model=UserResponse)
async def create_user(
    request: CreateUserRequest,
    _admin = Depends(require_admin),
):
    """
    Create a new user (admin only).
    """
    if request.username in USER_STORE:
        raise HTTPException(status_code=400, detail=f"User '{request.username}' already exists")
    
    # Validate roles
    try:
        roles = [Role(r) for r in request.roles]
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid role: {str(e)}")
    
    # Create user
    USER_STORE[request.username] = {
        "password": request.password,
        "roles": roles,
        "created_at": "2024-01-22T00:00:00",
    }
    
    return UserResponse(
        username=request.username,
        roles=request.roles,
        created_at="2024-01-22T00:00:00",
    )


@router.patch("/{username}/password")
async def change_password(
    username: str,
    request: ChangePasswordRequest,
    _admin = Depends(require_admin),
):
    """
    Change user password (admin only).
    """
    if username not in USER_STORE:
        raise HTTPException(status_code=404, detail=f"User '{username}' not found")
    
    USER_STORE[username]["password"] = request.new_password
    
    return {"message": f"Password changed successfully for user '{username}'"}


@router.delete("/{username}")
async def delete_user(
    username: str,
    _admin = Depends(require_admin),
):
    """
    Delete a user (admin only).
    """
    if username not in USER_STORE:
        raise HTTPException(status_code=404, detail=f"User '{username}' not found")
    
    if username == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete the admin user")
    
    del USER_STORE[username]
    
    return {"message": f"User '{username}' deleted successfully"}


@router.get("/{username}", response_model=UserResponse)
async def get_user(
    username: str,
    _admin = Depends(require_admin),
):
    """
    Get user details (admin only).
    """
    if username not in USER_STORE:
        raise HTTPException(status_code=404, detail=f"User '{username}' not found")
    
    user_data = USER_STORE[username]
    return UserResponse(
        username=username,
        roles=[r.value for r in user_data["roles"]],
        created_at=user_data.get("created_at"),
        last_login=user_data.get("last_login"),
    )

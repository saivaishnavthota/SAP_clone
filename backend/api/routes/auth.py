"""
Authentication API routes.
Requirements: 7.1 - JWT authentication endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List

from backend.services.auth_service import AuthService, Role, InvalidTokenError
from backend.api.routes.users import USER_STORE


router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    """Login request payload"""
    username: str
    password: str
    roles: List[str] = ["Maintenance_Engineer"]


class LoginResponse(BaseModel):
    """Login response with JWT token"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshRequest(BaseModel):
    """Token refresh request"""
    token: str


def get_auth_service() -> AuthService:
    """Dependency to get auth service"""
    return AuthService()


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Authenticate user and issue JWT token.
    Requirement 7.1 - Issue JWT with user_id, roles, expiration_time
    """
    # Strip whitespace from credentials
    username = request.username.strip()
    password = request.password.strip()
    
    # Check users from shared user store
    user = USER_STORE.get(username)
    
    if not user or user["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    token = auth_service.create_token(
        user_id=username,
        roles=user["roles"],
    )
    
    return LoginResponse(
        access_token=token,
        expires_in=auth_service.expiration_minutes * 60,
    )


@router.post("/refresh", response_model=LoginResponse)
async def refresh_token(
    request: RefreshRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Refresh an existing JWT token.
    """
    try:
        new_token = auth_service.refresh_token(request.token)
        return LoginResponse(
            access_token=new_token,
            expires_in=auth_service.expiration_minutes * 60,
        )
    except InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=str(e))

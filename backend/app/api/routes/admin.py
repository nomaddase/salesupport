from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.core.localization import translate
from app.core.security import get_password_hash
from app.db.session import get_db
from app.models.api_key import ApiKey
from app.models.user import User, UserRole
from app.schemas.api_key import (
    ApiKeyCreate,
    ApiKeyListResponse,
    ApiKeyRead,
    ApiKeyResponse,
    ApiKeyUpdate,
)
from app.schemas.auth import (
    UserCreate,
    UserListResponse,
    UserResponse,
    UserUpdate,
)
from app.services.api_keys import decrypt_api_key, encrypt_api_key

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=translate("forbidden")
        )
    return current_user


@router.get("/users", response_model=UserListResponse)
def list_users(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> UserListResponse:
    users = db.query(User).order_by(User.id).all()
    return UserListResponse(items=users, message=translate("users_list"))


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> UserResponse:
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=translate("email_already_registered"),
        )

    user = User(
        name=user_in.name,
        email=user_in.email,
        role=user_in.role,
        password_hash=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse(user=user, message=translate("user_created"))


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> UserResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=translate("user_not_found")
        )

    if user_in.email and user_in.email != user.email:
        if db.query(User).filter(User.email == user_in.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=translate("email_already_registered"),
            )
        user.email = user_in.email

    if user_in.name is not None:
        user.name = user_in.name
    if user_in.role is not None:
        user.role = user_in.role
    if user_in.password:
        user.password_hash = get_password_hash(user_in.password)

    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse(user=user, message=translate("user_updated"))


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=translate("user_not_found")
        )

    db.delete(user)
    db.commit()
    return {"message": translate("user_deleted")}


@router.get("/api-keys", response_model=ApiKeyListResponse)
def list_api_keys(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> ApiKeyListResponse:
    api_keys = db.query(ApiKey).order_by(ApiKey.id).all()
    items = [
        ApiKeyRead(
            id=api_key.id,
            name=api_key.name,
            service=api_key.service,
            key_value=decrypt_api_key(api_key.key_value),
            created_at=api_key.created_at,
            updated_at=api_key.updated_at,
        )
        for api_key in api_keys
    ]
    return ApiKeyListResponse(items=items, message=translate("api_keys_list"))


@router.post(
    "/api-keys",
    response_model=ApiKeyResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_api_key(
    api_key_in: ApiKeyCreate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> ApiKeyResponse:
    api_key = ApiKey(
        name=api_key_in.name,
        service=api_key_in.service,
        key_value=encrypt_api_key(api_key_in.key_value),
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)

    api_key_data = ApiKeyResponse(
        api_key=ApiKeyRead(
            id=api_key.id,
            name=api_key.name,
            service=api_key.service,
            key_value=api_key_in.key_value,
            created_at=api_key.created_at,
            updated_at=api_key.updated_at,
        ),
        message=translate("api_key_added"),
    )
    return api_key_data


@router.patch("/api-keys/{api_key_id}", response_model=ApiKeyResponse)
def update_api_key(
    api_key_id: int,
    api_key_in: ApiKeyUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> ApiKeyResponse:
    api_key = db.query(ApiKey).filter(ApiKey.id == api_key_id).first()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=translate("api_key_not_found"),
        )

    if api_key_in.name is not None:
        api_key.name = api_key_in.name
    if api_key_in.service is not None:
        api_key.service = api_key_in.service
    if api_key_in.key_value is not None:
        api_key.key_value = encrypt_api_key(api_key_in.key_value)

    db.add(api_key)
    db.commit()
    db.refresh(api_key)

    return ApiKeyResponse(
        api_key=ApiKeyRead(
            id=api_key.id,
            name=api_key.name,
            service=api_key.service,
            key_value=decrypt_api_key(api_key.key_value),
            created_at=api_key.created_at,
            updated_at=api_key.updated_at,
        ),
        message=translate("api_key_updated"),
    )


@router.delete("/api-keys/{api_key_id}")
def delete_api_key(
    api_key_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    api_key = db.query(ApiKey).filter(ApiKey.id == api_key_id).first()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=translate("api_key_not_found"),
        )

    db.delete(api_key)
    db.commit()
    return {"message": translate("api_key_deleted")}

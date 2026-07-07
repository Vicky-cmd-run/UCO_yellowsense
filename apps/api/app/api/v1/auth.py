from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import List

from app.db.session import get_db, Base, engine
from app.db.seed import seed_db
from app.models.models import User
from app.core.security import verify_password, create_access_token
from app.api.v1.deps import get_current_user

router = APIRouter()

class UserResponse(BaseModel):
    id: str
    employee_id: str
    name: str
    email: str
    role: str
    branch_id: str | None
    region_id: str | None
    status: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class LoginJSON(BaseModel):
    email: str
    password: str

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    # Support logging in by employee_id or email
    user = db.query(User).filter(
        (User.email == form_data.username) | (User.employee_id == form_data.username)
    ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email/employee ID or password"
        )
        
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login-json", response_model=Token)
def login_json(
    data: LoginJSON,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        (User.email == data.email) | (User.employee_id == data.email)
    ).first()
    
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email/employee ID or password"
        )
        
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).filter(User.status == "ACTIVE").all()

@router.post("/reset")
def reset_demo_database():
    try:
        print("Resetting database via API endpoint...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        db = SessionLocal = SessionLocal()
        try:
            seed_db(db)
        finally:
            db.close()
        return {"status": "success", "message": "Demo database successfully reset"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset database: {str(e)}"
        )

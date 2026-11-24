from datetime import datetime, timezone
from typing import Optional
from enum import Enum
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = Field(default="user")
    is_active: bool = Field(default=True)

class CategoryEnum(str, Enum):
    MAINTENANCE = "Maintenance"
    EMERGENCY = "Urgent"
    INFO = "General"
    DEPLOYMENT = "Deployment"

class AnnouncementBase(SQLModel):
    title: str = Field(max_length=100, schema_extra={"example": "System Maintenance Notification"})
    content: str
    category: CategoryEnum
    target_hosts: Optional[str] = Field(default=None, schema_extra={"example": "esxi-01, web-server-02"})
    is_active: bool = True

class Announcement(AnnouncementBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementUpdate(SQLModel):
    title: Optional[str] = Field(default=None, max_length=100)
    content: Optional[str] = None
    category: Optional[CategoryEnum] = None
    target_hosts: Optional[str] = None
    is_active: Optional[bool] = None

class FaqBase(SQLModel):
    question: str = Field(max_length=255)
    answer: str
    is_active: bool = True

class Faq(FaqBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FaqCreate(FaqBase):
    pass

class FaqUpdate(SQLModel):
    question: Optional[str] = Field(default=None, max_length=255)
    answer: Optional[str] = None
    is_active: Optional[bool] = None

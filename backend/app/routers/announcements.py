from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from backend.app.database import get_session
from backend.app.models import (
    Announcement, 
    AnnouncementCreate, 
    AnnouncementUpdate, 
    CategoryEnum,
    User
)
from backend.app.auth import get_current_user

router = APIRouter(
    prefix="/announcements",
    tags=["announcements"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Announcement)
async def create_announcement(
    announcement: AnnouncementCreate, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_announcement = Announcement.model_validate(announcement)
    session.add(db_announcement)
    await session.commit()
    await session.refresh(db_announcement)
    return db_announcement

@router.get("/", response_model=List[Announcement])
async def read_announcements(
    category: Optional[CategoryEnum] = None, 
    session: AsyncSession = Depends(get_session)
):
    query = select(Announcement)
    if category:
        query = query.where(Announcement.category == category)
    result = await session.exec(query)
    announcements = result.all()
    return announcements

@router.patch("/{announcement_id}", response_model=Announcement)
async def update_announcement(
    announcement_id: int, 
    announcement_update: AnnouncementUpdate, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_announcement = await session.get(Announcement, announcement_id)
    if not db_announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    announcement_data = announcement_update.model_dump(exclude_unset=True)
    for key, value in announcement_data.items():
        setattr(db_announcement, key, value)
        
    session.add(db_announcement)
    await session.commit()
    await session.refresh(db_announcement)
    return db_announcement

@router.delete("/{announcement_id}")
async def delete_announcement(
    announcement_id: int, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_announcement = await session.get(Announcement, announcement_id)
    if not db_announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    await session.delete(db_announcement)
    await session.commit()
    return {"ok": True}

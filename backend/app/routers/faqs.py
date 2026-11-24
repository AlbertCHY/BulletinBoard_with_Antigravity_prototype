from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from backend.app.database import get_session
from backend.app.models import Faq, FaqCreate, FaqUpdate, User
from backend.app.auth import get_current_user

router = APIRouter(
    prefix="/faqs",
    tags=["faqs"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[Faq])
async def read_faqs(session: AsyncSession = Depends(get_session)):
    query = select(Faq).where(Faq.is_active == True)
    result = await session.exec(query)
    faqs = result.all()
    return faqs

@router.post("/", response_model=Faq)
async def create_faq(
    faq: FaqCreate, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_faq = Faq.model_validate(faq)
    session.add(db_faq)
    await session.commit()
    await session.refresh(db_faq)
    return db_faq

@router.patch("/{faq_id}", response_model=Faq)
async def update_faq(
    faq_id: int, 
    faq_update: FaqUpdate, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_faq = await session.get(Faq, faq_id)
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    faq_data = faq_update.model_dump(exclude_unset=True)
    for key, value in faq_data.items():
        setattr(db_faq, key, value)
        
    session.add(db_faq)
    await session.commit()
    await session.refresh(db_faq)
    return db_faq

@router.delete("/{faq_id}")
async def delete_faq(
    faq_id: int, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    db_faq = await session.get(Faq, faq_id)
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    await session.delete(db_faq)
    await session.commit()
    return {"ok": True}

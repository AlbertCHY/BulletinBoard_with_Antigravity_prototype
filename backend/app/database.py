import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from backend.app.models import Announcement  # Import models to register with metadata

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./ops_board.db")

engine = create_async_engine(DATABASE_URL, echo=True, future=True)

# Global session factory
async_session_factory = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def init_db():
    async with engine.begin() as conn:
        # await conn.run_sync(SQLModel.metadata.drop_all) # Optional: Reset DB
        await conn.run_sync(SQLModel.metadata.create_all)
    
    # Check for superuser
    async with async_session_factory() as session:
        from backend.app.models import User
        from sqlmodel import select
        
        # Local import to avoid circular dependency with auth.py
        from backend.app.auth import get_password_hash # type: ignore

        statement = select(User).where(User.username == os.getenv("ADMIN_USER", "admin"))
        result = await session.exec(statement)
        user = result.first()
        
        if not user:
            admin_user = os.getenv("ADMIN_USER", "admin")
            admin_password = os.getenv("ADMIN_PASSWORD", "adminpassword")
            
            hashed_pwd = get_password_hash(admin_password)
            user = User(
                username=admin_user, 
                hashed_password=hashed_pwd,
                role="admin",
                is_active=True
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
            print(f"Superuser {admin_user} created.")


async def get_session():
    async with async_session_factory() as session:
        yield session

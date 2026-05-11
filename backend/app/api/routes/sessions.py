from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter()


@router.get("")
def list_sessions(db: Session = Depends(get_db)) -> list[dict]:
    rows = db.execute(
        text(
            """
            select id, title, beach, date, mood, waves_count, is_public
            from sessions
            where is_public = true
            order by created_at desc
            limit 50
            """
        )
    ).mappings()

    return [dict(row) for row in rows]

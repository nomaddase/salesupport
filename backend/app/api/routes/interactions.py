from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.crm import Client, Interaction
from app.models.user import User
from app.schemas.crm import InteractionCreate, InteractionRead

router = APIRouter(prefix="/interactions", tags=["interactions"])


@router.post("", response_model=InteractionRead, status_code=status.HTTP_201_CREATED)
def create_interaction(
    interaction_in: InteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    client = db.query(Client).filter(Client.id == interaction_in.client_id, Client.manager_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    interaction = Interaction(**interaction_in.dict())
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction


@router.get("", response_model=list[InteractionRead])
def list_interactions(client_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    client = db.query(Client).filter(Client.id == client_id, Client.manager_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    return db.query(Interaction).filter(Interaction.client_id == client_id).all()

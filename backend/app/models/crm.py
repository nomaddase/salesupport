from datetime import datetime

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.user import User


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False, default="new")
    priority = Column(String, nullable=False, default="medium")
    total_sum = Column(Numeric, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    manager = relationship(User, backref="clients")
    interactions = relationship("Interaction", back_populates="client")
    reminders = relationship("Reminder", back_populates="client")


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    type = Column(String, nullable=False)
    result = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    client = relationship("Client", back_populates="interactions")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    file_path = Column(String, nullable=False)
    total_sum = Column(Numeric, nullable=False, default=0)
    parsed_data = Column(JSON, nullable=True)

    client = relationship("Client")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    remind_at = Column(DateTime, nullable=False)
    reason = Column(String, nullable=False)
    auto_generated = Column(Boolean, default=False)

    client = relationship("Client", back_populates="reminders")


class Funnel(Base):
    __tablename__ = "funnels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    stages = Column(ARRAY(String), nullable=False)


class SalesScript(Base):
    __tablename__ = "sales_scripts"

    id = Column(Integer, primary_key=True, index=True)
    stage = Column(String, nullable=False)
    script_text = Column(String, nullable=False)
    efficiency = Column(Numeric, nullable=False, default=0)
    usage_count = Column(Integer, nullable=False, default=0)


class ClientProgress(Base):
    __tablename__ = "client_progress"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    funnel_id = Column(Integer, ForeignKey("funnels.id"), nullable=False)
    stage = Column(String, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=False)
    entity_id = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

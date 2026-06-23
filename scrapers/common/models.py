from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, BigInteger, String, Text


class Base(DeclarativeBase):
    pass


class Company(Base):
    __tablename__ = "companies"

    id = Column(BigInteger, primary_key=True)
    name = Column(String, unique=True)


class Job(Base):
    __tablename__ = "jobs"

    id = Column(BigInteger, primary_key=True)

    title = Column(String)
    location = Column(String)

    description = Column(Text)

    source = Column(String)

    source_url = Column(Text, unique=True)
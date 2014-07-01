#!/usr/bin/env python
#-*- coding: utf-8 -*-

# internal imports
from credentials import _DATABASE_URL

# library imports
from sqlalchemy import create_engine, relationship, \
        Column, ForeignKey, \
        String, Integer, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy_imageattach.entity import Image, image_attachment

# access to the database
Base = declarative_base()
engine = create_engine(_DATABASE_URL, echo=True)
Session = sessionmaker(bind=engine)


# database classes
class User(Base):
    __tablename__ = "users"

    name = Column(String(50), primary_key=True)
    psw = Column(String(80))

    contents = relationship("CustomContent", backref="user")

    def __repr__(self):
        return "{:<15} {}".format(
            self.name,
            self.psw
        )


class OpenData(Base):
    __tablename__ = "opendata"

    lat = Column(Float, primary_key=True)
    lon = Column(Float, primary_key=True)
    name = Column(String(80))
    # etc.
    contents = relationship("CustomContent")

    def __repr__(self):
        return "({},{}) {}".format(
            self.lat,
            self.lon,
            self.name,
        )


class CustomContent(Base):
    __tablename__ = "usercontents"

    id_ = Column(Integer, primary_key=True)
    name = Column(String(50), ForeignKey("User.name"), nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    comment = Column(Text, convert_unicode=True)
    picture = image_attachment("Photo")
    ForeignKeyConstraint(["lat", "lon"], ["OpenData.lat", "OpenData.lon"])
    # TODO: check that any comment or picture are present
    likes = relationship("Like")


class Photo(Base, Image):
    __tablename__ = "pictures"

    content_id = Column(
        Integer,
        ForeignKey("CustomContent.id"),
        primary_key=True
    )
    user = relationship("CustomContent")


class Like(Base):
    user = (String(50), ForeignKey("User.name"), primary_key=True)
    id_ = Column(Integer, ForeignKey("CustomContent.id_"), primary_key=True)
    
    # True is a like, False is an unlike
    vote = Column(Boolean, nullable=False)

if __name__ == "__main__":
	pass

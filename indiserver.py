#!/usr/bin/env python
#-*- coding: utf-8 -*-

# internal imports
from credentials import _DATABASE_URL

# library imports
from flask import Flask, request
from flask.ext.httpauth import HTTPBasicAuth
from flask.ext.restful import abort, Api, Resource
from sqlalchemy import create_engine, \
        Column, ForeignKey, \
        String, Integer, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, backref
from sqlalchemy_imageattach.entity import Image, image_attachment

# HTTP service codes
HTTP_OK = 200
HTTP_CREATED = 201
HTTP_BAD_REQUEST = 400
HTTP_NOT_FOUND = 404
HTTP_CONFLICT = 409

# api prefix, common in all the requests
API_PREFIX = "/api/v1/"

# Flask setup
app = Flask(__name__)
api = Api(app)
auth = HTTPBasicAuth()

# access to the database
Base = declarative_base()
engine = create_engine(_DATABASE_URL, echo=True)
Session = sessionmaker(bind=engine)


# database and Flask RESTful classes
class User(Resource, Base):
    __tablename__ = "users"

    name = Column(String(50), primary_key=True)
    psw = Column(String(80))

    contents = relationship("CustomContent", backref="user")

    def __repr__(self):
        return "{:<15} {}".format(
            self.name,
            self.psw
        )

    def post(self):
        """
        Create a new user
        Expected as POST data:
        { "user": <username>, "psw": <password> }
        """
        try:
            user = request.form["user"]
            psw = request.form["psw"]
        except KeyError:
            abort(HTTP_BAD_REQUEST)

        # TODO: controlla che il nome non sia già preso
        # TODO: crea l'utente


class OpenData(Base, Resource):
    # radius of data scanning
    RADIUS = 300        # TODO: settarlo a modino

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

    def get(self):
        '''
        Expected lat and lon as GET arguments, floating point.
        Return the list of POI in the defined radius.
        '''
        try:
            lat = request.args.get("lat")
            lon = request.args.get("lon")
        except KeyError:
            abort(HTTP_BAD_REQUEST)
        # TODO: controllo validità
        to_return = []
        for p in OpenData:      # ?? tenere in memoria la lista degli open data..
            if math.sqrt((lat-p.lat)**2 + (lon-p.lon)**2) < OpenData.RADIUS:
                to_return.append(p)
        return to_return, HTTP_OK


class CustomContent(Base, Resource):
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

    @auth.login_required
    def post(self):
        '''
        Upload a new CustomContent. It has to be a photo and/or a comment,
        only logged in users can use it,
        '''
        user = auth.username()

        try:
            lat = request.form["lat"]
            lon = request.form["lon"]
        except KeyError:
            abort(HTTP_BAD_REQUEST)

        if ("comment" in request.form) or ("photo" in request.form):    # TODO: foto?!
            try:
                comment = request.form["comment"]
                photo = request.form["photo"]
            except KeyError:
                # there is only a comment or a photo
                pass
        else:
            abort(HTTP_BAD_REQUEST)

        # TODO: crea l'oggetto

    def get(self):
        '''
        Get a list of first 10 contents, ordered by likes,
        starting from the integer "page" (0, 1, 2...)
        '''
        try:
            lat = request.form["lat"]
            lon = request.form["lon"]
            page = request.form["page"]
        except KeyError:
            abort(HTTP_BAD_REQUEST)

        # TODO: ritorna l'oggetto
    
    @auth.login_required
    def delete(self):
        '''
        Let to an user to delete a his own content (by id_).
        '''
        try:
            id_ = request.form["id"]
        except KeyError:
            abort(HTTP_BAD_REQUEST)

        # TODO: if contenuto[id_].user == auth.username():
        # TODO:     cancella l'oggetto


class Photo(Base, Image):
    __tablename__ = "pictures"

    content_id = Column(
        Integer,
        ForeignKey("CustomContent.id"),
        primary_key=True
    )
    user = relationship("CustomContent")


class Like(Base, Resource):
    user = Column(String(50), ForeignKey("User.name"), primary_key=True)
    id_ = Column(Integer, ForeignKey("CustomContent.id_"), primary_key=True)
    
    # True is a like, False is an unlike
    vote = Column(Boolean, nullable=False)

    @auth.login_required
    def get(self):
        try:
            id_ = request.get.args["id_"]
        except KeyError:
            abort(HTTP_BAD_REQUEST)

        # TODO: cancella l'oggetto


@auth.verify_password
def verify_password(username, password):
    # TODO: controlla che la coppia username e password sia nel db
    return True


api.add_resource(User, "{}create_user".format(API_PREFIX))
api.add_resource(OpenData, "{}infos_from_map".format(API_PREFIX))
api.add_resource(CustomContent, "{}contents".format(API_PREFIX))
api.add_resource(Like, "{}like".format(API_PREFIX))


if __name__ == "__main__":
    # TODO: carica il database
    app.run(host="0.0.0.0", debug=True)         # TODO: remove debug=True

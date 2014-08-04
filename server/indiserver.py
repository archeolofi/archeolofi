#!/usr/bin/env python
#-*- coding: utf-8 -*-

# library imports
from flask import Flask, request, abort
from flask.ext.httpauth import HTTPBasicAuth
import flask.ext.sqlalchemy
import flask.ext.restless
from sqlalchemy_imageattach.entity import Image, image_attachment

# local imports
from credentials import DATABASE_URL

#in Openshift will be:
#DATABASE_URL = "postgresql://$OPENSHIFT_POSTGRESQL_DB_HOST:$OPENSHIFT_POSTGRESQL_DB_PORT"

# HTTP service codes
HTTP_OK = 200
HTTP_CREATED = 201
HTTP_BAD_REQUEST = 400
HTTP_NOT_FOUND = 404
HTTP_CONFLICT = 409

# Flask and database setup
app = Flask(__name__)
auth = HTTPBasicAuth()
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
db = flask.ext.sqlalchemy.SQLAlchemy(app)

# database and Flask classes (RESTless)
class IndianaUser(db.Model):
    """
    If user successfully created, return 201.
    If username is already token, return 405.
    If some information is missing, return 405.
    """
    name = db.Column(db.Unicode(30), primary_key=True)
    psw = db.Column(db.Unicode(30))
    email = db.Column(db.Unicode(50))

    # contents = db.relationship("custom_content", backref="user")


class OpenData(db.Model):

    # radius of data scanning
    RADIUS = 300        # TODO: settarlo a modino

    id = db.Column(db.Integer, primary_key=True)
    lat = db.Column(db.Float, nullable=False)
    lon = db.Column(db.Float, nullable=False)
    name = db.Column(db.String(80))
    # etc.
#     contents = relationship("CustomContent")

#     def __repr__(self):
#         return "({},{}) {}".format(
#             self.lat,
#             self.lon,
#             self.name,
#         )

#     def get(self):
#         '''
#         Expected lat and lon as GET arguments, floating point.
#         Return the list of POI in the defined radius.
#         '''
#         try:
#             lat = request.args.get("lat")
#             lon = request.args.get("lon")
#         except KeyError:
#             abort(HTTP_BAD_REQUEST)
#         # TODO: controllo validità
#         to_return = []
#         for p in OpenData:      # ?? tenere in memoria la lista degli open data..
#             if math.sqrt((lat-p.lat)**2 + (lon-p.lon)**2) < OpenData.RADIUS:
#                 to_return.append(p)
#         return to_return, HTTP_OK


# class CustomContent(db.Model):

#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(
#         db.Unicode, db.ForeignKey("indiana_user.name"),
#         nullable=False
#     )
#     poi = db.Column(
#         db.Integer, db.ForeignKey("open_data.id"),
#         nullable=False
#     )

#     comment = db.Column(db.Text)
#     picture = image_attachment("Photo")
#     # TODO: check that any comment or picture are present
#     likes = db.relationship("like")

#     @auth.login_required
#     def post(self):
#         '''
#         Upload a new CustomContent. It has to be a photo and/or a comment,
#         only logged in users can use it,
#         '''
#         user = auth.username()

#         try:
#             lat = request.form["lat"]
#             lon = request.form["lon"]
#         except KeyError:
#             abort(HTTP_BAD_REQUEST)

#         if ("comment" in request.form) or ("photo" in request.form):    # TODO: foto?!
#             try:
#                 comment = request.form["comment"]
#                 photo = request.form["photo"]
#             except KeyError:
#                 # there is only a comment or a photo
#                 pass
#         else:
#             abort(HTTP_BAD_REQUEST)

#         # TODO: crea l'oggetto

#     def get(self):
#         '''
#         Get a list of first 10 contents, ordered by likes,
#         starting from the integer "page" (0, 1, 2...)
#         '''
#         try:
#             lat = request.form["lat"]
#             lon = request.form["lon"]
#             page = request.form["page"]
#         except KeyError:
#             abort(HTTP_BAD_REQUEST)

#         # TODO: ritorna l'oggetto
    
#     @auth.login_required
#     def delete(self):
#         '''
#         Let to an user to delete a his own content (by id_).
#         '''
#         try:
#             id_ = request.form["id"]
#         except KeyError:
#             abort(HTTP_BAD_REQUEST)

#         # TODO: if contenuto[id_].user == auth.username():
#         # TODO:     cancella l'oggetto


# class Photo(db.Model):

#     content_id = db.Column(
#         db.Integer, db.ForeignKey("custom_content.id"),
#         primary_key=True
#     )
#     user = db.relationship("custom_content")


# class Like(db.Model):
#     user = db.Column(
#         db.String(50), db.ForeignKey("indiana_user.name"),
#         primary_key=True
#     )
#     content_id = db.Column(
#         db.Integer, db.ForeignKey("custom_content.id"),
#         primary_key=True
#     )
    
#     # True is a like, False is an unlike
#     vote = Column(Boolean, nullable=False)

#     @auth.login_required
#     def get(self):
#         try:
#             id_ = request.get.args["id_"]
#         except KeyError:
#             abort(HTTP_BAD_REQUEST)

#         # TODO: cancella l'oggetto


@auth.verify_password
def verify_password(username, password):
    # TODO: controlla che la coppia username e password sia nel db
    return True


# Create the Flask-Restless API manager
manager = flask.ext.restless.APIManager(app, flask_sqlalchemy_db=db)

# Create API endpoints, which will be available at /api/<tablename> by
# default. Allowed HTTP methods can be specified as well
manager.create_api(IndianaUser, methods=["POST"])
# manager.create_api(CustomContent, methods=["GET", "POST", "PUT", "DELETE"])
# manager.create_api(Like, methods=["POST"])


if __name__ == "__main__":
    # Create the database tables
    db.create_all()

    # TODO: carica il database
    app.run(host="0.0.0.0", debug=True)         # TODO: remove debug=True

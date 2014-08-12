#!/usr/bin/env python
#-*- coding: utf-8 -*-

# library imports
from flask import Flask, request, current_app, make_response
import flask.ext.restless as restless
import flask.ext.sqlalchemy
import json
# from sqlalchemy_imageattach.entity import Image, image_attachment

# local imports
from credentials import DATABASE_URL
#in Openshift will be:
#DATABASE_URL = "postgresql://$OPENSHIFT_POSTGRESQL_DB_HOST:$OPENSHIFT_POSTGRESQL_DB_PORT"

# TODO: remove
from pdb import set_trace


# HTTP service codes
HTTP_OK = 200
HTTP_CREATED = 201
HTTP_BAD_REQUEST = 400
HTTP_NOT_FOUND = 404
HTTP_CONFLICT = 409

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
db = flask.ext.sqlalchemy.SQLAlchemy(app)


############################
# For the "same origin policy", it is generally impossible to do cross domain
# requests through ajax. There are some solutions, the main solution is use
# a proxy inside the domain of the website, BUT, this is an app and the domain
# is localhost. So, I had to find another way. Exist a easy to find decorator
# for Flask, but it wasn't applicable to the Flask-Restless methods.
# The following solution was found in:
#  https://github.com/jfinkels/flask-restless/issues/223
# Thank you reubano and klinkin!

def create_app(config_mode=None, config_file=None):

    def add_cors_header(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'HEAD, GET, POST, PATCH, PUT, OPTIONS, DELETE'
        response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        return response

    # Create the Flask-Restless API manager
    manager = restless.APIManager(app, flask_sqlalchemy_db=db)

    # pre/post-processors
    def post_preprocessor(data=None, **kw):
        """
        Accepts a single argument, 'data', which is the dictionary of
        fields to set on the new instance of the model.
        """
        if verify_password():
            data["user"] = request.authorization["username"]

    # Create API endpoints, which will be available at /api/<tablename>
    manager.create_api(
        IndianaUser,
        methods=["POST"]
    )
    manager.create_api(
        Content,
        methods=["GET", "POST"],
        preprocessors={
            "POST": [post_preprocessor]
        },
        results_per_page=10
    )
    # manager.create_api(CustomContent, methods=["GET", "POST", "PUT", "DELETE"])
    # manager.create_api(Like, methods=["POST"])

    app.after_request(add_cors_header)
    return app


############## cross domain decorator
# Another solution, used for flask direct endpoints.
# http://flask.pocoo.org/snippets/56/
from functools import update_wrapper
from datetime import timedelta


def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator


@app.route('/api/cross_domain')
@crossdomain(origin='*')
def my_service():
    return "I'm cool. Every domain is cool"
#########################################


# database and Flask classes (RESTless)
class IndianaUser(db.Model):
    """
    If user successfully created, return 201.
    If username is already token, return 405.
    If some information is missing, return 400.
    """
    name = db.Column(db.Unicode(30), primary_key=True, nullable=False)
    psw = db.Column(db.Unicode(30), nullable=False)
    email = db.Column(db.Unicode(50), nullable=False)

    # contents = db.relationship("content", backref="user")


class Content(db.Model):
    id_ = db.Column(
        db.Integer,
        primary_key=True
    )
    poi = db.Column(
        db.Integer,
        # db.ForeignKey("poi.id"),
        nullable=False
    )
    user = db.Column(
        db.Unicode(30),
        db.ForeignKey("indiana_user.name"),
        nullable=False
    )

    content = db.Column(db.Text, nullable=False)


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


def verify_password():
    try:
        username, password = request.authorization.values()
    except AttributeError:
        raise restless.ProcessingException(
            description='Not authenticated!', code=401
        )
    else:
        user = IndianaUser.query.get(username)
        if (not user) or (user.psw != password):
            raise restless.ProcessingException(
                description='Invalid username or password!', code=401
            )
    return True


@app.route("/api/login/")
def login():
    if verify_password():
        return json.dumps(True)


if __name__ == "__main__":
    create_app()

    # Create the database tables
    db.create_all()

    # TODO: carica il database
    app.run(host="0.0.0.0", debug=True)         # TODO: remove debug=True

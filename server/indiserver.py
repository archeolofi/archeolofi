#!/usr/bin/env python
#-*- coding: utf-8 -*-

# library imports
from flask import Flask, request, current_app, make_response
from werkzeug.exceptions import RequestEntityTooLarge
import flask.ext.restless as restless
from passlib.hash import sha256_crypt
from base64 import b64encode
import flask.ext.sqlalchemy
import requests
import Image
import json
import os

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

CONTENTS = "static/"
IMAGE_TYPES = [
    ".bmp", ".dib", ".dcx", ".eps", ".ps", ".gif", ".im", ".jpg", ".jpe",
    ".jpeg", ".pcd", ".pcx", ".pdf", ".png", ".pbm", ".pgm", ".ppm", ".tif",
    ".tiff", ".xbm", ".xpm"
]
ALLOWED_TYPES = [
    '.odf', '.gnumeric', '.plist', '.7z', '.ods', '.xml', '.docx', '.abw',
    '.zip', '.wav', '.yaml', '.xlsx', '.yml', '.rtf', '.ini', '.svg', '.aac',
    '.doc', '.mp3', '.xls', '.tar', '.json', '.csv', '.flac', '.bz2', '.txt',
    '.tgz', '.txz', '.ogg', '.oga', '.gz', ".psd"
]

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 64 * 1024 * 1024
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
db = flask.ext.sqlalchemy.SQLAlchemy(app)


def verify_password():
    try:
        username, password = request.authorization.values()
    except AttributeError:
        raise restless.ProcessingException(
            description='Not authenticated!', code=401
        )
    else:
        user = IndianaUser.query.get(username)
        if (not user) or (not sha256_crypt.verify(password, user.psw)):
            raise restless.ProcessingException(
                description='Invalid username or password!', code=401
            )
    return True


def verify_owner(content):
    user = request.authorization["username"]
    if user != content.user:
        raise restless.ProcessingException(
            description='You are not the owner of that content!',
            code=401
        )


def create_app(config_mode=None, config_file=None):

    def add_cors_header(response):
        # For the "same origin policy", it is generally impossible to do cross domain
        # requests through ajax. There are some solutions, the main solution is use
        # a proxy inside the domain of the website, BUT, this is an app and the domain
        # is localhost. So, I had to find another way. Exist a easy to find decorator
        # for Flask, but it wasn't applicable to the Flask-Restless methods.
        # The following solution was found in:
        #  https://github.com/jfinkels/flask-restless/issues/223
        # Thank you reubano and klinkin!
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'HEAD, GET, POST, PATCH, PUT, OPTIONS, DELETE'
        # TODO: maybe something here is unnecessary:
        response.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        return response

    # Create the Flask-Restless API manager
    manager = restless.APIManager(app, flask_sqlalchemy_db=db)

    # pre/post-processors
    def password_encryption(data={}, **kw):
        try:
            data["psw"] = sha256_crypt.encrypt(data["psw"])
        except KeyError:
            # it will fail soon.
            pass

    def add_user_field(data={}, **kw):
        """
        Check username and password and add username to data to be saved.
        """
        if verify_password():
            data["user"] = request.authorization["username"]

    def manage_upload_announcement(data, **kw):
        """
        At least one between upload announcement or comment has to be present.
        If the user wants to upload a file, send to him a token, which he can
        use for uploading.
        """
        if (not "comment" in data) and (not "upload_announcement" in data):
            raise restless.ProcessingException(
                description="Missing content.", code=412
            )

        if "upload_announcement" in data:
            del data["upload_announcement"]
            data["filename"] = FileId.get_new()

    def pre_modification(instance_id, data=None, **kw):
        """
        Check if the user, who wants to modify a content, is the owner of that
        content.
        An user can modify only the 'comment' and the 'file_description'
        fields.
        """
        verify_password()

        content = Content.query.get(instance_id)
        verify_owner(content)

        if data:
            allowed_fields = ["comment", "file_description"]
            for field in data.keys():
                if not field in allowed_fields:
                    raise restless.ProcessingException(
                        description="Not modifiable", code=401
                    )

    def add_like_fields(result=None, search_params=None, **kw):
        for cnt in result["objects"]:
            cnt["like"] = 0
            cnt["unlike"] = 0
            for l in Like.query.filter_by(content_id=cnt["id_"]).all():
                if l.do_like:
                    cnt["like"] += 1
                elif not l.do_like:
                    cnt["unlike"] += 1

    # Create API endpoints, which will be available at /api/<tablename>
    manager.create_api(
        IndianaUser,
        preprocessors={
            "POST": [password_encryption]
        },
        methods=["POST"]
    )
    manager.create_api(
        Content,
        methods=["GET", "POST", "PATCH", "DELETE"],
        preprocessors={
            "POST": [add_user_field, manage_upload_announcement],
            "PATCH_SINGLE": [pre_modification],
            "DELETE": [pre_modification]
        },
        postprocessors={
            "GET_MANY": [add_like_fields]
        },
        results_per_page=10
    )
    manager.create_api(
        Like,
        methods=["POST"],
        preprocessors={
            "POST": [add_user_field]
        }
    )

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
#########################################

class FileId(object):
    CONFIG_FILE = "id.ini"
    last_file_id = -1

    try:
        with open(CONFIG_FILE) as f:
            last_file_id = int(f.read())
    except (IOError, ValueError):
        pass

    @classmethod
    def get_new(cls):
        cls.last_file_id += 1
        with open(cls.CONFIG_FILE, "w") as f:
            f.write(str(cls.last_file_id))
        return cls.last_file_id


# database and Flask classes (RESTless)
class IndianaUser(db.Model):
    """
    If user successfully created, return 201.
    If username is already token, return 405.
    If some information is missing, return 400.
    """
    name = db.Column(db.Unicode(30), primary_key=True, nullable=False)
    psw = db.Column(db.Unicode(80), nullable=False)
    email = db.Column(db.Unicode(50), nullable=False)

    # contents = db.relationship("content", backref=db.backref("user", lazy='dynamic'))
    # likes = db.relationship("like", backref=db.backref("user", lazy='dynamic'))


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
    comment = db.Column(
        db.Text
    )
    filename = db.Column(
        db.Unicode(20)
    )
    file_description = db.Column(
        db.Unicode(50)
    )
    photo_thumb = db.Column(
        db.Text
    )

    # likes = db.relationship("like", backref=db.backref("content_id"))


class Like(db.Model):
    user = db.Column(
        db.Unicode(30),
        db.ForeignKey("indiana_user.name"),
        primary_key=True
    )
    content_id = db.Column(
        db.Integer,
        db.ForeignKey("content.id_"),
        primary_key=True
    )
    do_like = db.Column(
        db.Boolean,
        nullable=False
    )


@app.route("/api/login/", methods=["GET"])
@crossdomain(origin='*', headers="Authorization")
def login():
    if verify_password():
        return json.dumps(True)


@app.route("/api/file/<int:file_id>", methods=["POST"])
def file_upload(file_id):
    def refuse(content):
        # remove the space for the file in the database
        db.session.delete(content)
        db.session.commit()

    # verify user
    verify_password()
    content = Content.query.filter_by(filename=str(file_id)).first()
    if not content:
        raise restless.ProcessingException(
            description="Not expected file",
            code=403
        )
    verify_owner(content)

    # verify content
    try:
        f = request.files["file"]
    except RequestEntityTooLarge:
        refuse(content)
        raise

    original_name, ext = os.path.splitext(f.filename)
    ext = ext.lower()
    if (not ext in IMAGE_TYPES) and (not ext in ALLOWED_TYPES):
        refuse(content)
        raise restless.ProcessingException(
            description="File type not allowed.",
            code=400
        )

    # save the file
    filename = str(file_id) + ext
    filepath = os.path.join(CONTENTS, filename)
    f.save(filepath)

    # save a base64 encoded thumbnail in the database
    if ext in IMAGE_TYPES:
        size = (120, 120)
        im = Image.open(filepath)
        im.thumbnail(size)
        tmp = "{}thumbnail_{}".format(CONTENTS, filename)
        im.save(tmp)
    
        with open(tmp) as f:
            b64photo = b64encode(f.read())

        os.remove(tmp)

        content.photo_thumb = b64photo

    if not content.file_description:
        content.file_description = original_name
    content.filename = filename
    db.session.add(content)
    db.session.commit()
    return json.dumps("Photo uploaded!")


@app.route(
    "/api/proxy/<string:bbox>&<int:width>&<int:height>&<int:x>&<int:y>",
    methods=["GET"]
)
@crossdomain(origin='*')
def datagis_proxy(bbox, width, height, x, y):
    url = (
        "http://datigis.comune.fi.it/geoserver/wms?SERVICE=WMS&VERSION=1.3."
        "0&REQUEST=GetFeatureInfo&BBOX={}&CRS=EPSG:4326&WIDTH={}&HEIGHT={}&"
        "LAYERS=archeologia:scavi_archeo&STYLES=&FORMAT=image/png&QUERY_LAYERS"
        "=archeologia:scavi_archeo&INFO_FORMAT=application/json&I={}&J={}"
        "&FEATURE_COUNT=10"
    ).format(bbox, width, height, x, y)
    print url
    received = requests.get(url)
    return received.text


if __name__ == "__main__":
    create_app()

    # Create the database tables
    db.create_all()

    # TODO: carica il database
    app.run(host="0.0.0.0", debug=True)         # TODO: remove debug=True

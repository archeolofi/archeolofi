#!/usr/bin/env python
#-*- coding: utf-8 -*-

# library imports
from base64 import b64encode
import unittest
import json

import sqlalchemy
from sqlalchemy import create_engine, \
        Column, ForeignKey, \
        Unicode, String, Integer, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, backref

# local imports
import indiserver
from credentials import DATABASE_URL

# access to the database
engine = create_engine(DATABASE_URL, echo=True)
Base = declarative_base()
Base.metadata.reflect(engine)
Session = sessionmaker(bind=engine)

# Flask's things
HEADERS = {"content-type":"application/json"}


def make_headers(user, psw):
    return {
        "Authorization": "Basic "
        + b64encode("{0}:{1}".format(user, psw))
    }.update(HEADERS)


class IndianaUser(Base):
    __table__ = Base.metadata.tables["indiana_user"]


class WritingToDatabase(unittest.TestCase):

    def setUp(self):
        self.session = Session()

        # http://stackoverflow.com/questions/20201809/sqlalchemy-flask-attributeerror-session-object-has-no-attribute-model-chan
        self.session._model_changes = {}

        self.tc = indiserver.app.test_client()

    def tearDown(self):
        self.session.commit()
        self.session.close()

    def test_indianauser_creation(self):
        user = {
            "name": "Plauto",
            "psw": "proppolo",
            "email": "some_email",
        }
        received = self.tc.post(
            "api/indiana_user",
            data=json.dumps(user),
            headers=HEADERS
        )
        self.assertEqual(received.status_code, 201)
        self.session.query(IndianaUser) \
            .filter(IndianaUser.name == "Plauto") \
            .delete()

    def test_missing_value(self):
        received = self.tc.post(
            "api/indiana_user",
            data=json.dumps({"name": "only_name"}),
            headers=HEADERS
        )
        self.assertEqual(received.status_code, 400)


if __name__ == '__main__':
    indiserver.app.config.update(TESTING=True)
    indiserver.app.testing = True

    # make tests!
    unittest.main()

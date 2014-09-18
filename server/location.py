#!/usr/bin/env python
#-*- coding: utf-8 -*-

import os


DATABASE_URL = ''.join([
    "postgresql://",
    os.environ["OPENSHIFT_POSTGRESQL_DB_HOST"],
    ":",
    os.environ["OPENSHIFT_POSTGRESQL_DB_PORT"]
])


CONTENTS = os.environ["OPENSHIFT_DATA_DIR"] + "static/"
ID_FILE = os.environ["OPENSHIFT_DATA_DIR"] + "id.ini"

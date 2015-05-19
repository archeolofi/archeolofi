#!/usr/bin/env python
#-*- coding: utf-8 -*-


db = {
	"username" : "archeolofi",
	"password" : "",
	"host"     : "localhost",
	"database" : "archeolofi",
}


DATABASE_URL = ''.join([
    "postgresql://",
    db["username"],
    ":",
    db["password"],
    "@",
    db["host"],
    "/",
    db["database"]
])

CONTENTS = "static/"
ID_FILE = "id.ini"

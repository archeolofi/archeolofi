#!/usr/bin/env python
#-*- coding: utf-8 -*-


db = {
	"username" : "indiana",
	"password" : "astropanza",
	"host"     : "localhost",
	"database" : "indiana",
}


_DATABASE_URL = ''.join([
    "postgresql://",
    db["username"],
    ":",
    db["password"],
    "@",
    db["host"],
    "/",
    db["database"]
])

#!/usr/bin/env python
#-*- coding: utf-8 -*-

import unittest

import server


class UnitTests(unittest.TestCase):

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_escape_html(self):
        # nothing change here
        value = "procchio@email.it"
        data = {"field": value}
        server.escape_html(data)
        self.assertEqual(data["field"], value)

        # html escaped
        value = "<script>alert('spam')</script>"
        data = {"field": value}
        server.escape_html(data)
        self.assertNotEqual(data["field"], value)
        self.assertNotIn("<", data["field"])
        self.assertNotIn(">", data["field"])


if __name__ == '__main__':
    unittest.main()

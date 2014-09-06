#!/usr/bin/env python
#-*- coding: utf-8 -*-

import unittest

import indiserver


class WritingToDatabase(unittest.TestCase):

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_escape_html(self):
        # nothing change here
        value = "procchio@email.it"
        data = {"field": value}
        indiserver.escape_html(data)
        self.assertEqual(data["field"], value)

        # html escaped
        value = "<script>alert('spam')</script>"
        data = {"field": value}
        indiserver.escape_html(data)
        self.assertNotEqual(data["field"], value)
        self.assertNotIn("<", data["field"])
        self.assertNotIn(">", data["field"])


if __name__ == '__main__':
    # make tests!
    unittest.main()

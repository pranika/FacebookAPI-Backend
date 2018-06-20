#!/usr/bin/env coffee

coffee = require(require("findup-sync") "index.js").coffee

test = require "tape"
_ = require "underscore"

test "coffee is a function", (t) ->
  t.equal typeof coffee, "function", "so it is callable"
  t.end()

test "coffee takes options", (t) ->
  t.ok _.isObject(coffee()), "returns an Object by default"
  t.equal 4, coffee(opts: indentation: value: 4).indentation.value
    , "deepmerges options, given an \"opts\" object, thus override"
  json = coffee json: true
  t.ok _.isString(json), "returns a JSON String, given {json: true}"
  opts = JSON.parse json
  t.ok _.isObject(opts), "the JSON is indeed parseable"
  t.end()

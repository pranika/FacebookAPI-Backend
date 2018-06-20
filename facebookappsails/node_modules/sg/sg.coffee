module.exports = require("sourcegate").use
  coffee:
    indentation:
      value: 2
      level: "error"
    no_tabs: level: "error"
    max_line_length:
      value: 120 # 150% of the default 80
      level: "warn"
    line_endings:
      value: "unix"
      level: "warn"
    no_trailing_semicolons: level: "error"
    no_trailing_whitespace: level: "error"
    no_throwing_strings: level: "error"
    no_empty_param_list: level: "error"
    no_implicit_parens: level: "ignore"
    no_implicit_braces: level: "ignore"
    camel_case_classes: level: "error"
    no_stand_alone_at: level: "warn" # needs improvement, @["whatever"]?

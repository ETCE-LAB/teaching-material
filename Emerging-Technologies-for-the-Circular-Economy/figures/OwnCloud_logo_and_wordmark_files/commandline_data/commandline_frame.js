(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __commonJS = (cb2, mod) => function __require() {
    return mod || (0, cb2[__getOwnPropNames(cb2)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __reExport = (target, module, copyDefault, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toESM = (module, isNodeMode) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", !isNodeMode && module && module.__esModule ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
  };
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i = decorators.length - 1, decorator; i >= 0; i--)
      if (decorator = decorators[i])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result)
      __defProp(target, key, result);
    return result;
  };

  // node_modules/nearley/lib/nearley.js
  var require_nearley = __commonJS({
    "node_modules/nearley/lib/nearley.js"(exports, module) {
      (function(root, factory) {
        if (typeof module === "object" && module.exports) {
          module.exports = factory();
        } else {
          root.nearley = factory();
        }
      })(exports, function() {
        function Rule(name, symbols, postprocess) {
          this.id = ++Rule.highestId;
          this.name = name;
          this.symbols = symbols;
          this.postprocess = postprocess;
          return this;
        }
        Rule.highestId = 0;
        Rule.prototype.toString = function(withCursorAt) {
          var symbolSequence = typeof withCursorAt === "undefined" ? this.symbols.map(getSymbolShortDisplay).join(" ") : this.symbols.slice(0, withCursorAt).map(getSymbolShortDisplay).join(" ") + " \u25CF " + this.symbols.slice(withCursorAt).map(getSymbolShortDisplay).join(" ");
          return this.name + " \u2192 " + symbolSequence;
        };
        function State2(rule, dot, reference, wantedBy) {
          this.rule = rule;
          this.dot = dot;
          this.reference = reference;
          this.data = [];
          this.wantedBy = wantedBy;
          this.isComplete = this.dot === rule.symbols.length;
        }
        State2.prototype.toString = function() {
          return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
        };
        State2.prototype.nextState = function(child) {
          var state2 = new State2(this.rule, this.dot + 1, this.reference, this.wantedBy);
          state2.left = this;
          state2.right = child;
          if (state2.isComplete) {
            state2.data = state2.build();
            state2.right = void 0;
          }
          return state2;
        };
        State2.prototype.build = function() {
          var children = [];
          var node = this;
          do {
            children.push(node.right.data);
            node = node.left;
          } while (node.left);
          children.reverse();
          return children;
        };
        State2.prototype.finish = function() {
          if (this.rule.postprocess) {
            this.data = this.rule.postprocess(this.data, this.reference, Parser3.fail);
          }
        };
        function Column(grammar2, index) {
          this.grammar = grammar2;
          this.index = index;
          this.states = [];
          this.wants = {};
          this.scannable = [];
          this.completed = {};
        }
        Column.prototype.process = function(nextColumn) {
          var states = this.states;
          var wants = this.wants;
          var completed = this.completed;
          for (var w = 0; w < states.length; w++) {
            var state2 = states[w];
            if (state2.isComplete) {
              state2.finish();
              if (state2.data !== Parser3.fail) {
                var wantedBy = state2.wantedBy;
                for (var i = wantedBy.length; i--; ) {
                  var left = wantedBy[i];
                  this.complete(left, state2);
                }
                if (state2.reference === this.index) {
                  var exp = state2.rule.name;
                  (this.completed[exp] = this.completed[exp] || []).push(state2);
                }
              }
            } else {
              var exp = state2.rule.symbols[state2.dot];
              if (typeof exp !== "string") {
                this.scannable.push(state2);
                continue;
              }
              if (wants[exp]) {
                wants[exp].push(state2);
                if (completed.hasOwnProperty(exp)) {
                  var nulls = completed[exp];
                  for (var i = 0; i < nulls.length; i++) {
                    var right = nulls[i];
                    this.complete(state2, right);
                  }
                }
              } else {
                wants[exp] = [state2];
                this.predict(exp);
              }
            }
          }
        };
        Column.prototype.predict = function(exp) {
          var rules = this.grammar.byName[exp] || [];
          for (var i = 0; i < rules.length; i++) {
            var r = rules[i];
            var wantedBy = this.wants[exp];
            var s = new State2(r, 0, this.index, wantedBy);
            this.states.push(s);
          }
        };
        Column.prototype.complete = function(left, right) {
          var copy = left.nextState(right);
          this.states.push(copy);
        };
        function Grammar2(rules, start) {
          this.rules = rules;
          this.start = start || this.rules[0].name;
          var byName = this.byName = {};
          this.rules.forEach(function(rule) {
            if (!byName.hasOwnProperty(rule.name)) {
              byName[rule.name] = [];
            }
            byName[rule.name].push(rule);
          });
        }
        Grammar2.fromCompiled = function(rules, start) {
          var lexer = rules.Lexer;
          if (rules.ParserStart) {
            start = rules.ParserStart;
            rules = rules.ParserRules;
          }
          var rules = rules.map(function(r) {
            return new Rule(r.name, r.symbols, r.postprocess);
          });
          var g = new Grammar2(rules, start);
          g.lexer = lexer;
          return g;
        };
        function StreamLexer() {
          this.reset("");
        }
        StreamLexer.prototype.reset = function(data, state2) {
          this.buffer = data;
          this.index = 0;
          this.line = state2 ? state2.line : 1;
          this.lastLineBreak = state2 ? -state2.col : 0;
        };
        StreamLexer.prototype.next = function() {
          if (this.index < this.buffer.length) {
            var ch = this.buffer[this.index++];
            if (ch === "\n") {
              this.line += 1;
              this.lastLineBreak = this.index;
            }
            return { value: ch };
          }
        };
        StreamLexer.prototype.save = function() {
          return {
            line: this.line,
            col: this.index - this.lastLineBreak
          };
        };
        StreamLexer.prototype.formatError = function(token, message2) {
          var buffer = this.buffer;
          if (typeof buffer === "string") {
            var lines = buffer.split("\n").slice(Math.max(0, this.line - 5), this.line);
            var nextLineBreak = buffer.indexOf("\n", this.index);
            if (nextLineBreak === -1)
              nextLineBreak = buffer.length;
            var col = this.index - this.lastLineBreak;
            var lastLineDigits = String(this.line).length;
            message2 += " at line " + this.line + " col " + col + ":\n\n";
            message2 += lines.map(function(line, i) {
              return pad3(this.line - lines.length + i + 1, lastLineDigits) + " " + line;
            }, this).join("\n");
            message2 += "\n" + pad3("", lastLineDigits + col) + "^\n";
            return message2;
          } else {
            return message2 + " at index " + (this.index - 1);
          }
          function pad3(n, length) {
            var s = String(n);
            return Array(length - s.length + 1).join(" ") + s;
          }
        };
        function Parser3(rules, start, options) {
          if (rules instanceof Grammar2) {
            var grammar2 = rules;
            var options = start;
          } else {
            var grammar2 = Grammar2.fromCompiled(rules, start);
          }
          this.grammar = grammar2;
          this.options = {
            keepHistory: false,
            lexer: grammar2.lexer || new StreamLexer()
          };
          for (var key in options || {}) {
            this.options[key] = options[key];
          }
          this.lexer = this.options.lexer;
          this.lexerState = void 0;
          var column = new Column(grammar2, 0);
          var table = this.table = [column];
          column.wants[grammar2.start] = [];
          column.predict(grammar2.start);
          column.process();
          this.current = 0;
        }
        Parser3.fail = {};
        Parser3.prototype.feed = function(chunk) {
          var lexer = this.lexer;
          lexer.reset(chunk, this.lexerState);
          var token;
          while (true) {
            try {
              token = lexer.next();
              if (!token) {
                break;
              }
            } catch (e) {
              var nextColumn = new Column(this.grammar, this.current + 1);
              this.table.push(nextColumn);
              var err = new Error(this.reportLexerError(e));
              err.offset = this.current;
              err.token = e.token;
              throw err;
            }
            var column = this.table[this.current];
            if (!this.options.keepHistory) {
              delete this.table[this.current - 1];
            }
            var n = this.current + 1;
            var nextColumn = new Column(this.grammar, n);
            this.table.push(nextColumn);
            var literal = token.text !== void 0 ? token.text : token.value;
            var value = lexer.constructor === StreamLexer ? token.value : token;
            var scannable = column.scannable;
            for (var w = scannable.length; w--; ) {
              var state2 = scannable[w];
              var expect = state2.rule.symbols[state2.dot];
              if (expect.test ? expect.test(value) : expect.type ? expect.type === token.type : expect.literal === literal) {
                var next = state2.nextState({ data: value, token, isToken: true, reference: n - 1 });
                nextColumn.states.push(next);
              }
            }
            nextColumn.process();
            if (nextColumn.states.length === 0) {
              var err = new Error(this.reportError(token));
              err.offset = this.current;
              err.token = token;
              throw err;
            }
            if (this.options.keepHistory) {
              column.lexerState = lexer.save();
            }
            this.current++;
          }
          if (column) {
            this.lexerState = lexer.save();
          }
          this.results = this.finish();
          return this;
        };
        Parser3.prototype.reportLexerError = function(lexerError) {
          var tokenDisplay, lexerMessage;
          var token = lexerError.token;
          if (token) {
            tokenDisplay = "input " + JSON.stringify(token.text[0]) + " (lexer error)";
            lexerMessage = this.lexer.formatError(token, "Syntax error");
          } else {
            tokenDisplay = "input (lexer error)";
            lexerMessage = lexerError.message;
          }
          return this.reportErrorCommon(lexerMessage, tokenDisplay);
        };
        Parser3.prototype.reportError = function(token) {
          var tokenDisplay = (token.type ? token.type + " token: " : "") + JSON.stringify(token.value !== void 0 ? token.value : token);
          var lexerMessage = this.lexer.formatError(token, "Syntax error");
          return this.reportErrorCommon(lexerMessage, tokenDisplay);
        };
        Parser3.prototype.reportErrorCommon = function(lexerMessage, tokenDisplay) {
          var lines = [];
          lines.push(lexerMessage);
          var lastColumnIndex = this.table.length - 2;
          var lastColumn = this.table[lastColumnIndex];
          var expectantStates = lastColumn.states.filter(function(state2) {
            var nextSymbol = state2.rule.symbols[state2.dot];
            return nextSymbol && typeof nextSymbol !== "string";
          });
          if (expectantStates.length === 0) {
            lines.push("Unexpected " + tokenDisplay + ". I did not expect any more input. Here is the state of my parse table:\n");
            this.displayStateStack(lastColumn.states, lines);
          } else {
            lines.push("Unexpected " + tokenDisplay + ". Instead, I was expecting to see one of the following:\n");
            var stateStacks = expectantStates.map(function(state2) {
              return this.buildFirstStateStack(state2, []) || [state2];
            }, this);
            stateStacks.forEach(function(stateStack) {
              var state2 = stateStack[0];
              var nextSymbol = state2.rule.symbols[state2.dot];
              var symbolDisplay = this.getSymbolDisplay(nextSymbol);
              lines.push("A " + symbolDisplay + " based on:");
              this.displayStateStack(stateStack, lines);
            }, this);
          }
          lines.push("");
          return lines.join("\n");
        };
        Parser3.prototype.displayStateStack = function(stateStack, lines) {
          var lastDisplay;
          var sameDisplayCount = 0;
          for (var j = 0; j < stateStack.length; j++) {
            var state2 = stateStack[j];
            var display = state2.rule.toString(state2.dot);
            if (display === lastDisplay) {
              sameDisplayCount++;
            } else {
              if (sameDisplayCount > 0) {
                lines.push("    ^ " + sameDisplayCount + " more lines identical to this");
              }
              sameDisplayCount = 0;
              lines.push("    " + display);
            }
            lastDisplay = display;
          }
        };
        Parser3.prototype.getSymbolDisplay = function(symbol) {
          return getSymbolLongDisplay(symbol);
        };
        Parser3.prototype.buildFirstStateStack = function(state2, visited) {
          if (visited.indexOf(state2) !== -1) {
            return null;
          }
          if (state2.wantedBy.length === 0) {
            return [state2];
          }
          var prevState = state2.wantedBy[0];
          var childVisited = [state2].concat(visited);
          var childResult = this.buildFirstStateStack(prevState, childVisited);
          if (childResult === null) {
            return null;
          }
          return [state2].concat(childResult);
        };
        Parser3.prototype.save = function() {
          var column = this.table[this.current];
          column.lexerState = this.lexerState;
          return column;
        };
        Parser3.prototype.restore = function(column) {
          var index = column.index;
          this.current = index;
          this.table[index] = column;
          this.table.splice(index + 1);
          this.lexerState = column.lexerState;
          this.results = this.finish();
        };
        Parser3.prototype.rewind = function(index) {
          if (!this.options.keepHistory) {
            throw new Error("set option `keepHistory` to enable rewinding");
          }
          this.restore(this.table[index]);
        };
        Parser3.prototype.finish = function() {
          var considerations = [];
          var start = this.grammar.start;
          var column = this.table[this.table.length - 1];
          column.states.forEach(function(t) {
            if (t.rule.name === start && t.dot === t.rule.symbols.length && t.reference === 0 && t.data !== Parser3.fail) {
              considerations.push(t);
            }
          });
          return considerations.map(function(c) {
            return c.data;
          });
        };
        function getSymbolLongDisplay(symbol) {
          var type3 = typeof symbol;
          if (type3 === "string") {
            return symbol;
          } else if (type3 === "object") {
            if (symbol.literal) {
              return JSON.stringify(symbol.literal);
            } else if (symbol instanceof RegExp) {
              return "character matching " + symbol;
            } else if (symbol.type) {
              return symbol.type + " token";
            } else if (symbol.test) {
              return "token matching " + String(symbol.test);
            } else {
              throw new Error("Unknown symbol type: " + symbol);
            }
          }
        }
        function getSymbolShortDisplay(symbol) {
          var type3 = typeof symbol;
          if (type3 === "string") {
            return symbol;
          } else if (type3 === "object") {
            if (symbol.literal) {
              return JSON.stringify(symbol.literal);
            } else if (symbol instanceof RegExp) {
              return symbol.toString();
            } else if (symbol.type) {
              return "%" + symbol.type;
            } else if (symbol.test) {
              return "<" + String(symbol.test) + ">";
            } else {
              throw new Error("Unknown symbol type: " + symbol);
            }
          }
        }
        return {
          Parser: Parser3,
          Grammar: Grammar2,
          Rule
        };
      });
    }
  });

  // node_modules/semver-compare/index.js
  var require_semver_compare = __commonJS({
    "node_modules/semver-compare/index.js"(exports, module) {
      module.exports = function cmp(a, b) {
        var pa = a.split(".");
        var pb = b.split(".");
        for (var i = 0; i < 3; i++) {
          var na = Number(pa[i]);
          var nb = Number(pb[i]);
          if (na > nb)
            return 1;
          if (nb > na)
            return -1;
          if (!isNaN(na) && isNaN(nb))
            return 1;
          if (isNaN(na) && !isNaN(nb))
            return -1;
        }
        return 0;
      };
    }
  });

  // node_modules/css/lib/parse/index.js
  var require_parse = __commonJS({
    "node_modules/css/lib/parse/index.js"(exports, module) {
      var commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
      module.exports = function(css, options) {
        options = options || {};
        var lineno = 1;
        var column = 1;
        function updatePosition(str) {
          var lines = str.match(/\n/g);
          if (lines)
            lineno += lines.length;
          var i = str.lastIndexOf("\n");
          column = ~i ? str.length - i : column + str.length;
        }
        function position() {
          var start = { line: lineno, column };
          return function(node) {
            node.position = new Position(start);
            whitespace();
            return node;
          };
        }
        function Position(start) {
          this.start = start;
          this.end = { line: lineno, column };
          this.source = options.source;
        }
        Position.prototype.content = css;
        var errorsList = [];
        function error(msg) {
          var err = new Error(options.source + ":" + lineno + ":" + column + ": " + msg);
          err.reason = msg;
          err.filename = options.source;
          err.line = lineno;
          err.column = column;
          err.source = css;
          if (options.silent) {
            errorsList.push(err);
          } else {
            throw err;
          }
        }
        function stylesheet() {
          var rulesList = rules();
          return {
            type: "stylesheet",
            stylesheet: {
              source: options.source,
              rules: rulesList,
              parsingErrors: errorsList
            }
          };
        }
        function open() {
          return match(/^{\s*/);
        }
        function close() {
          return match(/^}/);
        }
        function rules() {
          var node;
          var rules2 = [];
          whitespace();
          comments(rules2);
          while (css.length && css.charAt(0) != "}" && (node = atrule() || rule())) {
            if (node !== false) {
              rules2.push(node);
              comments(rules2);
            }
          }
          return rules2;
        }
        function match(re) {
          var m = re.exec(css);
          if (!m)
            return;
          var str = m[0];
          updatePosition(str);
          css = css.slice(str.length);
          return m;
        }
        function whitespace() {
          match(/^\s*/);
        }
        function comments(rules2) {
          var c;
          rules2 = rules2 || [];
          while (c = comment()) {
            if (c !== false) {
              rules2.push(c);
            }
          }
          return rules2;
        }
        function comment() {
          var pos = position();
          if (css.charAt(0) != "/" || css.charAt(1) != "*")
            return;
          var i = 2;
          while (css.charAt(i) != "" && (css.charAt(i) != "*" || css.charAt(i + 1) != "/"))
            ++i;
          i += 2;
          if (css.charAt(i - 1) === "") {
            return error("End of comment missing");
          }
          var str = css.slice(2, i - 2);
          column += 2;
          updatePosition(str);
          css = css.slice(i);
          column += 2;
          return pos({
            type: "comment",
            comment: str
          });
        }
        function selector() {
          var m = match(/^([^{]+)/);
          if (!m)
            return;
          return trim(m[0]).replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, "").replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function(m2) {
            return m2.replace(/,/g, "\u200C");
          }).split(/\s*(?![^(]*\)),\s*/).map(function(s) {
            return s.replace(/\u200C/g, ",");
          });
        }
        function declaration() {
          var pos = position();
          var prop = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
          if (!prop)
            return;
          prop = trim(prop[0]);
          if (!match(/^:\s*/))
            return error("property missing ':'");
          var val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);
          var ret = pos({
            type: "declaration",
            property: prop.replace(commentre, ""),
            value: val ? trim(val[0]).replace(commentre, "") : ""
          });
          match(/^[;\s]*/);
          return ret;
        }
        function declarations() {
          var decls = [];
          if (!open())
            return error("missing '{'");
          comments(decls);
          var decl;
          while (decl = declaration()) {
            if (decl !== false) {
              decls.push(decl);
              comments(decls);
            }
          }
          if (!close())
            return error("missing '}'");
          return decls;
        }
        function keyframe() {
          var m;
          var vals = [];
          var pos = position();
          while (m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/)) {
            vals.push(m[1]);
            match(/^,\s*/);
          }
          if (!vals.length)
            return;
          return pos({
            type: "keyframe",
            values: vals,
            declarations: declarations()
          });
        }
        function atkeyframes() {
          var pos = position();
          var m = match(/^@([-\w]+)?keyframes\s*/);
          if (!m)
            return;
          var vendor = m[1];
          var m = match(/^([-\w]+)\s*/);
          if (!m)
            return error("@keyframes missing name");
          var name = m[1];
          if (!open())
            return error("@keyframes missing '{'");
          var frame;
          var frames = comments();
          while (frame = keyframe()) {
            frames.push(frame);
            frames = frames.concat(comments());
          }
          if (!close())
            return error("@keyframes missing '}'");
          return pos({
            type: "keyframes",
            name,
            vendor,
            keyframes: frames
          });
        }
        function atsupports() {
          var pos = position();
          var m = match(/^@supports *([^{]+)/);
          if (!m)
            return;
          var supports = trim(m[1]);
          if (!open())
            return error("@supports missing '{'");
          var style = comments().concat(rules());
          if (!close())
            return error("@supports missing '}'");
          return pos({
            type: "supports",
            supports,
            rules: style
          });
        }
        function athost() {
          var pos = position();
          var m = match(/^@host\s*/);
          if (!m)
            return;
          if (!open())
            return error("@host missing '{'");
          var style = comments().concat(rules());
          if (!close())
            return error("@host missing '}'");
          return pos({
            type: "host",
            rules: style
          });
        }
        function atmedia() {
          var pos = position();
          var m = match(/^@media *([^{]+)/);
          if (!m)
            return;
          var media = trim(m[1]);
          if (!open())
            return error("@media missing '{'");
          var style = comments().concat(rules());
          if (!close())
            return error("@media missing '}'");
          return pos({
            type: "media",
            media,
            rules: style
          });
        }
        function atcustommedia() {
          var pos = position();
          var m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
          if (!m)
            return;
          return pos({
            type: "custom-media",
            name: trim(m[1]),
            media: trim(m[2])
          });
        }
        function atpage() {
          var pos = position();
          var m = match(/^@page */);
          if (!m)
            return;
          var sel = selector() || [];
          if (!open())
            return error("@page missing '{'");
          var decls = comments();
          var decl;
          while (decl = declaration()) {
            decls.push(decl);
            decls = decls.concat(comments());
          }
          if (!close())
            return error("@page missing '}'");
          return pos({
            type: "page",
            selectors: sel,
            declarations: decls
          });
        }
        function atdocument() {
          var pos = position();
          var m = match(/^@([-\w]+)?document *([^{]+)/);
          if (!m)
            return;
          var vendor = trim(m[1]);
          var doc = trim(m[2]);
          if (!open())
            return error("@document missing '{'");
          var style = comments().concat(rules());
          if (!close())
            return error("@document missing '}'");
          return pos({
            type: "document",
            document: doc,
            vendor,
            rules: style
          });
        }
        function atfontface() {
          var pos = position();
          var m = match(/^@font-face\s*/);
          if (!m)
            return;
          if (!open())
            return error("@font-face missing '{'");
          var decls = comments();
          var decl;
          while (decl = declaration()) {
            decls.push(decl);
            decls = decls.concat(comments());
          }
          if (!close())
            return error("@font-face missing '}'");
          return pos({
            type: "font-face",
            declarations: decls
          });
        }
        var atimport = _compileAtrule("import");
        var atcharset = _compileAtrule("charset");
        var atnamespace = _compileAtrule("namespace");
        function _compileAtrule(name) {
          var re = new RegExp("^@" + name + "\\s*([^;]+);");
          return function() {
            var pos = position();
            var m = match(re);
            if (!m)
              return;
            var ret = { type: name };
            ret[name] = m[1].trim();
            return pos(ret);
          };
        }
        function atrule() {
          if (css[0] != "@")
            return;
          return atkeyframes() || atmedia() || atcustommedia() || atsupports() || atimport() || atcharset() || atnamespace() || atdocument() || atpage() || athost() || atfontface();
        }
        function rule() {
          var pos = position();
          var sel = selector();
          if (!sel)
            return error("selector missing");
          comments();
          return pos({
            type: "rule",
            selectors: sel,
            declarations: declarations()
          });
        }
        return addParent(stylesheet());
      };
      function trim(str) {
        return str ? str.replace(/^\s+|\s+$/g, "") : "";
      }
      function addParent(obj, parent) {
        var isNode = obj && typeof obj.type === "string";
        var childParent = isNode ? obj : parent;
        for (var k in obj) {
          var value = obj[k];
          if (Array.isArray(value)) {
            value.forEach(function(v) {
              addParent(v, childParent);
            });
          } else if (value && typeof value === "object") {
            addParent(value, childParent);
          }
        }
        if (isNode) {
          Object.defineProperty(obj, "parent", {
            configurable: true,
            writable: true,
            enumerable: false,
            value: parent || null
          });
        }
        return obj;
      }
    }
  });

  // node_modules/css/lib/stringify/compiler.js
  var require_compiler = __commonJS({
    "node_modules/css/lib/stringify/compiler.js"(exports, module) {
      module.exports = Compiler;
      function Compiler(opts) {
        this.options = opts || {};
      }
      Compiler.prototype.emit = function(str) {
        return str;
      };
      Compiler.prototype.visit = function(node) {
        return this[node.type](node);
      };
      Compiler.prototype.mapVisit = function(nodes, delim) {
        var buf = "";
        delim = delim || "";
        for (var i = 0, length = nodes.length; i < length; i++) {
          buf += this.visit(nodes[i]);
          if (delim && i < length - 1)
            buf += this.emit(delim);
        }
        return buf;
      };
    }
  });

  // node_modules/inherits/inherits_browser.js
  var require_inherits_browser = __commonJS({
    "node_modules/inherits/inherits_browser.js"(exports, module) {
      if (typeof Object.create === "function") {
        module.exports = function inherits(ctor, superCtor) {
          if (superCtor) {
            ctor.super_ = superCtor;
            ctor.prototype = Object.create(superCtor.prototype, {
              constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
              }
            });
          }
        };
      } else {
        module.exports = function inherits(ctor, superCtor) {
          if (superCtor) {
            ctor.super_ = superCtor;
            var TempCtor = function() {
            };
            TempCtor.prototype = superCtor.prototype;
            ctor.prototype = new TempCtor();
            ctor.prototype.constructor = ctor;
          }
        };
      }
    }
  });

  // node_modules/css/lib/stringify/compress.js
  var require_compress = __commonJS({
    "node_modules/css/lib/stringify/compress.js"(exports, module) {
      var Base = require_compiler();
      var inherits = require_inherits_browser();
      module.exports = Compiler;
      function Compiler(options) {
        Base.call(this, options);
      }
      inherits(Compiler, Base);
      Compiler.prototype.compile = function(node) {
        return node.stylesheet.rules.map(this.visit, this).join("");
      };
      Compiler.prototype.comment = function(node) {
        return this.emit("", node.position);
      };
      Compiler.prototype.import = function(node) {
        return this.emit("@import " + node.import + ";", node.position);
      };
      Compiler.prototype.media = function(node) {
        return this.emit("@media " + node.media, node.position) + this.emit("{") + this.mapVisit(node.rules) + this.emit("}");
      };
      Compiler.prototype.document = function(node) {
        var doc = "@" + (node.vendor || "") + "document " + node.document;
        return this.emit(doc, node.position) + this.emit("{") + this.mapVisit(node.rules) + this.emit("}");
      };
      Compiler.prototype.charset = function(node) {
        return this.emit("@charset " + node.charset + ";", node.position);
      };
      Compiler.prototype.namespace = function(node) {
        return this.emit("@namespace " + node.namespace + ";", node.position);
      };
      Compiler.prototype.supports = function(node) {
        return this.emit("@supports " + node.supports, node.position) + this.emit("{") + this.mapVisit(node.rules) + this.emit("}");
      };
      Compiler.prototype.keyframes = function(node) {
        return this.emit("@" + (node.vendor || "") + "keyframes " + node.name, node.position) + this.emit("{") + this.mapVisit(node.keyframes) + this.emit("}");
      };
      Compiler.prototype.keyframe = function(node) {
        var decls = node.declarations;
        return this.emit(node.values.join(","), node.position) + this.emit("{") + this.mapVisit(decls) + this.emit("}");
      };
      Compiler.prototype.page = function(node) {
        var sel = node.selectors.length ? node.selectors.join(", ") : "";
        return this.emit("@page " + sel, node.position) + this.emit("{") + this.mapVisit(node.declarations) + this.emit("}");
      };
      Compiler.prototype["font-face"] = function(node) {
        return this.emit("@font-face", node.position) + this.emit("{") + this.mapVisit(node.declarations) + this.emit("}");
      };
      Compiler.prototype.host = function(node) {
        return this.emit("@host", node.position) + this.emit("{") + this.mapVisit(node.rules) + this.emit("}");
      };
      Compiler.prototype["custom-media"] = function(node) {
        return this.emit("@custom-media " + node.name + " " + node.media + ";", node.position);
      };
      Compiler.prototype.rule = function(node) {
        var decls = node.declarations;
        if (!decls.length)
          return "";
        return this.emit(node.selectors.join(","), node.position) + this.emit("{") + this.mapVisit(decls) + this.emit("}");
      };
      Compiler.prototype.declaration = function(node) {
        return this.emit(node.property + ":" + node.value, node.position) + this.emit(";");
      };
    }
  });

  // node_modules/css/lib/stringify/identity.js
  var require_identity = __commonJS({
    "node_modules/css/lib/stringify/identity.js"(exports, module) {
      var Base = require_compiler();
      var inherits = require_inherits_browser();
      module.exports = Compiler;
      function Compiler(options) {
        options = options || {};
        Base.call(this, options);
        this.indentation = options.indent;
      }
      inherits(Compiler, Base);
      Compiler.prototype.compile = function(node) {
        return this.stylesheet(node);
      };
      Compiler.prototype.stylesheet = function(node) {
        return this.mapVisit(node.stylesheet.rules, "\n\n");
      };
      Compiler.prototype.comment = function(node) {
        return this.emit(this.indent() + "/*" + node.comment + "*/", node.position);
      };
      Compiler.prototype.import = function(node) {
        return this.emit("@import " + node.import + ";", node.position);
      };
      Compiler.prototype.media = function(node) {
        return this.emit("@media " + node.media, node.position) + this.emit(" {\n" + this.indent(1)) + this.mapVisit(node.rules, "\n\n") + this.emit(this.indent(-1) + "\n}");
      };
      Compiler.prototype.document = function(node) {
        var doc = "@" + (node.vendor || "") + "document " + node.document;
        return this.emit(doc, node.position) + this.emit("  {\n" + this.indent(1)) + this.mapVisit(node.rules, "\n\n") + this.emit(this.indent(-1) + "\n}");
      };
      Compiler.prototype.charset = function(node) {
        return this.emit("@charset " + node.charset + ";", node.position);
      };
      Compiler.prototype.namespace = function(node) {
        return this.emit("@namespace " + node.namespace + ";", node.position);
      };
      Compiler.prototype.supports = function(node) {
        return this.emit("@supports " + node.supports, node.position) + this.emit(" {\n" + this.indent(1)) + this.mapVisit(node.rules, "\n\n") + this.emit(this.indent(-1) + "\n}");
      };
      Compiler.prototype.keyframes = function(node) {
        return this.emit("@" + (node.vendor || "") + "keyframes " + node.name, node.position) + this.emit(" {\n" + this.indent(1)) + this.mapVisit(node.keyframes, "\n") + this.emit(this.indent(-1) + "}");
      };
      Compiler.prototype.keyframe = function(node) {
        var decls = node.declarations;
        return this.emit(this.indent()) + this.emit(node.values.join(", "), node.position) + this.emit(" {\n" + this.indent(1)) + this.mapVisit(decls, "\n") + this.emit(this.indent(-1) + "\n" + this.indent() + "}\n");
      };
      Compiler.prototype.page = function(node) {
        var sel = node.selectors.length ? node.selectors.join(", ") + " " : "";
        return this.emit("@page " + sel, node.position) + this.emit("{\n") + this.emit(this.indent(1)) + this.mapVisit(node.declarations, "\n") + this.emit(this.indent(-1)) + this.emit("\n}");
      };
      Compiler.prototype["font-face"] = function(node) {
        return this.emit("@font-face ", node.position) + this.emit("{\n") + this.emit(this.indent(1)) + this.mapVisit(node.declarations, "\n") + this.emit(this.indent(-1)) + this.emit("\n}");
      };
      Compiler.prototype.host = function(node) {
        return this.emit("@host", node.position) + this.emit(" {\n" + this.indent(1)) + this.mapVisit(node.rules, "\n\n") + this.emit(this.indent(-1) + "\n}");
      };
      Compiler.prototype["custom-media"] = function(node) {
        return this.emit("@custom-media " + node.name + " " + node.media + ";", node.position);
      };
      Compiler.prototype.rule = function(node) {
        var indent = this.indent();
        var decls = node.declarations;
        if (!decls.length)
          return "";
        return this.emit(node.selectors.map(function(s) {
          return indent + s;
        }).join(",\n"), node.position) + this.emit(" {\n") + this.emit(this.indent(1)) + this.mapVisit(decls, "\n") + this.emit(this.indent(-1)) + this.emit("\n" + this.indent() + "}");
      };
      Compiler.prototype.declaration = function(node) {
        return this.emit(this.indent()) + this.emit(node.property + ": " + node.value, node.position) + this.emit(";");
      };
      Compiler.prototype.indent = function(level) {
        this.level = this.level || 1;
        if (level != null) {
          this.level += level;
          return "";
        }
        return Array(this.level).join(this.indentation || "  ");
      };
    }
  });

  // node_modules/source-map/lib/base64.js
  var require_base64 = __commonJS({
    "node_modules/source-map/lib/base64.js"(exports) {
      var intToCharMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
      exports.encode = function(number) {
        if (0 <= number && number < intToCharMap.length) {
          return intToCharMap[number];
        }
        throw new TypeError("Must be between 0 and 63: " + number);
      };
      exports.decode = function(charCode) {
        var bigA = 65;
        var bigZ = 90;
        var littleA = 97;
        var littleZ = 122;
        var zero = 48;
        var nine = 57;
        var plus = 43;
        var slash = 47;
        var littleOffset = 26;
        var numberOffset = 52;
        if (bigA <= charCode && charCode <= bigZ) {
          return charCode - bigA;
        }
        if (littleA <= charCode && charCode <= littleZ) {
          return charCode - littleA + littleOffset;
        }
        if (zero <= charCode && charCode <= nine) {
          return charCode - zero + numberOffset;
        }
        if (charCode == plus) {
          return 62;
        }
        if (charCode == slash) {
          return 63;
        }
        return -1;
      };
    }
  });

  // node_modules/source-map/lib/base64-vlq.js
  var require_base64_vlq = __commonJS({
    "node_modules/source-map/lib/base64-vlq.js"(exports) {
      var base64 = require_base64();
      var VLQ_BASE_SHIFT = 5;
      var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
      var VLQ_BASE_MASK = VLQ_BASE - 1;
      var VLQ_CONTINUATION_BIT = VLQ_BASE;
      function toVLQSigned(aValue) {
        return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
      }
      function fromVLQSigned(aValue) {
        var isNegative = (aValue & 1) === 1;
        var shifted = aValue >> 1;
        return isNegative ? -shifted : shifted;
      }
      exports.encode = function base64VLQ_encode(aValue) {
        var encoded = "";
        var digit;
        var vlq = toVLQSigned(aValue);
        do {
          digit = vlq & VLQ_BASE_MASK;
          vlq >>>= VLQ_BASE_SHIFT;
          if (vlq > 0) {
            digit |= VLQ_CONTINUATION_BIT;
          }
          encoded += base64.encode(digit);
        } while (vlq > 0);
        return encoded;
      };
      exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
        var strLen = aStr.length;
        var result = 0;
        var shift = 0;
        var continuation, digit;
        do {
          if (aIndex >= strLen) {
            throw new Error("Expected more digits in base 64 VLQ value.");
          }
          digit = base64.decode(aStr.charCodeAt(aIndex++));
          if (digit === -1) {
            throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
          }
          continuation = !!(digit & VLQ_CONTINUATION_BIT);
          digit &= VLQ_BASE_MASK;
          result = result + (digit << shift);
          shift += VLQ_BASE_SHIFT;
        } while (continuation);
        aOutParam.value = fromVLQSigned(result);
        aOutParam.rest = aIndex;
      };
    }
  });

  // node_modules/source-map/lib/util.js
  var require_util = __commonJS({
    "node_modules/source-map/lib/util.js"(exports) {
      function getArg(aArgs, aName, aDefaultValue) {
        if (aName in aArgs) {
          return aArgs[aName];
        } else if (arguments.length === 3) {
          return aDefaultValue;
        } else {
          throw new Error('"' + aName + '" is a required argument.');
        }
      }
      exports.getArg = getArg;
      var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
      var dataUrlRegexp = /^data:.+\,.+$/;
      function urlParse(aUrl) {
        var match = aUrl.match(urlRegexp);
        if (!match) {
          return null;
        }
        return {
          scheme: match[1],
          auth: match[2],
          host: match[3],
          port: match[4],
          path: match[5]
        };
      }
      exports.urlParse = urlParse;
      function urlGenerate(aParsedUrl) {
        var url = "";
        if (aParsedUrl.scheme) {
          url += aParsedUrl.scheme + ":";
        }
        url += "//";
        if (aParsedUrl.auth) {
          url += aParsedUrl.auth + "@";
        }
        if (aParsedUrl.host) {
          url += aParsedUrl.host;
        }
        if (aParsedUrl.port) {
          url += ":" + aParsedUrl.port;
        }
        if (aParsedUrl.path) {
          url += aParsedUrl.path;
        }
        return url;
      }
      exports.urlGenerate = urlGenerate;
      function normalize(aPath) {
        var path = aPath;
        var url = urlParse(aPath);
        if (url) {
          if (!url.path) {
            return aPath;
          }
          path = url.path;
        }
        var isAbsolute = exports.isAbsolute(path);
        var parts = path.split(/\/+/);
        for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
          part = parts[i];
          if (part === ".") {
            parts.splice(i, 1);
          } else if (part === "..") {
            up++;
          } else if (up > 0) {
            if (part === "") {
              parts.splice(i + 1, up);
              up = 0;
            } else {
              parts.splice(i, 2);
              up--;
            }
          }
        }
        path = parts.join("/");
        if (path === "") {
          path = isAbsolute ? "/" : ".";
        }
        if (url) {
          url.path = path;
          return urlGenerate(url);
        }
        return path;
      }
      exports.normalize = normalize;
      function join(aRoot, aPath) {
        if (aRoot === "") {
          aRoot = ".";
        }
        if (aPath === "") {
          aPath = ".";
        }
        var aPathUrl = urlParse(aPath);
        var aRootUrl = urlParse(aRoot);
        if (aRootUrl) {
          aRoot = aRootUrl.path || "/";
        }
        if (aPathUrl && !aPathUrl.scheme) {
          if (aRootUrl) {
            aPathUrl.scheme = aRootUrl.scheme;
          }
          return urlGenerate(aPathUrl);
        }
        if (aPathUrl || aPath.match(dataUrlRegexp)) {
          return aPath;
        }
        if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
          aRootUrl.host = aPath;
          return urlGenerate(aRootUrl);
        }
        var joined = aPath.charAt(0) === "/" ? aPath : normalize(aRoot.replace(/\/+$/, "") + "/" + aPath);
        if (aRootUrl) {
          aRootUrl.path = joined;
          return urlGenerate(aRootUrl);
        }
        return joined;
      }
      exports.join = join;
      exports.isAbsolute = function(aPath) {
        return aPath.charAt(0) === "/" || urlRegexp.test(aPath);
      };
      function relative(aRoot, aPath) {
        if (aRoot === "") {
          aRoot = ".";
        }
        aRoot = aRoot.replace(/\/$/, "");
        var level = 0;
        while (aPath.indexOf(aRoot + "/") !== 0) {
          var index = aRoot.lastIndexOf("/");
          if (index < 0) {
            return aPath;
          }
          aRoot = aRoot.slice(0, index);
          if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
            return aPath;
          }
          ++level;
        }
        return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
      }
      exports.relative = relative;
      var supportsNullProto = function() {
        var obj = /* @__PURE__ */ Object.create(null);
        return !("__proto__" in obj);
      }();
      function identity2(s) {
        return s;
      }
      function toSetString(aStr) {
        if (isProtoString(aStr)) {
          return "$" + aStr;
        }
        return aStr;
      }
      exports.toSetString = supportsNullProto ? identity2 : toSetString;
      function fromSetString(aStr) {
        if (isProtoString(aStr)) {
          return aStr.slice(1);
        }
        return aStr;
      }
      exports.fromSetString = supportsNullProto ? identity2 : fromSetString;
      function isProtoString(s) {
        if (!s) {
          return false;
        }
        var length = s.length;
        if (length < 9) {
          return false;
        }
        if (s.charCodeAt(length - 1) !== 95 || s.charCodeAt(length - 2) !== 95 || s.charCodeAt(length - 3) !== 111 || s.charCodeAt(length - 4) !== 116 || s.charCodeAt(length - 5) !== 111 || s.charCodeAt(length - 6) !== 114 || s.charCodeAt(length - 7) !== 112 || s.charCodeAt(length - 8) !== 95 || s.charCodeAt(length - 9) !== 95) {
          return false;
        }
        for (var i = length - 10; i >= 0; i--) {
          if (s.charCodeAt(i) !== 36) {
            return false;
          }
        }
        return true;
      }
      function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
        var cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp !== 0 || onlyCompareOriginal) {
          return cmp;
        }
        cmp = mappingA.generatedColumn - mappingB.generatedColumn;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp !== 0) {
          return cmp;
        }
        return strcmp(mappingA.name, mappingB.name);
      }
      exports.compareByOriginalPositions = compareByOriginalPositions;
      function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
        var cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.generatedColumn - mappingB.generatedColumn;
        if (cmp !== 0 || onlyCompareGenerated) {
          return cmp;
        }
        cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp !== 0) {
          return cmp;
        }
        return strcmp(mappingA.name, mappingB.name);
      }
      exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;
      function strcmp(aStr1, aStr2) {
        if (aStr1 === aStr2) {
          return 0;
        }
        if (aStr1 === null) {
          return 1;
        }
        if (aStr2 === null) {
          return -1;
        }
        if (aStr1 > aStr2) {
          return 1;
        }
        return -1;
      }
      function compareByGeneratedPositionsInflated(mappingA, mappingB) {
        var cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.generatedColumn - mappingB.generatedColumn;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp !== 0) {
          return cmp;
        }
        return strcmp(mappingA.name, mappingB.name);
      }
      exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;
      function parseSourceMapInput(str) {
        return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ""));
      }
      exports.parseSourceMapInput = parseSourceMapInput;
      function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
        sourceURL = sourceURL || "";
        if (sourceRoot) {
          if (sourceRoot[sourceRoot.length - 1] !== "/" && sourceURL[0] !== "/") {
            sourceRoot += "/";
          }
          sourceURL = sourceRoot + sourceURL;
        }
        if (sourceMapURL) {
          var parsed = urlParse(sourceMapURL);
          if (!parsed) {
            throw new Error("sourceMapURL could not be parsed");
          }
          if (parsed.path) {
            var index = parsed.path.lastIndexOf("/");
            if (index >= 0) {
              parsed.path = parsed.path.substring(0, index + 1);
            }
          }
          sourceURL = join(urlGenerate(parsed), sourceURL);
        }
        return normalize(sourceURL);
      }
      exports.computeSourceURL = computeSourceURL;
    }
  });

  // node_modules/source-map/lib/array-set.js
  var require_array_set = __commonJS({
    "node_modules/source-map/lib/array-set.js"(exports) {
      var util = require_util();
      var has = Object.prototype.hasOwnProperty;
      var hasNativeMap = typeof Map !== "undefined";
      function ArraySet() {
        this._array = [];
        this._set = hasNativeMap ? /* @__PURE__ */ new Map() : /* @__PURE__ */ Object.create(null);
      }
      ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
        var set = new ArraySet();
        for (var i = 0, len = aArray.length; i < len; i++) {
          set.add(aArray[i], aAllowDuplicates);
        }
        return set;
      };
      ArraySet.prototype.size = function ArraySet_size() {
        return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
      };
      ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
        var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
        var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
        var idx = this._array.length;
        if (!isDuplicate || aAllowDuplicates) {
          this._array.push(aStr);
        }
        if (!isDuplicate) {
          if (hasNativeMap) {
            this._set.set(aStr, idx);
          } else {
            this._set[sStr] = idx;
          }
        }
      };
      ArraySet.prototype.has = function ArraySet_has(aStr) {
        if (hasNativeMap) {
          return this._set.has(aStr);
        } else {
          var sStr = util.toSetString(aStr);
          return has.call(this._set, sStr);
        }
      };
      ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
        if (hasNativeMap) {
          var idx = this._set.get(aStr);
          if (idx >= 0) {
            return idx;
          }
        } else {
          var sStr = util.toSetString(aStr);
          if (has.call(this._set, sStr)) {
            return this._set[sStr];
          }
        }
        throw new Error('"' + aStr + '" is not in the set.');
      };
      ArraySet.prototype.at = function ArraySet_at(aIdx) {
        if (aIdx >= 0 && aIdx < this._array.length) {
          return this._array[aIdx];
        }
        throw new Error("No element indexed by " + aIdx);
      };
      ArraySet.prototype.toArray = function ArraySet_toArray() {
        return this._array.slice();
      };
      exports.ArraySet = ArraySet;
    }
  });

  // node_modules/source-map/lib/mapping-list.js
  var require_mapping_list = __commonJS({
    "node_modules/source-map/lib/mapping-list.js"(exports) {
      var util = require_util();
      function generatedPositionAfter(mappingA, mappingB) {
        var lineA = mappingA.generatedLine;
        var lineB = mappingB.generatedLine;
        var columnA = mappingA.generatedColumn;
        var columnB = mappingB.generatedColumn;
        return lineB > lineA || lineB == lineA && columnB >= columnA || util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
      }
      function MappingList() {
        this._array = [];
        this._sorted = true;
        this._last = { generatedLine: -1, generatedColumn: 0 };
      }
      MappingList.prototype.unsortedForEach = function MappingList_forEach(aCallback, aThisArg) {
        this._array.forEach(aCallback, aThisArg);
      };
      MappingList.prototype.add = function MappingList_add(aMapping) {
        if (generatedPositionAfter(this._last, aMapping)) {
          this._last = aMapping;
          this._array.push(aMapping);
        } else {
          this._sorted = false;
          this._array.push(aMapping);
        }
      };
      MappingList.prototype.toArray = function MappingList_toArray() {
        if (!this._sorted) {
          this._array.sort(util.compareByGeneratedPositionsInflated);
          this._sorted = true;
        }
        return this._array;
      };
      exports.MappingList = MappingList;
    }
  });

  // node_modules/source-map/lib/source-map-generator.js
  var require_source_map_generator = __commonJS({
    "node_modules/source-map/lib/source-map-generator.js"(exports) {
      var base64VLQ = require_base64_vlq();
      var util = require_util();
      var ArraySet = require_array_set().ArraySet;
      var MappingList = require_mapping_list().MappingList;
      function SourceMapGenerator(aArgs) {
        if (!aArgs) {
          aArgs = {};
        }
        this._file = util.getArg(aArgs, "file", null);
        this._sourceRoot = util.getArg(aArgs, "sourceRoot", null);
        this._skipValidation = util.getArg(aArgs, "skipValidation", false);
        this._sources = new ArraySet();
        this._names = new ArraySet();
        this._mappings = new MappingList();
        this._sourcesContents = null;
      }
      SourceMapGenerator.prototype._version = 3;
      SourceMapGenerator.fromSourceMap = function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
        var sourceRoot = aSourceMapConsumer.sourceRoot;
        var generator = new SourceMapGenerator({
          file: aSourceMapConsumer.file,
          sourceRoot
        });
        aSourceMapConsumer.eachMapping(function(mapping) {
          var newMapping = {
            generated: {
              line: mapping.generatedLine,
              column: mapping.generatedColumn
            }
          };
          if (mapping.source != null) {
            newMapping.source = mapping.source;
            if (sourceRoot != null) {
              newMapping.source = util.relative(sourceRoot, newMapping.source);
            }
            newMapping.original = {
              line: mapping.originalLine,
              column: mapping.originalColumn
            };
            if (mapping.name != null) {
              newMapping.name = mapping.name;
            }
          }
          generator.addMapping(newMapping);
        });
        aSourceMapConsumer.sources.forEach(function(sourceFile) {
          var sourceRelative = sourceFile;
          if (sourceRoot !== null) {
            sourceRelative = util.relative(sourceRoot, sourceFile);
          }
          if (!generator._sources.has(sourceRelative)) {
            generator._sources.add(sourceRelative);
          }
          var content = aSourceMapConsumer.sourceContentFor(sourceFile);
          if (content != null) {
            generator.setSourceContent(sourceFile, content);
          }
        });
        return generator;
      };
      SourceMapGenerator.prototype.addMapping = function SourceMapGenerator_addMapping(aArgs) {
        var generated = util.getArg(aArgs, "generated");
        var original = util.getArg(aArgs, "original", null);
        var source = util.getArg(aArgs, "source", null);
        var name = util.getArg(aArgs, "name", null);
        if (!this._skipValidation) {
          this._validateMapping(generated, original, source, name);
        }
        if (source != null) {
          source = String(source);
          if (!this._sources.has(source)) {
            this._sources.add(source);
          }
        }
        if (name != null) {
          name = String(name);
          if (!this._names.has(name)) {
            this._names.add(name);
          }
        }
        this._mappings.add({
          generatedLine: generated.line,
          generatedColumn: generated.column,
          originalLine: original != null && original.line,
          originalColumn: original != null && original.column,
          source,
          name
        });
      };
      SourceMapGenerator.prototype.setSourceContent = function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
        var source = aSourceFile;
        if (this._sourceRoot != null) {
          source = util.relative(this._sourceRoot, source);
        }
        if (aSourceContent != null) {
          if (!this._sourcesContents) {
            this._sourcesContents = /* @__PURE__ */ Object.create(null);
          }
          this._sourcesContents[util.toSetString(source)] = aSourceContent;
        } else if (this._sourcesContents) {
          delete this._sourcesContents[util.toSetString(source)];
          if (Object.keys(this._sourcesContents).length === 0) {
            this._sourcesContents = null;
          }
        }
      };
      SourceMapGenerator.prototype.applySourceMap = function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
        var sourceFile = aSourceFile;
        if (aSourceFile == null) {
          if (aSourceMapConsumer.file == null) {
            throw new Error(`SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, or the source map's "file" property. Both were omitted.`);
          }
          sourceFile = aSourceMapConsumer.file;
        }
        var sourceRoot = this._sourceRoot;
        if (sourceRoot != null) {
          sourceFile = util.relative(sourceRoot, sourceFile);
        }
        var newSources = new ArraySet();
        var newNames = new ArraySet();
        this._mappings.unsortedForEach(function(mapping) {
          if (mapping.source === sourceFile && mapping.originalLine != null) {
            var original = aSourceMapConsumer.originalPositionFor({
              line: mapping.originalLine,
              column: mapping.originalColumn
            });
            if (original.source != null) {
              mapping.source = original.source;
              if (aSourceMapPath != null) {
                mapping.source = util.join(aSourceMapPath, mapping.source);
              }
              if (sourceRoot != null) {
                mapping.source = util.relative(sourceRoot, mapping.source);
              }
              mapping.originalLine = original.line;
              mapping.originalColumn = original.column;
              if (original.name != null) {
                mapping.name = original.name;
              }
            }
          }
          var source = mapping.source;
          if (source != null && !newSources.has(source)) {
            newSources.add(source);
          }
          var name = mapping.name;
          if (name != null && !newNames.has(name)) {
            newNames.add(name);
          }
        }, this);
        this._sources = newSources;
        this._names = newNames;
        aSourceMapConsumer.sources.forEach(function(sourceFile2) {
          var content = aSourceMapConsumer.sourceContentFor(sourceFile2);
          if (content != null) {
            if (aSourceMapPath != null) {
              sourceFile2 = util.join(aSourceMapPath, sourceFile2);
            }
            if (sourceRoot != null) {
              sourceFile2 = util.relative(sourceRoot, sourceFile2);
            }
            this.setSourceContent(sourceFile2, content);
          }
        }, this);
      };
      SourceMapGenerator.prototype._validateMapping = function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource, aName) {
        if (aOriginal && typeof aOriginal.line !== "number" && typeof aOriginal.column !== "number") {
          throw new Error("original.line and original.column are not numbers -- you probably meant to omit the original mapping entirely and only map the generated position. If so, pass null for the original mapping instead of an object with empty or null values.");
        }
        if (aGenerated && "line" in aGenerated && "column" in aGenerated && aGenerated.line > 0 && aGenerated.column >= 0 && !aOriginal && !aSource && !aName) {
          return;
        } else if (aGenerated && "line" in aGenerated && "column" in aGenerated && aOriginal && "line" in aOriginal && "column" in aOriginal && aGenerated.line > 0 && aGenerated.column >= 0 && aOriginal.line > 0 && aOriginal.column >= 0 && aSource) {
          return;
        } else {
          throw new Error("Invalid mapping: " + JSON.stringify({
            generated: aGenerated,
            source: aSource,
            original: aOriginal,
            name: aName
          }));
        }
      };
      SourceMapGenerator.prototype._serializeMappings = function SourceMapGenerator_serializeMappings() {
        var previousGeneratedColumn = 0;
        var previousGeneratedLine = 1;
        var previousOriginalColumn = 0;
        var previousOriginalLine = 0;
        var previousName = 0;
        var previousSource = 0;
        var result = "";
        var next;
        var mapping;
        var nameIdx;
        var sourceIdx;
        var mappings = this._mappings.toArray();
        for (var i = 0, len = mappings.length; i < len; i++) {
          mapping = mappings[i];
          next = "";
          if (mapping.generatedLine !== previousGeneratedLine) {
            previousGeneratedColumn = 0;
            while (mapping.generatedLine !== previousGeneratedLine) {
              next += ";";
              previousGeneratedLine++;
            }
          } else {
            if (i > 0) {
              if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
                continue;
              }
              next += ",";
            }
          }
          next += base64VLQ.encode(mapping.generatedColumn - previousGeneratedColumn);
          previousGeneratedColumn = mapping.generatedColumn;
          if (mapping.source != null) {
            sourceIdx = this._sources.indexOf(mapping.source);
            next += base64VLQ.encode(sourceIdx - previousSource);
            previousSource = sourceIdx;
            next += base64VLQ.encode(mapping.originalLine - 1 - previousOriginalLine);
            previousOriginalLine = mapping.originalLine - 1;
            next += base64VLQ.encode(mapping.originalColumn - previousOriginalColumn);
            previousOriginalColumn = mapping.originalColumn;
            if (mapping.name != null) {
              nameIdx = this._names.indexOf(mapping.name);
              next += base64VLQ.encode(nameIdx - previousName);
              previousName = nameIdx;
            }
          }
          result += next;
        }
        return result;
      };
      SourceMapGenerator.prototype._generateSourcesContent = function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
        return aSources.map(function(source) {
          if (!this._sourcesContents) {
            return null;
          }
          if (aSourceRoot != null) {
            source = util.relative(aSourceRoot, source);
          }
          var key = util.toSetString(source);
          return Object.prototype.hasOwnProperty.call(this._sourcesContents, key) ? this._sourcesContents[key] : null;
        }, this);
      };
      SourceMapGenerator.prototype.toJSON = function SourceMapGenerator_toJSON() {
        var map3 = {
          version: this._version,
          sources: this._sources.toArray(),
          names: this._names.toArray(),
          mappings: this._serializeMappings()
        };
        if (this._file != null) {
          map3.file = this._file;
        }
        if (this._sourceRoot != null) {
          map3.sourceRoot = this._sourceRoot;
        }
        if (this._sourcesContents) {
          map3.sourcesContent = this._generateSourcesContent(map3.sources, map3.sourceRoot);
        }
        return map3;
      };
      SourceMapGenerator.prototype.toString = function SourceMapGenerator_toString() {
        return JSON.stringify(this.toJSON());
      };
      exports.SourceMapGenerator = SourceMapGenerator;
    }
  });

  // node_modules/source-map/lib/binary-search.js
  var require_binary_search = __commonJS({
    "node_modules/source-map/lib/binary-search.js"(exports) {
      exports.GREATEST_LOWER_BOUND = 1;
      exports.LEAST_UPPER_BOUND = 2;
      function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
        var mid = Math.floor((aHigh - aLow) / 2) + aLow;
        var cmp = aCompare(aNeedle, aHaystack[mid], true);
        if (cmp === 0) {
          return mid;
        } else if (cmp > 0) {
          if (aHigh - mid > 1) {
            return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
          }
          if (aBias == exports.LEAST_UPPER_BOUND) {
            return aHigh < aHaystack.length ? aHigh : -1;
          } else {
            return mid;
          }
        } else {
          if (mid - aLow > 1) {
            return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
          }
          if (aBias == exports.LEAST_UPPER_BOUND) {
            return mid;
          } else {
            return aLow < 0 ? -1 : aLow;
          }
        }
      }
      exports.search = function search2(aNeedle, aHaystack, aCompare, aBias) {
        if (aHaystack.length === 0) {
          return -1;
        }
        var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare, aBias || exports.GREATEST_LOWER_BOUND);
        if (index < 0) {
          return -1;
        }
        while (index - 1 >= 0) {
          if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
            break;
          }
          --index;
        }
        return index;
      };
    }
  });

  // node_modules/source-map/lib/quick-sort.js
  var require_quick_sort = __commonJS({
    "node_modules/source-map/lib/quick-sort.js"(exports) {
      function swap(ary, x, y) {
        var temp = ary[x];
        ary[x] = ary[y];
        ary[y] = temp;
      }
      function randomIntInRange(low, high) {
        return Math.round(low + Math.random() * (high - low));
      }
      function doQuickSort(ary, comparator, p, r) {
        if (p < r) {
          var pivotIndex = randomIntInRange(p, r);
          var i = p - 1;
          swap(ary, pivotIndex, r);
          var pivot = ary[r];
          for (var j = p; j < r; j++) {
            if (comparator(ary[j], pivot) <= 0) {
              i += 1;
              swap(ary, i, j);
            }
          }
          swap(ary, i + 1, j);
          var q = i + 1;
          doQuickSort(ary, comparator, p, q - 1);
          doQuickSort(ary, comparator, q + 1, r);
        }
      }
      exports.quickSort = function(ary, comparator) {
        doQuickSort(ary, comparator, 0, ary.length - 1);
      };
    }
  });

  // node_modules/source-map/lib/source-map-consumer.js
  var require_source_map_consumer = __commonJS({
    "node_modules/source-map/lib/source-map-consumer.js"(exports) {
      var util = require_util();
      var binarySearch = require_binary_search();
      var ArraySet = require_array_set().ArraySet;
      var base64VLQ = require_base64_vlq();
      var quickSort = require_quick_sort().quickSort;
      function SourceMapConsumer(aSourceMap, aSourceMapURL) {
        var sourceMap = aSourceMap;
        if (typeof aSourceMap === "string") {
          sourceMap = util.parseSourceMapInput(aSourceMap);
        }
        return sourceMap.sections != null ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL) : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
      }
      SourceMapConsumer.fromSourceMap = function(aSourceMap, aSourceMapURL) {
        return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
      };
      SourceMapConsumer.prototype._version = 3;
      SourceMapConsumer.prototype.__generatedMappings = null;
      Object.defineProperty(SourceMapConsumer.prototype, "_generatedMappings", {
        configurable: true,
        enumerable: true,
        get: function() {
          if (!this.__generatedMappings) {
            this._parseMappings(this._mappings, this.sourceRoot);
          }
          return this.__generatedMappings;
        }
      });
      SourceMapConsumer.prototype.__originalMappings = null;
      Object.defineProperty(SourceMapConsumer.prototype, "_originalMappings", {
        configurable: true,
        enumerable: true,
        get: function() {
          if (!this.__originalMappings) {
            this._parseMappings(this._mappings, this.sourceRoot);
          }
          return this.__originalMappings;
        }
      });
      SourceMapConsumer.prototype._charIsMappingSeparator = function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
        var c = aStr.charAt(index);
        return c === ";" || c === ",";
      };
      SourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
        throw new Error("Subclasses must implement _parseMappings");
      };
      SourceMapConsumer.GENERATED_ORDER = 1;
      SourceMapConsumer.ORIGINAL_ORDER = 2;
      SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
      SourceMapConsumer.LEAST_UPPER_BOUND = 2;
      SourceMapConsumer.prototype.eachMapping = function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
        var context = aContext || null;
        var order = aOrder || SourceMapConsumer.GENERATED_ORDER;
        var mappings;
        switch (order) {
          case SourceMapConsumer.GENERATED_ORDER:
            mappings = this._generatedMappings;
            break;
          case SourceMapConsumer.ORIGINAL_ORDER:
            mappings = this._originalMappings;
            break;
          default:
            throw new Error("Unknown order of iteration.");
        }
        var sourceRoot = this.sourceRoot;
        mappings.map(function(mapping) {
          var source = mapping.source === null ? null : this._sources.at(mapping.source);
          source = util.computeSourceURL(sourceRoot, source, this._sourceMapURL);
          return {
            source,
            generatedLine: mapping.generatedLine,
            generatedColumn: mapping.generatedColumn,
            originalLine: mapping.originalLine,
            originalColumn: mapping.originalColumn,
            name: mapping.name === null ? null : this._names.at(mapping.name)
          };
        }, this).forEach(aCallback, context);
      };
      SourceMapConsumer.prototype.allGeneratedPositionsFor = function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
        var line = util.getArg(aArgs, "line");
        var needle = {
          source: util.getArg(aArgs, "source"),
          originalLine: line,
          originalColumn: util.getArg(aArgs, "column", 0)
        };
        needle.source = this._findSourceIndex(needle.source);
        if (needle.source < 0) {
          return [];
        }
        var mappings = [];
        var index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions, binarySearch.LEAST_UPPER_BOUND);
        if (index >= 0) {
          var mapping = this._originalMappings[index];
          if (aArgs.column === void 0) {
            var originalLine = mapping.originalLine;
            while (mapping && mapping.originalLine === originalLine) {
              mappings.push({
                line: util.getArg(mapping, "generatedLine", null),
                column: util.getArg(mapping, "generatedColumn", null),
                lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
              });
              mapping = this._originalMappings[++index];
            }
          } else {
            var originalColumn = mapping.originalColumn;
            while (mapping && mapping.originalLine === line && mapping.originalColumn == originalColumn) {
              mappings.push({
                line: util.getArg(mapping, "generatedLine", null),
                column: util.getArg(mapping, "generatedColumn", null),
                lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
              });
              mapping = this._originalMappings[++index];
            }
          }
        }
        return mappings;
      };
      exports.SourceMapConsumer = SourceMapConsumer;
      function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
        var sourceMap = aSourceMap;
        if (typeof aSourceMap === "string") {
          sourceMap = util.parseSourceMapInput(aSourceMap);
        }
        var version = util.getArg(sourceMap, "version");
        var sources = util.getArg(sourceMap, "sources");
        var names = util.getArg(sourceMap, "names", []);
        var sourceRoot = util.getArg(sourceMap, "sourceRoot", null);
        var sourcesContent = util.getArg(sourceMap, "sourcesContent", null);
        var mappings = util.getArg(sourceMap, "mappings");
        var file = util.getArg(sourceMap, "file", null);
        if (version != this._version) {
          throw new Error("Unsupported version: " + version);
        }
        if (sourceRoot) {
          sourceRoot = util.normalize(sourceRoot);
        }
        sources = sources.map(String).map(util.normalize).map(function(source) {
          return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source) ? util.relative(sourceRoot, source) : source;
        });
        this._names = ArraySet.fromArray(names.map(String), true);
        this._sources = ArraySet.fromArray(sources, true);
        this._absoluteSources = this._sources.toArray().map(function(s) {
          return util.computeSourceURL(sourceRoot, s, aSourceMapURL);
        });
        this.sourceRoot = sourceRoot;
        this.sourcesContent = sourcesContent;
        this._mappings = mappings;
        this._sourceMapURL = aSourceMapURL;
        this.file = file;
      }
      BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
      BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;
      BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
        var relativeSource = aSource;
        if (this.sourceRoot != null) {
          relativeSource = util.relative(this.sourceRoot, relativeSource);
        }
        if (this._sources.has(relativeSource)) {
          return this._sources.indexOf(relativeSource);
        }
        var i;
        for (i = 0; i < this._absoluteSources.length; ++i) {
          if (this._absoluteSources[i] == aSource) {
            return i;
          }
        }
        return -1;
      };
      BasicSourceMapConsumer.fromSourceMap = function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
        var smc = Object.create(BasicSourceMapConsumer.prototype);
        var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
        var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
        smc.sourceRoot = aSourceMap._sourceRoot;
        smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(), smc.sourceRoot);
        smc.file = aSourceMap._file;
        smc._sourceMapURL = aSourceMapURL;
        smc._absoluteSources = smc._sources.toArray().map(function(s) {
          return util.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
        });
        var generatedMappings = aSourceMap._mappings.toArray().slice();
        var destGeneratedMappings = smc.__generatedMappings = [];
        var destOriginalMappings = smc.__originalMappings = [];
        for (var i = 0, length = generatedMappings.length; i < length; i++) {
          var srcMapping = generatedMappings[i];
          var destMapping = new Mapping();
          destMapping.generatedLine = srcMapping.generatedLine;
          destMapping.generatedColumn = srcMapping.generatedColumn;
          if (srcMapping.source) {
            destMapping.source = sources.indexOf(srcMapping.source);
            destMapping.originalLine = srcMapping.originalLine;
            destMapping.originalColumn = srcMapping.originalColumn;
            if (srcMapping.name) {
              destMapping.name = names.indexOf(srcMapping.name);
            }
            destOriginalMappings.push(destMapping);
          }
          destGeneratedMappings.push(destMapping);
        }
        quickSort(smc.__originalMappings, util.compareByOriginalPositions);
        return smc;
      };
      BasicSourceMapConsumer.prototype._version = 3;
      Object.defineProperty(BasicSourceMapConsumer.prototype, "sources", {
        get: function() {
          return this._absoluteSources.slice();
        }
      });
      function Mapping() {
        this.generatedLine = 0;
        this.generatedColumn = 0;
        this.source = null;
        this.originalLine = null;
        this.originalColumn = null;
        this.name = null;
      }
      BasicSourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
        var generatedLine = 1;
        var previousGeneratedColumn = 0;
        var previousOriginalLine = 0;
        var previousOriginalColumn = 0;
        var previousSource = 0;
        var previousName = 0;
        var length = aStr.length;
        var index = 0;
        var cachedSegments = {};
        var temp = {};
        var originalMappings = [];
        var generatedMappings = [];
        var mapping, str, segment, end, value;
        while (index < length) {
          if (aStr.charAt(index) === ";") {
            generatedLine++;
            index++;
            previousGeneratedColumn = 0;
          } else if (aStr.charAt(index) === ",") {
            index++;
          } else {
            mapping = new Mapping();
            mapping.generatedLine = generatedLine;
            for (end = index; end < length; end++) {
              if (this._charIsMappingSeparator(aStr, end)) {
                break;
              }
            }
            str = aStr.slice(index, end);
            segment = cachedSegments[str];
            if (segment) {
              index += str.length;
            } else {
              segment = [];
              while (index < end) {
                base64VLQ.decode(aStr, index, temp);
                value = temp.value;
                index = temp.rest;
                segment.push(value);
              }
              if (segment.length === 2) {
                throw new Error("Found a source, but no line and column");
              }
              if (segment.length === 3) {
                throw new Error("Found a source and line, but no column");
              }
              cachedSegments[str] = segment;
            }
            mapping.generatedColumn = previousGeneratedColumn + segment[0];
            previousGeneratedColumn = mapping.generatedColumn;
            if (segment.length > 1) {
              mapping.source = previousSource + segment[1];
              previousSource += segment[1];
              mapping.originalLine = previousOriginalLine + segment[2];
              previousOriginalLine = mapping.originalLine;
              mapping.originalLine += 1;
              mapping.originalColumn = previousOriginalColumn + segment[3];
              previousOriginalColumn = mapping.originalColumn;
              if (segment.length > 4) {
                mapping.name = previousName + segment[4];
                previousName += segment[4];
              }
            }
            generatedMappings.push(mapping);
            if (typeof mapping.originalLine === "number") {
              originalMappings.push(mapping);
            }
          }
        }
        quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated);
        this.__generatedMappings = generatedMappings;
        quickSort(originalMappings, util.compareByOriginalPositions);
        this.__originalMappings = originalMappings;
      };
      BasicSourceMapConsumer.prototype._findMapping = function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName, aColumnName, aComparator, aBias) {
        if (aNeedle[aLineName] <= 0) {
          throw new TypeError("Line must be greater than or equal to 1, got " + aNeedle[aLineName]);
        }
        if (aNeedle[aColumnName] < 0) {
          throw new TypeError("Column must be greater than or equal to 0, got " + aNeedle[aColumnName]);
        }
        return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
      };
      BasicSourceMapConsumer.prototype.computeColumnSpans = function SourceMapConsumer_computeColumnSpans() {
        for (var index = 0; index < this._generatedMappings.length; ++index) {
          var mapping = this._generatedMappings[index];
          if (index + 1 < this._generatedMappings.length) {
            var nextMapping = this._generatedMappings[index + 1];
            if (mapping.generatedLine === nextMapping.generatedLine) {
              mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
              continue;
            }
          }
          mapping.lastGeneratedColumn = Infinity;
        }
      };
      BasicSourceMapConsumer.prototype.originalPositionFor = function SourceMapConsumer_originalPositionFor(aArgs) {
        var needle = {
          generatedLine: util.getArg(aArgs, "line"),
          generatedColumn: util.getArg(aArgs, "column")
        };
        var index = this._findMapping(needle, this._generatedMappings, "generatedLine", "generatedColumn", util.compareByGeneratedPositionsDeflated, util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND));
        if (index >= 0) {
          var mapping = this._generatedMappings[index];
          if (mapping.generatedLine === needle.generatedLine) {
            var source = util.getArg(mapping, "source", null);
            if (source !== null) {
              source = this._sources.at(source);
              source = util.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
            }
            var name = util.getArg(mapping, "name", null);
            if (name !== null) {
              name = this._names.at(name);
            }
            return {
              source,
              line: util.getArg(mapping, "originalLine", null),
              column: util.getArg(mapping, "originalColumn", null),
              name
            };
          }
        }
        return {
          source: null,
          line: null,
          column: null,
          name: null
        };
      };
      BasicSourceMapConsumer.prototype.hasContentsOfAllSources = function BasicSourceMapConsumer_hasContentsOfAllSources() {
        if (!this.sourcesContent) {
          return false;
        }
        return this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function(sc) {
          return sc == null;
        });
      };
      BasicSourceMapConsumer.prototype.sourceContentFor = function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
        if (!this.sourcesContent) {
          return null;
        }
        var index = this._findSourceIndex(aSource);
        if (index >= 0) {
          return this.sourcesContent[index];
        }
        var relativeSource = aSource;
        if (this.sourceRoot != null) {
          relativeSource = util.relative(this.sourceRoot, relativeSource);
        }
        var url;
        if (this.sourceRoot != null && (url = util.urlParse(this.sourceRoot))) {
          var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
          if (url.scheme == "file" && this._sources.has(fileUriAbsPath)) {
            return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];
          }
          if ((!url.path || url.path == "/") && this._sources.has("/" + relativeSource)) {
            return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
          }
        }
        if (nullOnMissing) {
          return null;
        } else {
          throw new Error('"' + relativeSource + '" is not in the SourceMap.');
        }
      };
      BasicSourceMapConsumer.prototype.generatedPositionFor = function SourceMapConsumer_generatedPositionFor(aArgs) {
        var source = util.getArg(aArgs, "source");
        source = this._findSourceIndex(source);
        if (source < 0) {
          return {
            line: null,
            column: null,
            lastColumn: null
          };
        }
        var needle = {
          source,
          originalLine: util.getArg(aArgs, "line"),
          originalColumn: util.getArg(aArgs, "column")
        };
        var index = this._findMapping(needle, this._originalMappings, "originalLine", "originalColumn", util.compareByOriginalPositions, util.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND));
        if (index >= 0) {
          var mapping = this._originalMappings[index];
          if (mapping.source === needle.source) {
            return {
              line: util.getArg(mapping, "generatedLine", null),
              column: util.getArg(mapping, "generatedColumn", null),
              lastColumn: util.getArg(mapping, "lastGeneratedColumn", null)
            };
          }
        }
        return {
          line: null,
          column: null,
          lastColumn: null
        };
      };
      exports.BasicSourceMapConsumer = BasicSourceMapConsumer;
      function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
        var sourceMap = aSourceMap;
        if (typeof aSourceMap === "string") {
          sourceMap = util.parseSourceMapInput(aSourceMap);
        }
        var version = util.getArg(sourceMap, "version");
        var sections = util.getArg(sourceMap, "sections");
        if (version != this._version) {
          throw new Error("Unsupported version: " + version);
        }
        this._sources = new ArraySet();
        this._names = new ArraySet();
        var lastOffset = {
          line: -1,
          column: 0
        };
        this._sections = sections.map(function(s) {
          if (s.url) {
            throw new Error("Support for url field in sections not implemented.");
          }
          var offset = util.getArg(s, "offset");
          var offsetLine = util.getArg(offset, "line");
          var offsetColumn = util.getArg(offset, "column");
          if (offsetLine < lastOffset.line || offsetLine === lastOffset.line && offsetColumn < lastOffset.column) {
            throw new Error("Section offsets must be ordered and non-overlapping.");
          }
          lastOffset = offset;
          return {
            generatedOffset: {
              generatedLine: offsetLine + 1,
              generatedColumn: offsetColumn + 1
            },
            consumer: new SourceMapConsumer(util.getArg(s, "map"), aSourceMapURL)
          };
        });
      }
      IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
      IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;
      IndexedSourceMapConsumer.prototype._version = 3;
      Object.defineProperty(IndexedSourceMapConsumer.prototype, "sources", {
        get: function() {
          var sources = [];
          for (var i = 0; i < this._sections.length; i++) {
            for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
              sources.push(this._sections[i].consumer.sources[j]);
            }
          }
          return sources;
        }
      });
      IndexedSourceMapConsumer.prototype.originalPositionFor = function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
        var needle = {
          generatedLine: util.getArg(aArgs, "line"),
          generatedColumn: util.getArg(aArgs, "column")
        };
        var sectionIndex = binarySearch.search(needle, this._sections, function(needle2, section2) {
          var cmp = needle2.generatedLine - section2.generatedOffset.generatedLine;
          if (cmp) {
            return cmp;
          }
          return needle2.generatedColumn - section2.generatedOffset.generatedColumn;
        });
        var section = this._sections[sectionIndex];
        if (!section) {
          return {
            source: null,
            line: null,
            column: null,
            name: null
          };
        }
        return section.consumer.originalPositionFor({
          line: needle.generatedLine - (section.generatedOffset.generatedLine - 1),
          column: needle.generatedColumn - (section.generatedOffset.generatedLine === needle.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
          bias: aArgs.bias
        });
      };
      IndexedSourceMapConsumer.prototype.hasContentsOfAllSources = function IndexedSourceMapConsumer_hasContentsOfAllSources() {
        return this._sections.every(function(s) {
          return s.consumer.hasContentsOfAllSources();
        });
      };
      IndexedSourceMapConsumer.prototype.sourceContentFor = function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
        for (var i = 0; i < this._sections.length; i++) {
          var section = this._sections[i];
          var content = section.consumer.sourceContentFor(aSource, true);
          if (content) {
            return content;
          }
        }
        if (nullOnMissing) {
          return null;
        } else {
          throw new Error('"' + aSource + '" is not in the SourceMap.');
        }
      };
      IndexedSourceMapConsumer.prototype.generatedPositionFor = function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
        for (var i = 0; i < this._sections.length; i++) {
          var section = this._sections[i];
          if (section.consumer._findSourceIndex(util.getArg(aArgs, "source")) === -1) {
            continue;
          }
          var generatedPosition = section.consumer.generatedPositionFor(aArgs);
          if (generatedPosition) {
            var ret = {
              line: generatedPosition.line + (section.generatedOffset.generatedLine - 1),
              column: generatedPosition.column + (section.generatedOffset.generatedLine === generatedPosition.line ? section.generatedOffset.generatedColumn - 1 : 0)
            };
            return ret;
          }
        }
        return {
          line: null,
          column: null
        };
      };
      IndexedSourceMapConsumer.prototype._parseMappings = function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        for (var i = 0; i < this._sections.length; i++) {
          var section = this._sections[i];
          var sectionMappings = section.consumer._generatedMappings;
          for (var j = 0; j < sectionMappings.length; j++) {
            var mapping = sectionMappings[j];
            var source = section.consumer._sources.at(mapping.source);
            source = util.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
            this._sources.add(source);
            source = this._sources.indexOf(source);
            var name = null;
            if (mapping.name) {
              name = section.consumer._names.at(mapping.name);
              this._names.add(name);
              name = this._names.indexOf(name);
            }
            var adjustedMapping = {
              source,
              generatedLine: mapping.generatedLine + (section.generatedOffset.generatedLine - 1),
              generatedColumn: mapping.generatedColumn + (section.generatedOffset.generatedLine === mapping.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
              originalLine: mapping.originalLine,
              originalColumn: mapping.originalColumn,
              name
            };
            this.__generatedMappings.push(adjustedMapping);
            if (typeof adjustedMapping.originalLine === "number") {
              this.__originalMappings.push(adjustedMapping);
            }
          }
        }
        quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
        quickSort(this.__originalMappings, util.compareByOriginalPositions);
      };
      exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;
    }
  });

  // node_modules/source-map/lib/source-node.js
  var require_source_node = __commonJS({
    "node_modules/source-map/lib/source-node.js"(exports) {
      var SourceMapGenerator = require_source_map_generator().SourceMapGenerator;
      var util = require_util();
      var REGEX_NEWLINE = /(\r?\n)/;
      var NEWLINE_CODE = 10;
      var isSourceNode = "$$$isSourceNode$$$";
      function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
        this.children = [];
        this.sourceContents = {};
        this.line = aLine == null ? null : aLine;
        this.column = aColumn == null ? null : aColumn;
        this.source = aSource == null ? null : aSource;
        this.name = aName == null ? null : aName;
        this[isSourceNode] = true;
        if (aChunks != null)
          this.add(aChunks);
      }
      SourceNode.fromStringWithSourceMap = function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
        var node = new SourceNode();
        var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
        var remainingLinesIndex = 0;
        var shiftNextLine = function() {
          var lineContents = getNextLine();
          var newLine = getNextLine() || "";
          return lineContents + newLine;
          function getNextLine() {
            return remainingLinesIndex < remainingLines.length ? remainingLines[remainingLinesIndex++] : void 0;
          }
        };
        var lastGeneratedLine = 1, lastGeneratedColumn = 0;
        var lastMapping = null;
        aSourceMapConsumer.eachMapping(function(mapping) {
          if (lastMapping !== null) {
            if (lastGeneratedLine < mapping.generatedLine) {
              addMappingWithCode(lastMapping, shiftNextLine());
              lastGeneratedLine++;
              lastGeneratedColumn = 0;
            } else {
              var nextLine = remainingLines[remainingLinesIndex] || "";
              var code = nextLine.substr(0, mapping.generatedColumn - lastGeneratedColumn);
              remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn - lastGeneratedColumn);
              lastGeneratedColumn = mapping.generatedColumn;
              addMappingWithCode(lastMapping, code);
              lastMapping = mapping;
              return;
            }
          }
          while (lastGeneratedLine < mapping.generatedLine) {
            node.add(shiftNextLine());
            lastGeneratedLine++;
          }
          if (lastGeneratedColumn < mapping.generatedColumn) {
            var nextLine = remainingLines[remainingLinesIndex] || "";
            node.add(nextLine.substr(0, mapping.generatedColumn));
            remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
          }
          lastMapping = mapping;
        }, this);
        if (remainingLinesIndex < remainingLines.length) {
          if (lastMapping) {
            addMappingWithCode(lastMapping, shiftNextLine());
          }
          node.add(remainingLines.splice(remainingLinesIndex).join(""));
        }
        aSourceMapConsumer.sources.forEach(function(sourceFile) {
          var content = aSourceMapConsumer.sourceContentFor(sourceFile);
          if (content != null) {
            if (aRelativePath != null) {
              sourceFile = util.join(aRelativePath, sourceFile);
            }
            node.setSourceContent(sourceFile, content);
          }
        });
        return node;
        function addMappingWithCode(mapping, code) {
          if (mapping === null || mapping.source === void 0) {
            node.add(code);
          } else {
            var source = aRelativePath ? util.join(aRelativePath, mapping.source) : mapping.source;
            node.add(new SourceNode(mapping.originalLine, mapping.originalColumn, source, code, mapping.name));
          }
        }
      };
      SourceNode.prototype.add = function SourceNode_add(aChunk) {
        if (Array.isArray(aChunk)) {
          aChunk.forEach(function(chunk) {
            this.add(chunk);
          }, this);
        } else if (aChunk[isSourceNode] || typeof aChunk === "string") {
          if (aChunk) {
            this.children.push(aChunk);
          }
        } else {
          throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
        }
        return this;
      };
      SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
        if (Array.isArray(aChunk)) {
          for (var i = aChunk.length - 1; i >= 0; i--) {
            this.prepend(aChunk[i]);
          }
        } else if (aChunk[isSourceNode] || typeof aChunk === "string") {
          this.children.unshift(aChunk);
        } else {
          throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk);
        }
        return this;
      };
      SourceNode.prototype.walk = function SourceNode_walk(aFn) {
        var chunk;
        for (var i = 0, len = this.children.length; i < len; i++) {
          chunk = this.children[i];
          if (chunk[isSourceNode]) {
            chunk.walk(aFn);
          } else {
            if (chunk !== "") {
              aFn(chunk, {
                source: this.source,
                line: this.line,
                column: this.column,
                name: this.name
              });
            }
          }
        }
      };
      SourceNode.prototype.join = function SourceNode_join(aSep) {
        var newChildren;
        var i;
        var len = this.children.length;
        if (len > 0) {
          newChildren = [];
          for (i = 0; i < len - 1; i++) {
            newChildren.push(this.children[i]);
            newChildren.push(aSep);
          }
          newChildren.push(this.children[i]);
          this.children = newChildren;
        }
        return this;
      };
      SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
        var lastChild = this.children[this.children.length - 1];
        if (lastChild[isSourceNode]) {
          lastChild.replaceRight(aPattern, aReplacement);
        } else if (typeof lastChild === "string") {
          this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
        } else {
          this.children.push("".replace(aPattern, aReplacement));
        }
        return this;
      };
      SourceNode.prototype.setSourceContent = function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
        this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
      };
      SourceNode.prototype.walkSourceContents = function SourceNode_walkSourceContents(aFn) {
        for (var i = 0, len = this.children.length; i < len; i++) {
          if (this.children[i][isSourceNode]) {
            this.children[i].walkSourceContents(aFn);
          }
        }
        var sources = Object.keys(this.sourceContents);
        for (var i = 0, len = sources.length; i < len; i++) {
          aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
        }
      };
      SourceNode.prototype.toString = function SourceNode_toString() {
        var str = "";
        this.walk(function(chunk) {
          str += chunk;
        });
        return str;
      };
      SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
        var generated = {
          code: "",
          line: 1,
          column: 0
        };
        var map3 = new SourceMapGenerator(aArgs);
        var sourceMappingActive = false;
        var lastOriginalSource = null;
        var lastOriginalLine = null;
        var lastOriginalColumn = null;
        var lastOriginalName = null;
        this.walk(function(chunk, original) {
          generated.code += chunk;
          if (original.source !== null && original.line !== null && original.column !== null) {
            if (lastOriginalSource !== original.source || lastOriginalLine !== original.line || lastOriginalColumn !== original.column || lastOriginalName !== original.name) {
              map3.addMapping({
                source: original.source,
                original: {
                  line: original.line,
                  column: original.column
                },
                generated: {
                  line: generated.line,
                  column: generated.column
                },
                name: original.name
              });
            }
            lastOriginalSource = original.source;
            lastOriginalLine = original.line;
            lastOriginalColumn = original.column;
            lastOriginalName = original.name;
            sourceMappingActive = true;
          } else if (sourceMappingActive) {
            map3.addMapping({
              generated: {
                line: generated.line,
                column: generated.column
              }
            });
            lastOriginalSource = null;
            sourceMappingActive = false;
          }
          for (var idx = 0, length = chunk.length; idx < length; idx++) {
            if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
              generated.line++;
              generated.column = 0;
              if (idx + 1 === length) {
                lastOriginalSource = null;
                sourceMappingActive = false;
              } else if (sourceMappingActive) {
                map3.addMapping({
                  source: original.source,
                  original: {
                    line: original.line,
                    column: original.column
                  },
                  generated: {
                    line: generated.line,
                    column: generated.column
                  },
                  name: original.name
                });
              }
            } else {
              generated.column++;
            }
          }
        });
        this.walkSourceContents(function(sourceFile, sourceContent) {
          map3.setSourceContent(sourceFile, sourceContent);
        });
        return { code: generated.code, map: map3 };
      };
      exports.SourceNode = SourceNode;
    }
  });

  // node_modules/source-map/source-map.js
  var require_source_map = __commonJS({
    "node_modules/source-map/source-map.js"(exports) {
      exports.SourceMapGenerator = require_source_map_generator().SourceMapGenerator;
      exports.SourceMapConsumer = require_source_map_consumer().SourceMapConsumer;
      exports.SourceNode = require_source_node().SourceNode;
    }
  });

  // node_modules/atob/browser-atob.js
  var require_browser_atob = __commonJS({
    "node_modules/atob/browser-atob.js"(exports, module) {
      (function(w) {
        "use strict";
        function findBest(atobNative) {
          if (typeof atobNative === "function") {
            return atobNative;
          }
          if (typeof Buffer === "function") {
            return function atobBrowserify(a) {
              return new Buffer(a, "base64").toString("binary");
            };
          }
          if (typeof w.base64js === "object") {
            return function atobWebWorker_iOS(a) {
              var buf = w.base64js.b64ToByteArray(a);
              return Array.prototype.map.call(buf, function(ch) {
                return String.fromCharCode(ch);
              }).join("");
            };
          }
          return function() {
            throw new Error("You're probably in an old browser or an iOS webworker. It might help to include beatgammit's base64-js.");
          };
        }
        var atobBest = findBest(w.atob);
        w.atob = atobBest;
        if (typeof module === "object" && module && module.exports) {
          module.exports = atobBest;
        }
      })(window);
    }
  });

  // (disabled):url
  var require_url = __commonJS({
    "(disabled):url"() {
    }
  });

  // (disabled):path
  var require_path = __commonJS({
    "(disabled):path"() {
    }
  });

  // node_modules/decode-uri-component/index.js
  var require_decode_uri_component = __commonJS({
    "node_modules/decode-uri-component/index.js"(exports, module) {
      "use strict";
      var token = "%[a-f0-9]{2}";
      var singleMatcher = new RegExp(token, "gi");
      var multiMatcher = new RegExp("(" + token + ")+", "gi");
      function decodeComponents(components, split) {
        try {
          return decodeURIComponent(components.join(""));
        } catch (err) {
        }
        if (components.length === 1) {
          return components;
        }
        split = split || 1;
        var left = components.slice(0, split);
        var right = components.slice(split);
        return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
      }
      function decode(input) {
        try {
          return decodeURIComponent(input);
        } catch (err) {
          var tokens = input.match(singleMatcher);
          for (var i = 1; i < tokens.length; i++) {
            input = decodeComponents(tokens, i).join("");
            tokens = input.match(singleMatcher);
          }
          return input;
        }
      }
      function customDecodeURIComponent(input) {
        var replaceMap = {
          "%FE%FF": "\uFFFD\uFFFD",
          "%FF%FE": "\uFFFD\uFFFD"
        };
        var match = multiMatcher.exec(input);
        while (match) {
          try {
            replaceMap[match[0]] = decodeURIComponent(match[0]);
          } catch (err) {
            var result = decode(match[0]);
            if (result !== match[0]) {
              replaceMap[match[0]] = result;
            }
          }
          match = multiMatcher.exec(input);
        }
        replaceMap["%C2"] = "\uFFFD";
        var entries = Object.keys(replaceMap);
        for (var i = 0; i < entries.length; i++) {
          var key = entries[i];
          input = input.replace(new RegExp(key, "g"), replaceMap[key]);
        }
        return input;
      }
      module.exports = function(encodedURI) {
        if (typeof encodedURI !== "string") {
          throw new TypeError("Expected `encodedURI` to be of type `string`, got `" + typeof encodedURI + "`");
        }
        try {
          encodedURI = encodedURI.replace(/\+/g, " ");
          return decodeURIComponent(encodedURI);
        } catch (err) {
          return customDecodeURIComponent(encodedURI);
        }
      };
    }
  });

  // node_modules/source-map-resolve/index.js
  var require_source_map_resolve = __commonJS({
    "node_modules/source-map-resolve/index.js"(exports, module) {
      var atob = require_browser_atob();
      var urlLib = require_url();
      var pathLib = require_path();
      var decodeUriComponentLib = require_decode_uri_component();
      function resolveUrl() {
        return Array.prototype.reduce.call(arguments, function(resolved, nextUrl) {
          return urlLib.resolve(resolved, nextUrl);
        });
      }
      function convertWindowsPath(aPath) {
        return pathLib.sep === "\\" ? aPath.replace(/\\/g, "/").replace(/^[a-z]:\/?/i, "/") : aPath;
      }
      function customDecodeUriComponent(string) {
        return decodeUriComponentLib(string.replace(/\+/g, "%2B"));
      }
      function callbackAsync(callback, error, result) {
        setImmediate(function() {
          callback(error, result);
        });
      }
      function parseMapToJSON(string, data) {
        try {
          return JSON.parse(string.replace(/^\)\]\}'/, ""));
        } catch (error) {
          error.sourceMapData = data;
          throw error;
        }
      }
      function readSync(read2, url, data) {
        var readUrl = customDecodeUriComponent(url);
        try {
          return String(read2(readUrl));
        } catch (error) {
          error.sourceMapData = data;
          throw error;
        }
      }
      var innerRegex = /[#@] sourceMappingURL=([^\s'"]*)/;
      var sourceMappingURLRegex = RegExp("(?:/\\*(?:\\s*\r?\n(?://)?)?(?:" + innerRegex.source + ")\\s*\\*/|//(?:" + innerRegex.source + "))\\s*");
      function getSourceMappingUrl(code) {
        var match = code.match(sourceMappingURLRegex);
        return match ? match[1] || match[2] || "" : null;
      }
      function resolveSourceMap(code, codeUrl, read2, callback) {
        var mapData;
        try {
          mapData = resolveSourceMapHelper(code, codeUrl);
        } catch (error) {
          return callbackAsync(callback, error);
        }
        if (!mapData || mapData.map) {
          return callbackAsync(callback, null, mapData);
        }
        var readUrl = customDecodeUriComponent(mapData.url);
        read2(readUrl, function(error, result) {
          if (error) {
            error.sourceMapData = mapData;
            return callback(error);
          }
          mapData.map = String(result);
          try {
            mapData.map = parseMapToJSON(mapData.map, mapData);
          } catch (error2) {
            return callback(error2);
          }
          callback(null, mapData);
        });
      }
      function resolveSourceMapSync(code, codeUrl, read2) {
        var mapData = resolveSourceMapHelper(code, codeUrl);
        if (!mapData || mapData.map) {
          return mapData;
        }
        mapData.map = readSync(read2, mapData.url, mapData);
        mapData.map = parseMapToJSON(mapData.map, mapData);
        return mapData;
      }
      var dataUriRegex = /^data:([^,;]*)(;[^,;]*)*(?:,(.*))?$/;
      var jsonMimeTypeRegex = /^(?:application|text)\/json$/;
      var jsonCharacterEncoding = "utf-8";
      function base64ToBuf(b64) {
        var binStr = atob(b64);
        var len = binStr.length;
        var arr = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
          arr[i] = binStr.charCodeAt(i);
        }
        return arr;
      }
      function decodeBase64String(b64) {
        if (typeof TextDecoder === "undefined" || typeof Uint8Array === "undefined") {
          return atob(b64);
        }
        var buf = base64ToBuf(b64);
        var decoder = new TextDecoder(jsonCharacterEncoding, { fatal: true });
        return decoder.decode(buf);
      }
      function resolveSourceMapHelper(code, codeUrl) {
        codeUrl = convertWindowsPath(codeUrl);
        var url = getSourceMappingUrl(code);
        if (!url) {
          return null;
        }
        var dataUri = url.match(dataUriRegex);
        if (dataUri) {
          var mimeType = dataUri[1] || "text/plain";
          var lastParameter = dataUri[2] || "";
          var encoded = dataUri[3] || "";
          var data = {
            sourceMappingURL: url,
            url: null,
            sourcesRelativeTo: codeUrl,
            map: encoded
          };
          if (!jsonMimeTypeRegex.test(mimeType)) {
            var error = new Error("Unuseful data uri mime type: " + mimeType);
            error.sourceMapData = data;
            throw error;
          }
          try {
            data.map = parseMapToJSON(lastParameter === ";base64" ? decodeBase64String(encoded) : decodeURIComponent(encoded), data);
          } catch (error2) {
            error2.sourceMapData = data;
            throw error2;
          }
          return data;
        }
        var mapUrl = resolveUrl(codeUrl, url);
        return {
          sourceMappingURL: url,
          url: mapUrl,
          sourcesRelativeTo: mapUrl,
          map: null
        };
      }
      function resolveSources(map3, mapUrl, read2, options, callback) {
        if (typeof options === "function") {
          callback = options;
          options = {};
        }
        var pending = map3.sources ? map3.sources.length : 0;
        var result = {
          sourcesResolved: [],
          sourcesContent: []
        };
        if (pending === 0) {
          callbackAsync(callback, null, result);
          return;
        }
        var done = function() {
          pending--;
          if (pending === 0) {
            callback(null, result);
          }
        };
        resolveSourcesHelper(map3, mapUrl, options, function(fullUrl, sourceContent, index) {
          result.sourcesResolved[index] = fullUrl;
          if (typeof sourceContent === "string") {
            result.sourcesContent[index] = sourceContent;
            callbackAsync(done, null);
          } else {
            var readUrl = customDecodeUriComponent(fullUrl);
            read2(readUrl, function(error, source) {
              result.sourcesContent[index] = error ? error : String(source);
              done();
            });
          }
        });
      }
      function resolveSourcesSync(map3, mapUrl, read2, options) {
        var result = {
          sourcesResolved: [],
          sourcesContent: []
        };
        if (!map3.sources || map3.sources.length === 0) {
          return result;
        }
        resolveSourcesHelper(map3, mapUrl, options, function(fullUrl, sourceContent, index) {
          result.sourcesResolved[index] = fullUrl;
          if (read2 !== null) {
            if (typeof sourceContent === "string") {
              result.sourcesContent[index] = sourceContent;
            } else {
              var readUrl = customDecodeUriComponent(fullUrl);
              try {
                result.sourcesContent[index] = String(read2(readUrl));
              } catch (error) {
                result.sourcesContent[index] = error;
              }
            }
          }
        });
        return result;
      }
      var endingSlash = /\/?$/;
      function resolveSourcesHelper(map3, mapUrl, options, fn) {
        options = options || {};
        mapUrl = convertWindowsPath(mapUrl);
        var fullUrl;
        var sourceContent;
        var sourceRoot;
        for (var index = 0, len = map3.sources.length; index < len; index++) {
          sourceRoot = null;
          if (typeof options.sourceRoot === "string") {
            sourceRoot = options.sourceRoot;
          } else if (typeof map3.sourceRoot === "string" && options.sourceRoot !== false) {
            sourceRoot = map3.sourceRoot;
          }
          if (sourceRoot === null || sourceRoot === "") {
            fullUrl = resolveUrl(mapUrl, map3.sources[index]);
          } else {
            fullUrl = resolveUrl(mapUrl, sourceRoot.replace(endingSlash, "/"), map3.sources[index]);
          }
          sourceContent = (map3.sourcesContent || [])[index];
          fn(fullUrl, sourceContent, index);
        }
      }
      function resolve(code, codeUrl, read2, options, callback) {
        if (typeof options === "function") {
          callback = options;
          options = {};
        }
        if (code === null) {
          var mapUrl = codeUrl;
          var data = {
            sourceMappingURL: null,
            url: mapUrl,
            sourcesRelativeTo: mapUrl,
            map: null
          };
          var readUrl = customDecodeUriComponent(mapUrl);
          read2(readUrl, function(error, result) {
            if (error) {
              error.sourceMapData = data;
              return callback(error);
            }
            data.map = String(result);
            try {
              data.map = parseMapToJSON(data.map, data);
            } catch (error2) {
              return callback(error2);
            }
            _resolveSources(data);
          });
        } else {
          resolveSourceMap(code, codeUrl, read2, function(error, mapData) {
            if (error) {
              return callback(error);
            }
            if (!mapData) {
              return callback(null, null);
            }
            _resolveSources(mapData);
          });
        }
        function _resolveSources(mapData) {
          resolveSources(mapData.map, mapData.sourcesRelativeTo, read2, options, function(error, result) {
            if (error) {
              return callback(error);
            }
            mapData.sourcesResolved = result.sourcesResolved;
            mapData.sourcesContent = result.sourcesContent;
            callback(null, mapData);
          });
        }
      }
      function resolveSync(code, codeUrl, read2, options) {
        var mapData;
        if (code === null) {
          var mapUrl = codeUrl;
          mapData = {
            sourceMappingURL: null,
            url: mapUrl,
            sourcesRelativeTo: mapUrl,
            map: null
          };
          mapData.map = readSync(read2, mapUrl, mapData);
          mapData.map = parseMapToJSON(mapData.map, mapData);
        } else {
          mapData = resolveSourceMapSync(code, codeUrl, read2);
          if (!mapData) {
            return null;
          }
        }
        var result = resolveSourcesSync(mapData.map, mapData.sourcesRelativeTo, read2, options);
        mapData.sourcesResolved = result.sourcesResolved;
        mapData.sourcesContent = result.sourcesContent;
        return mapData;
      }
      module.exports = {
        resolveSourceMap,
        resolveSourceMapSync,
        resolveSources,
        resolveSourcesSync,
        resolve,
        resolveSync,
        parseMapToJSON
      };
    }
  });

  // (disabled):fs
  var require_fs = __commonJS({
    "(disabled):fs"() {
    }
  });

  // node_modules/css/lib/stringify/source-map-support.js
  var require_source_map_support = __commonJS({
    "node_modules/css/lib/stringify/source-map-support.js"(exports, module) {
      var SourceMap = require_source_map().SourceMapGenerator;
      var SourceMapConsumer = require_source_map().SourceMapConsumer;
      var sourceMapResolve = require_source_map_resolve();
      var fs = require_fs();
      var path = require_path();
      module.exports = mixin;
      var makeFriendlyPath = function(aPath) {
        return path.sep === "\\" ? aPath.replace(/\\/g, "/").replace(/^[a-z]:\/?/i, "/") : aPath;
      };
      function mixin(compiler) {
        compiler._comment = compiler.comment;
        compiler.map = new SourceMap();
        compiler.position = { line: 1, column: 1 };
        compiler.files = {};
        for (var k in exports)
          compiler[k] = exports[k];
      }
      exports.updatePosition = function(str) {
        var lines = str.match(/\n/g);
        if (lines)
          this.position.line += lines.length;
        var i = str.lastIndexOf("\n");
        this.position.column = ~i ? str.length - i : this.position.column + str.length;
      };
      exports.emit = function(str, pos) {
        if (pos) {
          var sourceFile = makeFriendlyPath(pos.source || "source.css");
          this.map.addMapping({
            source: sourceFile,
            generated: {
              line: this.position.line,
              column: Math.max(this.position.column - 1, 0)
            },
            original: {
              line: pos.start.line,
              column: pos.start.column - 1
            }
          });
          this.addFile(sourceFile, pos);
        }
        this.updatePosition(str);
        return str;
      };
      exports.addFile = function(file, pos) {
        if (typeof pos.content !== "string")
          return;
        if (Object.prototype.hasOwnProperty.call(this.files, file))
          return;
        this.files[file] = pos.content;
      };
      exports.applySourceMaps = function() {
        Object.keys(this.files).forEach(function(file) {
          var content = this.files[file];
          this.map.setSourceContent(file, content);
          if (this.options.inputSourcemaps !== false) {
            var originalMap = sourceMapResolve.resolveSync(content, file, fs.readFileSync);
            if (originalMap) {
              var map3 = new SourceMapConsumer(originalMap.map);
              var relativeTo = originalMap.sourcesRelativeTo;
              this.map.applySourceMap(map3, file, makeFriendlyPath(path.dirname(relativeTo)));
            }
          }
        }, this);
      };
      exports.comment = function(node) {
        if (/^# sourceMappingURL=/.test(node.comment))
          return this.emit("", node.position);
        else
          return this._comment(node);
      };
    }
  });

  // node_modules/css/lib/stringify/index.js
  var require_stringify = __commonJS({
    "node_modules/css/lib/stringify/index.js"(exports, module) {
      var Compressed = require_compress();
      var Identity = require_identity();
      module.exports = function(node, options) {
        options = options || {};
        var compiler = options.compress ? new Compressed(options) : new Identity(options);
        if (options.sourcemap) {
          var sourcemaps = require_source_map_support();
          sourcemaps(compiler);
          var code = compiler.compile(node);
          compiler.applySourceMaps();
          var map3 = options.sourcemap === "generator" ? compiler.map : compiler.map.toJSON();
          return { code, map: map3 };
        }
        var code = compiler.compile(node);
        return code;
      };
    }
  });

  // node_modules/css/index.js
  var require_css = __commonJS({
    "node_modules/css/index.js"(exports) {
      exports.parse = require_parse();
      exports.stringify = require_stringify();
    }
  });

  // src/commandline_frame.ts
  var commandline_frame_exports = {};
  __export(commandline_frame_exports, {
    clear: () => clear,
    editor_function: () => editor_function,
    enableCompletions: () => enableCompletions,
    fillcmdline: () => fillcmdline,
    focus: () => focus,
    getContent: () => getContent,
    refresh_completions: () => refresh_completions
  });

  // node_modules/fuse.js/dist/fuse.esm.js
  function isArray(value) {
    return !Array.isArray ? getTag(value) === "[object Array]" : Array.isArray(value);
  }
  var INFINITY = 1 / 0;
  function baseToString(value) {
    if (typeof value == "string") {
      return value;
    }
    let result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  function toString(value) {
    return value == null ? "" : baseToString(value);
  }
  function isString(value) {
    return typeof value === "string";
  }
  function isNumber(value) {
    return typeof value === "number";
  }
  function isBoolean(value) {
    return value === true || value === false || isObjectLike(value) && getTag(value) == "[object Boolean]";
  }
  function isObject(value) {
    return typeof value === "object";
  }
  function isObjectLike(value) {
    return isObject(value) && value !== null;
  }
  function isDefined(value) {
    return value !== void 0 && value !== null;
  }
  function isBlank(value) {
    return !value.trim().length;
  }
  function getTag(value) {
    return value == null ? value === void 0 ? "[object Undefined]" : "[object Null]" : Object.prototype.toString.call(value);
  }
  var INCORRECT_INDEX_TYPE = "Incorrect 'index' type";
  var LOGICAL_SEARCH_INVALID_QUERY_FOR_KEY = (key) => `Invalid value for key ${key}`;
  var PATTERN_LENGTH_TOO_LARGE = (max) => `Pattern length exceeds max of ${max}.`;
  var MISSING_KEY_PROPERTY = (name) => `Missing ${name} property in key`;
  var INVALID_KEY_WEIGHT_VALUE = (key) => `Property 'weight' in key '${key}' must be a positive integer`;
  var hasOwn = Object.prototype.hasOwnProperty;
  var KeyStore = class {
    constructor(keys4) {
      this._keys = [];
      this._keyMap = {};
      let totalWeight = 0;
      keys4.forEach((key) => {
        let obj = createKey(key);
        totalWeight += obj.weight;
        this._keys.push(obj);
        this._keyMap[obj.id] = obj;
        totalWeight += obj.weight;
      });
      this._keys.forEach((key) => {
        key.weight /= totalWeight;
      });
    }
    get(keyId) {
      return this._keyMap[keyId];
    }
    keys() {
      return this._keys;
    }
    toJSON() {
      return JSON.stringify(this._keys);
    }
  };
  function createKey(key) {
    let path = null;
    let id2 = null;
    let src = null;
    let weight = 1;
    if (isString(key) || isArray(key)) {
      src = key;
      path = createKeyPath(key);
      id2 = createKeyId(key);
    } else {
      if (!hasOwn.call(key, "name")) {
        throw new Error(MISSING_KEY_PROPERTY("name"));
      }
      const name = key.name;
      src = name;
      if (hasOwn.call(key, "weight")) {
        weight = key.weight;
        if (weight <= 0) {
          throw new Error(INVALID_KEY_WEIGHT_VALUE(name));
        }
      }
      path = createKeyPath(name);
      id2 = createKeyId(name);
    }
    return { path, id: id2, weight, src };
  }
  function createKeyPath(key) {
    return isArray(key) ? key : key.split(".");
  }
  function createKeyId(key) {
    return isArray(key) ? key.join(".") : key;
  }
  function get(obj, path) {
    let list = [];
    let arr = false;
    const deepGet = (obj2, path2, index) => {
      if (!isDefined(obj2)) {
        return;
      }
      if (!path2[index]) {
        list.push(obj2);
      } else {
        let key = path2[index];
        const value = obj2[key];
        if (!isDefined(value)) {
          return;
        }
        if (index === path2.length - 1 && (isString(value) || isNumber(value) || isBoolean(value))) {
          list.push(toString(value));
        } else if (isArray(value)) {
          arr = true;
          for (let i = 0, len = value.length; i < len; i += 1) {
            deepGet(value[i], path2, index + 1);
          }
        } else if (path2.length) {
          deepGet(value, path2, index + 1);
        }
      }
    };
    deepGet(obj, isString(path) ? path.split(".") : path, 0);
    return arr ? list : list[0];
  }
  var MatchOptions = {
    includeMatches: false,
    findAllMatches: false,
    minMatchCharLength: 1
  };
  var BasicOptions = {
    isCaseSensitive: false,
    includeScore: false,
    keys: [],
    shouldSort: true,
    sortFn: (a, b) => a.score === b.score ? a.idx < b.idx ? -1 : 1 : a.score < b.score ? -1 : 1
  };
  var FuzzyOptions = {
    location: 0,
    threshold: 0.6,
    distance: 100
  };
  var AdvancedOptions = {
    useExtendedSearch: false,
    getFn: get,
    ignoreLocation: false,
    ignoreFieldNorm: false,
    fieldNormWeight: 1
  };
  var Config = {
    ...BasicOptions,
    ...MatchOptions,
    ...FuzzyOptions,
    ...AdvancedOptions
  };
  var SPACE = /[^ ]+/g;
  function norm(weight = 1, mantissa = 3) {
    const cache = /* @__PURE__ */ new Map();
    const m = Math.pow(10, mantissa);
    return {
      get(value) {
        const numTokens = value.match(SPACE).length;
        if (cache.has(numTokens)) {
          return cache.get(numTokens);
        }
        const norm2 = 1 / Math.pow(numTokens, 0.5 * weight);
        const n = parseFloat(Math.round(norm2 * m) / m);
        cache.set(numTokens, n);
        return n;
      },
      clear() {
        cache.clear();
      }
    };
  }
  var FuseIndex = class {
    constructor({
      getFn = Config.getFn,
      fieldNormWeight = Config.fieldNormWeight
    } = {}) {
      this.norm = norm(fieldNormWeight, 3);
      this.getFn = getFn;
      this.isCreated = false;
      this.setIndexRecords();
    }
    setSources(docs = []) {
      this.docs = docs;
    }
    setIndexRecords(records = []) {
      this.records = records;
    }
    setKeys(keys4 = []) {
      this.keys = keys4;
      this._keysMap = {};
      keys4.forEach((key, idx) => {
        this._keysMap[key.id] = idx;
      });
    }
    create() {
      if (this.isCreated || !this.docs.length) {
        return;
      }
      this.isCreated = true;
      if (isString(this.docs[0])) {
        this.docs.forEach((doc, docIndex) => {
          this._addString(doc, docIndex);
        });
      } else {
        this.docs.forEach((doc, docIndex) => {
          this._addObject(doc, docIndex);
        });
      }
      this.norm.clear();
    }
    add(doc) {
      const idx = this.size();
      if (isString(doc)) {
        this._addString(doc, idx);
      } else {
        this._addObject(doc, idx);
      }
    }
    removeAt(idx) {
      this.records.splice(idx, 1);
      for (let i = idx, len = this.size(); i < len; i += 1) {
        this.records[i].i -= 1;
      }
    }
    getValueForItemAtKeyId(item, keyId) {
      return item[this._keysMap[keyId]];
    }
    size() {
      return this.records.length;
    }
    _addString(doc, docIndex) {
      if (!isDefined(doc) || isBlank(doc)) {
        return;
      }
      let record = {
        v: doc,
        i: docIndex,
        n: this.norm.get(doc)
      };
      this.records.push(record);
    }
    _addObject(doc, docIndex) {
      let record = { i: docIndex, $: {} };
      this.keys.forEach((key, keyIndex) => {
        let value = this.getFn(doc, key.path);
        if (!isDefined(value)) {
          return;
        }
        if (isArray(value)) {
          let subRecords = [];
          const stack = [{ nestedArrIndex: -1, value }];
          while (stack.length) {
            const { nestedArrIndex, value: value2 } = stack.pop();
            if (!isDefined(value2)) {
              continue;
            }
            if (isString(value2) && !isBlank(value2)) {
              let subRecord = {
                v: value2,
                i: nestedArrIndex,
                n: this.norm.get(value2)
              };
              subRecords.push(subRecord);
            } else if (isArray(value2)) {
              value2.forEach((item, k) => {
                stack.push({
                  nestedArrIndex: k,
                  value: item
                });
              });
            } else
              ;
          }
          record.$[keyIndex] = subRecords;
        } else if (!isBlank(value)) {
          let subRecord = {
            v: value,
            n: this.norm.get(value)
          };
          record.$[keyIndex] = subRecord;
        }
      });
      this.records.push(record);
    }
    toJSON() {
      return {
        keys: this.keys,
        records: this.records
      };
    }
  };
  function createIndex(keys4, docs, { getFn = Config.getFn, fieldNormWeight = Config.fieldNormWeight } = {}) {
    const myIndex = new FuseIndex({ getFn, fieldNormWeight });
    myIndex.setKeys(keys4.map(createKey));
    myIndex.setSources(docs);
    myIndex.create();
    return myIndex;
  }
  function parseIndex(data, { getFn = Config.getFn, fieldNormWeight = Config.fieldNormWeight } = {}) {
    const { keys: keys4, records } = data;
    const myIndex = new FuseIndex({ getFn, fieldNormWeight });
    myIndex.setKeys(keys4);
    myIndex.setIndexRecords(records);
    return myIndex;
  }
  function computeScore$1(pattern, {
    errors = 0,
    currentLocation = 0,
    expectedLocation = 0,
    distance = Config.distance,
    ignoreLocation = Config.ignoreLocation
  } = {}) {
    const accuracy = errors / pattern.length;
    if (ignoreLocation) {
      return accuracy;
    }
    const proximity = Math.abs(expectedLocation - currentLocation);
    if (!distance) {
      return proximity ? 1 : accuracy;
    }
    return accuracy + proximity / distance;
  }
  function convertMaskToIndices(matchmask = [], minMatchCharLength = Config.minMatchCharLength) {
    let indices = [];
    let start = -1;
    let end = -1;
    let i = 0;
    for (let len = matchmask.length; i < len; i += 1) {
      let match = matchmask[i];
      if (match && start === -1) {
        start = i;
      } else if (!match && start !== -1) {
        end = i - 1;
        if (end - start + 1 >= minMatchCharLength) {
          indices.push([start, end]);
        }
        start = -1;
      }
    }
    if (matchmask[i - 1] && i - start >= minMatchCharLength) {
      indices.push([start, i - 1]);
    }
    return indices;
  }
  var MAX_BITS = 32;
  function search(text, pattern, patternAlphabet, {
    location = Config.location,
    distance = Config.distance,
    threshold = Config.threshold,
    findAllMatches = Config.findAllMatches,
    minMatchCharLength = Config.minMatchCharLength,
    includeMatches = Config.includeMatches,
    ignoreLocation = Config.ignoreLocation
  } = {}) {
    if (pattern.length > MAX_BITS) {
      throw new Error(PATTERN_LENGTH_TOO_LARGE(MAX_BITS));
    }
    const patternLen = pattern.length;
    const textLen = text.length;
    const expectedLocation = Math.max(0, Math.min(location, textLen));
    let currentThreshold = threshold;
    let bestLocation = expectedLocation;
    const computeMatches = minMatchCharLength > 1 || includeMatches;
    const matchMask = computeMatches ? Array(textLen) : [];
    let index;
    while ((index = text.indexOf(pattern, bestLocation)) > -1) {
      let score = computeScore$1(pattern, {
        currentLocation: index,
        expectedLocation,
        distance,
        ignoreLocation
      });
      currentThreshold = Math.min(score, currentThreshold);
      bestLocation = index + patternLen;
      if (computeMatches) {
        let i = 0;
        while (i < patternLen) {
          matchMask[index + i] = 1;
          i += 1;
        }
      }
    }
    bestLocation = -1;
    let lastBitArr = [];
    let finalScore = 1;
    let binMax = patternLen + textLen;
    const mask = 1 << patternLen - 1;
    for (let i = 0; i < patternLen; i += 1) {
      let binMin = 0;
      let binMid = binMax;
      while (binMin < binMid) {
        const score2 = computeScore$1(pattern, {
          errors: i,
          currentLocation: expectedLocation + binMid,
          expectedLocation,
          distance,
          ignoreLocation
        });
        if (score2 <= currentThreshold) {
          binMin = binMid;
        } else {
          binMax = binMid;
        }
        binMid = Math.floor((binMax - binMin) / 2 + binMin);
      }
      binMax = binMid;
      let start = Math.max(1, expectedLocation - binMid + 1);
      let finish = findAllMatches ? textLen : Math.min(expectedLocation + binMid, textLen) + patternLen;
      let bitArr = Array(finish + 2);
      bitArr[finish + 1] = (1 << i) - 1;
      for (let j = finish; j >= start; j -= 1) {
        let currentLocation = j - 1;
        let charMatch = patternAlphabet[text.charAt(currentLocation)];
        if (computeMatches) {
          matchMask[currentLocation] = +!!charMatch;
        }
        bitArr[j] = (bitArr[j + 1] << 1 | 1) & charMatch;
        if (i) {
          bitArr[j] |= (lastBitArr[j + 1] | lastBitArr[j]) << 1 | 1 | lastBitArr[j + 1];
        }
        if (bitArr[j] & mask) {
          finalScore = computeScore$1(pattern, {
            errors: i,
            currentLocation,
            expectedLocation,
            distance,
            ignoreLocation
          });
          if (finalScore <= currentThreshold) {
            currentThreshold = finalScore;
            bestLocation = currentLocation;
            if (bestLocation <= expectedLocation) {
              break;
            }
            start = Math.max(1, 2 * expectedLocation - bestLocation);
          }
        }
      }
      const score = computeScore$1(pattern, {
        errors: i + 1,
        currentLocation: expectedLocation,
        expectedLocation,
        distance,
        ignoreLocation
      });
      if (score > currentThreshold) {
        break;
      }
      lastBitArr = bitArr;
    }
    const result = {
      isMatch: bestLocation >= 0,
      score: Math.max(1e-3, finalScore)
    };
    if (computeMatches) {
      const indices = convertMaskToIndices(matchMask, minMatchCharLength);
      if (!indices.length) {
        result.isMatch = false;
      } else if (includeMatches) {
        result.indices = indices;
      }
    }
    return result;
  }
  function createPatternAlphabet(pattern) {
    let mask = {};
    for (let i = 0, len = pattern.length; i < len; i += 1) {
      const char = pattern.charAt(i);
      mask[char] = (mask[char] || 0) | 1 << len - i - 1;
    }
    return mask;
  }
  var BitapSearch = class {
    constructor(pattern, {
      location = Config.location,
      threshold = Config.threshold,
      distance = Config.distance,
      includeMatches = Config.includeMatches,
      findAllMatches = Config.findAllMatches,
      minMatchCharLength = Config.minMatchCharLength,
      isCaseSensitive = Config.isCaseSensitive,
      ignoreLocation = Config.ignoreLocation
    } = {}) {
      this.options = {
        location,
        threshold,
        distance,
        includeMatches,
        findAllMatches,
        minMatchCharLength,
        isCaseSensitive,
        ignoreLocation
      };
      this.pattern = isCaseSensitive ? pattern : pattern.toLowerCase();
      this.chunks = [];
      if (!this.pattern.length) {
        return;
      }
      const addChunk = (pattern2, startIndex) => {
        this.chunks.push({
          pattern: pattern2,
          alphabet: createPatternAlphabet(pattern2),
          startIndex
        });
      };
      const len = this.pattern.length;
      if (len > MAX_BITS) {
        let i = 0;
        const remainder = len % MAX_BITS;
        const end = len - remainder;
        while (i < end) {
          addChunk(this.pattern.substr(i, MAX_BITS), i);
          i += MAX_BITS;
        }
        if (remainder) {
          const startIndex = len - MAX_BITS;
          addChunk(this.pattern.substr(startIndex), startIndex);
        }
      } else {
        addChunk(this.pattern, 0);
      }
    }
    searchIn(text) {
      const { isCaseSensitive, includeMatches } = this.options;
      if (!isCaseSensitive) {
        text = text.toLowerCase();
      }
      if (this.pattern === text) {
        let result2 = {
          isMatch: true,
          score: 0
        };
        if (includeMatches) {
          result2.indices = [[0, text.length - 1]];
        }
        return result2;
      }
      const {
        location,
        distance,
        threshold,
        findAllMatches,
        minMatchCharLength,
        ignoreLocation
      } = this.options;
      let allIndices = [];
      let totalScore = 0;
      let hasMatches = false;
      this.chunks.forEach(({ pattern, alphabet, startIndex }) => {
        const { isMatch, score, indices } = search(text, pattern, alphabet, {
          location: location + startIndex,
          distance,
          threshold,
          findAllMatches,
          minMatchCharLength,
          includeMatches,
          ignoreLocation
        });
        if (isMatch) {
          hasMatches = true;
        }
        totalScore += score;
        if (isMatch && indices) {
          allIndices = [...allIndices, ...indices];
        }
      });
      let result = {
        isMatch: hasMatches,
        score: hasMatches ? totalScore / this.chunks.length : 1
      };
      if (hasMatches && includeMatches) {
        result.indices = allIndices;
      }
      return result;
    }
  };
  var BaseMatch = class {
    constructor(pattern) {
      this.pattern = pattern;
    }
    static isMultiMatch(pattern) {
      return getMatch(pattern, this.multiRegex);
    }
    static isSingleMatch(pattern) {
      return getMatch(pattern, this.singleRegex);
    }
    search() {
    }
  };
  function getMatch(pattern, exp) {
    const matches = pattern.match(exp);
    return matches ? matches[1] : null;
  }
  var ExactMatch = class extends BaseMatch {
    constructor(pattern) {
      super(pattern);
    }
    static get type() {
      return "exact";
    }
    static get multiRegex() {
      return /^="(.*)"$/;
    }
    static get singleRegex() {
      return /^=(.*)$/;
    }
    search(text) {
      const isMatch = text === this.pattern;
      return {
        isMatch,
        score: isMatch ? 0 : 1,
        indices: [0, this.pattern.length - 1]
      };
    }
  };
  var InverseExactMatch = class extends BaseMatch {
    constructor(pattern) {
      super(pattern);
    }
    static get type() {
      return "inverse-exact";
    }
    static get multiRegex() {
      return /^!"(.*)"$/;
    }
    static get singleRegex() {
      return /^!(.*)$/;
    }
    search(text) {
      const index = text.indexOf(this.pattern);
      const isMatch = index === -1;
      return {
        isMatch,
        score: isMatch ? 0 : 1,
        indices: [0, text.length - 1]
      };
    }
  };
  var PrefixExactMatch = class extends BaseMatch {
    constructor(pattern) {
      super(pattern);
    }
    static get type() {
      return "prefix-exact";
    }
    static get multiRegex() {
      return /^\^"(.*)"$/;
    }
    static get singleRegex() {
      return /^\^(.*)$/;
    }
    search(text) {
      const isMatch = text.startsWith(this.pattern);
      return {
        isMatch,
        score: isMatch ? 0 : 1,
        indices: [0, this.pattern.length - 1]
      };
    }
  };
  var InversePrefixExactMatch = class extends BaseMatch {
    constructor(pattern) {
      super(pattern);
    }
    static get type() {
      return "inverse-prefix-exact";
    }
    static get multiRegex() {
      return /^!\^"(.*)"$/;
    }
    static get singleRegex() {
      return /^!\^(.*)$/;
    }
    search(text) {
      const isMatch = !text.startsWith(this.pattern);
      return {
        isMatch,
        score: isMatch ? 0 : 1,
        indices: [0, text.length - 1]
      };
    }
  };
  var SuffixExactMatch = class extends BaseMatch {
    constructor(pattern) {
      super(pattern);
    }
    static get type() {
      return "suffix-exact";
    }
    static get multiRegex() {
      return /^"(.*)"\$$/;
    }
    static get singleRegex() {
      return /^(.*)\$$/;
    }
    search(text) {
      const isMatch = text.endsWith(this.pattern);
      return {
        isMatch,
        score: isMatch ? 0 : 1,
        indices: [text.length - this.pattern.length, text.length - 1]
      };
    }
  };
  var InverseSuffixExactMatch = class extends BaseMatch {
    constructor(pattern) {
      super(pattern);
    }
    static get type() {
      return "inverse-suffix-exact";
    }
    static get multiRegex() {
      return /^!"(.*)"\$$/;
    }
    static get singleRegex() {
      return /^!(.*)\$$/;
    }
    search(text) {
      const isMatch = !text.endsWith(this.pattern);
      return {
        isMatch,
        score: isMatch ? 0 : 1,
        indices: [0, text.length - 1]
      };
    }
  };
  var FuzzyMatch = class extends BaseMatch {
    constructor(pattern, {
      location = Config.location,
      threshold = Config.threshold,
      distance = Config.distance,
      includeMatches = Config.includeMatches,
      findAllMatches = Config.findAllMatches,
      minMatchCharLength = Config.minMatchCharLength,
      isCaseSensitive = Config.isCaseSensitive,
      ignoreLocation = Config.ignoreLocation
    } = {}) {
      super(pattern);
      this._bitapSearch = new BitapSearch(pattern, {
        location,
        threshold,
        distance,
        includeMatches,
        findAllMatches,
        minMatchCharLength,
        isCaseSensitive,
        ignoreLocation
      });
    }
    static get type() {
      return "fuzzy";
    }
    static get multiRegex() {
      return /^"(.*)"$/;
    }
    static get singleRegex() {
      return /^(.*)$/;
    }
    search(text) {
      return this._bitapSearch.searchIn(text);
    }
  };
  var IncludeMatch = class extends BaseMatch {
    constructor(pattern) {
      super(pattern);
    }
    static get type() {
      return "include";
    }
    static get multiRegex() {
      return /^'"(.*)"$/;
    }
    static get singleRegex() {
      return /^'(.*)$/;
    }
    search(text) {
      let location = 0;
      let index;
      const indices = [];
      const patternLen = this.pattern.length;
      while ((index = text.indexOf(this.pattern, location)) > -1) {
        location = index + patternLen;
        indices.push([index, location - 1]);
      }
      const isMatch = !!indices.length;
      return {
        isMatch,
        score: isMatch ? 0 : 1,
        indices
      };
    }
  };
  var searchers = [
    ExactMatch,
    IncludeMatch,
    PrefixExactMatch,
    InversePrefixExactMatch,
    InverseSuffixExactMatch,
    SuffixExactMatch,
    InverseExactMatch,
    FuzzyMatch
  ];
  var searchersLen = searchers.length;
  var SPACE_RE = / +(?=([^\"]*\"[^\"]*\")*[^\"]*$)/;
  var OR_TOKEN = "|";
  function parseQuery(pattern, options = {}) {
    return pattern.split(OR_TOKEN).map((item) => {
      let query = item.trim().split(SPACE_RE).filter((item2) => item2 && !!item2.trim());
      let results = [];
      for (let i = 0, len = query.length; i < len; i += 1) {
        const queryItem = query[i];
        let found = false;
        let idx = -1;
        while (!found && ++idx < searchersLen) {
          const searcher = searchers[idx];
          let token = searcher.isMultiMatch(queryItem);
          if (token) {
            results.push(new searcher(token, options));
            found = true;
          }
        }
        if (found) {
          continue;
        }
        idx = -1;
        while (++idx < searchersLen) {
          const searcher = searchers[idx];
          let token = searcher.isSingleMatch(queryItem);
          if (token) {
            results.push(new searcher(token, options));
            break;
          }
        }
      }
      return results;
    });
  }
  var MultiMatchSet = /* @__PURE__ */ new Set([FuzzyMatch.type, IncludeMatch.type]);
  var ExtendedSearch = class {
    constructor(pattern, {
      isCaseSensitive = Config.isCaseSensitive,
      includeMatches = Config.includeMatches,
      minMatchCharLength = Config.minMatchCharLength,
      ignoreLocation = Config.ignoreLocation,
      findAllMatches = Config.findAllMatches,
      location = Config.location,
      threshold = Config.threshold,
      distance = Config.distance
    } = {}) {
      this.query = null;
      this.options = {
        isCaseSensitive,
        includeMatches,
        minMatchCharLength,
        findAllMatches,
        ignoreLocation,
        location,
        threshold,
        distance
      };
      this.pattern = isCaseSensitive ? pattern : pattern.toLowerCase();
      this.query = parseQuery(this.pattern, this.options);
    }
    static condition(_, options) {
      return options.useExtendedSearch;
    }
    searchIn(text) {
      const query = this.query;
      if (!query) {
        return {
          isMatch: false,
          score: 1
        };
      }
      const { includeMatches, isCaseSensitive } = this.options;
      text = isCaseSensitive ? text : text.toLowerCase();
      let numMatches = 0;
      let allIndices = [];
      let totalScore = 0;
      for (let i = 0, qLen = query.length; i < qLen; i += 1) {
        const searchers2 = query[i];
        allIndices.length = 0;
        numMatches = 0;
        for (let j = 0, pLen = searchers2.length; j < pLen; j += 1) {
          const searcher = searchers2[j];
          const { isMatch, indices, score } = searcher.search(text);
          if (isMatch) {
            numMatches += 1;
            totalScore += score;
            if (includeMatches) {
              const type3 = searcher.constructor.type;
              if (MultiMatchSet.has(type3)) {
                allIndices = [...allIndices, ...indices];
              } else {
                allIndices.push(indices);
              }
            }
          } else {
            totalScore = 0;
            numMatches = 0;
            allIndices.length = 0;
            break;
          }
        }
        if (numMatches) {
          let result = {
            isMatch: true,
            score: totalScore / numMatches
          };
          if (includeMatches) {
            result.indices = allIndices;
          }
          return result;
        }
      }
      return {
        isMatch: false,
        score: 1
      };
    }
  };
  var registeredSearchers = [];
  function register(...args) {
    registeredSearchers.push(...args);
  }
  function createSearcher(pattern, options) {
    for (let i = 0, len = registeredSearchers.length; i < len; i += 1) {
      let searcherClass = registeredSearchers[i];
      if (searcherClass.condition(pattern, options)) {
        return new searcherClass(pattern, options);
      }
    }
    return new BitapSearch(pattern, options);
  }
  var LogicalOperator = {
    AND: "$and",
    OR: "$or"
  };
  var KeyType = {
    PATH: "$path",
    PATTERN: "$val"
  };
  var isExpression = (query) => !!(query[LogicalOperator.AND] || query[LogicalOperator.OR]);
  var isPath = (query) => !!query[KeyType.PATH];
  var isLeaf = (query) => !isArray(query) && isObject(query) && !isExpression(query);
  var convertToExplicit = (query) => ({
    [LogicalOperator.AND]: Object.keys(query).map((key) => ({
      [key]: query[key]
    }))
  });
  function parse(query, options, { auto = true } = {}) {
    const next = (query2) => {
      let keys4 = Object.keys(query2);
      const isQueryPath = isPath(query2);
      if (!isQueryPath && keys4.length > 1 && !isExpression(query2)) {
        return next(convertToExplicit(query2));
      }
      if (isLeaf(query2)) {
        const key = isQueryPath ? query2[KeyType.PATH] : keys4[0];
        const pattern = isQueryPath ? query2[KeyType.PATTERN] : query2[key];
        if (!isString(pattern)) {
          throw new Error(LOGICAL_SEARCH_INVALID_QUERY_FOR_KEY(key));
        }
        const obj = {
          keyId: createKeyId(key),
          pattern
        };
        if (auto) {
          obj.searcher = createSearcher(pattern, options);
        }
        return obj;
      }
      let node = {
        children: [],
        operator: keys4[0]
      };
      keys4.forEach((key) => {
        const value = query2[key];
        if (isArray(value)) {
          value.forEach((item) => {
            node.children.push(next(item));
          });
        }
      });
      return node;
    };
    if (!isExpression(query)) {
      query = convertToExplicit(query);
    }
    return next(query);
  }
  function computeScore(results, { ignoreFieldNorm = Config.ignoreFieldNorm }) {
    results.forEach((result) => {
      let totalScore = 1;
      result.matches.forEach(({ key, norm: norm2, score }) => {
        const weight = key ? key.weight : null;
        totalScore *= Math.pow(score === 0 && weight ? Number.EPSILON : score, (weight || 1) * (ignoreFieldNorm ? 1 : norm2));
      });
      result.score = totalScore;
    });
  }
  function transformMatches(result, data) {
    const matches = result.matches;
    data.matches = [];
    if (!isDefined(matches)) {
      return;
    }
    matches.forEach((match) => {
      if (!isDefined(match.indices) || !match.indices.length) {
        return;
      }
      const { indices, value } = match;
      let obj = {
        indices,
        value
      };
      if (match.key) {
        obj.key = match.key.src;
      }
      if (match.idx > -1) {
        obj.refIndex = match.idx;
      }
      data.matches.push(obj);
    });
  }
  function transformScore(result, data) {
    data.score = result.score;
  }
  function format(results, docs, {
    includeMatches = Config.includeMatches,
    includeScore = Config.includeScore
  } = {}) {
    const transformers = [];
    if (includeMatches)
      transformers.push(transformMatches);
    if (includeScore)
      transformers.push(transformScore);
    return results.map((result) => {
      const { idx } = result;
      const data = {
        item: docs[idx],
        refIndex: idx
      };
      if (transformers.length) {
        transformers.forEach((transformer) => {
          transformer(result, data);
        });
      }
      return data;
    });
  }
  var Fuse = class {
    constructor(docs, options = {}, index) {
      this.options = { ...Config, ...options };
      if (this.options.useExtendedSearch && false) {
        throw new Error(EXTENDED_SEARCH_UNAVAILABLE);
      }
      this._keyStore = new KeyStore(this.options.keys);
      this.setCollection(docs, index);
    }
    setCollection(docs, index) {
      this._docs = docs;
      if (index && !(index instanceof FuseIndex)) {
        throw new Error(INCORRECT_INDEX_TYPE);
      }
      this._myIndex = index || createIndex(this.options.keys, this._docs, {
        getFn: this.options.getFn,
        fieldNormWeight: this.options.fieldNormWeight
      });
    }
    add(doc) {
      if (!isDefined(doc)) {
        return;
      }
      this._docs.push(doc);
      this._myIndex.add(doc);
    }
    remove(predicate = () => false) {
      const results = [];
      for (let i = 0, len = this._docs.length; i < len; i += 1) {
        const doc = this._docs[i];
        if (predicate(doc, i)) {
          this.removeAt(i);
          i -= 1;
          len -= 1;
          results.push(doc);
        }
      }
      return results;
    }
    removeAt(idx) {
      this._docs.splice(idx, 1);
      this._myIndex.removeAt(idx);
    }
    getIndex() {
      return this._myIndex;
    }
    search(query, { limit = -1 } = {}) {
      const {
        includeMatches,
        includeScore,
        shouldSort,
        sortFn,
        ignoreFieldNorm
      } = this.options;
      let results = isString(query) ? isString(this._docs[0]) ? this._searchStringList(query) : this._searchObjectList(query) : this._searchLogical(query);
      computeScore(results, { ignoreFieldNorm });
      if (shouldSort) {
        results.sort(sortFn);
      }
      if (isNumber(limit) && limit > -1) {
        results = results.slice(0, limit);
      }
      return format(results, this._docs, {
        includeMatches,
        includeScore
      });
    }
    _searchStringList(query) {
      const searcher = createSearcher(query, this.options);
      const { records } = this._myIndex;
      const results = [];
      records.forEach(({ v: text, i: idx, n: norm2 }) => {
        if (!isDefined(text)) {
          return;
        }
        const { isMatch, score, indices } = searcher.searchIn(text);
        if (isMatch) {
          results.push({
            item: text,
            idx,
            matches: [{ score, value: text, norm: norm2, indices }]
          });
        }
      });
      return results;
    }
    _searchLogical(query) {
      const expression = parse(query, this.options);
      const evaluate = (node, item, idx) => {
        if (!node.children) {
          const { keyId, searcher } = node;
          const matches = this._findMatches({
            key: this._keyStore.get(keyId),
            value: this._myIndex.getValueForItemAtKeyId(item, keyId),
            searcher
          });
          if (matches && matches.length) {
            return [
              {
                idx,
                item,
                matches
              }
            ];
          }
          return [];
        }
        const res = [];
        for (let i = 0, len = node.children.length; i < len; i += 1) {
          const child = node.children[i];
          const result = evaluate(child, item, idx);
          if (result.length) {
            res.push(...result);
          } else if (node.operator === LogicalOperator.AND) {
            return [];
          }
        }
        return res;
      };
      const records = this._myIndex.records;
      const resultMap = {};
      const results = [];
      records.forEach(({ $: item, i: idx }) => {
        if (isDefined(item)) {
          let expResults = evaluate(expression, item, idx);
          if (expResults.length) {
            if (!resultMap[idx]) {
              resultMap[idx] = { idx, item, matches: [] };
              results.push(resultMap[idx]);
            }
            expResults.forEach(({ matches }) => {
              resultMap[idx].matches.push(...matches);
            });
          }
        }
      });
      return results;
    }
    _searchObjectList(query) {
      const searcher = createSearcher(query, this.options);
      const { keys: keys4, records } = this._myIndex;
      const results = [];
      records.forEach(({ $: item, i: idx }) => {
        if (!isDefined(item)) {
          return;
        }
        let matches = [];
        keys4.forEach((key, keyIndex) => {
          matches.push(...this._findMatches({
            key,
            value: item[keyIndex],
            searcher
          }));
        });
        if (matches.length) {
          results.push({
            idx,
            item,
            matches
          });
        }
      });
      return results;
    }
    _findMatches({ key, value, searcher }) {
      if (!isDefined(value)) {
        return [];
      }
      let matches = [];
      if (isArray(value)) {
        value.forEach(({ v: text, i: idx, n: norm2 }) => {
          if (!isDefined(text)) {
            return;
          }
          const { isMatch, score, indices } = searcher.searchIn(text);
          if (isMatch) {
            matches.push({
              score,
              key,
              value: text,
              idx,
              norm: norm2,
              indices
            });
          }
        });
      } else {
        const { v: text, n: norm2 } = value;
        const { isMatch, score, indices } = searcher.searchIn(text);
        if (isMatch) {
          matches.push({ score, key, value: text, norm: norm2, indices });
        }
      }
      return matches;
    }
  };
  Fuse.version = "6.5.3";
  Fuse.createIndex = createIndex;
  Fuse.parseIndex = parseIndex;
  Fuse.config = Config;
  {
    Fuse.parseQuery = parse;
  }
  {
    register(ExtendedSearch);
  }

  // src/lib/number.mod.ts
  Number.prototype.mod = function(n) {
    return knuth_mod(this, n);
  };
  function knuth_mod(dividend, divisor) {
    return dividend - divisor * Math.floor(dividend / divisor);
  }

  // src/lib/itertools.ts
  function head(iterable) {
    const iterator = iterable[Symbol.iterator]();
    const result = iterator.next();
    if (result.done)
      throw RangeError("Empty iterator has no head/tail");
    else
      return result.value;
  }
  function* filter(iter, predicate) {
    for (const v of iter) {
      if (predicate(v))
        yield v;
    }
  }
  function find(iter, predicate) {
    return head(filter(iter, predicate));
  }
  function* enumerate(iterable) {
    let index = 0;
    for (const element of iterable) {
      yield [index, element];
      index++;
    }
  }
  function* izip(...arrays) {
    const iterators = arrays.map((e) => e[Symbol.iterator]());
    const box = Array(arrays.length);
    for (let v of iterators[0]) {
      box[0] = v;
      let i;
      try {
        for ([i, v] of enumerate(iterators.slice(1))) {
          box[i + 1] = head(v);
        }
        yield [...box];
      } catch (e) {
        return;
      }
    }
  }

  // src/lib/convert.ts
  function toNumber(s) {
    const n = Number(s);
    if (isNaN(n))
      throw new Error("Not a number! " + s);
    else
      return n;
  }

  // node_modules/ramda/es/internal/_isPlaceholder.js
  function _isPlaceholder(a) {
    return a != null && typeof a === "object" && a["@@functional/placeholder"] === true;
  }

  // node_modules/ramda/es/internal/_curry1.js
  function _curry1(fn) {
    return function f1(a) {
      if (arguments.length === 0 || _isPlaceholder(a)) {
        return f1;
      } else {
        return fn.apply(this, arguments);
      }
    };
  }

  // node_modules/ramda/es/internal/_curry2.js
  function _curry2(fn) {
    return function f2(a, b) {
      switch (arguments.length) {
        case 0:
          return f2;
        case 1:
          return _isPlaceholder(a) ? f2 : _curry1(function(_b) {
            return fn(a, _b);
          });
        default:
          return _isPlaceholder(a) && _isPlaceholder(b) ? f2 : _isPlaceholder(a) ? _curry1(function(_a) {
            return fn(_a, b);
          }) : _isPlaceholder(b) ? _curry1(function(_b) {
            return fn(a, _b);
          }) : fn(a, b);
      }
    };
  }

  // node_modules/ramda/es/internal/_arity.js
  function _arity(n, fn) {
    switch (n) {
      case 0:
        return function() {
          return fn.apply(this, arguments);
        };
      case 1:
        return function(a0) {
          return fn.apply(this, arguments);
        };
      case 2:
        return function(a0, a1) {
          return fn.apply(this, arguments);
        };
      case 3:
        return function(a0, a1, a2) {
          return fn.apply(this, arguments);
        };
      case 4:
        return function(a0, a1, a2, a3) {
          return fn.apply(this, arguments);
        };
      case 5:
        return function(a0, a1, a2, a3, a4) {
          return fn.apply(this, arguments);
        };
      case 6:
        return function(a0, a1, a2, a3, a4, a5) {
          return fn.apply(this, arguments);
        };
      case 7:
        return function(a0, a1, a2, a3, a4, a5, a6) {
          return fn.apply(this, arguments);
        };
      case 8:
        return function(a0, a1, a2, a3, a4, a5, a6, a7) {
          return fn.apply(this, arguments);
        };
      case 9:
        return function(a0, a1, a2, a3, a4, a5, a6, a7, a8) {
          return fn.apply(this, arguments);
        };
      case 10:
        return function(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
          return fn.apply(this, arguments);
        };
      default:
        throw new Error("First argument to _arity must be a non-negative integer no greater than ten");
    }
  }

  // node_modules/ramda/es/internal/_curryN.js
  function _curryN(length, received, fn) {
    return function() {
      var combined = [];
      var argsIdx = 0;
      var left = length;
      var combinedIdx = 0;
      while (combinedIdx < received.length || argsIdx < arguments.length) {
        var result;
        if (combinedIdx < received.length && (!_isPlaceholder(received[combinedIdx]) || argsIdx >= arguments.length)) {
          result = received[combinedIdx];
        } else {
          result = arguments[argsIdx];
          argsIdx += 1;
        }
        combined[combinedIdx] = result;
        if (!_isPlaceholder(result)) {
          left -= 1;
        }
        combinedIdx += 1;
      }
      return left <= 0 ? fn.apply(this, combined) : _arity(left, _curryN(length, combined, fn));
    };
  }

  // node_modules/ramda/es/curryN.js
  var curryN = /* @__PURE__ */ _curry2(function curryN2(length, fn) {
    if (length === 1) {
      return _curry1(fn);
    }
    return _arity(length, _curryN(length, [], fn));
  });
  var curryN_default = curryN;

  // node_modules/ramda/es/internal/_curry3.js
  function _curry3(fn) {
    return function f3(a, b, c) {
      switch (arguments.length) {
        case 0:
          return f3;
        case 1:
          return _isPlaceholder(a) ? f3 : _curry2(function(_b, _c) {
            return fn(a, _b, _c);
          });
        case 2:
          return _isPlaceholder(a) && _isPlaceholder(b) ? f3 : _isPlaceholder(a) ? _curry2(function(_a, _c) {
            return fn(_a, b, _c);
          }) : _isPlaceholder(b) ? _curry2(function(_b, _c) {
            return fn(a, _b, _c);
          }) : _curry1(function(_c) {
            return fn(a, b, _c);
          });
        default:
          return _isPlaceholder(a) && _isPlaceholder(b) && _isPlaceholder(c) ? f3 : _isPlaceholder(a) && _isPlaceholder(b) ? _curry2(function(_a, _b) {
            return fn(_a, _b, c);
          }) : _isPlaceholder(a) && _isPlaceholder(c) ? _curry2(function(_a, _c) {
            return fn(_a, b, _c);
          }) : _isPlaceholder(b) && _isPlaceholder(c) ? _curry2(function(_b, _c) {
            return fn(a, _b, _c);
          }) : _isPlaceholder(a) ? _curry1(function(_a) {
            return fn(_a, b, c);
          }) : _isPlaceholder(b) ? _curry1(function(_b) {
            return fn(a, _b, c);
          }) : _isPlaceholder(c) ? _curry1(function(_c) {
            return fn(a, b, _c);
          }) : fn(a, b, c);
      }
    };
  }

  // node_modules/ramda/es/internal/_isArray.js
  var isArray_default = Array.isArray || function _isArray(val) {
    return val != null && val.length >= 0 && Object.prototype.toString.call(val) === "[object Array]";
  };

  // node_modules/ramda/es/internal/_isTransformer.js
  function _isTransformer(obj) {
    return obj != null && typeof obj["@@transducer/step"] === "function";
  }

  // node_modules/ramda/es/internal/_dispatchable.js
  function _dispatchable(methodNames, transducerCreator, fn) {
    return function() {
      if (arguments.length === 0) {
        return fn();
      }
      var obj = arguments[arguments.length - 1];
      if (!isArray_default(obj)) {
        var idx = 0;
        while (idx < methodNames.length) {
          if (typeof obj[methodNames[idx]] === "function") {
            return obj[methodNames[idx]].apply(obj, Array.prototype.slice.call(arguments, 0, -1));
          }
          idx += 1;
        }
        if (_isTransformer(obj)) {
          var transducer = transducerCreator.apply(null, Array.prototype.slice.call(arguments, 0, -1));
          return transducer(obj);
        }
      }
      return fn.apply(this, arguments);
    };
  }

  // node_modules/ramda/es/internal/_xfBase.js
  var xfBase_default = {
    init: function() {
      return this.xf["@@transducer/init"]();
    },
    result: function(result) {
      return this.xf["@@transducer/result"](result);
    }
  };

  // node_modules/ramda/es/internal/_map.js
  function _map(fn, functor) {
    var idx = 0;
    var len = functor.length;
    var result = Array(len);
    while (idx < len) {
      result[idx] = fn(functor[idx]);
      idx += 1;
    }
    return result;
  }

  // node_modules/ramda/es/internal/_isString.js
  function _isString(x) {
    return Object.prototype.toString.call(x) === "[object String]";
  }

  // node_modules/ramda/es/internal/_isArrayLike.js
  var _isArrayLike = /* @__PURE__ */ _curry1(function isArrayLike(x) {
    if (isArray_default(x)) {
      return true;
    }
    if (!x) {
      return false;
    }
    if (typeof x !== "object") {
      return false;
    }
    if (_isString(x)) {
      return false;
    }
    if (x.length === 0) {
      return true;
    }
    if (x.length > 0) {
      return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
    }
    return false;
  });
  var isArrayLike_default = _isArrayLike;

  // node_modules/ramda/es/internal/_xwrap.js
  var XWrap = /* @__PURE__ */ function() {
    function XWrap2(fn) {
      this.f = fn;
    }
    XWrap2.prototype["@@transducer/init"] = function() {
      throw new Error("init not implemented on XWrap");
    };
    XWrap2.prototype["@@transducer/result"] = function(acc) {
      return acc;
    };
    XWrap2.prototype["@@transducer/step"] = function(acc, x) {
      return this.f(acc, x);
    };
    return XWrap2;
  }();
  function _xwrap(fn) {
    return new XWrap(fn);
  }

  // node_modules/ramda/es/bind.js
  var bind = /* @__PURE__ */ _curry2(function bind2(fn, thisObj) {
    return _arity(fn.length, function() {
      return fn.apply(thisObj, arguments);
    });
  });
  var bind_default = bind;

  // node_modules/ramda/es/internal/_reduce.js
  function _arrayReduce(xf, acc, list) {
    var idx = 0;
    var len = list.length;
    while (idx < len) {
      acc = xf["@@transducer/step"](acc, list[idx]);
      if (acc && acc["@@transducer/reduced"]) {
        acc = acc["@@transducer/value"];
        break;
      }
      idx += 1;
    }
    return xf["@@transducer/result"](acc);
  }
  function _iterableReduce(xf, acc, iter) {
    var step = iter.next();
    while (!step.done) {
      acc = xf["@@transducer/step"](acc, step.value);
      if (acc && acc["@@transducer/reduced"]) {
        acc = acc["@@transducer/value"];
        break;
      }
      step = iter.next();
    }
    return xf["@@transducer/result"](acc);
  }
  function _methodReduce(xf, acc, obj, methodName) {
    return xf["@@transducer/result"](obj[methodName](bind_default(xf["@@transducer/step"], xf), acc));
  }
  var symIterator = typeof Symbol !== "undefined" ? Symbol.iterator : "@@iterator";
  function _reduce(fn, acc, list) {
    if (typeof fn === "function") {
      fn = _xwrap(fn);
    }
    if (isArrayLike_default(list)) {
      return _arrayReduce(fn, acc, list);
    }
    if (typeof list["fantasy-land/reduce"] === "function") {
      return _methodReduce(fn, acc, list, "fantasy-land/reduce");
    }
    if (list[symIterator] != null) {
      return _iterableReduce(fn, acc, list[symIterator]());
    }
    if (typeof list.next === "function") {
      return _iterableReduce(fn, acc, list);
    }
    if (typeof list.reduce === "function") {
      return _methodReduce(fn, acc, list, "reduce");
    }
    throw new TypeError("reduce: list must be array or iterable");
  }

  // node_modules/ramda/es/internal/_xmap.js
  var XMap = /* @__PURE__ */ function() {
    function XMap2(f, xf) {
      this.xf = xf;
      this.f = f;
    }
    XMap2.prototype["@@transducer/init"] = xfBase_default.init;
    XMap2.prototype["@@transducer/result"] = xfBase_default.result;
    XMap2.prototype["@@transducer/step"] = function(result, input) {
      return this.xf["@@transducer/step"](result, this.f(input));
    };
    return XMap2;
  }();
  var _xmap = /* @__PURE__ */ _curry2(function _xmap2(f, xf) {
    return new XMap(f, xf);
  });
  var xmap_default = _xmap;

  // node_modules/ramda/es/internal/_has.js
  function _has(prop, obj) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }

  // node_modules/ramda/es/internal/_isArguments.js
  var toString2 = Object.prototype.toString;
  var _isArguments = /* @__PURE__ */ function() {
    return toString2.call(arguments) === "[object Arguments]" ? function _isArguments2(x) {
      return toString2.call(x) === "[object Arguments]";
    } : function _isArguments2(x) {
      return _has("callee", x);
    };
  }();
  var isArguments_default = _isArguments;

  // node_modules/ramda/es/keys.js
  var hasEnumBug = !/* @__PURE__ */ {
    toString: null
  }.propertyIsEnumerable("toString");
  var nonEnumerableProps = ["constructor", "valueOf", "isPrototypeOf", "toString", "propertyIsEnumerable", "hasOwnProperty", "toLocaleString"];
  var hasArgsEnumBug = /* @__PURE__ */ function() {
    "use strict";
    return arguments.propertyIsEnumerable("length");
  }();
  var contains = function contains2(list, item) {
    var idx = 0;
    while (idx < list.length) {
      if (list[idx] === item) {
        return true;
      }
      idx += 1;
    }
    return false;
  };
  var keys = typeof Object.keys === "function" && !hasArgsEnumBug ? /* @__PURE__ */ _curry1(function keys2(obj) {
    return Object(obj) !== obj ? [] : Object.keys(obj);
  }) : /* @__PURE__ */ _curry1(function keys3(obj) {
    if (Object(obj) !== obj) {
      return [];
    }
    var prop, nIdx;
    var ks = [];
    var checkArgsLength = hasArgsEnumBug && isArguments_default(obj);
    for (prop in obj) {
      if (_has(prop, obj) && (!checkArgsLength || prop !== "length")) {
        ks[ks.length] = prop;
      }
    }
    if (hasEnumBug) {
      nIdx = nonEnumerableProps.length - 1;
      while (nIdx >= 0) {
        prop = nonEnumerableProps[nIdx];
        if (_has(prop, obj) && !contains(ks, prop)) {
          ks[ks.length] = prop;
        }
        nIdx -= 1;
      }
    }
    return ks;
  });
  var keys_default = keys;

  // node_modules/ramda/es/map.js
  var map = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["fantasy-land/map", "map"], xmap_default, function map2(fn, functor) {
    switch (Object.prototype.toString.call(functor)) {
      case "[object Function]":
        return curryN_default(functor.length, function() {
          return fn.call(this, functor.apply(this, arguments));
        });
      case "[object Object]":
        return _reduce(function(acc, key) {
          acc[key] = fn(functor[key]);
          return acc;
        }, {}, keys_default(functor));
      default:
        return _map(fn, functor);
    }
  }));
  var map_default = map;

  // node_modules/ramda/es/internal/_isInteger.js
  var isInteger_default = Number.isInteger || function _isInteger(n) {
    return n << 0 === n;
  };

  // node_modules/ramda/es/reduce.js
  var reduce = /* @__PURE__ */ _curry3(_reduce);
  var reduce_default = reduce;

  // node_modules/ramda/es/type.js
  var type = /* @__PURE__ */ _curry1(function type2(val) {
    return val === null ? "Null" : val === void 0 ? "Undefined" : Object.prototype.toString.call(val).slice(8, -1);
  });
  var type_default = type;

  // node_modules/ramda/es/internal/_pipe.js
  function _pipe(f, g) {
    return function() {
      return g.call(this, f.apply(this, arguments));
    };
  }

  // node_modules/ramda/es/internal/_checkForMethod.js
  function _checkForMethod(methodname, fn) {
    return function() {
      var length = arguments.length;
      if (length === 0) {
        return fn();
      }
      var obj = arguments[length - 1];
      return isArray_default(obj) || typeof obj[methodname] !== "function" ? fn.apply(this, arguments) : obj[methodname].apply(obj, Array.prototype.slice.call(arguments, 0, length - 1));
    };
  }

  // node_modules/ramda/es/slice.js
  var slice = /* @__PURE__ */ _curry3(/* @__PURE__ */ _checkForMethod("slice", function slice2(fromIndex, toIndex, list) {
    return Array.prototype.slice.call(list, fromIndex, toIndex);
  }));
  var slice_default = slice;

  // node_modules/ramda/es/tail.js
  var tail = /* @__PURE__ */ _curry1(/* @__PURE__ */ _checkForMethod("tail", /* @__PURE__ */ slice_default(1, Infinity)));
  var tail_default = tail;

  // node_modules/ramda/es/pipe.js
  function pipe() {
    if (arguments.length === 0) {
      throw new Error("pipe requires at least one argument");
    }
    return _arity(arguments[0].length, reduce_default(_pipe, arguments[0], tail_default(arguments)));
  }

  // node_modules/ramda/es/reverse.js
  var reverse = /* @__PURE__ */ _curry1(function reverse2(list) {
    return _isString(list) ? list.split("").reverse().join("") : Array.prototype.slice.call(list, 0).reverse();
  });
  var reverse_default = reverse;

  // node_modules/ramda/es/internal/_identity.js
  function _identity(x) {
    return x;
  }

  // node_modules/ramda/es/identity.js
  var identity = /* @__PURE__ */ _curry1(_identity);
  var identity_default = identity;

  // node_modules/ramda/es/internal/_arrayFromIterator.js
  function _arrayFromIterator(iter) {
    var list = [];
    var next;
    while (!(next = iter.next()).done) {
      list.push(next.value);
    }
    return list;
  }

  // node_modules/ramda/es/internal/_includesWith.js
  function _includesWith(pred, x, list) {
    var idx = 0;
    var len = list.length;
    while (idx < len) {
      if (pred(x, list[idx])) {
        return true;
      }
      idx += 1;
    }
    return false;
  }

  // node_modules/ramda/es/internal/_functionName.js
  function _functionName(f) {
    var match = String(f).match(/^function (\w*)/);
    return match == null ? "" : match[1];
  }

  // node_modules/ramda/es/internal/_objectIs.js
  function _objectIs(a, b) {
    if (a === b) {
      return a !== 0 || 1 / a === 1 / b;
    } else {
      return a !== a && b !== b;
    }
  }
  var objectIs_default = typeof Object.is === "function" ? Object.is : _objectIs;

  // node_modules/ramda/es/internal/_equals.js
  function _uniqContentEquals(aIterator, bIterator, stackA, stackB) {
    var a = _arrayFromIterator(aIterator);
    var b = _arrayFromIterator(bIterator);
    function eq(_a, _b) {
      return _equals(_a, _b, stackA.slice(), stackB.slice());
    }
    return !_includesWith(function(b2, aItem) {
      return !_includesWith(eq, aItem, b2);
    }, b, a);
  }
  function _equals(a, b, stackA, stackB) {
    if (objectIs_default(a, b)) {
      return true;
    }
    var typeA = type_default(a);
    if (typeA !== type_default(b)) {
      return false;
    }
    if (typeof a["fantasy-land/equals"] === "function" || typeof b["fantasy-land/equals"] === "function") {
      return typeof a["fantasy-land/equals"] === "function" && a["fantasy-land/equals"](b) && typeof b["fantasy-land/equals"] === "function" && b["fantasy-land/equals"](a);
    }
    if (typeof a.equals === "function" || typeof b.equals === "function") {
      return typeof a.equals === "function" && a.equals(b) && typeof b.equals === "function" && b.equals(a);
    }
    switch (typeA) {
      case "Arguments":
      case "Array":
      case "Object":
        if (typeof a.constructor === "function" && _functionName(a.constructor) === "Promise") {
          return a === b;
        }
        break;
      case "Boolean":
      case "Number":
      case "String":
        if (!(typeof a === typeof b && objectIs_default(a.valueOf(), b.valueOf()))) {
          return false;
        }
        break;
      case "Date":
        if (!objectIs_default(a.valueOf(), b.valueOf())) {
          return false;
        }
        break;
      case "Error":
        return a.name === b.name && a.message === b.message;
      case "RegExp":
        if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
          return false;
        }
        break;
    }
    var idx = stackA.length - 1;
    while (idx >= 0) {
      if (stackA[idx] === a) {
        return stackB[idx] === b;
      }
      idx -= 1;
    }
    switch (typeA) {
      case "Map":
        if (a.size !== b.size) {
          return false;
        }
        return _uniqContentEquals(a.entries(), b.entries(), stackA.concat([a]), stackB.concat([b]));
      case "Set":
        if (a.size !== b.size) {
          return false;
        }
        return _uniqContentEquals(a.values(), b.values(), stackA.concat([a]), stackB.concat([b]));
      case "Arguments":
      case "Array":
      case "Object":
      case "Boolean":
      case "Number":
      case "String":
      case "Date":
      case "Error":
      case "RegExp":
      case "Int8Array":
      case "Uint8Array":
      case "Uint8ClampedArray":
      case "Int16Array":
      case "Uint16Array":
      case "Int32Array":
      case "Uint32Array":
      case "Float32Array":
      case "Float64Array":
      case "ArrayBuffer":
        break;
      default:
        return false;
    }
    var keysA = keys_default(a);
    if (keysA.length !== keys_default(b).length) {
      return false;
    }
    var extendedStackA = stackA.concat([a]);
    var extendedStackB = stackB.concat([b]);
    idx = keysA.length - 1;
    while (idx >= 0) {
      var key = keysA[idx];
      if (!(_has(key, b) && _equals(b[key], a[key], extendedStackA, extendedStackB))) {
        return false;
      }
      idx -= 1;
    }
    return true;
  }

  // node_modules/ramda/es/equals.js
  var equals = /* @__PURE__ */ _curry2(function equals2(a, b) {
    return _equals(a, b, [], []);
  });
  var equals_default = equals;

  // node_modules/ramda/es/internal/_indexOf.js
  function _indexOf(list, a, idx) {
    var inf, item;
    if (typeof list.indexOf === "function") {
      switch (typeof a) {
        case "number":
          if (a === 0) {
            inf = 1 / a;
            while (idx < list.length) {
              item = list[idx];
              if (item === 0 && 1 / item === inf) {
                return idx;
              }
              idx += 1;
            }
            return -1;
          } else if (a !== a) {
            while (idx < list.length) {
              item = list[idx];
              if (typeof item === "number" && item !== item) {
                return idx;
              }
              idx += 1;
            }
            return -1;
          }
          return list.indexOf(a, idx);
        case "string":
        case "boolean":
        case "function":
        case "undefined":
          return list.indexOf(a, idx);
        case "object":
          if (a === null) {
            return list.indexOf(a, idx);
          }
      }
    }
    while (idx < list.length) {
      if (equals_default(list[idx], a)) {
        return idx;
      }
      idx += 1;
    }
    return -1;
  }

  // node_modules/ramda/es/internal/_includes.js
  function _includes(a, list) {
    return _indexOf(list, a, 0) >= 0;
  }

  // node_modules/ramda/es/internal/_toISOString.js
  var pad = function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  };
  var _toISOString = typeof Date.prototype.toISOString === "function" ? function _toISOString2(d) {
    return d.toISOString();
  } : function _toISOString3(d) {
    return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds()) + "." + (d.getUTCMilliseconds() / 1e3).toFixed(3).slice(2, 5) + "Z";
  };

  // node_modules/ramda/es/internal/_complement.js
  function _complement(f) {
    return function() {
      return !f.apply(this, arguments);
    };
  }

  // node_modules/ramda/es/internal/_filter.js
  function _filter(fn, list) {
    var idx = 0;
    var len = list.length;
    var result = [];
    while (idx < len) {
      if (fn(list[idx])) {
        result[result.length] = list[idx];
      }
      idx += 1;
    }
    return result;
  }

  // node_modules/ramda/es/internal/_isObject.js
  function _isObject(x) {
    return Object.prototype.toString.call(x) === "[object Object]";
  }

  // node_modules/ramda/es/internal/_xfilter.js
  var XFilter = /* @__PURE__ */ function() {
    function XFilter2(f, xf) {
      this.xf = xf;
      this.f = f;
    }
    XFilter2.prototype["@@transducer/init"] = xfBase_default.init;
    XFilter2.prototype["@@transducer/result"] = xfBase_default.result;
    XFilter2.prototype["@@transducer/step"] = function(result, input) {
      return this.f(input) ? this.xf["@@transducer/step"](result, input) : result;
    };
    return XFilter2;
  }();
  var _xfilter = /* @__PURE__ */ _curry2(function _xfilter2(f, xf) {
    return new XFilter(f, xf);
  });
  var xfilter_default = _xfilter;

  // node_modules/ramda/es/filter.js
  var filter2 = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable(["fantasy-land/filter", "filter"], xfilter_default, function(pred, filterable) {
    return _isObject(filterable) ? _reduce(function(acc, key) {
      if (pred(filterable[key])) {
        acc[key] = filterable[key];
      }
      return acc;
    }, {}, keys_default(filterable)) : _filter(pred, filterable);
  }));
  var filter_default = filter2;

  // node_modules/ramda/es/reject.js
  var reject = /* @__PURE__ */ _curry2(function reject2(pred, filterable) {
    return filter_default(_complement(pred), filterable);
  });
  var reject_default = reject;

  // node_modules/ramda/es/internal/_Set.js
  var _Set = /* @__PURE__ */ function() {
    function _Set2() {
      this._nativeSet = typeof Set === "function" ? /* @__PURE__ */ new Set() : null;
      this._items = {};
    }
    _Set2.prototype.add = function(item) {
      return !hasOrAdd(item, true, this);
    };
    _Set2.prototype.has = function(item) {
      return hasOrAdd(item, false, this);
    };
    return _Set2;
  }();
  function hasOrAdd(item, shouldAdd, set) {
    var type3 = typeof item;
    var prevSize, newSize;
    switch (type3) {
      case "string":
      case "number":
        if (item === 0 && 1 / item === -Infinity) {
          if (set._items["-0"]) {
            return true;
          } else {
            if (shouldAdd) {
              set._items["-0"] = true;
            }
            return false;
          }
        }
        if (set._nativeSet !== null) {
          if (shouldAdd) {
            prevSize = set._nativeSet.size;
            set._nativeSet.add(item);
            newSize = set._nativeSet.size;
            return newSize === prevSize;
          } else {
            return set._nativeSet.has(item);
          }
        } else {
          if (!(type3 in set._items)) {
            if (shouldAdd) {
              set._items[type3] = {};
              set._items[type3][item] = true;
            }
            return false;
          } else if (item in set._items[type3]) {
            return true;
          } else {
            if (shouldAdd) {
              set._items[type3][item] = true;
            }
            return false;
          }
        }
      case "boolean":
        if (type3 in set._items) {
          var bIdx = item ? 1 : 0;
          if (set._items[type3][bIdx]) {
            return true;
          } else {
            if (shouldAdd) {
              set._items[type3][bIdx] = true;
            }
            return false;
          }
        } else {
          if (shouldAdd) {
            set._items[type3] = item ? [false, true] : [true, false];
          }
          return false;
        }
      case "function":
        if (set._nativeSet !== null) {
          if (shouldAdd) {
            prevSize = set._nativeSet.size;
            set._nativeSet.add(item);
            newSize = set._nativeSet.size;
            return newSize === prevSize;
          } else {
            return set._nativeSet.has(item);
          }
        } else {
          if (!(type3 in set._items)) {
            if (shouldAdd) {
              set._items[type3] = [item];
            }
            return false;
          }
          if (!_includes(item, set._items[type3])) {
            if (shouldAdd) {
              set._items[type3].push(item);
            }
            return false;
          }
          return true;
        }
      case "undefined":
        if (set._items[type3]) {
          return true;
        } else {
          if (shouldAdd) {
            set._items[type3] = true;
          }
          return false;
        }
      case "object":
        if (item === null) {
          if (!set._items["null"]) {
            if (shouldAdd) {
              set._items["null"] = true;
            }
            return false;
          }
          return true;
        }
      default:
        type3 = Object.prototype.toString.call(item);
        if (!(type3 in set._items)) {
          if (shouldAdd) {
            set._items[type3] = [item];
          }
          return false;
        }
        if (!_includes(item, set._items[type3])) {
          if (shouldAdd) {
            set._items[type3].push(item);
          }
          return false;
        }
        return true;
    }
  }
  var Set_default = _Set;

  // node_modules/ramda/es/internal/_xuniqBy.js
  var XUniqBy = /* @__PURE__ */ function() {
    function XUniqBy2(f, xf) {
      this.xf = xf;
      this.f = f;
      this.set = new Set_default();
    }
    XUniqBy2.prototype["@@transducer/init"] = xfBase_default.init;
    XUniqBy2.prototype["@@transducer/result"] = xfBase_default.result;
    XUniqBy2.prototype["@@transducer/step"] = function(result, input) {
      return this.set.add(this.f(input)) ? this.xf["@@transducer/step"](result, input) : result;
    };
    return XUniqBy2;
  }();
  var _xuniqBy = /* @__PURE__ */ _curry2(function _xuniqBy2(f, xf) {
    return new XUniqBy(f, xf);
  });
  var xuniqBy_default = _xuniqBy;

  // node_modules/ramda/es/uniqBy.js
  var uniqBy = /* @__PURE__ */ _curry2(/* @__PURE__ */ _dispatchable([], xuniqBy_default, function(fn, list) {
    var set = new Set_default();
    var result = [];
    var idx = 0;
    var appliedItem, item;
    while (idx < list.length) {
      item = list[idx];
      appliedItem = fn(item);
      if (set.add(appliedItem)) {
        result.push(item);
      }
      idx += 1;
    }
    return result;
  }));
  var uniqBy_default = uniqBy;

  // node_modules/ramda/es/uniq.js
  var uniq = /* @__PURE__ */ uniqBy_default(identity_default);
  var uniq_default = uniq;

  // node_modules/ramda/es/is.js
  var is = /* @__PURE__ */ _curry2(function is2(Ctor, val) {
    return val instanceof Ctor || val != null && (val.constructor === Ctor || Ctor.name === "Object" && typeof val === "object");
  });
  var is_default = is;

  // node_modules/ramda/es/pick.js
  var pick = /* @__PURE__ */ _curry2(function pick2(names, obj) {
    var result = {};
    var idx = 0;
    while (idx < names.length) {
      if (names[idx] in obj) {
        result[names[idx]] = obj[names[idx]];
      }
      idx += 1;
    }
    return result;
  });
  var pick_default = pick;

  // node_modules/ramda/es/trim.js
  var hasProtoTrim = typeof String.prototype.trim === "function";

  // node_modules/ramda/es/when.js
  var when = /* @__PURE__ */ _curry3(function when2(pred, whenTrueFn, x) {
    return pred(x) ? whenTrueFn(x) : x;
  });
  var when_default = when;

  // src/lib/nearley_utils.ts
  var nearley = __toESM(require_nearley());
  var Parser2 = class {
    constructor(grammar2) {
      this.parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar2));
      this.initial_state = this.parser.save();
    }
    feedUntilError(input) {
      let lastResult;
      let consumedIndex = 0;
      try {
        for (const val of input) {
          this.parser.feed(val);
          lastResult = this.parser.results[0];
          consumedIndex++;
        }
      } finally {
        this.reset();
        if (lastResult === void 0) {
          throw new Error("Error: no result!");
        } else {
          return [lastResult, input.slice(consumedIndex)];
        }
      }
    }
    reset() {
      this.parser.restore(this.initial_state);
    }
  };

  // src/grammars/.bracketexpr.generated.ts
  function id(d) {
    return d[0];
  }
  var grammar = {
    Lexer: void 0,
    ParserRules: [
      { "name": "BracketExpr", "symbols": [{ "literal": "<" }, "Modifier", "ModKey", { "literal": ">" }], "postprocess": (bexpr) => bexpr.slice(1, -1) },
      { "name": "BracketExpr", "symbols": [{ "literal": "<" }, "Key", { "literal": ">" }], "postprocess": (bexpr) => [{}].concat(bexpr.slice(1, -1)) },
      { "name": "Modifier$ebnf$1", "symbols": [/[acmsACMS]/], "postprocess": id },
      { "name": "Modifier$ebnf$1", "symbols": [], "postprocess": () => null },
      { "name": "Modifier$ebnf$2", "symbols": [/[acmsACMS]/], "postprocess": id },
      { "name": "Modifier$ebnf$2", "symbols": [], "postprocess": () => null },
      { "name": "Modifier$ebnf$3", "symbols": [/[acmsACMS]/], "postprocess": id },
      { "name": "Modifier$ebnf$3", "symbols": [], "postprocess": () => null },
      { "name": "Modifier$ebnf$4", "symbols": [/[acmsACMS]/], "postprocess": id },
      { "name": "Modifier$ebnf$4", "symbols": [], "postprocess": () => null },
      {
        "name": "Modifier",
        "symbols": ["Modifier$ebnf$1", "Modifier$ebnf$2", "Modifier$ebnf$3", "Modifier$ebnf$4", { "literal": "-" }],
        "postprocess": (mods, _, reject3) => {
          const longNames = /* @__PURE__ */ new Map([
            ["A", "altKey"],
            ["C", "ctrlKey"],
            ["M", "metaKey"],
            ["S", "shiftKey"]
          ]);
          let modifiersObj = {};
          for (let mod of mods) {
            if (mod === null || mod === "-")
              continue;
            let longName = longNames.get(mod.toUpperCase());
            if (longName) {
              if (longName in modifiersObj)
                return reject3;
              else
                modifiersObj[longName] = true;
            }
          }
          return modifiersObj;
        }
      },
      { "name": "ModKey", "symbols": [{ "literal": "<" }], "postprocess": id },
      { "name": "ModKey", "symbols": [{ "literal": ">" }], "postprocess": id },
      { "name": "ModKey", "symbols": [{ "literal": "-" }], "postprocess": id },
      { "name": "ModKey", "symbols": ["Key"], "postprocess": id },
      { "name": "Key$ebnf$1", "symbols": [/[^\s<>-]/] },
      { "name": "Key$ebnf$1", "symbols": ["Key$ebnf$1", /[^\s<>-]/], "postprocess": (d) => d[0].concat([d[1]]) },
      { "name": "Key", "symbols": ["Key$ebnf$1"], "postprocess": (key) => key[0].join("") }
    ],
    ParserStart: "BracketExpr"
  };
  var bracketexpr_generated_default = grammar;

  // src/lib/keyseq.ts
  var bracketexpr_grammar = bracketexpr_generated_default;
  var bracketexpr_parser = new Parser2(bracketexpr_grammar);
  var MinimalKey = class {
    constructor(key, modifiers) {
      this.key = key;
      this.altKey = false;
      this.ctrlKey = false;
      this.metaKey = false;
      this.shiftKey = false;
      if (modifiers !== void 0) {
        for (const mod of Object.keys(modifiers)) {
          this[mod] = modifiers[mod];
        }
      }
    }
    match(keyevent) {
      for (const attr in this) {
        if (attr === "shiftKey" && this.key.length === 1)
          continue;
        if (this[attr] !== keyevent[attr])
          return false;
      }
      return true;
    }
    toMapstr() {
      let str = "";
      let needsBrackets = this.key.length > 1;
      const modifiers = /* @__PURE__ */ new Map([
        ["A", "altKey"],
        ["C", "ctrlKey"],
        ["M", "metaKey"],
        ["S", "shiftKey"]
      ]);
      for (const [letter, attr] of modifiers.entries()) {
        if (this[attr]) {
          str += letter;
          needsBrackets = true;
        }
      }
      if (str) {
        str += "-";
      }
      let key = this.key;
      if (key === " ") {
        key = "Space";
        needsBrackets = true;
      }
      str += key;
      if (needsBrackets) {
        str = "<" + str + ">";
      }
      return str;
    }
  };
  function splitNumericPrefix(keyseq) {
    if (!hasModifiers(keyseq[0]) && [1, 2, 3, 4, 5, 6, 7, 8, 9].includes(Number(keyseq[0].key))) {
      const prefix = [keyseq[0]];
      for (const ke of keyseq.slice(1)) {
        if (!hasModifiers(ke) && [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].includes(Number(ke.key)))
          prefix.push(ke);
        else
          break;
      }
      const rest = keyseq.slice(prefix.length);
      return [prefix, rest];
    } else {
      return [[], keyseq];
    }
  }
  function stripOnlyModifiers(keyseq) {
    return keyseq.filter((key) => !["Control", "Shift", "Alt", "AltGraph", "Meta"].includes(key.key));
  }
  function parse2(keyseq, map3) {
    keyseq = stripOnlyModifiers(keyseq);
    if (keyseq.length === 0)
      return { keys: [], isMatch: false };
    let numericPrefix;
    [numericPrefix, keyseq] = splitNumericPrefix(keyseq);
    let possibleMappings = completions(keyseq, map3);
    while (possibleMappings.size === 0 && keyseq.length > 0) {
      keyseq.shift();
      numericPrefix = [];
      possibleMappings = completions(keyseq, map3);
    }
    if (possibleMappings.size > 0) {
      try {
        const perfect = find(possibleMappings, ([k, _v]) => k.length === keyseq.length);
        return {
          value: perfect[1],
          exstr: perfect[1] + numericPrefixToExstrSuffix(numericPrefix),
          isMatch: true,
          numericPrefix: numericPrefix.length ? Number(numericPrefix.map((ke) => ke.key).join("")) : void 0,
          keys: []
        };
      } catch (e) {
        if (!(e instanceof RangeError))
          throw e;
      }
    }
    return { keys: numericPrefix.concat(keyseq), isMatch: keyseq.length > 0 };
  }
  function prefixes(seq1, seq2) {
    if (seq1.length > seq2.length) {
      return false;
    } else {
      for (const [key1, key2] of izip(seq1, seq2)) {
        if (!key2.match(key1))
          return false;
      }
      return true;
    }
  }
  function completions(keyseq, map3) {
    return new Map(filter(map3.entries(), ([ks, _maptarget]) => prefixes(keyseq, ks)));
  }
  function expandAliases(key) {
    const aliases = {
      cr: "Enter",
      esc: "Escape",
      return: "Enter",
      enter: "Enter",
      space: " ",
      bar: "|",
      del: "Delete",
      bs: "Backspace",
      lt: "<"
    };
    if (key.toLowerCase() in aliases)
      return aliases[key.toLowerCase()];
    else
      return key;
  }
  function bracketexprToKey(inputStr) {
    if (inputStr.indexOf(">") > 0) {
      try {
        const [
          [modifiers, key],
          remainder
        ] = bracketexpr_parser.feedUntilError(inputStr);
        return [new MinimalKey(expandAliases(key), modifiers), remainder];
      } catch (e) {
        return [new MinimalKey("<"), inputStr.slice(1)];
      }
    } else {
      return [new MinimalKey("<"), inputStr.slice(1)];
    }
  }
  function mapstrToKeyseq(mapstr) {
    const keyseq = [];
    let key;
    while (mapstr.length) {
      if (mapstr[0] === "<") {
        ;
        [key, mapstr] = bracketexprToKey(mapstr);
        keyseq.push(key);
      } else {
        keyseq.push(new MinimalKey(mapstr[0]));
        mapstr = mapstr.slice(1);
      }
    }
    return keyseq;
  }
  function mapstrMapToKeyMap(mapstrMap) {
    const newKeyMap = /* @__PURE__ */ new Map();
    for (const [mapstr, target] of mapstrMap.entries()) {
      newKeyMap.set(mapstrToKeyseq(mapstr), target);
    }
    return newKeyMap;
  }
  var KEYMAP_CACHE = {};
  function translateKeysInPlace(keys4, conf) {
    if (get2("keytranslatemodes")[conf] === "true") {
      const translationmap = get2("keytranslatemap");
      translateKeysUsingKeyTranslateMap(keys4, translationmap);
    }
  }
  function keyMap(conf) {
    if (KEYMAP_CACHE[conf])
      return KEYMAP_CACHE[conf];
    if (!INITIALISED)
      return /* @__PURE__ */ new Map();
    const mapobj = get2(conf);
    if (mapobj === void 0)
      throw new Error("No binds defined for this mode. Reload page with <C-r> and add binds, e.g. :bind --mode=[mode] <Esc> mode normal");
    const maps = new Map(Object.entries(mapobj));
    KEYMAP_CACHE[conf] = mapstrMapToKeyMap(maps);
    return KEYMAP_CACHE[conf];
  }
  function hasModifiers(keyEvent) {
    return keyEvent.ctrlKey || keyEvent.altKey || keyEvent.metaKey || keyEvent.shiftKey;
  }
  function numericPrefixToExstrSuffix(numericPrefix) {
    if (numericPrefix.length > 0) {
      return " " + numericPrefix.map((k) => k.key).join("");
    } else {
      return "";
    }
  }
  function translateKeysUsingKeyTranslateMap(keyEvents, keytranslatemap) {
    for (let index = 0; index < keyEvents.length; index++) {
      const keyEvent = keyEvents[index];
      const newkey = keytranslatemap[keyEvent.key];
      const neverTranslated = keyEvent instanceof KeyboardEvent;
      if (neverTranslated && newkey !== void 0) {
        keyEvents[index] = new MinimalKey(newkey, {
          altKey: keyEvent.altKey,
          ctrlKey: keyEvent.ctrlKey,
          metaKey: keyEvent.metaKey,
          shiftKey: keyEvent.shiftKey
        });
      }
    }
  }
  browser.storage.onChanged.addListener((changes) => {
    if ("userconfig" in changes) {
      KEYMAP_CACHE = {};
    }
  });

  // src/lib/binding.ts
  var mode2maps = /* @__PURE__ */ new Map([
    ["normal", "nmaps"],
    ["ignore", "ignoremaps"],
    ["insert", "imaps"],
    ["input", "inputmaps"],
    ["ex", "exmaps"],
    ["hint", "hintmaps"],
    ["visual", "vmaps"],
    ["browser", "browsermaps"]
  ]);
  var maps2mode = new Map(Array.from(mode2maps.keys()).map((k) => [mode2maps.get(k), k]));
  var modes = Array.from(mode2maps.keys());
  var modeMaps = Array.from(maps2mode.keys());

  // src/lib/platform.ts
  function getPlatformOs() {
    const platform = navigator.platform;
    const mapping = {
      win: "Win",
      openbsd: "BSD",
      mac: "Mac",
      linux: "Linux"
    };
    return keys_default(filter_default((x) => platform.includes(x), mapping))[0];
  }

  // src/lib/config.ts
  var removeNull = when_default(is_default(Object), pipe(reject_default((val) => val === null), map_default((a) => removeNull(a))));
  var CONFIGNAME = "userconfig";
  var WAITERS = [];
  var INITIALISED = false;
  function o(object) {
    return Object.assign(/* @__PURE__ */ Object.create(null), object);
  }
  function schlepp(settings) {
    Object.assign(USERCONFIG, settings);
  }
  var USERCONFIG = o({});
  var default_config = class {
    constructor() {
      this.configversion = "0.0";
      this.subconfigs = {
        "www.google.com": {
          followpagepatterns: {
            next: "Next",
            prev: "Previous"
          }
        },
        "^https://web.whatsapp.com": {
          nmaps: {
            f: "hint -c [tabindex]:not(.two)>div,a",
            F: "hint -bc [tabindex]:not(.two)>div,a"
          }
        }
      };
      this.modesubconfigs = {
        "normal": {},
        "insert": {},
        "input": {},
        "ignore": {},
        "ex": {},
        "hint": {},
        "visual": {}
      };
      this.priority = 0;
      this.exmaps = {
        "<Enter>": "ex.accept_line",
        "<C-Enter>": "ex.execute_ex_on_completion",
        "<C-j>": "ex.accept_line",
        "<C-m>": "ex.accept_line",
        "<Escape>": "ex.hide_and_clear",
        "<C-[>": "ex.hide_and_clear",
        "<ArrowUp>": "ex.prev_history",
        "<ArrowDown>": "ex.next_history",
        "<S-Del>": "ex.execute_ex_on_completion_args tabclose",
        "<A-b>": "text.backward_word",
        "<A-f>": "text.forward_word",
        "<C-e>": "text.end_of_line",
        "<A-d>": "text.kill_word",
        "<S-Backspace>": "text.backward_kill_word",
        "<C-u>": "text.backward_kill_line",
        "<C-k>": "text.kill_line",
        "<C-f>": "ex.complete",
        "<Tab>": "ex.next_completion",
        "<S-Tab>": "ex.prev_completion",
        "<Space>": "ex.insert_space_or_completion",
        "<C-o>yy": "ex.execute_ex_on_completion_args clipboard yank"
      };
      this.ignoremaps = {
        "<S-Insert>": "mode normal",
        "<AC-Escape>": "mode normal",
        "<AC-`>": "mode normal",
        "<S-Escape>": "mode normal",
        "<C-o>": "nmode normal 1 mode ignore"
      };
      this.imaps = {
        "<Escape>": "composite unfocus | mode normal",
        "<C-[>": "composite unfocus | mode normal",
        "<C-i>": "editor",
        "<AC-Escape>": "mode normal",
        "<AC-`>": "mode normal",
        "<S-Escape>": "mode ignore"
      };
      this.inputmaps = {
        "<Tab>": "focusinput -n",
        "<S-Tab>": "focusinput -N",
        "\u{1F577}\u{1F577}INHERITS\u{1F577}\u{1F577}": "imaps"
      };
      this.superignore = "false";
      this.nmaps = {
        "<A-p>": "pin",
        "<A-m>": "mute toggle",
        "<F1>": "help",
        o: "fillcmdline open",
        O: "current_url open",
        w: "fillcmdline winopen",
        W: "current_url winopen",
        t: "fillcmdline tabopen",
        "]]": "followpage next",
        "[[": "followpage prev",
        "[c": "urlincrement -1",
        "]c": "urlincrement 1",
        "<C-x>": "urlincrement -1",
        "<C-a>": "urlincrement 1",
        T: "current_url tabopen",
        yy: "clipboard yank",
        ys: "clipboard yankshort",
        yc: "clipboard yankcanon",
        ym: "clipboard yankmd",
        yo: "clipboard yankorg",
        yt: "clipboard yanktitle",
        gh: "home",
        gH: "home true",
        p: "clipboard open",
        P: "clipboard tabopen",
        j: "scrollline 10",
        "<C-e>": "scrollline 10",
        k: "scrollline -10",
        "<C-y>": "scrollline -10",
        h: "scrollpx -50",
        l: "scrollpx 50",
        G: "scrollto 100",
        gg: "scrollto 0",
        "<C-u>": "scrollpage -0.5",
        "<C-d>": "scrollpage 0.5",
        "<C-f>": "scrollpage 1",
        "<C-b>": "scrollpage -1",
        "<C-v>": "nmode ignore 1 mode normal",
        $: "scrollto 100 x",
        "^": "scrollto 0 x",
        H: "back",
        L: "forward",
        "<C-o>": "jumpprev",
        "<C-i>": "jumpnext",
        d: "tabclose",
        D: "composite tabprev; tabclose #",
        gx0: "tabclosealltoleft",
        gx$: "tabclosealltoright",
        "<<": "tabmove -1",
        ">>": "tabmove +1",
        u: "undo",
        U: "undo window",
        r: "reload",
        R: "reloadhard",
        x: "stop",
        gi: "focusinput -l",
        "g?": "rot13",
        "g!": "jumble",
        "g;": "changelistjump -1",
        J: "tabprev",
        K: "tabnext",
        gt: "tabnext_gt",
        gT: "tabprev",
        "g^": "tabfirst",
        g0: "tabfirst",
        g$: "tablast",
        ga: "tabaudio",
        gr: "reader",
        gu: "urlparent",
        gU: "urlroot",
        gf: "viewsource",
        ":": "fillcmdline_notrail",
        s: "fillcmdline open search",
        S: "fillcmdline tabopen search",
        M: "gobble 1 quickmark",
        B: "fillcmdline taball",
        b: "fillcmdline tab",
        ZZ: "qall",
        f: "hint",
        F: "hint -b",
        gF: "hint -qb",
        ";i": "hint -i",
        ";b": "hint -b",
        ";o": "hint",
        ";I": "hint -I",
        ";k": "hint -k",
        ";K": "hint -K",
        ";y": "hint -y",
        ";Y": "hint -cF img i => tri.excmds.yankimage(tri.urlutils.getAbsoluteURL(i.src))",
        ";p": "hint -p",
        ";h": "hint -h",
        v: "hint -h",
        ";P": "hint -P",
        ";r": "hint -r",
        ";s": "hint -s",
        ";S": "hint -S",
        ";a": "hint -a",
        ";A": "hint -A",
        ";;": "hint -; *",
        ";#": "hint -#",
        ";v": "hint -W mpvsafe",
        ";V": "hint -V",
        ";w": "hint -w",
        ";t": "hint -W tabopen",
        ";O": "hint -W fillcmdline_notrail open ",
        ";W": "hint -W fillcmdline_notrail winopen ",
        ";T": "hint -W fillcmdline_notrail tabopen ",
        ";z": "hint -z",
        ";m": "composite hint -Jpipe img src | open images.google.com/searchbyimage?image_url=",
        ";M": "composite hint -Jpipe img src | tabopen images.google.com/searchbyimage?image_url=",
        ";gi": "hint -qi",
        ";gI": "hint -qI",
        ";gk": "hint -qk",
        ";gy": "hint -qy",
        ";gp": "hint -qp",
        ";gP": "hint -qP",
        ";gr": "hint -qr",
        ";gs": "hint -qs",
        ";gS": "hint -qS",
        ";ga": "hint -qa",
        ";gA": "hint -qA",
        ";g;": "hint -q;",
        ";g#": "hint -q#",
        ";gv": "hint -qW mpvsafe",
        ";gw": "hint -qw",
        ";gb": "hint -qb",
        ";gF": "hint -qb",
        ";gf": "hint -q",
        "<S-Insert>": "mode ignore",
        "<AC-Escape>": "mode ignore",
        "<AC-`>": "mode ignore",
        "<S-Escape>": "mode ignore",
        "<Escape>": "composite mode normal ; hidecmdline",
        "<C-[>": "composite mode normal ; hidecmdline",
        a: "current_url bmark",
        A: "bmark",
        zi: "zoom 0.1 true",
        zo: "zoom -0.1 true",
        zm: "zoom 0.5 true",
        zr: "zoom -0.5 true",
        zM: "zoom 0.5 true",
        zR: "zoom -0.5 true",
        zz: "zoom 1",
        zI: "zoom 3",
        zO: "zoom 0.3",
        ".": "repeat",
        "<AS-ArrowUp><AS-ArrowUp><AS-ArrowDown><AS-ArrowDown><AS-ArrowLeft><AS-ArrowRight><AS-ArrowLeft><AS-ArrowRight>ba": "open https://www.youtube.com/watch?v=M3iOROuTuMA"
      };
      this.vmaps = {
        "<Escape>": "composite js document.getSelection().empty(); mode normal; hidecmdline",
        "<C-[>": "composite js document.getSelection().empty(); mode normal ; hidecmdline",
        y: "composite js document.getSelection().toString() | clipboard yank",
        s: "composite js document.getSelection().toString() | fillcmdline open search",
        S: "composite js document.getSelection().toString() | fillcmdline tabopen search",
        l: 'js document.getSelection().modify("extend","forward","character")',
        h: 'js document.getSelection().modify("extend","backward","character")',
        e: 'js document.getSelection().modify("extend","forward","word")',
        w: 'js document.getSelection().modify("extend","forward","word"); document.getSelection().modify("extend","forward","word"); document.getSelection().modify("extend","backward","word"); document.getSelection().modify("extend","forward","character")',
        b: 'js document.getSelection().modify("extend","backward","character"); document.getSelection().modify("extend","backward","word"); document.getSelection().modify("extend","forward","character")',
        j: 'js document.getSelection().modify("extend","forward","line")',
        k: 'js document.getSelection().modify("extend","backward","line")',
        $: 'js document.getSelection().modify("extend","forward","lineboundary")',
        "0": 'js document.getSelection().modify("extend","backward","lineboundary")',
        "=": "js let n = document.getSelection().anchorNode.parentNode; let s = window.getSelection(); let r = document.createRange(); s.removeAllRanges(); r.selectNodeContents(n); s.addRange(r)",
        o: "js tri.visual.reverseSelection(document.getSelection())",
        "\u{1F577}\u{1F577}INHERITS\u{1F577}\u{1F577}": "nmaps"
      };
      this.hintmaps = {
        "<Backspace>": "hint.popKey",
        "<Escape>": "hint.reset",
        "<C-[>": "hint.reset",
        "<Tab>": "hint.focusNextHint",
        "<S-Tab>": "hint.focusPreviousHint",
        "<ArrowUp>": "hint.focusTopHint",
        "<ArrowDown>": "hint.focusBottomHint",
        "<ArrowLeft>": "hint.focusLeftHint",
        "<ArrowRight>": "hint.focusRightHint",
        "<Enter>": "hint.selectFocusedHint",
        "<Space>": "hint.selectFocusedHint"
      };
      this.browsermaps = {
        "<C-,>": "escapehatch",
        "<C-6>": "tab #",
        "<CS-6>": "tab #"
      };
      this.leavegithubalone = "false";
      this.blacklistkeys = ["/"];
      this.autocmds = {
        DocStart: {},
        DocLoad: {
          "^https://github.com/tridactyl/tridactyl/issues/new$": "issue"
        },
        DocEnd: {},
        TriStart: {
          ".*": "source_quiet"
        },
        TabEnter: {},
        TabLeft: {},
        FullscreenChange: {},
        FullscreenEnter: {},
        FullscreenLeft: {}
      };
      this.keytranslatemap = {};
      this.keytranslatemodes = {
        nmaps: "true",
        imaps: "false",
        inputmaps: "false",
        ignoremaps: "false",
        exmaps: "false",
        hintmaps: "false"
      };
      this.autocontain = o({});
      this.autocontainmode = "strict";
      this.exaliases = {
        alias: "command",
        au: "autocmd",
        aucon: "autocontain",
        audel: "autocmddelete",
        audelete: "autocmddelete",
        blacklistremove: "autocmddelete DocStart",
        b: "tab",
        clsh: "clearsearchhighlight",
        nohlsearch: "clearsearchhighlight",
        noh: "clearsearchhighlight",
        o: "open",
        w: "winopen",
        t: "tabopen",
        tabnew: "tabopen",
        tabm: "tabmove",
        tabo: "tabonly",
        tn: "tabnext_gt",
        bn: "tabnext_gt",
        tnext: "tabnext_gt",
        bnext: "tabnext_gt",
        tp: "tabprev",
        tN: "tabprev",
        bp: "tabprev",
        bN: "tabprev",
        tprev: "tabprev",
        bprev: "tabprev",
        tabfirst: "tab 1",
        tablast: "tab 0",
        bfirst: "tabfirst",
        blast: "tablast",
        tfirst: "tabfirst",
        tlast: "tablast",
        buffer: "tab",
        bufferall: "taball",
        bd: "tabclose",
        bdelete: "tabclose",
        quit: "tabclose",
        q: "tabclose",
        qa: "qall",
        sanitize: "sanitise",
        "saveas!": "saveas --cleanup --overwrite",
        tutorial: "tutor",
        h: "help",
        unmute: "mute unmute",
        authors: "credits",
        openwith: "hint -W",
        "!": "exclaim",
        "!s": "exclaim_quiet",
        containerremove: "containerdelete",
        colours: "colourscheme",
        colorscheme: "colourscheme",
        colors: "colourscheme",
        man: "help",
        "!js": "fillcmdline_tmp 3000 !js is deprecated. Please use js instead",
        "!jsb": "fillcmdline_tmp 3000 !jsb is deprecated. Please use jsb instead",
        get_current_url: "js document.location.href",
        current_url: "composite get_current_url | fillcmdline_notrail ",
        stop: "js window.stop()",
        zo: "zoom",
        installnative: "nativeinstall",
        nativeupdate: "updatenative",
        mkt: "mktridactylrc",
        "mkt!": "mktridactylrc -f",
        "mktridactylrc!": "mktridactylrc -f",
        mpvsafe: "js -p tri.excmds.shellescape(JS_ARG).then(url => tri.excmds.exclaim_quiet('mpv --no-terminal ' + url))",
        drawingstop: "no_mouse_mode",
        exto: "extoptions",
        extpreferences: "extoptions",
        extp: "extpreferences",
        prefset: "setpref",
        prefremove: "removepref",
        tabclosealltoright: "tabcloseallto right",
        tabclosealltoleft: "tabcloseallto left",
        reibadailty: "jumble"
      };
      this.followpagepatterns = {
        next: "^(next|newer)\\b|\xBB|>>|more",
        prev: "^(prev(ious)?|older)\\b|\xAB|<<"
      };
      this.searchengine = "";
      this.searchurls = {
        google: "https://www.google.com/search?q=",
        googlelucky: "https://www.google.com/search?btnI=I'm+Feeling+Lucky&q=",
        scholar: "https://scholar.google.com/scholar?q=",
        googleuk: "https://www.google.co.uk/search?q=",
        bing: "https://www.bing.com/search?q=",
        duckduckgo: "https://duckduckgo.com/?q=",
        yahoo: "https://search.yahoo.com/search?p=",
        twitter: "https://twitter.com/search?q=",
        wikipedia: "https://en.wikipedia.org/wiki/Special:Search/",
        youtube: "https://www.youtube.com/results?search_query=",
        amazon: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=",
        amazonuk: "https://www.amazon.co.uk/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=",
        startpage: "https://startpage.com/do/search?language=english&cat=web&query=",
        github: "https://github.com/search?utf8=\u2713&q=",
        searx: "https://searx.me/?category_general=on&q=",
        cnrtl: "http://www.cnrtl.fr/lexicographie/",
        osm: "https://www.openstreetmap.org/search?query=",
        mdn: "https://developer.mozilla.org/en-US/search?q=",
        gentoo_wiki: "https://wiki.gentoo.org/index.php?title=Special%3ASearch&profile=default&fulltext=Search&search=",
        qwant: "https://www.qwant.com/?q="
      };
      this.newtab = "";
      this.viewsource = "tridactyl";
      this.homepages = [];
      this.hintchars = "hjklasdfgyuiopqwertnmzxcvb";
      this.hintfiltermode = "simple";
      this.hintnames = "short";
      this.hintuppercase = "true";
      this.hintdelay = 300;
      this.hintshift = "false";
      this.hintautoselect = "true";
      this.allowautofocus = "true";
      this.preventautofocusjackhammer = "false";
      this.smoothscroll = "false";
      this.scrollduration = 100;
      this.tabopenpos = "next";
      this.tabclosepinned = "true";
      this.tabsort = "default";
      this.relatedopenpos = "related";
      this.ttsvoice = "default";
      this.ttsvolume = 1;
      this.ttsrate = 1;
      this.ttspitch = 1;
      this.gimode = "nextinput";
      this.cursorpos = "end";
      this.theme = "default";
      this.customthemes = {};
      this.modeindicator = "true";
      this.modeindicatormodes = {
        normal: "true",
        insert: "true",
        input: "true",
        ignore: "true",
        ex: "true",
        hint: "true",
        visual: "true"
      };
      this.jumpdelay = 3e3;
      this.logging = {
        cmdline: "warning",
        containers: "warning",
        controller: "warning",
        excmd: "error",
        hinting: "warning",
        messaging: "warning",
        native: "warning",
        performance: "warning",
        state: "warning",
        styling: "warning",
        autocmds: "warning"
      };
      this.noiframe = "false";
      this.noiframeon = [];
      this.editorcmd = "auto";
      this.rsscmd = "yank %u";
      this.browser = "firefox";
      this.yankto = "clipboard";
      this.putfrom = "clipboard";
      this.externalclipboardcmd = "auto";
      this.downloadsskiphistory = "false";
      this.nativeinstallcmd = "curl -fsSl https://raw.githubusercontent.com/tridactyl/native_messenger/master/installers/install.sh -o /tmp/trinativeinstall.sh && sh /tmp/trinativeinstall.sh %TAG";
      this.update = {
        nag: true,
        nagwait: 7,
        lastnaggedversion: "1.14.0",
        lastchecktime: 0,
        checkintervalsecs: 60 * 60 * 24
      };
      this.profiledir = "auto";
      this.tabopencontaineraware = "false";
      this.containerindicator = "true";
      this.auconcreatecontainer = "true";
      this.historyresults = 50;
      this.bmarkweight = 100;
      this.gotoselector = "h1, h2, h3, h4, h5, h6";
      this.completions = {
        Goto: {
          autoselect: "true"
        },
        Tab: {
          autoselect: "true"
        },
        TabAll: {
          autoselect: "true"
        },
        Rss: {
          autoselect: "true"
        },
        Bmark: {
          autoselect: "true"
        },
        Sessions: {
          autoselect: "true"
        }
      };
      this.findresults = -1;
      this.findcontextlen = 100;
      this.findcase = "smart";
      this.findhighlighttimeout = 0;
      this.incsearch = "false";
      this.minincsearchlen = 3;
      this.csp = "untouched";
      this.wordpattern = "[^\\s]+";
      this.perfcounters = "false";
      this.perfsamples = "10000";
      this.modeindicatorshowkeys = "false";
      this.urlparenttrailingslash = "true";
      this.visualenterauto = "true";
      this.visualexitauto = "true";
      this.escapehatchsidebarhack = "true";
      this.completionfuzziness = 0.3;
    }
  };
  var platform_defaults = {
    win: {
      browsermaps: {
        "<C-6>": null,
        "<A-6>": "buffer #"
      },
      nmaps: {
        "<C-6>": "buffer #"
      },
      imaps: {
        "<C-6>": "buffer #"
      },
      inputmaps: {
        "<C-6>": "buffer #"
      },
      ignoremaps: {
        "<C-6>": "buffer #"
      },
      nativeinstallcmd: `powershell -ExecutionPolicy Bypass -NoProfile -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12;(New-Object System.Net.WebClient).DownloadFile('https://raw.githubusercontent.com/tridactyl/native_messenger/master/installers/windows.ps1', '%TEMP%/tridactyl_installnative.ps1');& '%TEMP%/tridactyl_installnative.ps1' -Tag %TAG;Remove-Item '%TEMP%/tridactyl_installnative.ps1'"`
    },
    linux: {
      nmaps: {
        ";x": 'hint -F e => { const pos = tri.dom.getAbsoluteCentre(e); tri.excmds.exclaim_quiet("xdotool mousemove --sync " + window.devicePixelRatio * pos.x + " " + window.devicePixelRatio * pos.y + "; xdotool click 1")}',
        ";X": 'hint -F e => { const pos = tri.dom.getAbsoluteCentre(e); tri.excmds.exclaim_quiet("xdotool mousemove --sync " + window.devicePixelRatio * pos.x + " " + window.devicePixelRatio * pos.y + "; xdotool keydown ctrl+shift; xdotool click 1; xdotool keyup ctrl+shift")}'
      }
    }
  };
  var mergeDeepCull = pipe(mergeDeep, removeNull);
  var DEFAULTS = mergeDeepCull(o(new default_config()), platform_defaults[getPlatformOs()]);
  function getDeepProperty(obj, target) {
    if (obj !== void 0 && obj !== null && target.length) {
      if (obj["\u{1F577}\u{1F577}INHERITS\u{1F577}\u{1F577}"] === void 0) {
        return getDeepProperty(obj[target[0]], target.slice(1));
      } else {
        return getDeepProperty(mergeDeepCull(get2(obj["\u{1F577}\u{1F577}INHERITS\u{1F577}\u{1F577}"]), obj)[target[0]], target.slice(1));
      }
    } else {
      if (obj === void 0 || obj === null)
        return obj;
      if (obj["\u{1F577}\u{1F577}INHERITS\u{1F577}\u{1F577}"] !== void 0) {
        return mergeDeepCull(get2(obj["\u{1F577}\u{1F577}INHERITS\u{1F577}\u{1F577}"]), obj);
      } else {
        return obj;
      }
    }
  }
  function mergeDeep(o1, o2) {
    if (o1 === null)
      return Object.assign({}, o2);
    const r = Array.isArray(o1) ? o1.slice() : Object.create(o1);
    Object.assign(r, o1, o2);
    if (o2 === void 0)
      return r;
    Object.keys(o1).filter((key) => typeof o1[key] === "object" && typeof o2[key] === "object").forEach((key) => r[key] == null ? null : Object.assign(r[key], mergeDeep(o1[key], o2[key])));
    return r;
  }
  function getURL(url, target) {
    function _getURL(conf, url2, target2) {
      if (!conf.subconfigs)
        return void 0;
      return Object.keys(conf.subconfigs).filter((k) => url2.match(k) && getDeepProperty(conf.subconfigs[k], target2) !== void 0).sort((k1, k2) => (conf.subconfigs[k1].priority || 10) - (conf.subconfigs[k2].priority || 10)).reduce((acc, curKey) => {
        const curVal = getDeepProperty(conf.subconfigs[curKey], target2);
        if (acc instanceof Object && curVal instanceof Object)
          return mergeDeep(acc, curVal);
        return curVal;
      }, void 0);
    }
    const user = _getURL(USERCONFIG, url, target);
    const deflt = _getURL(DEFAULTS, url, target);
    if (user === void 0 || user === null)
      return deflt;
    if (typeof user !== "object" || typeof deflt !== "object")
      return user;
    return mergeDeepCull(deflt, user);
  }
  function get2(target_typed, ...target) {
    if (target_typed === void 0) {
      target = [];
    } else {
      target = [target_typed].concat(target);
    }
    let loc = window.location;
    if (window.tri && window.tri.contentLocation)
      loc = window.tri.contentLocation;
    const site = getURL(loc.href, target);
    const user = getDeepProperty(USERCONFIG, target);
    const defult = getDeepProperty(DEFAULTS, target);
    if (typeof defult === "object") {
      return mergeDeepCull(mergeDeepCull(defult, user), site);
    } else {
      if (site !== void 0) {
        return site;
      } else if (user !== void 0) {
        return user;
      } else {
        return defult;
      }
    }
  }
  async function getAsync(target_typed, ...target) {
    if (INITIALISED) {
      const browserconfig = await browser.storage.local.get(CONFIGNAME);
      USERCONFIG = browserconfig[CONFIGNAME] || o({});
      return get2(target_typed, ...target);
    } else {
      return new Promise((resolve) => WAITERS.push(() => resolve(get2(target_typed, ...target))));
    }
  }
  async function init() {
    const localConfig = await browser.storage.local.get(CONFIGNAME);
    schlepp(localConfig[CONFIGNAME]);
    INITIALISED = true;
    for (const waiter of WAITERS) {
      waiter();
    }
  }
  var changeListeners = /* @__PURE__ */ new Map();
  function addChangeListener(name, listener) {
    let arr = changeListeners.get(name);
    if (!arr) {
      arr = [];
      changeListeners.set(name, arr);
    }
    arr.push(listener);
  }
  browser.storage.onChanged.addListener((changes, areaname) => {
    if (CONFIGNAME in changes) {
      let triggerChangeListeners = function(key, value = newValue[key]) {
        const arr = changeListeners.get(key);
        if (arr) {
          const v = old[key] === void 0 ? DEFAULTS[key] : old[key];
          arr.forEach((f) => f(v, value));
        }
      };
      const { newValue, oldValue } = changes[CONFIGNAME];
      const old = oldValue || {};
      if (areaname === "sync") {
      } else if (newValue !== void 0) {
        const unsetKeys = Object.keys(old).filter((k) => newValue[k] === void 0 && JSON.stringify(old[k]) !== JSON.stringify(DEFAULTS[k]));
        const changedKeys = Object.keys(newValue).filter((k) => JSON.stringify(old[k] !== void 0 ? old[k] : DEFAULTS[k]) !== JSON.stringify(newValue[k]));
        changedKeys.forEach((key) => USERCONFIG[key] = newValue[key]);
        unsetKeys.forEach((key) => delete USERCONFIG[key]);
        unsetKeys.forEach((key) => triggerChangeListeners(key, DEFAULTS[key]));
        changedKeys.forEach((key) => triggerChangeListeners(key));
      } else {
        USERCONFIG = o({});
        Object.keys(old).filter((key) => old[key] !== DEFAULTS[key]).forEach((key) => triggerChangeListeners(key));
      }
    }
  });
  init();

  // src/lib/aliases.ts
  function expandExstr(exstr, aliases = get2("exaliases"), prevExpansions = []) {
    const [command] = exstr.trim().split(/\s+/);
    if (aliases[command] === void 0) {
      return exstr;
    }
    if (prevExpansions.includes(command)) {
      throw new Error(`Infinite loop detected while expanding aliases. Stack: ${prevExpansions}.`);
    }
    prevExpansions.push(command);
    return expandExstr(exstr.replace(command, aliases[command]), aliases, prevExpansions);
  }
  function getCmdAliasMapping(aliases = get2("exaliases")) {
    const commands = {};
    for (const alias of Object.keys(aliases)) {
      const cmd = expandExstr(alias, aliases).trim();
      if (!commands[cmd])
        commands[cmd] = [];
      commands[cmd].push(alias.trim());
    }
    return commands;
  }

  // src/lib/patience.ts
  var sleep = (duration) => new Promise((res) => setTimeout(res, duration));
  var backoff = (fn, retries = 5, delay = 50) => fn().catch((err) => {
    retries > 1 ? sleep(delay).then(() => backoff(fn, retries - 1, delay * 2)) : Promise.reject(err);
  });

  // src/completions.ts
  var DEFAULT_FAVICON = browser.runtime.getURL("static/defaultFavicon.svg");
  var CompletionOption = class {
  };
  var CompletionSource = class {
    constructor(prefixes2) {
      this.prefixes = [];
      const commands = getCmdAliasMapping();
      prefixes2.map((p) => p.trim()).forEach((p) => {
        this.prefixes.push(p);
        if (commands[p])
          this.prefixes = this.prefixes.concat(commands[p]);
      });
      this.prefixes = this.prefixes.map((p) => p + " ");
    }
    set state(newstate) {
      switch (newstate) {
        case "normal":
          this.node.classList.remove("hidden");
          this.completion = void 0;
          break;
        case "hidden":
          this.node.classList.add("hidden");
          break;
      }
      this._prevState = this._state;
      this._state = newstate;
    }
    get state() {
      return this._state;
    }
    shouldRefresh() {
      return this._state !== "hidden" || this.state !== this._prevState;
    }
    prev(inc = 1) {
      return this.next(-1 * inc);
    }
    deselect() {
      this.completion = void 0;
      if (this.lastFocused !== void 0)
        this.lastFocused.state = "normal";
    }
  };
  var CompletionOptionHTML = class extends CompletionOption {
    constructor() {
      super(...arguments);
      this._state = "hidden";
    }
    set state(newstate) {
      switch (newstate) {
        case "focused":
          this.html.classList.add("focused");
          this.html.classList.remove("hidden");
          const myRect = this.html.getClientRects()[0];
          if (myRect) {
            const container = document.getElementById("completions");
            const boxRect = container.getClientRects()[0];
            if (myRect.bottom > boxRect.bottom)
              this.html.scrollIntoView();
            else if (myRect.top < boxRect.top)
              this.html.scrollIntoView(false);
          }
          break;
        case "normal":
          this.html.classList.remove("focused");
          this.html.classList.remove("hidden");
          break;
        case "hidden":
          this.html.classList.remove("focused");
          this.html.classList.add("hidden");
          break;
      }
      this._state = newstate;
    }
    get state() {
      return this._state;
    }
  };
  var CompletionSourceFuse = class extends CompletionSource {
    constructor(prefixes2, className, title) {
      super(prefixes2);
      this.fuseOptions = {
        keys: ["fuseKeys"],
        shouldSort: true,
        includeScore: true,
        findAllMatches: true,
        ignoreLocation: true,
        ignoreFieldNorm: true,
        threshold: get2("completionfuzziness"),
        minMatchCharLength: 1
      };
      this.fuse = void 0;
      this.sortScoredOptions = false;
      this.optionContainer = html`<table class="optionContainer"></table>`;
      this.node = html`<div class="${className} hidden">
            <div class="sectionHeader">${title || className}</div>
        </div>`;
      this.node.appendChild(this.optionContainer);
      this.state = "hidden";
    }
    async filter(exstr) {
      this.lastExstr = exstr;
      await this.onInput(exstr);
      return this.updateChain();
    }
    updateChain(exstr = this.lastExstr, options = this.options) {
      if (options === void 0) {
        this.state = "hidden";
        return;
      }
      const [prefix, query] = this.splitOnPrefix(exstr);
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      if (query) {
        this.setStateFromScore(this.scoredOptions(query));
      } else {
        options.forEach((option) => option.state = "normal");
      }
      this.updateDisplay();
    }
    select(option) {
      if (this.lastExstr !== void 0 && option !== void 0) {
        const [prefix] = this.splitOnPrefix(this.lastExstr);
        this.completion = prefix + option.value;
        this.args = option.value;
        option.state = "focused";
        this.lastFocused = option;
      } else {
        throw new Error("lastExstr and option must be defined!");
      }
    }
    splitOnPrefix(exstr) {
      for (const prefix of this.prefixes) {
        if (exstr.startsWith(prefix)) {
          const query = exstr.replace(prefix, "");
          return [prefix, query];
        }
      }
      return [void 0, void 0];
    }
    scoredOptions(query) {
      const searchThis = this.options.map((elem, index) => ({
        index,
        fuseKeys: elem.fuseKeys
      }));
      this.fuse = new Fuse(searchThis, this.fuseOptions);
      return this.fuse.search(query).map((result) => {
        const index = toNumber(result.item.index);
        return {
          index,
          option: this.options[index],
          score: result.score
        };
      });
    }
    setStateFromScore(scoredOpts, autoselect = false) {
      const matches = scoredOpts.map((res) => res.index);
      const hidden_options = [];
      for (const [index, option] of enumerate(this.options)) {
        if (matches.includes(index))
          option.state = "normal";
        else {
          option.state = "hidden";
          hidden_options.push(option);
        }
      }
      if (matches.length && autoselect) {
        this.select(this.options[matches[0]]);
      } else {
        this.deselect();
      }
      if (this.sortScoredOptions) {
        const sorted_options = matches.map((index) => this.options[index]);
        this.options = sorted_options.concat(hidden_options);
      }
    }
    updateDisplay() {
      const newContainer = this.optionContainer.cloneNode(false);
      for (const option of this.options) {
        if (option.state !== "hidden")
          newContainer.appendChild(option.html);
      }
      this.optionContainer.replaceWith(newContainer);
      this.optionContainer = newContainer;
      this.next(0);
    }
    async next(inc = 1) {
      if (this.state !== "hidden") {
        return backoff(async () => {
          const visopts = this.options.filter((o2) => o2.state !== "hidden");
          const currind = visopts.findIndex((o2) => o2.state === "focused");
          this.deselect();
          const max = visopts.length + 1;
          const opt = visopts[(currind + inc + max) % max];
          if (opt)
            this.select(opt);
          return true;
        });
      } else
        return false;
    }
    async onInput(exstr) {
    }
  };

  // compiler/types/AnyType.ts
  var AnyType = class {
    constructor(isDotDotDot = false, isQuestion = false) {
      this.isDotDotDot = isDotDotDot;
      this.isQuestion = isQuestion;
      this.kind = "any";
    }
    toConstructor() {
      return `new AnyType(${!this.isDotDotDot}, ${this.isQuestion})`;
    }
    toString() {
      return this.kind;
    }
    convert(argument) {
      return argument;
    }
  };

  // compiler/types/BooleanType.ts
  var BooleanType = class {
    constructor(isDotDotDot = false, isQuestion = false) {
      this.isDotDotDot = isDotDotDot;
      this.isQuestion = isQuestion;
      this.kind = "boolean";
    }
    toConstructor() {
      return `new BooleanType(${this.isDotDotDot}, ${this.isQuestion})`;
    }
    toString() {
      return this.kind;
    }
    convert(argument) {
      if (argument === "true") {
        return true;
      } else if (argument === "false") {
        return false;
      }
      throw new Error("Can't convert ${argument} to boolean");
    }
  };

  // compiler/types/FunctionType.ts
  var FunctionType = class {
    constructor(args, ret, isDotDotDot = false, isQuestion = false) {
      this.args = args;
      this.ret = ret;
      this.isDotDotDot = isDotDotDot;
      this.isQuestion = isQuestion;
      this.kind = "function";
    }
    toConstructor() {
      return `new FunctionType([` + this.args.map((cur) => cur.toConstructor()) + `], ${this.ret.toConstructor()}, ${this.isDotDotDot}, ${this.isQuestion})`;
    }
    toString() {
      return `(${this.args.map((a) => a.toString()).join(", ")}) => ${this.ret.toString()}`;
    }
    convert(argument) {
      throw new Error(`Conversion to function not implemented: ${argument}`);
    }
  };

  // compiler/types/NumberType.ts
  var NumberType = class {
    constructor(isDotDotDot = false, isQuestion = false) {
      this.isDotDotDot = isDotDotDot;
      this.isQuestion = isQuestion;
      this.kind = "number";
    }
    toConstructor() {
      return `new NumberType(${this.isDotDotDot}, ${this.isQuestion})`;
    }
    toString() {
      return this.kind;
    }
    convert(argument) {
      const n = parseFloat(argument);
      if (!Number.isNaN(n)) {
        return n;
      }
      throw new Error(`Can't convert to number: ${argument}`);
    }
  };

  // compiler/types/ObjectType.ts
  var ObjectType = class {
    constructor(members = /* @__PURE__ */ new Map(), isDotDotDot = false, isQuestion = false) {
      this.members = members;
      this.isDotDotDot = isDotDotDot;
      this.isQuestion = isQuestion;
      this.kind = "object";
    }
    toConstructor() {
      return `new ObjectType(new Map<string, Type>([` + Array.from(this.members.entries()).map(([n, m]) => `[${JSON.stringify(n)}, ${m.toConstructor()}]`).join(", ") + `]), ${this.isDotDotDot}, ${this.isQuestion})`;
    }
    toString() {
      return this.kind;
    }
    convertMember(memberName, memberValue) {
      let type3 = this.members.get(memberName[0]);
      if (!type3) {
        type3 = this.members.get("");
        if (!type3) {
          return memberValue;
        }
      }
      if (type3.kind === "object") {
        return type3.convertMember(memberName.slice(1), memberValue);
      }
      return type3.convert(memberValue);
    }
    convert(argument) {
      try {
        return JSON.parse(argument);
      } catch (e) {
        throw new Error(`Can't convert to object: ${argument}`);
      }
    }
  };

  // compiler/types/StringType.ts
  var StringType = class {
    constructor(isDotDotDot = false, isQuestion = false) {
      this.isDotDotDot = isDotDotDot;
      this.isQuestion = isQuestion;
      this.kind = "string";
    }
    toConstructor() {
      return `new StringType(${this.isDotDotDot}, ${this.isQuestion})`;
    }
    toString() {
      return this.kind;
    }
    convert(argument) {
      if (typeof argument === "string") {
        return argument;
      }
      throw new Error(`Can't convert to string: ${argument}`);
    }
  };

  // compiler/types/TypeReferenceType.ts
  var TypeReferenceType = class {
    constructor(kind, args, isDotDotDot = false, isQuestion = false) {
      this.kind = kind;
      this.args = args;
      this.isDotDotDot = isDotDotDot;
      this.isQuestion = isQuestion;
    }
    toConstructor() {
      return `new TypeReferenceType(${JSON.stringify(this.kind)}, [` + this.args.map((cur) => cur.toConstructor()).join(",\n") + `], ${this.isDotDotDot}, ${this.isQuestion})`;
    }
    toString() {
      return `${this.kind}<${this.args.map((a) => a.toString()).join(", ")}>`;
    }
    convert(argument) {
      throw new Error("Conversion of simple type references not implemented.");
    }
  };

  // compiler/types/VoidType.ts
  var VoidType = class {
    constructor(isDotDotDot = false, isQuestion = false) {
      this.isDotDotDot = isDotDotDot;
      this.isQuestion = isQuestion;
      this.kind = "void";
    }
    toConstructor() {
      return `new VoidType(${this.isDotDotDot}, ${this.isQuestion})`;
    }
    toString() {
      return this.kind;
    }
    convert(argument) {
      return null;
    }
  };

  // compiler/types/ArrayType.ts
  var ArrayType = class {
    constructor(elemType, isDotDotDot = false, isQuestion = false) {
      this.elemType = elemType;
      this.isDotDotDot = isDotDotDot;
      this.isQuestion = isQuestion;
      this.kind = "array";
    }
    toConstructor() {
      return `new ArrayType(${this.elemType.toConstructor()}, ${this.isDotDotDot}, ${this.isQuestion})`;
    }
    toString() {
      return `${this.elemType.toString()}[]`;
    }
    convert(argument) {
      if (!Array.isArray(argument)) {
        try {
          argument = JSON.parse(argument);
        } catch (e) {
          throw new Error(`Can't convert ${argument} to array:`);
        }
        if (!Array.isArray(argument)) {
          throw new Error(`Can't convert ${argument} to array:`);
        }
      }
      return argument.map((v) => this.elemType.convert(v));
    }
  };

  // compiler/types/LiteralTypeType.ts
  var LiteralTypeType = class {
    constructor(value, isDotDotDot = false, isQuestion = false) {
      this.value = value;
      this.isDotDotDot = isDotDotDot;
      this.isQuestion = isQuestion;
      this.kind = "LiteralType";
    }
    toConstructor() {
      return `new LiteralTypeType(${JSON.stringify(this.value)}, ${this.isDotDotDot}, ${this.isQuestion})`;
    }
    toString() {
      return JSON.stringify(this.value);
    }
    convert(argument) {
      if (argument === this.value) {
        return argument;
      }
      throw new Error(`Argument does not match expected value (${this.value}): ${argument}`);
    }
  };

  // compiler/types/TupleType.ts
  var TupleType = class {
    constructor(elemTypes, isDotDotDot = false, isQuestion = false) {
      this.elemTypes = elemTypes;
      this.isDotDotDot = isDotDotDot;
      this.isQuestion = isQuestion;
      this.kind = "tuple";
    }
    toConstructor() {
      return `new TupleType([` + this.elemTypes.map((cur) => cur.toConstructor()).join(",\n") + `], ${this.isDotDotDot}, ${this.isQuestion})`;
    }
    toString() {
      return `[${this.elemTypes.map((e) => e.toString()).join(", ")}]`;
    }
    convert(argument) {
      if (!Array.isArray(argument)) {
        try {
          argument = JSON.parse(argument);
        } catch (e) {
          throw new Error(`Can't convert to tuple: ${argument}`);
        }
        if (!Array.isArray(argument)) {
          throw new Error(`Can't convert to tuple: ${argument}`);
        }
      }
      if (argument.length !== this.elemTypes.length) {
        throw new Error(`Error converting tuple: number of elements and type mismatch ${argument}`);
      }
      return argument.map((v, i) => this.elemTypes[i].convert(v));
    }
  };

  // compiler/types/UnionType.ts
  var UnionType = class {
    constructor(types, isDotDotDot = false, isQuestion = false) {
      this.types = types;
      this.isDotDotDot = isDotDotDot;
      this.isQuestion = isQuestion;
      this.kind = "union";
    }
    toConstructor() {
      return `new UnionType([` + this.types.map((cur) => cur.toConstructor()).join(",\n") + `], ${this.isDotDotDot}, ${this.isQuestion})`;
    }
    toString() {
      return this.types.map((t) => t.toString()).join(" | ");
    }
    convert(argument) {
      for (const t of this.types) {
        try {
          return t.convert(argument);
        } catch (e) {
        }
      }
      throw new Error(`Can't convert "${argument}" to any of: ${this.types}`);
    }
  };

  // compiler/metadata/SymbolMetadata.ts
  var SymbolMetadata = class {
    constructor(doc, type3, hidden = false) {
      this.doc = doc;
      this.type = type3;
      this.hidden = hidden;
    }
    toConstructor() {
      return `new SymbolMetadata(${JSON.stringify(this.doc)}, ${this.type.toConstructor()}, ${this.hidden})`;
    }
  };

  // compiler/metadata/ClassMetadata.ts
  var ClassMetadata = class {
    constructor(members = /* @__PURE__ */ new Map()) {
      this.members = members;
    }
    setMember(name, s) {
      this.members.set(name, s);
    }
    getMember(name) {
      return this.members.get(name);
    }
    getMembers() {
      return this.members.keys();
    }
    toConstructor() {
      return `new ClassMetadata(new Map<string, SymbolMetadata>([` + Array.from(this.members.entries()).map(([n, m]) => `[${JSON.stringify(n)}, ${m.toConstructor()}]`).join(",\n") + `]))`;
    }
  };

  // compiler/metadata/FileMetadata.ts
  var FileMetadata = class {
    constructor(classes = /* @__PURE__ */ new Map(), functions = /* @__PURE__ */ new Map()) {
      this.classes = classes;
      this.functions = functions;
    }
    setClass(name, c) {
      this.classes.set(name, c);
    }
    getClass(name) {
      return this.classes.get(name);
    }
    getClasses() {
      return Array.from(this.classes.keys());
    }
    setFunction(name, f) {
      this.functions.set(name, f);
    }
    getFunction(name) {
      return this.functions.get(name);
    }
    getFunctions() {
      return Array.from(this.functions.entries());
    }
    getFunctionNames() {
      return Array.from(this.functions.keys());
    }
    toConstructor() {
      return `new FileMetadata(new Map<string, ClassMetadata>([` + Array.from(this.classes.entries()).map(([n, c]) => `[${JSON.stringify(n)}, ${c.toConstructor()}]`).join(",\n") + `]), new Map<string, SymbolMetadata>([` + Array.from(this.functions.entries()).map(([n, f]) => `[${JSON.stringify(n)}, ${f.toConstructor()}]`).join(",\n") + `]))`;
    }
  };

  // compiler/metadata/ProgramMetadata.ts
  var ProgramMetadata = class {
    constructor(files = /* @__PURE__ */ new Map()) {
      this.files = files;
    }
    setFile(name, file) {
      this.files.set(name, file);
    }
    getFile(name) {
      return this.files.get(name);
    }
    toConstructor() {
      return `new ProgramMetadata(new Map<string, FileMetadata>([` + Array.from(this.files.entries()).map(([n, f]) => `[${JSON.stringify(n)}, ${f.toConstructor()}]`).join(",\n") + `]))`;
    }
  };

  // src/.metadata.generated.ts
  var everything = new ProgramMetadata(/* @__PURE__ */ new Map([
    ["src/excmds.ts", new FileMetadata(/* @__PURE__ */ new Map([]), /* @__PURE__ */ new Map([
      ["getNativeVersion", new SymbolMetadata("", new FunctionType([], new TypeReferenceType("Promise", [new StringType(false, false)], false, false), false, false), true)],
      ["getRssLinks", new SymbolMetadata("", new FunctionType([], new TypeReferenceType("Promise", [new ArrayType(new ObjectType(/* @__PURE__ */ new Map([]), false, false), false, false)], false, false), false, false), true)],
      ["rssexec", new SymbolMetadata("Execute [[rsscmd]] for an rss link.\n\nIf `url` is undefined, Tridactyl will look for rss links in the current\npage. If it doesn't find any, it will display an error message. If it finds\nmultiple urls, it will offer completions in order for you to select the link\nyou're interested in. If a single rss feed is found, it will automatically\nbe selected.", new FunctionType([new StringType(false, false), new StringType(false, true), new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["fillinput", new SymbolMetadata("Fills the element matched by `selector` with content and falls back to the last used input if the element can't be found. You probably don't want this; it used to be used internally for [[editor]].\n\nThat said, `bind gs fillinput null [Tridactyl](https://addons.mozilla.org/en-US/firefox/addon/tridactyl-vim/) is my favourite add-on` could probably come in handy.", new FunctionType([new StringType(false, false), new ArrayType(new StringType(false, false), true, false)], new VoidType(false, false), false, false), false)],
      ["getInput", new SymbolMetadata("", new FunctionType([new TypeReferenceType("HTMLElement", [], false, false)], new StringType(false, false), false, false), true)],
      ["getinput", new SymbolMetadata("", new FunctionType([], new StringType(false, false), false, false), true)],
      ["getInputSelector", new SymbolMetadata("", new FunctionType([], new AnyType(true, false), false, false), true)],
      ["addTridactylEditorClass", new SymbolMetadata("", new FunctionType([new StringType(false, false)], new VoidType(false, false), false, false), true)],
      ["removeTridactylEditorClass", new SymbolMetadata("", new FunctionType([new StringType(false, false)], new VoidType(false, false), false, false), true)],
      ["editor", new SymbolMetadata("Opens your favourite editor (which is currently gVim) and fills the last used input with whatever you write into that file.\n**Requires that the native messenger is installed, see [[native]] and [[nativeinstall]]**.\n\nUses the `editorcmd` config option, default = `auto` looks through a list defined in lib/native.ts try find a sensible combination. If it's a bit slow, or chooses the wrong editor, or gives up completely, set editorcmd to something you want. The command must stay in the foreground until the editor exits.\n\nThe editorcmd needs to accept a filename, stay in the foreground while it's edited, save the file and exit. By default the filename is added to the end of editorcmd, if you require control over the position of that argument, the first occurrence of %f in editorcmd is replaced with the filename. %l, if it exists, is replaced with the line number of the cursor and %c with the column number. For example:\n```\nset editorcmd terminator -u -e \"vim %f '+normal!%lGzv%c|'\"\n```\n\nYou're probably better off using the default insert mode bind of `<C-i>` (Ctrl-i) to access this.\n\nThis function returns a tuple containing the path to the file that was opened by the editor and its content. This enables creating commands such as the following one, which deletes the temporary file created by the editor:\n```\nalias editor_rm composite editor | jsb -p tri.native.run(`rm -f '${JS_ARG[0]}'`)\nbind --mode=insert <C-i> editor_rm\nbind --mode=input <C-i> editor_rm\n```", new FunctionType([], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["guiset_quiet", new SymbolMetadata("Like [[guiset]] but quieter.", new FunctionType([new StringType(false, false), new StringType(false, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["guiset", new SymbolMetadata("Change which parts of the Firefox user interface are shown. **NB: This feature is experimental and might break stuff.**\n\nMight mangle your userChrome. Requires native messenger, and you must restart Firefox each time to see any changes (this can be done using [[restart]]). <!-- (unless you enable addon debugging and refresh using the browser toolbox) -->\n\nAlso flips the preference `toolkit.legacyUserProfileCustomizations.stylesheets` to true so that FF will read your userChrome.\n\nView available rules and options [here](/static/docs/modules/_src_lib_css_util_.html#potentialrules) and [here](/static/docs/modules/_src_lib_css_util_.html#metarules).\n\nExample usage: `guiset gui none`, `guiset gui full`, `guiset tabs autohide`.\n\nSome of the available options:\n\n- gui\n      - full\n      - none\n\n- tabs\n      - always\n      - autohide\n\n- navbar\n      - always\n      - autohide\n      - none\n\n- hoverlink (the little link that appears when you hover over a link)\n      - none\n      - left\n      - right\n      - top-left\n      - top-right\n\n- statuspanel (hoverlink + the indicator that appears when a website is loading)\n      - none\n      - left\n      - right\n      - top-left\n      - top-right\n\nIf you want to use guiset in your tridactylrc, you might want to use [[guiset_quiet]] instead.", new FunctionType([new StringType(false, false), new StringType(false, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["cssparse", new SymbolMetadata("", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new VoidType(false, false), false, false), true)],
      ["loadtheme", new SymbolMetadata("", new FunctionType([new StringType(false, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), true)],
      ["unloadtheme", new SymbolMetadata("", new FunctionType([new StringType(false, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), true)],
      ["colourscheme", new SymbolMetadata("Changes the current theme.\n\nIf THEMENAME is any of the themes that can be found in the [Tridactyl repo](https://github.com/tridactyl/tridactyl/tree/master/src/static/themes) (e.g. 'dark'), the theme will be loaded from Tridactyl's internal storage.\n\nIf THEMENAME is set to any other value except `--url`, Tridactyl will attempt to use its native binary (see [[native]]) in order to load a CSS file named THEMENAME from disk. The CSS file has to be in a directory named \"themes\" and this directory has to be in the same directory as your tridactylrc. If this fails, Tridactyl will attempt to load the theme from its internal storage.\n\nLastly, themes can be loaded from URLs with `:colourscheme --url [url] [themename]`. They are stored internally - if you want to update the theme run the whole command again.\n\nNote that the theme name should NOT contain any dot.\n\nExample: `:colourscheme mysupertheme`\nOn linux, this will load ~/.config/tridactyl/themes/mysupertheme.css\n\n__NB__: due to Tridactyl's architecture, the theme will take a small amount of time to apply as each page is loaded. If this annoys you, you may use [userContent.css](http://kb.mozillazine.org/index.php?title=UserContent.css&printable=yes) to make changes to Tridactyl earlier. For example, users using the dark theme may like to put\n\n```\n:root {\n     --tridactyl-bg: black !important;\n     --tridactyl-fg: white !important;\n}\n```\n\nin their `userContent.css`. Follow [issue #2510](https://github.com/tridactyl/tridactyl/issues/2510) if you would like to find out when we have made a more user-friendly solution.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["setpref", new SymbolMetadata("Write a setting to your user.js file. Requires a [[restart]] after running to take effect.", new FunctionType([new StringType(false, false), new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["removepref", new SymbolMetadata("Remove a setting from your user.js file.", new FunctionType([new StringType(false, false)], new AnyType(true, false), false, false), false)],
      ["fixamo_quiet", new SymbolMetadata("Like [[fixamo]] but quieter.\n\nNow purely a placebo as [[fixamo]] has been removed.", new FunctionType([], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["fixamo", new SymbolMetadata('Used to simply set\n```js\n  "privacy.resistFingerprinting.block_mozAddonManager":true\n  "extensions.webextensions.restrictedDomains":""\n```\nin about:config via user.js so that Tridactyl (and other extensions!) can be used on addons.mozilla.org and other sites.\n\nRemoved at the request of the Firefox Security team. Replacements exist in our exemplar RC file.\n\nRequires `native` and a `restart`.', new FunctionType([], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["nativeopen", new SymbolMetadata("Uses the native messenger to open URLs.\n\n**Be *seriously* careful with this:**\n\n1. the implementation basically execs `firefox --new-tab <your shell escaped string here>`\n2. you can use it to open any URL you can open in the Firefox address bar,\n    including ones that might cause side effects (firefox does not guarantee\n    that about: pages ignore query strings).\n\nYou've been warned.\n\nThis uses the [[browser]] setting to know which binary to call. If you need to pass additional arguments to firefox (e.g. '--new-window'), make sure they appear before the url.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["exclaim", new SymbolMetadata('Run command in /bin/sh (unless you\'re on Windows), and print the output in the command line. Non-zero exit codes and stderr are ignored, currently.\n\nRequires the native messenger, obviously.\n\nIf you want to use a different shell, just prepend your command with whatever the invocation is and keep in mind that most shells require quotes around the command to be executed, e.g. `:exclaim xonsh -c "1+2"`.\n\nAliased to `!` but the exclamation mark **must be followed with a space**.', new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["exclaim_quiet", new SymbolMetadata("Like exclaim, but without any output to the command line.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new StringType(false, false)], false, false), false, false), false)],
      ["native", new SymbolMetadata("Tells you if the native messenger is installed and its version.", new FunctionType([], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["nativeinstall", new SymbolMetadata("Copies the installation command for the native messenger to the clipboard and asks the user to run it in their shell.\n\nThe native messenger's source code may be found here: https://github.com/tridactyl/native_messenger/blob/master/src/native_main.nim\n\nIf your corporate IT policy disallows execution of binaries which have not been whitelisted but allows Python scripts, you may instead use the old native messenger by running `install.sh` or `win_install.ps1` from https://github.com/tridactyl/tridactyl/tree/master/native - the main downside is that it is significantly slower.", new FunctionType([], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["mktridactylrc", new SymbolMetadata("Writes current config to a file.\n\nNB: an RC file is not required for your settings to persist: all settings are stored in a local Firefox storage database by default as soon as you set them.\n\nWith no arguments supplied the excmd will try to find an appropriate\nconfig path and write the rc file to there. Any argument given to the\nexcmd excluding the `-f` flag will be treated as a path to write the rc\nfile to relative to the native messenger's location (`~/.local/share/tridactyl/`). By default, it silently refuses to overwrite existing files.\n\nThe RC file will be split into sections that will be created if a config\nproperty is discovered within one of them:\n- General settings\n- Binds\n- Aliases\n- Autocmds\n- Autocontainers\n- Logging\n\nNote:\n- Subconfig paths fall back to using `js tri.config.set(key: obj)` notation.\n- This method is also used as a fallback mechanism for objects that didn't hit\n  any of the heuristics.\n\nAvailable flags:\n- `-f` will overwrite the config file if it exists.\n- `--clipboard` write config to clipboard - no [[native]] required", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["source", new SymbolMetadata("Runs an RC file from disk or a URL\n\nThis function accepts a flag: `--url` to load a RC from a URL.\n\nIf no argument given, it will try to open ~/.tridactylrc, ~/.config/tridactyl/tridactylrc or $XDG_CONFIG_HOME/tridactyl/tridactylrc in reverse order. You may use a `_` in place of a leading `.` if you wish, e.g, if you use Windows.\n\nIf no url is specified with the `--url` flag, the current page's URL is used to locate the RC file. Ensure the URL you pass (or page you are on) is a \"raw\" RC file, e.g. https://raw.githubusercontent.com/tridactyl/tridactyl/master/.tridactylrc and not https://github.com/tridactyl/tridactyl/blob/master/.tridactylrc.\n\nTridactyl won't run on many raw pages due to a Firefox bug with Content Security Policy, so you may need to use the `source --url [URL]` form.\n\nOn Windows, the `~` expands to `%USERPROFILE%`.\n\nThe RC file is just a bunch of Tridactyl excmds (i.e, the stuff on this help page). Settings persist in local storage. There's an [example file](https://raw.githubusercontent.com/tridactyl/tridactyl/master/.tridactylrc) if you want it.\n\nThere is a [bug](https://github.com/tridactyl/tridactyl/issues/1409) where not all lines of the RC file are executed if you use `sanitise` at the top of it. We instead recommend you put `:bind ZZ composite sanitise tridactyllocal; qall` in your RC file and use `ZZ` to exit Firefox.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["source_quiet", new SymbolMetadata("Same as [[source]] but suppresses all errors", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["updatenative", new SymbolMetadata("Updates the native messenger if it is installed, using our GitHub repo. This is run every time Tridactyl is updated.\n\nIf you want to disable this, or point it to your own native messenger, edit the `nativeinstallcmd` setting.", new FunctionType([new BooleanType(false, true)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["restart", new SymbolMetadata("Restarts firefox with the same commandline arguments.\n\nWarning: This can kill your tabs, especially if you :restart several times\nin a row", new FunctionType([], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["saveas", new SymbolMetadata("Download the current document.\n\nIf you have the native messenger v>=0.1.9 installed, the function accepts an optional argument, filename, which can be:\n- An absolute path\n- A path starting with ~, which will be expanded to your home directory\n- A relative path, relative to the native messenger executable (e.g. ~/.local/share/tridactyl on linux).\nIf filename is not given, a download dialogue will be opened. If filename is a directory, the file will be saved inside of it, its name being inferred from the URL. If the directories mentioned in the path do not exist or if a file already exists at this path, the file will be kept in your downloads folder and an error message will be given.\n\n**NB**: if a non-default save location is chosen, Firefox's download manager will say the file is missing. It is not - it is where you asked it to be saved.\n\nFlags:\n- `--overwrite`: overwrite the destination file.\n- `--cleanup`: removes the downloaded source file e.g. `$HOME/Downlods/downloaded.doc` if moving it to the desired directory fails.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["tabSetActive", new SymbolMetadata("", new FunctionType([new NumberType(false, false)], new TypeReferenceType("Promise", [new TypeReferenceType("Tab", [], false, false)], false, false), false, false), true)],
      ["getJumpPageId", new SymbolMetadata("This is used as an ID for the current page in the jumplist.\nIt has a potentially confusing behavior: if you visit site A, then site B, then visit site A again, the jumplist that was created for your first visit on A will be re-used for your second visit.\nAn ideal solution would be to have a counter that is incremented every time a new page is visited within the tab and use that as the return value for getJumpPageId but this doesn't seem to be trivial to implement.", new FunctionType([], new StringType(false, false), false, false), true)],
      ["saveJumps", new SymbolMetadata("", new FunctionType([new AnyType(true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), true)],
      ["curJumps", new SymbolMetadata("Returns a promise for an object containing the jumplist of all pages accessed in the current tab.\nThe keys of the object currently are the page's URL, however this might change some day. Use [[getJumpPageId]] to access the jumplist of a specific page.", new FunctionType([], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), true)],
      ["jumpnext", new SymbolMetadata("Calls [[jumpprev]](-n)", new FunctionType([new NumberType(false, true)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["jumpprev", new SymbolMetadata("Similar to Pentadactyl or vim's jump list.\n\nWhen you scroll on a page, either by using the mouse or Tridactyl's key bindings, your position in the page will be saved after jumpdelay milliseconds (`:get jumpdelay` to know how many milliseconds that is). If you scroll again, you'll be able to go back to your previous position by using `:jumpprev 1`. If you need to go forward in the jumplist, use `:jumpprev -1`.\n\nKnown bug: Tridactyl will use the same jumplist for multiple visits to a same website in the same tab, see [github issue 834](https://github.com/tridactyl/tridactyl/issues/834).", new FunctionType([new NumberType(false, true)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["addJump", new SymbolMetadata("Called on 'scroll' events.\nIf you want to have a function that moves within the page but doesn't add a\nlocation to the jumplist, make sure to set JUMPED to true before moving\naround.\nThe setTimeout call is required because sometimes a user wants to move\nsomewhere by pressing 'j' multiple times and we don't want to add the\nin-between locations to the jump list", new FunctionType([], new VoidType(false, false), false, false), true)],
      ["unfocus", new SymbolMetadata("Blur (unfocus) the active element", new FunctionType([], new VoidType(false, false), false, false), false)],
      ["scrollpx", new SymbolMetadata("Scrolls the window or any scrollable child element by a pixels on the horizontal axis and b pixels on the vertical axis.", new FunctionType([new NumberType(false, false), new NumberType(false, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["scrollto", new SymbolMetadata("If two numbers are given, treat as x and y values to give to window.scrollTo\nIf one number is given, scroll to that percentage along a chosen axis, defaulting to the y-axis. If the number has 'c' appended to it, it will be interpreted in radians.\n\nNote that if `a` is 0 or 100 and if the document is not scrollable in the given direction, Tridactyl will attempt to scroll the first scrollable element until it reaches the very bottom of that element.\n\nExamples:\n\n- `scrollto 50` -> scroll halfway down the page.\n- `scrollto 3.14c` -> scroll approximately 49.97465213% of the way down the page.", new FunctionType([new UnionType([
        new StringType(false, false),
        new NumberType(false, false)
      ], false, false), new UnionType([
        new NumberType(false, false),
        new LiteralTypeType("x", false, false),
        new LiteralTypeType("y", false, false)
      ], false, true)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["scrollline", new SymbolMetadata("Scrolls the document of its first scrollable child element by n lines.\n\nThe height of a line is defined by the site's CSS. If Tridactyl can't get it, it'll default to 22 pixels.", new FunctionType([new NumberType(false, true), new NumberType(false, true)], new AnyType(true, false), false, false), false)],
      ["scrollpage", new SymbolMetadata("Scrolls the document by n pages.\nThe height of a page is the current height of the window.", new FunctionType([new NumberType(false, true), new NumberType(false, true)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["find", new SymbolMetadata('Rudimentary find mode, left unbound by default as we don\'t currently support `incsearch`. Suggested binds:\n\n     bind / fillcmdline find\n     bind ? fillcmdline find -?\n     bind n findnext 1\n     bind N findnext -1\n     bind ,<Space> nohlsearch\n\nArgument: A string you want to search for.\n\nThis function accepts two flags: `-?` to search from the bottom rather than the top and `-: n` to jump directly to the nth match.\n\nThe behavior of this function is affected by the following setting:\n\n`findcase`: either "smart", "sensitive" or "insensitive". If "smart", find will be case-sensitive if the pattern contains uppercase letters.\n\nKnown bugs: find will currently happily jump to a non-visible element, and pressing n or N without having searched for anything will cause an error.', new FunctionType([new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["findnext", new SymbolMetadata("Jump to the next searched pattern.", new FunctionType([new NumberType(false, true)], new AnyType(true, false), false, false), false)],
      ["clearsearchhighlight", new SymbolMetadata("", new FunctionType([], new AnyType(true, false), false, false), false)],
      ["history", new SymbolMetadata("", new FunctionType([new NumberType(false, false)], new VoidType(false, false), false, false), true)],
      ["forward", new SymbolMetadata("Navigate forward one page in history.", new FunctionType([new NumberType(false, true)], new VoidType(false, false), false, false), false)],
      ["back", new SymbolMetadata("Navigate back one page in history.", new FunctionType([new NumberType(false, true)], new VoidType(false, false), false, false), false)],
      ["reload", new SymbolMetadata("Reload the next n tabs, starting with activeTab, possibly bypassingCache", new FunctionType([new NumberType(false, true), new BooleanType(false, true)], new TypeReferenceType("Promise", [new ArrayType(new VoidType(false, false), false, false)], false, false), false, false), false)],
      ["reloadall", new SymbolMetadata("Reloads all tabs, bypassing the cache if hard is set to true", new FunctionType([new BooleanType(false, true)], new TypeReferenceType("Promise", [new ArrayType(new VoidType(false, false), false, false)], false, false), false, false), false)],
      ["reloadallbut", new SymbolMetadata("Reloads all tabs except the current one, bypassing the cache if hard is set to true\nYou probably want to use [[reloaddead]] instead if you just want to be able to ensure Tridactyl is loaded in all tabs where it can be", new FunctionType([new BooleanType(false, true)], new TypeReferenceType("Promise", [new ArrayType(new VoidType(false, false), false, false)], false, false), false, false), false)],
      ["reloaddead", new SymbolMetadata("Reloads all tabs which Tridactyl isn't loaded in", new FunctionType([new BooleanType(false, true)], new TypeReferenceType("Promise", [new TupleType([
        new AnyType(true, false),
        new AnyType(true, false),
        new AnyType(true, false),
        new AnyType(true, false),
        new AnyType(true, false),
        new AnyType(true, false),
        new AnyType(true, false),
        new AnyType(true, false),
        new AnyType(true, false),
        new AnyType(true, false)
      ], false, false)], false, false), false, false), false)],
      ["reloadhard", new SymbolMetadata("Reload the next n tabs, starting with activeTab. bypass cache for all", new FunctionType([new NumberType(false, true)], new TypeReferenceType("Promise", [new ArrayType(new VoidType(false, false), false, false)], false, false), false, false), false)],
      ["open", new SymbolMetadata("Open a new page in the current tab.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["bmarks", new SymbolMetadata("Works exactly like [[open]], but only suggests bookmarks.\n\nIf you want to use optional flags, you should run `:set completions.Bmark.autoselect false` to prevent the spacebar from inserting the URL of the top bookmark.", new FunctionType([new StringType(false, false), new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["open_quiet", new SymbolMetadata("Like [[open]] but doesn't make a new entry in history.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["url2args", new SymbolMetadata('If the url of the current document matches one of your search engines, will convert it to a list of arguments that open/tabopen will understand. If the url doesn\'t match any search engine, returns the url without modifications.\n\nFor example, if you have searchurls.gi set to "https://www.google.com/search?q=%s&tbm=isch", using this function on a page you opened using "gi butterflies" will return "gi butterflies".\n\nThis is useful when combined with fillcmdline, for example like this: `bind O composite url2args | fillcmdline open`.\n\nNote that this might break with search engines that redirect you to other pages/add GET parameters that do not exist in your searchurl.', new FunctionType([], new TypeReferenceType("Promise", [new StringType(false, false)], false, false), false, false), false)],
      ["removeSource", new SymbolMetadata("", new FunctionType([], new VoidType(false, false), false, false), true)],
      ["viewsource", new SymbolMetadata("Display the (HTML) source of the current page.\n\nBehaviour can be changed by the 'viewsource' setting.\n\nIf the 'viewsource' setting is set to 'default' rather than 'tridactyl',\nthe url the source of which should be displayed can be given as argument.\nOtherwise, the source of the current document will be displayed.", new FunctionType([new StringType(false, true)], new VoidType(false, false), false, false), false)],
      ["home", new SymbolMetadata('Go to the homepages you have set with `set homepages ["url1", "url2"]`.', new FunctionType([new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, true)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["help", new SymbolMetadata('Show this page.\n\n`:help something` jumps to the entry for something. Something can be an excmd, an alias for an excmd, a binding or a setting.\n\nOn the ex command page, the "nmaps" list is a list of all the bindings for the command you\'re seeing and the "exaliases" list lists all its aliases.\n\nIf there\'s a conflict (e.g. you have a "go" binding that does something, a "go" excmd that does something else and a "go" setting that does a third thing), the binding is chosen first, then the setting, then the excmd. In such situations, if you want to let Tridactyl know you\'re looking for something specfic, you can specify the following flags as first arguments:\n\n`-a`: look for an alias\n`-b`: look for a binding\n`-e`: look for an ex command\n`-s`: look for a setting\n\nIf the keyword you gave to `:help` is actually an alias for a composite command (see [[composite]]) , you will be taken to the help section for the first command of the pipeline. You will be able to see the whole pipeline by hovering your mouse over the alias in the "exaliases" list. Unfortunately there currently is no way to display these HTML tooltips from the keyboard.\n\ne.g. `:help bind`', new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["apropos", new SymbolMetadata("Search through the help pages. Accepts the same flags as [[help]]. Only useful in interactive usage with completions; the command itself is just a wrapper for [[help]].", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["tutor", new SymbolMetadata("Start the tutorial", new FunctionType([new StringType(false, true)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["credits", new SymbolMetadata("Display Tridactyl's contributors in order of commits in a user-friendly fashion", new FunctionType([], new TypeReferenceType("Promise", [new TypeReferenceType("Tab", [], false, false)], false, false), false, false), false)],
      ["no_mouse_mode", new SymbolMetadata('Hides the cursor and covers the current page in an overlay to prevent clicking on links with the mouse to force yourself to use hint mode.\n\nTo bring back mouse control, use [[mouse_mode]] or refresh the page.\n\nSuggested usage: `autocmd DocLoad .* no_mouse_mode`\n\n"There is no mouse".', new FunctionType([], new VoidType(false, false), false, false), false)],
      ["neo_mouse_mode", new SymbolMetadata('Matrix variant of [[no_mouse_mode]]\n\n"There is no mouse".\n\nCoincidentally added to Tridactyl at the same time as we reached 1337 stars on GitHub.', new FunctionType([], new VoidType(false, false), false, false), false)],
      ["snow_mouse_mode", new SymbolMetadata("Christmas variant of [[no_mouse_mode]] (if you live in $DEFAULT hemisphere).", new FunctionType([], new VoidType(false, false), false, false), false)],
      ["pied_piper_mouse_mode", new SymbolMetadata("Music variant of [[no_mouse_mode]].", new FunctionType([], new VoidType(false, false), false, false), false)],
      ["drawingstart", new SymbolMetadata("Drawable variant of [[no_mouse_mode]]\nIn this mode, you can use the mouse or a digital stylus to draw. To switch to an eraser, use [[drawingerasertoggle]]\nUse [[mouse_mode]] to return, or refresh page.\nSuggested usage: `autocmd DocLoad .* drawingstart\n\n**Warning**: Windows Ink enabled input devices don't work, disable it for your browser, or use a mouse.", new FunctionType([], new VoidType(false, false), false, false), false)],
      ["drawingerasertoggle", new SymbolMetadata("Switch between pen and eraser for [[drawingstart]]\nSuggested usage: `bind e drawingerasertoggle`. If you have a digital pen, map the button to `e` to switch easily.", new FunctionType([], new VoidType(false, false), false, false), false)],
      ["mouse_mode", new SymbolMetadata("Revert any variant of the [[no_mouse_mode]]\n\nSuggested usage: `bind <C-\\> mouse_mode` with the autocmd mentioned in [[no_mouse_mode]] or [[drawingstart]].", new FunctionType([], new VoidType(false, false), false, false), false)],
      ["findRelLink", new SymbolMetadata("", new FunctionType([new TypeReferenceType("RegExp", [], false, false)], new TypeReferenceType("HTMLAnchorElement", [], false, false), false, false), true)],
      ["selectLast", new SymbolMetadata("", new FunctionType([new StringType(false, false)], new TypeReferenceType("HTMLElement", [], false, false), false, false), true)],
      ["followpage", new SymbolMetadata("Find a likely next/previous link and follow it\n\nIf a link or anchor element with rel=rel exists, use that, otherwise fall back to:\n\n    1) find the last anchor on the page with innerText matching the appropriate `followpagepattern`.\n    2) call [[urlincrement]] with 1 or -1\n\nIf you want to support e.g. French:\n\n```\nset followpagepatterns.next ^(next|newer|prochain)\\b|\xBB|>>\nset followpagepatterns.prev ^(prev(ious)?|older|pr\xE9c\xE9dent)\\b|\xAB|<<\n```", new FunctionType([new UnionType([
        new LiteralTypeType("next", false, false),
        new LiteralTypeType("prev", false, false)
      ], false, true)], new VoidType(false, false), false, false), false)],
      ["urlincrement", new SymbolMetadata("Increment the current tab URL", new FunctionType([new NumberType(false, true), new NumberType(false, true)], new VoidType(false, false), false, false), false)],
      ["urlroot", new SymbolMetadata("Go to the root domain of the current URL", new FunctionType([], new VoidType(false, false), false, false), false)],
      ["urlparent", new SymbolMetadata("Go to the parent URL of the current tab's URL", new FunctionType([new NumberType(false, true)], new VoidType(false, false), false, false), false)],
      ["urlmodify", new SymbolMetadata('Open a URL made by modifying the current URL\n\nThere are several modes:\n\n* Text replace mode:   `urlmodify -t <old> <new>`\n\n   Replaces the first instance of the text `old` with `new`.\n      * `http://example.com` -> (`-t exa peta`) -> `http://petample.com`\n\n* Regex replacment mode: `urlmodify -r <regexp> <new> [flags]`\n\n   Replaces the first match of the `regexp` with `new`. You can use\n   flags `i` and `g` to match case-insensitively and to match\n   all instances respectively\n      * `http://example.com` -> (`-r [ea] X g`) -> `http://XxXmplX.com`\n\n* Query set mode: `urlmodify -s <query> <value>`\n\n   Sets the value of a query to be a specific one. If the query already\n   exists, it will be replaced.\n      * `http://e.com?id=abc` -> (`-s foo bar`) -> `http://e.com?id=abc&foo=bar\n\n* Query replace mode: `urlmodify -q <query> <new_val>`\n\n   Replace the value of a query with a new one:\n      * `http://e.com?id=foo` -> (`-q id bar`) -> `http://e.com?id=bar\n\n* Query delete mode: `urlmodify -Q <query>`\n\n   Deletes the given query (and the value if any):\n      * `http://e.com?id=foo&page=1` -> (`-Q id`) -> `http://e.com?page=1`\n\n* Graft mode: `urlmodify -g <graft_point> <new_path_tail>`\n\n   "Grafts" a new tail on the URL path, possibly removing some of the old\n   tail. Graft point indicates where the old URL is truncated before adding\n   the new path.\n\n   * `graft_point` >= 0 counts path levels, starting from the left\n   (beginning). 0 will append from the "root", and no existing path will\n   remain, 1 will keep one path level, and so on.\n   * `graft_point` < 0 counts from the right (i.e. the end of the current\n   path). -1 will append to the existing path, -2 will remove the last path\n   level, and so on.\n\n   ```plaintext\n   http://website.com/this/is/the/path/component\n   Graft point:       ^    ^  ^   ^    ^        ^\n   From left:         0    1  2   3    4        5\n   From right:       -6   -5 -4  -3   -2       -1\n   ```\n\n   Examples:\n\n   * `http://e.com/issues/42` -> (`-g 0 foo`) -> `http://e.com/foo`\n   * `http://e.com/issues/42` -> (`-g 1 foo`) -> `http://e.com/issues/foo`\n   * `http://e.com/issues/42` -> (`-g -1 foo`) -> `http://e.com/issues/42/foo`\n   * `http://e.com/issues/42` -> (`-g -2 foo`) -> `http://e.com/issues/foo`\n\n\n* URL Input: `urlmodify -*u <arguments> <URL>`\n\n   Each mode can be augmented to accept a URL as the last argument instead of\n   the current url.\n\n   Examples:\n\n   * `urlmodify -tu <old> <new> <URL>`\n   * `urlmodify -su <query> <value> <URL>`\n   * `urlmodify -gu <graft_point> <new_path_tail> <URL>`', new FunctionType([new UnionType([
        new LiteralTypeType("-t", false, false),
        new LiteralTypeType("-r", false, false),
        new LiteralTypeType("-s", false, false),
        new LiteralTypeType("-q", false, false),
        new LiteralTypeType("-Q", false, false),
        new LiteralTypeType("-g", false, false),
        new LiteralTypeType("-tu", false, false),
        new LiteralTypeType("-ru", false, false),
        new LiteralTypeType("-su", false, false),
        new LiteralTypeType("-qu", false, false),
        new LiteralTypeType("-Qu", false, false),
        new LiteralTypeType("-gu", false, false)
      ], false, false), new ArrayType(new StringType(false, false), true, false)], new VoidType(false, false), false, false), false)],
      ["urlmodify_js", new SymbolMetadata("Like [[urlmodify]] but returns the modified URL for use with [[js]] and [[composite]]\n\nE.g.\n\n`:composite urlmodify_js -t www. old. | tabopen `", new FunctionType([new UnionType([
        new LiteralTypeType("-t", false, false),
        new LiteralTypeType("-r", false, false),
        new LiteralTypeType("-s", false, false),
        new LiteralTypeType("-q", false, false),
        new LiteralTypeType("-Q", false, false),
        new LiteralTypeType("-g", false, false),
        new LiteralTypeType("-tu", false, false),
        new LiteralTypeType("-ru", false, false),
        new LiteralTypeType("-su", false, false),
        new LiteralTypeType("-qu", false, false),
        new LiteralTypeType("-Qu", false, false),
        new LiteralTypeType("-gu", false, false)
      ], false, false), new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["geturlsforlinks", new SymbolMetadata("Returns the url of links that have a matching rel.\n\nDon't bind to this: it's an internal function.", new FunctionType([new StringType(false, false), new StringType(false, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), true)],
      ["zoom", new SymbolMetadata("Sets the current page's zoom level anywhere between 30% and 300%.\n\nIf you overshoot the level while using relative adjustments i.e. level > 300% or level < 30% the zoom level will be set to it's maximum or minimum position. Relative adjustments are made * in percentage points, i.e. `:zoom +10 true` increases the zoom level from 50% to 60% or from * 200% to 210%.", new FunctionType([new NumberType(false, true), new StringType(false, true), new StringType(false, true)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["reader", new SymbolMetadata("Opens the current page in Firefox's reader mode.\nYou currently cannot use Tridactyl while in reader mode.", new FunctionType([], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["loadaucmds", new SymbolMetadata("", new FunctionType([new UnionType([
        new LiteralTypeType("UriChange", false, false),
        new LiteralTypeType("DocStart", false, false),
        new LiteralTypeType("DocLoad", false, false),
        new LiteralTypeType("DocEnd", false, false),
        new LiteralTypeType("TabEnter", false, false),
        new LiteralTypeType("TabLeft", false, false),
        new LiteralTypeType("FullscreenEnter", false, false),
        new LiteralTypeType("FullscreenLeft", false, false),
        new LiteralTypeType("FullscreenChange", false, false)
      ], false, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), true)],
      ["focusinput", new SymbolMetadata("Focus the last used input on the page", new FunctionType([new UnionType([
        new StringType(false, false),
        new NumberType(false, false)
      ], false, false)], new VoidType(false, false), false, false), false)],
      ["changelistjump", new SymbolMetadata("Focus the tab which contains the last focussed input element. If you're lucky, it will focus the right input, too.\n\nCurrently just goes to the last focussed input; being able to jump forwards and backwards is planned.", new FunctionType([], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["focusbyid", new SymbolMetadata("", new FunctionType([new StringType(false, false)], new VoidType(false, false), false, false), true)],
      ["tabIndexSetActive", new SymbolMetadata("", new FunctionType([new UnionType([
        new StringType(false, false),
        new NumberType(false, false)
      ], false, false)], new TypeReferenceType("Promise", [new TypeReferenceType("Tab", [], false, false)], false, false), false, false), true)],
      ["tabnext", new SymbolMetadata("Switch to the next tab, wrapping round.\n\nIf increment is specified, move that many tabs forwards.", new FunctionType([new NumberType(false, true)], new TypeReferenceType("Promise", [new TypeReferenceType("Tab", [], false, false)], false, false), false, false), false)],
      ["tabnext_gt", new SymbolMetadata("Switch to the next tab, wrapping round.\n\nIf an index is specified, go to the tab with that number (this mimics the\nbehaviour of `{count}gt` in vim, except that this command will accept a\ncount that is out of bounds (and will mod it so that it is within bounds as\nper [[tabmove]], etc)).", new FunctionType([new NumberType(false, true)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["tabprev", new SymbolMetadata("Switch to the previous tab, wrapping round.\n\nIf increment is specified, move that many tabs backwards.", new FunctionType([new NumberType(false, true)], new TypeReferenceType("Promise", [new TypeReferenceType("Tab", [], false, false)], false, false), false, false), false)],
      ["tabpush", new SymbolMetadata("Pushes the current tab to another window. Only works for windows of the same type\n(can't push a non-private tab to a private window or a private tab to\na non-private window).\nIf *windowId* is not specified, pushes to the next newest window,\nwrapping around.", new FunctionType([new NumberType(false, true)], new TypeReferenceType("Promise", [new UnionType([
        new TypeReferenceType("Tab", [], false, false),
        new ArrayType(new TypeReferenceType("Tab", [], false, false), false, false)
      ], false, false)], false, false), false, false), false)],
      ["tabaudio", new SymbolMetadata("Switch to the tab currently playing audio, if any.", new FunctionType([], new TypeReferenceType("Promise", [new TypeReferenceType("Tab", [], false, false)], false, false), false, false), false)],
      ["winmerge", new SymbolMetadata("Moves all of the targetted window's tabs to the current window. Only works for windows of the same type\n(can't merge a non-private tab with a private window).", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["parseWinTabIndex", new SymbolMetadata("Given a string of the format windowIndex.tabIndex, returns a tuple of\nnumbers corresponding to the window index and tab index or the current\nwindow and tab if the string doesn't have the right format.", new FunctionType([new StringType(false, false)], new TypeReferenceType("Promise", [new ArrayType(new NumberType(false, false), false, false)], false, false), false, false), false)],
      ["tabgrab", new SymbolMetadata("Moves a tab identified by a windowIndex.tabIndex id to the current window.\nOnly works for windows of the same type (can't grab a non-private tab from a\nprivate window and can't grab a private tab from a non-private window).", new FunctionType([new StringType(false, false)], new TypeReferenceType("Promise", [new UnionType([
        new TypeReferenceType("Tab", [], false, false),
        new ArrayType(new TypeReferenceType("Tab", [], false, false), false, false)
      ], false, false)], false, false), false, false), false)],
      ["tabopen", new SymbolMetadata('Like [[open]], but in a new tab. If no address is given, it will open the newtab page, which can be set with `set newtab [url]`\n\nUse the `-c` flag followed by a container name to open a tab in said container. Tridactyl will try to fuzzy match a name if an exact match is not found (opening the tab in no container can be enforced with "firefox-default" or "none"). If any autocontainer directives are configured and -c is not set, Tridactyl will try to use the right container automatically using your configurations.\n\nUse the `-b` flag to open the tab in the background.\n\nUse the `-w` flag to wait for the web page to load before "returning". This only makes sense for use with [[composite]], which waits for each command to return before moving on to the next one, e.g. `composite tabopen -b -w news.bbc.co.uk ; tabnext`.\n\nThese three can be combined in any order, but need to be placed as the first arguments.\n\nUnlike Firefox\'s Ctrl-t shortcut, this opens tabs immediately after the\ncurrently active tab rather than at the end of the tab list because that is\nthe authors\' preference.\n\nIf you would rather the Firefox behaviour `set tabopenpos last`. This\npreference also affects the clipboard, quickmarks, home, help, etc.\n\nIf you would rather the URL be opened as if you\'d middle clicked it, `set\ntabopenpos related`.\n\nHinting is controlled by `relatedopenpos`\n\nAlso see the [[searchengine]] and [[searchurls]] settings.', new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new TypeReferenceType("Tab", [], false, false)], false, false), false, false), false)],
      ["tabqueue", new SymbolMetadata("Passes its first argument to `tabopen -b`. Once the tab opened by `tabopen\n-b` is activated/selected/focused, opens its second argument with `tabopen\n-b`. Once the second tab is activated/selected/focused, opens its third\nargument with `tabopen -b` and so on and so forth until all arguments have\nbeen opened in a new tab or until a tab is closed without being\nactivated/selected/focused.\n\nExample usage:\n   `tabqueue http://example.org http://example.com http://example.net`\n   `composite hint -qpipe a href | tabqueue`", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["idFromIndex", new SymbolMetadata("Resolve a tab index to the tab id of the corresponding tab in this window.", new FunctionType([new UnionType([
        new StringType(false, false),
        new NumberType(false, false)
      ], false, true)], new TypeReferenceType("Promise", [new NumberType(false, false)], false, false), false, false), true)],
      ["tabFromIndex", new SymbolMetadata("Like [[idFromIndex]] but returns the whole tab object", new FunctionType([new UnionType([
        new StringType(false, false),
        new NumberType(false, false)
      ], false, true)], new TypeReferenceType("Promise", [new TypeReferenceType("Tab", [], false, false)], false, false), false, false), true)],
      ["tabonly", new SymbolMetadata("Close all other tabs in this window", new FunctionType([], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["tabduplicate", new SymbolMetadata("Duplicate a tab.", new FunctionType([new NumberType(false, true)], new TypeReferenceType("Promise", [new TypeReferenceType("Tab", [], false, false)], false, false), false, false), false)],
      ["tabdetach", new SymbolMetadata("Detach a tab, opening it in a new window.", new FunctionType([new NumberType(false, true)], new TypeReferenceType("Promise", [new TypeReferenceType("Window", [], false, false)], false, false), false, false), false)],
      ["getSortedWinTabs", new SymbolMetadata("Get list of tabs sorted by most recent use", new FunctionType([], new TypeReferenceType("Promise", [new ArrayType(new TypeReferenceType("Tab", [], false, false), false, false)], false, false), false, false), true)],
      ["fullscreen", new SymbolMetadata("Toggle fullscreen state", new FunctionType([], new TypeReferenceType("Promise", [new TypeReferenceType("Window", [], false, false)], false, false), false, false), false)],
      ["tabclose", new SymbolMetadata("Close a tab.\n\nKnown bug: autocompletion will make it impossible to close more than one tab at once if the list of numbers looks enough like an open tab's title or URL.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["tabcloseallto", new SymbolMetadata("Close all tabs to the side specified", new FunctionType([new StringType(false, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["undo", new SymbolMetadata('Restore the most recently closed item.\nThe default behaviour is to restore the most recently closed tab in the\ncurrent window unless the most recently closed item is a window.\n\nSupplying either "tab" or "window" as an argument will specifically only\nrestore an item of the specified type. Supplying "tab_strict" only restores\ntabs that were open in the current window.', new FunctionType([new StringType(false, true)], new TypeReferenceType("Promise", [new NumberType(false, false)], false, false), false, false), false)],
      ["tabmove", new SymbolMetadata("Move the current tab to be just in front of the index specified.\n\nKnown bug: This supports relative movement with `tabmove +pos` and `tabmove -pos`, but autocomplete doesn't know that yet and will override positive and negative indexes.\n\nPut a space in front of tabmove if you want to disable completion and have the relative indexes at the command line.\n\nBinds are unaffected.", new FunctionType([new StringType(false, true)], new TypeReferenceType("Promise", [new UnionType([
        new TypeReferenceType("Tab", [], false, false),
        new ArrayType(new TypeReferenceType("Tab", [], false, false), false, false)
      ], false, false)], false, false), false, false), false)],
      ["tabsort", new SymbolMetadata("Move tabs in current window according to various criteria:\n\n- `--containers` groups tabs by containers\n- `--title` sorts tabs by title\n- `--url` sorts tabs by url (the default)\n- `(tab1, tab2) => true|false`\n      - sort by arbitrary comparison function. `tab{1,2}` are objects with properties described here: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["pin", new SymbolMetadata("Pin the current tab", new FunctionType([], new TypeReferenceType("Promise", [new TypeReferenceType("Tab", [], false, false)], false, false), false, false), false)],
      ["mute", new SymbolMetadata('Mute current tab or all tabs.\n\nPassing "all" to the excmd will operate on  the mute state of all tabs.\nPassing "unmute" to the excmd will unmute.\nPassing "toggle" to the excmd will toggle the state of `browser.tabs.tab.MutedInfo`', new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["winopen", new SymbolMetadata("Like [[tabopen]], but in a new window.\n\n`winopen -private [...]` will open the result in a private window (and won't store the command in your ex-history ;) ).\n\n`winopen -popup [...]` will open it in a popup window. You can combine the two for a private popup.\n\n`winopen -c containername [...]` will open the result in a container while ignoring other options given. See [[tabopen]] for more details on containers.\n\nExample: `winopen -popup -private ddg.gg`", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["winclose", new SymbolMetadata("Close a window.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new ArrayType(new VoidType(false, false), false, false)], false, false), false, false), false)],
      ["wintitle", new SymbolMetadata("Add/change a prefix to the current window title\n\nExample: `wintitle [Hovercraft research]`\n\nProtip: unicode emojis work :)", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new TypeReferenceType("Window", [], false, false)], false, false), false, false), false)],
      ["qall", new SymbolMetadata("Close all windows", new FunctionType([], new TypeReferenceType("Promise", [new ArrayType(new VoidType(false, false), false, false)], false, false), false, false), false)],
      ["containerclose", new SymbolMetadata("Closes all tabs open in the same container across all windows.", new FunctionType([new StringType(false, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["containercreate", new SymbolMetadata("Creates a new container. Note that container names must be unique and that the checks are case-insensitive.\n\nFurther reading https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/contextualIdentities/ContextualIdentity\n\nExample usage:\n    - `:containercreate tridactyl green dollar`", new FunctionType([new StringType(false, false), new StringType(false, true), new StringType(false, true)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["containerdelete", new SymbolMetadata("Delete a container. Closes all tabs associated with that container beforehand. Note: container names are case-insensitive.", new FunctionType([new StringType(false, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["containerupdate", new SymbolMetadata("Update a container's information. Note that none of the parameters are optional and that container names are case-insensitive.\n\nExample usage:\n\n- Changing the container name: `:containerupdate banking blockchain green dollar`\n\n- Changing the container icon: `:containerupdate banking banking green briefcase`\n\n- Changing the container color: `:containerupdate banking banking purple dollar`", new FunctionType([new StringType(false, false), new StringType(false, false), new StringType(false, false), new StringType(false, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["viewcontainers", new SymbolMetadata("Shows a list of the current containers in Firefox's native JSON viewer in the current tab.\n\nNB: Tridactyl cannot run on this page!", new FunctionType([], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["recontain", new SymbolMetadata("Opens the current tab in another container.\n\nThis is probably not a good idea if you care about tracking protection!\nTransfering URLs from one container to another allows websites to track\nyou across those containers.\n\nRead more here:\nhttps://github.com/mozilla/multi-account-containers/wiki/Moving-between-containers", new FunctionType([new StringType(false, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["version", new SymbolMetadata("", new FunctionType([], new AnyType(true, false), false, false), false)],
      ["mode", new SymbolMetadata("Switch mode.\n\nFor now you probably shouldn't manually switch to other modes than `normal` and `ignore`. Make sure you're aware of the key bindings (ignoremaps) that will allow you to go come back to normal mode from ignore mode before you run `:mode ignore` otherwise you're going to have a hard time re-enabling Tridactyl.\n\nExample:\n     - `mode ignore` to ignore almost all keys.\n\nIf you're looking for a way to temporarily disable Tridactyl, `mode ignore` might be what you're looking for.\n\nNote that when in ignore mode, Tridactyl will not switch to insert mode when focusing text areas/inputs. This is by design.\n\n**New feature:** you can add modes as simply as adding binds with `bind --mode=[newmodename]` and then enter the mode with `mode [newmodename]`.", new FunctionType([new AnyType(true, false)], new VoidType(false, false), false, false), false)],
      ["getnexttabs", new SymbolMetadata("", new FunctionType([new NumberType(false, false), new NumberType(false, true)], new TypeReferenceType("Promise", [new ArrayType(new NumberType(false, false), false, false)], false, false), false, false), true)],
      ["repeat", new SymbolMetadata("Repeats a `cmd` `n` times.\nIf `cmd` doesn't exist, re-executes the last exstr that was executed in the tab.\nExecutes the command once if `n` isn't defined either.\n\nThis re-executes the last *exstr*, not the last *excmd*. Some excmds operate internally by constructing and evaluating exstrs, others by directly invoking excmds without going through the exstr parser. For example, aucmds and keybindings evaluate exstrs and are repeatable, while commands like `:bmarks` directly invoke `:tabopen` and you'll repeat the `:bmarks` rather than the internal `:tabopen`.\n\nIt's difficult to execute this in the background script (`:jsb`, `:run_excmd`, `:autocmd TriStart`, `:source`), but if you you do, it will re-execute the last exstr that was executed in the background script. What this may have been is unpredictable and not precisely encouraged.", new FunctionType([new NumberType(false, true), new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["composite", new SymbolMetadata("Split `cmds` on pipes (|) and treat each as its own command. Return values are passed as the last argument of the next ex command, e.g,\n\n`composite echo yes | fillcmdline` becomes `fillcmdline yes`. A more complicated example is the ex alias, `command current_url composite get_current_url | fillcmdline_notrail `, which is used in, e.g. `bind T current_url tabopen`.\n\nWorkaround: this should clearly be in the parser, but we haven't come up with a good way to deal with |s in URLs, search terms, etc. yet.\n\n`cmds` are also split with semicolons (;) and don't pass things along to each other.\n\nIf you wish to have a command that has semi-colons in it (e.g. some JavaScript or `hint -;`), first bind a [[command]] to it. For example, `command hint_focus -;`, and then `composite hint_focus; !s xdotool key Menu`.\n\nThe behaviour of combining ; and | in the same composite command is left as an exercise for the reader.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["shellescape", new SymbolMetadata("Escape command for safe use in shell with composite. E.g: `composite js MALICIOUS_WEBSITE_FUNCTION() | shellescape | exclaim ls`", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["escapehatch", new SymbolMetadata("Magic escape hatch: if Tridactyl can't run in the current tab, return to a tab in the current window where Tridactyl can run, making such a tab if it doesn't currently exist. If Tridactyl can run in the current tab, return focus to the document body from e.g. the URL bar or a video player.\n\nOnly useful if called from a background context, e.g. at the end of an RC file to ensure that when you start the browser you don't get trapped on an about: page, or via `bind --mode=browser escapehatch` (bound to `<C-,>` by default).\n\nNB: when called via `bind --mode=browser`, we return focus from the address bar by opening and closing the \"sidebar\" (which is used exclusively for this purpose). If escapehatch is called in any other way, we cannot do this as Mozilla thinks it might [spook](https://extensionworkshop.com/documentation/publish/add-on-policies/#no-surprises) [you](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/User_actions) : ).\n\nThis sidebar hack will close other sidebars such a TreestyleTabs. You can disable it with `:set escapehatchsidebarhack false`, but Tridactyl will no longer be able to get focus back from certain places such as the address bar.", new FunctionType([], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["sleep", new SymbolMetadata("Sleep time_ms milliseconds.\nThis is probably only useful for composite commands that need to wait until the previous asynchronous command has finished running.", new FunctionType([new NumberType(false, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["showcmdline", new SymbolMetadata("", new FunctionType([new BooleanType(false, true)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), true)],
      ["hidecmdline", new SymbolMetadata("", new FunctionType([], new VoidType(false, false), false, false), true)],
      ["fillcmdline", new SymbolMetadata("Set the current value of the commandline to string *with* a trailing space", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["fillcmdline_notrail", new SymbolMetadata("Set the current value of the commandline to string *without* a trailing space", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["fillcmdline_nofocus", new SymbolMetadata("Show and fill the command line without focusing it", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["fillcmdline_tmp", new SymbolMetadata("Shows str in the command line for ms milliseconds. Recommended duration: 3000ms.", new FunctionType([new NumberType(false, false), new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["yank", new SymbolMetadata('Copy `content` to clipboard without feedback. Use `clipboard yank` for interactive use.\n\ne.g. `yank bob` puts "bob" in the clipboard; `composite js document.title | yank` puts the document title in the clipboard.', new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new ArrayType(new AnyType(true, false), false, false)], false, false), false, false), false)],
      ["setclip", new SymbolMetadata("Copies a string to the clipboard/selection buffer depending on the user's preferences.", new FunctionType([new StringType(false, false)], new TypeReferenceType("Promise", [new ArrayType(new AnyType(true, false), false, false)], false, false), false, false), true)],
      ["setclip_webapi", new SymbolMetadata("Copies a string to the clipboard using the Clipboard API.", new FunctionType([new StringType(false, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), true)],
      ["getclip", new SymbolMetadata("Fetches the content of the clipboard/selection buffer depending on user's preferences\n\nExposed for use with [[composite]], e.g. `composite getclip | fillcmdline`", new FunctionType([new UnionType([
        new LiteralTypeType("clipboard", false, false),
        new LiteralTypeType("selection", false, false)
      ], false, true)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["getclip_webapi", new SymbolMetadata("Gets the clipboard content using the Clipboard API.", new FunctionType([], new TypeReferenceType("Promise", [new StringType(false, false)], false, false), false, false), true)],
      ["clipboard", new SymbolMetadata('Use the system clipboard.\n\nIf `excmd === "open"`, call [[open]] with the contents of the clipboard. Similarly for [[tabopen]].\n\nIf `excmd === "yank"`, copy the current URL, or if given, the value of toYank, into the system clipboard.\n\nIf `excmd === "yankcanon"`, copy the canonical URL of the current page if it exists, otherwise copy the current URL.\n\nIf `excmd === "yankshort"`, copy the shortlink version of the current URL, and fall back to the canonical then actual URL. Known to work on https://yankshort.neocities.org/.\n\nIf `excmd === "yanktitle"`, copy the title of the open page.\n\nIf `excmd === "yankmd"`, copy the title and url of the open page formatted in Markdown for easy use on sites such as reddit. `yankorg` is similar but for Emacs orgmode.\n\nIf you\'re on Linux and the native messenger is installed, Tridactyl will call an external binary (either xclip or xsel) to read or write to your X selection buffer. If you want another program to be used, set "externalclipboardcmd" to its name and make sure it has the same interface as xsel/xclip ("-i"/"-o" and reading from stdin).\n\nWhen doing a read operation (i.e. open or tabopen), if "putfrom" is set to "selection", the X selection buffer will be read instead of the clipboard. Set "putfrom" to "clipboard" to use the clipboard.\n\nWhen doing a write operation, if "yankto" is set to "selection", only the X selection buffer will be written to. If "yankto" is set to "both", both the X selection and the clipboard will be written to. If "yankto" is set to "clipboard", only the clipboard will be written to.', new FunctionType([new UnionType([
        new LiteralTypeType("open", false, false),
        new LiteralTypeType("yank", false, false),
        new LiteralTypeType("yankshort", false, false),
        new LiteralTypeType("yankcanon", false, false),
        new LiteralTypeType("yanktitle", false, false),
        new LiteralTypeType("yankmd", false, false),
        new LiteralTypeType("yankorg", false, false),
        new LiteralTypeType("xselpaste", false, false),
        new LiteralTypeType("tabopen", false, false)
      ], false, true), new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["yankimage", new SymbolMetadata("Copy an image to the clipboard.", new FunctionType([new StringType(false, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["tab", new SymbolMetadata("Change active tab.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["taball", new SymbolMetadata("Wrapper for [[tab]] with multi-window completions", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["tabcurrentrename", new SymbolMetadata("Rename current tab.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new VoidType(false, false), false, false), true)],
      ["tabrename", new SymbolMetadata("Rename a tab.", new FunctionType([new StringType(false, false), new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["tab_helper", new SymbolMetadata("Helper to change active tab. Used by [[tab]] and [[taball]].", new FunctionType([new BooleanType(false, false), new BooleanType(false, false), new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["command", new SymbolMetadata("Similar to vim's `:command`. Maps one ex-mode command to another.\nIf command already exists, this will override it, and any new commands\nadded in a future release will be SILENTLY overridden. Aliases are\nexpanded recursively.\n\nExamples:\n  - `command t tabopen`\n  - `command tn tabnext_gt`\n  - `command hello t` This will expand recursively into 'hello'->'tabopen'\n\nCommands/aliases are expanded as in a shell, so, given the commands above,\nentering `:tn 43` will expand to `:tabnext_gt 43`. You can use this to create\nyour own ex-commands in conjunction with [[js]], specifically `js -p` and `js -d`.\n\nNote that this is only for excmd -> excmd mappings. To map a normal-mode\ncommand to an excommand, see [[bind]].\n\nSee also:\n  - [[comclear]]", new FunctionType([new StringType(false, false), new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["comclear", new SymbolMetadata("Similar to vim's `comclear` command. Clears an excmd alias defined by\n`command`.\n\nFor example: `comclear helloworld` will reverse any changes caused\nby `command helloworld xxx`\n\nSee also:\n  - [[command]]", new FunctionType([new StringType(false, false)], new VoidType(false, false), false, false), false)],
      ["bind", new SymbolMetadata("Bind a sequence of keys to an excmd or view bound sequence.\n\nThis is an easier-to-implement bodge while we work on vim-style maps.\n\nExamples:\n\n    - `bind G fillcmdline tabopen google`\n    - `bind D composite tabclose | tab #` -> close current tab and switch to most recent previous tab\n    - `bind j scrollline 20`\n    - `bind F hint -b`\n\nYou can view binds by omitting the command line:\n\n    - `bind j`\n    - `bind k`\n\nYou can bind to modifiers and special keys by enclosing them with angle brackets, for example `bind <C-\\>z fullscreen`, `unbind <F1>` (a favourite of people who use TreeStyleTabs :) ), or `bind <Backspace> forward`.\n\nModifiers are truncated to a single character, so Ctrl -> C, Alt -> A, and Shift -> S. Shift is a bit special as it is only required if Shift does not change the key inputted, e.g. `<S-ArrowDown>` is OK, but `<S-a>` should just be `A`.\n\nYou can view all special key names here: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values\n\nUse [[composite]] if you want to execute multiple excmds. Use\n[[fillcmdline]] to put a string in the cmdline and focus the cmdline\n(otherwise the string is executed immediately).\n\nYou can bind to other modes with `bind --mode={insert|ignore|normal|input|ex|hint} ...`, e.g, `bind --mode=insert emacs qall` (NB: unlike vim, all preceeding characters will not be input), or `bind --mode=hint <C-[> hint.reset`.\n\n`bind --mode=browser [key sequence] [ex command]` binds to a special mode which can be accessed all the time in all browser tabs - even tabs in which Tridactyl cannot run. It comes with a few caveats:\n\n- you may only have a few browser-mode binds at once. At the time of writing, this is 8, with 3 initially taken by Tridactyl. If you desperately need more, file an [[issue]].\n- the key sequence must consist of a single, simple key with at least one and no more than two modifiers. An error will be thrown if you try to bind to an invalid key sequence.\n- the `ex command` you bind to may not work fully unless you are on a tab which Tridactyl has access to. Generally, browser-wide actions like making or closing tabs will work but tab-specific actions like scrolling down or entering hint mode will not.\n\nA list of editor functions can be found\n[here](/static/docs/modules/_src_lib_editor_.html).\n\nSee also:\n\n    - [[unbind]]\n    - [[reset]]", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["bindurl", new SymbolMetadata("Like [[bind]] but for a specific url pattern (also see [[seturl]]).", new FunctionType([new StringType(false, false), new StringType(false, false), new StringType(false, false), new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["keymap", new SymbolMetadata("Makes one key equivalent to another for the purposes of most of our parsers. Useful for international keyboard layouts. See user-provided examples for various layouts on our wiki: https://github.com/tridactyl/tridactyl/wiki/Internationalisation\n\ne.g,\n     keymap \u0119 e\n\nSee `:help keytranslatemodes` to enable keymaps in modes other than normal mode.", new FunctionType([new StringType(false, false), new StringType(false, false)], new AnyType(true, false), false, false), false)],
      ["searchsetkeyword", new SymbolMetadata("", new FunctionType([], new VoidType(false, false), false, false), true)],
      ["validateSetArgs", new SymbolMetadata("Validates arguments for set/seturl", new FunctionType([new StringType(false, false), new ArrayType(new StringType(false, false), false, false)], new ArrayType(new AnyType(true, false), false, false), false, false), true)],
      ["seturl", new SymbolMetadata("Usage: `seturl [pattern] key values`", new FunctionType([new StringType(false, false), new StringType(false, false), new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["setmode", new SymbolMetadata("Usage: `setmode mode key values`", new FunctionType([new StringType(false, false), new StringType(false, false), new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["set", new SymbolMetadata('Set a key value pair in config.\n\nUse to set any values found [here](/static/docs/classes/_src_lib_config_.default_config.html).\n\nArrays should be set using JS syntax, e.g. `:set blacklistkeys ["/",","]`.\n\ne.g.\n    set searchurls.google https://www.google.com/search?q=\n    set logging.messaging info\n\nIf no value is given, the value of the of the key will be displayed.\n\nSee also: [[unset]]', new FunctionType([new StringType(false, false), new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["firefoxsyncpull", new SymbolMetadata("Replaces your local configuration with that stored in the Firefox Sync area.\n\nIt does not merge your configurations: it overwrites.\n\nAlso see [[firefoxsyncpush]].", new FunctionType([], new AnyType(true, false), false, false), false)],
      ["firefoxsyncpush", new SymbolMetadata("Pushes your local configuration to the Firefox Sync area.\n\nIt does not merge your configurations: it overwrites.\n\nAlso see [[firefoxsyncpull]].", new FunctionType([], new AnyType(true, false), false, false), false)],
      ["autocmd", new SymbolMetadata("Set autocmds to run when certain events happen.", new FunctionType([new StringType(false, false), new StringType(false, false), new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["autocontain", new SymbolMetadata("Automatically open a domain and all its subdomains in a specified container.\n\n__NB:__ You should use this command with an -s (sane mode) or -u (URL mode) flag. Usage without a flag uses an incorrect regular expression which may cause weird behaviour and has been left in for compatibility reasons.\n\nThis function accepts a `-u` flag to treat the pattern as a URL rather than a domain.\nFor example: `autocontain -u ^https?://([^/]*\\.|)youtube\\.com/ google` is equivalent to `autocontain -s youtube\\.com google`\n\nFor declaring containers that do not yet exist, consider using `auconcreatecontainer true` in your tridactylrc.\nThis allows Tridactyl to automatically create containers from your autocontain directives. Note that they will be random icons and colors.\n\nThe domain is passed through as a regular expression so there are a few gotchas to be aware of:\n* Unescaped periods will match *anything*. `autocontain -s google.co.uk work` will match `google!co$uk`. Escape your periods  (i.e. `\\.`) or accept that you might get some false positives.\n* You can use regex in your pattern. `autocontain -s google\\.(co\\.uk|com) work` will match either `google.co.uk` or `google.com`. If multiple rules match a certain URL, the one with the longest regex will be picked.\n\nThis *should* now peacefully coexist with the Temporary Containers and Multi-Account Containers addons. Do not trust this claim. If a fight starts the participants will try to open infinite tabs. It is *strongly* recommended that you use a tridactylrc so that you can abort a sorceror's-apprentice scenario by killing firefox, commenting out all of autocontainer directives in your rc file, and restarting firefox to clean up the mess. There are a number of strange behaviors resulting from limited coordination between extensions. Redirects can be particularly surprising; for example, with `:autocontain -s will-redirect.example.org example` set and `will-redirect.example.org` redirecting to `redirected.example.org`, navigating to `will-redirect.example.org` will result in the new tab being in the `example` container under some conditions and in the `firefox-default` container under others.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["autocmddelete", new SymbolMetadata("Remove autocmds", new FunctionType([new StringType(false, false), new StringType(false, false)], new AnyType(true, false), false, false), false)],
      ["blacklistadd", new SymbolMetadata("Helper function to put Tridactyl into ignore mode on the provided URL.\n\nSimply creates a DocStart [[autocmd]] that runs `mode ignore`. NB: ignore mode does have a few keybinds by default - see `:viewconfig ignoremaps`. These can be unbound with, e.g. `:unbind --mode=ignore <C-o>`, or `:unbindurl [url] --mode=ignore <C-o>`.\n\nRemove sites from the blacklist with `blacklistremove [url]` or `autocmddelete DocStart [url]`.\n\nIf you're looking for a way to temporarily disable Tridactyl, this might be what you're looking for.\n\n<!-- this should probably be moved to an ex alias once configuration has better help --!>", new FunctionType([new StringType(false, false)], new AnyType(true, false), false, false), false)],
      ["unbind", new SymbolMetadata("Unbind a sequence of keys so that they do nothing at all.\n\nSee also:\n\n    - [[bind]]\n    - [[reset]]", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["unbindurl", new SymbolMetadata("Unbind a sequence of keys you have set with [[bindurl]]. Note that this **kills** a bind, which means Tridactyl will pass it to the page on `pattern`. If instead you want to use the default setting again, use [[reseturl]].", new FunctionType([new StringType(false, false), new StringType(false, false), new StringType(false, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["reset", new SymbolMetadata("Restores a sequence of keys to their default value.", new FunctionType([new StringType(false, false), new StringType(false, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["reseturl", new SymbolMetadata("Restores a sequence of keys to their value in the global config for a specific URL pattern.\n\nSee also:\n  - [[bind]]\n  - [[unbind]]\n  - [[reset]]\n  - [[bindurl]]\n  - [[unbindurl]]\n  - [[seturl]]\n  - [[unseturl]]\n  - [[setmode]]\n  - [[unsetmode]]", new FunctionType([new StringType(false, false), new StringType(false, false), new StringType(false, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["sanitise", new SymbolMetadata("Deletes various bits of Firefox or Tridactyl data\n\nThe list of possible arguments can be found here:\nhttps://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/browsingData/DataTypeSet\n\nAdditional Tridactyl-specific arguments are:\n- `commandline`: Removes the in-memory commandline history.\n- `tridactyllocal`: Removes all tridactyl storage local to this machine. Use it with\n    commandline if you want to delete your commandline history.\n- `tridactylsync`: Removes all tridactyl storage associated with your Firefox Account (i.e, all user configuration, by default).\nThese arguments aren't affected by the timespan parameter.\n\nTimespan parameter:\n-t [0-9]+(m|h|d|w)\n\nExamples:\n\n- `sanitise all` -> Deletes __everything__, including any saved usernames / passwords(!)\n- `sanitise history` -> Deletes all history\n- `sanitise commandline tridactyllocal tridactylsync` -> Deletes every bit of data Tridactyl holds\n- `sanitise cookies -t 3d` -> Deletes cookies that were set during the last three days.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["quickmark", new SymbolMetadata("Bind a quickmark for the current URL or space-separated list of URLs to a key on the keyboard.\n\nAfterwards use go[key], gn[key], or gw[key] to [[open]], [[tabopen]], or\n[[winopen]] the URL respectively.\n\nExample:\n- `quickmark m https://mail.google.com/mail/u/0/#inbox`", new FunctionType([new StringType(false, false), new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["get", new SymbolMetadata("Puts the contents of config value with keys `keys` into the commandline and the background page console\n\nIt's a bit rubbish, but we don't have a good way to provide feedback to the commandline yet.\n\nYou can view the log entry in the browser console (Ctrl-Shift-j).\n\nFor example, you might try `get nmaps` to see all of your current binds.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["viewconfig", new SymbolMetadata("Opens the current configuration in Firefox's native JSON viewer in a new tab.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new VoidType(false, false), false, false), false)],
      ["jsonview", new SymbolMetadata("View a JSON object in Firefox's JSON viewer.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new ArrayType(new AnyType(true, false), false, false)], false, false), false, false), false)],
      ["unseturl", new SymbolMetadata("Reset a site-specific setting.\n\nusage: `unseturl [pattern] key`", new FunctionType([new StringType(false, false), new StringType(false, false)], new AnyType(true, false), false, false), false)],
      ["unsetmode", new SymbolMetadata("Reset a mode-specific setting.\n\nusage: `unsetmode mode key`", new FunctionType([new StringType(false, false), new StringType(false, false)], new AnyType(true, false), false, false), false)],
      ["unset", new SymbolMetadata("Reset a config setting to default", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["setnull", new SymbolMetadata('"Delete" a default setting. E.g. `setnull searchurls.github` means `open github test` would search your default search engine for "github test".', new FunctionType([new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["hint", new SymbolMetadata("Hint a page.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["rot13", new SymbolMetadata("Perform rot13.\n\nTransforms all text nodes in the current tab via rot13. Only characters in\nthe ASCII range are considered.", new FunctionType([new NumberType(false, false)], new VoidType(false, false), false, false), false)],
      ["jumble", new SymbolMetadata("Perform text jumbling (reibadailty).\n\nShuffles letters except for first and last in all words in text nodes in the current tab. Only characters in\nthe ASCII range are considered.\n\nInspired by: https://www.newscientist.com/letter/mg16221887-600-reibadailty/", new FunctionType([], new VoidType(false, false), false, false), false)],
      ["run_exstr", new SymbolMetadata("Hacky ex string parser.\n\nUse it for fire-and-forget running of background commands in content.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["gobble", new SymbolMetadata("Initialize gobble mode.\n\nIt will read `nChars` input keys, append them to `endCmd` and execute that\nstring.", new FunctionType([new NumberType(false, false), new StringType(false, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["getGotoSelectors", new SymbolMetadata("", new FunctionType([], new TypeReferenceType("Promise", [new ArrayType(new ObjectType(/* @__PURE__ */ new Map([]), false, false), false, false)], false, false), false, false), true)],
      ["goto", new SymbolMetadata("Jump to selector.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["nmode", new SymbolMetadata("Initialize n [mode] mode.\n\nIn this special mode, a series of key sequences are executed as bindings from a different mode, as specified by the\n`mode` argument. After the count of accepted sequences is `n`, the finalizing ex command given as the `endexArr`\nargument is executed, which defaults to `mode ignore`.\n\nExample: `:nmode normal 1 mode ignore`\nThis looks up the next key sequence in the normal mode bindings, executes it, and switches the mode to `ignore`.\nIf the key sequence does not match a binding, it will be silently passed through to Firefox, but it will be counted\nfor the termination condition.", new FunctionType([new StringType(false, false), new NumberType(false, false), new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["tssReadFromCss", new SymbolMetadata("Read text content of elements matching the given selector", new FunctionType([new StringType(false, false)], new VoidType(false, false), false, false), false)],
      ["ttsread", new SymbolMetadata("Read the given text using the browser's text to speech functionality and\nthe settings currently set", new FunctionType([new UnionType([
        new LiteralTypeType("-t", false, false),
        new LiteralTypeType("-c", false, false)
      ], false, false), new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["ttsvoices", new SymbolMetadata("Show a list of the voices available to the TTS system. These can be\nset in the config using `ttsvoice`", new FunctionType([], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["ttscontrol", new SymbolMetadata("Cancel current reading and clear pending queue\n\nArguments:\n   - stop:    cancel current and pending utterances", new FunctionType([new StringType(false, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["buildFilterConfigs", new SymbolMetadata("Build a set of FilterConfigs from a list of human-input filter\nspecs.", new FunctionType([new ArrayType(new StringType(false, false), false, false)], new ArrayType(new AnyType(true, false), false, false), false, false), true)],
      ["perfdump", new SymbolMetadata('Dump the raw json for our performance counters. Filters with\ntrailing slashes are class names, :start | :end | :measure specify\nwhat type of sample to pass through, and all others are function\nnames. All filters must match for a sample to be dumped.\n\nTridactyl does not collect performance information by default. To\nget this data you\'ll have to set the configuration option\n`perfcounters` to `"true"`. You may also want to examine the value\nof `perfsamples`.', new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["perfhistogram", new SymbolMetadata("Pretty-print a histogram of execution durations for you. Arguments\nare as above, with the addition that this automatically filters to\ncounter samples of type :measure.\n\nNote that this will display its output by opening a data: url with\ntext in the place of your current tab.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["bmark", new SymbolMetadata("Add or remove a bookmark.\n\nOptionally, you may give the bookmark a title. If no URL is given, a bookmark is added for the current page.\n\nIf a bookmark already exists for the URL, it is removed, even if a title is given.\n\nDoes not support creation of folders: you'll need to use the Firefox menus for that.", new FunctionType([new StringType(false, true), new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new TypeReferenceType("BookmarkTreeNode", [], false, false)], false, false), false, false), false)],
      ["echo", new SymbolMetadata("", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new StringType(false, false), false, false), false)],
      ["js_helper", new SymbolMetadata("helper function for js and jsb\n\n-p to take a single extra argument located at the end of str[]\n-d[delimiter character] to take a space-separated array of arguments after the delimiter\n-s to load js script of a source file from the config path", new FunctionType([new ArrayType(new StringType(false, false), false, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), true)],
      ["js", new SymbolMetadata("Lets you execute JavaScript in the page context. If you want to get the result back, use\n\n     `composite js ... | fillcmdline`", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["jsb", new SymbolMetadata("Lets you execute JavaScript in the background context. All the help from [[js]] applies. Gives you a different `tri` object which has access to more excmds and web-extension APIs.", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["issue", new SymbolMetadata('Opens a new tab the url of which is "https://github.com/tridactyl/tridactyl/issues/new" and automatically fill add tridactyl, firefox and os version to the issue.', new FunctionType([], new TypeReferenceType("Promise", [new TypeReferenceType("Tab", [], false, false)], false, false), false, false), false)],
      ["updatecheck", new SymbolMetadata("Checks if there are any stable updates available for Tridactyl.\n\nRelated settings:\n\n- `update.nag = true | false` - checks for updates on Tridactyl start.\n- `update.nagwait = 7` - waits 7 days before nagging you to update.\n- `update.checkintervalsecs = 86400` - waits 24 hours between checking for an update.", new FunctionType([new UnionType([
        new LiteralTypeType("manual", false, false),
        new LiteralTypeType("auto_polite", false, false),
        new LiteralTypeType("auto_impolite", false, false)
      ], false, true)], new TypeReferenceType("Promise", [new BooleanType(false, false)], false, false), false, false), false)],
      ["keyfeed", new SymbolMetadata("Feed some keys to Tridactyl's parser. E.g. `keyfeed jkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjkjjkj`.\n\nNB:\n\n- Does _not_ function like Vim's noremap - `bind j keyfeed j` will cause an infinite loop.\n- Doesn't work in exmode - i.e. `keyfeed t<CR>` won't work.", new FunctionType([new StringType(false, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["extoptions", new SymbolMetadata("Opens optionsUrl for the selected extension in a popup window.\n\nNB: Tridactyl cannot run on this page!", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["elementunhide", new SymbolMetadata("Restore the most recently hidden element. Repeated invocations restore the next-most-recently-hidden element.\n\n(Elements can be hidden with `;K` and `:hint -K`.)", new FunctionType([], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)]
    ]))],
    ["src/lib/config.ts", new FileMetadata(/* @__PURE__ */ new Map([["default_config", new ClassMetadata(/* @__PURE__ */ new Map([
      ["configversion", new SymbolMetadata("Internal version number Tridactyl uses to know whether it needs to update from old versions of the configuration.\n\nChanging this might do weird stuff.", new StringType(false, false), false)],
      ["subconfigs", new SymbolMetadata("Internal field to handle site-specific configs. Use :seturl/:unseturl to change these values.", new ObjectType(/* @__PURE__ */ new Map([["", new TypeReferenceType("DeepPartial", [new TypeReferenceType("default_config", [], false, false)], false, false)]]), false, false), false)],
      ["modesubconfigs", new SymbolMetadata("Internal field to handle mode-specific configs. Use :setmode/:unsetmode to change these values.\n\nChanging this might do weird stuff.", new ObjectType(/* @__PURE__ */ new Map([["", new TypeReferenceType("DeepPartial", [new TypeReferenceType("default_config", [], false, false)], false, false)]]), false, false), false)],
      ["priority", new SymbolMetadata("Internal field to handle site-specific config priorities. Use :seturl/:unseturl to change this value.", new NumberType(false, false), false)],
      ["exmaps", new SymbolMetadata("exmaps contains all of the bindings for the command line.\nYou can of course bind regular ex commands but also [editor functions](/static/docs/modules/_src_lib_editor_.html) and [commandline-specific functions](/static/docs/modules/_src_commandline_frame_.html).", new ObjectType(/* @__PURE__ */ new Map([]), false, false), false)],
      ["ignoremaps", new SymbolMetadata('ignoremaps contain all of the bindings for "ignore mode".\n\nThey consist of key sequences mapped to ex commands.', new ObjectType(/* @__PURE__ */ new Map([]), false, false), false)],
      ["imaps", new SymbolMetadata('imaps contain all of the bindings for "insert mode".\n\nOn top of regular ex commands, you can also bind [editor functions](/static/docs/modules/_src_lib_editor_.html) in insert mode.\n\nThey consist of key sequences mapped to ex commands.', new ObjectType(/* @__PURE__ */ new Map([]), false, false), false)],
      ["inputmaps", new SymbolMetadata('inputmaps contain all of the bindings for "input mode".\n\nOn top of regular ex commands, you can also bind [editor functions](/static/docs/modules/_src_lib_editor_.html) in input mode.\n\nThey consist of key sequences mapped to ex commands.', new ObjectType(/* @__PURE__ */ new Map([]), false, false), false)],
      ["superignore", new SymbolMetadata('Disable Tridactyl almost completely within a page, e.g. `seturl ^https?://mail.google.com disable true`. Only takes affect on page reload.\n\nYou are usually better off using `blacklistadd` and `seturl [url] noiframe true` as you can then still use some Tridactyl binds, e.g. `shift-insert` for exiting ignore mode.\n\nNB: you should only use this with `seturl`. If you get trapped with Tridactyl disabled everywhere just run `tri unset superignore` in the Firefox address bar. If that still doesn\'t fix things, you can totally reset Tridactyl by running `tri help superignore` in the Firefox address bar, scrolling to the bottom of that page and then clicking "Reset Tridactyl config".', new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["nmaps", new SymbolMetadata('nmaps contain all of the bindings for "normal mode".\n\nThey consist of key sequences mapped to ex commands.', new ObjectType(/* @__PURE__ */ new Map([]), false, false), false)],
      ["vmaps", new SymbolMetadata("", new ObjectType(/* @__PURE__ */ new Map([]), false, false), false)],
      ["hintmaps", new SymbolMetadata("", new ObjectType(/* @__PURE__ */ new Map([]), false, false), false)],
      ["browsermaps", new SymbolMetadata('Browser-wide binds accessible in all modes and on pages where Tridactyl "cannot run".\n<!-- Note to developers: binds here need to also be listed in manifest.json -->', new ObjectType(/* @__PURE__ */ new Map([]), false, false), false)],
      ["leavegithubalone", new SymbolMetadata("Whether to allow pages (not necessarily github) to override `/`, which is a default Firefox binding.", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["blacklistkeys", new SymbolMetadata("Which keys to protect from pages that try to override them. Requires [[leavegithubalone]] to be set to false.", new ArrayType(new StringType(false, false), false, false), false)],
      ["autocmds", new SymbolMetadata("Autocommands that run when certain events happen, and other conditions are met.\n\nRelated ex command: `autocmd`.", new ObjectType(/* @__PURE__ */ new Map([]), false, false), false)],
      ["keytranslatemap", new SymbolMetadata('Map for translating keys directly into other keys in normal-ish modes. For example, if you have an entry in this config option mapping `\u043F` to `g`, then you could type `\u043F\u043F` instead of `gg` or `\u043Fi` instead of `gi` or `;\u043F` instead of `;g`. This is primarily useful for international users who don\'t want to deal with rebuilding their bindings every time tridactyl ships a new default keybind. It\'s not as good as shipping properly internationalized sets of default bindings, but it\'s probably as close as we\'re going to get on a small open-source project like this.\n\nNote that the current implementation does not allow you to "chain" keys, for example, "a"=>"b" and "b"=>"c" for "a"=>"c". You can, however, swap or rotate keys, so "a"=>"b" and "b"=>"a" will work the way you\'d expect, as will "a"=>"b" and "b"=>"c" and "c"=>"a".', new ObjectType(/* @__PURE__ */ new Map([]), false, false), false)],
      ["keytranslatemodes", new SymbolMetadata("Whether to use the keytranslatemap in various maps.", new ObjectType(/* @__PURE__ */ new Map([["", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false)]]), false, false), false)],
      ["autocontain", new SymbolMetadata("Automatically place these sites in the named container.\n\nEach key corresponds to a URL fragment which, if contained within the page URL, the site will be opened in a container tab instead.", new AnyType(true, false), false)],
      ["autocontainmode", new SymbolMetadata("Strict mode will always ensure a domain is open in the correct container, replacing the current tab if necessary.\n\nRelaxed mode is less aggressive and instead treats container domains as a default when opening a new tab.", new UnionType([
        new LiteralTypeType("strict", false, false),
        new LiteralTypeType("relaxed", false, false)
      ], false, false), false)],
      ["exaliases", new SymbolMetadata("Aliases for the commandline.\n\nYou can make a new one with `command alias ex-command`.", new ObjectType(/* @__PURE__ */ new Map([]), false, false), false)],
      ["followpagepatterns", new SymbolMetadata("Used by `]]` and `[[` to look for links containing these words.\n\nEdit these if you want to add, e.g. other language support.", new ObjectType(/* @__PURE__ */ new Map([]), false, false), false)],
      ["searchengine", new SymbolMetadata("The default search engine used by `open search`. If empty string, your browser's default search engine will be used. If set to something, Tridactyl will first look at your [[searchurls]] and then at the search engines for which you have defined a keyword on `about:preferences#search`.", new StringType(false, false), false)],
      ["searchurls", new SymbolMetadata('Definitions of search engines for use via `open [keyword]`.\n\n`%s` will be replaced with your whole query and `%s1`, `%s2`, ..., `%sn` will be replaced with the first, second and nth word of your query. If there are none of these patterns in your search urls, your query will simply be appended to the searchurl.\n\nExamples:\n- When running `open gi cute puppies`, with a `gi` searchurl defined with `set searchurls.gi https://www.google.com/search?q=%s&tbm=isch`, tridactyl will navigate to `https://www.google.com/search?q=cute puppies&tbm=isch`.\n- When running `tabopen translate en ja Tridactyl`, with a `translate` searchurl defined with `set searchurls.translate https://translate.google.com/#view=home&op=translate&sl=%s1&tl=%s2&text=%s3`, tridactyl will navigate to `https://translate.google.com/#view=home&op=translate&sl=en&tl=ja&text=Tridactyl`.\n\n[[setnull]] can be used to "delete" the default search engines. E.g. `setnull searchurls.google`.', new ObjectType(/* @__PURE__ */ new Map([]), false, false), false)],
      ["newtab", new SymbolMetadata("URL the newtab will redirect to.\n\nAll usual rules about things you can open with `open` apply, with the caveat that you'll get interesting results if you try to use something that needs `nativeopen`: so don't try `about:newtab` or a `file:///` URI. You should instead use a data URI - https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs - or host a local webserver (e.g. Caddy).", new StringType(false, false), false)],
      ["viewsource", new SymbolMetadata("Whether `:viewsource` will use our own page that you can use Tridactyl binds on, or Firefox's default viewer, which you cannot use Tridactyl on.", new UnionType([
        new LiteralTypeType("tridactyl", false, false),
        new LiteralTypeType("default", false, false)
      ], false, false), false)],
      ["homepages", new SymbolMetadata('Pages opened with `gH`. In order to set this value, use `:set homepages ["example.org", "example.net", "example.com"]` and so on.', new ArrayType(new StringType(false, false), false, false), false)],
      ["hintchars", new SymbolMetadata("Characters to use in hint mode.\n\nThey are used preferentially from left to right.", new StringType(false, false), false)],
      ["hintfiltermode", new SymbolMetadata("The type of hinting to use. `vimperator` will allow you to filter links based on their names by typing non-hint chars. It is recommended that you use this in conjuction with the [[hintchars]] setting, which you should probably set to e.g, `5432167890`. \xB4vimperator-reflow\xB4 additionally updates the hint labels after filtering.", new UnionType([
        new LiteralTypeType("simple", false, false),
        new LiteralTypeType("vimperator", false, false),
        new LiteralTypeType("vimperator-reflow", false, false)
      ], false, false), false)],
      ["hintnames", new SymbolMetadata("Whether to optimise for the shortest possible names for each hint, or to use a simple numerical ordering. If set to `numeric`, overrides `hintchars` setting.", new UnionType([
        new LiteralTypeType("short", false, false),
        new LiteralTypeType("numeric", false, false),
        new LiteralTypeType("uniform", false, false)
      ], false, false), false)],
      ["hintuppercase", new SymbolMetadata("Whether to display the names for hints in uppercase.", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["hintdelay", new SymbolMetadata("The delay in milliseconds in `vimperator` style hint modes after selecting a hint before you are returned to normal mode.\n\nThe point of this is to prevent accidental execution of normal mode binds due to people typing more than is necessary to choose a hint.", new NumberType(false, false), false)],
      ["hintshift", new SymbolMetadata("Controls whether hints should be shifted in quick-hints mode.\n\nHere's what it means: let's say you have hints from a to z but are only\ninterested in every second hint. You first press `a`, then `c`.\nTridactyl will realize that you skipped over `b`, and so that the next\nhint you're going to trigger is probably `e`. Tridactyl will shift all\nhint names so that `e` becomes `c`, `d` becomes `b`, `c` becomes `a` and\nso on.\nThis means that once you pressed `c`, you can keep on pressing `c` to\ntrigger every second hint. Only makes sense with hintnames = short.", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["hintautoselect", new SymbolMetadata("Controls whether hints should be followed automatically.\n\nIf set to `false`, hints will only be followed upon confirmation. This applies to cases when there is only a single match or only one link on the page.", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["allowautofocus", new SymbolMetadata("Controls whether the page can focus elements for you via js\n\nNB: will break fancy editors such as CodeMirror on Jupyter. Simply use `seturl` to whitelist pages you need it on.\n\nBest used in conjunction with browser.autofocus in `about:config`", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["preventautofocusjackhammer", new SymbolMetadata("Uses a loop to prevent focus until you interact with a page. Only recommended for use via `seturl` for problematic sites as it can be a little heavy on CPU if running on all tabs. Should be used in conjuction with [[allowautofocus]]", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["smoothscroll", new SymbolMetadata("Whether to use Tridactyl's (bad) smooth scrolling.", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["scrollduration", new SymbolMetadata("How viscous you want smooth scrolling to feel.", new NumberType(false, false), false)],
      ["tabopenpos", new SymbolMetadata("Where to open tabs opened with `tabopen` - to the right of the current tab, or at the end of the tabs.", new UnionType([
        new LiteralTypeType("next", false, false),
        new LiteralTypeType("last", false, false),
        new LiteralTypeType("related", false, false)
      ], false, false), false)],
      ["tabclosepinned", new SymbolMetadata("When enabled (the default), running tabclose will close the tabs whether they are pinned or not. When disabled, tabclose will fail with an error if a tab is pinned.", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["tabsort", new SymbolMetadata("Controls which tab order to use when opening the tab/buffer list. Either mru = sort by most recent tab or default = by tab index", new UnionType([
        new LiteralTypeType("default", false, false),
        new LiteralTypeType("mru", false, false)
      ], false, false), false)],
      ["relatedopenpos", new SymbolMetadata("Where to open tabs opened with hinting - as if it had been middle clicked, to the right of the current tab, or at the end of the tabs.", new UnionType([
        new LiteralTypeType("next", false, false),
        new LiteralTypeType("last", false, false),
        new LiteralTypeType("related", false, false)
      ], false, false), false)],
      ["ttsvoice", new SymbolMetadata('The name of the voice to use for text-to-speech. You can get the list of installed voices by running the following snippet: `js alert(window.speechSynthesis.getVoices().reduce((a, b) => a + " " + b.name))`', new StringType(false, false), false)],
      ["ttsvolume", new SymbolMetadata("Controls text-to-speech volume. Has to be a number between 0 and 1.", new NumberType(false, false), false)],
      ["ttsrate", new SymbolMetadata("Controls text-to-speech speed. Has to be a number between 0.1 and 10.", new NumberType(false, false), false)],
      ["ttspitch", new SymbolMetadata("Controls text-to-speech pitch. Has to be between 0 and 2.", new NumberType(false, false), false)],
      ["gimode", new SymbolMetadata('When set to "nextinput", pressing `<Tab>` after gi selects the next input.\n\nWhen set to "firefox", `<Tab>` behaves like normal, focusing the next tab-indexed element regardless of type.', new UnionType([
        new LiteralTypeType("nextinput", false, false),
        new LiteralTypeType("firefox", false, false)
      ], false, false), false)],
      ["cursorpos", new SymbolMetadata("Decides where to place the cursor when selecting non-empty input fields", new UnionType([
        new LiteralTypeType("beginning", false, false),
        new LiteralTypeType("end", false, false)
      ], false, false), false)],
      ["theme", new SymbolMetadata("The theme to use.\n\nPermitted values: run `:composite js tri.styling.THEMES | fillcmdline` to find out.", new StringType(false, false), false)],
      ["customthemes", new SymbolMetadata("Storage for custom themes\n\nMaps theme names to CSS. Predominantly used automatically by [[colourscheme]] to store themes read from disk, as documented by [[colourscheme]]. Setting this manually is untested but might work provided that [[colourscheme]] is then used to change the theme to the right theme name.", new ObjectType(/* @__PURE__ */ new Map([]), false, false), false)],
      ["modeindicator", new SymbolMetadata("Whether to display the mode indicator or not.", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["modeindicatormodes", new SymbolMetadata("Whether to display the mode indicator in various modes. Ignored if modeindicator set to false.", new ObjectType(/* @__PURE__ */ new Map([["", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false)]]), false, false), false)],
      ["jumpdelay", new SymbolMetadata("Milliseconds before registering a scroll in the jumplist", new NumberType(false, false), false)],
      ["logging", new SymbolMetadata("Logging levels. Unless you're debugging Tridactyl, it's unlikely you'll ever need to change these.", new ObjectType(/* @__PURE__ */ new Map([["", new UnionType([
        new LiteralTypeType("never", false, false),
        new LiteralTypeType("error", false, false),
        new LiteralTypeType("warning", false, false),
        new LiteralTypeType("info", false, false),
        new LiteralTypeType("debug", false, false)
      ], false, false)]]), false, false), false)],
      ["noiframe", new SymbolMetadata(`Disables the commandline iframe. Dangerous setting, use [[seturl]] to set it. If you ever set this setting to "true" globally and then want to set it to false again, you can do this by opening Tridactyl's preferences page from about:addons.`, new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["noiframeon", new SymbolMetadata("", new ArrayType(new StringType(false, false), false, false), false)],
      ["editorcmd", new SymbolMetadata('Insert / input mode edit-in-$EDITOR command to run\nThis has to be a command that stays in the foreground for the whole editing session\n"auto" will attempt to find a sane editor in your path.\nPlease send your requests to have your favourite terminal moved further up the list to /dev/null.\n          (but we are probably happy to add your terminal to the list if it isn\'t already there.)\n\nExample values:\n- linux: `xterm -e vim`\n- windows: `start cmd.exe /c \\"vim\\"`.\n\nAlso see [:editor](/static/docs/modules/_src_excmds_.html#editor).', new StringType(false, false), false)],
      ["rsscmd", new SymbolMetadata('Command that should be run by the [[rssexec]] ex command. Has the\nfollowing format:\n- %u: url\n- %t: title\n- %y: type (rss, atom, xml...)\nWarning: This is a very large footgun. %u will be inserted without any\nkind of escaping, hence you must obey the following rules if you care\nabout security:\n- Do not use a composite command. If you need a composite command,\ncreate an alias.\n- Do not use `js` or `jsb`. If you need to use them, create an alias.\n- Do not insert any %u, %t or %y in shell commands run by the native\nmessenger. Use pipes instead.\n\nHere\'s an example of how to save an rss url in a file on your disk\nsafely:\n`alias save_rss jsb -p tri.native.run("cat >> ~/.config.newsboat/urls", JS_ARG)`\n`set rsscmd save_rss %u`\nThis is safe because the url is passed to jsb as an argument rather than\nbeing expanded inside of the string it will execute and because it is\npiped to the shell command rather than being expanded inside of it.', new StringType(false, false), false)],
      ["browser", new SymbolMetadata("The browser executable to look for in commands such as `restart`. Not as mad as it seems if you have multiple versions of Firefox...", new StringType(false, false), false)],
      ["yankto", new SymbolMetadata("Which clipboard to store items in. Requires the native messenger to be installed.", new UnionType([
        new LiteralTypeType("clipboard", false, false),
        new LiteralTypeType("selection", false, false),
        new LiteralTypeType("both", false, false)
      ], false, false), false)],
      ["putfrom", new SymbolMetadata("Which clipboard to retrieve items from. Requires the native messenger to be installed.\n\nPermitted values: `clipboard`, or `selection`.", new UnionType([
        new LiteralTypeType("clipboard", false, false),
        new LiteralTypeType("selection", false, false)
      ], false, false), false)],
      ["externalclipboardcmd", new SymbolMetadata("Clipboard command to try to get the selection from (e.g. `xsel` or `xclip`)", new StringType(false, false), false)],
      ["downloadsskiphistory", new SymbolMetadata("Whether downloads (e.g. via ;s hint modes) appear in your download history.\n\nNB: will cause downloads to fail silently if Tridactyl is not allowed to run in private windows (regardless of whether you are trying to call it in a private window).", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["nativeinstallcmd", new SymbolMetadata('Set this to something weird if you want to have fun every time Tridactyl tries to update its native messenger.\n\n%TAG will be replaced with your version of Tridactyl for stable builds, or "master" for beta builds\n\nNB: Windows has its own platform-specific default.', new StringType(false, false), false)],
      ["update", new SymbolMetadata("Used by :updatecheck and related built-in functionality to automatically check for updates and prompt users to upgrade.", new ObjectType(/* @__PURE__ */ new Map([]), false, false), false)],
      ["profiledir", new SymbolMetadata("Profile directory to use with native messenger with e.g, `guiset`.", new StringType(false, false), false)],
      ["tabopencontaineraware", new SymbolMetadata("If enabled, tabopen opens a new tab in the currently active tab's container.", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["containerindicator", new SymbolMetadata("If moodeindicator is enabled, containerindicator will color the border of the mode indicator with the container color.", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["auconcreatecontainer", new SymbolMetadata("Autocontain directives create a container if it doesn't exist already.", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["historyresults", new SymbolMetadata("Number of most recent results to ask Firefox for. We display the top 20 or so most frequently visited ones.", new NumberType(false, false), false)],
      ["bmarkweight", new SymbolMetadata("When displaying bookmarks in history completions, how many page views to pretend they have.", new NumberType(false, false), false)],
      ["gotoselector", new SymbolMetadata("Default selector for :goto command.", new StringType(false, false), false)],
      ["completions", new SymbolMetadata("General completions options - NB: options are set according to our internal completion source name - see - `src/completions/[name].ts` in the Tridactyl source.", new ObjectType(/* @__PURE__ */ new Map([]), false, false), false)],
      ["findresults", new SymbolMetadata("Number of results that should be shown in completions. -1 for unlimited", new NumberType(false, false), false)],
      ["findcontextlen", new SymbolMetadata("Number of characters to use as context for the matches shown in completions", new NumberType(false, false), false)],
      ["findcase", new SymbolMetadata("Whether find should be case-sensitive", new UnionType([
        new LiteralTypeType("smart", false, false),
        new LiteralTypeType("sensitive", false, false),
        new LiteralTypeType("insensitive", false, false)
      ], false, false), false)],
      ["findhighlighttimeout", new SymbolMetadata("How long find highlights should persist in milliseconds. `<= 0` means they persist until cleared", new NumberType(false, false), false)],
      ["incsearch", new SymbolMetadata("Whether Tridactyl should jump to the first match when using `:find`", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["minincsearchlen", new SymbolMetadata("How many characters should be typed before triggering incsearch/completions", new NumberType(false, false), false)],
      ["csp", new SymbolMetadata('Deprecated.\nChange this to "clobber" to ruin the "Content Security Policy" of all sites a bit and make Tridactyl run a bit better on some of them, e.g. raw.github*', new UnionType([
        new LiteralTypeType("untouched", false, false),
        new LiteralTypeType("clobber", false, false)
      ], false, false), false)],
      ["wordpattern", new SymbolMetadata("JavaScript RegExp used to recognize words in text.* functions (e.g. text.transpose_words). Should match any character belonging to a word.", new StringType(false, false), false)],
      ["perfcounters", new SymbolMetadata("Activate tridactyl's performance counters. These have a\nmeasurable performance impact, since every sample is a few\nhundred bytes and we sample tridactyl densely, but they're good\nwhen you're trying to optimize things.", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["perfsamples", new SymbolMetadata(`How many samples to store from the perf counters.

Each performance entry is two numbers (16 bytes), an entryType
of either "mark" or "measure" (js strings are utf-16 ad we have
two marks for each measure, so amortize to about 10 bytes per
entry), and a string name that for Tridactyl object will be
about 40 (utf-16) characters (80 bytes), plus object overhead
roughly proportional to the string-length of the name of the
constructor (in this case something like 30 bytes), for a total
of what we'll call 128 bytes for ease of math.

We want to store, by default, about 1MB of performance
statistics, so somewhere around 10k samples.`, new StringType(false, false), false)],
      ["modeindicatorshowkeys", new SymbolMetadata("Show (partial) command in the mode indicator.\nCorresponds to 'showcmd' option of vi.", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["urlparenttrailingslash", new SymbolMetadata("Whether a trailing slash is appended when we get the parent of a url with\ngu (or other means).", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["visualenterauto", new SymbolMetadata("Whether to enter visual mode when text is selected. Visual mode can always be entered with `:mode visual`.", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["visualexitauto", new SymbolMetadata("Whether to return to normal mode when text is deselected.", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["escapehatchsidebarhack", new SymbolMetadata("Whether to open and close the sidebar quickly to get focus back to the page when <C-,> is pressed.\n\nDisable if the fact that it closes TreeStyleTabs gets on your nerves too much : )\n\nNB: when disabled, <C-,> can't get focus back from the address bar, but it can still get it back from lots of other places (e.g. Flash-style video players)", new UnionType([
        new LiteralTypeType("false", false, false),
        new LiteralTypeType("true", false, false)
      ], false, false), false)],
      ["completionfuzziness", new SymbolMetadata("Threshold for fuzzy matching on completions. Lower => stricter matching. Range between 0 and 1: 0 corresponds to perfect matches only. 1 will match anything.\n\nhttps://fusejs.io/api/options.html#threshold", new NumberType(false, false), false)]
    ]))]]), /* @__PURE__ */ new Map([
      ["o", new SymbolMetadata("", new FunctionType([new AnyType(true, false)], new AnyType(true, false), false, false), true)],
      ["schlepp", new SymbolMetadata("", new FunctionType([new AnyType(true, false)], new VoidType(false, false), false, false), true)],
      ["getDeepProperty", new SymbolMetadata("Given an object and a target, extract the target if it exists, else return undefined", new FunctionType([new AnyType(true, false), new ArrayType(new StringType(false, false), false, false)], new AnyType(true, false), false, false), true)],
      ["setDeepProperty", new SymbolMetadata("Create the key path target if it doesn't exist and set the final property to value.\n\nIf the path is an empty array, replace the obj.", new FunctionType([new AnyType(true, false), new AnyType(true, false), new AnyType(true, false)], new AnyType(true, false), false, false), true)],
      ["mergeDeep", new SymbolMetadata("", new FunctionType([new AnyType(true, false), new AnyType(true, false)], new AnyType(true, false), false, false), true)],
      ["getURL", new SymbolMetadata("", new FunctionType([new StringType(false, false), new ArrayType(new StringType(false, false), false, false)], new AnyType(true, false), false, false), true)],
      ["get", new SymbolMetadata("Get the value of the key target.\n\nIf the user has not specified a key, use the corresponding key from\ndefaults, if one exists, else undefined.", new FunctionType([new UnionType([
        new LiteralTypeType("rsscmd", false, false),
        new LiteralTypeType("noiframeon", false, false),
        new LiteralTypeType("csp", false, false),
        new LiteralTypeType("theme", false, false),
        new LiteralTypeType("autocmds", false, false),
        new LiteralTypeType("exaliases", false, false),
        new LiteralTypeType("modesubconfigs", false, false),
        new LiteralTypeType("allowautofocus", false, false),
        new LiteralTypeType("autocontain", false, false),
        new LiteralTypeType("update", false, false),
        new LiteralTypeType("imaps", false, false),
        new LiteralTypeType("viewsource", false, false),
        new LiteralTypeType("nmaps", false, false),
        new LiteralTypeType("configversion", false, false),
        new TypeReferenceType("... 74 more ...", [], false, false),
        new LiteralTypeType("completionfuzziness", false, false)
      ], false, true), new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), true)],
      ["getDynamic", new SymbolMetadata("Get the value of the key target.\n\nPlease only use this with targets that will be used at runtime - it skips static checks. Prefer [[get]].", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new AnyType(true, false), false, false), false)],
      ["getAsyncDynamic", new SymbolMetadata("Get the value of the key target.\n\nPlease only use this with targets that will be used at runtime - it skips static checks. Prefer [[getAsync]].", new FunctionType([new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new AnyType(true, false)], false, false), false, false), false)],
      ["getAsync", new SymbolMetadata("Get the value of the key target, but wait for config to be loaded from the\ndatabase first if it has not been at least once before.\n\nThis is useful if you are a content script and you've just been loaded.", new FunctionType([new UnionType([
        new LiteralTypeType("rsscmd", false, false),
        new LiteralTypeType("noiframeon", false, false),
        new LiteralTypeType("csp", false, false),
        new LiteralTypeType("theme", false, false),
        new LiteralTypeType("autocmds", false, false),
        new LiteralTypeType("exaliases", false, false),
        new LiteralTypeType("modesubconfigs", false, false),
        new LiteralTypeType("allowautofocus", false, false),
        new LiteralTypeType("autocontain", false, false),
        new LiteralTypeType("update", false, false),
        new LiteralTypeType("imaps", false, false),
        new LiteralTypeType("viewsource", false, false),
        new LiteralTypeType("nmaps", false, false),
        new LiteralTypeType("configversion", false, false),
        new TypeReferenceType("... 74 more ...", [], false, false),
        new LiteralTypeType("completionfuzziness", false, false)
      ], false, true), new ArrayType(new StringType(false, false), true, false)], new TypeReferenceType("Promise", [new TypeReferenceType("...", [], false, false)], false, false), false, false), true)],
      ["push", new SymbolMetadata("", new FunctionType([], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["pull", new SymbolMetadata("", new FunctionType([], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), false)],
      ["setURL", new SymbolMetadata("", new FunctionType([new AnyType(true, false), new ArrayType(new AnyType(true, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), true)],
      ["set", new SymbolMetadata('Full target specification, then value\n\ne.g.\n    set("nmaps", "o", "open")\n    set("search", "default", "google")\n    set("aucmd", "BufRead", "memrise.com", "open memrise.com")', new FunctionType([new ArrayType(new AnyType(true, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), true)],
      ["unsetURL", new SymbolMetadata("", new FunctionType([new AnyType(true, false), new ArrayType(new AnyType(true, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), true)],
      ["unset", new SymbolMetadata("Delete the key at target in USERCONFIG if it exists", new FunctionType([new ArrayType(new AnyType(true, false), true, false)], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), true)],
      ["save", new SymbolMetadata("Save the config back to storage API.\n\nConfig is not synchronised between different instances of this module until\nsometime after this happens.", new FunctionType([], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), true)],
      ["update", new SymbolMetadata(`Updates the config to the latest version.
Proposed semantic for config versionning:
- x.y -> x+1.0 : major architectural changes
- x.y -> x.y+1 : renaming settings/changing their types
There's no need for an updater if you're only adding a new setting/changing
a default setting

When adding updaters, don't forget to set("configversion", newversionnumber)!`, new FunctionType([], new TypeReferenceType("Promise", [new BooleanType(false, false)], false, false), false, false), true)],
      ["init", new SymbolMetadata("Read all user configuration from storage API then notify any waiting asynchronous calls\n\nasynchronous calls generated by getAsync.", new FunctionType([], new TypeReferenceType("Promise", [new VoidType(false, false)], false, false), false, false), true)],
      ["addChangeListener", new SymbolMetadata("", new FunctionType([new TypeReferenceType("P", [], false, false), new FunctionType([new AnyType(true, false), new AnyType(true, false)], new VoidType(false, false), false, false)], new VoidType(false, false), false, false), true)],
      ["removeChangeListener", new SymbolMetadata("", new FunctionType([new TypeReferenceType("P", [], false, false), new FunctionType([new AnyType(true, false), new AnyType(true, false)], new VoidType(false, false), false, false)], new VoidType(false, false), false, false), true)],
      ["parseConfig", new SymbolMetadata('Parse the config into a string representation of a .tridactylrc config file.\nTries to parse the config into sectionable chunks based on keywords.\nBinds, aliases, autocmds and logging settings each have their own section while the rest are dumped into "General Settings".', new FunctionType([], new StringType(false, false), false, false), false)]
    ]))]
  ]));
  var staticThemes = ["auto", "dark", "default", "greenmat", "halloween", "midnight", "quake", "quakelight", "shydactyl"];

  // src/completions/Apropos.ts
  var AproposCompletionOption = class extends CompletionOptionHTML {
    constructor(name, doc, flag) {
      super();
      this.name = name;
      this.fuseKeys = [];
      this.value = `${flag} ${name}`;
      this.html = html`<tr class="AproposCompletionOption option">
            <td class="name">${name}</td>
            <td class="doc">${doc}</td>
        </tr>`;
    }
  };
  var AproposCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super(["apropos"], "AproposCompletionSource", "Apropos");
      this._parent = _parent;
      this._parent.appendChild(this.node);
    }
    async filter(exstr) {
      this.lastExstr = exstr;
      this.completion = void 0;
      const [prefix, query] = this.splitOnPrefix(exstr);
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      const file = everything.getFile("src/lib/config.ts");
      const default_config2 = file.getClass("default_config");
      const excmds = everything.getFile("src/excmds.ts");
      const fns = excmds.getFunctions();
      const settings = get2();
      const exaliases = settings.exaliases;
      const bindings = settings.nmaps;
      if (fns === void 0 || exaliases === void 0 || bindings === void 0) {
        return;
      }
      const flags = {
        "-a": (options, query2) => options.concat(Object.keys(exaliases).filter((alias) => (alias + expandExstr(alias) + excmds.getFunction(expandExstr(alias))).toLowerCase().includes(query2)).map((alias) => {
          const cmd = expandExstr(alias);
          const doc = (excmds.getFunction(cmd) || {}).doc || "";
          return new AproposCompletionOption(alias, `Alias for \`${cmd}\`. ${doc}`, "-a");
        })),
        "-b": (options, query2) => options.concat(Object.keys(bindings).filter((binding) => (binding + bindings[binding]).toLowerCase().includes(query2)).map((binding) => new AproposCompletionOption(binding, `Normal mode binding for \`${bindings[binding]}\``, "-b"))),
        "-e": (options, query2) => options.concat(fns.filter(([name, fn]) => !fn.hidden && (name + fn.doc).toLowerCase().includes(query2)).map(([name, fn]) => new AproposCompletionOption(name, `Excmd. ${fn.doc}`, "-e"))),
        "-s": (options, query2) => options.concat(Object.keys(settings).filter((x) => (x + default_config2.getMember(x).doc).toLowerCase().includes(query2)).map((setting) => {
          const member = default_config2.getMember(setting);
          let doc = "";
          if (member !== void 0) {
            doc = member.doc;
          }
          return new AproposCompletionOption(setting, `Setting. ${doc}`, "-s");
        }))
      };
      const args = query.split(" ");
      let opts = [];
      if (Object.keys(flags).includes(args[0])) {
        opts = flags[args[0]](opts, args.slice(1).join(" "));
      } else {
        opts = Object.keys(flags).reduce((acc, curFlag) => flags[curFlag](acc, query), []);
      }
      this.options = opts;
      this.options.sort((compopt1, compopt2) => compopt1.name.localeCompare(compopt2.name));
      return this.updateChain();
    }
    updateChain() {
      this.options.forEach((option) => option.state = "normal");
      return this.updateDisplay();
    }
  };

  // src/completions/Bindings.ts
  var BindingsCompletionOption = class extends CompletionOptionHTML {
    constructor(value, binding) {
      super();
      this.value = value;
      this.fuseKeys = [];
      this.html = html`<tr class="BindingsCompletionOption option">
            <td class="name">${binding.name}</td>
            <td class="content">${binding.value}</td>
            <td class="type">${binding.mode}</td>
        </tr>`;
    }
  };
  var BindingsCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super(["bind", "unbind", "bindurl", "unbindurl", "reset", "reseturl"], "BindingsCompletionSource", "Bindings");
      this._parent = _parent;
      this._parent.appendChild(this.node);
    }
    async filter(exstr) {
      this.lastExstr = exstr;
      let options = "";
      let [prefix, query] = this.splitOnPrefix(exstr);
      const args = query ? query.split(/\s+/) : [];
      let configName = "nmaps";
      let modeName = "normal";
      let urlPattern = null;
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      this.deselect();
      if (prefix.trim().endsWith("url")) {
        urlPattern = args.length > 0 ? args.shift() : "";
        options += urlPattern ? urlPattern + " " : "";
        if (args.length === 0) {
          const patterns = get2("subconfigs");
          this.options = Object.keys(patterns).filter((pattern) => pattern.startsWith(urlPattern)).sort().map((pattern) => new BindingsCompletionOption(pattern, {
            name: pattern,
            value: "",
            mode: "URL Pattern"
          }));
          return this.updateChain();
        }
      }
      if (args.length === 1 && args[0].startsWith("--m")) {
        const margs = args[0].split("=");
        if ("--mode".includes(margs[0])) {
          const modeStr = margs.length > 1 ? margs[1] : "";
          this.options = modes.filter((k) => k.startsWith(modeStr)).map((name) => new BindingsCompletionOption(options + "--mode=" + name, {
            name,
            value: "",
            mode: "Mode Name"
          }));
          return this.updateChain();
        }
      }
      if (args.length > 0 && args[0].startsWith("--mode=")) {
        const modeStr = args.shift();
        const mode = modeStr.replace("--mode=", "");
        modeName = mode;
        if (maps2mode.has(mode + "maps")) {
          modeName = maps2mode.get(mode + "maps");
        }
        configName = mode2maps.get(modeName);
        options += `--mode=${modeName} `;
      }
      if (!configName) {
        this.options = [];
        return this.updateChain();
      }
      const bindings = urlPattern ? getURL(urlPattern, [configName]) : get2(configName);
      if (bindings === void 0) {
        this.options = [];
        return this.updateChain();
      }
      query = args.join(" ").toLowerCase();
      this.options = Object.keys(bindings).filter((x) => x.toLowerCase().startsWith(query)).sort().map((keystr) => new BindingsCompletionOption(options + keystr + " " + bindings[keystr], {
        name: keystr,
        value: JSON.stringify(bindings[keystr]),
        mode: `${configName} (${modeName})`
      }));
      return this.updateChain();
    }
    updateChain() {
      this.options.forEach((option) => option.state = "normal");
      return this.updateDisplay();
    }
  };

  // src/lib/logging.ts
  var LevelToNum = /* @__PURE__ */ new Map();
  LevelToNum.set("never", 0);
  LevelToNum.set("error", 1);
  LevelToNum.set("warning", 2);
  LevelToNum.set("info", 3);
  LevelToNum.set("debug", 4);
  var Logger = class {
    constructor(logModule) {
      this.logModule = logModule;
    }
    log(level) {
      const configedLevel = get2("logging", this.logModule);
      if (LevelToNum.get(level) <= LevelToNum.get(configedLevel)) {
        switch (level) {
          case "error":
            return async (...message2) => {
              console.error(...message2);
              return browser.runtime.sendMessage({
                type: "controller_background",
                command: "acceptExCmd",
                args: [
                  "fillcmdline_nofocus # " + message2.join(" ")
                ]
              });
            };
          case "warning":
            return console.warn;
          case "info":
            return console.log;
          case "debug":
            return console.debug;
        }
      }
      return function() {
      };
    }
    get debug() {
      return this.log("debug");
    }
    get info() {
      return this.log("info");
    }
    get warning() {
      return this.log("warning");
    }
    get error() {
      return this.log("error");
    }
  };
  var logging_default = Logger;

  // src/lib/messaging.ts
  var logger = new logging_default("messaging");
  function attributeCaller(obj) {
    function handler(message2, sender, sendResponse) {
      logger.debug(message2);
      if (message2.args === void 0)
        message2.args = [];
      try {
        const response = obj[message2.command](...message2.args);
        if (response instanceof Promise) {
          logger.debug("Returning promise...", response);
          sendResponse(response);
        } else if (response !== void 0) {
          logger.debug("Returning synchronously...", response);
          sendResponse(response);
        }
      } catch (e) {
        logger.error(`Error processing ${message2.command}(${message2.args})`, e);
        return Promise.reject(e);
      }
    }
    return handler;
  }
  async function message(type3, command, ...args) {
    const message2 = {
      type: type3,
      command,
      args
    };
    return browser.runtime.sendMessage(message2);
  }
  async function messageTab(tabId, type3, command, args) {
    const message2 = {
      type: type3,
      command,
      args
    };
    return browserBg.tabs.sendMessage(tabId, message2);
  }
  var _ownTabId;
  async function messageOwnTab(type3, command, args) {
    if (_ownTabId === void 0) {
      _ownTabId = await ownTabId();
    }
    if (_ownTabId === void 0)
      throw new Error("Can't message own tab: _ownTabId is undefined");
    return messageTab(_ownTabId, type3, command, args);
  }
  var listeners = /* @__PURE__ */ new Map();
  function addListener(type3, callback) {
    if (!listeners.get(type3)) {
      listeners.set(type3, /* @__PURE__ */ new Set());
    }
    listeners.get(type3).add(callback);
    return () => {
      listeners.get(type3).delete(callback);
    };
  }
  if (getContext() === "background") {
    addListener("owntab_background", (message2, sender, sendResponse) => {
      const x = Object.assign(/* @__PURE__ */ Object.create(null), sender.tab);
      x.mutedInfo = Object.assign(/* @__PURE__ */ Object.create(null), sender.tab.mutedInfo);
      x.sharingState = Object.assign(/* @__PURE__ */ Object.create(null), sender.tab.sharingState);
      sendResponse(Promise.resolve(x));
    });
  }
  function onMessage(message2, sender, sendResponse) {
    if (listeners.get(message2.type)) {
      for (const listener of listeners.get(message2.type)) {
        listener(message2, sender, sendResponse);
      }
    }
  }
  browser.runtime.onMessage.addListener(onMessage);

  // src/lib/browser_proxy.ts
  var browserProxy = new Proxy(/* @__PURE__ */ Object.create(null), {
    get(target, api) {
      return new Proxy({}, {
        get(_, func) {
          return (...args) => message("browser_proxy_background", "shim", api, func, args);
        }
      });
    }
  });
  var browser_proxy_default = browserProxy;

  // src/lib/webext.ts
  function inContentScript() {
    return getContext() === "content";
  }
  function notBackground() {
    return getContext() !== "background";
  }
  function getContext() {
    if (!browser.tabs) {
      return "content";
    } else if (browser.runtime.getURL("_generated_background_page.html") === window.location.href) {
      return "background";
    } else {
      return "extension";
    }
  }
  var browserBg = inContentScript() ? browser_proxy_default : browser;
  async function ownTab() {
    return browser.runtime.sendMessage({ type: "owntab_background" });
  }
  async function ownTabId() {
    return (await ownTab()).id;
  }

  // src/completions/providers.ts
  function newtaburl() {
    const newtab = browser.runtime.getManifest().chrome_url_overrides.newtab;
    return newtab !== null ? browser.runtime.getURL(newtab) : null;
  }
  async function getBookmarks(query) {
    let bookmarks = await browserBg.bookmarks.search({ query });
    bookmarks = bookmarks.filter((b) => {
      try {
        return new URL(b.url);
      } catch (e) {
        return false;
      }
    });
    bookmarks.sort((a, b) => b.dateAdded - a.dateAdded);
    const seen = /* @__PURE__ */ new Map();
    bookmarks = bookmarks.filter((b) => {
      if (seen.get(b.title) === b.url)
        return false;
      else {
        seen.set(b.title, b.url);
        return true;
      }
    });
    return bookmarks;
  }
  function frecency(item) {
    return item.visitCount * -1;
  }
  async function getHistory(query) {
    let history2 = await browserBg.history.search({
      text: query,
      maxResults: get2("historyresults"),
      startTime: 0
    });
    const dedupe = /* @__PURE__ */ new Map();
    for (const page of history2) {
      if (page.url !== newtaburl()) {
        if (dedupe.has(page.url)) {
          if (dedupe.get(page.url).title.length < page.title.length) {
            dedupe.set(page.url, page);
          }
        } else {
          dedupe.set(page.url, page);
        }
      }
    }
    history2 = [...dedupe.values()];
    history2.sort((a, b) => frecency(a) - frecency(b));
    return history2;
  }
  async function getTopSites() {
    return (await browserBg.topSites.get()).filter((page) => page.url !== newtaburl());
  }
  async function getCombinedHistoryBmarks(query) {
    const [history2, bookmarks] = await Promise.all([
      getHistory(query),
      getBookmarks(query)
    ]);
    const combinedMap = new Map(bookmarks.map((bmark) => [
      bmark.url,
      { title: bmark.title, url: bmark.url, bmark }
    ]));
    history2.forEach((page) => {
      if (combinedMap.has(page.url))
        combinedMap.get(page.url).history = page;
      else
        combinedMap.set(page.url, {
          title: page.title,
          url: page.url,
          history: page
        });
    });
    const score = (x) => (x.history ? frecency(x.history) : 0) - (x.bmark ? get2("bmarkweight") : 0);
    return Array.from(combinedMap.values()).sort((a, b) => score(a) - score(b));
  }

  // src/completions/Bmark.ts
  var BmarkCompletionOption = class extends CompletionOptionHTML {
    constructor(value, bmark) {
      super();
      this.value = value;
      this.fuseKeys = [];
      if (!bmark.title) {
        bmark.title = new URL(bmark.url).host;
      }
      this.fuseKeys.push(bmark.title, bmark.url);
      this.html = html`<tr class="BmarkCompletionOption option">
            <td class="prefix">${"".padEnd(2)}</td>
            <td class="title">${bmark.title}</td>
            <td class="content">
                <a class="url" target="_blank" href=${bmark.url}
                    >${bmark.url}</a
                >
            </td>
        </tr>`;
    }
  };
  var BmarkCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super(["bmarks"], "BmarkCompletionSource", "Bookmarks");
      this._parent = _parent;
      this.shouldSetStateFromScore = true;
      this._parent.appendChild(this.node);
      this.sortScoredOptions = true;
      this.shouldSetStateFromScore = get2("completions", "Bmark", "autoselect") === "true";
    }
    async filter(exstr) {
      this.lastExstr = exstr;
      let [prefix, query] = this.splitOnPrefix(exstr);
      let option = "";
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      if (query.startsWith("-t ")) {
        option = "-t ";
        query = query.slice(3);
      }
      if (query.startsWith("-c")) {
        const args = query.split(" ");
        option += args.slice(0, 2).join(" ");
        option += " ";
        query = args.slice(2).join(" ");
      }
      this.completion = void 0;
      this.options = (await getBookmarks(query)).slice(0, 10).map((page) => new BmarkCompletionOption(option + page.url, page));
      this.lastExstr = prefix + query;
      return this.updateChain();
    }
    setStateFromScore(scoredOpts) {
      super.setStateFromScore(scoredOpts, this.shouldSetStateFromScore);
    }
    updateChain() {
      const query = this.splitOnPrefix(this.lastExstr)[1];
      if (query && query.trim().length > 0) {
        this.setStateFromScore(this.scoredOptions(query));
      } else {
        this.options.forEach((option) => option.state = "normal");
      }
      return this.updateDisplay();
    }
    select(option) {
      if (this.lastExstr !== void 0 && option !== void 0) {
        this.completion = "bmarks " + option.value;
        option.state = "focused";
        this.lastFocused = option;
      } else {
        throw new Error("lastExstr and option must be defined!");
      }
    }
  };

  // src/completions/Excmd.ts
  var ExcmdCompletionOption = class extends CompletionOptionHTML {
    constructor(value, documentation = "") {
      super();
      this.value = value;
      this.documentation = documentation;
      this.fuseKeys = [];
      this.fuseKeys.push(this.value);
      this.html = html`<tr class="ExcmdCompletionOption option">
            <td class="excmd">${value}</td>
            <td class="documentation">${documentation}</td>
        </tr>`;
    }
  };
  var ExcmdCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super([], "ExcmdCompletionSource", "ex commands");
      this._parent = _parent;
      this.updateOptions();
      this._parent.appendChild(this.node);
    }
    async filter(exstr) {
      this.lastExstr = exstr;
      return this.onInput(exstr);
    }
    async onInput(exstr) {
      return this.updateOptions(exstr);
    }
    updateChain(exstr = this.lastExstr, options = this.options) {
      if (this.options.length > 0)
        this.state = "normal";
      else
        this.state = "hidden";
      this.updateDisplay();
    }
    select(option) {
      this.completion = option.value;
      option.state = "focused";
      this.lastFocused = option;
    }
    setStateFromScore(scoredOpts) {
      super.setStateFromScore(scoredOpts, false);
    }
    async updateOptions(exstr = "") {
      this.lastExstr = exstr;
      const excmds = everything.getFile("src/excmds.ts");
      if (!excmds)
        return;
      const fns = excmds.getFunctions();
      this.options = this.scoreOptions(fns.filter(([name, fn]) => !fn.hidden && name.startsWith(exstr)).map(([name, fn]) => new ExcmdCompletionOption(name, fn.doc)));
      const exaliasesConfig = get2("exaliases");
      const exaliases = Object.keys(exaliasesConfig).filter((a) => a.startsWith(exstr)).reduce((obj, key) => {
        obj[key] = exaliasesConfig[key];
        return obj;
      }, {});
      for (const alias of Object.keys(exaliases)) {
        const cmd = expandExstr(alias, exaliases);
        const fn = excmds.getFunction(cmd);
        if (fn) {
          this.options.push(new ExcmdCompletionOption(alias, `Alias for \`${cmd}\`. ${fn.doc}`));
        } else {
          this.options.push(new ExcmdCompletionOption(alias, `Alias for \`${cmd}\`.`));
        }
      }
      const seen = new Set(this.options.map((o2) => o2.value));
      const partial_options = this.scoreOptions(fns.filter(([name, fn]) => !fn.hidden && name.includes(exstr) && !seen.has(name)).map(([name, fn]) => new ExcmdCompletionOption(name, fn.doc)));
      this.options = this.options.concat(partial_options);
      this.options.forEach((o2) => o2.state = "normal");
      return this.updateChain();
    }
    scoreOptions(options) {
      return options.sort((o1, o2) => o1.value.localeCompare(o2.value));
    }
  };

  // src/completions/Composite.ts
  var PREFIX = "composite";
  var regex = new RegExp("^" + PREFIX + " ");
  var CompositeCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super([PREFIX], "CompositeCompletionSource", "ex commands");
      this._parent = _parent;
      this.updateOptions();
      this._parent.appendChild(this.node);
    }
    async filter(exstr) {
      this.lastExstr = exstr;
      return this.onInput(exstr);
    }
    async onInput(exstr) {
      return this.updateOptions(exstr);
    }
    updateChain(exstr = this.lastExstr, options = this.options) {
      if (this.options.length > 0)
        this.state = "normal";
      else
        this.state = "hidden";
      this.updateDisplay();
    }
    select(option) {
      this.completion = this.lastExstr.replace(new RegExp(this.getendexstr(this.lastExstr) + "$"), "") + option.value;
      option.state = "focused";
      this.lastFocused = option;
    }
    setStateFromScore(scoredOpts) {
      super.setStateFromScore(scoredOpts, false);
    }
    async updateOptions(exstr = "") {
      const end_exstr = this.getendexstr(exstr);
      this.lastExstr = exstr;
      const [prefix] = this.splitOnPrefix(exstr);
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      const excmds = everything.getFile("src/excmds.ts");
      if (!excmds)
        return;
      const fns = excmds.getFunctions();
      this.options = this.scoreOptions(fns.filter(([name, fn]) => !fn.hidden && name.startsWith(end_exstr)).map(([name, fn]) => new ExcmdCompletionOption(name, fn.doc)));
      const exaliases = Object.keys(get2("exaliases")).filter((a) => a.startsWith(end_exstr));
      for (const alias of exaliases) {
        const cmd = expandExstr(alias);
        const fn = excmds.getFunction(cmd);
        if (fn) {
          this.options.push(new ExcmdCompletionOption(alias, `Alias for \`${cmd}\`. ${fn.doc}`));
        } else {
          this.options.push(new ExcmdCompletionOption(alias, `Alias for \`${cmd}\`.`));
        }
      }
      this.options.forEach((o2) => o2.state = "normal");
      return this.updateChain();
    }
    scoreOptions(options) {
      return options.sort((o1, o2) => o1.value.localeCompare(o2.value));
    }
    getendexstr(exstr) {
      return exstr.replace(regex, "").split("|").slice(-1)[0].split(";").slice(-1)[0].trim();
    }
  };

  // src/lib/extension_info.ts
  var installedExtensions = {};
  function updateExtensionInfo(extension) {
    installedExtensions[extension.id] = extension;
  }
  async function hasManagementPermission() {
    return browser.permissions.contains({
      permissions: ["management"]
    });
  }
  async function init2() {
    const hasPermission = await hasManagementPermission();
    if (!hasPermission) {
      return;
    }
    let extensions = [];
    try {
      extensions = await browser.management.getAll();
    } catch (e) {
      return;
    }
    for (const extension of extensions) {
      installedExtensions[extension.id] = extension;
    }
    browser.management.onInstalled.addListener(updateExtensionInfo);
    browser.management.onEnabled.addListener(updateExtensionInfo);
    browser.management.onDisabled.addListener(updateExtensionInfo);
    browser.management.onUninstalled.addListener(updateExtensionInfo);
  }
  async function listExtensions() {
    await init2();
    return Object.keys(installedExtensions).map((key) => installedExtensions[key]).filter((obj) => obj.optionsUrl.length > 0);
  }

  // src/completions/Extensions.ts
  var ExtensionsCompletionOption = class extends CompletionOptionHTML {
    constructor(name, optionsUrl) {
      super();
      this.name = name;
      this.optionsUrl = optionsUrl;
      this.fuseKeys = [];
      this.fuseKeys.push(this.name);
      this.html = html`<tr class="option">
            <td class="title">${name}</td>
        </tr>`;
    }
  };
  var ExtensionsCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super(["extoptions"], "ExtensionsCompletionSource", "Extension options");
      this._parent = _parent;
      this._parent.appendChild(this.node);
    }
    async filter(exstr) {
      this.lastExstr = exstr;
      const [prefix, query] = this.splitOnPrefix(exstr);
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      const extensions = await listExtensions();
      this.options = this.scoreOptions(extensions.filter((extension) => extension.name.startsWith(query)).map((extension) => new ExtensionsCompletionOption(extension.name, extension.optionsUrl)));
      return this.updateChain();
    }
    updateChain() {
      this.options.forEach((option) => option.state = "normal");
      return this.updateDisplay();
    }
    select(option) {
      this.completion = "extoptions " + option.name;
      option.state = "focused";
      this.lastFocused = option;
    }
    scoreOptions(options) {
      return options.sort((o1, o2) => o1.name.localeCompare(o2.name));
    }
  };

  // src/lib/native.ts
  var import_semver_compare = __toESM(require_semver_compare());
  var logger2 = new logging_default("native");
  var NATIVE_NAME = "tridactyl";
  async function sendNativeMsg(cmd, opts, quiet = false) {
    const send = Object.assign({ cmd }, opts);
    let resp;
    logger2.info(`Sending message: ${JSON.stringify(send)}`);
    try {
      resp = await browserBg.runtime.sendNativeMessage(NATIVE_NAME, send);
      logger2.info(`Received response:`, resp);
      return resp;
    } catch (e) {
      if (!quiet) {
        throw new Error("Failed to send message to native messenger. If it is correctly installed (run `:native`), please report this bug on https://github.com/tridactyl/tridactyl/issues .");
      }
    }
  }
  var NATIVE_VERSION_CACHE;
  async function getNativeMessengerVersion(quiet = false) {
    if (NATIVE_VERSION_CACHE !== void 0) {
      return NATIVE_VERSION_CACHE;
    }
    const res = await sendNativeMsg("version", {}, quiet);
    if (res === void 0) {
      if (quiet)
        return void 0;
      throw new Error(`Error retrieving version: ${res.error}`);
    }
    if (res.version && !res.error) {
      logger2.info(`Native version: ${res.version}`);
      NATIVE_VERSION_CACHE = res.version.toString();
      setTimeout(() => NATIVE_VERSION_CACHE = void 0, 500);
      return NATIVE_VERSION_CACHE;
    }
  }
  async function nativegate(version = "0", interactive = true, desiredOS = ["mac", "win", "linux", "openbsd"]) {
    if (!desiredOS.includes((await browserBg.runtime.getPlatformInfo()).os)) {
      if (interactive) {
        logger2.error("# Tridactyl's native messenger doesn't support your operating system, yet.");
      }
      return false;
    }
    try {
      const actualVersion = await getNativeMessengerVersion();
      if (actualVersion !== void 0) {
        if ((0, import_semver_compare.default)(version, actualVersion) > 0) {
          if (interactive)
            logger2.error("# Please update to native messenger " + version + ", for example by running `:updatenative`.");
          return false;
        }
        return true;
      } else if (interactive)
        logger2.error("# Native messenger not found. Please run `:installnative` and follow the instructions.");
      return false;
    } catch (e) {
      if (interactive)
        logger2.error("# Native messenger not found. Please run `:installnative` and follow the instructions.");
      return false;
    }
  }
  async function read(file) {
    return sendNativeMsg("read", { file }).catch((e) => {
      throw new Error(`Failed to read ${file}. ${e}`);
    });
  }
  async function listDir(dir) {
    return sendNativeMsg("list_dir", { path: dir }).catch((e) => {
      throw new Error(`Failed to read directory '${dir}'. ${e}`);
    });
  }
  async function run(command, content = "") {
    const msg = await sendNativeMsg("run", { command, content });
    logger2.info(msg);
    return msg;
  }
  async function pyeval(command) {
    return sendNativeMsg("eval", { command });
  }
  async function getenv(variable) {
    const required_version = "0.1.2";
    if (!await nativegate(required_version, false)) {
      throw new Error(`'getenv' needs native messenger version >= ${required_version}.`);
    }
    return (await sendNativeMsg("env", { var: variable })).content;
  }
  async function ff_cmdline() {
    let output;
    if ((await browserBg.runtime.getPlatformInfo()).os === "win") {
      if (!await nativegate("0.3.3", false)) {
        const browser_name = await get2("browser");
        output = await run(`powershell -NoProfile -Command "$processes = Get-CimInstance -Property ProcessId,ParentProcessId,Name,CommandLine -ClassName Win32_Process;if (-not ($processes | where { $_.Name -match '^${browser_name}' })) { exit 1; };$ppid = ($processes | where { $_.ProcessId -EQ $PID }).ParentProcessId;$pproc = $processes | where { $_.ProcessId -EQ $ppid };while ($pproc.Name -notmatch '^${browser_name}') {    $ppid = $pproc.ParentProcessId;    $pproc = $processes | where { $_.ProcessId -EQ $ppid };};Write-Output $pproc.CommandLine;"`);
      } else {
        output = await run(`powershell -NoProfile -Command "Get-CimInstance -Property CommandLine,ProcessId -ClassName Win32_Process | where { $_.ProcessId -EQ ${(await sendNativeMsg("ppid", {})).content} } | select -ExpandProperty CommandLine | Write-Output"`);
      }
    } else {
      const actualVersion = await getNativeMessengerVersion();
      if ((0, import_semver_compare.default)("0.2.0", actualVersion) > 0) {
        output = await pyeval('handleMessage({"cmd": "run", "command": "ps -p " + str(os.getppid()) + " -oargs="})["content"]');
      } else {
        const ppid = (await sendNativeMsg("ppid", {})).content.trim();
        output = await run("ps -p " + ppid + " -oargs=");
      }
      output.content = output.content.replace("\n", "");
    }
    return output.content.trim().split(" ");
  }
  async function parseProfilesIni(content, basePath) {
    const lines = content.split("\n");
    let current = "General";
    const result = {};
    for (const line of lines) {
      let match = /^\[([^\]]+)\]$/.exec(line);
      if (match !== null) {
        current = match[1];
        result[current] = {};
      } else {
        match = /^([^=]+)=([^=]+)$/.exec(line);
        if (match !== null) {
          result[current][match[1]] = match[2];
        }
      }
    }
    for (const profileName of Object.keys(result)) {
      const profile = result[profileName];
      if (profile.Path == void 0) {
        delete result[profileName];
        continue;
      }
      if ((await browserBg.runtime.getPlatformInfo()).os === "win") {
        profile.Path = profile.Path.replace("/", "\\");
      }
      if (profile.IsRelative === "1") {
        profile.relativePath = profile.Path;
        profile.absolutePath = basePath + profile.relativePath;
      } else if (profile.IsRelative === "0") {
        if (profile.Path.substring(0, basePath.length) !== basePath) {
          throw new Error(`Error parsing profiles ini: basePath "${basePath}" doesn't match profile path ${profile.Path}`);
        }
        profile.relativePath = profile.Path.substring(basePath.length);
        profile.absolutePath = profile.Path;
      }
    }
    return result;
  }
  async function getFirefoxDir() {
    switch ((await browserBg.runtime.getPlatformInfo()).os) {
      case "win":
        return getenv("APPDATA").then((path) => path + "\\Mozilla\\Firefox\\");
      case "mac":
        return getenv("HOME").then((path) => path + "/Library/Application Support/Firefox/");
      default:
        return getenv("HOME").then((path) => path + "/.mozilla/firefox/");
    }
  }
  async function getProfileUncached() {
    const ffDir = await getFirefoxDir();
    const iniPath = ffDir + "profiles.ini";
    let iniObject = {};
    let iniSucceeded = false;
    const iniContent = await read(iniPath);
    if (iniContent.code === 0 && iniContent.content.length > 0) {
      try {
        iniObject = await parseProfilesIni(iniContent.content, ffDir);
        iniSucceeded = true;
      } catch (e) {
      }
    }
    const curProfileDir = get2("profiledir");
    if (curProfileDir !== "auto") {
      if (iniSucceeded) {
        for (const profileName of Object.keys(iniObject)) {
          const profile2 = iniObject[profileName];
          if (profile2.absolutePath === curProfileDir) {
            return profile2;
          }
        }
      }
      return {
        Name: void 0,
        IsRelative: "0",
        Path: curProfileDir,
        relativePath: void 0,
        absolutePath: curProfileDir
      };
    }
    const cmdline = await ff_cmdline().catch(() => "");
    let profile = cmdline.indexOf("--profile");
    if (profile === -1)
      profile = cmdline.indexOf("-profile");
    if (profile >= 0 && profile < cmdline.length - 1) {
      const profilePath = cmdline[profile + 1];
      if (iniSucceeded) {
        for (const profileName of Object.keys(iniObject)) {
          const profile2 = iniObject[profileName];
          if (profile2.absolutePath === profilePath) {
            return profile2;
          }
        }
      }
      return {
        Name: void 0,
        IsRelative: "0",
        Path: profilePath,
        relativePath: void 0,
        absolutePath: profilePath
      };
    }
    if (iniSucceeded) {
      let p = cmdline.indexOf("-p");
      if (p === -1)
        p = cmdline.indexOf("-P");
      if (p >= 0 && p < cmdline.length - 1) {
        const pName = cmdline[p + 1];
        for (const profileName of Object.keys(iniObject)) {
          const profile2 = iniObject[profileName];
          if (profile2.Name === pName) {
            return profile2;
          }
        }
        throw new Error(`native.ts:getProfile() : '${cmdline[p]}' found in command line arguments but no matching profile name found in "${iniPath}"`);
      }
    }
    let hacky_profile_finder = `find "${ffDir}" -maxdepth 2 -name lock`;
    if ((await browserBg.runtime.getPlatformInfo()).os === "mac")
      hacky_profile_finder = `find "${ffDir}" -maxdepth 2 -name .parentlock`;
    const profilecmd = await run(hacky_profile_finder);
    if (profilecmd.code === 0 && profilecmd.content.length !== 0) {
      profilecmd.content = profilecmd.content.trim();
      if (profilecmd.content.split("\n").length === 1) {
        const path = profilecmd.content.split("/").slice(0, -1).join("/");
        if (iniSucceeded) {
          for (const profileName of Object.keys(iniObject)) {
            const profile2 = iniObject[profileName];
            if (profile2.absolutePath === path) {
              return profile2;
            }
          }
        }
        return {
          Name: void 0,
          IsRelative: "0",
          Path: path,
          relativePath: void 0,
          absolutePath: path
        };
      }
    }
    if (iniSucceeded) {
      for (const profileName of Object.keys(iniObject)) {
        const profile2 = iniObject[profileName];
        if (profile2.Default === 1 || profile2.Default === "1") {
          return profile2;
        }
      }
    }
    throw new Error(`Couldn't deduce which profile you want. See ':help profiledir'`);
  }
  var cachedProfile;
  async function getProfile() {
    if (cachedProfile === void 0)
      cachedProfile = await getProfileUncached();
    return cachedProfile;
  }
  if (getContext() === "background") {
    getProfile();
  }
  addChangeListener("profiledir", () => {
    cachedProfile = void 0;
    getProfile();
  });
  async function getProfileDir() {
    const profiledir = get2("profiledir");
    if (profiledir !== "auto")
      return Promise.resolve(profiledir);
    return getProfile().then((p) => p.absolutePath);
  }
  function parsePrefs(prefFileContent) {
    const regex2 = new RegExp(/^(user_|sticky_|lock)?[pP]ref\("([^"]+)",\s*"?([^\)]+?)"?\);$/);
    return prefFileContent.split("\n").reduce((prefs, line) => {
      const matches = regex2.exec(line);
      if (!matches) {
        return prefs;
      }
      const key = matches[2];
      let value = matches[3];
      if (value === '"')
        value = "";
      prefs[key] = value;
      return prefs;
    }, {});
  }
  async function loadPrefs(filename) {
    const result = await read(filename);
    if (result.code !== 0)
      return {};
    return parsePrefs(result.content);
  }
  var cached_prefs = null;
  async function getPrefs() {
    if (cached_prefs !== null)
      return cached_prefs;
    const profile = await getProfileDir() + "/";
    const prefFiles = [
      "/usr/share/firefox/browser/defaults/preferences/firefox.js",
      "/usr/share/firefox/browser/defaults/preferences/debugger.js",
      "/usr/share/firefox/browser/defaults/preferences/devtools-startup-prefs.js",
      "/usr/share/firefox/browser/defaults/preferences/devtools.js",
      "/usr/share/firefox/browser/defaults/preferences/firefox-branding.js",
      "/usr/share/firefox/browser/defaults/preferences/vendor.js",
      "/usr/share/firefox/browser/defaults/preferences/firefox.js",
      "/etc/firefox/firefox.js",
      profile + "grepref.js",
      profile + "services/common/services-common.js",
      profile + "defaults/pref/services-sync.js",
      profile + "browser/app/profile/channel-prefs.js",
      profile + "browser/app/profile/firefox.js",
      profile + "browser/app/profile/firefox-branding.js",
      profile + "browser/defaults/preferences/firefox-l10n.js",
      profile + "prefs.js",
      profile + "user.js"
    ];
    const promises = [];
    for (const file of prefFiles) {
      promises.push(loadPrefs(file));
    }
    cached_prefs = promises.reduce(async (a, b) => Object.assign(await a, await b));
    return cached_prefs;
  }

  // src/completions/FileSystem.ts
  var FileSystemCompletionOption = class extends CompletionOptionHTML {
    constructor(value) {
      super();
      this.value = value;
      this.fuseKeys = [];
      this.fuseKeys = [value];
      this.html = html`<tr class="FileSystemCompletionOption option">
            <td class="value">${value}</td>
        </tr>`;
    }
  };
  var FileSystemCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super(["saveas", "source", "js -s", "jsb -s"], "FileSystemCompletionSource", "FileSystem");
      this._parent = _parent;
      this._parent.appendChild(this.node);
    }
    async onInput(exstr) {
      return this.filter(exstr);
    }
    async filter(exstr) {
      if (!exstr || exstr.indexOf(" ") === -1) {
        this.state = "hidden";
        return;
      }
      let [cmd, path] = this.splitOnPrefix(exstr);
      if (cmd === void 0) {
        this.state = "hidden";
        return;
      }
      if (!path)
        path = ".";
      if (!["/", "$", "~", "."].find((s) => path.startsWith(s))) {
        path = "./" + path;
      }
      this.lastExstr = cmd + path;
      let req;
      try {
        req = await listDir(path);
      } catch (e) {
        this.state = "hidden";
        return;
      }
      if (req.isDir) {
        if (!path.endsWith(req.sep))
          path += req.sep;
      } else {
        path = path.substring(0, path.lastIndexOf("/") + 1);
      }
      this.options = req.files.map((p) => new FileSystemCompletionOption(path + p));
      this.state = "normal";
      return this.updateChain();
    }
  };

  // src/completions/Goto.ts
  var GotoCompletionOption = class extends CompletionOptionHTML {
    constructor(level, y, title, value) {
      super();
      this.level = level;
      this.y = y;
      this.title = title;
      this.value = value;
      this.fuseKeys = [];
      this.fuseKeys.push(title);
      this.html = html`<tr class="GotoCompletionOption option">
            <td class="title" style="padding-left: ${level * 4}ch">${title}</td>
        </tr>`;
    }
  };
  var GotoCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super(["goto"], "GotoCompletionSource", "Headings");
      this._parent = _parent;
      this.options = [];
      this.shouldSetStateFromScore = true;
      this.updateOptions();
      this.shouldSetStateFromScore = get2("completions", "Goto", "autoselect") === "true";
      this._parent.appendChild(this.node);
    }
    setStateFromScore(scoredOpts) {
      super.setStateFromScore(scoredOpts, this.shouldSetStateFromScore);
    }
    onInput(...whatever) {
      return this.updateOptions(...whatever);
    }
    async updateOptions(exstr = "") {
      this.lastExstr = exstr;
      const [prefix] = this.splitOnPrefix(exstr);
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      if (this.options.length < 1) {
        this.options = (await messageOwnTab("excmd_content", "getGotoSelectors", [])).sort((a, b) => a.y - b.y).map((heading) => {
          const opt = new GotoCompletionOption(heading.level, heading.y, heading.title, heading.selector);
          opt.state = "normal";
          return opt;
        });
      }
      return this.updateChain();
    }
  };

  // src/lib/css_util.ts
  var CSS = __toESM(require_css());
  var potentialRules = {
    statuspanel: {
      name: `#statuspanel`,
      options: {
        none: `display: none !important;`,
        right: `right: 0; display: inline;`,
        left: ``,
        "top-left": `top: 2em; z-index: 2; display: inline;`,
        "top-right": `top: 2em; z-index: 2; right: 0; display: inline;`
      }
    },
    hoverlink: {
      name: `statuspanel[type="overLink"], #statuspanel[type="overLink"]`,
      options: {
        none: `display: none !important;`,
        right: `right: 0; display: inline;`,
        left: ``,
        "top-left": `top: 2em; z-index: 2; display: inline;`,
        "top-right": `top: 2em; z-index: 2; right: 0; display: inline;`
      }
    },
    tabstoolbar: {
      name: `#TabsToolbar`,
      options: {
        none: `visibility: collapse;`,
        show: ``
      }
    },
    tabstoolbarunfocused: {
      name: `:root:not([customizing]) #navigator-toolbox:not(:hover):not(:focus-within) #TabsToolbar`,
      options: {
        hide: `visibility: collapse;`,
        show: ``
      }
    },
    tabcounter: {
      name: `tabs`,
      options: {
        off: ``,
        on: `counter-reset: tab-counter;`
      }
    },
    tabcounters: {
      name: `.tab-label::before`,
      options: {
        hide: ``,
        show: ` counter-increment: tab-counter;
                    content: counter(tab-counter) " - ";`
      }
    },
    navtoolboxunfocused: {
      name: `:root:not([customizing]) #navigator-toolbox:not(:hover):not(:focus-within)`,
      options: {
        hide: `max-height: 1px; min-height: calc(0px); overflow: hidden;`,
        show: ``
      }
    },
    navbarunfocused: {
      name: `:root:not([customizing]) #navigator-toolbox:not(:hover):not(:focus-within) #nav-bar`,
      options: {
        hide: `max-height: 0;
                    min-height: 0!important;
                    --tridactyl-auto-show-zone: 10px;
                    margin-bottom: calc(-1 * var(--tridactyl-auto-show-zone));
                    opacity: 0;`,
        show: ``
      }
    },
    navbarafter: {
      name: `#navigator-toolbox::after`,
      options: {
        hide: `display: none !important;`,
        show: ``
      }
    },
    navbarnonaddonchildren: {
      name: `:root:not([customizing]) #nav-bar > :not(#customizationui-widget-panel)`,
      options: {
        hide: `display: none !important;`,
        show: ``
      }
    },
    navbarnoheight: {
      name: `:root:not([customizing]) #nav-bar`,
      options: {
        hide: ``,
        show: `max-height: 0; min-height: 0 !important;`
      }
    },
    menubar: {
      name: `#navigator-toolbox:not(:hover):not(:focus-within) #toolbar-menubar > *`,
      options: {
        grey: `background-color: rgb(232, 232, 231);`,
        default: ``
      }
    },
    titlebar: {
      name: `#titlebar`,
      options: {
        hide: `display: none !important;`,
        show: ``
      }
    },
    padwhenmaximised: {
      name: `#main-window[sizemode="maximized"] #content-deck`,
      options: {
        some: `padding-top: 8px;`,
        none: ``
      }
    }
  };
  var metaRules = {
    gui: {
      none: {
        hoverlink: "none",
        tabs: "none",
        navbar: "autohide",
        menubar: "grey",
        padwhenmaximised: "some"
      },
      full: {
        hoverlink: "left",
        tabs: "always",
        navbar: "always",
        menubar: "default",
        padwhenmaximised: "none"
      }
    },
    tabs: {
      none: {
        tabstoolbar: "none",
        navtoolboxunfocused: "hide"
      },
      always: {
        tabstoolbar: "show",
        tabstoolbarunfocused: "show",
        navtoolboxunfocused: "show"
      },
      autohide: {
        tabstoolbar: "show",
        tabstoolbarunfocused: "hide",
        navtoolboxunfocused: "hide"
      },
      count: {
        tabcounter: "on",
        tabcounters: "show"
      },
      nocount: {
        tabcounter: "off",
        tabcounters: "hide"
      }
    },
    navbar: {
      autohide: {
        navbarunfocused: "hide",
        navtoolboxunfocused: "hide",
        navbarafter: "hide",
        navbarnonaddonchildren: "show",
        navbarnoheight: "hide"
      },
      always: {
        navbarunfocused: "show",
        navtoolboxunfocused: "show",
        navbarafter: "show",
        navbarnonaddonchildren: "show",
        navbarnoheight: "hide"
      },
      none: {
        navbarunfocused: "show",
        navtoolboxunfocused: "show",
        navbarafter: "hide",
        navbarnonaddonchildren: "hide",
        navbarnoheight: "show"
      }
    }
  };

  // src/completions/Guiset.ts
  var GuisetCompletionOption = class extends CompletionOptionHTML {
    constructor(value, displayValue) {
      super();
      this.value = value;
      this.fuseKeys = [];
      this.fuseKeys.push(value);
      this.html = html`<tr class="GuisetCompletionOption option">
            <td class="value">${displayValue}</td>
        </tr>`;
    }
  };
  var GuisetCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super(["guiset", "guiset_quiet"], "GuisetCompletionSource", "Guiset");
      this._parent = _parent;
      this._parent.appendChild(this.node);
    }
    async filter(exstr) {
      this.lastExstr = exstr;
      const [prefix, query] = this.splitOnPrefix(exstr);
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      this.completion = void 0;
      let ruleName = "";
      let subRule = "";
      if (query) {
        const args = query.trim().split(" ");
        ruleName = args[0] || "";
        subRule = args[1] || "";
      }
      this.options = [];
      if (metaRules[ruleName]) {
        this.options = this.options.concat(Object.keys(metaRules[ruleName]).filter((s) => s.startsWith(subRule)).map((s) => new GuisetCompletionOption(`${ruleName} ${s}`, s)));
      }
      if (potentialRules[ruleName]) {
        this.options = this.options.concat(Object.keys(potentialRules[ruleName].options).filter((s) => s.startsWith(subRule)).map((s) => new GuisetCompletionOption(`${ruleName} ${s}`, s)));
      }
      if (this.options.length === 0) {
        this.options = Object.keys(metaRules).concat(Object.keys(potentialRules)).filter((s) => s.startsWith(ruleName)).map((s) => new GuisetCompletionOption(s, s));
      }
      return this.updateChain();
    }
    updateChain() {
      this.options.forEach((option) => option.state = "normal");
      return this.updateDisplay();
    }
    onInput(arg) {
      return this.filter(arg);
    }
  };

  // src/completions/Help.ts
  var HelpCompletionOption = class extends CompletionOptionHTML {
    constructor(name, doc, flag) {
      super();
      this.name = name;
      this.fuseKeys = [];
      this.value = `${flag} ${name}`;
      this.html = html`<tr class="HelpCompletionOption option">
            <td class="name">${name}</td>
            <td class="doc">${doc}</td>
        </tr>`;
    }
  };
  var HelpCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super(["help"], "HelpCompletionSource", "Help");
      this._parent = _parent;
      this._parent.appendChild(this.node);
    }
    async filter(exstr) {
      this.lastExstr = exstr;
      this.completion = void 0;
      const [prefix, query] = this.splitOnPrefix(exstr);
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      const file = everything.getFile("src/lib/config.ts");
      const default_config2 = file.getClass("default_config");
      const excmds = everything.getFile("src/excmds.ts");
      const fns = excmds.getFunctions();
      const settings = get2();
      const exaliases = settings.exaliases;
      const bindings = settings.nmaps;
      if (fns === void 0 || exaliases === void 0 || bindings === void 0) {
        return;
      }
      const flags = {
        "-a": (options, query2) => options.concat(Object.keys(exaliases).filter((alias) => alias.startsWith(query2)).map((alias) => {
          const cmd = expandExstr(alias);
          const doc = (excmds.getFunction(cmd) || {}).doc || "";
          return new HelpCompletionOption(alias, `Alias for \`${cmd}\`. ${doc}`, "-a");
        })),
        "-b": (options, query2) => options.concat(Object.keys(bindings).filter((binding) => binding.startsWith(query2)).map((binding) => new HelpCompletionOption(binding, `Normal mode binding for \`${bindings[binding]}\``, "-b"))),
        "-e": (options, query2) => options.concat(fns.filter(([name, fn]) => !fn.hidden && name.startsWith(query2)).map(([name, fn]) => new HelpCompletionOption(name, `Excmd. ${fn.doc}`, "-e"))),
        "-s": (options, query2) => options.concat(Object.keys(settings).filter((x) => x.startsWith(query2)).map((setting) => {
          const member = default_config2.getMember(setting);
          let doc = "";
          if (member !== void 0) {
            doc = member.doc;
          }
          return new HelpCompletionOption(setting, `Setting. ${doc}`, "-s");
        }))
      };
      const args = query.split(" ");
      let opts = [];
      if (Object.keys(flags).includes(args[0])) {
        opts = flags[args[0]](opts, args.slice(1).join(" "));
      } else {
        opts = Object.keys(flags).reduce((acc, curFlag) => flags[curFlag](acc, query), []);
      }
      this.options = opts;
      this.options.sort((compopt1, compopt2) => compopt1.name.localeCompare(compopt2.name));
      return this.updateChain();
    }
    updateChain() {
      this.options.forEach((option) => option.state = "normal");
      return this.updateDisplay();
    }
  };

  // src/completions/History.ts
  var HistoryCompletionOption = class extends CompletionOptionHTML {
    constructor(value, page) {
      super();
      this.value = value;
      this.fuseKeys = [];
      if (!page.title) {
        page.title = new URL(page.url).host;
      }
      this.fuseKeys.push(page.title, page.url);
      this.html = html`<tr class="HistoryCompletionOption option">
            <td class="prefix">${"".padEnd(2)}</td>
            <td class="title">${page.title}</td>
            <td class="content">
                <a class="url" target="_blank" href=${page.url}>${page.url}</a>
            </td>
        </tr>`;
    }
  };
  var HistoryCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super(["open", "tabopen", "winopen"], "HistoryCompletionSource", "History and bookmarks");
      this._parent = _parent;
      this._parent.appendChild(this.node);
    }
    async filter(exstr) {
      const prevStr = this.lastExstr;
      this.lastExstr = exstr;
      let [prefix, query] = this.splitOnPrefix(exstr);
      let options = "";
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      if (prefix === "tabopen ") {
        if (query.startsWith("-c")) {
          const args = query.split(" ");
          options = args.slice(0, 2).join(" ");
          query = args.slice(2).join(" ");
        }
        if (query.startsWith("-b")) {
          const args = query.split(" ");
          options = args.slice(0, 1).join(" ");
          query = args.slice(1).join(" ");
        }
      } else if (prefix === "winopen " && query.startsWith("-private")) {
        options = "-private";
        query = query.substring(options.length);
      }
      options += options ? " " : "";
      this.options = (await this.scoreOptions(query, get2("historyresults"))).map((page) => new HistoryCompletionOption(options + page.url, page));
      const lastFocused = this.lastFocused;
      this.deselect();
      this.options.forEach((option) => option.state = "normal");
      for (const option of this.options) {
        if (lastFocused !== void 0 && lastFocused.value === option.value && prevStr.length <= exstr.length) {
          this.select(option);
          break;
        }
      }
      return this.updateDisplay();
    }
    updateChain() {
    }
    async scoreOptions(query, n) {
      if (!query || get2("historyresults") === 0) {
        return (await getTopSites()).slice(0, n);
      } else {
        return (await getCombinedHistoryBmarks(query)).slice(0, n);
      }
    }
  };

  // src/completions/Preferences.ts
  var PreferenceCompletionOption = class extends CompletionOptionHTML {
    constructor(value, prefvalue) {
      super();
      this.value = value;
      this.prefvalue = prefvalue;
      this.fuseKeys = [];
      this.fuseKeys.push(value);
      this.html = html`<tr class="PreferenceCompletionOption option">
            <td class="name">${value}</td>
            <td class="value">${prefvalue}</td>
        </tr>`;
    }
  };
  var PreferenceCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super(["setpref"], "PreferenceCompletionSource", "Preference");
      this._parent = _parent;
      this._parent.appendChild(this.node);
    }
    onInput(exstr) {
      return this.filter(exstr);
    }
    async filter(exstr) {
      if (!exstr) {
        this.state = "hidden";
        return;
      }
      const pref = this.splitOnPrefix(exstr)[1];
      if (pref === void 0) {
        this.state = "hidden";
        return;
      }
      this.lastExstr = exstr;
      const preferences = await getPrefs();
      this.options = Object.keys(preferences).filter((key) => key.startsWith(pref)).map((key) => new PreferenceCompletionOption(key, preferences[key]));
      if (this.options.length > 0)
        this.state = "normal";
      return this.updateChain();
    }
  };

  // src/completions/Rss.ts
  var RssCompletionOption = class extends CompletionOptionHTML {
    constructor(url, title, type3) {
      super();
      this.url = url;
      this.title = title;
      this.type = type3;
      this.fuseKeys = [];
      this.value = `${url} ${type3} ${title}`;
      this.fuseKeys.push(url);
      this.fuseKeys.push(title);
      this.html = html`<tr class="RssCompletionOption option">
            <td class="title">${title}</td>
            <td class="content">
                <a class="url" target="_blank" href=${url}>${url}</a>
            </td>
            <td class="type">${type3}</td>
        </tr>`;
    }
  };
  var RssCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super(["rssexec"], "RssCompletionSource", "Feeds");
      this._parent = _parent;
      this.options = [];
      this.shouldSetStateFromScore = true;
      this.updateOptions();
      this.shouldSetStateFromScore = get2("completions", "Rss", "autoselect") === "true";
      this._parent.appendChild(this.node);
    }
    setStateFromScore(scoredOpts) {
      super.setStateFromScore(scoredOpts, this.shouldSetStateFromScore);
    }
    onInput(...whatever) {
      return this.updateOptions(...whatever);
    }
    async updateOptions(exstr = "") {
      this.lastExstr = exstr;
      const [prefix] = this.splitOnPrefix(exstr);
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      if (this.options.length < 1) {
        this.options = (await messageOwnTab("excmd_content", "getRssLinks", [])).map((link) => {
          const opt = new RssCompletionOption(link.url, link.title, link.type);
          opt.state = "normal";
          return opt;
        });
      }
      return this.updateChain();
    }
  };

  // src/completions/Sessions.ts
  function computeDate(session) {
    let howLong = Math.round((new Date() - session.lastModified) / 1e3);
    let qualifier = "s";
    if (Math.abs(howLong) > 60) {
      qualifier = "m";
      howLong = Math.round(howLong / 60);
      if (Math.abs(howLong) > 60) {
        qualifier = "h";
        howLong = Math.round(howLong / 60);
        if (Math.abs(howLong) > 24) {
          qualifier = "d";
          howLong = Math.round(howLong / 24);
        }
      }
    }
    return [howLong, qualifier];
  }
  function getTabInfo(session) {
    let tab;
    let extraInfo;
    if (session.tab) {
      tab = session.tab;
      extraInfo = tab.url;
    } else {
      tab = session.window.tabs.sort((a, b) => b.lastAccessed - a.lastAccessed)[0];
      const tabCount = session.window.tabs.length;
      if (tabCount < 2) {
        extraInfo = tab.url;
      } else {
        extraInfo = `${tabCount - 1} more tab${tabCount > 2 ? "s" : ""}.`;
      }
    }
    return [tab, extraInfo];
  }
  var SessionCompletionOption = class extends CompletionOptionHTML {
    constructor(session) {
      super();
      this.session = session;
      this.fuseKeys = [];
      this.value = (session.tab || session.window).sessionId;
      const [howLong, qualifier] = computeDate(session);
      const [tab, extraInfo] = getTabInfo(session);
      this.fuseKeys.push(tab.title);
      this.html = html`<tr class="SessionCompletionOption option">
            <td class="type">${session.tab ? "T" : "W"}</td>
            <td class="time">${howLong}${qualifier}</td>
            <td class="icon">
                <img src="${tab.favIconUrl || DEFAULT_FAVICON}" />
            </td>
            <td class="title">${tab.title}</td>
            <td class="extraInfo">${extraInfo}</td>
        </tr>`;
    }
  };
  var SessionsCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super(["undo"], "SessionCompletionSource", "sessions");
      this._parent = _parent;
      this.shouldSetStateFromScore = true;
      this.updateOptions();
      this.shouldSetStateFromScore = get2("completions", "Sessions", "autoselect") === "true";
      this._parent.appendChild(this.node);
    }
    async onInput(exstr) {
      return this.updateOptions(exstr);
    }
    setStateFromScore(scoredOpts) {
      super.setStateFromScore(scoredOpts, this.shouldSetStateFromScore);
    }
    async updateOptions(exstr = "") {
      this.lastExstr = exstr;
      const [prefix] = this.splitOnPrefix(exstr);
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      const sessions = await browserBg.sessions.getRecentlyClosed();
      this.options = sessions.map((s) => new SessionCompletionOption(s));
    }
  };

  // src/completions/Settings.ts
  var SettingsCompletionOption = class extends CompletionOptionHTML {
    constructor(value, setting) {
      super();
      this.value = value;
      this.fuseKeys = [];
      this.html = html`<tr class="SettingsCompletionOption option">
            <td class="title">${setting.name}</td>
            <td class="content">${setting.value}</td>
            <td class="type">${setting.type}</td>
            <td class="doc">${setting.doc}</td>
        </tr>`;
    }
  };
  var SettingsCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super(["set", "get", "unset", "seturl", "unseturl", "viewconfig"], "SettingsCompletionSource", "Settings");
      this._parent = _parent;
      this._parent.appendChild(this.node);
    }
    async filter(exstr) {
      this.lastExstr = exstr;
      let [prefix, query] = this.splitOnPrefix(exstr);
      let options = "";
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      if (prefix === "seturl " || prefix === "unseturl " || prefix === "viewconfig " && (query.startsWith("--user") || query.startsWith("--default"))) {
        const args = query.split(" ");
        options = args.slice(0, 1).join(" ");
        query = args.slice(1).join(" ");
      }
      options += options ? " " : "";
      const file = everything.getFile("src/lib/config.ts");
      const default_config2 = file.getClass("default_config");
      const settings = get2();
      if (default_config2 === void 0 || settings === void 0) {
        return;
      }
      this.options = Object.keys(settings).filter((x) => x.startsWith(query)).sort().map((setting) => {
        const md = default_config2.getMember(setting);
        let doc = "";
        let type3 = "";
        if (md !== void 0) {
          doc = md.doc;
          type3 = md.type.toString();
        }
        return new SettingsCompletionOption(options + setting, {
          name: setting,
          value: JSON.stringify(settings[setting]),
          doc,
          type: type3
        });
      });
      return this.updateChain();
    }
    updateChain() {
      this.options.forEach((option) => option.state = "normal");
      return this.updateDisplay();
    }
  };

  // src/perf.ts
  var logger3 = new Logger("performance");
  function measuredAsync(cls, propertyKey, descriptor) {
    if (!performanceApiAvailable())
      return;
    const originalMethod = descriptor.value;
    descriptor.value = async function(...args) {
      const marker = new Marker(cls.constructor.name, propertyKey).start();
      const result = await originalMethod.apply(this, args);
      marker.end();
      return result;
    };
    return descriptor;
  }
  var Marker = class {
    constructor(ownerName, functionName, active = performanceApiAvailable() && get2("perfcounters") === "true", metricName = new MetricName(ownerName, functionName)) {
      this.active = active;
      this.metricName = metricName;
    }
    start() {
      if (!this.active)
        return this;
      logger3.debug("Marking startpoint of performance counter for %o", this.metricName);
      performance.mark(this.metricName.startName);
      return this;
    }
    end() {
      if (!this.active)
        return this;
      logger3.debug("Marking endpoint of performance counter for %o", this.metricName);
      performance.mark(this.metricName.endName);
      performance.measure(this.metricName.fullName, this.metricName.startName, this.metricName.endName);
      return this;
    }
  };
  function listenForCounters(statsLogger) {
    let callback;
    if (statsLogger === void 0) {
      callback = (list) => {
        sendStats(list.getEntries());
      };
    } else {
      callback = (list) => {
        statsLogger.pushList(list.getEntries());
      };
    }
    const perfObserver = new PerformanceObserver(callback);
    perfObserver.observe({ entryTypes: ["mark", "measure"] });
    return perfObserver;
  }
  var TRI_PERFORMANCE_NAME_PREFIX = "tri";
  function performanceApiAvailable() {
    return performance.mark !== void 0;
  }
  var extractRegExp = new RegExp(`^${TRI_PERFORMANCE_NAME_PREFIX}/([^/]+)/([^:]+):([^:]+)`);
  var MetricName = class {
    constructor(ownerName, functionName) {
      const uniqueSuffix = Math.floor(Math.random() * Math.floor(1e6)).toString();
      this.fullName = `${TRI_PERFORMANCE_NAME_PREFIX}/${ownerName}/${functionName}:${uniqueSuffix}`;
      this.startName = `${this.fullName}:start`;
      this.endName = `${this.fullName}:end`;
    }
  };
  function sendStats(list) {
    message("performance_background", "receiveStatsJson", JSON.stringify(list));
  }

  // src/lib/containers.ts
  var logger4 = new Logger("containers");
  var DefaultContainer = Object.freeze(fromString("default", "invisible", "noicond", "firefox-default"));
  async function getFromId(containerId) {
    try {
      return await browserBg.contextualIdentities.get(containerId);
    } catch (e) {
      return DefaultContainer;
    }
  }
  function fromString(name, color, icon, id2 = "") {
    return {
      name,
      color,
      icon,
      cookieStoreId: id2
    };
  }

  // src/completions/Tab.ts
  var BufferCompletionOption = class extends CompletionOptionHTML {
    constructor(value, tab, isAlternative = false, container) {
      super();
      this.value = value;
      this.isAlternative = isAlternative;
      this.fuseKeys = [];
      this.tabIndex = tab.index;
      this.tabId = tab.id;
      let pre = "";
      if (tab.active)
        pre += "%";
      else if (isAlternative) {
        pre += "#";
        this.value = "#";
      }
      if (tab.pinned)
        pre += "@";
      this.fuseKeys.push(pre);
      this.fuseKeys.push(String(tab.index + 1), tab.title, tab.url);
      const favIconUrl = tab.favIconUrl ? tab.favIconUrl : DEFAULT_FAVICON;
      const indicator = tab.audible ? String.fromCodePoint(128266) : "";
      this.html = html`<tr
            class="BufferCompletionOption option container_${container.color} container_${container.icon} container_${container.name}"
        >
            <td class="prefix">${pre.padEnd(2)}</td>
            <td class="container"></td>
            <td class="icon"><img loading="lazy" src="${favIconUrl}" /></td>
            <td class="title">${tab.index + 1}: ${indicator} ${tab.title}</td>
            <td class="content">
                <a class="url" target="_blank" href=${tab.url}>${tab.url}</a>
            </td>
        </tr>`;
    }
  };
  var BufferCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super([
        "tab",
        "tabclose",
        "tabdetach",
        "tabduplicate",
        "tabmove",
        "tabrename"
      ], "BufferCompletionSource", "Tabs");
      this._parent = _parent;
      this.shouldSetStateFromScore = true;
      this.sortScoredOptions = true;
      this.shouldSetStateFromScore = get2("completions", "Tab", "autoselect") === "true";
      this.updateOptions();
      this._parent.appendChild(this.node);
      addListener("tab_changes", () => this.reactToTabChanges());
    }
    async onInput(exstr) {
      return this.updateOptions(exstr);
    }
    async filter(exstr) {
      this.lastExstr = exstr;
      const prefix = this.splitOnPrefix(exstr).shift();
      if (prefix === "tabrename ")
        this.shouldSetStateFromScore = false;
      return this.onInput(exstr);
    }
    setStateFromScore(scoredOpts) {
      super.setStateFromScore(scoredOpts, this.shouldSetStateFromScore);
    }
    scoredOptions(query, options = this.options) {
      const args = query.trim().split(/\s+/gu);
      if (args.length === 1) {
        if (Number.isInteger(Number(args[0]))) {
          let index = Number(args[0]) - 1;
          if (Math.abs(index) < options.length) {
            index = index.mod(options.length);
            return this.TabscoredOptionsStartsWithN(index, options);
          }
        } else if (args[0] === "#") {
          for (const [index, option] of enumerate(options)) {
            if (option.isAlternative) {
              return [
                {
                  index,
                  option,
                  score: 0
                }
              ];
            }
          }
        }
      }
      return super.scoredOptions(query);
    }
    TabscoredOptionsStartsWithN(n, options) {
      const nstr = (n + 1).toString();
      const res = [];
      for (const [index, option] of enumerate(options)) {
        if ((option.tabIndex + 1).toString().startsWith(nstr)) {
          res.push({
            index,
            option,
            score: 0
          });
        }
      }
      res.sort((a, b) => a.option.tabIndex - b.option.tabIndex);
      return res;
    }
    async fillOptions() {
      const tabs = await browserBg.tabs.query({
        currentWindow: true
      });
      const options = [];
      tabs.sort((a, b) => b.lastAccessed - a.lastAccessed);
      const alt = tabs[1];
      const useMruTabOrder = get2("tabsort") === "mru";
      if (!useMruTabOrder) {
        tabs.sort((a, b) => a.index - b.index);
      }
      const container_all = await browserBg.contextualIdentities.query({});
      const container_map = /* @__PURE__ */ new Map();
      container_all.forEach((elem) => container_map.set(elem.cookieStoreId, elem));
      container_map.set("firefox-default", DefaultContainer);
      for (const tab of tabs) {
        let tab_container = container_map.get(tab.cookieStoreId);
        if (!tab_container) {
          tab_container = DefaultContainer;
        }
        options.push(new BufferCompletionOption((tab.index + 1).toString(), tab, tab === alt, tab_container));
      }
      this.options = options;
    }
    async updateOptions(exstr = "") {
      this.lastExstr = exstr;
      const [prefix, query] = this.splitOnPrefix(exstr);
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      if (prefix === "tabmove")
        this.shouldSetStateFromScore = !/^[+-][0-9]+$/.exec(query);
      await this.fillOptions();
      this.completion = void 0;
      if (query && query.trim().length > 0) {
        this.setStateFromScore(this.scoredOptions(query));
      } else {
        this.options.forEach((option) => option.state = "normal");
      }
      return this.updateDisplay();
    }
    async reactToTabChanges() {
      const prevOptions = this.options;
      await this.updateOptions(this.lastExstr);
      if (!prevOptions || !this.options || !this.lastFocused)
        return;
      const diff = [];
      for (const prevOption of prevOptions) {
        if (!this.options.find((newOption) => prevOption.tabId === newOption.tabId))
          diff.push(prevOption);
      }
      const lastFocusedTabCompletion = this.lastFocused;
      if (diff.length === 1 && diff[0].tabId === lastFocusedTabCompletion.tabId) {
        this.select(this.getTheNextTabOption(lastFocusedTabCompletion));
      }
    }
    getTheNextTabOption(option) {
      if (option.tabIndex === this.options.length) {
        return this.options[this.options.length - 1];
      }
      return this.options[option.tabIndex];
    }
  };
  __decorateClass([
    measuredAsync
  ], BufferCompletionSource.prototype, "updateOptions", 1);

  // src/completions/TabAll.ts
  var TabAllCompletionOption = class extends CompletionOptionHTML {
    constructor(value, tab, winindex, container, incognito) {
      super();
      this.value = value;
      this.fuseKeys = [];
      this.value = `${winindex}.${tab.index + 1}`;
      this.fuseKeys.push(this.value, tab.title, tab.url);
      this.tab = tab;
      const favIconUrl = tab.favIconUrl ? tab.favIconUrl : DEFAULT_FAVICON;
      this.html = html`<tr
            class="BufferAllCompletionOption option container_${container.color} container_${container.icon} container_${container.name} ${incognito ? "incognito" : ""}"
        >
            <td class="prefix"></td>
            <td class="privatewindow"></td>
            <td class="container"></td>
            <td class="icon"><img src="${favIconUrl}" /></td>
            <td class="title">${this.value}: ${tab.title}</td>
            <td class="content">
                <a class="url" target="_blank" href=${tab.url}>${tab.url}</a>
            </td>
        </tr>`;
    }
  };
  var TabAllCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super(["taball", "tabgrab"], "TabAllCompletionSource", "All Tabs");
      this._parent = _parent;
      this.shouldSetStateFromScore = true;
      this.updateOptions();
      this._parent.appendChild(this.node);
      this.shouldSetStateFromScore = get2("completions", "TabAll", "autoselect") === "true";
      addListener("tab_changes", () => this.reactToTabChanges());
    }
    async onInput(exstr) {
      return this.updateOptions(exstr);
    }
    setStateFromScore(scoredOpts) {
      super.setStateFromScore(scoredOpts, this.shouldSetStateFromScore);
    }
    async getWindows() {
      const windows = await browserBg.windows.getAll();
      const response = {};
      windows.forEach((win) => response[win.id] = win);
      return response;
    }
    async reactToTabChanges() {
      await this.updateOptions(this.lastExstr);
    }
    async updateOptions(exstr = "") {
      this.lastExstr = exstr;
      const [prefix] = this.splitOnPrefix(exstr);
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      const tabsPromise = browserBg.tabs.query({});
      const windowsPromise = this.getWindows();
      const [tabs, windows] = await Promise.all([tabsPromise, windowsPromise]);
      const options = [];
      tabs.sort((a, b) => {
        if (a.windowId === b.windowId)
          return a.index - b.index;
        return a.windowId - b.windowId;
      });
      const excludeCurrentWindow = ["tabgrab"].includes(prefix.trim());
      const currentWindow = await browserBg.windows.getCurrent();
      let lastId = 0;
      let winindex = 0;
      for (const tab of tabs) {
        if (lastId !== tab.windowId) {
          lastId = tab.windowId;
          winindex += 1;
        }
        if (excludeCurrentWindow && tab.windowId === currentWindow.id)
          continue;
        options.push(new TabAllCompletionOption(tab.id.toString(), tab, winindex, await getFromId(tab.cookieStoreId), windows[tab.windowId].incognito));
      }
      this.completion = void 0;
      this.options = options;
      return this.updateChain();
    }
  };
  __decorateClass([
    measuredAsync
  ], TabAllCompletionSource.prototype, "updateOptions", 1);

  // src/completions/Theme.ts
  var ThemeCompletionOption = class extends CompletionOptionHTML {
    constructor(value, documentation = "") {
      super();
      this.value = value;
      this.documentation = documentation;
      this.fuseKeys = [];
      this.fuseKeys.push(this.value);
      this.html = html`<tr class="ThemeCompletionOption option">
            <td class="theme">${value}</td>
        </tr>`;
    }
  };
  var ThemeCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super(["set theme", "colourscheme"], "ThemeCompletionSource", "Themes");
      this._parent = _parent;
      this.updateOptions();
      this._parent.appendChild(this.node);
    }
    async filter(exstr) {
      this.lastExstr = exstr;
      return this.onInput(exstr);
    }
    async onInput(exstr) {
      return this.updateOptions(exstr);
    }
    setStateFromScore(scoredOpts) {
      super.setStateFromScore(scoredOpts, false);
    }
    async updateOptions(exstr = "") {
      this.lastExstr = exstr;
      const themes = staticThemes.concat(Object.keys(await get2("customthemes")));
      const [prefix, query] = this.splitOnPrefix(exstr);
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      this.options = this.scoreOptions(themes.filter((name) => name.startsWith(query)).map((name) => new ThemeCompletionOption(name)));
      this.options.forEach((o2) => o2.state = "normal");
      return this.updateChain();
    }
    scoreOptions(options) {
      return options.sort((o1, o2) => o1.value.localeCompare(o2.value));
    }
  };

  // src/completions/Window.ts
  var WindowCompletionOption = class extends CompletionOptionHTML {
    constructor(win) {
      super();
      this.fuseKeys = [];
      this.value = win.id;
      this.fuseKeys.push(`${win.title}`);
      this.fuseKeys.push(`${win.id}`);
      this.html = html`<tr
            class="WindowCompletionOption option ${win.incognito ? "incognito" : ""}"
        >
            <td class="privatewindow"></td>
            <td class="prefix">${win.focused ? "%" : ""}</td>
            <td class="id">${win.id}</td>
            <td class="title">${win.title}</td>
            <td class="tabcount">
                ${win.tabs.length} tab${win.tabs.length !== 1 ? "s" : ""}
            </td>
        </tr>`;
    }
  };
  var WindowCompletionSource = class extends CompletionSourceFuse {
    constructor(_parent) {
      super(["tabpush", "winclose", "winmerge"], "WindowCompletionSource", "Windows");
      this._parent = _parent;
      this.updateOptions();
      this._parent.appendChild(this.node);
    }
    async onInput(exstr) {
      return this.updateOptions(exstr);
    }
    async filter(exstr) {
      this.lastExstr = exstr;
      return this.onInput(exstr);
    }
    async updateOptions(exstr = "") {
      this.lastExstr = exstr;
      const [prefix] = this.splitOnPrefix(exstr);
      if (prefix) {
        if (this.state === "hidden") {
          this.state = "normal";
        }
      } else {
        this.state = "hidden";
        return;
      }
      const excludeCurrentWindow = ["tabpush"].includes(prefix.trim());
      this.options = (await browserBg.windows.getAll({ populate: true })).filter((win) => !(excludeCurrentWindow && win.focused)).map((win) => {
        const o2 = new WindowCompletionOption(win);
        o2.state = "normal";
        return o2;
      });
      return this.updateDisplay();
    }
  };

  // src/content/state_content.ts
  var logger5 = new logging_default("state");
  var onChangedListeners = [];
  var contentState = new Proxy({ mode: "normal" }, {
    get(target, property) {
      return target[property];
    },
    set(target, property, newValue) {
      logger5.debug("Content state changed!", property, newValue);
      const oldValue = target[property];
      const mode = target.mode;
      target[property] = newValue;
      for (const listener of onChangedListeners) {
        listener(property, mode, oldValue, newValue);
      }
      return true;
    }
  });

  // src/content/styling.ts
  var logger6 = new Logger("styling");
  var THEMES = staticThemes;
  function capitalise(str) {
    if (str === "")
      return str;
    return str[0].toUpperCase() + str.slice(1);
  }
  function prefixTheme(name) {
    return "TridactylTheme" + capitalise(name);
  }
  var THEMED_ELEMENTS = [];
  var insertedCSS = false;
  var customCss = {
    allFrames: true,
    matchAboutBlank: true,
    code: ""
  };
  async function theme(element) {
    for (const theme2 of THEMES.map(prefixTheme)) {
      element.classList.remove(theme2);
    }
    if (insertedCSS) {
      await browserBg.tabs.removeCSS(await ownTabId(), customCss);
      insertedCSS = false;
    }
    const newTheme = await getAsync("theme");
    if (newTheme !== "default") {
      element.classList.add(prefixTheme(newTheme));
    }
    if (newTheme !== "default") {
      customCss.code = THEMES.includes(newTheme) ? "@import url('" + browser.runtime.getURL("static/themes/" + newTheme + "/" + newTheme + ".css") + "');" : await getAsync("customthemes", newTheme);
      if (customCss.code) {
        await browserBg.tabs.insertCSS(await ownTabId(), customCss);
        insertedCSS = true;
      } else {
        logger6.error("Theme " + newTheme + " couldn't be found.");
      }
    }
    if (THEMED_ELEMENTS.length < 2 && element.tagName.toUpperCase() === "HTML") {
      THEMED_ELEMENTS.push(element);
    }
  }
  function retheme() {
    THEMED_ELEMENTS.forEach((element) => {
      theme(element).catch((e) => {
        logger6.warning(`Failed to retheme element "${element}". Error: ${e}`);
      });
    });
  }
  addChangeListener("theme", retheme);
  var cb = async (mutationList) => {
    const theme2 = await getAsync("theme");
    mutationList.filter((m) => m.target.className.search(prefixTheme("")) === -1).forEach((m) => m.target.classList.add(prefixTheme(theme2)));
  };
  new MutationObserver(cb).observe(document.documentElement, {
    attributes: true,
    childList: false,
    characterData: false,
    subtree: false,
    attributeOldValue: false,
    attributeFilter: ["class"]
  });

  // src/state.ts
  var logger7 = new logging_default("state");
  var State = class {
    constructor() {
      this.lastSearchQuery = void 0;
      this.cmdHistory = [];
      this.prevInputs = [
        {
          inputId: void 0,
          tab: void 0,
          jumppos: void 0
        }
      ];
      this.last_ex_str = "echo";
    }
  };
  var PERSISTENT_KEYS = ["cmdHistory"];
  var defaults = Object.freeze(new State());
  var overlay = {};
  browser.storage.local.get("state").then((res) => {
    if ("state" in res) {
      logger7.debug("Loaded initial state:", res.state);
      Object.assign(overlay, res.state);
    }
  }).catch((...args) => logger7.error(...args));
  var state = new Proxy(overlay, {
    get(target, property) {
      if (notBackground())
        throw new Error("State object must be accessed with getAsync in content");
      if (property in target) {
        return target[property];
      } else {
        return defaults[property];
      }
    },
    set(target, property, value) {
      logger7.debug("State changed!", property, value);
      if (notBackground()) {
        browser.runtime.sendMessage({
          type: "state",
          command: "stateUpdate",
          args: { property, value }
        });
        return true;
      }
      target[property] = value;
      if (PERSISTENT_KEYS.includes(property)) {
        if (browser.extension.inIncognitoContext) {
          console.error("Attempted to write to storage in private window.");
          return false;
        }
        browser.storage.local.set({
          state: pick_default(PERSISTENT_KEYS, target)
        });
      }
      return true;
    }
  });
  async function getAsync2(property) {
    if (notBackground())
      return browser.runtime.sendMessage({
        type: "state",
        command: "stateGet",
        args: [{ prop: property }]
      });
    else
      return state[property];
  }
  notBackground && !notBackground() && addListener("state", (message2, sender, sendResponse) => {
    if (message2.command == "stateUpdate") {
      const property = message2.args.property;
      const value = message2.args.value;
      logger7.debug("State changed!", property, value);
      state[property] = value;
    } else if (message2.command == "stateGet") {
      sendResponse(state[message2.args[0].prop]);
    } else
      throw new Error("Unsupported message to state, type " + message2.command);
  });

  // src/lib/commandline_cmds.ts
  var sleep2 = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  async function awaitProxyEq(proxy, a, b) {
    let counter = 0;
    while (proxy[a] != proxy[b] && counter < 50) {
      await sleep2(10);
      counter += 1;
    }
    return proxy[a] == proxy[b];
  }
  function getCommandlineFns(cmdline_state) {
    return {
      complete: async () => {
        const fragment = cmdline_state.clInput.value;
        const matches = (await getAsync2("cmdHistory")).filter((key) => key.startsWith(fragment));
        const mostrecent = matches[matches.length - 1];
        if (mostrecent !== void 0)
          cmdline_state.clInput.value = mostrecent;
        return cmdline_state.refresh_completions(cmdline_state.clInput.value);
      },
      next_completion: async () => {
        await awaitProxyEq(contentState, "current_cmdline", "cmdline_filter");
        if (cmdline_state.activeCompletions)
          cmdline_state.activeCompletions.forEach((comp) => comp.next());
      },
      prev_completion: async () => {
        await awaitProxyEq(contentState, "current_cmdline", "cmdline_filter");
        if (cmdline_state.activeCompletions)
          cmdline_state.activeCompletions.forEach((comp) => comp.prev());
      },
      deselect_completion: () => {
        if (cmdline_state.activeCompletions)
          cmdline_state.activeCompletions.forEach((comp) => comp.deselect());
      },
      insert_completion: async () => {
        await awaitProxyEq(contentState, "current_cmdline", "cmdline_filter");
        const command = cmdline_state.getCompletion();
        if (cmdline_state.activeCompletions) {
          cmdline_state.activeCompletions.forEach((comp) => comp.completion = void 0);
        }
        let result = Promise.resolve([]);
        if (command) {
          cmdline_state.clInput.value = command + " ";
          result = cmdline_state.refresh_completions(cmdline_state.clInput.value);
        }
        return result;
      },
      insert_space_or_completion: () => {
        const command = cmdline_state.getCompletion();
        if (cmdline_state.activeCompletions) {
          cmdline_state.activeCompletions.forEach((comp) => comp.completion = void 0);
        }
        if (command) {
          cmdline_state.clInput.value = command + " ";
        } else {
          const selectionStart = cmdline_state.clInput.selectionStart;
          const selectionEnd = cmdline_state.clInput.selectionEnd;
          cmdline_state.clInput.value = cmdline_state.clInput.value.substring(0, selectionStart) + " " + cmdline_state.clInput.value.substring(selectionEnd);
          cmdline_state.clInput.selectionStart = cmdline_state.clInput.selectionEnd = selectionStart + 1;
        }
        return cmdline_state.refresh_completions(cmdline_state.clInput.value);
      },
      hide_and_clear: () => {
        cmdline_state.clear(true);
        cmdline_state.keyEvents = [];
        messageOwnTab("commandline_content", "hide");
        messageOwnTab("commandline_content", "blur");
        if (cmdline_state.activeCompletions)
          cmdline_state.activeCompletions.forEach((comp) => cmdline_state.completionsDiv.removeChild(comp.node));
        cmdline_state.activeCompletions = void 0;
        cmdline_state.isVisible = false;
      },
      is_valid_commandline: (command) => {
        if (command === void 0)
          return false;
        const func = command.trim().split(/\s+/)[0];
        if (func.length === 0 || func.startsWith("#")) {
          return false;
        }
        return true;
      },
      store_ex_string: (command) => {
        const [func, ...args] = command.trim().split(/\s+/);
        if (!browser.extension.inIncognitoContext && !(func === "winopen" && args[0] === "-private")) {
          getAsync2("cmdHistory").then((c) => {
            cmdline_state.state.cmdHistory = c.concat([command]);
          });
          cmdline_state.cmdline_history_position = 0;
        }
      },
      next_history: () => cmdline_state.history(1),
      prev_history: () => cmdline_state.history(-1),
      accept_line: async () => {
        await awaitProxyEq(contentState, "current_cmdline", "cmdline_filter");
        const command = cmdline_state.getCompletion() || cmdline_state.clInput.value;
        cmdline_state.fns.hide_and_clear();
        if (cmdline_state.fns.is_valid_commandline(command) === false)
          return;
        cmdline_state.fns.store_ex_string(command);
        return messageOwnTab("controller_content", "acceptExCmd", [command]);
      },
      execute_ex_on_completion_args: (excmd) => execute_ex_on_x(true, cmdline_state, excmd),
      execute_ex_on_completion: (excmd) => execute_ex_on_x(false, cmdline_state, excmd),
      copy_completion: () => {
        const command = cmdline_state.getCompletion();
        cmdline_state.fns.hide_and_clear();
        return messageOwnTab("controller_content", "acceptExCmd", [
          "clipboard yank " + command
        ]);
      }
    };
  }
  function execute_ex_on_x(args_only, cmdline_state, excmd) {
    const args = cmdline_state.getCompletion(args_only) || cmdline_state.clInput.value;
    const cmdToExec = (excmd ? excmd + " " : "") + args;
    cmdline_state.fns.store_ex_string(cmdToExec);
    return messageOwnTab("controller_content", "acceptExCmd", [cmdToExec]);
  }

  // src/lib/editor.ts
  var editor_exports = {};
  __export(editor_exports, {
    backward_char: () => backward_char,
    backward_kill_line: () => backward_kill_line,
    backward_kill_word: () => backward_kill_word,
    backward_word: () => backward_word,
    beginning_of_line: () => beginning_of_line,
    capitalize_word: () => capitalize_word,
    delete_backward_char: () => delete_backward_char,
    delete_char: () => delete_char,
    downcase_word: () => downcase_word,
    end_of_line: () => end_of_line,
    forward_char: () => forward_char,
    forward_word: () => forward_word,
    insert_text: () => insert_text,
    jumble: () => jumble,
    kill_line: () => kill_line,
    kill_whole_line: () => kill_whole_line,
    kill_word: () => kill_word,
    rot13: () => rot13,
    tab_insert: () => tab_insert,
    transpose_chars: () => transpose_chars,
    transpose_words: () => transpose_words,
    upcase_word: () => upcase_word
  });

  // src/lib/editor_utils.ts
  function applyToElem(e, fn) {
    let result;
    if (e instanceof HTMLInputElement && e.type !== "text") {
      const t = e.type;
      e.type = "text";
      result = fn(e);
      e.type = t;
    } else {
      result = fn(e);
    }
    return result;
  }
  function getSimpleValues(e) {
    return applyToElem(e, (e2) => [e2.value, e2.selectionStart, e2.selectionEnd]);
  }
  function getContentEditableValues(e) {
    const selection = e.ownerDocument.getSelection();
    let n = selection.anchorNode;
    while (n && n !== e)
      n = n.parentNode;
    if (!n)
      return [null, null, null];
    const r = selection.getRangeAt(0).cloneRange();
    const selectionLength = r.toString().length;
    r.setEnd(e, e.childNodes.length);
    const lengthFromCaretToEndOfText = r.toString().length;
    r.setStart(e, 0);
    const s = r.toString();
    const caretPos = s.length - lengthFromCaretToEndOfText;
    return [s, caretPos, caretPos + selectionLength];
  }
  function setSimpleValues(e, text, start, end) {
    return applyToElem(e, (e2) => {
      if (text !== null)
        e2.value = text;
      if (start !== null) {
        if (end === null)
          end = start;
        e2.selectionStart = start;
        e2.selectionEnd = end;
      }
    });
  }
  function setContentEditableValues(e, text, start, end) {
    const selection = e.ownerDocument.getSelection();
    if (selection.rangeCount < 1) {
      const r = new Range();
      r.setStart(e, 0);
      r.setEnd(e, e.childNodes.length);
      selection.addRange(r);
    }
    if (text !== null) {
      const range = selection.getRangeAt(0);
      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;
      range.setStart(anchorNode, 0);
      range.setEndAfter(focusNode, focusNode.length);
      e.ownerDocument.execCommand("insertText", false, text);
    }
    if (start !== null) {
      if (end === null)
        end = start;
      let range = selection.getRangeAt(0);
      range.setStart(range.startContainer, start);
      range = selection.getRangeAt(0);
      range.setEnd(range.startContainer, end);
    }
  }
  function wrap_input(fn) {
    return (e, arg) => {
      let getValues = getSimpleValues;
      let setValues = setSimpleValues;
      if (e.isContentEditable) {
        getValues = getContentEditableValues;
        setValues = setContentEditableValues;
      }
      const [origText, origStart, origEnd] = getValues(e);
      if (origText === null || origStart === null)
        return false;
      setValues(e, ...fn(origText, origStart, origEnd, arg));
      return true;
    };
  }
  function needs_text(fn, arg) {
    return (text, selectionStart, selectionEnd, arg2) => {
      if (text.length === 0 || selectionStart === null || selectionStart === void 0)
        return [null, null, null];
      return fn(text, selectionStart, typeof selectionEnd === "number" ? selectionEnd : selectionStart, arg2);
    };
  }
  function getWordBoundaries(text, position, before) {
    if (position < 0 || position > text.length)
      throw new Error(`getWordBoundaries: position (${position}) should be within text ("${text}") boundaries (0, ${text.length})`);
    const pattern = new RegExp(get2("wordpattern"), "g");
    let boundary1 = position < text.length ? position : text.length;
    const direction = before ? -1 : 1;
    if (before && boundary1 > 0)
      boundary1 -= 1;
    while (boundary1 >= 0 && boundary1 < text.length && !text[boundary1].match(pattern)) {
      boundary1 += direction;
    }
    if (boundary1 < 0)
      boundary1 = 0;
    else if (boundary1 >= text.length)
      boundary1 = text.length - 1;
    while (boundary1 >= 0 && boundary1 < text.length && !text[boundary1].match(pattern)) {
      boundary1 -= direction;
    }
    if (boundary1 < 0)
      boundary1 = 0;
    else if (boundary1 >= text.length)
      boundary1 = text.length - 1;
    if (!text[boundary1].match(pattern)) {
      throw new Error(`getWordBoundaries: no characters matching wordpattern (${pattern.source}) in text (${text})`);
    }
    while (boundary1 >= 0 && boundary1 < text.length && !!text[boundary1].match(pattern)) {
      boundary1 += direction;
    }
    boundary1 -= direction;
    let boundary2 = boundary1;
    while (boundary2 >= 0 && boundary2 < text.length && !!text[boundary2].match(pattern)) {
      boundary2 -= direction;
    }
    boundary2 += direction;
    if (boundary1 > boundary2)
      return [boundary2, boundary1 + 1];
    return [boundary1, boundary2 + 1];
  }
  function wordAfterPos(text, position) {
    if (position < 0)
      throw new Error(`wordAfterPos: position (${position}) is less that 0`);
    const pattern = new RegExp(get2("wordpattern"), "g");
    while (position < text.length && !!text[position].match(pattern))
      position += 1;
    while (position < text.length && !text[position].match(pattern))
      position += 1;
    if (position >= text.length)
      return -1;
    return position;
  }
  var rot13_helper = (s, n = 13) => {
    let sa = s.split("");
    sa = sa.map((x) => charesar(x, n));
    return sa.join("");
  };
  var charesar = (c, n = 13) => {
    const cn = c.charCodeAt(0);
    if (cn >= 65 && cn <= 90)
      return String.fromCharCode((cn - 65 + n) % 26 + 65);
    if (cn >= 97 && cn <= 122)
      return String.fromCharCode((cn - 97 + n) % 26 + 97);
    return c;
  };
  var jumble_helper = (text) => {
    const wordSplitRegex = new RegExp("([^a-zA-Z]|[A-Z][a-z]+)");
    return text.split(wordSplitRegex).map(jumbleWord).join("");
  };
  function jumbleWord(word) {
    if (word.length < 4 || isAcronym()) {
      return word;
    }
    const innerText = word.slice(1, -1);
    return word.charAt(0) + shuffle(innerText) + word.charAt(word.length - 1);
    function isAcronym() {
      return word.length < 5 && word.toUpperCase() === word;
    }
  }
  var shuffle = (text) => {
    const arr = text.split("");
    for (let i = arr.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * i + 1);
      const t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr.join("");
  };

  // src/lib/editor.ts
  var delete_char = wrap_input(needs_text((text, selectionStart, selectionEnd) => {
    if (selectionStart !== selectionEnd) {
      text = text.substring(0, selectionStart) + text.substring(selectionEnd);
    } else {
      text = text.substring(0, selectionStart) + text.substring(selectionStart + 1);
    }
    return [text, selectionStart, null];
  }));
  var delete_backward_char = wrap_input(needs_text((text, selectionStart, selectionEnd) => {
    if (selectionStart !== selectionEnd) {
      text = text.substring(0, selectionStart) + text.substring(selectionEnd);
    } else {
      text = text.substring(0, selectionStart - 1) + text.substring(selectionStart);
    }
    selectionStart -= 1;
    return [text, selectionStart, null];
  }));
  var tab_insert = wrap_input((text, selectionStart, selectionEnd) => {
    if (selectionStart !== selectionEnd) {
      text = text.substring(0, selectionStart) + "	" + text.substring(selectionEnd);
    } else {
      text = text.substring(0, selectionStart) + "	" + text.substring(selectionStart);
    }
    selectionStart += 1;
    return [text, selectionStart, null];
  });
  var transpose_chars = wrap_input((text, selectionStart) => {
    if (text.length < 2)
      return [null, null, null];
    if (selectionStart === 0)
      selectionStart = 1;
    if (selectionStart >= text.length)
      selectionStart = text.length - 1;
    text = text.substring(0, selectionStart - 1) + text.substring(selectionStart, selectionStart + 1) + text.substring(selectionStart - 1, selectionStart) + text.substring(selectionStart + 1);
    selectionStart += 1;
    return [text, selectionStart, null];
  });
  function applyWord(text, selectionStart, selectionEnd, fn) {
    if (text.length === 0)
      return [null, null, null];
    if (selectionStart >= text.length) {
      selectionStart = text.length - 1;
    }
    const boundaries = getWordBoundaries(text, selectionStart, false);
    const beginning = text.substring(0, boundaries[0]) + fn(text.substring(boundaries[0], boundaries[1]));
    text = beginning + text.substring(boundaries[1]);
    selectionStart = beginning.length + 1;
    return [text, selectionStart, null];
  }
  var transpose_words = wrap_input(needs_text((text, selectionStart) => {
    if (selectionStart >= text.length) {
      selectionStart = text.length - 1;
    }
    let firstBoundaries = getWordBoundaries(text, selectionStart, false);
    let secondBoundaries = firstBoundaries;
    const nextWord = wordAfterPos(text, firstBoundaries[1]);
    if (nextWord > -1) {
      secondBoundaries = getWordBoundaries(text, nextWord, false);
    } else {
      firstBoundaries = getWordBoundaries(text, firstBoundaries[0] - 1, true);
    }
    const firstWord = text.substring(firstBoundaries[0], firstBoundaries[1]);
    const secondWord = text.substring(secondBoundaries[0], secondBoundaries[1]);
    const beginning = text.substring(0, firstBoundaries[0]) + secondWord + text.substring(firstBoundaries[1], secondBoundaries[0]);
    selectionStart = beginning.length;
    return [
      beginning + firstWord + text.substring(secondBoundaries[1]),
      selectionStart,
      null
    ];
  }));
  var upcase_word = wrap_input(needs_text((text, selectionStart, selectionEnd) => applyWord(text, selectionStart, selectionEnd, (word) => word.toUpperCase())));
  var downcase_word = wrap_input(needs_text((text, selectionStart, selectionEnd) => applyWord(text, selectionStart, selectionEnd, (word) => word.toLowerCase())));
  var capitalize_word = wrap_input(needs_text((text, selectionStart, selectionEnd) => applyWord(text, selectionStart, selectionEnd, (word) => word[0].toUpperCase() + word.substring(1))));
  var kill_line = wrap_input(needs_text((text, selectionStart) => {
    let newLine = text.substring(selectionStart).search("\n");
    if (newLine !== -1) {
      if (newLine === 0)
        newLine = 1;
      text = text.substring(0, selectionStart) + text.substring(selectionStart + newLine);
    } else {
      text = text.substring(0, selectionStart);
    }
    return [text, selectionStart, null];
  }));
  var backward_kill_line = wrap_input(needs_text((text, selectionStart) => {
    if (selectionStart > 0 && text[selectionStart - 1] === "\n") {
      return [
        text.substring(0, selectionStart - 1) + text.substring(selectionStart),
        selectionStart,
        null
      ];
    }
    let newLine;
    for (newLine = selectionStart; newLine > 0 && text[newLine - 1] !== "\n"; --newLine)
      ;
    return [
      text.substring(0, newLine) + text.substring(selectionStart),
      newLine,
      null
    ];
  }));
  var kill_whole_line = wrap_input(needs_text((text, selectionStart) => {
    let firstNewLine;
    let secondNewLine;
    for (firstNewLine = selectionStart; firstNewLine > 0 && text[firstNewLine - 1] !== "\n"; --firstNewLine)
      ;
    for (secondNewLine = selectionStart; secondNewLine < text.length && text[secondNewLine - 1] !== "\n"; ++secondNewLine)
      ;
    return [
      text.substring(0, firstNewLine) + text.substring(secondNewLine),
      firstNewLine,
      null
    ];
  }));
  var kill_word = wrap_input(needs_text((text, selectionStart) => {
    const boundaries = getWordBoundaries(text, selectionStart, false);
    if (selectionStart < boundaries[1]) {
      boundaries[0] = selectionStart;
      return [
        text.substring(0, boundaries[0]) + text.substring(boundaries[1]),
        boundaries[0],
        null
      ];
    } else {
      return [null, selectionStart, null];
    }
  }));
  var backward_kill_word = wrap_input(needs_text((text, selectionStart) => {
    const boundaries = getWordBoundaries(text, selectionStart, true);
    if (selectionStart > boundaries[0]) {
      boundaries[1] = selectionStart;
      return [
        text.substring(0, boundaries[0]) + text.substring(boundaries[1]),
        boundaries[0],
        null
      ];
    } else {
      return [null, selectionStart, null];
    }
  }));
  var beginning_of_line = wrap_input(needs_text((text, selectionStart) => {
    while (text[selectionStart - 1] !== void 0 && text[selectionStart - 1] !== "\n")
      selectionStart -= 1;
    return [null, selectionStart, null];
  }));
  var end_of_line = wrap_input(needs_text((text, selectionStart) => {
    while (text[selectionStart] !== void 0 && text[selectionStart] !== "\n")
      selectionStart += 1;
    return [null, selectionStart, null];
  }));
  var forward_char = wrap_input((text, selectionStart) => [
    null,
    selectionStart + 1,
    null
  ]);
  var backward_char = wrap_input((text, selectionStart) => [null, selectionStart - 1, null]);
  var forward_word = wrap_input(needs_text((text, selectionStart) => {
    if (selectionStart === text.length)
      return [null, null, null];
    const boundaries = getWordBoundaries(text, selectionStart, false);
    return [null, boundaries[1], null];
  }));
  var backward_word = wrap_input((text, selectionStart) => {
    if (selectionStart === 0)
      return [null, null, null];
    const boundaries = getWordBoundaries(text, selectionStart, true);
    return [null, boundaries[0], null];
  });
  var insert_text = wrap_input((text, selectionStart, selectionEnd, arg) => [
    text.slice(0, selectionStart) + arg + text.slice(selectionEnd),
    selectionStart + arg.length,
    null
  ]);
  var rot13 = wrap_input((text, selectionStart, selectionEnd) => [
    rot13_helper(text.slice(0, selectionStart) + text.slice(selectionEnd)),
    selectionStart,
    null
  ]);
  var jumble = wrap_input((text, selectionStart, selectionEnd) => [
    jumble_helper(text.slice(0, selectionStart) + text.slice(selectionEnd)),
    selectionStart,
    null
  ]);

  // src/lib/DANGEROUS-html-tagged-template.js
  (function(window2) {
    "use strict";
    try {
      (function testSpreadOpAndTemplate() {
        const tag = function tag2() {
          return;
        };
        tag`test`;
      })();
      if (!("content" in document.createElement("template") && "from" in Array)) {
        throw new Error();
      }
    } catch (e) {
      console.log("Your browser does not support the needed functionality to use the html tagged template");
      return;
    }
    if (typeof window2.html === "undefined") {
      let encodeAttributeHTMLEntities = function(str) {
        return str.replace(ENCODINGS_REGEX.attribute, function(match) {
          return ENCODINGS.attribute[match];
        });
      }, encodeURIEntities = function(str) {
        return str.replace(ENCODINGS_REGEX.uri, function(match) {
          return ENCODINGS.uri[match];
        });
      };
      const SUBSTITUTION_INDEX = "substitutionindex:";
      const SUBSTITUTION_REGEX = new RegExp(SUBSTITUTION_INDEX + "([0-9]+):", "g");
      const REJECTION_STRING = "zXssPreventedz";
      const ENCODINGS = {
        attribute: {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;"
        },
        uri: {
          "&": "&amp;"
        }
      };
      const DOM_EVENTS = [
        "onclick",
        "ondblclick",
        "onmousedown",
        "onmouseup",
        "onmouseover",
        "onmousemove",
        "onmouseout",
        "ondragstart",
        "ondrag",
        "ondragenter",
        "ondragleave",
        "ondragover",
        "ondrop",
        "ondragend",
        "onkeydown",
        "onkeypress",
        "onkeyup",
        "onload",
        "onunload",
        "onabort",
        "onerror",
        "onresize",
        "onscroll",
        "onselect",
        "onchange",
        "onsubmit",
        "onreset",
        "onfocus",
        "onblur",
        "onpointerdown",
        "onpointerup",
        "onpointercancel",
        "onpointermove",
        "onpointerover",
        "onpointerout",
        "onpointerenter",
        "onpointerleave",
        "ongotpointercapture",
        "onlostpointercapture",
        "oncut",
        "oncopy",
        "onpaste",
        "onbeforecut",
        "onbeforecopy",
        "onbeforepaste",
        "onafterupdate",
        "onbeforeupdate",
        "oncellchange",
        "ondataavailable",
        "ondatasetchanged",
        "ondatasetcomplete",
        "onerrorupdate",
        "onrowenter",
        "onrowexit",
        "onrowsdelete",
        "onrowinserted",
        "oncontextmenu",
        "ondrag",
        "ondragstart",
        "ondragenter",
        "ondragover",
        "ondragleave",
        "ondragend",
        "ondrop",
        "onselectstart",
        "help",
        "onbeforeunload",
        "onstop",
        "beforeeditfocus",
        "onstart",
        "onfinish",
        "onbounce",
        "onbeforeprint",
        "onafterprint",
        "onpropertychange",
        "onfilterchange",
        "onreadystatechange",
        "onlosecapture",
        "DOMMouseScroll",
        "ondragdrop",
        "ondragenter",
        "ondragexit",
        "ondraggesture",
        "ondragover",
        "onclose",
        "oncommand",
        "oninput",
        "DOMMenuItemActive",
        "DOMMenuItemInactive",
        "oncontextmenu",
        "onoverflow",
        "onoverflowchanged",
        "onunderflow",
        "onpopuphidden",
        "onpopuphiding",
        "onpopupshowing",
        "onpopupshown",
        "onbroadcast",
        "oncommandupdate"
      ];
      const URI_ATTRIBUTES = [
        "action",
        "background",
        "cite",
        "classid",
        "codebase",
        "data",
        "href",
        "longdesc",
        "profile",
        "src",
        "usemap"
      ];
      const ENCODINGS_REGEX = {
        attribute: new RegExp("[" + Object.keys(ENCODINGS.attribute).join("") + "]", "g"),
        uri: new RegExp("[" + Object.keys(ENCODINGS.uri).join("") + "]", "g")
      };
      const ATTRIBUTE_PARSER_REGEX = /\s([^">=\s]+)(?:="[^"]+")?/g;
      const WRAPPED_WITH_QUOTES_REGEX = /^('|")[\s\S]*\1$/;
      const CUSTOM_URI_ATTRIBUTES_REGEX = /\bur[il]|ur[il]s?$/i;
      window2.html = function(strings, ...values) {
        if (!strings[0] && values.length === 0) {
          return;
        }
        function replaceSubstitution(match, index) {
          return values[parseInt(index, 10)];
        }
        let str = strings[0];
        for (let i = 0; i < values.length; i++) {
          str += SUBSTITUTION_INDEX + i + ":" + strings[i + 1];
        }
        const template = document.createElement("template");
        template.innerHTML = str;
        const walker = document.createNodeIterator(template.content, NodeFilter.SHOW_ALL);
        let node;
        while (node = walker.nextNode()) {
          let tag = null;
          const attributesToRemove = [];
          let nodeName = node.nodeName.toLowerCase();
          if (nodeName.indexOf(SUBSTITUTION_INDEX) !== -1) {
            nodeName = nodeName.replace(SUBSTITUTION_REGEX, replaceSubstitution);
            tag = document.createElement(nodeName);
            node._replacedWith = tag;
            node.parentNode.insertBefore(tag, node);
          } else if (node.nodeName === "SCRIPT") {
            const script = document.createElement("script");
            tag = script;
            node._replacedWith = script;
            node.parentNode.insertBefore(script, node);
          }
          let attributes;
          if (node.attributes) {
            if (!(node.attributes instanceof NamedNodeMap)) {
              const temp = node.cloneNode();
              const attributeMatches = temp.outerHTML.match(ATTRIBUTE_PARSER_REGEX);
              attributes = [];
              for (const attribute of attributeMatches.length) {
                const attributeName = attribute.trim().split("=")[0];
                const attributeValue = node.getAttribute(attributeName);
                attributes.push({
                  name: attributeName,
                  value: attributeValue
                });
              }
            } else {
              attributes = Array.from(node.attributes);
            }
            for (const attribute of attributes) {
              let name = attribute.name;
              let value = attribute.value;
              let hasSubstitution = false;
              if (name.indexOf(SUBSTITUTION_INDEX) !== -1) {
                name = name.replace(SUBSTITUTION_REGEX, replaceSubstitution);
                if (name && typeof name === "string") {
                  hasSubstitution = true;
                }
                attributesToRemove.push(attribute.name);
              }
              if (name && value.indexOf(SUBSTITUTION_INDEX) !== -1) {
                hasSubstitution = true;
                let isRejected = false;
                value = value.replace(SUBSTITUTION_REGEX, function(match, index, offset) {
                  if (isRejected) {
                    return "";
                  }
                  let substitutionValue = values[parseInt(index, 10)];
                  if (DOM_EVENTS.indexOf(name) !== -1 && typeof substitutionValue === "string" && !WRAPPED_WITH_QUOTES_REGEX.test(substitutionValue)) {
                    substitutionValue = '"' + substitutionValue + '"';
                  } else if (URI_ATTRIBUTES.indexOf(name) !== -1 || CUSTOM_URI_ATTRIBUTES_REGEX.test(name)) {
                    const queryParamIndex = value.indexOf("=");
                    if (queryParamIndex !== -1 && offset > queryParamIndex) {
                      substitutionValue = encodeURIComponent(substitutionValue);
                    } else {
                      substitutionValue = encodeURI(encodeURIEntities(substitutionValue));
                      if (offset === 0 && substitutionValue.indexOf(":") !== -1) {
                        const authorized_protocols = [
                          "http://",
                          "https://",
                          "moz-extension://",
                          "about://",
                          "data:image/png;base64",
                          "data:image/gif;base64",
                          "data:image/jpg;base64",
                          "data:image/jpeg;base64",
                          "data:image/x-icon;base64",
                          "data:image/svg+xml;base64"
                        ];
                        if (!authorized_protocols.find((p) => substitutionValue.startsWith(p))) {
                          isRejected = true;
                        }
                      }
                    }
                  } else if (typeof substitutionValue === "string") {
                    substitutionValue = encodeAttributeHTMLEntities(substitutionValue);
                  }
                  return substitutionValue;
                });
                if (isRejected) {
                  value = "#" + REJECTION_STRING;
                }
              }
              if (tag || hasSubstitution) {
                const el = tag || node;
                if (name.substr(-1) === "?") {
                  el.removeAttribute(name);
                  if (value === "true") {
                    name = name.slice(0, -1);
                    el.setAttribute(name, "");
                  }
                } else {
                  el.setAttribute(name, value);
                }
              }
            }
          }
          attributesToRemove.forEach(function(attribute) {
            node.removeAttribute(attribute);
          });
          let parentNode;
          if (node.parentNode && node.parentNode._replacedWith) {
            parentNode = node.parentNode;
            node.parentNode._replacedWith.appendChild(node);
          }
          if (node._replacedWith && node.childNodes.length === 0 || parentNode && parentNode.childNodes.length === 0) {
            (parentNode || node).remove();
          }
          if (node.nodeType === 3 && node.nodeValue.indexOf(SUBSTITUTION_INDEX) !== -1) {
            const nodeValue = node.nodeValue.replace(SUBSTITUTION_REGEX, replaceSubstitution);
            const text = document.createTextNode(nodeValue);
            node.parentNode.replaceChild(text, node);
          }
        }
        if (template.content.childNodes.length > 1) {
          return template.content;
        }
        return template.content.firstChild;
      };
    }
  })(window);

  // src/lib/number.clamp.ts
  Number.prototype.clamp = function(lo, hi) {
    return Math.max(lo, Math.min(this, hi));
  };

  // src/parsers/genericmode.ts
  function parser(conf, keys4) {
    const maps = keyMap(conf);
    translateKeysInPlace(keys4, conf);
    return parse2(keys4, maps);
  }

  // src/commandline_frame.ts
  var logger8 = new logging_default("cmdline");
  var commandline_state = {
    activeCompletions: void 0,
    clInput: window.document.getElementById("tridactyl-input"),
    clear,
    cmdline_history_position: 0,
    completionsDiv: window.document.getElementById("completions"),
    fns: void 0,
    getCompletion,
    history,
    isVisible: false,
    keyEvents: new Array(),
    refresh_completions,
    state
  };
  theme(document.querySelector(":root"));
  function resizeArea() {
    if (commandline_state.isVisible) {
      messageOwnTab("commandline_content", "show");
      messageOwnTab("commandline_content", "focus");
      focus();
    }
  }
  function getCompletion(args_only = false) {
    if (!commandline_state.activeCompletions)
      return void 0;
    for (const comp of commandline_state.activeCompletions) {
      if (comp.state === "normal" && comp.completion !== void 0) {
        return args_only ? comp.args : comp.completion;
      }
    }
  }
  commandline_state.getCompletion = getCompletion;
  function enableCompletions() {
    if (!commandline_state.activeCompletions) {
      commandline_state.activeCompletions = [
        BindingsCompletionSource,
        BmarkCompletionSource,
        TabAllCompletionSource,
        BufferCompletionSource,
        ExcmdCompletionSource,
        ThemeCompletionSource,
        CompositeCompletionSource,
        FileSystemCompletionSource,
        GotoCompletionSource,
        GuisetCompletionSource,
        HelpCompletionSource,
        AproposCompletionSource,
        HistoryCompletionSource,
        PreferenceCompletionSource,
        RssCompletionSource,
        SessionsCompletionSource,
        SettingsCompletionSource,
        WindowCompletionSource,
        ExtensionsCompletionSource
      ].map((constructorr) => {
        try {
          return new constructorr(commandline_state.completionsDiv);
        } catch (e) {
        }
      }).filter((c) => c);
      const fragment = document.createDocumentFragment();
      commandline_state.activeCompletions.forEach((comp) => fragment.appendChild(comp.node));
      commandline_state.completionsDiv.appendChild(fragment);
      logger8.debug(commandline_state.activeCompletions);
    }
  }
  var noblur = () => setTimeout(() => commandline_state.clInput.focus(), 0);
  function focus() {
    commandline_state.clInput.focus();
    commandline_state.clInput.removeEventListener("blur", noblur);
    commandline_state.clInput.addEventListener("blur", noblur);
  }
  var HISTORY_SEARCH_STRING;
  var keyParser = (keys4) => parser("exmaps", keys4);
  var history_called = false;
  var prev_cmd_called_history = false;
  var QUEUE = [(async () => {
  })()];
  commandline_state.clInput.addEventListener("keydown", function(keyevent) {
    if (!keyevent.isTrusted)
      return;
    commandline_state.keyEvents.push(keyevent);
    const response = keyParser(commandline_state.keyEvents);
    if (response.isMatch) {
      keyevent.preventDefault();
      keyevent.stopImmediatePropagation();
    } else {
      prev_cmd_called_history = false;
    }
    if (response.value) {
      commandline_state.keyEvents = [];
      history_called = false;
      if (response.value.startsWith("ex.")) {
        const [funcname, ...args] = response.value.slice(3).split(/\s+/);
        QUEUE[QUEUE.length - 1].then(() => {
          QUEUE.push((async () => commandline_state.fns[funcname](args.length === 0 ? void 0 : args.join(" ")))());
          prev_cmd_called_history = history_called;
        });
      } else {
        messageOwnTab("controller_content", "acceptExCmd", [
          response.value
        ]).then((_) => prev_cmd_called_history = history_called);
      }
    } else {
      commandline_state.keyEvents = response.keys;
    }
  }, true);
  function refresh_completions(exstr) {
    if (!commandline_state.activeCompletions)
      enableCompletions();
    return Promise.all(commandline_state.activeCompletions.map((comp) => comp.filter(exstr).then(() => {
      if (comp.shouldRefresh()) {
        return resizeArea();
      }
    }))).catch((err) => {
      console.error(err);
      return [];
    });
  }
  var onInputPromise = Promise.resolve();
  commandline_state.clInput.addEventListener("input", () => {
    const exstr = commandline_state.clInput.value;
    contentState.current_cmdline = exstr;
    contentState.cmdline_filter = "";
    setTimeout(async () => {
      await onInputPromise;
      if (exstr !== commandline_state.clInput.value) {
        contentState.cmdline_filter = exstr;
        return;
      }
      onInputPromise = refresh_completions(exstr);
      onInputPromise.then(() => {
        contentState.cmdline_filter = exstr;
      });
    }, 100);
  });
  var cmdline_history_current = "";
  function clear(evlistener = false) {
    if (evlistener)
      commandline_state.clInput.removeEventListener("blur", noblur);
    commandline_state.clInput.value = "";
    commandline_state.cmdline_history_position = 0;
    cmdline_history_current = "";
  }
  commandline_state.clear = clear;
  async function history(n) {
    history_called = true;
    if (!prev_cmd_called_history) {
      HISTORY_SEARCH_STRING = commandline_state.clInput.value;
    }
    const matches = reverse_default(uniq_default(reverse_default(await getAsync2("cmdHistory")))).filter((key) => key.startsWith(HISTORY_SEARCH_STRING));
    if (commandline_state.cmdline_history_position === 0) {
      cmdline_history_current = commandline_state.clInput.value;
    }
    let clamped_ind = matches.length + n - commandline_state.cmdline_history_position;
    clamped_ind = clamped_ind.clamp(0, matches.length);
    const pot_history = matches[clamped_ind];
    commandline_state.clInput.value = pot_history === void 0 ? cmdline_history_current : pot_history;
    if (clamped_ind === matches.length + n - commandline_state.cmdline_history_position)
      commandline_state.cmdline_history_position = commandline_state.cmdline_history_position - n;
  }
  commandline_state.history = history;
  function fillcmdline(newcommand, trailspace = true, ffocus = true) {
    if (trailspace)
      commandline_state.clInput.value = newcommand + " ";
    else
      commandline_state.clInput.value = newcommand;
    commandline_state.isVisible = true;
    let result = Promise.resolve([]);
    if (ffocus) {
      focus();
      result = refresh_completions(commandline_state.clInput.value);
    }
    return result;
  }
  function getContent() {
    return commandline_state.clInput.value;
  }
  function editor_function(fn_name, ...args) {
    let result = Promise.resolve([]);
    if (editor_exports[fn_name]) {
      editor_exports[fn_name](commandline_state.clInput, ...args);
      result = refresh_completions(commandline_state.clInput.value);
    } else {
      console.error(`No editor function named ${fn_name}!`);
    }
    return result;
  }
  addListener("commandline_frame", attributeCaller(commandline_frame_exports));
  commandline_state.fns = getCommandlineFns(commandline_state);
  addListener("commandline_cmd", attributeCaller(commandline_state.fns));
  window.tri = Object.assign(window.tri || {}, {
    perfObserver: listenForCounters()
  });
})();
//!! Deliberately using an API that's deprecated in node.js because
//!! Discussion: github.com/node-browser-compat/atob/pull/9
//!! this file is for browsers and we expect them to cope with it.
//# sourceMappingURL=commandline_frame.js.map

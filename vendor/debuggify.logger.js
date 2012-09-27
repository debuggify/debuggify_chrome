

// Copyright (c) 2012 Ankur Agarwal <ankur@debuggify.net>

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.


var __dfy = __dfy || {};

(function(d) {

  // Set the default environment
  d.env = d.env || 'development';

  d.envs = d.envs || {};

  /**
   * Defaults values for Environment
   * @type {Object}
   */
  d.envs.defaults = {

    /**
     * Logger Settings
     *
     * @type {Object}
     * @todo Implement it
     */
    Logger: {

      /**
       * Optimize for logger if enabled, normally to be enabled in production mode
       *
       * @type {Boolean}
       * @todo Implement it
       */
      optimize: false,

      /**
       * To push the data to collector or not
       *
       * @type {Boolean}
       * @todo Implement it
       */
      collector: true,

      /**
       * Save module history
       *
       * @type {Boolean}
       * @todo Implement it
       */
      history: true,

      /**
       * Enable timestamp with messages or not
       *
       * @type {Boolean}
       * @todo Implement it
       */
      timestamp: true,

      /**
       * Control the message types
       *
       * @type {Enum}
       *
       * TRACE: 0,
       * INFO: 1,
       * WARN: 2,
       * ERROR: 3,
       * SILENT: 4
       */
      level: 0,

      /**
       * Prefix for the flag variable
       *
       * @type {String}
       */
      flagPrefix: '__',

      /**
       * Prefix for the function name
       *
       * @type {String}
       */
      functionPrefix: '',

      /**
       * Different types of message types supported
       *
       * @type {Object}
       * @todo Add more messagetypes
       *
       */
      messagesTypes: {
        'log': 0,
        'info': 1,
        'warn': 2,
        'error': 3
      },

      transports: {
        'Console': {},
        'Websockets': {
          prefix: 'debuggify',
          publish: 'logger',
          subscribe: null
        }
      }
    },

    /**
     * Message format
     *
     * @type {String}
     * @todo Implement basic template support
     */
    messageFormat: '',

    /**
     * Compiled template to optimize the recompilation of template
     *
     * @type {String}
     */
    compiledTemplate: false,


    /**
     * All the transports supported
     *
     * @type {Object}
     */

    // These defaults values are set according to the development environment
    // To use in production set custom values in the production file



    Http: {
      level: 0,
      timestamp: true,
      domain: 'debuggify.net',
      port: '9001',
    },


    all: {
      apikey: 'local'
    }

  };
}(__dfy));
/**
*
* Debuggify JS
* version 0.0.1
*
* @author Ankur Agarwal
*
*/

(function (global, w, undefined) {

  var debuggify = global.debuggify = global.debuggify || (function(){

    var version = '0.0.1';

    var globals = {

      // Sore the reference to the root node project for the tree
      // that have been initialized
      projects: {},

      // All the namespaces that have been used by the modules
      // theses namespace reference to the objects for which they are declared
      namespaces: {},

      // Store all the different type of transports available
      transports: {},

      delimiter: '__',

      selfLogger: null

    };

    var envs = {};

    var env = "development";

    function Debuggify () {

      var self = this;

      self.globals = globals;
      self.win = w;
      self.doc= w.document;
      self.console = w.console || null;
      self.envs = w.__dfy.envs;
      self.env = w.__dfy.env;
      self.version = version;
    }

    Debuggify.prototype = {

      initialize: function() {

        // Initialize defaults
        this.setDefaults();

      },

      multilevelExtend: function(options, defaults) {


        var i;

        for(i in defaults) {
          if (defaults.hasOwnProperty(i)) {

            if(typeof options[i] === 'undefined') {
              options[i] = defaults[i];
            } else if(i.charCodeAt(0) >= "A".charCodeAt(0) && i.charCodeAt(0) <= "Z".charCodeAt(0) && typeof defaults[i] === "object")  {
              this.multilevelExtend(options[i], defaults[i]);
            }
          }
        }

        return options;
      },

      extend: function(options, defaults) {

        var i;

        for(i in defaults) {
          if (defaults.hasOwnProperty(i) && typeof options[i] === 'undefined') {
            options[i] = defaults[i];
          }
        }

        return(options);
      },

      /**
       * Get the settings from all different loaded environments
       * @param  {string} key the module / utility for which settings is required
       * @return {Object}     the environments objects containing only the settings related to key
       */
      getAllEnvironments: function (key) {

        var e = {};
        var prop;
        var envs = this.envs;

        for(prop in envs) {
          if(envs.hasOwnProperty(prop) && typeof envs[prop][key] !== 'undefined' ) {
            e[prop] = envs[prop][key];
          } else {
            e[key] = {};
          }
        }
        return e;
      },


      getSettings: function(key, environment) {

        // Fallback to default environment
        if(!environment) {
          environment = this.env;
        }

        if( typeof envs[environment] !== 'undefined' && typeof envs[environment][key] !== 'undefined') {
          return envs[environment][key];
        }

        return false;
      },

      setDefaults: function(id) {

        if(!id && this._id) {
          id = this._id;
        }

        this._id = id;
        var envs = this.envs;

        this.defaults = this.extend(this.extend(this.extend({}, envs.defaults[id]), envs[this.env][id]), envs.defaults.all);
      },

      setEnv: function (env) {
        if(!env && this.env) {
          env = this.env;
        }

        if(!env || typeof this.envs[env] === "undefined") {
          return false;
        }

        this.options = this.multilevelExtend(this.extend({}, this.envs[env]), this.envs.defaults);
      }
    }

    // var output = {
    //   win: w,
    //   doc: w.document,
    //   console: w.console || null,
    //   extend: extend,
    //   globals: globals,
    //   envs: envs,
    //   env: env,
    //   version: version
    // };


    var ret = new Debuggify();
    ret.setEnv();

    return ret;

  }());

}(this, window));
// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  Oyvind Sean Kinsey http://kinsey.no/blog (2010)
//                  Victor Homyakov <victor-homyakov@users.sourceforge.net> (2010)

/**
 * Main function giving a function stack trace with a forced or passed in Error
 *
 * @cfg {Error} e The error to create a stacktrace from (optional)
 * @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
 * @return {Array} of Strings with functions, lines, files, and arguments where possible
 */
function printStackTrace(options) {
    options = options || {guess: true};
    var ex = options.e || null, guess = !!options.guess;
    var p = new printStackTrace.implementation(), result = p.run(ex);
    return (guess) ? p.guessAnonymousFunctions(result) : result;
}

printStackTrace.implementation = function() {
};

printStackTrace.implementation.prototype = {
    /**
     * @param {Error} ex The error to create a stacktrace from (optional)
     * @param {String} mode Forced mode (optional, mostly for unit tests)
     */
    run: function(ex, mode) {
        ex = ex || this.createException();
        // examine exception properties w/o debugger
        //for (var prop in ex) {alert("Ex['" + prop + "']=" + ex[prop]);}
        mode = mode || this.mode(ex);
        if (mode === 'other') {
            return this.other(arguments.callee);
        } else {
            return this[mode](ex);
        }
    },

    createException: function() {
        try {
            this.undef();
        } catch (e) {
            return e;
        }
    },

    /**
     * Mode could differ for different exception, e.g.
     * exceptions in Chrome may or may not have arguments or stack.
     *
     * @return {String} mode of operation for the exception
     */
    mode: function(e) {
        if (e['arguments'] && e.stack) {
            return 'chrome';
        } else if (typeof e.message === 'string' && typeof window !== 'undefined' && window.opera) {
            // e.message.indexOf("Backtrace:") > -1 -> opera
            // !e.stacktrace -> opera
            if (!e.stacktrace) {
                return 'opera9'; // use e.message
            }
            // 'opera#sourceloc' in e -> opera9, opera10a
            if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
                return 'opera9'; // use e.message
            }
            // e.stacktrace && !e.stack -> opera10a
            if (!e.stack) {
                return 'opera10a'; // use e.stacktrace
            }
            // e.stacktrace && e.stack -> opera10b
            if (e.stacktrace.indexOf("called from line") < 0) {
                return 'opera10b'; // use e.stacktrace, format differs from 'opera10a'
            }
            // e.stacktrace && e.stack -> opera11
            return 'opera11'; // use e.stacktrace, format differs from 'opera10a', 'opera10b'
        } else if (e.stack) {
            return 'firefox';
        }
        return 'other';
    },

    /**
     * Given a context, function name, and callback function, overwrite it so that it calls
     * printStackTrace() first with a callback and then runs the rest of the body.
     *
     * @param {Object} context of execution (e.g. window)
     * @param {String} functionName to instrument
     * @param {Function} function to call with a stack trace on invocation
     */
    instrumentFunction: function(context, functionName, callback) {
        context = context || window;
        var original = context[functionName];
        context[functionName] = function instrumented() {
            callback.call(this, printStackTrace().slice(4));
            return context[functionName]._instrumented.apply(this, arguments);
        };
        context[functionName]._instrumented = original;
    },

    /**
     * Given a context and function name of a function that has been
     * instrumented, revert the function to it's original (non-instrumented)
     * state.
     *
     * @param {Object} context of execution (e.g. window)
     * @param {String} functionName to de-instrument
     */
    deinstrumentFunction: function(context, functionName) {
        if (context[functionName].constructor === Function &&
                context[functionName]._instrumented &&
                context[functionName]._instrumented.constructor === Function) {
            context[functionName] = context[functionName]._instrumented;
        }
    },

    /**
     * Given an Error object, return a formatted Array based on Chrome's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    chrome: function(e) {
        var stack = (e.stack + '\n').replace(/^\S[^\(]+?[\n$]/gm, '').
          replace(/^\s+(at eval )?at\s+/gm, '').
          replace(/^([^\(]+?)([\n$])/gm, '{anonymous}()@$1$2').
          replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}()@$1').split('\n');
        stack.pop();
        return stack;
    },

    /**
     * Given an Error object, return a formatted Array based on Firefox's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    firefox: function(e) {
        return e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
    },

    opera11: function(e) {
        // "Error thrown at line 42, column 12 in <anonymous function>() in file://localhost/G:/js/stacktrace.js:\n"
        // "Error thrown at line 42, column 12 in <anonymous function: createException>() in file://localhost/G:/js/stacktrace.js:\n"
        // "called from line 7, column 4 in bar(n) in file://localhost/G:/js/test/functional/testcase1.html:\n"
        // "called from line 15, column 3 in file://localhost/G:/js/test/functional/testcase1.html:\n"
        var ANON = '{anonymous}', lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var location = match[4] + ':' + match[1] + ':' + match[2];
                var fnName = match[3] || "global code";
                fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
                result.push(fnName + '@' + location + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    opera10b: function(e) {
        // "<anonymous function: run>([arguments not available])@file://localhost/G:/js/stacktrace.js:27\n" +
        // "printStackTrace([arguments not available])@file://localhost/G:/js/stacktrace.js:18\n" +
        // "@file://localhost/G:/js/test/functional/testcase1.html:15"
        var lineRE = /^(.*)@(.+):(\d+)$/;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i++) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var fnName = match[1]? (match[1] + '()') : "global code";
                result.push(fnName + '@' + match[2] + ':' + match[3]);
            }
        }

        return result;
    },

    /**
     * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    opera10a: function(e) {
        // "  Line 27 of linked script file://localhost/G:/js/stacktrace.js\n"
        // "  Line 11 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html: In function foo\n"
        var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var fnName = match[3] || ANON;
                result.push(fnName + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    // Opera 7.x-9.2x only!
    opera9: function(e) {
        // "  Line 43 of linked script file://localhost/G:/js/stacktrace.js\n"
        // "  Line 7 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html\n"
        var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
        var lines = e.message.split('\n'), result = [];

        for (var i = 2, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                result.push(ANON + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    // Safari, IE, and others
    other: function(curr) {
        var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
        while (curr && curr['arguments'] && stack.length < maxStackSize) {
            fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
            args = Array.prototype.slice.call(curr['arguments'] || []);
            stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
            curr = curr.caller;
        }
        return stack;
    },

    /**
     * Given arguments array as a String, subsituting type names for non-string types.
     *
     * @param {Arguments} object
     * @return {Array} of Strings with stringified arguments
     */
    stringifyArguments: function(args) {
        var result = [];
        var slice = Array.prototype.slice;
        for (var i = 0; i < args.length; ++i) {
            var arg = args[i];
            if (arg === undefined) {
                result[i] = 'undefined';
            } else if (arg === null) {
                result[i] = 'null';
            } else if (arg.constructor) {
                if (arg.constructor === Array) {
                    if (arg.length < 3) {
                        result[i] = '[' + this.stringifyArguments(arg) + ']';
                    } else {
                        result[i] = '[' + this.stringifyArguments(slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(slice.call(arg, -1)) + ']';
                    }
                } else if (arg.constructor === Object) {
                    result[i] = '#object';
                } else if (arg.constructor === Function) {
                    result[i] = '#function';
                } else if (arg.constructor === String) {
                    result[i] = '"' + arg + '"';
                } else if (arg.constructor === Number) {
                    result[i] = arg;
                }
            }
        }
        return result.join(',');
    },

    sourceCache: {},

    /**
     * @return the text from a given URL
     */
    ajax: function(url) {
        var req = this.createXMLHTTPObject();
        if (req) {
            try {
                req.open('GET', url, false);
                //req.overrideMimeType('text/plain');
                //req.overrideMimeType('text/javascript');
                req.send(null);
                //return req.status == 200 ? req.responseText : '';
                return req.responseText;
            } catch (e) {
            }
        }
        return '';
    },

    /**
     * Try XHR methods in order and store XHR factory.
     *
     * @return <Function> XHR function or equivalent
     */
    createXMLHTTPObject: function() {
        var xmlhttp, XMLHttpFactories = [
            function() {
                return new XMLHttpRequest();
            }, function() {
                return new ActiveXObject('Msxml2.XMLHTTP');
            }, function() {
                return new ActiveXObject('Msxml3.XMLHTTP');
            }, function() {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
        ];
        for (var i = 0; i < XMLHttpFactories.length; i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
                // Use memoization to cache the factory
                this.createXMLHTTPObject = XMLHttpFactories[i];
                return xmlhttp;
            } catch (e) {
            }
        }
    },

    /**
     * Given a URL, check if it is in the same domain (so we can get the source
     * via Ajax).
     *
     * @param url <String> source url
     * @return False if we need a cross-domain request
     */
    isSameDomain: function(url) {
        return typeof location !== "undefined" && url.indexOf(location.hostname) !== -1; // location may not be defined, e.g. when running from nodejs.
    },

    /**
     * Get source code from given URL if in the same domain.
     *
     * @param url <String> JS source URL
     * @return <Array> Array of source code lines
     */
    getSource: function(url) {
        // TODO reuse source from script tags?
        if (!(url in this.sourceCache)) {
            this.sourceCache[url] = this.ajax(url).split('\n');
        }
        return this.sourceCache[url];
    },

    guessAnonymousFunctions: function(stack) {
        for (var i = 0; i < stack.length; ++i) {
            var reStack = /\{anonymous\}\(.*\)@(.*)/,
                reRef = /^(.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?$/,
                frame = stack[i], ref = reStack.exec(frame);

            if (ref) {
                var m = reRef.exec(ref[1]);
                if (m) { // If falsey, we did not get any file/line information
                    var file = m[1], lineno = m[2], charno = m[3] || 0;
                    if (file && this.isSameDomain(file) && lineno) {
                        var functionName = this.guessAnonymousFunction(file, lineno, charno);
                        stack[i] = frame.replace('{anonymous}', functionName);
                    }
                }
            }
        }
        return stack;
    },

    guessAnonymousFunction: function(url, lineNo, charNo) {
        var ret;
        try {
            ret = this.findFunctionName(this.getSource(url), lineNo);
        } catch (e) {
            ret = 'getSource failed with url: ' + url + ', exception: ' + e.toString();
        }
        return ret;
    },

    findFunctionName: function(source, lineNo) {
        // FIXME findFunctionName fails for compressed source
        // (more than one function on the same line)
        // TODO use captured args
        // function {name}({args}) m[1]=name m[2]=args
        var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/;
        // {name} = function ({args}) TODO args capture
        // /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function(?:[^(]*)/
        var reFunctionExpression = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function\b/;
        // {name} = eval()
        var reFunctionEvaluation = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(?:eval|new Function)\b/;
        // Walk backwards in the source lines until we find
        // the line which matches one of the patterns above
        var code = "", line, maxLines = Math.min(lineNo, 20), m, commentPos;
        for (var i = 0; i < maxLines; ++i) {
            // lineNo is 1-based, source[] is 0-based
            line = source[lineNo - i - 1];
            commentPos = line.indexOf('//');
            if (commentPos >= 0) {
                line = line.substr(0, commentPos);
            }
            // TODO check other types of comments? Commented code may lead to false positive
            if (line) {
                code = line + code;
                m = reFunctionExpression.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
                m = reFunctionDeclaration.exec(code);
                if (m && m[1]) {
                    //return m[1] + "(" + (m[2] || "") + ")";
                    return m[1];
                }
                m = reFunctionEvaluation.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
            }
        }
        return '(?)';
    }
};

/**
 * Debuggify Utils
 * @module debuggify/utils
 * @author Ankur Agarwal
 */

(function( debuggify, undefined ) {

  var utils = debuggify.Utils = debuggify.Utils || (function() {

    // Global Dom Objects
    var win = window;
    var doc = win.document;

    /**
     * Reference http://ejohn.org/blog/javascript-micro-templating
     * @param  {string} str  template as string
     * @param  {Object} data Data needed for the template processing
     * @return {function|string}      Compiled template or processed output
     */
    function processTemplate(str, data) {

            var caller = processTemplate;

            caller.cache = caller.cache || {};

            caller.tmpl = caller.tmpl || function tmpl(str, data) {
              // Figure out if we're getting a template, or if we need to
              // load the template - and be sure to cache the result.
              var fn = !/\W/.test(str) ?
                caller.cache[str] = caller.cache[str] ||
                  caller.tmpl(doc.getElementById(str).innerHTML) :

                // Generate a reusable function that will serve as a template
                // generator (and which will be cached).
                new Function('obj',
                  'var p=[],print=function(){p.push.apply(p,arguments);};' +

                  // Introduce the data as local variables using with(){}
                  "with(obj){p.push('" +

                  // Convert the template into pure JavaScript
                  str
                    .replace(/[\r\t\n]/g, ' ')
                    .split('<%').join('\t')
                    .replace(/((^|%>)[^\t]*)'/g, '$1\r')
                    .replace(/\t=(.*?)%>/g, "',$1,'")
                    .split('\t').join("');")
                    .split('%>').join("p.push('")
                    .split('\r').join("\\'") + "');}return p.join('');");

              // Provide some basic currying to the user
              return data ? fn(data) : fn;
            };

            return caller.tmpl(str, data);
      }

    /**
     * Extract query string from input url
     * @param  {string} url URL need to processed
     * @return {Object}     query string as key value pair of object
     */
    function queryString(url) {

      try {

        var q = url.split('?')[1];
        var a = q.split('&');

        if (a === '') {
          return {};
        }

        var i;
        var b = {};

        for (i = 0; i < a.length; i = i + 1) {

          try {

            var p = a[i].split('=');

            if (p.length !== 2) {
              throw 'continue';
            }

            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '));

          } catch (e) {

          }
        }
        return b;

      } catch (err) {

        return {};

      }

    }

    /**
     * Stack Trace for at any step
     * @return {Array} Stack trace
     */
    function getStackTrace () {

      if (win.printStackTrace) {
        return win.printStackTrace.apply(this, arguments);
      }

    }

    return {
      processTemplate: processTemplate,
      queryString: queryString,
      getStackTrace: getStackTrace

    };
  }());

}( debuggify ) );
/**
 * Debuggify Logger
 * @module debuggify/logger
 * @author Ankur Agarwal
 */
(function( debuggify, undefined ) {

  var logger = debuggify.Logger = debuggify.Logger || (function(w, d, extend, utils, globals, envs) {

    /**
     * Regex to filter unwanted elements from the stack
     *
     * @type {RegExp}
     */
    var stackRegex = /Object.genericMessage/;

    /**
     * Extract file information from the stack trace
     *
     * @type {RegExp}
     */
    var fileInfoRegex = /\((.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?\)$/;

    /**
     * Store url query string as json object
     *
     * @type {Object}
     */
    var urlParameters;

    /**
     * Store the status of message types
     *
     * @type {Object}
     */
    var flags_ = {};

    /**
     * Empty function
     *
     * @return {function} [description]
     */
    var emptyFunction = function (){};

    /**
     * Logger Class
     * @constructor
     *
     * @param {string} name    Name of logger object
     * @param {Object} environments  All different type of enviroments and their settings
     * @param {Object} options options that override the different configurations
     */
    function Logger(name,environments,options) {
      this.initialize(name,environments,options);
    }

    // Extending the prototype
    Logger.prototype = {

      /**
       * set the current environment
       * @function
       * @param {[type]} environmentName Name of the environment
       */
      setEnv: function setEnv(environmentName) {

        var env = this.environments;

        // check whether the environment is valid or not
        if(typeof env === 'undefined' ||
          typeof env[environmentName] === 'undefined') {
          throw 'Invalid environment name ' + environmentName + ' for project ' + this.name;
        }

        // Load the environment
        this.options = extend(env[environmentName], {});

        this.env = environmentName;

      },

      /**
       * Constructor for the Logger Object
       *
       * @param {string} name    Name of logger object
       * @param {Object} environments  All different type of environments
       * @param {Object} options options that override the different configurations
       * @return {undefined}
       */
      initialize: function initialize (name,environments,options) {

        var self = this;

        // Name of the object
        self.name = name;

        self.isLogger = true;

        self._childrens = {};

        self.history = [];

        // All the environments required by the module

        if(environments) {

          // the current environments will be used
          self.environments = environments;

          // Current extended options to be used
          self.options = options;

          // Initialize the functions
          self.setEnv('defaults');
        }


        // Evaluate namespace on the basis on the parent
        self.setNamespace();
      },

      /**
       * Set the level of messages that should be logged
       * TRACE: 0,
       * INFO: 1,
       * WARN: 2,
       * ERROR: 3,
       * SILENT: 4
       *
       * @param {number} level message level
       * @return {Boolean} true on success, false on failure
       */
      setLevel: function (level) {
        level = parseInt(level, 10);
        if(typeof level !== 'number' || isNaN(level) ) {
          return false;
        }
        this.options.level = level;
        installFunctions(this, this.options);
        return true;
      },

      /**
       * Set the flags
       *
       * @param {'string'} type  type of messageType
       * @param {Boolean} value value of flag
       * @return {Boolean} true if success else false
       */
      setFlag: function (type, value) {

        if(flags_[this.namespace] && typeof flags_[this.namespace][this.options.flagPrefix + type] !== 'undefined') {
          flags_[this.namespace][this.options.flagPrefix + type] = value;
          return true;
        }
        return false;
      },

     /**
      * Create a new logger object wrt current object
      *
      * @param {string} name Name of logger object
      * @param {Object} environments  All different type of environments
      * @param {Object} parent parent for the logger object to be created
      * @return {Object} A new generated logger object if everything goes fine, else false
      */
      addModule: function addModule(name, environments, parent) {

        try {

          // Validate the input
          if(! (typeof name === 'string' && name !== "") ) {
            throw 'Invalid name';
          }

          if(typeof environments === 'undefined') {
            environments = {defaults:{}};
          }

          if(typeof parent === 'undefined') {
            parent = this;
          }

          // Checking whether module is already initialized or not
          if(typeof this.modules[name] !== 'undefined') {
            throw 'Module ' + name + ' already initialized';
          }

          environments = extendEnvironments(environments, true);

          function Module() {}

          // Set the parent module
          Module.prototype = parent;

          // Create a new object
          var module = new Module();
          module.initialize(name, environments, extend(extend({}, this.options), environments));

          // Add the module to the list of children
          parent._childrens[name] = module;
          module.parent = parent;

          // link to the global object for reference from outside the module
          globals.namespaces[module.namespace] = module;

          installFlags(module, module.namespace);

          // Add the modules to the list of all modules for this project
          parent.modules[module.name] = module;

          // Add the modules to the list of all modules for this project
          module.genericMessage([module.name, module.namespace, module.options, parent.namespace], '_addModule');

          return module;

        } catch (e) {
          selfLogger.message(['Cannot add module name'  +
            name + 'due to error:' + e], 'logger', 'error');
          return false;
        }
      },

      /**
       * return the logger if already exist else create one and return
       *
       * @param {string} name         Name of logger object
       * @param  {Boolean} createNew  if false then new logger object will not be created, default true
       * @return {Object}             A new generated logger object
       */
      get: function (name, createNew) {

        // return if the module is already defined
        if(typeof this.modules[name] !== 'undefined') {
          return  this.modules[name];
        }


        if(typeof createNew !== 'undefined' && createNew === false) {
          return false;
        }

        // Create a new module and return that
        return this.addModule(name, {});

      },

      /**
       * A generic way to send message of any specific type
       *
       * @param  {Object} message    message to send ex: 'dummy message'
       * @param  {string} moduleName Name of module ex: 'foo', 'bar'
       * @param  {string} type       type of message ex: 'log', 'error', 'warn' etc
       * @return {undefined}
       */
      message: function(message, moduleName, type) {
        this.get(moduleName).genericMessage([message], type);
      },

      /**
       * Automatic set the namespace
       */
      setNamespace: function () {

        if(this.namespace) {
          this.namespace = this.namespace + globals.delimiter + this.name;
        } else {
          this.namespace = this.name;
        }
      },

      /**
       * Add the transport for project
       *
       * @param  {string} transportName Name of the transport
       * @param  {Object} options       Options required for the transport
       * @return {undefined}
       */
      addTransport: function(transportName, options) {
        this.genericMessage([transportName, options], '_addTransport');
      },

      /**
       * Send a message to collector object
       *
       * @param  {Array} data Array of arguments to be send to collector
       * @return {undefined}
       */
      sendToCollector: function (data) {
        var self = this;
        var options = self.options;

        // Adding some common parameters
        data[2].location = d.location.href;

        if(options.collector) {
          self.collectorQueue.push(data);
        }

        if(!options.optimize && options.history) {
          self.history.push(data);
        }

      },

      genericMessage: genericMessage
    };

    /**
     * Extract the file info from the stack frame
     *
     * @param  {string} frame one frame of a stack
     * @return {Object}       file information object
     */
    function getFileInfo(frame) {

      try {

        var m = fileInfoRegex.exec(frame);

        if (m) { // If falsey, we did not get any file/line information

          return {
            file: m[1],
            fileName: m[1].substr(m[1].lastIndexOf("/") + 1),
            lineNo: m[2],
            charNo: m[3]
          };
        }
      } catch (e) {
        return false;
      }
    }

    /**
     * Generate message on the basis of certain parameter
     *
     * @param  {Array} messageArray Array of data to be send in the message
     * @param  {string} type         type of message
     * @return {[type]}              composed message  from various details
     */
    function genericMessage(messageArray, type) {

      var self = this;
      // Get the stack
      var stack = utils.getStackTrace(self.options.optimize ? {} : {guess: true});

      var elNo = 2;
      var stackLength = stack.length;
      var stackElement;

      // Find the regex inside the array
      while(elNo <= stackLength) {

        // Get the elemnt in the stack
        stackElement = stack[elNo];

        //
        if(stackRegex.test(stackElement)) {
          elNo = elNo + 2;
          break;
        }

        elNo = elNo + 1;
      }

      // remove the non app specific data
      var appStack = stack.slice(elNo);

      // Extract the line no and file name
      var info = getFileInfo(appStack[0]) || {};

      info.type = type;
      info.name = self.name;
      info.namespace = self.namespace;
      info.stack = appStack;
      info.timestamp = new Date();

      // Format [<function Name> <argument1> <argument2> ... <argumentn>]
      self.sendToCollector([type, messageArray, info]);
    }

    /**
     * Generate dynamic function based on the options
     *
     * @param  {string} type    type of function
     * @param  {Object} options other details required to generate the function
     * @return {function}         return the generated function
     */
    function getFunc(type, options) {

      // If optimized function is required
      if(options.optimize){

        return emptyFunction;

      } else {

        // If not optimized function is required
        return function() {
          var namespace = this.namespace;
          var options = this.options;

          // if typeflag exist and its set then do the logging
          if (typeof flags_[namespace][options.flagPrefix + type] !== 'undefined' &&
            flags_[namespace][options.flagPrefix + type] &&
            flags_[namespace][options.flagPrefix + type] !== 'false') {

            this.genericMessage(arguments, type);

          }

        };

      }
    }

    /**
     * Get the settings from all different loaded environments
     * @param  {string} key the module / utility for which settings is required
     * @return {Object}     the environments objects containing only the settings related to key
     */
    function getAllEnvironments(key) {
      var e = {};
      var prop;
      for(prop in envs) {
        if(envs.hasOwnProperty(prop) && typeof envs[prop][key] !== 'undefined' ) {
          e[prop] = envs[prop][key];
        } else {
          e[key] = {};
        }
      }
      return e;
    }

    /**
     * Generate and install dynamic function for different message types
     *
     * @param  {Object} context the object on which the functions are to installed
     * @param  {Object} options details need to decide which functions to install
     * @return {Object}         the extended context object
     */
    function installFunctions(context, options) {

      var type;
      var types = options.messagesTypes;

      // Install all the message type in the context
      for (type in types) {

        if(types.hasOwnProperty(type) && types[type] >= options.level) {
          context[options.functionPrefix + type] = getFunc(type, options);
        } else {
          context[options.functionPrefix + type] = emptyFunction;
        }
      }
    }

    /**
     * Install flags which keep track of different message types
     *
     * @param  {Object} context the object on which the functions are to installed
     * @param  {Object} options details need to decide which functions to install
     * @return {undefined}
     */
    function installFlags(context, namespace) {

      var options = context.options;
      var type;
      var types = options.messagesTypes;

      flags_[namespace] = flags_[namespace] || {};

      for (type in types) {
        flags_[namespace][options.flagPrefix + type] = getFirstDefinedValue(
          urlParameters[namespace + globals.delimiter + type],
          urlParameters[namespace],
          urlParameters[type],
          types[type] >= options.level
        );
      }
    }

    /**
     * Return the first not undefined values from the list of values
     *
     * @return {Object}
     */
    function getFirstDefinedValue() {

      var i;
      var l = arguments.length;

      for (i =  0; i < l; i = i + 1) {
        if(typeof arguments[i] !== 'undefined') {
          return arguments[i];
        }
      }
    }

    /**
     * Generate configurations for different environments using defaults
     *
     * @param  {Object} environments take different types of environments
     * @param  {Boolean} returnEmpty   flag which tells return false or defaults when enviroment passed is empty or not defined
     * @return {Object}                returned the extended environments
     */
    function extendEnvironments (environments, returnEmpty) {


      if(typeof environments === 'undefined') {
        return false;
      }

      var env = {};
      var envs_ = getAllEnvironments('Logger');

      // Calculate the defaults extending the user and library defaults
      var defaults = (typeof environments.defaults !== 'undefined') ?
        extend(environments.defaults, envs_.defaults) : envs_.defaults;

      var i;
      var count = 0;

      // Calculate the other environments as per the defaults
      for (i in environments){
        if(environments.hasOwnProperty(i)) {

          if(typeof envs_[i] === 'undefined') {

            // No similar env found so override with defaults to get
            // the final settings
            envs_[i] = extend(environments[i], defaults);

          } else {

            // Overide the already defined envs
            // and then overide the defaults
            env[i] = extend(extend(environments[i], envs_[i]), defaults);
          }
        }

        count = count + 1;
      }

      // if the return empty is enabled and no envs are present
      if(typeof returnEmpty !== 'undefined' && returnEmpty === true && count === 0) {
        return false;
      }

      return env;

    }

   /**
    * Create root logger object for the whole project
    *
    * @param  {string} name           Name of the project
    * @param  {Object} environments environments for the project
    * @return {Object}                return the logger object
    */
    function project(name, environments) {


      // Check for the valid name
      if(typeof name === 'undefined') {
        throw 'No name defined';
      }

      // Check for the valid project name
      if(typeof environments === 'undefined') {
        environments = {defaults: {}};
      }

      var env = extendEnvironments(environments);


      // Creating Project construction dynamically
      function Project(name) {

        // Store the list of modules
        this.modules = {};

        // Store all the logging messages
        this.collectorQueue = [];

        // This transport
        this.transports = [];
      }

      Project.prototype = new Logger(name, env, {});

      //Install the basic messageTypes inside the project prototype
      installFunctions(Project.prototype, Project.prototype.options);

      // Create a new object of the dynamically created class
      var project = new Project(name);

      // link to the global object for reference from outside the module
      globals.namespaces[project.namespace] = project;
      globals.projects[project.name] = project;

      // Initialize the url options
      installUrlOptions(project);

      installFlags(project, project.namespace);

      // Install the transports
      installTransports(project);

      // Add a command to be send to the transport
      project.genericMessage([project.name, project.namespace, project.options, false], '_addProject');

      // Send a call to collector to process all projects
      if(debuggify && debuggify.Collector && debuggify.Collector.process){
        debuggify.Collector.process();
      }

      // Return the dynamic project object which will act a root node for
      // all the project
      return project;

    }

    /**
     * Install the transport for project
     *
     * @param  {project} project The project object in which the transports are to installed
     * @return {undefined}
     */
    function installTransports (project) {

      var transports = project.options.transports;

      for(var transport in transports) {
        project.addTransport(transport, transports[transport]);
      }
    }

    /**
     * convert string to boolean vales
     *
     * @param  {[type]} obj which need conversion
     * @return {[type]}     return modified object
     */
    function checkForBoolean (obj){

      var prop;
      var value;

      for(prop in obj) {
        if(obj.hasOwnProperty(prop)) {

          value = obj[prop];

          switch(value.toLowerCase()){
            case "true":
              obj[prop] = true;
              break;
            case "false":
              obj[prop] = false;
              break;
            default:
          }
        }
      }

      return obj;
    }

    /**
     * Provide a way to control the values from url parameters
     *
     * @param  {Object} context the object on which url control is to applied
     * @return {undefined}
     */
    function installUrlOptions(context) {

      try{

        // Get the urls parameters
        urlParameters = urlParameters || checkForBoolean(utils.queryString(d.location.href));

        var prefix = context.namespace;

        //check if url debugging is on or not
        if(urlParameters && typeof urlParameters[prefix + globals.delimiter +'debug'] !== 'undefined') {

          // Url debugging is on
          // Extend the values

          // check if env is loaded
          if(typeof urlParameters.env !== 'undefined') {
            // set the environment
            context.setEnv(urlParameters.env);
          }

          var property;
          var options = {};
          var count = 0;
          var temp;

          // extend the defaults values
          for(property in context.options) {
            temp = prefix + globals.delimiter + property;
            if( context.options.hasOwnProperty(property) && typeof urlParameters[temp] !== "undefined") {
              options[property] = urlParameters[temp];
              count = count + 1;
            }
          }

          if(count > 0) {
            context.options = extend(options, context.options);
          }

        }

      } catch (e) {

        // show error
        genericMessage(['something went wrong' + e], 'error');

      }
    }

    /**
     * Register to Listen via  window.onerror for any errors
     *
     * @return {undefined}
     */
    function registerForErrors(){

      var fe = w.onerror;

      w.onerror = function(message, file, lineNo, e){

        var info = {
          type: 'error',
          lineNo: lineNo,
          file: file,
          fileName: file.substr(file.lastIndexOf("/") + 1) || '',
          charNo: null,
          name: selfLogger.name,
          namespace: globals.selfLogger.namespace,
          stack: null
        };

        if(typeof message === 'undefined'){
          message = "No message";
        }

        selfLogger.sendToCollector(['error', [message], info]);


        // If some other function is already listening to window.onerror,
        // then make a call to that function
        if(fe && typeof fe === 'function'){
            fe.apply(this, arguments);
        }

        // TO propagate error for other functions to catch
        return false;
      };
    }

    /**
     * Get the project logger by name, if doesn't exist then create a new and return
     *
     * @param  {string} name       Name of the project
     * @param  {Boolean} createNew if false then new logger object will not be created, default true
     * @return {Object}            Return logger object for give project name if it exist else create one and return
     */
    function getProject(name, createNew) {

      if(typeof globals.projects[name] !== 'undefined') {
        return globals.projects[name];
      }

      if(typeof createNew !== 'undefined' && createNew === false) {
        return false;
      }

      // Create a new project Logger object and return
      return project(name);

    }

    /**
     * Get logger object by namespace
     *
     * @param  {string} namespace the namespace for which logger object is required
     * @return {[type]}           return the object if found else return false
     */
    function getByNamespace(namespace) {
      return globals.namespaces[namespace] || false;
    }

    // Initialize the logger object for self logging
    var selfLogger = globals.selfLogger = project('debuggify');
    selfLogger.genericMessage([], '_init');

    // Overload the window.console
    // try {
    //   if(!w.console || typeof w.console.isLogger === "undefined") {
    //     var console = project('global');
    //     console.addTransport('Console', {});
    //     w.console = console;
    //   }
    // } catch (e) {
    //   selfLogger.warn('error overloading window.console: ' + e);
    // }


    registerForErrors();

    return {
      create: project,
      get: getProject,
      getByNamespace: getByNamespace
    };


  }(debuggify.win, debuggify.doc, debuggify.extend, debuggify.Utils, debuggify.globals, debuggify.envs));

}(debuggify));

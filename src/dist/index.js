/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-restricted-globals */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class Session {
  static instance;
  _sessionId = "";
  _projectId = "";
  _replayId = "";
  errorState;
  _user = null;
  eventsCollectorAPI;
  disableConsoleLog;
  bHost;
  sdkSessionTimeout;
  sessionStartTime;
  _maskProperties;
  get user() {
    return this._user;
  }
  set user(user) {
    this._user = user;
  }
  get replayId() {
    return this._replayId;
  }
  get sessionId() {
    return this._sessionId;
  }
  set sessionId(id) {
    this._sessionId = id;
  }
  set projectId(id) {
    this._projectId = id;
  }
  get projectId() {
    return this._projectId;
  }
  get maskProperties() {
    return this._maskProperties;
  }
  set maskProperties(maskProperties) {
    this._maskProperties = maskProperties;
  }
  emitEventInInterval(body, interval = 1e4, resetCallback) {
    setInterval(async () => {
      if (this.isSessionExpired()) {
        await this.createSession(this.bHost);
      }
      const stacks = getStacksGlobally();
      if (!stacks) {
        return;
      }
      this.postEvents(stacks);
      resetCallback();
    }, interval);
  }
  postEvents(body = {}) {
    return fetch(this.eventsCollectorAPI, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      cache: "no-cache",
      body: JSON.stringify({
        ...body,
        start: Date.now(),
        projectId: this.projectId,
        sessionId: this.sessionId,
        user: this.user
      })
    });
  }
  isSessionExpired() {
    const sessionData = localStorage?.getItem?.("garuda_session");
    if (sessionData) {
      const parsedSessionData = JSON.parse(sessionData);
      const isExpired = parseInt(parsedSessionData.start) - parseInt(this.sessionStartTime) > parseInt(this.sdkSessionTimeout) || !parsedSessionData?.sessionId;
      if (isExpired) {
        localStorage?.removeItem?.("garuda_session");
      }
      return isExpired;
    }
    return false;
  }
  async createSession(host) {
    const sessionData = localStorage.getItem("garuda_session");
    if (sessionData) {
      const parsedSessionData = JSON.parse(sessionData);
      const isExpired = parseInt(parsedSessionData.start) - parseInt(this.sessionStartTime) > parseInt(this.sdkSessionTimeout);
      if (parsedSessionData?.sessionId && !isExpired) {
        const response2 = { data: parsedSessionData };
        this.errorState = response2?.data?.errorState;
        this.sessionId = response2?.data?.sessionId;
        this.eventsCollectorAPI = response2?.data?.eventsCollectorAPI;
        this.sdkSessionTimeout = response2?.data?.sdkSessionTimeout;
        this.disableConsoleLog = typeof response2?.data?.disableConsoleLog === "boolean" ? response2?.data?.disableConsoleLog : response2?.data?.disableConsoleLog === "true";
        this.bHost = response2?.data?.bHost;
      } else {
        this.sessionId = "";
      }
    }
    const result = await fetch(`${host}/api/v1/events/initSession`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      cache: "no-cache",
      body: JSON.stringify({
        start: Date?.now?.(),
        projectId: this.projectId,
        user: this.user,
        sessionId: this.sessionId
      })
    });
    const response = await result.json();
    localStorage?.setItem?.(
      "garuda_session",
      JSON.stringify(response?.data || {})
    );
    this.errorState = response?.data?.errorState;
    this.sessionId = response?.data?.sessionId;
    this.eventsCollectorAPI = response?.data?.eventsCollectorAPI;
    this.sdkSessionTimeout = response?.data?.sdkSessionTimeout;
    this.disableConsoleLog = typeof response?.data?.disableConsoleLog === "boolean" ? response?.data?.disableConsoleLog : response?.data?.disableConsoleLog === "true";
    this.bHost = response?.data?.bHost;
    this.sessionStartTime = response?.data?.start;
    return result;
  }
  constructor() {
  }
  static getInstance() {
    if (!Session.instance) {
      Session.instance = new Session();
    }
    return Session.instance;
  }
}

let sendOsDetails = true;
function getUserAgentDetails() {
  let unknown = "-";
  let width, height, osVersion = "unknown", screenSize = "";
  if (screen.width) {
    width = screen.width ? screen.width : "";
    height = screen.height ? screen.height : "";
    screenSize += "" + width + " x " + height;
  }
  var nVer = navigator.appVersion;
  var nAgt = navigator.userAgent;
  var browser = navigator.appName;
  var version = "" + parseFloat(navigator.appVersion);
  var majorVersion = parseInt(navigator.appVersion, 10);
  var nameOffset, verOffset, ix;
  if ((verOffset = nAgt.indexOf("Opera")) != -1) {
    browser = "Opera";
    version = nAgt.substring(verOffset + 6);
    if ((verOffset = nAgt.indexOf("Version")) != -1) {
      version = nAgt.substring(verOffset + 8);
    }
  }
  if ((verOffset = nAgt.indexOf("OPR")) != -1) {
    browser = "Opera";
    version = nAgt.substring(verOffset + 4);
  } else if ((verOffset = nAgt.indexOf("Edge")) != -1) {
    browser = "Microsoft Edge";
    version = nAgt.substring(verOffset + 5);
  } else if ((verOffset = nAgt.indexOf("Edg")) != -1) {
    browser = "Microsoft Edge (Chromium based)";
    version = nAgt.substring(verOffset + 4);
  } else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
    browser = "Microsoft Internet Explorer";
    version = nAgt.substring(verOffset + 5);
  } else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
    browser = "Chrome";
    version = nAgt.substring(verOffset + 7);
  } else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
    browser = "Safari";
    version = nAgt.substring(verOffset + 7);
    if ((verOffset = nAgt.indexOf("Version")) != -1) {
      version = nAgt.substring(verOffset + 8);
    }
  } else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
    browser = "Firefox";
    version = nAgt.substring(verOffset + 8);
  } else if (nAgt.indexOf("Trident/") != -1) {
    browser = "Microsoft Internet Explorer";
    version = nAgt.substring(nAgt.indexOf("rv:") + 3);
  } else if ((nameOffset = nAgt.lastIndexOf(" ") + 1) < (verOffset = nAgt.lastIndexOf("/"))) {
    browser = nAgt.substring(nameOffset, verOffset);
    version = nAgt.substring(verOffset + 1);
    if (browser.toLowerCase() == browser.toUpperCase()) {
      browser = navigator.appName;
    }
  }
  if ((ix = version.indexOf(";")) != -1)
    version = version.substring(0, ix);
  if ((ix = version.indexOf(" ")) != -1)
    version = version.substring(0, ix);
  if ((ix = version.indexOf(")")) != -1)
    version = version.substring(0, ix);
  majorVersion = parseInt("" + version, 10);
  if (isNaN(majorVersion)) {
    version = "" + parseFloat(navigator.appVersion);
    majorVersion = parseInt(navigator.appVersion, 10);
  }
  var mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);
  var cookieEnabled = navigator.cookieEnabled ? true : false;
  if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled) {
    document.cookie = "testcookie";
    cookieEnabled = document.cookie.indexOf("testcookie") != -1 ? true : false;
  }
  var os = unknown;
  var clientStrings = [
    { s: "Windows 10", r: /(Windows 10.0|Windows NT 10.0)/ },
    { s: "Windows 8.1", r: /(Windows 8.1|Windows NT 6.3)/ },
    { s: "Windows 8", r: /(Windows 8|Windows NT 6.2)/ },
    { s: "Windows 7", r: /(Windows 7|Windows NT 6.1)/ },
    { s: "Windows Vista", r: /Windows NT 6.0/ },
    { s: "Windows Server 2003", r: /Windows NT 5.2/ },
    { s: "Windows XP", r: /(Windows NT 5.1|Windows XP)/ },
    { s: "Windows 2000", r: /(Windows NT 5.0|Windows 2000)/ },
    { s: "Windows ME", r: /(Win 9x 4.90|Windows ME)/ },
    { s: "Windows 98", r: /(Windows 98|Win98)/ },
    { s: "Windows 95", r: /(Windows 95|Win95|Windows_95)/ },
    { s: "Windows NT 4.0", r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
    { s: "Windows CE", r: /Windows CE/ },
    { s: "Windows 3.11", r: /Win16/ },
    { s: "Android", r: /Android/ },
    { s: "Open BSD", r: /OpenBSD/ },
    { s: "Sun OS", r: /SunOS/ },
    { s: "Chrome OS", r: /CrOS/ },
    { s: "Linux", r: /(Linux|X11(?!.*CrOS))/ },
    { s: "iOS", r: /(iPhone|iPad|iPod)/ },
    { s: "Mac OS X", r: /Mac OS X/ },
    { s: "Mac OS", r: /(Mac OS|MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
    { s: "QNX", r: /QNX/ },
    { s: "UNIX", r: /UNIX/ },
    { s: "BeOS", r: /BeOS/ },
    { s: "OS/2", r: /OS\/2/ },
    {
      s: "Search Bot",
      r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/
    }
  ];
  for (var id in clientStrings) {
    var cs = clientStrings[id];
    if (cs.r.test(nAgt)) {
      os = cs.s;
      break;
    }
  }
  if (/Windows/.test(os)) {
    osVersion = /Windows (.*)/.exec(os)[1];
    os = "Windows";
  }
  switch (os) {
    case "Mac OS":
    case "Mac OS X":
    case "Android":
      osVersion = /(?:Android|Mac OS|Mac OS X|MacPPC|MacIntel|Mac_PowerPC|Macintosh) ([\.\_\d]+)/.exec(
        nAgt
      )[1];
      break;
    case "iOS":
      osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
      osVersion = osVersion[1] + "." + osVersion[2] + "." + (osVersion[3] | 0);
      break;
  }
  var flashVersion = "no check";
  if (typeof window.swfobject != "undefined") {
    var fv = window.swfobject.getFlashPlayerVersion();
    if (fv.major > 0) {
      flashVersion = fv.major + "." + fv.minor + " r" + fv.release;
    } else {
      flashVersion = unknown;
    }
  }
  return {
    screen: screenSize,
    browser,
    browserVersion: version,
    browserMajorVersion: majorVersion,
    mobile,
    os,
    osVersion,
    cookies: cookieEnabled,
    flashVersion
  };
}
function getUrlInfo() {
  return {
    origin: window.location.origin,
    host: window.location.host,
    href: window.location.href,
    search: window.location.search
  };
}
const resetUserAgent = () => {
  sendOsDetails = false;
};
const getUserAgent = () => {
  if (!sendOsDetails) {
    return null;
  }
  const sessionInstance = Session.getInstance();
  return {
    ...getUserAgentDetails(),
    ...getUrlInfo(),
    projectId: sessionInstance.projectId,
    sessionId: sessionInstance.sessionId
  };
};

const _log = console.log;
const _debug = console.debug;
const _error = console.error;
const _warn = console.warn;
const _table = console.table;
let consoleStacks = [];
const createResponse$4 = (type, data) => {
  const sessionInstance = Session.getInstance();
  const result = [];
  data?.forEach((item) => {
    try {
      if (typeof item === "object") {
        JSON.stringify(item);
        result.push(item);
        return;
      } else {
        result.push(item);
      }
    } catch (e) {
      if (e?.message?.includes?.("circular structure")) {
        const itemResult = {};
        Object.keys(item)?.forEach((key) => {
          if (typeof item[key] == "object") {
            itemResult[key] = item?.[key]?.toString?.() || item?.[key];
          } else {
            itemResult[key] = item?.[key];
          }
        });
        result.push(itemResult);
      }
    }
  });
  return {
    area: "info",
    eventType: "console",
    data: {
      type,
      logData: result
    },
    date: Date.now(),
    location: window.location.href,
    sessionId: sessionInstance.sessionId
  };
};
const setResponse = (type, data) => {
  const response = createResponse$4(type, data);
  consoleStacks.push(response);
};
const getConsoleStack = () => {
  return consoleStacks;
};
const resetConsoleStack = () => {
  consoleStacks = [];
};
const initConsoleEvents = () => {
  const sessionInstance = Session.getInstance();
  if (sessionInstance.disableConsoleLog) {
    return;
  }
  console.log = (...args) => {
    setResponse("log", args);
    _log.apply(null, args);
  };
  console.debug = (...args) => {
    setResponse("debug", args);
    _debug.apply(null, args);
  };
  console.warn = (...args) => {
    setResponse("warn", args);
    _warn.apply(null, args);
  };
  console.error = (...args) => {
    setResponse("error", args);
    _error.apply(null, args);
  };
  console.table = (...args) => {
    setResponse("table", args);
    _table.apply(null, args);
  };
};

var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2)
      if (Object.prototype.hasOwnProperty.call(b2, p))
        d2[p] = b2[p];
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
    throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
function __awaiter$1(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
}
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m)
    return m.call(o);
  if (o && typeof o.length === "number")
    return {
      next: function() {
        if (o && i >= o.length)
          o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m)
    return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
      ar.push(r.value);
  } catch (error) {
    e = { error };
  } finally {
    try {
      if (r && !r.done && (m = i["return"]))
        m.call(i);
    } finally {
      if (e)
        throw e.error;
    }
  }
  return ar;
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2)
    for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar)
          ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
  return to.concat(ar || Array.prototype.slice.call(from));
}
function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function verb(n) {
    if (g[n])
      i[n] = function(v) {
        return new Promise(function(a, b) {
          q.push([n, v, a, b]) > 1 || resume(n, v);
        });
      };
  }
  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }
  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }
  function fulfill(value) {
    resume("next", value);
  }
  function reject(value) {
    resume("throw", value);
  }
  function settle(f, v) {
    if (f(v), q.shift(), q.length)
      resume(q[0][0], q[0][1]);
  }
}
function __asyncValues(o) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i);
  function verb(n) {
    i[n] = o[n] && function(v) {
      return new Promise(function(resolve, reject) {
        v = o[n](v), settle(resolve, reject, v.done, v.value);
      });
    };
  }
  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function(v2) {
      resolve({ value: v2, done: d });
    }, reject);
  }
}

var isArrayLike = function(x) {
  return x && typeof x.length === "number" && typeof x !== "function";
};

function isFunction(value) {
  return typeof value === "function";
}

function isPromise(value) {
  return isFunction(value === null || value === void 0 ? void 0 : value.then);
}

function createErrorClass(createImpl) {
  var _super = function(instance) {
    Error.call(instance);
    instance.stack = new Error().stack;
  };
  var ctorFunc = createImpl(_super);
  ctorFunc.prototype = Object.create(Error.prototype);
  ctorFunc.prototype.constructor = ctorFunc;
  return ctorFunc;
}

var UnsubscriptionError = createErrorClass(function(_super) {
  return function UnsubscriptionErrorImpl(errors) {
    _super(this);
    this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function(err, i) {
      return i + 1 + ") " + err.toString();
    }).join("\n  ") : "";
    this.name = "UnsubscriptionError";
    this.errors = errors;
  };
});

function arrRemove(arr, item) {
  if (arr) {
    var index = arr.indexOf(item);
    0 <= index && arr.splice(index, 1);
  }
}

var Subscription = function() {
  function Subscription2(initialTeardown) {
    this.initialTeardown = initialTeardown;
    this.closed = false;
    this._parentage = null;
    this._finalizers = null;
  }
  Subscription2.prototype.unsubscribe = function() {
    var e_1, _a, e_2, _b;
    var errors;
    if (!this.closed) {
      this.closed = true;
      var _parentage = this._parentage;
      if (_parentage) {
        this._parentage = null;
        if (Array.isArray(_parentage)) {
          try {
            for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
              var parent_1 = _parentage_1_1.value;
              parent_1.remove(this);
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return))
                _a.call(_parentage_1);
            } finally {
              if (e_1)
                throw e_1.error;
            }
          }
        } else {
          _parentage.remove(this);
        }
      }
      var initialFinalizer = this.initialTeardown;
      if (isFunction(initialFinalizer)) {
        try {
          initialFinalizer();
        } catch (e) {
          errors = e instanceof UnsubscriptionError ? e.errors : [e];
        }
      }
      var _finalizers = this._finalizers;
      if (_finalizers) {
        this._finalizers = null;
        try {
          for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
            var finalizer = _finalizers_1_1.value;
            try {
              execFinalizer(finalizer);
            } catch (err) {
              errors = errors !== null && errors !== void 0 ? errors : [];
              if (err instanceof UnsubscriptionError) {
                errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
              } else {
                errors.push(err);
              }
            }
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return))
              _b.call(_finalizers_1);
          } finally {
            if (e_2)
              throw e_2.error;
          }
        }
      }
      if (errors) {
        throw new UnsubscriptionError(errors);
      }
    }
  };
  Subscription2.prototype.add = function(teardown) {
    var _a;
    if (teardown && teardown !== this) {
      if (this.closed) {
        execFinalizer(teardown);
      } else {
        if (teardown instanceof Subscription2) {
          if (teardown.closed || teardown._hasParent(this)) {
            return;
          }
          teardown._addParent(this);
        }
        (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
      }
    }
  };
  Subscription2.prototype._hasParent = function(parent) {
    var _parentage = this._parentage;
    return _parentage === parent || Array.isArray(_parentage) && _parentage.includes(parent);
  };
  Subscription2.prototype._addParent = function(parent) {
    var _parentage = this._parentage;
    this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
  };
  Subscription2.prototype._removeParent = function(parent) {
    var _parentage = this._parentage;
    if (_parentage === parent) {
      this._parentage = null;
    } else if (Array.isArray(_parentage)) {
      arrRemove(_parentage, parent);
    }
  };
  Subscription2.prototype.remove = function(teardown) {
    var _finalizers = this._finalizers;
    _finalizers && arrRemove(_finalizers, teardown);
    if (teardown instanceof Subscription2) {
      teardown._removeParent(this);
    }
  };
  Subscription2.EMPTY = function() {
    var empty = new Subscription2();
    empty.closed = true;
    return empty;
  }();
  return Subscription2;
}();
Subscription.EMPTY;
function isSubscription(value) {
  return value instanceof Subscription || value && "closed" in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe);
}
function execFinalizer(finalizer) {
  if (isFunction(finalizer)) {
    finalizer();
  } else {
    finalizer.unsubscribe();
  }
}

var config = {
  onUnhandledError: null,
  onStoppedNotification: null,
  Promise: void 0,
  useDeprecatedSynchronousErrorHandling: false,
  useDeprecatedNextContext: false
};

var timeoutProvider = {
  setTimeout: function(handler, timeout) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
  },
  clearTimeout: function(handle) {
    return (clearTimeout)(handle);
  },
  delegate: void 0
};

function reportUnhandledError(err) {
  timeoutProvider.setTimeout(function() {
    {
      throw err;
    }
  });
}

function noop() {
}

function errorContext(cb) {
  {
    cb();
  }
}

var Subscriber = function(_super) {
  __extends(Subscriber2, _super);
  function Subscriber2(destination) {
    var _this = _super.call(this) || this;
    _this.isStopped = false;
    if (destination) {
      _this.destination = destination;
      if (isSubscription(destination)) {
        destination.add(_this);
      }
    } else {
      _this.destination = EMPTY_OBSERVER;
    }
    return _this;
  }
  Subscriber2.create = function(next, error, complete) {
    return new SafeSubscriber(next, error, complete);
  };
  Subscriber2.prototype.next = function(value) {
    if (this.isStopped) ; else {
      this._next(value);
    }
  };
  Subscriber2.prototype.error = function(err) {
    if (this.isStopped) ; else {
      this.isStopped = true;
      this._error(err);
    }
  };
  Subscriber2.prototype.complete = function() {
    if (this.isStopped) ; else {
      this.isStopped = true;
      this._complete();
    }
  };
  Subscriber2.prototype.unsubscribe = function() {
    if (!this.closed) {
      this.isStopped = true;
      _super.prototype.unsubscribe.call(this);
      this.destination = null;
    }
  };
  Subscriber2.prototype._next = function(value) {
    this.destination.next(value);
  };
  Subscriber2.prototype._error = function(err) {
    try {
      this.destination.error(err);
    } finally {
      this.unsubscribe();
    }
  };
  Subscriber2.prototype._complete = function() {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  };
  return Subscriber2;
}(Subscription);
var _bind = Function.prototype.bind;
function bind(fn, thisArg) {
  return _bind.call(fn, thisArg);
}
var ConsumerObserver = function() {
  function ConsumerObserver2(partialObserver) {
    this.partialObserver = partialObserver;
  }
  ConsumerObserver2.prototype.next = function(value) {
    var partialObserver = this.partialObserver;
    if (partialObserver.next) {
      try {
        partialObserver.next(value);
      } catch (error) {
        handleUnhandledError(error);
      }
    }
  };
  ConsumerObserver2.prototype.error = function(err) {
    var partialObserver = this.partialObserver;
    if (partialObserver.error) {
      try {
        partialObserver.error(err);
      } catch (error) {
        handleUnhandledError(error);
      }
    } else {
      handleUnhandledError(err);
    }
  };
  ConsumerObserver2.prototype.complete = function() {
    var partialObserver = this.partialObserver;
    if (partialObserver.complete) {
      try {
        partialObserver.complete();
      } catch (error) {
        handleUnhandledError(error);
      }
    }
  };
  return ConsumerObserver2;
}();
var SafeSubscriber = function(_super) {
  __extends(SafeSubscriber2, _super);
  function SafeSubscriber2(observerOrNext, error, complete) {
    var _this = _super.call(this) || this;
    var partialObserver;
    if (isFunction(observerOrNext) || !observerOrNext) {
      partialObserver = {
        next: observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : void 0,
        error: error !== null && error !== void 0 ? error : void 0,
        complete: complete !== null && complete !== void 0 ? complete : void 0
      };
    } else {
      var context_1;
      if (_this && config.useDeprecatedNextContext) {
        context_1 = Object.create(observerOrNext);
        context_1.unsubscribe = function() {
          return _this.unsubscribe();
        };
        partialObserver = {
          next: observerOrNext.next && bind(observerOrNext.next, context_1),
          error: observerOrNext.error && bind(observerOrNext.error, context_1),
          complete: observerOrNext.complete && bind(observerOrNext.complete, context_1)
        };
      } else {
        partialObserver = observerOrNext;
      }
    }
    _this.destination = new ConsumerObserver(partialObserver);
    return _this;
  }
  return SafeSubscriber2;
}(Subscriber);
function handleUnhandledError(error) {
  {
    reportUnhandledError(error);
  }
}
function defaultErrorHandler(err) {
  throw err;
}
var EMPTY_OBSERVER = {
  closed: true,
  next: noop,
  error: defaultErrorHandler,
  complete: noop
};

var observable = function() {
  return typeof Symbol === "function" && Symbol.observable || "@@observable";
}();

function identity(x) {
  return x;
}

function pipeFromArray(fns) {
  if (fns.length === 0) {
    return identity;
  }
  if (fns.length === 1) {
    return fns[0];
  }
  return function piped(input) {
    return fns.reduce(function(prev, fn) {
      return fn(prev);
    }, input);
  };
}

var Observable = function() {
  function Observable2(subscribe) {
    if (subscribe) {
      this._subscribe = subscribe;
    }
  }
  Observable2.prototype.lift = function(operator) {
    var observable = new Observable2();
    observable.source = this;
    observable.operator = operator;
    return observable;
  };
  Observable2.prototype.subscribe = function(observerOrNext, error, complete) {
    var _this = this;
    var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
    errorContext(function() {
      var _a = _this, operator = _a.operator, source = _a.source;
      subscriber.add(operator ? operator.call(subscriber, source) : source ? _this._subscribe(subscriber) : _this._trySubscribe(subscriber));
    });
    return subscriber;
  };
  Observable2.prototype._trySubscribe = function(sink) {
    try {
      return this._subscribe(sink);
    } catch (err) {
      sink.error(err);
    }
  };
  Observable2.prototype.forEach = function(next, promiseCtor) {
    var _this = this;
    promiseCtor = getPromiseCtor(promiseCtor);
    return new promiseCtor(function(resolve, reject) {
      var subscriber = new SafeSubscriber({
        next: function(value) {
          try {
            next(value);
          } catch (err) {
            reject(err);
            subscriber.unsubscribe();
          }
        },
        error: reject,
        complete: resolve
      });
      _this.subscribe(subscriber);
    });
  };
  Observable2.prototype._subscribe = function(subscriber) {
    var _a;
    return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
  };
  Observable2.prototype[observable] = function() {
    return this;
  };
  Observable2.prototype.pipe = function() {
    var operations = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      operations[_i] = arguments[_i];
    }
    return pipeFromArray(operations)(this);
  };
  Observable2.prototype.toPromise = function(promiseCtor) {
    var _this = this;
    promiseCtor = getPromiseCtor(promiseCtor);
    return new promiseCtor(function(resolve, reject) {
      var value;
      _this.subscribe(function(x) {
        return value = x;
      }, function(err) {
        return reject(err);
      }, function() {
        return resolve(value);
      });
    });
  };
  Observable2.create = function(subscribe) {
    return new Observable2(subscribe);
  };
  return Observable2;
}();
function getPromiseCtor(promiseCtor) {
  var _a;
  return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
}
function isObserver(value) {
  return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
}
function isSubscriber(value) {
  return value && value instanceof Subscriber || isObserver(value) && isSubscription(value);
}

function isInteropObservable(input) {
  return isFunction(input[observable]);
}

function isAsyncIterable(obj) {
  return Symbol.asyncIterator && isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
}

function createInvalidObservableTypeError(input) {
  return new TypeError("You provided " + (input !== null && typeof input === "object" ? "an invalid object" : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
}

function getSymbolIterator() {
  if (typeof Symbol !== "function" || !Symbol.iterator) {
    return "@@iterator";
  }
  return Symbol.iterator;
}
var iterator = getSymbolIterator();

function isIterable(input) {
  return isFunction(input === null || input === void 0 ? void 0 : input[iterator]);
}

function readableStreamLikeToAsyncGenerator(readableStream) {
  return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
    var reader, _a, value, done;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          reader = readableStream.getReader();
          _b.label = 1;
        case 1:
          _b.trys.push([1, , 9, 10]);
          _b.label = 2;
        case 2:
          return [4, __await(reader.read())];
        case 3:
          _a = _b.sent(), value = _a.value, done = _a.done;
          if (!done)
            return [3, 5];
          return [4, __await(void 0)];
        case 4:
          return [2, _b.sent()];
        case 5:
          return [4, __await(value)];
        case 6:
          return [4, _b.sent()];
        case 7:
          _b.sent();
          return [3, 2];
        case 8:
          return [3, 10];
        case 9:
          reader.releaseLock();
          return [7];
        case 10:
          return [2];
      }
    });
  });
}
function isReadableStreamLike(obj) {
  return isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
}

function innerFrom(input) {
  if (input instanceof Observable) {
    return input;
  }
  if (input != null) {
    if (isInteropObservable(input)) {
      return fromInteropObservable(input);
    }
    if (isArrayLike(input)) {
      return fromArrayLike(input);
    }
    if (isPromise(input)) {
      return fromPromise(input);
    }
    if (isAsyncIterable(input)) {
      return fromAsyncIterable(input);
    }
    if (isIterable(input)) {
      return fromIterable(input);
    }
    if (isReadableStreamLike(input)) {
      return fromReadableStreamLike(input);
    }
  }
  throw createInvalidObservableTypeError(input);
}
function fromInteropObservable(obj) {
  return new Observable(function(subscriber) {
    var obs = obj[observable]();
    if (isFunction(obs.subscribe)) {
      return obs.subscribe(subscriber);
    }
    throw new TypeError("Provided object does not correctly implement Symbol.observable");
  });
}
function fromArrayLike(array) {
  return new Observable(function(subscriber) {
    for (var i = 0; i < array.length && !subscriber.closed; i++) {
      subscriber.next(array[i]);
    }
    subscriber.complete();
  });
}
function fromPromise(promise) {
  return new Observable(function(subscriber) {
    promise.then(function(value) {
      if (!subscriber.closed) {
        subscriber.next(value);
        subscriber.complete();
      }
    }, function(err) {
      return subscriber.error(err);
    }).then(null, reportUnhandledError);
  });
}
function fromIterable(iterable) {
  return new Observable(function(subscriber) {
    var e_1, _a;
    try {
      for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
        var value = iterable_1_1.value;
        subscriber.next(value);
        if (subscriber.closed) {
          return;
        }
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return))
          _a.call(iterable_1);
      } finally {
        if (e_1)
          throw e_1.error;
      }
    }
    subscriber.complete();
  });
}
function fromAsyncIterable(asyncIterable) {
  return new Observable(function(subscriber) {
    process$1(asyncIterable, subscriber).catch(function(err) {
      return subscriber.error(err);
    });
  });
}
function fromReadableStreamLike(readableStream) {
  return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
}
function process$1(asyncIterable, subscriber) {
  var asyncIterable_1, asyncIterable_1_1;
  var e_2, _a;
  return __awaiter$1(this, void 0, void 0, function() {
    var value, e_2_1;
    return __generator(this, function(_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, 6, 11]);
          asyncIterable_1 = __asyncValues(asyncIterable);
          _b.label = 1;
        case 1:
          return [4, asyncIterable_1.next()];
        case 2:
          if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done))
            return [3, 4];
          value = asyncIterable_1_1.value;
          subscriber.next(value);
          if (subscriber.closed) {
            return [2];
          }
          _b.label = 3;
        case 3:
          return [3, 1];
        case 4:
          return [3, 11];
        case 5:
          e_2_1 = _b.sent();
          e_2 = { error: e_2_1 };
          return [3, 11];
        case 6:
          _b.trys.push([6, , 9, 10]);
          if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return)))
            return [3, 8];
          return [4, _a.call(asyncIterable_1)];
        case 7:
          _b.sent();
          _b.label = 8;
        case 8:
          return [3, 10];
        case 9:
          if (e_2)
            throw e_2.error;
          return [7];
        case 10:
          return [7];
        case 11:
          subscriber.complete();
          return [2];
      }
    });
  });
}

function hasLift(source) {
  return isFunction(source === null || source === void 0 ? void 0 : source.lift);
}
function operate(init) {
  return function(source) {
    if (hasLift(source)) {
      return source.lift(function(liftedSource) {
        try {
          return init(liftedSource, this);
        } catch (err) {
          this.error(err);
        }
      });
    }
    throw new TypeError("Unable to lift unknown Observable type");
  };
}

function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
  return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
}
var OperatorSubscriber = function(_super) {
  __extends(OperatorSubscriber2, _super);
  function OperatorSubscriber2(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
    var _this = _super.call(this, destination) || this;
    _this.onFinalize = onFinalize;
    _this.shouldUnsubscribe = shouldUnsubscribe;
    _this._next = onNext ? function(value) {
      try {
        onNext(value);
      } catch (err) {
        destination.error(err);
      }
    } : _super.prototype._next;
    _this._error = onError ? function(err) {
      try {
        onError(err);
      } catch (err2) {
        destination.error(err2);
      } finally {
        this.unsubscribe();
      }
    } : _super.prototype._error;
    _this._complete = onComplete ? function() {
      try {
        onComplete();
      } catch (err) {
        destination.error(err);
      } finally {
        this.unsubscribe();
      }
    } : _super.prototype._complete;
    return _this;
  }
  OperatorSubscriber2.prototype.unsubscribe = function() {
    var _a;
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      var closed_1 = this.closed;
      _super.prototype.unsubscribe.call(this);
      !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
    }
  };
  return OperatorSubscriber2;
}(Subscriber);

function map(project, thisArg) {
  return operate(function(source, subscriber) {
    var index = 0;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      subscriber.next(project.call(thisArg, value, index++));
    }));
  });
}

function executeSchedule(parentSubscription, scheduler, work, delay, repeat) {
  if (delay === void 0) {
    delay = 0;
  }
  if (repeat === void 0) {
    repeat = false;
  }
  var scheduleSubscription = scheduler.schedule(function() {
    work();
    if (repeat) {
      parentSubscription.add(this.schedule(null, delay));
    } else {
      this.unsubscribe();
    }
  }, delay);
  parentSubscription.add(scheduleSubscription);
  if (!repeat) {
    return scheduleSubscription;
  }
}

function mergeInternals(source, subscriber, project, concurrent, onBeforeNext, expand, innerSubScheduler, additionalFinalizer) {
  var buffer = [];
  var active = 0;
  var index = 0;
  var isComplete = false;
  var checkComplete = function() {
    if (isComplete && !buffer.length && !active) {
      subscriber.complete();
    }
  };
  var outerNext = function(value) {
    return active < concurrent ? doInnerSub(value) : buffer.push(value);
  };
  var doInnerSub = function(value) {
    expand && subscriber.next(value);
    active++;
    var innerComplete = false;
    innerFrom(project(value, index++)).subscribe(createOperatorSubscriber(subscriber, function(innerValue) {
      onBeforeNext === null || onBeforeNext === void 0 ? void 0 : onBeforeNext(innerValue);
      if (expand) {
        outerNext(innerValue);
      } else {
        subscriber.next(innerValue);
      }
    }, function() {
      innerComplete = true;
    }, void 0, function() {
      if (innerComplete) {
        try {
          active--;
          var _loop_1 = function() {
            var bufferedValue = buffer.shift();
            if (innerSubScheduler) {
              executeSchedule(subscriber, innerSubScheduler, function() {
                return doInnerSub(bufferedValue);
              });
            } else {
              doInnerSub(bufferedValue);
            }
          };
          while (buffer.length && active < concurrent) {
            _loop_1();
          }
          checkComplete();
        } catch (err) {
          subscriber.error(err);
        }
      }
    }));
  };
  source.subscribe(createOperatorSubscriber(subscriber, outerNext, function() {
    isComplete = true;
    checkComplete();
  }));
  return function() {
    additionalFinalizer === null || additionalFinalizer === void 0 ? void 0 : additionalFinalizer();
  };
}

function mergeMap(project, resultSelector, concurrent) {
  if (concurrent === void 0) {
    concurrent = Infinity;
  }
  if (isFunction(resultSelector)) {
    return mergeMap(function(a, i) {
      return map(function(b, ii) {
        return resultSelector(a, b, i, ii);
      })(innerFrom(project(a, i)));
    }, concurrent);
  } else if (typeof resultSelector === "number") {
    concurrent = resultSelector;
  }
  return operate(function(source, subscriber) {
    return mergeInternals(source, subscriber, project, concurrent);
  });
}

var isArray = Array.isArray;
function callOrApply(fn, args) {
  return isArray(args) ? fn.apply(void 0, __spreadArray([], __read(args))) : fn(args);
}
function mapOneOrManyArgs(fn) {
  return map(function(args) {
    return callOrApply(fn, args);
  });
}

var nodeEventEmitterMethods = ["addListener", "removeListener"];
var eventTargetMethods = ["addEventListener", "removeEventListener"];
var jqueryMethods = ["on", "off"];
function fromEvent(target, eventName, options, resultSelector) {
  if (isFunction(options)) {
    resultSelector = options;
    options = void 0;
  }
  if (resultSelector) {
    return fromEvent(target, eventName, options).pipe(mapOneOrManyArgs(resultSelector));
  }
  var _a = __read(isEventTarget(target) ? eventTargetMethods.map(function(methodName) {
    return function(handler) {
      return target[methodName](eventName, handler, options);
    };
  }) : isNodeStyleEventEmitter(target) ? nodeEventEmitterMethods.map(toCommonHandlerRegistry(target, eventName)) : isJQueryStyleEventEmitter(target) ? jqueryMethods.map(toCommonHandlerRegistry(target, eventName)) : [], 2), add = _a[0], remove = _a[1];
  if (!add) {
    if (isArrayLike(target)) {
      return mergeMap(function(subTarget) {
        return fromEvent(subTarget, eventName, options);
      })(innerFrom(target));
    }
  }
  if (!add) {
    throw new TypeError("Invalid event target");
  }
  return new Observable(function(subscriber) {
    var handler = function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      return subscriber.next(1 < args.length ? args : args[0]);
    };
    add(handler);
    return function() {
      return remove(handler);
    };
  });
}
function toCommonHandlerRegistry(target, eventName) {
  return function(methodName) {
    return function(handler) {
      return target[methodName](eventName, handler);
    };
  };
}
function isNodeStyleEventEmitter(target) {
  return isFunction(target.addListener) && isFunction(target.removeListener);
}
function isJQueryStyleEventEmitter(target) {
  return isFunction(target.on) && isFunction(target.off);
}
function isEventTarget(target) {
  return isFunction(target.addEventListener) && isFunction(target.removeEventListener);
}

function distinctUntilChanged(comparator, keySelector) {
  if (keySelector === void 0) {
    keySelector = identity;
  }
  comparator = comparator !== null && comparator !== void 0 ? comparator : defaultCompare;
  return operate(function(source, subscriber) {
    var previousKey;
    var first = true;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      var currentKey = keySelector(value);
      if (first || !comparator(previousKey, currentKey)) {
        first = false;
        previousKey = currentKey;
        subscriber.next(value);
      }
    }));
  });
}
function defaultCompare(a, b) {
  return a === b;
}

const getNamedSelectorFromTarget = (event) => {
  const target = event.target;
  var className = target?.className !== "" ? "." + target?.className : "";
  var targetId = target?.id !== "" ? "#" + target?.id : "";
  let result = "";
  const nodeName = target?.nodeName?.toLowerCase();
  if (nodeName) {
    result = result + nodeName;
  }
  if (targetId) {
    result = result + targetId;
  } else {
    result = result + className;
  }
  return result;
};

let deadClickStack = [];
const detectDeadClicks = (event) => {
  deadClickStack.push(createResponse$3(event));
};
const createResponse$3 = (e) => {
  const sessionInstance = Session.getInstance();
  const target = e.target;
  const textContent = e.target?.textContent?.substring(0, 100);
  const classess = [...target?.classList || []];
  const deadClickOn = textContent ? "DeadClick on " + textContent : "DeadClick on " + (target?.id || classess?.[0] || target?.tagName);
  return {
    area: "error",
    eventType: "deadClick",
    data: {
      elementId: target?.id,
      tagName: target?.tagName,
      classList: classess,
      timeStamp: e.timeStamp,
      textContent,
      message: deadClickOn
    },
    date: Date.now(),
    sessionId: sessionInstance.sessionId,
    location: window.location.href
  };
};
const resetDeadClickStack = () => {
  deadClickStack = [];
};
const getDeadClickStack = () => {
  return deadClickStack;
};

let rageClickStack = [];
const detectRageClicks = (event) => {
  rageClickStack.push(createResponse$2(event));
};
const createResponse$2 = (e) => {
  if (!e) {
    return;
  }
  const sessionInstance = Session.getInstance();
  const target = e.target;
  const textContent = getNamedSelectorFromTarget(e);
  const classess = [...target?.classList || []];
  const rageClickOn = textContent ? "RageClick on " + textContent : "RageClick on " + (target?.id || classess?.[0] || target?.tagName);
  return {
    area: "error",
    eventType: "rageClick",
    data: {
      elementId: target?.id,
      tagName: target?.tagName,
      classList: [...classess],
      timeStamp: e.timeStamp,
      textContent,
      message: rageClickOn
    },
    date: Date.now(),
    sessionId: sessionInstance.sessionId,
    location: window.location.href
  };
};
const getRageClickStack = () => {
  return rageClickStack;
};
const resetRageClickStack = () => {
  rageClickStack = [];
};

let clickStacks = [];
let clickObservable;
let rageClickCounts = {};
const addListner = () => {
  clickObservable = fromEvent(document, "click", {
    capture: true
  });
  let interval = 750, rageClickLimit = 3, deadClickLimit = 2;
  let count = 1;
  setInterval(() => {
    count = 1;
    rageClickCounts = {};
  }, interval);
  clickObservable.pipe(distinctUntilChanged()).subscribe((e) => {
    clickStacks.push(createResponse$1(e));
    const selector = getSelectorFromTarget(e);
    if (selector.includes("a") || selector.includes("button")) {
      rageClickCounts[selector] = rageClickCounts[selector] ? rageClickCounts[selector] + 1 : 1;
      if (rageClickCounts[selector] === deadClickLimit) {
        detectDeadClicks(e);
      }
      return;
    }
    count++;
    if (count === rageClickLimit) {
      detectRageClicks(e);
    }
    return e;
  });
};
const getSelectorFromTarget = (event) => {
  const target = event?.target;
  var className = target?.className !== "" ? "." + target?.className : "";
  var targetId = target?.id !== "" ? "#" + target?.id : "";
  return [target?.nodeName?.toLowerCase?.(), className, targetId].join(" ");
};
function createResponse$1(e) {
  if (!e) {
    return;
  }
  const sessionInstance = Session.getInstance();
  const target = e.target;
  const textContent = getNamedSelectorFromTarget(e);
  return {
    area: "info",
    eventType: "click",
    data: {
      elementId: target?.id,
      tagName: target?.tagName,
      classList: [...target?.classList || []],
      eventType: "click",
      timeStamp: e.timeStamp,
      textContent
    },
    date: Date.now(),
    sessionId: sessionInstance.sessionId,
    location: window.location.href
  };
}
const getClickStack = () => {
  return clickStacks;
};
const resetClickStack = () => {
  clickStacks = [];
};
const initClick = () => {
  addListner();
};

let errorStacks = [];
const addErrorListner = () => {
  fromEvent(window, "error", {
    capture: true
  }).pipe(distinctUntilChanged()).subscribe((e) => {
    errorStacks.push(createErrorResponse(e));
    return e;
  });
};
const createErrorResponse = (e) => {
  const sessionInstance = Session.getInstance();
  return {
    area: "error",
    sessionId: sessionInstance.sessionId,
    date: Date.now(),
    location: window.location.href,
    eventType: "javascript",
    data: {
      name: e.error.name,
      stack: e.error.stack,
      fileName: e.filename,
      lineNo: e.lineno,
      colNo: e.colno,
      timeStamp: e.timeStamp,
      message: e.message
    }
  };
};
const getErrorStacks = () => {
  return errorStacks;
};
const resetErrorStack = () => {
  errorStacks = [];
};
const initErrorListner = () => {
  addErrorListner();
};

let customErrorStack = [];
const customErrorEvents = (state) => {
  customErrorStack.push(createResponse(state));
};
const createResponse = (state) => {
  const sessionInstance = Session.getInstance();
  return {
    area: "error",
    eventType: "customError",
    data: {
      message: "Custom Error:" + state?.value + " occured"
    },
    date: Date.now(),
    sessionId: sessionInstance.sessionId,
    location: window.location.href
  };
};
const resetCustomErrorStack = () => {
  customErrorStack = [];
};
const getCustomErrorStack = () => {
  return customErrorStack;
};

let observer;
let locationStack = [];
const customEventMap = {};
function initLocationChange() {
  if (typeof MutationObserver === "undefined") {
    return;
  }
  let oldHref = window?.location?.href;
  const bodyList = document.querySelector("body");
  const sessionInstance = Session.getInstance();
  observer = new MutationObserver((mutations) => {
    let locationUrl = window?.location?.href;
    if (oldHref !== locationUrl) {
      watchDomEvent(oldHref);
      oldHref = locationUrl;
    }
    sessionInstance.errorState?.forEach((state) => {
      if (!state) {
        return;
      }
      locationUrl = window?.location?.href;
      switch (state.type) {
        case "ELEMENT_VISIBLE":
          const result = document.querySelector?.(state.value);
          if (result) {
            if (customEventMap[state.type + state.value]) {
              return;
            }
            customEventMap[state.type + state.value] = true;
            customErrorEvents(state);
          }
          customEventMap[state.type + state.value] = false;
          break;
        case "TEXT_VISIBLE":
          const textResult = document?.body?.textContent?.toLowerCase();
          if (state.operatorText === "Contains" && textResult?.includes?.(state?.value?.toLowerCase())) {
            if (customEventMap[state.type + state.value]) {
              return;
            }
            customEventMap[state.type + state.value] = true;
            customErrorEvents(state);
          } else {
            customEventMap[state.type + state.value] = false;
          }
          if (state.operatorText === "Is Equal To" && textResult === state?.value?.toLowerCase()) {
            if (customEventMap[state.type + state.value]) {
              return;
            }
            customEventMap[state.type + state.value] = true;
            customErrorEvents(state);
          } else {
            customEventMap[state.type + state.value] = false;
          }
          break;
      }
    });
  });
  const config = {
    childList: true,
    subtree: true
  };
  observer.observe(bodyList, config);
}
function watchDomEvent(oldHref) {
  const sessionInstance = Session.getInstance();
  let locationUrl = window?.location?.href;
  const locationEvent = {
    area: "info",
    eventType: "navigation",
    location: locationUrl,
    date: Date.now(),
    sessionId: sessionInstance.sessionId,
    data: {
      currentLocation: document.location.href,
      previousLocation: oldHref
    }
  };
  locationStack.push(locationEvent);
  sessionInstance.errorState?.forEach((state) => {
    if (!state) {
      return;
    }
    customEventMap[state.type + state.value] = false;
    switch (state.type) {
      case "VISITED_URL":
        if (state.operatorText === "Contains" && locationUrl?.includes(state.value)) {
          customErrorEvents(state);
        }
        if (state.operatorText === "Is Equal To" && locationUrl === state.value) {
          customErrorEvents(state);
        }
        break;
    }
  });
}
const getLocationStack = () => {
  return locationStack;
};
const resetLocationEvent = () => {
  locationStack = [];
};

let networkStack = [];
const getResponseHeaders = (headers) => {
  return headers.split("\r\n").reduce((acc, header) => {
    const splitHeaders = header.split(":");
    if (!splitHeaders?.[0]) {
      return acc;
    }
    acc[splitHeaders?.[0]] = splitHeaders?.[1];
    return acc;
  }, {});
};
function networkXHRIntercept() {
  const xhr = XMLHttpRequest.prototype;
  const open = xhr.open;
  xhr.open = function(...args) {
    const sessionInstance = Session.getInstance();
    const before = Date.now();
    const stack = {
      area: "info",
      eventType: "network",
      location: window.location.href,
      date: Date.now(),
      sessionId: sessionInstance.sessionId,
      data: {
        url: args[1],
        status: 401,
        method: args[0],
        startTime: before,
        endTime: 0,
        reqHeaders: {},
        resHeaders: {},
        payload: {},
        response: {},
        message: ""
      }
    };
    if (!stack.data.url.includes(sessionInstance.bHost))
      networkStack.push(stack);
    const send = this.send;
    this.send = (...args2) => {
      stack.data.payload = JSON.parse(args2[0]);
      return send?.apply(this, args2);
    };
    const setRequestHeader = this.setRequestHeader;
    this.setRequestHeader = (...args2) => {
      stack.data.reqHeaders[args2[0]] = args2[1];
      return setRequestHeader?.apply(this, args2);
    };
    this.addEventListener("load", () => {
      stack.data.status = this.status;
      if (this.status >= 400) {
        stack.area = "error";
        stack.data.message = `Network failure ${stack.data.method?.toUpperCase()} ${stack.data.url} ${stack.data.status}`;
      }
      stack.data.resHeaders = getResponseHeaders(this.getAllResponseHeaders());
      stack.data.response = JSON.parse(this.responseText) || {};
      stack.data.endTime = Date.now();
    });
    this.addEventListener("error", () => {
      stack.data.response = JSON.parse(this.responseText) || {};
      stack.data.resHeaders = getResponseHeaders(this.getAllResponseHeaders());
      stack.data.endTime = Date.now();
      stack.data.message = `Network failure ${stack.data.method?.toUpperCase()} ${stack.data.url} ${stack.data.status}`;
    });
    this.addEventListener("abort", () => {
      stack.data.response = JSON.parse(this.responseText) || {};
      stack.data.resHeaders = getResponseHeaders(this.getAllResponseHeaders());
      stack.data.endTime = Date.now();
      stack.data.message = `Network failure ${stack.data.method?.toUpperCase()} ${stack.data.url} ${stack.data.status}`;
    });
    return open.apply(this, args);
  };
}
function resetNetworkStack() {
  networkStack = [];
}
function netowrkFetchIntercept() {
  const sessionInstance = Session.getInstance();
  const { fetch: originalFetch } = window;
  window.fetch = async (...args) => {
    let [resource, config] = args;
    const startTime = Date.now();
    try {
      let response = await originalFetch(resource, config);
      const endTime = Date.now();
      response.clone().json().then((res) => {
        const stack = {
          area: response.status >= 400 ? "error" : "info",
          eventType: "network",
          location: window.location.href,
          date: Date.now(),
          sessionId: sessionInstance.sessionId,
          data: {
            url: resource,
            status: response.status,
            method: config?.method || "get",
            startTime,
            endTime,
            reqHeaders: config?.headers,
            resHeaders: response?.headers,
            payload: config?.body,
            response: res,
            message: `Network failure ${config?.method?.toUpperCase() || "get"} ${resource} ${response.status}`
          }
        };
        if (!stack.data.url.includes(sessionInstance.bHost))
          networkStack.push(stack);
      }).catch((e) => {
        const endTime2 = Date.now();
        const stack = {
          area: "error",
          eventType: "network",
          location: window.location.href,
          date: Date.now(),
          sessionId: sessionInstance.sessionId,
          data: {
            url: resource,
            status: e.status,
            method: config?.method || "get",
            startTime,
            endTime: endTime2,
            reqHeaders: config?.headers,
            resHeaders: e?.headers,
            payload: config?.body,
            response: e,
            message: e?.message
          }
        };
        if (!stack.data?.url?.includes(sessionInstance.bHost))
          networkStack.push(stack);
      });
      return response;
    } catch (e) {
      const endTime = Date.now();
      const stack = {
        area: "error",
        eventType: "network",
        location: window.location.href,
        date: Date.now(),
        sessionId: sessionInstance.sessionId,
        data: {
          url: resource,
          status: e.status,
          method: config?.method || "get",
          startTime,
          endTime,
          reqHeaders: config?.headers,
          resHeaders: e?.headers,
          payload: config?.body,
          response: e,
          message: `Network failure ${config.method?.toUpperCase() || "get"} ${resource} ${e.status}`
        }
      };
      if (!stack.data?.url?.includes(sessionInstance.bHost))
        networkStack.push(stack);
      throw e;
    }
  };
}
const getNetworkStack = () => {
  return networkStack;
};
const initNetwork = () => {
  networkXHRIntercept();
  netowrkFetchIntercept();
};

var NodeType$2;
(function(NodeType2) {
  NodeType2[NodeType2["Document"] = 0] = "Document";
  NodeType2[NodeType2["DocumentType"] = 1] = "DocumentType";
  NodeType2[NodeType2["Element"] = 2] = "Element";
  NodeType2[NodeType2["Text"] = 3] = "Text";
  NodeType2[NodeType2["CDATA"] = 4] = "CDATA";
  NodeType2[NodeType2["Comment"] = 5] = "Comment";
})(NodeType$2 || (NodeType$2 = {}));
function isElement(n) {
  return n.nodeType === n.ELEMENT_NODE;
}
function isShadowRoot(n) {
  var host = n === null || n === void 0 ? void 0 : n.host;
  return Boolean((host === null || host === void 0 ? void 0 : host.shadowRoot) === n);
}
function isNativeShadowDom(shadowRoot) {
  return Object.prototype.toString.call(shadowRoot) === "[object ShadowRoot]";
}
var Mirror = function() {
  function Mirror2() {
    this.idNodeMap = /* @__PURE__ */ new Map();
    this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  }
  Mirror2.prototype.getId = function(n) {
    var _a;
    if (!n)
      return -1;
    var id = (_a = this.getMeta(n)) === null || _a === void 0 ? void 0 : _a.id;
    return id !== null && id !== void 0 ? id : -1;
  };
  Mirror2.prototype.getNode = function(id) {
    return this.idNodeMap.get(id) || null;
  };
  Mirror2.prototype.getIds = function() {
    return Array.from(this.idNodeMap.keys());
  };
  Mirror2.prototype.getMeta = function(n) {
    return this.nodeMetaMap.get(n) || null;
  };
  Mirror2.prototype.removeNodeFromMap = function(n) {
    var _this = this;
    var id = this.getId(n);
    this.idNodeMap["delete"](id);
    if (n.childNodes) {
      n.childNodes.forEach(function(childNode) {
        return _this.removeNodeFromMap(childNode);
      });
    }
  };
  Mirror2.prototype.has = function(id) {
    return this.idNodeMap.has(id);
  };
  Mirror2.prototype.hasNode = function(node) {
    return this.nodeMetaMap.has(node);
  };
  Mirror2.prototype.add = function(n, meta) {
    var id = meta.id;
    this.idNodeMap.set(id, n);
    this.nodeMetaMap.set(n, meta);
  };
  Mirror2.prototype.replace = function(id, n) {
    this.idNodeMap.set(id, n);
  };
  Mirror2.prototype.reset = function() {
    this.idNodeMap = /* @__PURE__ */ new Map();
    this.nodeMetaMap = /* @__PURE__ */ new WeakMap();
  };
  return Mirror2;
}();
function createMirror() {
  return new Mirror();
}
function maskInputValue(_a) {
  var maskInputOptions = _a.maskInputOptions, tagName = _a.tagName, type = _a.type, value = _a.value, maskInputFn = _a.maskInputFn;
  var text = value || "";
  if (maskInputOptions[tagName.toLowerCase()] || maskInputOptions[type]) {
    if (maskInputFn) {
      text = maskInputFn(text);
    } else {
      text = "*".repeat(text.length);
    }
  }
  return text;
}
var ORIGINAL_ATTRIBUTE_NAME = "__rrweb_original__";
function is2DCanvasBlank(canvas) {
  var ctx = canvas.getContext("2d");
  if (!ctx)
    return true;
  var chunkSize = 50;
  for (var x = 0; x < canvas.width; x += chunkSize) {
    for (var y = 0; y < canvas.height; y += chunkSize) {
      var getImageData = ctx.getImageData;
      var originalGetImageData = ORIGINAL_ATTRIBUTE_NAME in getImageData ? getImageData[ORIGINAL_ATTRIBUTE_NAME] : getImageData;
      var pixelBuffer = new Uint32Array(originalGetImageData.call(ctx, x, y, Math.min(chunkSize, canvas.width - x), Math.min(chunkSize, canvas.height - y)).data.buffer);
      if (pixelBuffer.some(function(pixel) {
        return pixel !== 0;
      }))
        return false;
    }
  }
  return true;
}
var _id = 1;
var tagNameRegex = new RegExp("[^a-z0-9-_:]");
var IGNORED_NODE = -2;
function genId() {
  return _id++;
}
function getValidTagName(element) {
  if (element instanceof HTMLFormElement) {
    return "form";
  }
  var processedTagName = element.tagName.toLowerCase().trim();
  if (tagNameRegex.test(processedTagName)) {
    return "div";
  }
  return processedTagName;
}
function getCssRulesString(s) {
  try {
    var rules = s.rules || s.cssRules;
    return rules ? Array.from(rules).map(getCssRuleString).join("") : null;
  } catch (error) {
    return null;
  }
}
function getCssRuleString(rule) {
  var cssStringified = rule.cssText;
  if (isCSSImportRule(rule)) {
    try {
      cssStringified = getCssRulesString(rule.styleSheet) || cssStringified;
    } catch (_a) {
    }
  }
  return cssStringified;
}
function isCSSImportRule(rule) {
  return "styleSheet" in rule;
}
function stringifyStyleSheet(sheet) {
  return sheet.cssRules ? Array.from(sheet.cssRules).map(function(rule) {
    return rule.cssText || "";
  }).join("") : "";
}
function extractOrigin(url) {
  var origin = "";
  if (url.indexOf("//") > -1) {
    origin = url.split("/").slice(0, 3).join("/");
  } else {
    origin = url.split("/")[0];
  }
  origin = origin.split("?")[0];
  return origin;
}
var canvasService;
var canvasCtx;
var URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm;
var RELATIVE_PATH = /^(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/|#).*/;
var DATA_URI = /^(data:)([^,]*),(.*)/i;
function absoluteToStylesheet(cssText, href) {
  return (cssText || "").replace(URL_IN_CSS_REF, function(origin, quote1, path1, quote2, path2, path3) {
    var filePath = path1 || path2 || path3;
    var maybeQuote = quote1 || quote2 || "";
    if (!filePath) {
      return origin;
    }
    if (!RELATIVE_PATH.test(filePath)) {
      return "url(".concat(maybeQuote).concat(filePath).concat(maybeQuote, ")");
    }
    if (DATA_URI.test(filePath)) {
      return "url(".concat(maybeQuote).concat(filePath).concat(maybeQuote, ")");
    }
    if (filePath[0] === "/") {
      return "url(".concat(maybeQuote).concat(extractOrigin(href) + filePath).concat(maybeQuote, ")");
    }
    var stack = href.split("/");
    var parts = filePath.split("/");
    stack.pop();
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
      var part = parts_1[_i];
      if (part === ".") {
        continue;
      } else if (part === "..") {
        stack.pop();
      } else {
        stack.push(part);
      }
    }
    return "url(".concat(maybeQuote).concat(stack.join("/")).concat(maybeQuote, ")");
  });
}
var SRCSET_NOT_SPACES = /^[^ \t\n\r\u000c]+/;
var SRCSET_COMMAS_OR_SPACES = /^[, \t\n\r\u000c]+/;
function getAbsoluteSrcsetString(doc, attributeValue) {
  if (attributeValue.trim() === "") {
    return attributeValue;
  }
  var pos = 0;
  function collectCharacters(regEx) {
    var chars;
    var match = regEx.exec(attributeValue.substring(pos));
    if (match) {
      chars = match[0];
      pos += chars.length;
      return chars;
    }
    return "";
  }
  var output = [];
  while (true) {
    collectCharacters(SRCSET_COMMAS_OR_SPACES);
    if (pos >= attributeValue.length) {
      break;
    }
    var url = collectCharacters(SRCSET_NOT_SPACES);
    if (url.slice(-1) === ",") {
      url = absoluteToDoc(doc, url.substring(0, url.length - 1));
      output.push(url);
    } else {
      var descriptorsStr = "";
      url = absoluteToDoc(doc, url);
      var inParens = false;
      while (true) {
        var c = attributeValue.charAt(pos);
        if (c === "") {
          output.push((url + descriptorsStr).trim());
          break;
        } else if (!inParens) {
          if (c === ",") {
            pos += 1;
            output.push((url + descriptorsStr).trim());
            break;
          } else if (c === "(") {
            inParens = true;
          }
        } else {
          if (c === ")") {
            inParens = false;
          }
        }
        descriptorsStr += c;
        pos += 1;
      }
    }
  }
  return output.join(", ");
}
function absoluteToDoc(doc, attributeValue) {
  if (!attributeValue || attributeValue.trim() === "") {
    return attributeValue;
  }
  var a = doc.createElement("a");
  a.href = attributeValue;
  return a.href;
}
function isSVGElement(el) {
  return Boolean(el.tagName === "svg" || el.ownerSVGElement);
}
function getHref() {
  var a = document.createElement("a");
  a.href = "";
  return a.href;
}
function transformAttribute(doc, tagName, name, value) {
  if (name === "src" || name === "href" && value && !(tagName === "use" && value[0] === "#")) {
    return absoluteToDoc(doc, value);
  } else if (name === "xlink:href" && value && value[0] !== "#") {
    return absoluteToDoc(doc, value);
  } else if (name === "background" && value && (tagName === "table" || tagName === "td" || tagName === "th")) {
    return absoluteToDoc(doc, value);
  } else if (name === "srcset" && value) {
    return getAbsoluteSrcsetString(doc, value);
  } else if (name === "style" && value) {
    return absoluteToStylesheet(value, getHref());
  } else if (tagName === "object" && name === "data" && value) {
    return absoluteToDoc(doc, value);
  } else {
    return value;
  }
}
function _isBlockedElement(element, blockClass, blockSelector) {
  if (typeof blockClass === "string") {
    if (element.classList.contains(blockClass)) {
      return true;
    }
  } else {
    for (var eIndex = element.classList.length; eIndex--; ) {
      var className = element.classList[eIndex];
      if (blockClass.test(className)) {
        return true;
      }
    }
  }
  if (blockSelector) {
    return element.matches(blockSelector);
  }
  return false;
}
function classMatchesRegex(node, regex, checkAncestors) {
  if (!node)
    return false;
  if (node.nodeType !== node.ELEMENT_NODE) {
    if (!checkAncestors)
      return false;
    return classMatchesRegex(node.parentNode, regex, checkAncestors);
  }
  for (var eIndex = node.classList.length; eIndex--; ) {
    var className = node.classList[eIndex];
    if (regex.test(className)) {
      return true;
    }
  }
  if (!checkAncestors)
    return false;
  return classMatchesRegex(node.parentNode, regex, checkAncestors);
}
function needMaskingText(node, maskTextClass, maskTextSelector) {
  var el = node.nodeType === node.ELEMENT_NODE ? node : node.parentElement;
  if (el === null)
    return false;
  if (typeof maskTextClass === "string") {
    if (el.classList.contains(maskTextClass))
      return true;
    if (el.closest(".".concat(maskTextClass)))
      return true;
  } else {
    if (classMatchesRegex(el, maskTextClass, true))
      return true;
  }
  if (maskTextSelector) {
    if (el.matches(maskTextSelector))
      return true;
    if (el.closest(maskTextSelector))
      return true;
  }
  return false;
}
function onceIframeLoaded(iframeEl, listener, iframeLoadTimeout) {
  var win = iframeEl.contentWindow;
  if (!win) {
    return;
  }
  var fired = false;
  var readyState;
  try {
    readyState = win.document.readyState;
  } catch (error) {
    return;
  }
  if (readyState !== "complete") {
    var timer_1 = setTimeout(function() {
      if (!fired) {
        listener();
        fired = true;
      }
    }, iframeLoadTimeout);
    iframeEl.addEventListener("load", function() {
      clearTimeout(timer_1);
      fired = true;
      listener();
    });
    return;
  }
  var blankUrl = "about:blank";
  if (win.location.href !== blankUrl || iframeEl.src === blankUrl || iframeEl.src === "") {
    setTimeout(listener, 0);
    return;
  }
  iframeEl.addEventListener("load", listener);
}
function isStylesheetLoaded(link) {
  if (!link.getAttribute("href"))
    return true;
  return link.sheet !== null;
}
function onceStylesheetLoaded(link, listener, styleSheetLoadTimeout) {
  var fired = false;
  var styleSheetLoaded;
  try {
    styleSheetLoaded = link.sheet;
  } catch (error) {
    return;
  }
  if (styleSheetLoaded)
    return;
  var timer = setTimeout(function() {
    if (!fired) {
      listener();
      fired = true;
    }
  }, styleSheetLoadTimeout);
  link.addEventListener("load", function() {
    clearTimeout(timer);
    fired = true;
    listener();
  });
}
function serializeNode(n, options) {
  var doc = options.doc, mirror = options.mirror, blockClass = options.blockClass, blockSelector = options.blockSelector, maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, inlineStylesheet = options.inlineStylesheet, _a = options.maskInputOptions, maskInputOptions = _a === void 0 ? {} : _a, maskTextFn = options.maskTextFn, maskInputFn = options.maskInputFn, _b = options.dataURLOptions, dataURLOptions = _b === void 0 ? {} : _b, inlineImages = options.inlineImages, recordCanvas = options.recordCanvas, keepIframeSrcFn = options.keepIframeSrcFn, _c = options.newlyAddedElement, newlyAddedElement = _c === void 0 ? false : _c;
  var rootId = getRootId(doc, mirror);
  switch (n.nodeType) {
    case n.DOCUMENT_NODE:
      if (n.compatMode !== "CSS1Compat") {
        return {
          type: NodeType$2.Document,
          childNodes: [],
          compatMode: n.compatMode,
          rootId
        };
      } else {
        return {
          type: NodeType$2.Document,
          childNodes: [],
          rootId
        };
      }
    case n.DOCUMENT_TYPE_NODE:
      return {
        type: NodeType$2.DocumentType,
        name: n.name,
        publicId: n.publicId,
        systemId: n.systemId,
        rootId
      };
    case n.ELEMENT_NODE:
      return serializeElementNode(n, {
        doc,
        blockClass,
        blockSelector,
        inlineStylesheet,
        maskInputOptions,
        maskInputFn,
        dataURLOptions,
        inlineImages,
        recordCanvas,
        keepIframeSrcFn,
        newlyAddedElement,
        rootId
      });
    case n.TEXT_NODE:
      return serializeTextNode(n, {
        maskTextClass,
        maskTextSelector,
        maskTextFn,
        rootId
      });
    case n.CDATA_SECTION_NODE:
      return {
        type: NodeType$2.CDATA,
        textContent: "",
        rootId
      };
    case n.COMMENT_NODE:
      return {
        type: NodeType$2.Comment,
        textContent: n.textContent || "",
        rootId
      };
    default:
      return false;
  }
}
function getRootId(doc, mirror) {
  if (!mirror.hasNode(doc))
    return void 0;
  var docId = mirror.getId(doc);
  return docId === 1 ? void 0 : docId;
}
function serializeTextNode(n, options) {
  var _a;
  var maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, maskTextFn = options.maskTextFn, rootId = options.rootId;
  var parentTagName = n.parentNode && n.parentNode.tagName;
  var textContent = n.textContent;
  var isStyle = parentTagName === "STYLE" ? true : void 0;
  var isScript = parentTagName === "SCRIPT" ? true : void 0;
  if (isStyle && textContent) {
    try {
      if (n.nextSibling || n.previousSibling) {
      } else if ((_a = n.parentNode.sheet) === null || _a === void 0 ? void 0 : _a.cssRules) {
        textContent = stringifyStyleSheet(n.parentNode.sheet);
      }
    } catch (err) {
      console.warn("Cannot get CSS styles from text's parentNode. Error: ".concat(err), n);
    }
    textContent = absoluteToStylesheet(textContent, getHref());
  }
  if (isScript) {
    textContent = "SCRIPT_PLACEHOLDER";
  }
  if (!isStyle && !isScript && textContent && needMaskingText(n, maskTextClass, maskTextSelector)) {
    textContent = maskTextFn ? maskTextFn(textContent) : textContent.replace(/[\S]/g, "*");
  }
  return {
    type: NodeType$2.Text,
    textContent: textContent || "",
    isStyle,
    rootId
  };
}
function serializeElementNode(n, options) {
  var doc = options.doc, blockClass = options.blockClass, blockSelector = options.blockSelector, inlineStylesheet = options.inlineStylesheet, _a = options.maskInputOptions, maskInputOptions = _a === void 0 ? {} : _a, maskInputFn = options.maskInputFn, _b = options.dataURLOptions, dataURLOptions = _b === void 0 ? {} : _b, inlineImages = options.inlineImages, recordCanvas = options.recordCanvas, keepIframeSrcFn = options.keepIframeSrcFn, _c = options.newlyAddedElement, newlyAddedElement = _c === void 0 ? false : _c, rootId = options.rootId;
  var needBlock = _isBlockedElement(n, blockClass, blockSelector);
  var tagName = getValidTagName(n);
  var attributes = {};
  var len = n.attributes.length;
  for (var i = 0; i < len; i++) {
    var attr = n.attributes[i];
    attributes[attr.name] = transformAttribute(doc, tagName, attr.name, attr.value);
  }
  if (tagName === "link" && inlineStylesheet) {
    var stylesheet = Array.from(doc.styleSheets).find(function(s) {
      return s.href === n.href;
    });
    var cssText = null;
    if (stylesheet) {
      cssText = getCssRulesString(stylesheet);
    }
    if (cssText) {
      delete attributes.rel;
      delete attributes.href;
      attributes._cssText = absoluteToStylesheet(cssText, stylesheet.href);
    }
  }
  if (tagName === "style" && n.sheet && !(n.innerText || n.textContent || "").trim().length) {
    var cssText = getCssRulesString(n.sheet);
    if (cssText) {
      attributes._cssText = absoluteToStylesheet(cssText, getHref());
    }
  }
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    var value = n.value;
    if (attributes.type !== "radio" && attributes.type !== "checkbox" && attributes.type !== "submit" && attributes.type !== "button" && value) {
      attributes.value = maskInputValue({
        type: attributes.type,
        tagName,
        value,
        maskInputOptions,
        maskInputFn
      });
    } else if (n.checked) {
      attributes.checked = n.checked;
    }
  }
  if (tagName === "option") {
    if (n.selected && !maskInputOptions["select"]) {
      attributes.selected = true;
    } else {
      delete attributes.selected;
    }
  }
  if (tagName === "canvas" && recordCanvas) {
    if (n.__context === "2d") {
      if (!is2DCanvasBlank(n)) {
        attributes.rr_dataURL = n.toDataURL(dataURLOptions.type, dataURLOptions.quality);
      }
    } else if (!("__context" in n)) {
      var canvasDataURL = n.toDataURL(dataURLOptions.type, dataURLOptions.quality);
      var blankCanvas = document.createElement("canvas");
      blankCanvas.width = n.width;
      blankCanvas.height = n.height;
      var blankCanvasDataURL = blankCanvas.toDataURL(dataURLOptions.type, dataURLOptions.quality);
      if (canvasDataURL !== blankCanvasDataURL) {
        attributes.rr_dataURL = canvasDataURL;
      }
    }
  }
  if (tagName === "img" && inlineImages) {
    if (!canvasService) {
      canvasService = doc.createElement("canvas");
      canvasCtx = canvasService.getContext("2d");
    }
    var image_1 = n;
    var oldValue_1 = image_1.crossOrigin;
    image_1.crossOrigin = "anonymous";
    var recordInlineImage = function() {
      try {
        canvasService.width = image_1.naturalWidth;
        canvasService.height = image_1.naturalHeight;
        canvasCtx.drawImage(image_1, 0, 0);
        attributes.rr_dataURL = canvasService.toDataURL(dataURLOptions.type, dataURLOptions.quality);
      } catch (err) {
        console.warn("Cannot inline img src=".concat(image_1.currentSrc, "! Error: ").concat(err));
      }
      oldValue_1 ? attributes.crossOrigin = oldValue_1 : image_1.removeAttribute("crossorigin");
    };
    if (image_1.complete && image_1.naturalWidth !== 0)
      recordInlineImage();
    else
      image_1.onload = recordInlineImage;
  }
  if (tagName === "audio" || tagName === "video") {
    attributes.rr_mediaState = n.paused ? "paused" : "played";
    attributes.rr_mediaCurrentTime = n.currentTime;
  }
  if (!newlyAddedElement) {
    if (n.scrollLeft) {
      attributes.rr_scrollLeft = n.scrollLeft;
    }
    if (n.scrollTop) {
      attributes.rr_scrollTop = n.scrollTop;
    }
  }
  if (needBlock) {
    var _d = n.getBoundingClientRect(), width = _d.width, height = _d.height;
    attributes = {
      "class": attributes["class"],
      rr_width: "".concat(width, "px"),
      rr_height: "".concat(height, "px")
    };
  }
  if (tagName === "iframe" && !keepIframeSrcFn(attributes.src)) {
    if (!n.contentDocument) {
      attributes.rr_src = attributes.src;
    }
    delete attributes.src;
  }
  return {
    type: NodeType$2.Element,
    tagName,
    attributes,
    childNodes: [],
    isSVG: isSVGElement(n) || void 0,
    needBlock,
    rootId
  };
}
function lowerIfExists(maybeAttr) {
  if (maybeAttr === void 0) {
    return "";
  } else {
    return maybeAttr.toLowerCase();
  }
}
function slimDOMExcluded(sn, slimDOMOptions) {
  if (slimDOMOptions.comment && sn.type === NodeType$2.Comment) {
    return true;
  } else if (sn.type === NodeType$2.Element) {
    if (slimDOMOptions.script && (sn.tagName === "script" || sn.tagName === "link" && sn.attributes.rel === "preload" && sn.attributes.as === "script" || sn.tagName === "link" && sn.attributes.rel === "prefetch" && typeof sn.attributes.href === "string" && sn.attributes.href.endsWith(".js"))) {
      return true;
    } else if (slimDOMOptions.headFavicon && (sn.tagName === "link" && sn.attributes.rel === "shortcut icon" || sn.tagName === "meta" && (lowerIfExists(sn.attributes.name).match(/^msapplication-tile(image|color)$/) || lowerIfExists(sn.attributes.name) === "application-name" || lowerIfExists(sn.attributes.rel) === "icon" || lowerIfExists(sn.attributes.rel) === "apple-touch-icon" || lowerIfExists(sn.attributes.rel) === "shortcut icon"))) {
      return true;
    } else if (sn.tagName === "meta") {
      if (slimDOMOptions.headMetaDescKeywords && lowerIfExists(sn.attributes.name).match(/^description|keywords$/)) {
        return true;
      } else if (slimDOMOptions.headMetaSocial && (lowerIfExists(sn.attributes.property).match(/^(og|twitter|fb):/) || lowerIfExists(sn.attributes.name).match(/^(og|twitter):/) || lowerIfExists(sn.attributes.name) === "pinterest")) {
        return true;
      } else if (slimDOMOptions.headMetaRobots && (lowerIfExists(sn.attributes.name) === "robots" || lowerIfExists(sn.attributes.name) === "googlebot" || lowerIfExists(sn.attributes.name) === "bingbot")) {
        return true;
      } else if (slimDOMOptions.headMetaHttpEquiv && sn.attributes["http-equiv"] !== void 0) {
        return true;
      } else if (slimDOMOptions.headMetaAuthorship && (lowerIfExists(sn.attributes.name) === "author" || lowerIfExists(sn.attributes.name) === "generator" || lowerIfExists(sn.attributes.name) === "framework" || lowerIfExists(sn.attributes.name) === "publisher" || lowerIfExists(sn.attributes.name) === "progid" || lowerIfExists(sn.attributes.property).match(/^article:/) || lowerIfExists(sn.attributes.property).match(/^product:/))) {
        return true;
      } else if (slimDOMOptions.headMetaVerification && (lowerIfExists(sn.attributes.name) === "google-site-verification" || lowerIfExists(sn.attributes.name) === "yandex-verification" || lowerIfExists(sn.attributes.name) === "csrf-token" || lowerIfExists(sn.attributes.name) === "p:domain_verify" || lowerIfExists(sn.attributes.name) === "verify-v1" || lowerIfExists(sn.attributes.name) === "verification" || lowerIfExists(sn.attributes.name) === "shopify-checkout-api-token")) {
        return true;
      }
    }
  }
  return false;
}
function serializeNodeWithId(n, options) {
  var doc = options.doc, mirror = options.mirror, blockClass = options.blockClass, blockSelector = options.blockSelector, maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, _a = options.skipChild, skipChild = _a === void 0 ? false : _a, _b = options.inlineStylesheet, inlineStylesheet = _b === void 0 ? true : _b, _c = options.maskInputOptions, maskInputOptions = _c === void 0 ? {} : _c, maskTextFn = options.maskTextFn, maskInputFn = options.maskInputFn, slimDOMOptions = options.slimDOMOptions, _d = options.dataURLOptions, dataURLOptions = _d === void 0 ? {} : _d, _e = options.inlineImages, inlineImages = _e === void 0 ? false : _e, _f = options.recordCanvas, recordCanvas = _f === void 0 ? false : _f, onSerialize = options.onSerialize, onIframeLoad = options.onIframeLoad, _g = options.iframeLoadTimeout, iframeLoadTimeout = _g === void 0 ? 5e3 : _g, onStylesheetLoad = options.onStylesheetLoad, _h = options.stylesheetLoadTimeout, stylesheetLoadTimeout = _h === void 0 ? 5e3 : _h, _j = options.keepIframeSrcFn, keepIframeSrcFn = _j === void 0 ? function() {
    return false;
  } : _j, _k = options.newlyAddedElement, newlyAddedElement = _k === void 0 ? false : _k;
  var _l = options.preserveWhiteSpace, preserveWhiteSpace = _l === void 0 ? true : _l;
  var _serializedNode = serializeNode(n, {
    doc,
    mirror,
    blockClass,
    blockSelector,
    maskTextClass,
    maskTextSelector,
    inlineStylesheet,
    maskInputOptions,
    maskTextFn,
    maskInputFn,
    dataURLOptions,
    inlineImages,
    recordCanvas,
    keepIframeSrcFn,
    newlyAddedElement
  });
  if (!_serializedNode) {
    console.warn(n, "not serialized");
    return null;
  }
  var id;
  if (mirror.hasNode(n)) {
    id = mirror.getId(n);
  } else if (slimDOMExcluded(_serializedNode, slimDOMOptions) || !preserveWhiteSpace && _serializedNode.type === NodeType$2.Text && !_serializedNode.isStyle && !_serializedNode.textContent.replace(/^\s+|\s+$/gm, "").length) {
    id = IGNORED_NODE;
  } else {
    id = genId();
  }
  if (id === IGNORED_NODE) {
    return null;
  }
  var serializedNode = Object.assign(_serializedNode, { id });
  mirror.add(n, serializedNode);
  if (onSerialize) {
    onSerialize(n);
  }
  var recordChild = !skipChild;
  if (serializedNode.type === NodeType$2.Element) {
    recordChild = recordChild && !serializedNode.needBlock;
    delete serializedNode.needBlock;
    var shadowRoot = n.shadowRoot;
    if (shadowRoot && isNativeShadowDom(shadowRoot))
      serializedNode.isShadowHost = true;
  }
  if ((serializedNode.type === NodeType$2.Document || serializedNode.type === NodeType$2.Element) && recordChild) {
    if (slimDOMOptions.headWhitespace && serializedNode.type === NodeType$2.Element && serializedNode.tagName === "head") {
      preserveWhiteSpace = false;
    }
    var bypassOptions = {
      doc,
      mirror,
      blockClass,
      blockSelector,
      maskTextClass,
      maskTextSelector,
      skipChild,
      inlineStylesheet,
      maskInputOptions,
      maskTextFn,
      maskInputFn,
      slimDOMOptions,
      dataURLOptions,
      inlineImages,
      recordCanvas,
      preserveWhiteSpace,
      onSerialize,
      onIframeLoad,
      iframeLoadTimeout,
      onStylesheetLoad,
      stylesheetLoadTimeout,
      keepIframeSrcFn
    };
    for (var _i = 0, _m = Array.from(n.childNodes); _i < _m.length; _i++) {
      var childN = _m[_i];
      var serializedChildNode = serializeNodeWithId(childN, bypassOptions);
      if (serializedChildNode) {
        serializedNode.childNodes.push(serializedChildNode);
      }
    }
    if (isElement(n) && n.shadowRoot) {
      for (var _o = 0, _p = Array.from(n.shadowRoot.childNodes); _o < _p.length; _o++) {
        var childN = _p[_o];
        var serializedChildNode = serializeNodeWithId(childN, bypassOptions);
        if (serializedChildNode) {
          isNativeShadowDom(n.shadowRoot) && (serializedChildNode.isShadow = true);
          serializedNode.childNodes.push(serializedChildNode);
        }
      }
    }
  }
  if (n.parentNode && isShadowRoot(n.parentNode) && isNativeShadowDom(n.parentNode)) {
    serializedNode.isShadow = true;
  }
  if (serializedNode.type === NodeType$2.Element && serializedNode.tagName === "iframe") {
    onceIframeLoaded(n, function() {
      var iframeDoc = n.contentDocument;
      if (iframeDoc && onIframeLoad) {
        var serializedIframeNode = serializeNodeWithId(iframeDoc, {
          doc: iframeDoc,
          mirror,
          blockClass,
          blockSelector,
          maskTextClass,
          maskTextSelector,
          skipChild: false,
          inlineStylesheet,
          maskInputOptions,
          maskTextFn,
          maskInputFn,
          slimDOMOptions,
          dataURLOptions,
          inlineImages,
          recordCanvas,
          preserveWhiteSpace,
          onSerialize,
          onIframeLoad,
          iframeLoadTimeout,
          onStylesheetLoad,
          stylesheetLoadTimeout,
          keepIframeSrcFn
        });
        if (serializedIframeNode) {
          onIframeLoad(n, serializedIframeNode);
        }
      }
    }, iframeLoadTimeout);
  }
  if (serializedNode.type === NodeType$2.Element && serializedNode.tagName === "link" && serializedNode.attributes.rel === "stylesheet") {
    onceStylesheetLoaded(n, function() {
      if (onStylesheetLoad) {
        var serializedLinkNode = serializeNodeWithId(n, {
          doc,
          mirror,
          blockClass,
          blockSelector,
          maskTextClass,
          maskTextSelector,
          skipChild: false,
          inlineStylesheet,
          maskInputOptions,
          maskTextFn,
          maskInputFn,
          slimDOMOptions,
          dataURLOptions,
          inlineImages,
          recordCanvas,
          preserveWhiteSpace,
          onSerialize,
          onIframeLoad,
          iframeLoadTimeout,
          onStylesheetLoad,
          stylesheetLoadTimeout,
          keepIframeSrcFn
        });
        if (serializedLinkNode) {
          onStylesheetLoad(n, serializedLinkNode);
        }
      }
    }, stylesheetLoadTimeout);
    if (isStylesheetLoaded(n) === false)
      return null;
  }
  return serializedNode;
}
function snapshot(n, options) {
  var _a = options || {}, _b = _a.mirror, mirror = _b === void 0 ? new Mirror() : _b, _c = _a.blockClass, blockClass = _c === void 0 ? "rr-block" : _c, _d = _a.blockSelector, blockSelector = _d === void 0 ? null : _d, _e = _a.maskTextClass, maskTextClass = _e === void 0 ? "rr-mask" : _e, _f = _a.maskTextSelector, maskTextSelector = _f === void 0 ? null : _f, _g = _a.inlineStylesheet, inlineStylesheet = _g === void 0 ? true : _g, _h = _a.inlineImages, inlineImages = _h === void 0 ? false : _h, _j = _a.recordCanvas, recordCanvas = _j === void 0 ? false : _j, _k = _a.maskAllInputs, maskAllInputs = _k === void 0 ? false : _k, maskTextFn = _a.maskTextFn, maskInputFn = _a.maskInputFn, _l = _a.slimDOM, slimDOM = _l === void 0 ? false : _l, dataURLOptions = _a.dataURLOptions, preserveWhiteSpace = _a.preserveWhiteSpace, onSerialize = _a.onSerialize, onIframeLoad = _a.onIframeLoad, iframeLoadTimeout = _a.iframeLoadTimeout, onStylesheetLoad = _a.onStylesheetLoad, stylesheetLoadTimeout = _a.stylesheetLoadTimeout, _m = _a.keepIframeSrcFn, keepIframeSrcFn = _m === void 0 ? function() {
    return false;
  } : _m;
  var maskInputOptions = maskAllInputs === true ? {
    color: true,
    date: true,
    "datetime-local": true,
    email: true,
    month: true,
    number: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    time: true,
    url: true,
    week: true,
    textarea: true,
    select: true,
    password: true
  } : maskAllInputs === false ? {
    password: true
  } : maskAllInputs;
  var slimDOMOptions = slimDOM === true || slimDOM === "all" ? {
    script: true,
    comment: true,
    headFavicon: true,
    headWhitespace: true,
    headMetaDescKeywords: slimDOM === "all",
    headMetaSocial: true,
    headMetaRobots: true,
    headMetaHttpEquiv: true,
    headMetaAuthorship: true,
    headMetaVerification: true
  } : slimDOM === false ? {} : slimDOM;
  return serializeNodeWithId(n, {
    doc: n,
    mirror,
    blockClass,
    blockSelector,
    maskTextClass,
    maskTextSelector,
    skipChild: false,
    inlineStylesheet,
    maskInputOptions,
    maskTextFn,
    maskInputFn,
    slimDOMOptions,
    dataURLOptions,
    inlineImages,
    recordCanvas,
    preserveWhiteSpace,
    onSerialize,
    onIframeLoad,
    iframeLoadTimeout,
    onStylesheetLoad,
    stylesheetLoadTimeout,
    keepIframeSrcFn,
    newlyAddedElement: false
  });
}

function on(type, fn, target = document) {
  const options = { capture: true, passive: true };
  target.addEventListener(type, fn, options);
  return () => target.removeEventListener(type, fn, options);
}
const DEPARTED_MIRROR_ACCESS_WARNING = "Please stop import mirror directly. Instead of that,\r\nnow you can use replayer.getMirror() to access the mirror instance of a replayer,\r\nor you can use record.mirror to access the mirror instance during recording.";
let _mirror = {
  map: {},
  getId() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    return -1;
  },
  getNode() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    return null;
  },
  removeNodeFromMap() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
  },
  has() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    return false;
  },
  reset() {
    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
  }
};
if (typeof window !== "undefined" && window.Proxy && window.Reflect) {
  _mirror = new Proxy(_mirror, {
    get(target, prop, receiver) {
      if (prop === "map") {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}
function throttle(func, wait, options = {}) {
  let timeout = null;
  let previous = 0;
  return function(...args) {
    const now = Date.now();
    if (!previous && options.leading === false) {
      previous = now;
    }
    const remaining = wait - (now - previous);
    const context = this;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(context, args);
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(() => {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        func.apply(context, args);
      }, remaining);
    }
  };
}
function hookSetter(target, key, d, isRevoked, win = window) {
  const original = win.Object.getOwnPropertyDescriptor(target, key);
  win.Object.defineProperty(target, key, isRevoked ? d : {
    set(value) {
      setTimeout(() => {
        d.set.call(this, value);
      }, 0);
      if (original && original.set) {
        original.set.call(this, value);
      }
    }
  });
  return () => hookSetter(target, key, original || {}, true);
}
function patch(source, name, replacement) {
  try {
    if (!(name in source)) {
      return () => {
      };
    }
    const original = source[name];
    const wrapped = replacement(original);
    if (typeof wrapped === "function") {
      wrapped.prototype = wrapped.prototype || {};
      Object.defineProperties(wrapped, {
        __rrweb_original__: {
          enumerable: false,
          value: original
        }
      });
    }
    source[name] = wrapped;
    return () => {
      source[name] = original;
    };
  } catch (_a) {
    return () => {
    };
  }
}
function getWindowHeight() {
  return window.innerHeight || document.documentElement && document.documentElement.clientHeight || document.body && document.body.clientHeight;
}
function getWindowWidth() {
  return window.innerWidth || document.documentElement && document.documentElement.clientWidth || document.body && document.body.clientWidth;
}
function isBlocked(node, blockClass, checkAncestors) {
  if (!node) {
    return false;
  }
  const el = node.nodeType === node.ELEMENT_NODE ? node : node.parentElement;
  if (!el)
    return false;
  if (typeof blockClass === "string") {
    if (el.classList.contains(blockClass))
      return true;
    if (checkAncestors && el.closest("." + blockClass) !== null)
      return true;
  } else {
    if (classMatchesRegex(el, blockClass, checkAncestors))
      return true;
  }
  return false;
}
function isSerialized(n, mirror) {
  return mirror.getId(n) !== -1;
}
function isIgnored(n, mirror) {
  return mirror.getId(n) === IGNORED_NODE;
}
function isAncestorRemoved(target, mirror) {
  if (isShadowRoot(target)) {
    return false;
  }
  const id = mirror.getId(target);
  if (!mirror.has(id)) {
    return true;
  }
  if (target.parentNode && target.parentNode.nodeType === target.DOCUMENT_NODE) {
    return false;
  }
  if (!target.parentNode) {
    return true;
  }
  return isAncestorRemoved(target.parentNode, mirror);
}
function isTouchEvent(event) {
  return Boolean(event.changedTouches);
}
function polyfill(win = window) {
  if ("NodeList" in win && !win.NodeList.prototype.forEach) {
    win.NodeList.prototype.forEach = Array.prototype.forEach;
  }
  if ("DOMTokenList" in win && !win.DOMTokenList.prototype.forEach) {
    win.DOMTokenList.prototype.forEach = Array.prototype.forEach;
  }
  if (!Node.prototype.contains) {
    Node.prototype.contains = (...args) => {
      let node = args[0];
      if (!(0 in args)) {
        throw new TypeError("1 argument is required");
      }
      do {
        if (this === node) {
          return true;
        }
      } while (node = node && node.parentNode);
      return false;
    };
  }
}
function isSerializedIframe(n, mirror) {
  return Boolean(n.nodeName === "IFRAME" && mirror.getMeta(n));
}
function isSerializedStylesheet(n, mirror) {
  return Boolean(n.nodeName === "LINK" && n.nodeType === n.ELEMENT_NODE && n.getAttribute && n.getAttribute("rel") === "stylesheet" && mirror.getMeta(n));
}
function hasShadowRoot(n) {
  return Boolean(n === null || n === void 0 ? void 0 : n.shadowRoot);
}

var EventType;
(function(EventType2) {
  EventType2[EventType2["DomContentLoaded"] = 0] = "DomContentLoaded";
  EventType2[EventType2["Load"] = 1] = "Load";
  EventType2[EventType2["FullSnapshot"] = 2] = "FullSnapshot";
  EventType2[EventType2["IncrementalSnapshot"] = 3] = "IncrementalSnapshot";
  EventType2[EventType2["Meta"] = 4] = "Meta";
  EventType2[EventType2["Custom"] = 5] = "Custom";
  EventType2[EventType2["Plugin"] = 6] = "Plugin";
})(EventType || (EventType = {}));
var IncrementalSource;
(function(IncrementalSource2) {
  IncrementalSource2[IncrementalSource2["Mutation"] = 0] = "Mutation";
  IncrementalSource2[IncrementalSource2["MouseMove"] = 1] = "MouseMove";
  IncrementalSource2[IncrementalSource2["MouseInteraction"] = 2] = "MouseInteraction";
  IncrementalSource2[IncrementalSource2["Scroll"] = 3] = "Scroll";
  IncrementalSource2[IncrementalSource2["ViewportResize"] = 4] = "ViewportResize";
  IncrementalSource2[IncrementalSource2["Input"] = 5] = "Input";
  IncrementalSource2[IncrementalSource2["TouchMove"] = 6] = "TouchMove";
  IncrementalSource2[IncrementalSource2["MediaInteraction"] = 7] = "MediaInteraction";
  IncrementalSource2[IncrementalSource2["StyleSheetRule"] = 8] = "StyleSheetRule";
  IncrementalSource2[IncrementalSource2["CanvasMutation"] = 9] = "CanvasMutation";
  IncrementalSource2[IncrementalSource2["Font"] = 10] = "Font";
  IncrementalSource2[IncrementalSource2["Log"] = 11] = "Log";
  IncrementalSource2[IncrementalSource2["Drag"] = 12] = "Drag";
  IncrementalSource2[IncrementalSource2["StyleDeclaration"] = 13] = "StyleDeclaration";
})(IncrementalSource || (IncrementalSource = {}));
var MouseInteractions;
(function(MouseInteractions2) {
  MouseInteractions2[MouseInteractions2["MouseUp"] = 0] = "MouseUp";
  MouseInteractions2[MouseInteractions2["MouseDown"] = 1] = "MouseDown";
  MouseInteractions2[MouseInteractions2["Click"] = 2] = "Click";
  MouseInteractions2[MouseInteractions2["ContextMenu"] = 3] = "ContextMenu";
  MouseInteractions2[MouseInteractions2["DblClick"] = 4] = "DblClick";
  MouseInteractions2[MouseInteractions2["Focus"] = 5] = "Focus";
  MouseInteractions2[MouseInteractions2["Blur"] = 6] = "Blur";
  MouseInteractions2[MouseInteractions2["TouchStart"] = 7] = "TouchStart";
  MouseInteractions2[MouseInteractions2["TouchMove_Departed"] = 8] = "TouchMove_Departed";
  MouseInteractions2[MouseInteractions2["TouchEnd"] = 9] = "TouchEnd";
  MouseInteractions2[MouseInteractions2["TouchCancel"] = 10] = "TouchCancel";
})(MouseInteractions || (MouseInteractions = {}));
var CanvasContext;
(function(CanvasContext2) {
  CanvasContext2[CanvasContext2["2D"] = 0] = "2D";
  CanvasContext2[CanvasContext2["WebGL"] = 1] = "WebGL";
  CanvasContext2[CanvasContext2["WebGL2"] = 2] = "WebGL2";
})(CanvasContext || (CanvasContext = {}));
var MediaInteractions;
(function(MediaInteractions2) {
  MediaInteractions2[MediaInteractions2["Play"] = 0] = "Play";
  MediaInteractions2[MediaInteractions2["Pause"] = 1] = "Pause";
  MediaInteractions2[MediaInteractions2["Seeked"] = 2] = "Seeked";
  MediaInteractions2[MediaInteractions2["VolumeChange"] = 3] = "VolumeChange";
})(MediaInteractions || (MediaInteractions = {}));
var ReplayerEvents;
(function(ReplayerEvents2) {
  ReplayerEvents2["Start"] = "start";
  ReplayerEvents2["Pause"] = "pause";
  ReplayerEvents2["Resume"] = "resume";
  ReplayerEvents2["Resize"] = "resize";
  ReplayerEvents2["Finish"] = "finish";
  ReplayerEvents2["FullsnapshotRebuilded"] = "fullsnapshot-rebuilded";
  ReplayerEvents2["LoadStylesheetStart"] = "load-stylesheet-start";
  ReplayerEvents2["LoadStylesheetEnd"] = "load-stylesheet-end";
  ReplayerEvents2["SkipStart"] = "skip-start";
  ReplayerEvents2["SkipEnd"] = "skip-end";
  ReplayerEvents2["MouseInteraction"] = "mouse-interaction";
  ReplayerEvents2["EventCast"] = "event-cast";
  ReplayerEvents2["CustomEvent"] = "custom-event";
  ReplayerEvents2["Flush"] = "flush";
  ReplayerEvents2["StateChange"] = "state-change";
  ReplayerEvents2["PlayBack"] = "play-back";
})(ReplayerEvents || (ReplayerEvents = {}));

function isNodeInLinkedList(n) {
  return "__ln" in n;
}
class DoubleLinkedList {
  constructor() {
    this.length = 0;
    this.head = null;
  }
  get(position) {
    if (position >= this.length) {
      throw new Error("Position outside of list range");
    }
    let current = this.head;
    for (let index = 0; index < position; index++) {
      current = (current === null || current === void 0 ? void 0 : current.next) || null;
    }
    return current;
  }
  addNode(n) {
    const node = {
      value: n,
      previous: null,
      next: null
    };
    n.__ln = node;
    if (n.previousSibling && isNodeInLinkedList(n.previousSibling)) {
      const current = n.previousSibling.__ln.next;
      node.next = current;
      node.previous = n.previousSibling.__ln;
      n.previousSibling.__ln.next = node;
      if (current) {
        current.previous = node;
      }
    } else if (n.nextSibling && isNodeInLinkedList(n.nextSibling) && n.nextSibling.__ln.previous) {
      const current = n.nextSibling.__ln.previous;
      node.previous = current;
      node.next = n.nextSibling.__ln;
      n.nextSibling.__ln.previous = node;
      if (current) {
        current.next = node;
      }
    } else {
      if (this.head) {
        this.head.previous = node;
      }
      node.next = this.head;
      this.head = node;
    }
    this.length++;
  }
  removeNode(n) {
    const current = n.__ln;
    if (!this.head) {
      return;
    }
    if (!current.previous) {
      this.head = current.next;
      if (this.head) {
        this.head.previous = null;
      }
    } else {
      current.previous.next = current.next;
      if (current.next) {
        current.next.previous = current.previous;
      }
    }
    if (n.__ln) {
      delete n.__ln;
    }
    this.length--;
  }
}
const moveKey = (id, parentId) => `${id}@${parentId}`;
class MutationBuffer {
  constructor() {
    this.frozen = false;
    this.locked = false;
    this.texts = [];
    this.attributes = [];
    this.removes = [];
    this.mapRemoves = [];
    this.movedMap = {};
    this.addedSet = /* @__PURE__ */ new Set();
    this.movedSet = /* @__PURE__ */ new Set();
    this.droppedSet = /* @__PURE__ */ new Set();
    this.processMutations = (mutations) => {
      mutations.forEach(this.processMutation);
      this.emit();
    };
    this.emit = () => {
      if (this.frozen || this.locked) {
        return;
      }
      const adds = [];
      const addList = new DoubleLinkedList();
      const getNextId = (n) => {
        let ns = n;
        let nextId = IGNORED_NODE;
        while (nextId === IGNORED_NODE) {
          ns = ns && ns.nextSibling;
          nextId = ns && this.mirror.getId(ns);
        }
        return nextId;
      };
      const pushAdd = (n) => {
        var _a, _b, _c, _d, _e;
        const shadowHost = n.getRootNode ? (_a = n.getRootNode()) === null || _a === void 0 ? void 0 : _a.host : null;
        let rootShadowHost = shadowHost;
        while ((_c = (_b = rootShadowHost === null || rootShadowHost === void 0 ? void 0 : rootShadowHost.getRootNode) === null || _b === void 0 ? void 0 : _b.call(rootShadowHost)) === null || _c === void 0 ? void 0 : _c.host)
          rootShadowHost = ((_e = (_d = rootShadowHost === null || rootShadowHost === void 0 ? void 0 : rootShadowHost.getRootNode) === null || _d === void 0 ? void 0 : _d.call(rootShadowHost)) === null || _e === void 0 ? void 0 : _e.host) || null;
        const notInDoc = !this.doc.contains(n) && (!rootShadowHost || !this.doc.contains(rootShadowHost));
        if (!n.parentNode || notInDoc) {
          return;
        }
        const parentId = isShadowRoot(n.parentNode) ? this.mirror.getId(shadowHost) : this.mirror.getId(n.parentNode);
        const nextId = getNextId(n);
        if (parentId === -1 || nextId === -1) {
          return addList.addNode(n);
        }
        const sn = serializeNodeWithId(n, {
          doc: this.doc,
          mirror: this.mirror,
          blockClass: this.blockClass,
          blockSelector: this.blockSelector,
          maskTextClass: this.maskTextClass,
          maskTextSelector: this.maskTextSelector,
          skipChild: true,
          newlyAddedElement: true,
          inlineStylesheet: this.inlineStylesheet,
          maskInputOptions: this.maskInputOptions,
          maskTextFn: this.maskTextFn,
          maskInputFn: this.maskInputFn,
          slimDOMOptions: this.slimDOMOptions,
          recordCanvas: this.recordCanvas,
          inlineImages: this.inlineImages,
          onSerialize: (currentN) => {
            if (isSerializedIframe(currentN, this.mirror)) {
              this.iframeManager.addIframe(currentN);
            }
            if (isSerializedStylesheet(currentN, this.mirror)) {
              this.stylesheetManager.addStylesheet(currentN);
            }
            if (hasShadowRoot(n)) {
              this.shadowDomManager.addShadowRoot(n.shadowRoot, document);
            }
          },
          onIframeLoad: (iframe, childSn) => {
            this.iframeManager.attachIframe(iframe, childSn, this.mirror);
            this.shadowDomManager.observeAttachShadow(iframe);
          },
          onStylesheetLoad: (link, childSn) => {
            this.stylesheetManager.attachStylesheet(link, childSn, this.mirror);
          }
        });
        if (sn) {
          adds.push({
            parentId,
            nextId,
            node: sn
          });
        }
      };
      while (this.mapRemoves.length) {
        this.mirror.removeNodeFromMap(this.mapRemoves.shift());
      }
      for (const n of Array.from(this.movedSet.values())) {
        if (isParentRemoved(this.removes, n, this.mirror) && !this.movedSet.has(n.parentNode)) {
          continue;
        }
        pushAdd(n);
      }
      for (const n of Array.from(this.addedSet.values())) {
        if (!isAncestorInSet(this.droppedSet, n) && !isParentRemoved(this.removes, n, this.mirror)) {
          pushAdd(n);
        } else if (isAncestorInSet(this.movedSet, n)) {
          pushAdd(n);
        } else {
          this.droppedSet.add(n);
        }
      }
      let candidate = null;
      while (addList.length) {
        let node = null;
        if (candidate) {
          const parentId = this.mirror.getId(candidate.value.parentNode);
          const nextId = getNextId(candidate.value);
          if (parentId !== -1 && nextId !== -1) {
            node = candidate;
          }
        }
        if (!node) {
          for (let index = addList.length - 1; index >= 0; index--) {
            const _node = addList.get(index);
            if (_node) {
              const parentId = this.mirror.getId(_node.value.parentNode);
              const nextId = getNextId(_node.value);
              if (parentId !== -1 && nextId !== -1) {
                node = _node;
                break;
              }
            }
          }
        }
        if (!node) {
          while (addList.head) {
            addList.removeNode(addList.head.value);
          }
          break;
        }
        candidate = node.previous;
        addList.removeNode(node.value);
        pushAdd(node.value);
      }
      const payload = {
        texts: this.texts.map((text) => ({
          id: this.mirror.getId(text.node),
          value: text.value
        })).filter((text) => this.mirror.has(text.id)),
        attributes: this.attributes.map((attribute) => ({
          id: this.mirror.getId(attribute.node),
          attributes: attribute.attributes
        })).filter((attribute) => this.mirror.has(attribute.id)),
        removes: this.removes,
        adds
      };
      if (!payload.texts.length && !payload.attributes.length && !payload.removes.length && !payload.adds.length) {
        return;
      }
      this.texts = [];
      this.attributes = [];
      this.removes = [];
      this.addedSet = /* @__PURE__ */ new Set();
      this.movedSet = /* @__PURE__ */ new Set();
      this.droppedSet = /* @__PURE__ */ new Set();
      this.movedMap = {};
      this.mutationCb(payload);
    };
    this.processMutation = (m) => {
      if (isIgnored(m.target, this.mirror)) {
        return;
      }
      switch (m.type) {
        case "characterData": {
          const value = m.target.textContent;
          if (!isBlocked(m.target, this.blockClass, false) && value !== m.oldValue) {
            this.texts.push({
              value: needMaskingText(m.target, this.maskTextClass, this.maskTextSelector) && value ? this.maskTextFn ? this.maskTextFn(value) : value.replace(/[\S]/g, "*") : value,
              node: m.target
            });
          }
          break;
        }
        case "attributes": {
          const target = m.target;
          let value = m.target.getAttribute(m.attributeName);
          if (m.attributeName === "value") {
            value = maskInputValue({
              maskInputOptions: this.maskInputOptions,
              tagName: m.target.tagName,
              type: m.target.getAttribute("type"),
              value,
              maskInputFn: this.maskInputFn
            });
          }
          if (isBlocked(m.target, this.blockClass, false) || value === m.oldValue) {
            return;
          }
          let item = this.attributes.find((a) => a.node === m.target);
          if (!item) {
            item = {
              node: m.target,
              attributes: {}
            };
            this.attributes.push(item);
          }
          if (m.attributeName === "style") {
            const old = this.doc.createElement("span");
            if (m.oldValue) {
              old.setAttribute("style", m.oldValue);
            }
            if (item.attributes.style === void 0 || item.attributes.style === null) {
              item.attributes.style = {};
            }
            const styleObj = item.attributes.style;
            for (const pname of Array.from(target.style)) {
              const newValue = target.style.getPropertyValue(pname);
              const newPriority = target.style.getPropertyPriority(pname);
              if (newValue !== old.style.getPropertyValue(pname) || newPriority !== old.style.getPropertyPriority(pname)) {
                if (newPriority === "") {
                  styleObj[pname] = newValue;
                } else {
                  styleObj[pname] = [newValue, newPriority];
                }
              }
            }
            for (const pname of Array.from(old.style)) {
              if (target.style.getPropertyValue(pname) === "") {
                styleObj[pname] = false;
              }
            }
          } else {
            item.attributes[m.attributeName] = transformAttribute(this.doc, m.target.tagName, m.attributeName, value);
          }
          break;
        }
        case "childList": {
          if (isBlocked(m.target, this.blockClass, true))
            return;
          m.addedNodes.forEach((n) => this.genAdds(n, m.target));
          m.removedNodes.forEach((n) => {
            const nodeId = this.mirror.getId(n);
            const parentId = isShadowRoot(m.target) ? this.mirror.getId(m.target.host) : this.mirror.getId(m.target);
            if (isBlocked(m.target, this.blockClass, false) || isIgnored(n, this.mirror) || !isSerialized(n, this.mirror)) {
              return;
            }
            if (this.addedSet.has(n)) {
              deepDelete(this.addedSet, n);
              this.droppedSet.add(n);
            } else if (this.addedSet.has(m.target) && nodeId === -1)
              ;
            else if (isAncestorRemoved(m.target, this.mirror))
              ;
            else if (this.movedSet.has(n) && this.movedMap[moveKey(nodeId, parentId)]) {
              deepDelete(this.movedSet, n);
            } else {
              this.removes.push({
                parentId,
                id: nodeId,
                isShadow: isShadowRoot(m.target) && isNativeShadowDom(m.target) ? true : void 0
              });
            }
            this.mapRemoves.push(n);
          });
          break;
        }
      }
    };
    this.genAdds = (n, target) => {
      if (this.mirror.hasNode(n)) {
        if (isIgnored(n, this.mirror)) {
          return;
        }
        this.movedSet.add(n);
        let targetId = null;
        if (target && this.mirror.hasNode(target)) {
          targetId = this.mirror.getId(target);
        }
        if (targetId && targetId !== -1) {
          this.movedMap[moveKey(this.mirror.getId(n), targetId)] = true;
        }
      } else {
        this.addedSet.add(n);
        this.droppedSet.delete(n);
      }
      if (!isBlocked(n, this.blockClass, false))
        n.childNodes.forEach((childN) => this.genAdds(childN));
    };
  }
  init(options) {
    [
      "mutationCb",
      "blockClass",
      "blockSelector",
      "maskTextClass",
      "maskTextSelector",
      "inlineStylesheet",
      "maskInputOptions",
      "maskTextFn",
      "maskInputFn",
      "recordCanvas",
      "inlineImages",
      "slimDOMOptions",
      "doc",
      "mirror",
      "iframeManager",
      "stylesheetManager",
      "shadowDomManager",
      "canvasManager"
    ].forEach((key) => {
      this[key] = options[key];
    });
  }
  freeze() {
    this.frozen = true;
    this.canvasManager.freeze();
  }
  unfreeze() {
    this.frozen = false;
    this.canvasManager.unfreeze();
    this.emit();
  }
  isFrozen() {
    return this.frozen;
  }
  lock() {
    this.locked = true;
    this.canvasManager.lock();
  }
  unlock() {
    this.locked = false;
    this.canvasManager.unlock();
    this.emit();
  }
  reset() {
    this.shadowDomManager.reset();
    this.canvasManager.reset();
  }
}
function deepDelete(addsSet, n) {
  addsSet.delete(n);
  n.childNodes.forEach((childN) => deepDelete(addsSet, childN));
}
function isParentRemoved(removes, n, mirror) {
  if (removes.length === 0)
    return false;
  return _isParentRemoved(removes, n, mirror);
}
function _isParentRemoved(removes, n, mirror) {
  const { parentNode } = n;
  if (!parentNode) {
    return false;
  }
  const parentId = mirror.getId(parentNode);
  if (removes.some((r) => r.id === parentId)) {
    return true;
  }
  return _isParentRemoved(removes, parentNode, mirror);
}
function isAncestorInSet(set, n) {
  if (set.size === 0)
    return false;
  return _isAncestorInSet(set, n);
}
function _isAncestorInSet(set, n) {
  const { parentNode } = n;
  if (!parentNode) {
    return false;
  }
  if (set.has(parentNode)) {
    return true;
  }
  return _isAncestorInSet(set, parentNode);
}

const mutationBuffers = [];
const isCSSGroupingRuleSupported = typeof CSSGroupingRule !== "undefined";
const isCSSMediaRuleSupported = typeof CSSMediaRule !== "undefined";
const isCSSSupportsRuleSupported = typeof CSSSupportsRule !== "undefined";
const isCSSConditionRuleSupported = typeof CSSConditionRule !== "undefined";
function getEventTarget(event) {
  try {
    if ("composedPath" in event) {
      const path = event.composedPath();
      if (path.length) {
        return path[0];
      }
    } else if ("path" in event && event.path.length) {
      return event.path[0];
    }
    return event.target;
  } catch (_a) {
    return event.target;
  }
}
function initMutationObserver(options, rootEl) {
  var _a, _b;
  const mutationBuffer = new MutationBuffer();
  mutationBuffers.push(mutationBuffer);
  mutationBuffer.init(options);
  let mutationObserverCtor = window.MutationObserver || window.__rrMutationObserver;
  const angularZoneSymbol = (_b = (_a = window === null || window === void 0 ? void 0 : window.Zone) === null || _a === void 0 ? void 0 : _a.__symbol__) === null || _b === void 0 ? void 0 : _b.call(_a, "MutationObserver");
  if (angularZoneSymbol && window[angularZoneSymbol]) {
    mutationObserverCtor = window[angularZoneSymbol];
  }
  const observer = new mutationObserverCtor(mutationBuffer.processMutations.bind(mutationBuffer));
  observer.observe(rootEl, {
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true,
    childList: true,
    subtree: true
  });
  return observer;
}
function initMoveObserver({ mousemoveCb, sampling, doc, mirror }) {
  if (sampling.mousemove === false) {
    return () => {
    };
  }
  const threshold = typeof sampling.mousemove === "number" ? sampling.mousemove : 50;
  const callbackThreshold = typeof sampling.mousemoveCallback === "number" ? sampling.mousemoveCallback : 500;
  let positions = [];
  let timeBaseline;
  const wrappedCb = throttle((source) => {
    const totalOffset = Date.now() - timeBaseline;
    mousemoveCb(positions.map((p) => {
      p.timeOffset -= totalOffset;
      return p;
    }), source);
    positions = [];
    timeBaseline = null;
  }, callbackThreshold);
  const updatePosition = throttle((evt) => {
    const target = getEventTarget(evt);
    const { clientX, clientY } = isTouchEvent(evt) ? evt.changedTouches[0] : evt;
    if (!timeBaseline) {
      timeBaseline = Date.now();
    }
    positions.push({
      x: clientX,
      y: clientY,
      id: mirror.getId(target),
      timeOffset: Date.now() - timeBaseline
    });
    wrappedCb(typeof DragEvent !== "undefined" && evt instanceof DragEvent ? IncrementalSource.Drag : evt instanceof MouseEvent ? IncrementalSource.MouseMove : IncrementalSource.TouchMove);
  }, threshold, {
    trailing: false
  });
  const handlers = [
    on("mousemove", updatePosition, doc),
    on("touchmove", updatePosition, doc),
    on("drag", updatePosition, doc)
  ];
  return () => {
    handlers.forEach((h) => h());
  };
}
function initMouseInteractionObserver({ mouseInteractionCb, doc, mirror, blockClass, sampling }) {
  if (sampling.mouseInteraction === false) {
    return () => {
    };
  }
  const disableMap = sampling.mouseInteraction === true || sampling.mouseInteraction === void 0 ? {} : sampling.mouseInteraction;
  const handlers = [];
  const getHandler = (eventKey) => {
    return (event) => {
      const target = getEventTarget(event);
      if (isBlocked(target, blockClass, true)) {
        return;
      }
      const e = isTouchEvent(event) ? event.changedTouches[0] : event;
      if (!e) {
        return;
      }
      const id = mirror.getId(target);
      const { clientX, clientY } = e;
      mouseInteractionCb({
        type: MouseInteractions[eventKey],
        id,
        x: clientX,
        y: clientY
      });
    };
  };
  Object.keys(MouseInteractions).filter((key) => Number.isNaN(Number(key)) && !key.endsWith("_Departed") && disableMap[key] !== false).forEach((eventKey) => {
    const eventName = eventKey.toLowerCase();
    const handler = getHandler(eventKey);
    handlers.push(on(eventName, handler, doc));
  });
  return () => {
    handlers.forEach((h) => h());
  };
}
function initScrollObserver({ scrollCb, doc, mirror, blockClass, sampling }) {
  const updatePosition = throttle((evt) => {
    const target = getEventTarget(evt);
    if (!target || isBlocked(target, blockClass, true)) {
      return;
    }
    const id = mirror.getId(target);
    if (target === doc) {
      const scrollEl = doc.scrollingElement || doc.documentElement;
      scrollCb({
        id,
        x: scrollEl.scrollLeft,
        y: scrollEl.scrollTop
      });
    } else {
      scrollCb({
        id,
        x: target.scrollLeft,
        y: target.scrollTop
      });
    }
  }, sampling.scroll || 100);
  return on("scroll", updatePosition, doc);
}
function initViewportResizeObserver({ viewportResizeCb }) {
  let lastH = -1;
  let lastW = -1;
  const updateDimension = throttle(() => {
    const height = getWindowHeight();
    const width = getWindowWidth();
    if (lastH !== height || lastW !== width) {
      viewportResizeCb({
        width: Number(width),
        height: Number(height)
      });
      lastH = height;
      lastW = width;
    }
  }, 200);
  return on("resize", updateDimension, window);
}
function wrapEventWithUserTriggeredFlag(v, enable) {
  const value = Object.assign({}, v);
  if (!enable)
    delete value.userTriggered;
  return value;
}
const INPUT_TAGS = ["INPUT", "TEXTAREA", "SELECT"];
const lastInputValueMap = /* @__PURE__ */ new WeakMap();
function initInputObserver({ inputCb, doc, mirror, blockClass, ignoreClass, maskInputOptions, maskInputFn, sampling, userTriggeredOnInput }) {
  function eventHandler(event) {
    let target = getEventTarget(event);
    const userTriggered = event.isTrusted;
    if (target && target.tagName === "OPTION")
      target = target.parentElement;
    if (!target || !target.tagName || INPUT_TAGS.indexOf(target.tagName) < 0 || isBlocked(target, blockClass, true)) {
      return;
    }
    const type = target.type;
    if (target.classList.contains(ignoreClass)) {
      return;
    }
    let text = target.value;
    let isChecked = false;
    if (type === "radio" || type === "checkbox") {
      isChecked = target.checked;
    } else if (maskInputOptions[target.tagName.toLowerCase()] || maskInputOptions[type]) {
      text = maskInputValue({
        maskInputOptions,
        tagName: target.tagName,
        type,
        value: text,
        maskInputFn
      });
    }
    cbWithDedup(target, wrapEventWithUserTriggeredFlag({ text, isChecked, userTriggered }, userTriggeredOnInput));
    const name = target.name;
    if (type === "radio" && name && isChecked) {
      doc.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach((el) => {
        if (el !== target) {
          cbWithDedup(el, wrapEventWithUserTriggeredFlag({
            text: el.value,
            isChecked: !isChecked,
            userTriggered: false
          }, userTriggeredOnInput));
        }
      });
    }
  }
  function cbWithDedup(target, v) {
    const lastInputValue = lastInputValueMap.get(target);
    if (!lastInputValue || lastInputValue.text !== v.text || lastInputValue.isChecked !== v.isChecked) {
      lastInputValueMap.set(target, v);
      const id = mirror.getId(target);
      inputCb(Object.assign(Object.assign({}, v), { id }));
    }
  }
  const events = sampling.input === "last" ? ["change"] : ["input", "change"];
  const handlers = events.map((eventName) => on(eventName, eventHandler, doc));
  const propertyDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  const hookProperties = [
    [HTMLInputElement.prototype, "value"],
    [HTMLInputElement.prototype, "checked"],
    [HTMLSelectElement.prototype, "value"],
    [HTMLTextAreaElement.prototype, "value"],
    [HTMLSelectElement.prototype, "selectedIndex"],
    [HTMLOptionElement.prototype, "selected"]
  ];
  if (propertyDescriptor && propertyDescriptor.set) {
    handlers.push(...hookProperties.map((p) => hookSetter(p[0], p[1], {
      set() {
        eventHandler({ target: this });
      }
    })));
  }
  return () => {
    handlers.forEach((h) => h());
  };
}
function getNestedCSSRulePositions(rule) {
  const positions = [];
  function recurse(childRule, pos) {
    if (isCSSGroupingRuleSupported && childRule.parentRule instanceof CSSGroupingRule || isCSSMediaRuleSupported && childRule.parentRule instanceof CSSMediaRule || isCSSSupportsRuleSupported && childRule.parentRule instanceof CSSSupportsRule || isCSSConditionRuleSupported && childRule.parentRule instanceof CSSConditionRule) {
      const rules = Array.from(childRule.parentRule.cssRules);
      const index = rules.indexOf(childRule);
      pos.unshift(index);
    } else {
      const rules = Array.from(childRule.parentStyleSheet.cssRules);
      const index = rules.indexOf(childRule);
      pos.unshift(index);
    }
    return pos;
  }
  return recurse(rule, positions);
}
function initStyleSheetObserver({ styleSheetRuleCb, mirror }, { win }) {
  const insertRule = win.CSSStyleSheet.prototype.insertRule;
  win.CSSStyleSheet.prototype.insertRule = function(rule, index) {
    const id = mirror.getId(this.ownerNode);
    if (id !== -1) {
      styleSheetRuleCb({
        id,
        adds: [{ rule, index }]
      });
    }
    return insertRule.apply(this, [rule, index]);
  };
  const deleteRule = win.CSSStyleSheet.prototype.deleteRule;
  win.CSSStyleSheet.prototype.deleteRule = function(index) {
    const id = mirror.getId(this.ownerNode);
    if (id !== -1) {
      styleSheetRuleCb({
        id,
        removes: [{ index }]
      });
    }
    return deleteRule.apply(this, [index]);
  };
  const supportedNestedCSSRuleTypes = {};
  if (isCSSGroupingRuleSupported) {
    supportedNestedCSSRuleTypes.CSSGroupingRule = win.CSSGroupingRule;
  } else {
    if (isCSSMediaRuleSupported) {
      supportedNestedCSSRuleTypes.CSSMediaRule = win.CSSMediaRule;
    }
    if (isCSSConditionRuleSupported) {
      supportedNestedCSSRuleTypes.CSSConditionRule = win.CSSConditionRule;
    }
    if (isCSSSupportsRuleSupported) {
      supportedNestedCSSRuleTypes.CSSSupportsRule = win.CSSSupportsRule;
    }
  }
  const unmodifiedFunctions = {};
  Object.entries(supportedNestedCSSRuleTypes).forEach(([typeKey, type]) => {
    unmodifiedFunctions[typeKey] = {
      insertRule: type.prototype.insertRule,
      deleteRule: type.prototype.deleteRule
    };
    type.prototype.insertRule = function(rule, index) {
      const id = mirror.getId(this.parentStyleSheet.ownerNode);
      if (id !== -1) {
        styleSheetRuleCb({
          id,
          adds: [
            {
              rule,
              index: [
                ...getNestedCSSRulePositions(this),
                index || 0
              ]
            }
          ]
        });
      }
      return unmodifiedFunctions[typeKey].insertRule.apply(this, [rule, index]);
    };
    type.prototype.deleteRule = function(index) {
      const id = mirror.getId(this.parentStyleSheet.ownerNode);
      if (id !== -1) {
        styleSheetRuleCb({
          id,
          removes: [
            { index: [...getNestedCSSRulePositions(this), index] }
          ]
        });
      }
      return unmodifiedFunctions[typeKey].deleteRule.apply(this, [index]);
    };
  });
  return () => {
    win.CSSStyleSheet.prototype.insertRule = insertRule;
    win.CSSStyleSheet.prototype.deleteRule = deleteRule;
    Object.entries(supportedNestedCSSRuleTypes).forEach(([typeKey, type]) => {
      type.prototype.insertRule = unmodifiedFunctions[typeKey].insertRule;
      type.prototype.deleteRule = unmodifiedFunctions[typeKey].deleteRule;
    });
  };
}
function initStyleDeclarationObserver({ styleDeclarationCb, mirror }, { win }) {
  const setProperty = win.CSSStyleDeclaration.prototype.setProperty;
  win.CSSStyleDeclaration.prototype.setProperty = function(property, value, priority) {
    var _a, _b;
    const id = mirror.getId((_b = (_a = this.parentRule) === null || _a === void 0 ? void 0 : _a.parentStyleSheet) === null || _b === void 0 ? void 0 : _b.ownerNode);
    if (id !== -1) {
      styleDeclarationCb({
        id,
        set: {
          property,
          value,
          priority
        },
        index: getNestedCSSRulePositions(this.parentRule)
      });
    }
    return setProperty.apply(this, [property, value, priority]);
  };
  const removeProperty = win.CSSStyleDeclaration.prototype.removeProperty;
  win.CSSStyleDeclaration.prototype.removeProperty = function(property) {
    var _a, _b;
    const id = mirror.getId((_b = (_a = this.parentRule) === null || _a === void 0 ? void 0 : _a.parentStyleSheet) === null || _b === void 0 ? void 0 : _b.ownerNode);
    if (id !== -1) {
      styleDeclarationCb({
        id,
        remove: {
          property
        },
        index: getNestedCSSRulePositions(this.parentRule)
      });
    }
    return removeProperty.apply(this, [property]);
  };
  return () => {
    win.CSSStyleDeclaration.prototype.setProperty = setProperty;
    win.CSSStyleDeclaration.prototype.removeProperty = removeProperty;
  };
}
function initMediaInteractionObserver({ mediaInteractionCb, blockClass, mirror, sampling }) {
  const handler = (type) => throttle((event) => {
    const target = getEventTarget(event);
    if (!target || isBlocked(target, blockClass, true)) {
      return;
    }
    const { currentTime, volume, muted } = target;
    mediaInteractionCb({
      type,
      id: mirror.getId(target),
      currentTime,
      volume,
      muted
    });
  }, sampling.media || 500);
  const handlers = [
    on("play", handler(0)),
    on("pause", handler(1)),
    on("seeked", handler(2)),
    on("volumechange", handler(3))
  ];
  return () => {
    handlers.forEach((h) => h());
  };
}
function initFontObserver({ fontCb, doc }) {
  const win = doc.defaultView;
  if (!win) {
    return () => {
    };
  }
  const handlers = [];
  const fontMap = /* @__PURE__ */ new WeakMap();
  const originalFontFace = win.FontFace;
  win.FontFace = function FontFace(family, source, descriptors) {
    const fontFace = new originalFontFace(family, source, descriptors);
    fontMap.set(fontFace, {
      family,
      buffer: typeof source !== "string",
      descriptors,
      fontSource: typeof source === "string" ? source : JSON.stringify(Array.from(new Uint8Array(source)))
    });
    return fontFace;
  };
  const restoreHandler = patch(doc.fonts, "add", function(original) {
    return function(fontFace) {
      setTimeout(() => {
        const p = fontMap.get(fontFace);
        if (p) {
          fontCb(p);
          fontMap.delete(fontFace);
        }
      }, 0);
      return original.apply(this, [fontFace]);
    };
  });
  handlers.push(() => {
    win.FontFace = originalFontFace;
  });
  handlers.push(restoreHandler);
  return () => {
    handlers.forEach((h) => h());
  };
}
function mergeHooks(o, hooks) {
  const { mutationCb, mousemoveCb, mouseInteractionCb, scrollCb, viewportResizeCb, inputCb, mediaInteractionCb, styleSheetRuleCb, styleDeclarationCb, canvasMutationCb, fontCb } = o;
  o.mutationCb = (...p) => {
    if (hooks.mutation) {
      hooks.mutation(...p);
    }
    mutationCb(...p);
  };
  o.mousemoveCb = (...p) => {
    if (hooks.mousemove) {
      hooks.mousemove(...p);
    }
    mousemoveCb(...p);
  };
  o.mouseInteractionCb = (...p) => {
    if (hooks.mouseInteraction) {
      hooks.mouseInteraction(...p);
    }
    mouseInteractionCb(...p);
  };
  o.scrollCb = (...p) => {
    if (hooks.scroll) {
      hooks.scroll(...p);
    }
    scrollCb(...p);
  };
  o.viewportResizeCb = (...p) => {
    if (hooks.viewportResize) {
      hooks.viewportResize(...p);
    }
    viewportResizeCb(...p);
  };
  o.inputCb = (...p) => {
    if (hooks.input) {
      hooks.input(...p);
    }
    inputCb(...p);
  };
  o.mediaInteractionCb = (...p) => {
    if (hooks.mediaInteaction) {
      hooks.mediaInteaction(...p);
    }
    mediaInteractionCb(...p);
  };
  o.styleSheetRuleCb = (...p) => {
    if (hooks.styleSheetRule) {
      hooks.styleSheetRule(...p);
    }
    styleSheetRuleCb(...p);
  };
  o.styleDeclarationCb = (...p) => {
    if (hooks.styleDeclaration) {
      hooks.styleDeclaration(...p);
    }
    styleDeclarationCb(...p);
  };
  o.canvasMutationCb = (...p) => {
    if (hooks.canvasMutation) {
      hooks.canvasMutation(...p);
    }
    canvasMutationCb(...p);
  };
  o.fontCb = (...p) => {
    if (hooks.font) {
      hooks.font(...p);
    }
    fontCb(...p);
  };
}
function initObservers(o, hooks = {}) {
  const currentWindow = o.doc.defaultView;
  if (!currentWindow) {
    return () => {
    };
  }
  mergeHooks(o, hooks);
  const mutationObserver = initMutationObserver(o, o.doc);
  const mousemoveHandler = initMoveObserver(o);
  const mouseInteractionHandler = initMouseInteractionObserver(o);
  const scrollHandler = initScrollObserver(o);
  const viewportResizeHandler = initViewportResizeObserver(o);
  const inputHandler = initInputObserver(o);
  const mediaInteractionHandler = initMediaInteractionObserver(o);
  const styleSheetObserver = initStyleSheetObserver(o, { win: currentWindow });
  const styleDeclarationObserver = initStyleDeclarationObserver(o, {
    win: currentWindow
  });
  const fontObserver = o.collectFonts ? initFontObserver(o) : () => {
  };
  const pluginHandlers = [];
  for (const plugin of o.plugins) {
    pluginHandlers.push(plugin.observer(plugin.callback, currentWindow, plugin.options));
  }
  return () => {
    mutationBuffers.forEach((b) => b.reset());
    mutationObserver.disconnect();
    mousemoveHandler();
    mouseInteractionHandler();
    scrollHandler();
    viewportResizeHandler();
    inputHandler();
    mediaInteractionHandler();
    styleSheetObserver();
    styleDeclarationObserver();
    fontObserver();
    pluginHandlers.forEach((h) => h());
  };
}

class IframeManager {
  constructor(options) {
    this.iframes = /* @__PURE__ */ new WeakMap();
    this.mutationCb = options.mutationCb;
  }
  addIframe(iframeEl) {
    this.iframes.set(iframeEl, true);
  }
  addLoadListener(cb) {
    this.loadListener = cb;
  }
  attachIframe(iframeEl, childSn, mirror) {
    var _a;
    this.mutationCb({
      adds: [
        {
          parentId: mirror.getId(iframeEl),
          nextId: null,
          node: childSn
        }
      ],
      removes: [],
      texts: [],
      attributes: [],
      isAttachIframe: true
    });
    (_a = this.loadListener) === null || _a === void 0 ? void 0 : _a.call(this, iframeEl);
  }
}

class ShadowDomManager {
  constructor(options) {
    this.restorePatches = [];
    this.mutationCb = options.mutationCb;
    this.scrollCb = options.scrollCb;
    this.bypassOptions = options.bypassOptions;
    this.mirror = options.mirror;
    const manager = this;
    this.restorePatches.push(patch(HTMLElement.prototype, "attachShadow", function(original) {
      return function(option) {
        const shadowRoot = original.call(this, option);
        if (this.shadowRoot)
          manager.addShadowRoot(this.shadowRoot, this.ownerDocument);
        return shadowRoot;
      };
    }));
  }
  addShadowRoot(shadowRoot, doc) {
    if (!isNativeShadowDom(shadowRoot))
      return;
    initMutationObserver(Object.assign(Object.assign({}, this.bypassOptions), { doc, mutationCb: this.mutationCb, mirror: this.mirror, shadowDomManager: this }), shadowRoot);
    initScrollObserver(Object.assign(Object.assign({}, this.bypassOptions), { scrollCb: this.scrollCb, doc: shadowRoot, mirror: this.mirror }));
  }
  observeAttachShadow(iframeElement) {
    if (iframeElement.contentWindow) {
      const manager = this;
      this.restorePatches.push(patch(iframeElement.contentWindow.HTMLElement.prototype, "attachShadow", function(original) {
        return function(option) {
          const shadowRoot = original.call(this, option);
          if (this.shadowRoot)
            manager.addShadowRoot(this.shadowRoot, iframeElement.contentDocument);
          return shadowRoot;
        };
      }));
    }
  }
  reset() {
    this.restorePatches.forEach((restorePatch) => restorePatch());
  }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function __rest(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
for (var i$1 = 0; i$1 < chars.length; i$1++) {
  lookup[chars.charCodeAt(i$1)] = i$1;
}
var encode = function(arraybuffer) {
  var bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = "";
  for (i = 0; i < len; i += 3) {
    base64 += chars[bytes[i] >> 2];
    base64 += chars[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
    base64 += chars[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
    base64 += chars[bytes[i + 2] & 63];
  }
  if (len % 3 === 2) {
    base64 = base64.substring(0, base64.length - 1) + "=";
  } else if (len % 3 === 1) {
    base64 = base64.substring(0, base64.length - 2) + "==";
  }
  return base64;
};

const canvasVarMap = /* @__PURE__ */ new Map();
function variableListFor(ctx, ctor) {
  let contextMap = canvasVarMap.get(ctx);
  if (!contextMap) {
    contextMap = /* @__PURE__ */ new Map();
    canvasVarMap.set(ctx, contextMap);
  }
  if (!contextMap.has(ctor)) {
    contextMap.set(ctor, []);
  }
  return contextMap.get(ctor);
}
const saveWebGLVar = (value, win, ctx) => {
  if (!value || !(isInstanceOfWebGLObject(value, win) || typeof value === "object"))
    return;
  const name = value.constructor.name;
  const list = variableListFor(ctx, name);
  let index = list.indexOf(value);
  if (index === -1) {
    index = list.length;
    list.push(value);
  }
  return index;
};
function serializeArg(value, win, ctx) {
  if (value instanceof Array) {
    return value.map((arg) => serializeArg(arg, win, ctx));
  } else if (value === null) {
    return value;
  } else if (value instanceof Float32Array || value instanceof Float64Array || value instanceof Int32Array || value instanceof Uint32Array || value instanceof Uint8Array || value instanceof Uint16Array || value instanceof Int16Array || value instanceof Int8Array || value instanceof Uint8ClampedArray) {
    const name = value.constructor.name;
    return {
      rr_type: name,
      args: [Object.values(value)]
    };
  } else if (value instanceof ArrayBuffer) {
    const name = value.constructor.name;
    const base64 = encode(value);
    return {
      rr_type: name,
      base64
    };
  } else if (value instanceof DataView) {
    const name = value.constructor.name;
    return {
      rr_type: name,
      args: [
        serializeArg(value.buffer, win, ctx),
        value.byteOffset,
        value.byteLength
      ]
    };
  } else if (value instanceof HTMLImageElement) {
    const name = value.constructor.name;
    const { src } = value;
    return {
      rr_type: name,
      src
    };
  } else if (value instanceof HTMLCanvasElement) {
    const name = "HTMLImageElement";
    const src = value.toDataURL();
    return {
      rr_type: name,
      src
    };
  } else if (value instanceof ImageData) {
    const name = value.constructor.name;
    return {
      rr_type: name,
      args: [serializeArg(value.data, win, ctx), value.width, value.height]
    };
  } else if (isInstanceOfWebGLObject(value, win) || typeof value === "object") {
    const name = value.constructor.name;
    const index = saveWebGLVar(value, win, ctx);
    return {
      rr_type: name,
      index
    };
  }
  return value;
}
const serializeArgs = (args, win, ctx) => {
  return [...args].map((arg) => serializeArg(arg, win, ctx));
};
const isInstanceOfWebGLObject = (value, win) => {
  const webGLConstructorNames = [
    "WebGLActiveInfo",
    "WebGLBuffer",
    "WebGLFramebuffer",
    "WebGLProgram",
    "WebGLRenderbuffer",
    "WebGLShader",
    "WebGLShaderPrecisionFormat",
    "WebGLTexture",
    "WebGLUniformLocation",
    "WebGLVertexArrayObject",
    "WebGLVertexArrayObjectOES"
  ];
  const supportedWebGLConstructorNames = webGLConstructorNames.filter((name) => typeof win[name] === "function");
  return Boolean(supportedWebGLConstructorNames.find((name) => value instanceof win[name]));
};

function initCanvas2DMutationObserver(cb, win, blockClass, mirror) {
  const handlers = [];
  const props2D = Object.getOwnPropertyNames(win.CanvasRenderingContext2D.prototype);
  for (const prop of props2D) {
    try {
      if (typeof win.CanvasRenderingContext2D.prototype[prop] !== "function") {
        continue;
      }
      const restoreHandler = patch(win.CanvasRenderingContext2D.prototype, prop, function(original) {
        return function(...args) {
          if (!isBlocked(this.canvas, blockClass, true)) {
            setTimeout(() => {
              const recordArgs = serializeArgs([...args], win, this);
              cb(this.canvas, {
                type: CanvasContext["2D"],
                property: prop,
                args: recordArgs
              });
            }, 0);
          }
          return original.apply(this, args);
        };
      });
      handlers.push(restoreHandler);
    } catch (_a) {
      const hookHandler = hookSetter(win.CanvasRenderingContext2D.prototype, prop, {
        set(v) {
          cb(this.canvas, {
            type: CanvasContext["2D"],
            property: prop,
            args: [v],
            setter: true
          });
        }
      });
      handlers.push(hookHandler);
    }
  }
  return () => {
    handlers.forEach((h) => h());
  };
}

function initCanvasContextObserver(win, blockClass) {
  const handlers = [];
  try {
    const restoreHandler = patch(win.HTMLCanvasElement.prototype, "getContext", function(original) {
      return function(contextType, ...args) {
        if (!isBlocked(this, blockClass, true)) {
          if (!("__context" in this))
            this.__context = contextType;
        }
        return original.apply(this, [contextType, ...args]);
      };
    });
    handlers.push(restoreHandler);
  } catch (_a) {
    console.error("failed to patch HTMLCanvasElement.prototype.getContext");
  }
  return () => {
    handlers.forEach((h) => h());
  };
}

function patchGLPrototype(prototype, type, cb, blockClass, mirror, win) {
  const handlers = [];
  const props = Object.getOwnPropertyNames(prototype);
  for (const prop of props) {
    try {
      if (typeof prototype[prop] !== "function") {
        continue;
      }
      const restoreHandler = patch(prototype, prop, function(original) {
        return function(...args) {
          const result = original.apply(this, args);
          saveWebGLVar(result, win, prototype);
          if (!isBlocked(this.canvas, blockClass, true)) {
            const recordArgs = serializeArgs([...args], win, prototype);
            const mutation = {
              type,
              property: prop,
              args: recordArgs
            };
            cb(this.canvas, mutation);
          }
          return result;
        };
      });
      handlers.push(restoreHandler);
    } catch (_a) {
      const hookHandler = hookSetter(prototype, prop, {
        set(v) {
          cb(this.canvas, {
            type,
            property: prop,
            args: [v],
            setter: true
          });
        }
      });
      handlers.push(hookHandler);
    }
  }
  return handlers;
}
function initCanvasWebGLMutationObserver(cb, win, blockClass, mirror) {
  const handlers = [];
  handlers.push(...patchGLPrototype(win.WebGLRenderingContext.prototype, CanvasContext.WebGL, cb, blockClass, mirror, win));
  if (typeof win.WebGL2RenderingContext !== "undefined") {
    handlers.push(...patchGLPrototype(win.WebGL2RenderingContext.prototype, CanvasContext.WebGL2, cb, blockClass, mirror, win));
  }
  return () => {
    handlers.forEach((h) => h());
  };
}

var WorkerClass = null;
try {
  var WorkerThreads = typeof module !== "undefined" && typeof module.require === "function" && module.require("worker_threads") || typeof __non_webpack_require__ === "function" && __non_webpack_require__("worker_threads") || typeof require === "function" && require("worker_threads");
  WorkerClass = WorkerThreads.Worker;
} catch (e) {
}

function decodeBase64$1(base64, enableUnicode) {
  return Buffer.from(base64, "base64").toString(enableUnicode ? "utf16" : "utf8");
}
function createBase64WorkerFactory$2(base64, sourcemapArg, enableUnicodeArg) {
  var sourcemap = sourcemapArg === void 0 ? null : sourcemapArg;
  var enableUnicode = enableUnicodeArg === void 0 ? false : enableUnicodeArg;
  var source = decodeBase64$1(base64, enableUnicode);
  var start = source.indexOf("\n", 10) + 1;
  var body = source.substring(start) + (sourcemap ? "//# sourceMappingURL=" + sourcemap : "");
  return function WorkerFactory(options) {
    return new WorkerClass(body, Object.assign({}, options, { eval: true }));
  };
}

function decodeBase64(base64, enableUnicode) {
  var binaryString = atob(base64);
  if (enableUnicode) {
    var binaryView = new Uint8Array(binaryString.length);
    for (var i = 0, n = binaryString.length; i < n; ++i) {
      binaryView[i] = binaryString.charCodeAt(i);
    }
    return String.fromCharCode.apply(null, new Uint16Array(binaryView.buffer));
  }
  return binaryString;
}
function createURL(base64, sourcemapArg, enableUnicodeArg) {
  var sourcemap = sourcemapArg === void 0 ? null : sourcemapArg;
  var enableUnicode = enableUnicodeArg === void 0 ? false : enableUnicodeArg;
  var source = decodeBase64(base64, enableUnicode);
  var start = source.indexOf("\n", 10) + 1;
  var body = source.substring(start) + (sourcemap ? "//# sourceMappingURL=" + sourcemap : "");
  var blob = new Blob([body], { type: "application/javascript" });
  return URL.createObjectURL(blob);
}
function createBase64WorkerFactory$1(base64, sourcemapArg, enableUnicodeArg) {
  var url;
  return function WorkerFactory(options) {
    url = url || createURL(base64, sourcemapArg, enableUnicodeArg);
    return new Worker(url, options);
  };
}

var kIsNodeJS = Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
function isNodeJS() {
  return kIsNodeJS;
}

function createBase64WorkerFactory(base64, sourcemapArg, enableUnicodeArg) {
  if (isNodeJS()) {
    return createBase64WorkerFactory$2(base64, sourcemapArg, enableUnicodeArg);
  }
  return createBase64WorkerFactory$1(base64, sourcemapArg, enableUnicodeArg);
}

var WorkerFactory = createBase64WorkerFactory("Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICAgJ3VzZSBzdHJpY3QnOwoKICAgIC8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKg0KICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLg0KDQogICAgUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55DQogICAgcHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLg0KDQogICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICJBUyBJUyIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEgNCiAgICBSRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkNCiAgICBBTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsDQogICAgSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NDQogICAgTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1INCiAgICBPVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SDQogICAgUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS4NCiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqLw0KDQogICAgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikgew0KICAgICAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH0NCiAgICAgICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7DQogICAgICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9DQogICAgICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvclsidGhyb3ciXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9DQogICAgICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfQ0KICAgICAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpOw0KICAgICAgICB9KTsNCiAgICB9CgogICAgLyoKICAgICAqIGJhc2U2NC1hcnJheWJ1ZmZlciAxLjAuMSA8aHR0cHM6Ly9naXRodWIuY29tL25pa2xhc3ZoL2Jhc2U2NC1hcnJheWJ1ZmZlcj4KICAgICAqIENvcHlyaWdodCAoYykgMjAyMSBOaWtsYXMgdm9uIEhlcnR6ZW4gPGh0dHBzOi8vaGVydHplbi5jb20+CiAgICAgKiBSZWxlYXNlZCB1bmRlciBNSVQgTGljZW5zZQogICAgICovCiAgICB2YXIgY2hhcnMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7CiAgICAvLyBVc2UgYSBsb29rdXAgdGFibGUgdG8gZmluZCB0aGUgaW5kZXguCiAgICB2YXIgbG9va3VwID0gdHlwZW9mIFVpbnQ4QXJyYXkgPT09ICd1bmRlZmluZWQnID8gW10gOiBuZXcgVWludDhBcnJheSgyNTYpOwogICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFycy5sZW5ndGg7IGkrKykgewogICAgICAgIGxvb2t1cFtjaGFycy5jaGFyQ29kZUF0KGkpXSA9IGk7CiAgICB9CiAgICB2YXIgZW5jb2RlID0gZnVuY3Rpb24gKGFycmF5YnVmZmVyKSB7CiAgICAgICAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlidWZmZXIpLCBpLCBsZW4gPSBieXRlcy5sZW5ndGgsIGJhc2U2NCA9ICcnOwogICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gMykgewogICAgICAgICAgICBiYXNlNjQgKz0gY2hhcnNbYnl0ZXNbaV0gPj4gMl07CiAgICAgICAgICAgIGJhc2U2NCArPSBjaGFyc1soKGJ5dGVzW2ldICYgMykgPDwgNCkgfCAoYnl0ZXNbaSArIDFdID4+IDQpXTsKICAgICAgICAgICAgYmFzZTY0ICs9IGNoYXJzWygoYnl0ZXNbaSArIDFdICYgMTUpIDw8IDIpIHwgKGJ5dGVzW2kgKyAyXSA+PiA2KV07CiAgICAgICAgICAgIGJhc2U2NCArPSBjaGFyc1tieXRlc1tpICsgMl0gJiA2M107CiAgICAgICAgfQogICAgICAgIGlmIChsZW4gJSAzID09PSAyKSB7CiAgICAgICAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDEpICsgJz0nOwogICAgICAgIH0KICAgICAgICBlbHNlIGlmIChsZW4gJSAzID09PSAxKSB7CiAgICAgICAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDIpICsgJz09JzsKICAgICAgICB9CiAgICAgICAgcmV0dXJuIGJhc2U2NDsKICAgIH07CgogICAgY29uc3QgbGFzdEJsb2JNYXAgPSBuZXcgTWFwKCk7DQogICAgY29uc3QgdHJhbnNwYXJlbnRCbG9iTWFwID0gbmV3IE1hcCgpOw0KICAgIGZ1bmN0aW9uIGdldFRyYW5zcGFyZW50QmxvYkZvcih3aWR0aCwgaGVpZ2h0KSB7DQogICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7DQogICAgICAgICAgICBjb25zdCBpZCA9IGAke3dpZHRofS0ke2hlaWdodH1gOw0KICAgICAgICAgICAgaWYgKHRyYW5zcGFyZW50QmxvYk1hcC5oYXMoaWQpKQ0KICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc3BhcmVudEJsb2JNYXAuZ2V0KGlkKTsNCiAgICAgICAgICAgIGNvbnN0IG9mZnNjcmVlbiA9IG5ldyBPZmZzY3JlZW5DYW52YXMod2lkdGgsIGhlaWdodCk7DQogICAgICAgICAgICBvZmZzY3JlZW4uZ2V0Q29udGV4dCgnMmQnKTsNCiAgICAgICAgICAgIGNvbnN0IGJsb2IgPSB5aWVsZCBvZmZzY3JlZW4uY29udmVydFRvQmxvYigpOw0KICAgICAgICAgICAgY29uc3QgYXJyYXlCdWZmZXIgPSB5aWVsZCBibG9iLmFycmF5QnVmZmVyKCk7DQogICAgICAgICAgICBjb25zdCBiYXNlNjQgPSBlbmNvZGUoYXJyYXlCdWZmZXIpOw0KICAgICAgICAgICAgdHJhbnNwYXJlbnRCbG9iTWFwLnNldChpZCwgYmFzZTY0KTsNCiAgICAgICAgICAgIHJldHVybiBiYXNlNjQ7DQogICAgICAgIH0pOw0KICAgIH0NCiAgICBjb25zdCB3b3JrZXIgPSBzZWxmOw0KICAgIHdvcmtlci5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZSkgew0KICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgew0KICAgICAgICAgICAgaWYgKCEoJ09mZnNjcmVlbkNhbnZhcycgaW4gZ2xvYmFsVGhpcykpDQogICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlci5wb3N0TWVzc2FnZSh7IGlkOiBlLmRhdGEuaWQgfSk7DQogICAgICAgICAgICBjb25zdCB7IGlkLCBiaXRtYXAsIHdpZHRoLCBoZWlnaHQgfSA9IGUuZGF0YTsNCiAgICAgICAgICAgIGNvbnN0IHRyYW5zcGFyZW50QmFzZTY0ID0gZ2V0VHJhbnNwYXJlbnRCbG9iRm9yKHdpZHRoLCBoZWlnaHQpOw0KICAgICAgICAgICAgY29uc3Qgb2Zmc2NyZWVuID0gbmV3IE9mZnNjcmVlbkNhbnZhcyh3aWR0aCwgaGVpZ2h0KTsNCiAgICAgICAgICAgIGNvbnN0IGN0eCA9IG9mZnNjcmVlbi5nZXRDb250ZXh0KCcyZCcpOw0KICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShiaXRtYXAsIDAsIDApOw0KICAgICAgICAgICAgYml0bWFwLmNsb3NlKCk7DQogICAgICAgICAgICBjb25zdCBibG9iID0geWllbGQgb2Zmc2NyZWVuLmNvbnZlcnRUb0Jsb2IoKTsNCiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBibG9iLnR5cGU7DQogICAgICAgICAgICBjb25zdCBhcnJheUJ1ZmZlciA9IHlpZWxkIGJsb2IuYXJyYXlCdWZmZXIoKTsNCiAgICAgICAgICAgIGNvbnN0IGJhc2U2NCA9IGVuY29kZShhcnJheUJ1ZmZlcik7DQogICAgICAgICAgICBpZiAoIWxhc3RCbG9iTWFwLmhhcyhpZCkgJiYgKHlpZWxkIHRyYW5zcGFyZW50QmFzZTY0KSA9PT0gYmFzZTY0KSB7DQogICAgICAgICAgICAgICAgbGFzdEJsb2JNYXAuc2V0KGlkLCBiYXNlNjQpOw0KICAgICAgICAgICAgICAgIHJldHVybiB3b3JrZXIucG9zdE1lc3NhZ2UoeyBpZCB9KTsNCiAgICAgICAgICAgIH0NCiAgICAgICAgICAgIGlmIChsYXN0QmxvYk1hcC5nZXQoaWQpID09PSBiYXNlNjQpDQogICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlci5wb3N0TWVzc2FnZSh7IGlkIH0pOw0KICAgICAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHsNCiAgICAgICAgICAgICAgICBpZCwNCiAgICAgICAgICAgICAgICB0eXBlLA0KICAgICAgICAgICAgICAgIGJhc2U2NCwNCiAgICAgICAgICAgICAgICB3aWR0aCwNCiAgICAgICAgICAgICAgICBoZWlnaHQsDQogICAgICAgICAgICB9KTsNCiAgICAgICAgICAgIGxhc3RCbG9iTWFwLnNldChpZCwgYmFzZTY0KTsNCiAgICAgICAgfSk7DQogICAgfTsKCn0pKCk7Cgo=", null, false);

class CanvasManager {
  constructor(options) {
    this.pendingCanvasMutations = /* @__PURE__ */ new Map();
    this.rafStamps = { latestId: 0, invokeId: null };
    this.frozen = false;
    this.locked = false;
    this.processMutation = (target, mutation) => {
      const newFrame = this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId;
      if (newFrame || !this.rafStamps.invokeId)
        this.rafStamps.invokeId = this.rafStamps.latestId;
      if (!this.pendingCanvasMutations.has(target)) {
        this.pendingCanvasMutations.set(target, []);
      }
      this.pendingCanvasMutations.get(target).push(mutation);
    };
    const { sampling = "all", win, blockClass, recordCanvas } = options;
    this.mutationCb = options.mutationCb;
    this.mirror = options.mirror;
    if (recordCanvas && sampling === "all")
      this.initCanvasMutationObserver(win, blockClass);
    if (recordCanvas && typeof sampling === "number")
      this.initCanvasFPSObserver(sampling, win, blockClass);
  }
  reset() {
    this.pendingCanvasMutations.clear();
    this.resetObservers && this.resetObservers();
  }
  freeze() {
    this.frozen = true;
  }
  unfreeze() {
    this.frozen = false;
  }
  lock() {
    this.locked = true;
  }
  unlock() {
    this.locked = false;
  }
  initCanvasFPSObserver(fps, win, blockClass) {
    const canvasContextReset = initCanvasContextObserver(win, blockClass);
    const snapshotInProgressMap = /* @__PURE__ */ new Map();
    const worker = new WorkerFactory();
    worker.onmessage = (e) => {
      const { id } = e.data;
      snapshotInProgressMap.set(id, false);
      if (!("base64" in e.data))
        return;
      const { base64, type, width, height } = e.data;
      this.mutationCb({
        id,
        type: CanvasContext["2D"],
        commands: [
          {
            property: "clearRect",
            args: [0, 0, width, height]
          },
          {
            property: "drawImage",
            args: [
              {
                rr_type: "ImageBitmap",
                args: [
                  {
                    rr_type: "Blob",
                    data: [{ rr_type: "ArrayBuffer", base64 }],
                    type
                  }
                ]
              },
              0,
              0
            ]
          }
        ]
      });
    };
    const timeBetweenSnapshots = 1e3 / fps;
    let lastSnapshotTime = 0;
    let rafId;
    const takeCanvasSnapshots = (timestamp) => {
      if (lastSnapshotTime && timestamp - lastSnapshotTime < timeBetweenSnapshots) {
        rafId = requestAnimationFrame(takeCanvasSnapshots);
        return;
      }
      lastSnapshotTime = timestamp;
      win.document.querySelectorAll(`canvas:not(.${blockClass} *)`).forEach((canvas) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        const id = this.mirror.getId(canvas);
        if (snapshotInProgressMap.get(id))
          return;
        snapshotInProgressMap.set(id, true);
        if (["webgl", "webgl2"].includes(canvas.__context)) {
          const context = canvas.getContext(canvas.__context);
          if (((_a = context === null || context === void 0 ? void 0 : context.getContextAttributes()) === null || _a === void 0 ? void 0 : _a.preserveDrawingBuffer) === false) {
            context === null || context === void 0 ? void 0 : context.clear(context.COLOR_BUFFER_BIT);
          }
        }
        const bitmap = yield createImageBitmap(canvas);
        worker.postMessage({
          id,
          bitmap,
          width: canvas.width,
          height: canvas.height
        }, [bitmap]);
      }));
      rafId = requestAnimationFrame(takeCanvasSnapshots);
    };
    rafId = requestAnimationFrame(takeCanvasSnapshots);
    this.resetObservers = () => {
      canvasContextReset();
      cancelAnimationFrame(rafId);
    };
  }
  initCanvasMutationObserver(win, blockClass) {
    this.startRAFTimestamping();
    this.startPendingCanvasMutationFlusher();
    const canvasContextReset = initCanvasContextObserver(win, blockClass);
    const canvas2DReset = initCanvas2DMutationObserver(this.processMutation.bind(this), win, blockClass, this.mirror);
    const canvasWebGL1and2Reset = initCanvasWebGLMutationObserver(this.processMutation.bind(this), win, blockClass, this.mirror);
    this.resetObservers = () => {
      canvasContextReset();
      canvas2DReset();
      canvasWebGL1and2Reset();
    };
  }
  startPendingCanvasMutationFlusher() {
    requestAnimationFrame(() => this.flushPendingCanvasMutations());
  }
  startRAFTimestamping() {
    const setLatestRAFTimestamp = (timestamp) => {
      this.rafStamps.latestId = timestamp;
      requestAnimationFrame(setLatestRAFTimestamp);
    };
    requestAnimationFrame(setLatestRAFTimestamp);
  }
  flushPendingCanvasMutations() {
    this.pendingCanvasMutations.forEach((values, canvas) => {
      const id = this.mirror.getId(canvas);
      this.flushPendingCanvasMutationFor(canvas, id);
    });
    requestAnimationFrame(() => this.flushPendingCanvasMutations());
  }
  flushPendingCanvasMutationFor(canvas, id) {
    if (this.frozen || this.locked) {
      return;
    }
    const valuesWithType = this.pendingCanvasMutations.get(canvas);
    if (!valuesWithType || id === -1)
      return;
    const values = valuesWithType.map((value) => {
      const rest = __rest(value, ["type"]);
      return rest;
    });
    const { type } = valuesWithType[0];
    this.mutationCb({ id, type, commands: values });
    this.pendingCanvasMutations.delete(canvas);
  }
}

class StylesheetManager {
  constructor(options) {
    this.trackedStylesheets = /* @__PURE__ */ new WeakSet();
    this.mutationCb = options.mutationCb;
  }
  addStylesheet(linkEl) {
    if (this.trackedStylesheets.has(linkEl))
      return;
    this.trackedStylesheets.add(linkEl);
    this.trackStylesheet(linkEl);
  }
  trackStylesheet(linkEl) {
  }
  attachStylesheet(linkEl, childSn, mirror) {
    this.mutationCb({
      adds: [
        {
          parentId: mirror.getId(linkEl),
          nextId: null,
          node: childSn
        }
      ],
      removes: [],
      texts: [],
      attributes: []
    });
    this.addStylesheet(linkEl);
  }
}

function wrapEvent(e) {
  return Object.assign(Object.assign({}, e), { timestamp: Date.now() });
}
let wrappedEmit;
let takeFullSnapshot;
const mirror = createMirror();
function record(options = {}) {
  const { emit, checkoutEveryNms, checkoutEveryNth, blockClass = "rr-block", blockSelector = null, ignoreClass = "rr-ignore", maskTextClass = "rr-mask", maskTextSelector = null, inlineStylesheet = true, maskAllInputs, maskInputOptions: _maskInputOptions, slimDOMOptions: _slimDOMOptions, maskInputFn, maskTextFn, hooks, packFn, sampling = {}, mousemoveWait, recordCanvas = false, userTriggeredOnInput = false, collectFonts = false, inlineImages = false, plugins, keepIframeSrcFn = () => false } = options;
  if (!emit) {
    throw new Error("emit function is required");
  }
  if (mousemoveWait !== void 0 && sampling.mousemove === void 0) {
    sampling.mousemove = mousemoveWait;
  }
  mirror.reset();
  const maskInputOptions = maskAllInputs === true ? {
    color: true,
    date: true,
    "datetime-local": true,
    email: true,
    month: true,
    number: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    time: true,
    url: true,
    week: true,
    textarea: true,
    select: true,
    password: true
  } : _maskInputOptions !== void 0 ? _maskInputOptions : { password: true };
  const slimDOMOptions = _slimDOMOptions === true || _slimDOMOptions === "all" ? {
    script: true,
    comment: true,
    headFavicon: true,
    headWhitespace: true,
    headMetaSocial: true,
    headMetaRobots: true,
    headMetaHttpEquiv: true,
    headMetaVerification: true,
    headMetaAuthorship: _slimDOMOptions === "all",
    headMetaDescKeywords: _slimDOMOptions === "all"
  } : _slimDOMOptions ? _slimDOMOptions : {};
  polyfill();
  let lastFullSnapshotEvent;
  let incrementalSnapshotCount = 0;
  const eventProcessor = (e) => {
    for (const plugin of plugins || []) {
      if (plugin.eventProcessor) {
        e = plugin.eventProcessor(e);
      }
    }
    if (packFn) {
      e = packFn(e);
    }
    return e;
  };
  wrappedEmit = (e, isCheckout) => {
    var _a;
    if (((_a = mutationBuffers[0]) === null || _a === void 0 ? void 0 : _a.isFrozen()) && e.type !== EventType.FullSnapshot && !(e.type === EventType.IncrementalSnapshot && e.data.source === IncrementalSource.Mutation)) {
      mutationBuffers.forEach((buf) => buf.unfreeze());
    }
    emit(eventProcessor(e), isCheckout);
    if (e.type === EventType.FullSnapshot) {
      lastFullSnapshotEvent = e;
      incrementalSnapshotCount = 0;
    } else if (e.type === EventType.IncrementalSnapshot) {
      if (e.data.source === IncrementalSource.Mutation && e.data.isAttachIframe) {
        return;
      }
      incrementalSnapshotCount++;
      const exceedCount = checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
      const exceedTime = checkoutEveryNms && e.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;
      if (exceedCount || exceedTime) {
        takeFullSnapshot(true);
      }
    }
  };
  const wrappedMutationEmit = (m) => {
    wrappedEmit(wrapEvent({
      type: EventType.IncrementalSnapshot,
      data: Object.assign({ source: IncrementalSource.Mutation }, m)
    }));
  };
  const wrappedScrollEmit = (p) => wrappedEmit(wrapEvent({
    type: EventType.IncrementalSnapshot,
    data: Object.assign({ source: IncrementalSource.Scroll }, p)
  }));
  const wrappedCanvasMutationEmit = (p) => wrappedEmit(wrapEvent({
    type: EventType.IncrementalSnapshot,
    data: Object.assign({ source: IncrementalSource.CanvasMutation }, p)
  }));
  const iframeManager = new IframeManager({
    mutationCb: wrappedMutationEmit
  });
  const stylesheetManager = new StylesheetManager({
    mutationCb: wrappedMutationEmit
  });
  const canvasManager = new CanvasManager({
    recordCanvas,
    mutationCb: wrappedCanvasMutationEmit,
    win: window,
    blockClass,
    mirror,
    sampling: sampling.canvas
  });
  const shadowDomManager = new ShadowDomManager({
    mutationCb: wrappedMutationEmit,
    scrollCb: wrappedScrollEmit,
    bypassOptions: {
      blockClass,
      blockSelector,
      maskTextClass,
      maskTextSelector,
      inlineStylesheet,
      maskInputOptions,
      maskTextFn,
      maskInputFn,
      recordCanvas,
      inlineImages,
      sampling,
      slimDOMOptions,
      iframeManager,
      stylesheetManager,
      canvasManager
    },
    mirror
  });
  takeFullSnapshot = (isCheckout = false) => {
    var _a, _b, _c, _d;
    wrappedEmit(wrapEvent({
      type: EventType.Meta,
      data: {
        href: window.location.href,
        width: getWindowWidth(),
        height: getWindowHeight()
      }
    }), isCheckout);
    mutationBuffers.forEach((buf) => buf.lock());
    const node = snapshot(document, {
      mirror,
      blockClass,
      blockSelector,
      maskTextClass,
      maskTextSelector,
      inlineStylesheet,
      maskAllInputs: maskInputOptions,
      maskTextFn,
      slimDOM: slimDOMOptions,
      recordCanvas,
      inlineImages,
      onSerialize: (n) => {
        if (isSerializedIframe(n, mirror)) {
          iframeManager.addIframe(n);
        }
        if (isSerializedStylesheet(n, mirror)) {
          stylesheetManager.addStylesheet(n);
        }
        if (hasShadowRoot(n)) {
          shadowDomManager.addShadowRoot(n.shadowRoot, document);
        }
      },
      onIframeLoad: (iframe, childSn) => {
        iframeManager.attachIframe(iframe, childSn, mirror);
        shadowDomManager.observeAttachShadow(iframe);
      },
      onStylesheetLoad: (linkEl, childSn) => {
        stylesheetManager.attachStylesheet(linkEl, childSn, mirror);
      },
      keepIframeSrcFn
    });
    if (!node) {
      return console.warn("Failed to snapshot the document");
    }
    wrappedEmit(wrapEvent({
      type: EventType.FullSnapshot,
      data: {
        node,
        initialOffset: {
          left: window.pageXOffset !== void 0 ? window.pageXOffset : (document === null || document === void 0 ? void 0 : document.documentElement.scrollLeft) || ((_b = (_a = document === null || document === void 0 ? void 0 : document.body) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.scrollLeft) || (document === null || document === void 0 ? void 0 : document.body.scrollLeft) || 0,
          top: window.pageYOffset !== void 0 ? window.pageYOffset : (document === null || document === void 0 ? void 0 : document.documentElement.scrollTop) || ((_d = (_c = document === null || document === void 0 ? void 0 : document.body) === null || _c === void 0 ? void 0 : _c.parentElement) === null || _d === void 0 ? void 0 : _d.scrollTop) || (document === null || document === void 0 ? void 0 : document.body.scrollTop) || 0
        }
      }
    }));
    mutationBuffers.forEach((buf) => buf.unlock());
  };
  try {
    const handlers = [];
    handlers.push(on("DOMContentLoaded", () => {
      wrappedEmit(wrapEvent({
        type: EventType.DomContentLoaded,
        data: {}
      }));
    }));
    const observe = (doc) => {
      var _a;
      return initObservers({
        mutationCb: wrappedMutationEmit,
        mousemoveCb: (positions, source) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: {
            source,
            positions
          }
        })),
        mouseInteractionCb: (d) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.MouseInteraction }, d)
        })),
        scrollCb: wrappedScrollEmit,
        viewportResizeCb: (d) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.ViewportResize }, d)
        })),
        inputCb: (v) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.Input }, v)
        })),
        mediaInteractionCb: (p) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.MediaInteraction }, p)
        })),
        styleSheetRuleCb: (r) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.StyleSheetRule }, r)
        })),
        styleDeclarationCb: (r) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.StyleDeclaration }, r)
        })),
        canvasMutationCb: wrappedCanvasMutationEmit,
        fontCb: (p) => wrappedEmit(wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.Font }, p)
        })),
        blockClass,
        ignoreClass,
        maskTextClass,
        maskTextSelector,
        maskInputOptions,
        inlineStylesheet,
        sampling,
        recordCanvas,
        inlineImages,
        userTriggeredOnInput,
        collectFonts,
        doc,
        maskInputFn,
        maskTextFn,
        blockSelector,
        slimDOMOptions,
        mirror,
        iframeManager,
        stylesheetManager,
        shadowDomManager,
        canvasManager,
        plugins: ((_a = plugins === null || plugins === void 0 ? void 0 : plugins.filter((p) => p.observer)) === null || _a === void 0 ? void 0 : _a.map((p) => ({
          observer: p.observer,
          options: p.options,
          callback: (payload) => wrappedEmit(wrapEvent({
            type: EventType.Plugin,
            data: {
              plugin: p.name,
              payload
            }
          }))
        }))) || []
      }, hooks);
    };
    iframeManager.addLoadListener((iframeEl) => {
      handlers.push(observe(iframeEl.contentDocument));
    });
    const init = () => {
      takeFullSnapshot();
      handlers.push(observe(document));
    };
    if (document.readyState === "interactive" || document.readyState === "complete") {
      init();
    } else {
      handlers.push(on("load", () => {
        wrappedEmit(wrapEvent({
          type: EventType.Load,
          data: {}
        }));
        init();
      }, window));
    }
    return () => {
      handlers.forEach((h) => h());
    };
  } catch (error) {
    console.warn(error);
  }
}
record.addCustomEvent = (tag, payload) => {
  if (!wrappedEmit) {
    throw new Error("please add custom event after start recording");
  }
  wrappedEmit(wrapEvent({
    type: EventType.Custom,
    data: {
      tag,
      payload
    }
  }));
};
record.freezePage = () => {
  mutationBuffers.forEach((buf) => buf.freeze());
};
record.takeFullSnapshot = (isCheckout) => {
  if (!takeFullSnapshot) {
    throw new Error("please take full snapshot after start recording");
  }
  takeFullSnapshot(isCheckout);
};
record.mirror = mirror;

var NodeType$1;
(function(NodeType2) {
  NodeType2[NodeType2["Document"] = 0] = "Document";
  NodeType2[NodeType2["DocumentType"] = 1] = "DocumentType";
  NodeType2[NodeType2["Element"] = 2] = "Element";
  NodeType2[NodeType2["Text"] = 3] = "Text";
  NodeType2[NodeType2["CDATA"] = 4] = "CDATA";
  NodeType2[NodeType2["Comment"] = 5] = "Comment";
})(NodeType$1 || (NodeType$1 = {}));
var NodeType;
(function(NodeType2) {
  NodeType2[NodeType2["PLACEHOLDER"] = 0] = "PLACEHOLDER";
  NodeType2[NodeType2["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
  NodeType2[NodeType2["ATTRIBUTE_NODE"] = 2] = "ATTRIBUTE_NODE";
  NodeType2[NodeType2["TEXT_NODE"] = 3] = "TEXT_NODE";
  NodeType2[NodeType2["CDATA_SECTION_NODE"] = 4] = "CDATA_SECTION_NODE";
  NodeType2[NodeType2["ENTITY_REFERENCE_NODE"] = 5] = "ENTITY_REFERENCE_NODE";
  NodeType2[NodeType2["ENTITY_NODE"] = 6] = "ENTITY_NODE";
  NodeType2[NodeType2["PROCESSING_INSTRUCTION_NODE"] = 7] = "PROCESSING_INSTRUCTION_NODE";
  NodeType2[NodeType2["COMMENT_NODE"] = 8] = "COMMENT_NODE";
  NodeType2[NodeType2["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
  NodeType2[NodeType2["DOCUMENT_TYPE_NODE"] = 10] = "DOCUMENT_TYPE_NODE";
  NodeType2[NodeType2["DOCUMENT_FRAGMENT_NODE"] = 11] = "DOCUMENT_FRAGMENT_NODE";
})(NodeType || (NodeType = {}));
var StyleRuleType;
(function(StyleRuleType2) {
  StyleRuleType2[StyleRuleType2["Insert"] = 0] = "Insert";
  StyleRuleType2[StyleRuleType2["Remove"] = 1] = "Remove";
  StyleRuleType2[StyleRuleType2["Snapshot"] = 2] = "Snapshot";
  StyleRuleType2[StyleRuleType2["SetProperty"] = 3] = "SetProperty";
  StyleRuleType2[StyleRuleType2["RemoveProperty"] = 4] = "RemoveProperty";
})(StyleRuleType || (StyleRuleType = {}));

var u8 = Uint8Array, u16 = Uint16Array, u32 = Uint32Array;
var fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0]);
var fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  var r = new u32(b[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j = b[i]; j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return [b, r];
};
var _a = freb(fleb, 2), fl = _a[0], revfl = _a[1];
fl[28] = 258, revfl[258] = 28;
freb(fdeb, 0);
var rev = new u16(32768);
for (var i = 0; i < 32768; ++i) {
  var x = (i & 43690) >>> 1 | (i & 21845) << 1;
  x = (x & 52428) >>> 2 | (x & 13107) << 2;
  x = (x & 61680) >>> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >>> 8 | (x & 255) << 8) >>> 1;
}
var flt = new u8(288);
for (var i = 0; i < 144; ++i)
  flt[i] = 8;
for (var i = 144; i < 256; ++i)
  flt[i] = 9;
for (var i = 256; i < 280; ++i)
  flt[i] = 7;
for (var i = 280; i < 288; ++i)
  flt[i] = 8;
var fdt = new u8(32);
for (var i = 0; i < 32; ++i)
  fdt[i] = 5;

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var n;
!function(t2) {
  t2[t2.NotStarted = 0] = "NotStarted", t2[t2.Running = 1] = "Running", t2[t2.Stopped = 2] = "Stopped";
}(n || (n = {}));

let sessionReplayStack = [];
const initSessionReplay = (maskProperties = {}) => {
  record({
    emit(event) {
      sessionReplayStack.push(event);
    },
    blockClass: "g-block",
    ignoreClass: "g-ignore",
    maskTextClass: "g-mask",
    ...maskProperties
  });
};
const getSessionReplayStack = () => {
  return JSON.stringify(sessionReplayStack);
};
const resetSessionReplay = () => {
  sessionReplayStack = [];
};

const checkIfExist = () => {
  return typeof window !== "undefined" && typeof document !== "undefined" && typeof location !== "undefined" && typeof localStorage !== "undefined" && typeof Date !== "undefined";
};
const getStacksGlobally = () => {
  let winObj = window;
  const errorStack = getErrorStacks(), clickStack2 = getClickStack(), userAgent = getUserAgent(), deadClickStack = getDeadClickStack(), rageClickStack = getRageClickStack(), sessionReplayStack = getSessionReplayStack(), consoleStack = getConsoleStack(), networkStack = getNetworkStack(), locationStack = getLocationStack(), customErrorStack = getCustomErrorStack();
  winObj["errorStack"] = errorStack;
  winObj["clickStack"] = clickStack2;
  winObj["broswerInfo"] = userAgent;
  winObj["deadClickStack"] = deadClickStack;
  winObj["rageClickStack"] = rageClickStack;
  winObj["networkStack"] = networkStack;
  winObj["locationStack"] = locationStack;
  const contents = [
    ...errorStack,
    ...clickStack2,
    ...rageClickStack,
    ...deadClickStack,
    ...JSON.parse(sessionReplayStack),
    ...consoleStack,
    ...locationStack,
    ...customErrorStack,
    ...locationStack
  ];
  if (userAgent) {
    contents.push(userAgent);
  }
  if (!contents.length) {
    return null;
  }
  return {
    errorStack,
    clickStack: clickStack2,
    userAgent,
    rageClickStack,
    deadClickStack,
    sessionReplayStack,
    consoleStack,
    networkStack,
    locationStack,
    customErrorStack
  };
};
const init = async ({
  projectId,
  host,
  maskProperties
}) => {
  if (!checkIfExist()) {
    return;
  }
  try {
    const sessionInstance = Session.getInstance();
    sessionInstance.projectId = projectId;
    await sessionInstance.createSession(host);
    initErrorListner();
    initClick();
    initNetwork();
    initSessionReplay(maskProperties);
    initConsoleEvents();
    initLocationChange();
    const stacks = getStacksGlobally();
    sessionInstance.emitEventInInterval(stacks, 1e4, () => {
      resetDeadClickStack();
      resetErrorStack();
      resetRageClickStack();
      resetClickStack();
      resetSessionReplay();
      resetConsoleStack();
      resetNetworkStack();
      resetUserAgent();
      resetCustomErrorStack();
      resetLocationEvent();
    });
  } catch (e) {
  }
};
const identify = (user) => {
  Session.getInstance().user = user;
};
const Garuda = {
  init,
  identify
};

exports.Garuda = Garuda;
exports.checkIfExist = checkIfExist;
exports.getStacksGlobally = getStacksGlobally;

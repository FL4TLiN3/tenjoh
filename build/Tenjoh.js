'use strict';

var Tenjoh = function() {
    var self = this;
    self.addComponent = function(name, fn, object) {
        var index = name.indexOf('.');
        if (isUndefined(object)) object = self;
        if (index == -1) {
            object[name] = fn();
        } else {
            if (isUndefined(object[name.slice(0, index)])) object[name.slice(0, index)] = {};
            self.addComponent(name.slice(index + 1), fn, object[name.slice(0, index)]);
        }
    };
    self.__widgets = {};
    self.addWidget = function(name, fn) {
        if (isEmpty(self.__widgets[name])) {
            self.__widgets[name] = fn;
        }
    };
    self.getWidget = function(name, partial) {
        var widget = new self.__widgets[name]();
        widget.__caller = partial;
        return widget;
    };
    self.uniqueId = function() {
        return parseInt(Math.random() * 1000 * 1000).toString(16);
    };
};

var $boolean                = 'boolean',
    $console                = 'console',
    $length                 = 'length',
    $name                   = 'name',
    $object                 = 'object',
    $string                 = 'string',
    $number                 = 'number',
    $undefined              = 'undefined',
    Error                   = window.Error,
    $root,                  // delay binding
    $tenjoh                 = window.$tenjoh || (window.$tenjoh = new Tenjoh());

(function(global){
    "use strict";
    if (Object.clone) return;
    if (!Object.create || 'valueOf' in Object.create(null)){
        return new Error('ECMAScript 5 needed');
    }
    var slice                       = Array.prototype.slice,
        isArray                     = Array.isArray,
        defineProperty              = Object.defineProperty,
        getPrototypeOf              = Object.getPrototypeOf,
        getOwnPropertyNames         = Object.getOwnPropertyNames,
        getOwnPropertyDescriptor    = Object.getOwnPropertyDescriptor,
        hasOwnProperty              = Object.prototype.hasOwnProperty,
        toString                    = Object.prototype.toString;
    /* descriptor factory */
    var noEnum = function(v){
        return {
            value:v,
            enumerable:false,
            writable:true,
            configurable:true
        };
    };
    var isPrimitive = (function(types){
        return function isPrimitive(o){
            return typeof(o) in types || o === null
        }
    })({
        'null':1, 'undefined':1, 'boolean':1, 'number':1, 'string':1
    });
    var isFunction = function isFunction(o){
        return typeof(o) === 'function';
        /* toString.call(o) === '[object Function]'; */
    };

    /* return as is, shallow or deep -- primitives + function */
    [Boolean, Number, String, Function].forEach(function (cf){
        defineProperty(cf.prototype, 'clone', noEnum(function clone(deep){
            return this.valueOf();
        }));
    });

    /* deep copy by new */
    [Date].forEach(function (cf){
        defineProperty(cf.prototype, 'clone', noEnum(function clone(deep){
            return deep ? new this.constructor(this) : this
        }));
    });
    /* general-purpose clone */
    var cloneObject = function clone(src, deep, noProto){
        if (isPrimitive(src)) return src;
        if (isArray(src) || isFunction(src)) return src.clone(deep, noProto);
        var proto = getPrototypeOf(src);
        if (proto){
            if (typeof(proto.cloneNode) === 'function')
                return src.cloneNode(deep);
            if (!noProto && hasOwnProperty.call(proto, 'clone'))
                return proto.clone.call(src, deep, noProto);
        }
        /* faithfully copy each property */
        var dst = Object.create(proto);
        getOwnPropertyNames(src).forEach(function(k){
            var desc = getOwnPropertyDescriptor(src, k);
            if (desc){ /* maybe undefined on Android :( */
                /* getters and setters are not deep-copied */
                if (deep && 'value' in desc)
                    desc.value = clone(src[k], deep, noProto);
                defineProperty(dst, k, desc);
            }else{
                dst[k] = clone(src[k], deep, noProto);
            }
        });
        return dst;
    };
    /* install methods */
    defineProperty(Array.prototype, 'clone', noEnum(function clone(deep, noProto){
        return !deep ? slice.call(this)
            : this.map(function(elem){
            return cloneObject(elem, deep, noProto);
        });
    }));
    defineProperty(Object.prototype, 'clone', noEnum(function clone(deep){
        return cloneObject(this, deep, true);
    }));
    defineProperty(Object, 'isPrimitive', noEnum(isPrimitive));
    defineProperty(Object, 'clone', noEnum(cloneObject));
})(this);
String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ""); };
String.prototype.replaceAll = function (org, dest) { return this.split(org).join(dest); };
String.prototype.replaceFirst = function (org, dest) {
    var result;
    if (this.indexOf(org) != -1) {
        result = this.slice(0, this.indexOf(org));
        result = result + dest;
        result = result + this.slice(this.indexOf(org) + org.length);
        return result;
    } else {
        return this;
    }
};

function noop() {}
function now() { return new Date().getTime(); }
function lowercase(string) { return isString(string) ? string.toLowerCase() : string; }
function uppercase(string) { return isString(string) ? string.toUpperCase() : string; }
function isUndefined(_var) { return typeof _var === $undefined; }
function isDefined(_var) { return typeof _var !== $undefined; }
function isObject(value) { return value != null && typeof value == $object  && !isArray(value); }
function isTypeObject(value) { return value != null && typeof value == $object  && !isArray(value); }
function isArray(value) { return Object.prototype.toString.apply(value) == '[object Array]'; }
function isNumber(value) { return typeof value == 'number'; }
function isString(value) { return typeof value == $string; }
function isFunction(_var) { return typeof _var == 'function'; }
function isBoolean(value) { return typeof value == $boolean; }
function isEmpty(_var) { return isUndefined(_var) || _var == null || isEmptyObject(_var); }
function isEmptyObject(_var) { return typeof _var == $object && _var.length == 0 }
function getRandomArbitary(min, max) { return Math.random() * (max - min) + min; }
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function forEach(obj, iterator, context) {
    var key;
    if (obj) {
        if (isFunction(obj)) {
            for (key in obj) {
                if (key != 'prototype' && key != $length && key != $name
                        && obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        } else if (obj.forEach && obj.forEach !== forEach) {
            obj.forEach(iterator, context);
        } else if (isObject(obj) && isNumber(obj.length)) {
            for (key = 0; key < obj.length; key++)
                iterator.call(context, obj[key], key);
        } else {
            for (key in obj)
                iterator.call(context, obj[key], key);
        }
    }
    return obj;
}

function sortedKeys(obj) {
    var keys = [];
    for ( var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys.sort();
}

function forEachSorted(obj, iterator, context) {
    var keys = sortedKeys(obj);
    for ( var i = 0; i < keys.length; i++) {
        iterator.call(context, obj[keys[i]], keys[i]);
    }
    return keys;
}
function zeroPadding(string, length) {
    while (string.length < length) {
        string = '0' + string;
    }
    return string;
}
window.sprintf || (function() {
    var _BITS = { i: 0x8011, d: 0x8011, u: 0x8021, o: 0x8161, x: 0x8261, X: 0x9261, f: 0x92, c: 0x2800, s: 0x84 },
        _PARSE = /%(?:(\d+)\$)?(#|0)?(\d+)?(?:\.(\d+))?(l)?([%iduoxXfcs])/g;
    window.sprintf = _sprintf;
    function _sprintf(format) {
        function _fmt(m, argidx, flag, width, prec, size, types) {
            if (types === "%") { return "%"; }
            var v = "", w = _BITS[types], overflow, pad;
            idx = argidx ? parseInt(argidx) : next++;
            w & 0x400 || (v = (av[idx] === void 0) ? "" : av[idx]);
            w & 3 && (v = (w & 1) ? parseInt(v) : parseFloat(v), v = isNaN(v) ? "": v);
            w & 4 && (v = ((types === "s" ? v : types) || "").toString());
            w & 0x20  && (v = (v >= 0) ? v : v % 0x100000000 + 0x100000000);
            w & 0x300 && (v = v.toString(w & 0x100 ? 8 : 16));
            w & 0x40  && (flag === "#") && (v = ((w & 0x100) ? "0" : "0x") + v);
            w & 0x80  && prec && (v = (w & 2) ? v.toFixed(prec) : v.slice(0, prec));
            w & 0x6000 && (overflow = (typeof v !== "number" || v < 0));
            w & 0x2000 && (v = overflow ? "" : String.fromCharCode(v));
            w & 0x8000 && (flag = (flag === "0") ? "" : flag);
            v = w & 0x1000 ? v.toString().toUpperCase() : v.toString();
            if (!(w & 0x800 || width === void 0 || v.length >= width)) {
                pad = Array(width - v.length + 1).join(!flag ? " " : flag === "#" ? " " : flag);
                v = ((w & 0x10 && flag === "0") && !v.indexOf("-")) ? ("-" + pad + v.slice(1)) : (pad + v);
            }
            return v;
        }
        var next = 1, idx = 0, av = arguments;
        return format.replace(_PARSE, _fmt);
    }
})();

$tenjoh.addComponent('Array', function() {
    var Array = function() {
        var self = this;
        self.hasValue = function(array, value) {
            var result = false;
            for (var i = 0; i < array.length; i++) {
                if (array[i] == value) result = true;
            }
            return result;
        };
        self.merge = function(array1, array2) {
            for (var i = 0; i < array2.length; i++) {
                if (!self.hasValue(array1, array2[i])) array1.push(array2[i]);
            }
            return array1;
        };
    }

    return new Array();
});
$tenjoh.addComponent('DOM', function() {
    var DOM = function() {
        var self = this;
        var inputTags = ['input', 'textarea', 'select', 'button'];
        self.getValue = function(element) {
            if (element.nodeName == 'INPUT') {
                switch (element.type) {
                    case 'img':
                        return element.getAttribute('src');
                    case 'text':
                    case 'password':
                    case 'radio':
                    case 'button':
                    case 'submit':
                    case 'reset':
                    case 'hidden':
                        return element.value;
                    case 'checkbox':
                        return element.checked;
                }
            } else if (element.nodeName == 'TEXTAREA' ||
                       element.nodeName == 'SELECT' ||
                       element.nodeName == 'P' ||
                       element.nodeName == 'H1' ||
                       element.nodeName == 'H2' ||
                       element.nodeName == 'H3' ||
                       element.nodeName == 'H4' ||
                       element.nodeName == 'H5' ||
                       element.nodeName == 'H6' ||
                       element.nodeName == 'EM' ||
                       element.nodeName == 'SPAN') {
                return element.innerHTML;
            } else if (element.nodeName == 'IMG') {
                return element.getAttribute('src');
            }
        };
        self.setValue = function(element, value) {
            if (element.nodeName == 'INPUT') {
                switch (element.type) {
                    case 'text':
                    case 'password':
                    case 'radio':
                    case 'button':
                    case 'submit':
                    case 'reset':
                    case 'hidden':
                        element.setAttribute('value', value);
                        break;
                    case 'checkbox':
                        if (typeof value == $boolean) element.setAttribute('checked', value);
                        break;
                }
            } else if (element.nodeName == 'TEXTAREA' ||
                       element.nodeName == 'SELECT' ||
                       element.nodeName == 'P' ||
                       element.nodeName == 'H1' ||
                       element.nodeName == 'H2' ||
                       element.nodeName == 'H3' ||
                       element.nodeName == 'H4' ||
                       element.nodeName == 'H5' ||
                       element.nodeName == 'H6' ||
                       element.nodeName == 'EM' ||
                       element.nodeName == 'SPAN') {
                element.innerHTML = value;
            } else if (element.nodeName == 'IMG') {
                if (!isEmpty(value)) {
                    if (!isEmpty($tenjoh.options) && !isEmpty($tenjoh.options.baseImageURL))
                        element.setAttribute('src', $tenjoh.options.baseImageURL + value);
                    else
                        element.setAttribute('src', value);
                }
            }
        };
        self.findInputElements = function(element) {
            var inputElements = [], tempInputElements;
            inputTags.forEach(function(tagName, index,array){
                tempInputElements = element.getElementsByTagName(tagName);
                if (!isEmpty(tempInputElements)) {
                    inputElements = $tenjoh.Array.merge(inputElements, tempInputElements);
                }
            });
            return inputElements;
        };

        self.isElement = function(element) {
            return element && typeof element == $object && !isEmpty(element.nodeType) && element.nodeType === 1;
        };
        self.isTextNode = function(element) {
            return element && element.nodeType && element.nodeType == 3;
        };
        self.isCommentNode = function(element) {
            return element && element.nodeType && element.nodeType == 8;
        };
        self.isInputElement = function(element) {
            return (inputTags.indexOf(lowercase(element.tagName)) == -1) ? false : true;
        };
        self.isPartialElement = function(element) {
            return element.hasAttribute('data-partial');
        };
        self.isWidgetElement = function(element) {
            return element.hasAttribute('data-widget');
        };

        self.createElement = function(type, value, options) {
            var element;
            switch (type) {
                case 'img':
                    element = document.createElement('img');
                    if (!isEmpty(value)) {
                        if (!isEmpty($tenjoh.options) && !isEmpty($tenjoh.options.baseImageURL))
                            element.setAttribute('src', $tenjoh.options.baseImageURL + value);
                        else
                            element.setAttribute('src', value);
                    }
                    break;
                case 'text':
                case 'password':
                case 'submit':
                case 'reset':
                case 'hidden':
                    element = document.createElement('input');
                    element.setAttribute('type', type);
                    element.setAttribute('value', value);
                    if (options && options['data-property-name']) {
                        element.setAttribute('name', options['data-property-name']);
                    }
                    break;
                case 'checkbox':
                    element = document.createElement('input');
                    element.setAttribute('type', type);
                    if (typeof value == $boolean) element.setAttribute('checked', value);
                    break;
                case 'radio':
                    return createRadioButtons(type, value, options);
                case 'textarea':
                case 'button':
                default:
                    element = document.createElement(type);
                    element.innerHTML = value;
                    break;
            }
            for (var propertyName in options) {
                if (options.hasOwnProperty(propertyName)) {
                    if (propertyName != 'fillterName') element.setAttribute(propertyName, options[propertyName]);
                }
            }
            if (!element.hasAttribute('id')) {
                element.setAttribute('id', 'tenjoh#' + $tenjoh.uniqueId());
            }
            return element;
        };
    };

    return new DOM();
});


$tenjoh.addComponent('Event', function() {
    var Event = function() {
        var self = this;
        self.onPartialLoad = document.createEvent('UIEvent');
        self.onPartialLoad.initUIEvent("onPartialLoad", true, false);
        self.onHashChange = document.createEvent('UIEvent');
        self.onHashChange.initUIEvent("onHashChange", true, false);
        self.onFinishTraversal = document.createEvent('UIEvent');
        self.onFinishTraversal.initUIEvent("onFinishTraversal", true, false);
    };

    return new Event();
});
$tenjoh.addComponent('XHR', function() {
    var XHR = function() {
        var self = this;
        var debug = function(method, url, param) {
            if ($tenjoh.options.xhrDebug) {
                var now = new Date(),
                    template;
                if (method == 'get') template = '%s/%s/%s %s:%s:%s XHR GET: %s';
                else if (method == 'post') template = '%s/%s/%s %s:%s:%s XHR POST: %s';
                else if (method == 'delete') template = '%s/%s/%s %s:%s:%s XHR DELETE: %s';
                console.log(sprintf(template,
                    zeroPadding('' + now.getFullYear(), 4),
                    zeroPadding('' + now.getMonth() + 1, 2),
                    zeroPadding('' + now.getDate(), 2),
                    zeroPadding('' + now.getHours(), 2),
                    zeroPadding('' + now.getMinutes(), 2),
                    zeroPadding('' + now.getSeconds(), 2),
                    url
                ));
                if (method == 'post') console.log(data);
            }
        };
        var sanitize = function(param) {
            if (isEmpty(param.url)) throw Error('no target url');
            if (isEmpty(param.sync)) {
                if (isEmpty(param.success)) throw Error('no callback function');
                else param.sync = false;
            } else {
                if (!param.sync && isEmpty(param.success)) throw Error('no callback function');
            }
            if (isEmpty(param.cache)) param.cache = false;
        };
        var saveCache = function(url, data) {
            $tenjoh.Storage.set(url, {
                requestDatetime: now(),
                data: data
            });
        };
        self.get = function(param) {
            var xhr = new XMLHttpRequest(), cached;
            sanitize(param);
            debug('get', param.url);
            cached = $tenjoh.Storage.get(param.url)
            if ($tenjoh.options.xhrCache && !isEmpty(param.cache) && param.cache === true && !isEmpty(cached) && cached.requestDatetime + $tenjoh.options.xhrCacheExpire > now()) {
                if (param.sync) {
                    return cached.data;
                } else {
                    self.callback({
                        readyState: 4,
                        status: '200',
                        responseText: cached.data
                    }, param.success, param.error, param.cache, param.url);
                }
            } else {
                if (!param.sync) xhr.onreadystatechange = function() {
                    self.callback(xhr, param.success, param.error, param.cache, param.url);
                };
                xhr.open('GET', param.url, !param.sync);
                xhr.send();
                if (param.sync) {
                    return self.after(xhr, param.cache, param.url);
                }
            }
        };
        self.post = function(param) {
            var xhr = new XMLHttpRequest(), data = "";
            sanitize(param);
            debug('post', param.url, param.data);
            if (!param.sync) xhr.onreadystatechange = function() { self.callback(xhr, param.success, param.error); };
            for (var key in param.data) {
                if (param.data.hasOwnProperty(key)) data += key + '=' + param.data[key] + '&';
            }
            xhr.open('POST', param.url, !param.sync);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(data);
            if (param.sync) return self.after(xhr);
        };
        self.del = function(param) {
            var xhr = new XMLHttpRequest();
            sanitize(param);
            debug('delete', param.url);
            if (!param.sync) xhr.onreadystatechange = function() { self.callback(xhr, param.success, param.error); };
            xhr.open('DELETE', param.url, !param.sync);
            xhr.send();
            if (param.sync) return self.after(xhr);
        };
        self.callback = function(xhr, success, error, cache, url) {
            if (xhr.readyState == 4 && xhr.status == '200') {
                if (!isEmpty(cache) && cache === true) saveCache(url, xhr.responseText);
                if (!isEmpty($tenjoh.options.XHR) && !isEmpty($tenjoh.options.XHR.status200) && !success) {
                    $tenjoh.options.XHR.status200(xhr.responseText, xhr);
                } else if (isFunction(success)) {
                    success(xhr.responseText, xhr);
                }
            }
            if (xhr.readyState == 4 && xhr.status == '400') {
                if (!isEmpty($tenjoh.options.XHR) && !isEmpty($tenjoh.options.XHR.status400) && !error) {
                    $tenjoh.options.XHR.status400(xhr.responseText, xhr);
                } else if (isFunction(error)) {
                    error(xhr.responseText, xhr);
                }
            }
            if (xhr.readyState == 4 && xhr.status == '401') {
                if (!isEmpty($tenjoh.options.XHR) && !isEmpty($tenjoh.options.XHR.status401) && !error) {
                    $tenjoh.options.XHR.status401(xhr.responseText, xhr);
                } else if (isFunction(error)) {
                    error(xhr.responseText, xhr);
                }
            }
            if (xhr.readyState == 4 && xhr.status == '404') {
                if (!isEmpty($tenjoh.options.XHR) && !isEmpty($tenjoh.options.XHR.status404) && !error) {
                    $tenjoh.options.XHR.status404(xhr.responseText, xhr);
                } else if (isFunction(error)) {
                    error(xhr.responseText, xhr);
                }
            }
            if (xhr.readyState == 4 && xhr.status == '405') {
                if (!isEmpty($tenjoh.options.XHR) && !isEmpty($tenjoh.options.XHR.status405) && !error) {
                    $tenjoh.options.XHR.status405(xhr.responseText, xhr);
                } else if (isFunction(error)) {
                    error(xhr.responseText, xhr);
                }
            }
            if (xhr.readyState == 4 && xhr.status == '500') {
                if (!isEmpty($tenjoh.options.XHR) && !isEmpty($tenjoh.options.XHR.status500) && !error) {
                    $tenjoh.options.XHR.status500(xhr.responseText, xhr);
                } else if (isFunction(error)) {
                    error(xhr.responseText, xhr);
                }
            }
            if (xhr.readyState == 4 && xhr.status == '503') {
                if (!isEmpty($tenjoh.options.XHR) && !isEmpty($tenjoh.options.XHR.status503) && !error) {
                    $tenjoh.options.XHR.status503(xhr.responseText, xhr);
                } else if (isFunction(error)) {
                    error(xhr.responseText, xhr);
                }
            }
        };
        self.after = function(xhr, cache, url) {
            if (xhr.status == '200') {
                if (!isEmpty(cache) && cache === true) saveCache(url, xhr.responseText);
                return xhr.responseText;
            } else {
                if (xhr.status == '400' && !isEmpty($tenjoh.options.XHR) && !isEmpty($tenjoh.options.XHR.status400)) {
                    $tenjoh.options.XHR.status400(xhr.responseText, xhr);
                }
                if (xhr.status == '401' && !isEmpty($tenjoh.options.XHR) && !isEmpty($tenjoh.options.XHR.status401)) {
                    $tenjoh.options.XHR.status401(xhr.responseText, xhr);
                }
                if (xhr.status == '404' && !isEmpty($tenjoh.options.XHR) && !isEmpty($tenjoh.options.XHR.status404)) {
                    $tenjoh.options.XHR.status404(xhr.responseText, xhr);
                }
                if (xhr.status == '405' && !isEmpty($tenjoh.options.XHR) && !isEmpty($tenjoh.options.XHR.status405)) {
                    $tenjoh.options.XHR.status405(xhr.responseText, xhr);
                }
                if (xhr.status == '500' && !isEmpty($tenjoh.options.XHR) && !isEmpty($tenjoh.options.XHR.status500)) {
                    $tenjoh.options.XHR.status500(xhr.responseText, xhr);
                }
                if (xhr.status == '503' && !isEmpty($tenjoh.options.XHR) && !isEmpty($tenjoh.options.XHR.status503)) {
                    $tenjoh.options.XHR.status503(xhr.responseText, xhr);
                }
                return false;
            }
        };
        self.indicatorStart = function() {
            if ($root != undefined) {
                var element = document.createElement('span');
                element.id = "indicator";
                element.innerHTML = '<img src="/img/indicator.black.gif"/>';
                var childNode = $root.rootElement.childNodes[0];
                if (childNode != undefined && childNode.firstChild.id != 'indicator')
                    childNode.insertBefore(element, childNode.firstChild);
            }
        };
        self.indicatorStop = function() {
            var childNode = $root.rootElement.childNodes[0];
            if (childNode != undefined)
                childNode.removeChild(childNode.firstChild);
        };
    };
    return new XHR();
});
$tenjoh.addComponent('Router', function() {
    var Router = function() {
        var self = this;
        var isInitial = true;
        var timeoutId = null;
        self.delay = 300;
        self.hash = '';
        self.hookEvents = [];
        self.addHookEvent = function(uri, event) {
            if (!isUndefined(uri) && !isUndefined(event)) self.hookEvents.push({ uri: uri, event: event});
        };
        self.getHash = function(url) {
            url = url || location.href;
            return url.replace( /^[^#]*#?(.*)$/, '$1' );
        };
        self.start = function() {
            if (isInitial) {
                isInitial = false;
                self.hash = self.getHash();
                self.dispatch();
            }
            timeoutId || self.poll();
            document.addEventListener('onHashChange', function() {
                self.dispatch();
            }, false);
        };
        self.poll = function() {
            var currentHash = self.getHash();
            if (self.hash !== currentHash) {
                self.hash = currentHash;
                document.dispatchEvent($tenjoh.Event.onHashChange);
            }
            timeoutId = setTimeout(self.poll, self.delay);
        };
        self.dispatch = function() {
            var values = self.hash.split(/[\?\&]{1}/),
                partial,
                params = {},
                preventDefault = false;
            values.forEach(function(exp) {
                if (exp.indexOf('!') != -1) {
                    partial = exp.substring(exp.indexOf('!') + 1);
                } else {
                    params[exp.split('=')[0]] = exp.split('=')[1];
                }
            });
            if ($tenjoh.options.onRouterDispatch) $tenjoh.options.onRouterDispatch();
            for (var i = 0; i < self.hookEvents.length; i++) {
                if (partial == self.hookEvents[i].uri && !self.hookEvents[i].event()) preventDefault = true;
            }
            if (!preventDefault) {
                if (isEmpty(partial && $root.rootElement.hasAttribute('data-partial'))) {
                    $tenjoh.UI.createPartial('Index', $root.rootElement.getAttribute('data-partial'), $root.rootElement, params);
                } else {
                    $tenjoh.UI.createPartial('Index', partial, $root.rootElement, params);
                }
                window.scrollTo(0, 0);
            }
        };
    };

    return new Router();
});
$tenjoh.addComponent('Cache', function() {
    var Cache = function() {
        var self = this;
        self.has = function(key) {
            return sessionStorage.getItem(key) !== null;
        };
        self.get = function(key) {
            if (self.has(key)) {
                return JSON.parse(sessionStorage.getItem(key));
            } else {
                return null;
            }
        };
        self.set = function(key, object) {
            sessionStorage.setItem(key, JSON.stringify(object));
        };
        self.remove = function(key) {
            var obj = self.get(key);
            sessionStorage.removeItem(key);
            return obj;
        };
        self.clear = function() {
            sessionStorage.clear();
        };
    };

    return new Cache();
});$tenjoh.addComponent('Storage', function() {
    var Storage = function() {
        var self = this;
        self.has = function(key) {
            return localStorage.getItem(key) !== null;
        };
        self.get = function(key) {
            if (self.has(key)) {
                return JSON.parse(localStorage.getItem(key));
            } else {
                return null;
            }
        };
        self.set = function(key, object) {
            localStorage.setItem(key, JSON.stringify(object));
        };
        self.remove = function(key) {
            var obj = self.get(key);
            localStorage.removeItem(key);
            return obj;
        };
        self.clear = function() {
            localStorage.clear();
        };
    };

    return new Storage();
});$tenjoh.addComponent('Resource', function() {
    var ResourceManage = function() {
        var self = this;

        self.__resources = [];
        self.addImage = function(id, url, ignoreGC) {
            var image = new Image();
            var resource = {};
            if (!isEmpty($tenjoh.options.baseImageURL)) url = $tenjoh.options.baseImageURL + url;
            image.src = url;
            resource.loaded = false;
            image.addEventListener('load', function(event) {
                resource.loaded = true;
            });
            resource.id = id;
            resource.image = image;
            if (!isEmpty(ignoreGC) && ignoreGC === true) resource.ignoreGC = true;
            else resource.ignoreGC = false;
            self.__resources.forEach(function(resource, index, array) {
                if (resource.id == id) {
                    self.__resources.splice(index, 1);
                }
            });
            self.__resources.unshift(resource);
            return resource.image;
        };
        self.get = function(id) {
            var match;
            for(var i = 0; i < self.__resources.length; i++) {
                if (self.__resources[i].id == id) {
                    match = self.__resources.splice(i, 1)[0];
                    self.__resources.unshift(match);
                    return match;
                }
            }
        };
        self.getImage = function(id) {
            var match;
            for(var i = 0; i < self.__resources.length; i++) {
                if (self.__resources[i].id == id) {
                    match = self.__resources.splice(i, 1)[0];
                    self.__resources.unshift(match);
                    if (!isEmpty(match.image)) return match.image;
                    else return undefined;
                }
            }
        };
    };

    return new ResourceManage();
});$tenjoh.addComponent('Compiler', function() {
    var Compiler = function() {
        var self = this,
            regxDoubleCurly = /\{\{([^{}]+)\}\}/gm,
            regxFillterName = /^\s*[^\s]+/,
            regxStringSingleQuote = /([^:\s]+)\s*:\s*'([^']+)'/g,
            regxNumber = /([^:\s]+)\s*:\s*([0-9\.]+)/g,
            regxVariables = /([^:\s]+)\s*:\s*([^0-9:\s'"][^:\s'"]+)/g,
            regxLiteral = /(?:(^[0-9\.]+$)|^'((?:[^\\']|\\.)*)'$|^"((?:[^\\"]|\\.)*)"$)/gm;
        self.hasDoubleCurly = function(string) {
            return string && !(string.indexOf("{{") == -1 || string.lastIndexOf("}}") == -1);
        };
        var unescape = function(string) {
            var regxEscaped = /\\(.)/gm;
            return string.replace(regxEscaped, function(match, simbol) {
                return simbol;
            });
        };
        var isLiteral = function(string) {
            return regxLiteral.test(string);
        };
        var getLiteral = function(fillterOperand) {
            return fillterOperand.replace(regxLiteral, function(match, number, singleQuote, doubleQuote) {
                if (singleQuote || singleQuote == '') return unescape(singleQuote);
                else if (doubleQuote || doubleQuote == '') return unescape(doubleQuote);
                else return number;
            });
        };
        var loadSubPartial = function(element, superPartial) {
            var defaultParam = {}, attributes = element.attributes, subPartial,
                partialBuilder = new $tenjoh.UI.PartialBuilder();
            for (var i = 0; i < attributes.length; i++) {
                if (attributes[i].name.indexOf('data-') != -1) {
                    if (attributes[i].name == 'data-name') partialBuilder.name = attributes[i].value;
                    else if (attributes[i].name == 'data-partial') partialBuilder.url = attributes[i].value;
                    else defaultParam[attributes[i].name.replaceFirst('data-', '')] = attributes[i].value;
                }
            }
            partialBuilder.defaultParam = defaultParam;
            partialBuilder.element = element;
            partialBuilder.parent = superPartial;
            subPartial = partialBuilder.create();
            superPartial.__children.push(subPartial);
        };
        var loadWidget = function(element, partial) {
            var widgetName = element.getAttribute('data-widget'),
                widget = $tenjoh.getWidget(widgetName, partial),
                attributes = element.attributes, attribute;
            if (isEmpty(widget)) return false;
            for (var i = 0; i < attributes.length; i++) {
                attribute = attributes[i];
                if (attribute.name !== 'data-widget') {
                    widget[attribute.name.replaceAll('data-', '')] = attribute.value;
                }
            }
            widget.load(element);
        };
        var findFilltersByDoubleCurly = function(templateString, controller) {
            var commands = templateString.split('|'),
                fillters = [], propertyName = commands[0].trim(),
                tmpFillters = commands.slice(1);
            tmpFillters.forEach(function(fillter, index, array) {
                var fillterString = fillter.trim(); fillter = {};
                var param;
                if (fillterString.indexOf(':') == -1) {
                    fillter["fillterName"] = fillterString;
                } else {
                    fillter['fillterName'] = fillterString.match(regxFillterName)[0].trim();
                    while (param = regxStringSingleQuote.exec(fillterString)) {
                        fillter[param[1]] = param[2];
                    }
                    while (param = regxNumber.exec(fillterString)) {
                        if (param[2].indexOf('.') == -1) {
                            fillter[param[1]] = parseInt(param[2]);
                        } else {
                            fillter[param[1]] = parseFloat(param[2]);
                        }
                    }
                    while (param = regxVariables.exec(fillterString)) {
                        if (isUndefined(controller.getProperty(param[2]))) controller.setProperty(param[2], '');
                        fillter[param[1]] = controller.getProperty(param[2]);
                    }
                }
                fillter['data-property-name'] = propertyName;
                fillter['data-template'] = templateString;
                fillters.push(fillter);
            });
            return fillters;
        };
        var applyFillters = function(fillteredValue, fillters, controller, isInitial) {
            if (fillters.length > 0) {
                for (var i = 0; i < fillters.length; i++) {
                    fillteredValue = $tenjoh.UI.Fillter.execFillter(fillters[i].fillterName, fillteredValue, controller, fillters[i], isInitial);
                }
            }
            return fillteredValue;
        };
        var compileTextNode = function(textNode, parentElement, partial) {
            var match, newTextNode, replaces = [],
                nodes, parent;
            match = textNode.wholeText.match(regxDoubleCurly);
            if (match.length < 1) return;
            for (var i = 0; i < match.length; i++) {
                replaces.push({
                    key: match[i],
                    value: self.compileDoubleCurly(match[i], partial.getController(), true)
                });
            }
            nodes = correctTextNode(textNode, replaces);
            return nodes;
        };
        var correctTextNode = function(destTextNode, replaces) {
            var subject = destTextNode.wholeText, index, tmpIndex, target, atoms = [];
            var joinStringBefore = function(array, appendSring) {
                var result = array.clone();
                if (result.length == 0 || !isString(appendSring) || !isString(result[result.length - 1])) result.push(appendSring);
                else result[result.length - 1] = result[result.length - 1] + appendSring;
                return result;
            };
            var stringToText = function(array) {
                var result = array.clone();
                for (var i = 0; i < result.length; i++) if (isString(result[i])) result[i] = document.createTextNode(result[i]);
                return result;
            };
            do {
                index = subject.length;
                for (var i = 0; i < replaces.length; i++) {
                    tmpIndex = subject.indexOf(replaces[i].key);
                    if (tmpIndex == -1 || tmpIndex >= index) {
                        continue;
                    } else {
                        index = tmpIndex;
                        target = replaces[i];
                    }
                }
                if (index == subject.length) {
                    atoms = joinStringBefore(atoms, subject);
                    break;
                } else if (index == 0) {
                    atoms = joinStringBefore(atoms, target.value);
                    subject = subject.substr(target.key.length);
                } else if (index > 0) {
                    atoms = joinStringBefore(atoms, subject.substr(0, index));
                    atoms = joinStringBefore(atoms, target.value);
                    subject = subject.substr(index + target.key.length);
                }
            } while (subject.length != 0);
            return stringToText(atoms);
        };
        var compileAttribute = function(element, partial) {
            var match, newAttribute;
            for (var i = 0; i < element.attributes.length; i++) {
                if (self.hasDoubleCurly(element.attributes[i].value)) {
                    match = element.attributes[i].value.match(regxDoubleCurly);
                    for (var j = 0; j < match.length; j++) {
                        newAttribute = self.compileDoubleCurly(match[j], partial.getController(), true);
                        if (newAttribute) {
                            element.setAttribute(element.attributes[i].name, element.attributes[i].value.replaceFirst(match[j], newAttribute));
                        }
                    }
                }
            }
        };
        self.compileElement = function(element, partial) {
            var node, nodes, stack = [];
            var nodeIterator = document.createNodeIterator(
                element,
                NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_TEXT,
                { acceptNode: function(node) { return NodeFilter.FILTER_ACCEPT; } },
                false
            );

            while (node = nodeIterator.nextNode()) {
                if (node === element) continue;
                if (!$tenjoh.DOM.isTextNode(node)) {
                    if (node.hasAttributes()) compileAttribute(node, partial);
                    if ($tenjoh.DOM.isPartialElement(node)) {
                        stack.push({
                            fn: loadSubPartial,
                            node: node,
                            partial: partial
                        });
                    } else if ($tenjoh.DOM.isWidgetElement(node)) {
                        stack.push({
                            fn: loadWidget,
                            node: node,
                            partial: partial
                        });
                    }
                }
            }
            for (var i = 0; i < stack.length; i++) {
                if (stack[i].fn === loadSubPartial) stack[i].fn(stack[i].node, stack[i].partial);
                if (stack[i].fn === loadWidget) stack[i].fn(stack[i].node, stack[i].partial);
            }

            nodeIterator = document.createNodeIterator(
                element,
                NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_TEXT,
                { acceptNode: function(node) { return NodeFilter.FILTER_ACCEPT; } },
                false
            );
            while (node = nodeIterator.nextNode()) {
                if (node === element) continue;
                if ($tenjoh.DOM.isTextNode(node)) {
                    if (self.hasDoubleCurly(node.wholeText)) {
                        nodes = compileTextNode(node, element, partial);
                        for (var i = 0; i < nodes.length; i++) {
                            node.parentNode.insertBefore(nodes[i], node);
                            if ($tenjoh.DOM.isElement(nodes[i])) {
                                partial.getController().bindElement(nodes[i]);
                            }
                        }
                        node.parentNode.removeChild(node);
                    }
                }
            }
        };
        self.compileDoubleCurly = function(doubleCurly, controller, isInitial) {
            var propertyName, fillters;
            if (isEmpty(isInitial)) isInitial = false;
            doubleCurly = doubleCurly.replaceFirst('{{', '');
            doubleCurly = doubleCurly.replaceFirst('}}', '');
            if (doubleCurly.indexOf('|') == -1) {
                propertyName = doubleCurly.trim();
                if (isLiteral(propertyName)) return getLiteral(propertyName);
                if (isUndefined(controller.getProperty(propertyName))) {
                    controller.setProperty(propertyName, '');
                }
                return '' + controller.getProperty(propertyName);
            } else {
                fillters = findFilltersByDoubleCurly(doubleCurly, controller);
                propertyName = doubleCurly.split('|')[0].trim();
                if (isLiteral(propertyName)) return applyFillters(getLiteral(propertyName), fillters, controller, isInitial);
                if (isUndefined(controller.getProperty(propertyName))) {
                    controller.setProperty(propertyName, '');
                }
                return applyFillters(controller.getProperty(propertyName), fillters, controller, isInitial);
            }
        };
    };

    return new Compiler();
});
$tenjoh.addComponent('UI', function() {
    var UIFactory = function() {
        var self = this;
        self.createPartial = function(name, url, element, defaultParam) {
            var partialBuilder = new self.PartialBuilder();
            partialBuilder.name = name;
            partialBuilder.url = url;
            partialBuilder.element = element;
            if (!isEmpty(defaultParam)) partialBuilder.defaultParam = defaultParam;
            return partialBuilder.create();
        };
        self.PartialBuilder = function() {
            var partialBuilder = this;
            partialBuilder.name = null;
            partialBuilder.url = null;
            partialBuilder.element = null;
            partialBuilder.defaultParam = {};
            partialBuilder.parent = null;

            partialBuilder.create = function(initialize) {
                var partial;
                if (isEmpty(initialize)) initialize = true;
                if (initialize && !partialBuilder.element) throw Error('partial element is not set');
                partial = $tenjoh.UI.Partial.create(partialBuilder.name, partialBuilder.url, partialBuilder.element, partialBuilder.defaultParam);
                $root.setPartial(partial);
                partial.__parent = partialBuilder.parent;
                if (!partial.getParent()) document.dispatchEvent($tenjoh.Event.onPartialLoad);
                if (initialize && $tenjoh.options.onPartialLoad) $tenjoh.options.onPartialLoad();
                if (initialize && partial.getController().load) partial.getController().load();
                return partial;
            };
        };
    };

    return new UIFactory();
});
$tenjoh.addComponent('UI.Partial', function() {
    var PartialFactory = function(url) {
        var self = this;
        var Scheme = function() {
            var scheme = this;
            scheme.url = '';
            scheme.script = '';
            scheme.template = '';
            scheme.requestDatetime = now();
        };
        var Partial = function(name, element, scheme, defaultParam) {
            var partial = this;
            partial.name = name;
            partial.__parent = null;
            partial.getParent = function() { return partial.__parent; };
            partial.__children = [];
            partial.getChild = function(index) { return partial.__children[index]; };
            partial.sizeOfChildren = function() { return partial.__children.length; };
            partial.__scheme = scheme;
            partial.getScheme = function() {return partial.__scheme; };
            partial.__controller = createController(partial, defaultParam);
            partial.__controller.__partial = partial;
            partial.getController = function() { return partial.__controller; };
            partial.__scriptTagId = null;
            partial.setScriptTagId = function(scriptTagId) { partial.__scriptTagId = scriptTagId; };
            partial.removeScriptTag = function() { document.remove(partial.__scriptTagId); };
            partial.__view = null;
            partial.getView = function() { return partial.__view; };
            partial.initView = function(element) {
                if (!isEmpty(element)) partial.__view = element;
                partial.__view.innerHTML = partial.__scheme.template.replaceAll('self.', sprintf("$root.getPartial('%s').getController().", partial.name));
                $tenjoh.Compiler.compileElement(partial.__view, partial);
            };
            if (element !== false && !isEmpty(element)) {
                partial.__view = element;
                partial.initView();
            } else if(element === false || isEmpty(element)) {
                partial.__view = null;
            }
            partial.discard = function() {
                $root.discardPartial(name);
            };
        };

        var removeNewLines = function(html) {
            return html.replaceAll('://', '%%protocol%%').replaceAll(/\/\/.+/, '').replaceAll('%%protocol%%', '://').replaceAll(/[\r\n]/, '').replaceAll(/<!--[\s\S]*?-->/, '');
        };
        var findScriptTag = function(html) {
            return html.match(/<script.*>.+<\/script>/mg);
        };
        var innerScriptTags = function(scriptTags) {
            return scriptTags.join('').replaceAll(/<script type="text\/javascript">/, '').replaceAll(/<\/script>/, '');
        };
        var removeScriptTag = function(html) {
            return html.replaceAll(/<script.*>.+<\/script>/m, '');
        };
        var getScriptFromRawScheme = function(html) {
            return innerScriptTags(findScriptTag(removeNewLines(html)));
        };
        var getTemplateFromRawScheme = function(html) {
            return removeScriptTag(removeNewLines(html));
        };
        var isScheme = function(url) {
            if ($tenjoh.Storage.has(url)) {
                if ($tenjoh.options.partialCache && $tenjoh.Storage.get(url).requestDatetime + $tenjoh.options.partialCacheExpire >= now()) {
                    return true;
                } else {
                    $tenjoh.Storage.remove(url);
                    return false;
                }
            }
        };
        var getScheme = function (url) {
            return (isScheme(url)) ? getSchemeFromStorage : getSchemeOverHTTP;
        };
        var getSchemeFromStorage = function(url) {
            return $tenjoh.Storage.get(url);
        };
        var getSchemeOverHTTP = function(url) {
            var scheme = parseRawScheme(url, $tenjoh.XHR.get({ url: url, cache: false, sync: true }));
            $tenjoh.Storage.set(url, scheme);
            return scheme;
        };
        var getSchemeOverHTTPAsync = function(url) {
            $tenjoh.XHR.get({ url: url, cache: false, success: function(rawScheme) {
                $tenjoh.Storage.set(url, parseRawScheme(url, rawScheme));
            }});
        };
        var parseRawScheme = function(url, rawScheme) {
            var scheme = new Scheme();
            scheme.url = url;
            scheme.script = getScriptFromRawScheme(rawScheme);
            scheme.template = getTemplateFromRawScheme(rawScheme);
            return scheme;
        };
        var createPartialFromScheme = function(name, url, element, scheme, defaultParam) {
            return new Partial(name, element, scheme(url)(url), defaultParam);
        };
        var precompileScript = function(partialName, script) {
            return script.replace(/\$controller/, sprintf('$root.__controllers["%s"]', partialName));
        };
        var createScriptElement = function(script) {
            var element = document.createElement('script');
            element.id = 'tenjoh#' + $tenjoh.uniqueId();
            element.type = 'text/javascript';
            element.text = script;
            return element;
        };
        var createController = function(partial, defaultParam) {
            var Controller, controller, scriptElement;
            scriptElement = createScriptElement(precompileScript(partial.name, partial.getScheme().script));
            document.body.appendChild(scriptElement);
            Controller = $root.getController(partial.name);
            Controller.prototype = new $tenjoh.Controller(partial);
            for (var param in defaultParam) {
                if (!defaultParam.hasOwnProperty(param)) continue;
                Controller.prototype[param] = defaultParam[param];
            }
            controller = new Controller();
            controller.getWatcher().setController(controller);
            scriptElement.parentNode.removeChild(scriptElement);
            return controller;
        };

        self.preload = function(url) {
            if (!isScheme(url)) getSchemeOverHTTPAsync(url);
        };
        self.create = function(name, url, element, defaultParam) {
            if (!isEmpty($tenjoh.options.basePartialURL)) url = $tenjoh.options.basePartialURL + url;
            return createPartialFromScheme(name, url, element, getScheme, defaultParam);
        };
    };

    return new PartialFactory();
});
$tenjoh.addComponent('UI.Fillter', function() {
    var FillterManager = function() {
        var self = this;
        self.__filters = {};
        self.addFilter = function(name, fn) {
            if (isEmpty(self.__filters[name])) {
                self.__filters[name] = fn;
            }
        };
        self.getFillter = function(name) {
            return self.__filters[name];
        };
        self.execFillter = function(name, value, controller, options, isInitial) {
            return self.getFillter(name)(value, controller, options, isInitial);
        };
    };

    return new FillterManager();
});
$tenjoh.addComponent('Animation', function() {
    var Animation = function() {
        var self = this;
        var tryCount = 0;
        self.createScene = function(elementId) {
            return new Scene(elementId);
        };
        self.startScene = function(scene) {
            if (scene.start) {
                return false;
            }
            try {
                if (!scene.isReady()) throw Error('scene is not ready');
            } catch(e) {
                if (tryCount > scene.__readyTimeout / 10) {
                    scene.__onError(e);
                    throw e;
                } else {
                    if (document.getElementById(scene.__elementId)) {
                        setTimeout(function() {
                            self.startScene(scene);
                            tryCount++;
                        }, 10);
                    }
                    return false;
                }
            }
            scene.__start = true;
            scene.setStartTime();
            scene.animate();
        };

        self.linearTween = function (time, startValue, amountOfChange, duration) { return amountOfChange*time/duration + startValue; };
        self.easeInQuad = function (time, startValue, amountOfChange, duration) { time /= duration; return amountOfChange*time*time + startValue; };
        self.easeOutQuad = function (time, startValue, amountOfChange, duration) { time /= duration; return -amountOfChange * time*(time-2) + startValue; };
        self.easeInOutQuad = function (time, startValue, amountOfChange, duration) { time /= duration/2; if (time < 1) return amountOfChange/2*time*time + startValue; time--; return -amountOfChange/2 * (time*(time-2) - 1) + startValue; };
        self.easeInCubic = function (time, startValue, amountOfChange, duration) { time /= duration; return amountOfChange*time*time*time + startValue; };
        self.easeOutCubic = function (time, startValue, amountOfChange, duration) { time /= duration; time--; return amountOfChange*(time*time*time + 1) + startValue; };
        self.easeInOutCubic = function (time, startValue, amountOfChange, duration) { time /= duration/2; if (time < 1) return amountOfChange/2*time*time*time + startValue; time -= 2; return amountOfChange/2*(time*time*time + 2) + startValue; };
        self.easeInQuart = function (time, startValue, amountOfChange, duration) { time /= duration; return amountOfChange*time*time*time*time + startValue; };
        self.easeOutQuart = function (time, startValue, amountOfChange, duration) { time /= duration; time--; return -amountOfChange * (time*time*time*time - 1) + startValue; };
        self.easeInOutQuart = function (time, startValue, amountOfChange, duration) { time /= duration/2; if (time < 1) return amountOfChange/2*time*time*time*time + startValue; time -= 2; return -amountOfChange/2 * (time*time*time*time - 2) + startValue; };
        self.easeInQuint = function (time, startValue, amountOfChange, duration) { time /= duration; return amountOfChange*time*time*time*time*time + startValue; };
        self.easeOutQuint = function (time, startValue, amountOfChange, duration) { time /= duration; time--; return amountOfChange*(time*time*time*time*time + 1) + startValue; };
        self.easeInOutQuint = function (time, startValue, amountOfChange, duration) { time /= duration/2; if (time < 1) return amountOfChange/2*time*time*time*time*time + startValue; time -= 2; return amountOfChange/2*(time*time*time*time*time + 2) + startValue; };
        self.easeInSine = function (time, startValue, amountOfChange, duration) { return -amountOfChange * Math.cos(time/duration * (Math.PI/2)) + amountOfChange + startValue; };
        self.easeOutSine = function (time, startValue, amountOfChange, duration) { return amountOfChange * Math.sin(time/duration * (Math.PI/2)) + startValue; };
        self.easeInOutSine = function (time, startValue, amountOfChange, duration) { return -amountOfChange/2 * (Math.cos(Math.PI*time/duration) - 1) + startValue; };
        self.easeInExpo = function (time, startValue, amountOfChange, duration) { return amountOfChange * Math.pow( 2, 10 * (time/duration - 1) ) + startValue; };
        self.easeOutExpo = function (time, startValue, amountOfChange, duration) { return amountOfChange * ( -Math.pow( 2, -10 * time/duration ) + 1 ) + startValue; };
        self.easeInOutExpo = function (time, startValue, amountOfChange, duration) { time /= duration/2; if (time < 1) return amountOfChange/2 * Math.pow( 2, 10 * (time - 1) ) + startValue; time--; return amountOfChange/2 * ( -Math.pow( 2, -10 * time) + 2 ) + startValue; };
        self.easeInCirc = function (time, startValue, amountOfChange, duration) { time /= duration; return -amountOfChange * (Math.sqrt(1 - time*time) - 1) + startValue; };
        self.easeOutCirc = function (time, startValue, amountOfChange, duration) { time /= duration; time--; return amountOfChange * Math.sqrt(1 - time*time) + startValue; };
        self.easeInOutCirc = function (time, startValue, amountOfChange, duration) { time /= duration/2; if (time < 1) return -amountOfChange/2 * (Math.sqrt(1 - time*time) - 1) + startValue; time -= 2; return amountOfChange/2 * (Math.sqrt(1 - time*time) + 1) + startValue; };
        self.easeTitleMove = function(time, startValue, amountOfChange, duration){
            return startValue + amountOfChange * Math.sin(((time/duration) * 130 * Math.PI / 180)) * 1.3;
        };
        self.easeStarMove = function(time, startValue, amountOfChange, duration){
            return startValue + amountOfChange * Math.sin(((time/duration) * 180 * Math.PI / 180));
        };
        self.easeSinUp = function (time, startValue, amountOfChange, duration) {
            return amountOfChange * Math.sin(time/duration * 720 * (Math.PI/180)) * 0.05 + startValue;
        };
        self.easeSinUp2 = function (time, startValue, amountOfChange, duration) {
            return amountOfChange * Math.sin(time/duration * 1440 * (Math.PI/180)) * 0.05 + startValue;
        };
    };

    var Point = function(x, y) {
        this.x = x;
        this.y = y;
    };
    var Rect = function(x, y, width, height) {
        var self = this;
        self.x = x;
        self.y = y;
        self.width = width;
        self.height = height;
        self.getPoint = function() { return new Point(self.x, self.y); };
        self.getCenter = function() { return new Point(self.width / 2 + self.x, self.height / 2 + self.y); };
    };
    var Timer = function(start, end) {
        this.start = start;
        this.end = end;
        this.duration = end - start;
    };

    var Scene = function(elementId) {
        var self = this;
        var tryCount = 0;
        var init = function(_elementId) {
            try {
                for (var i = 0; i < self.__necessaryResource.length; i++) {
                    var resource = $tenjoh.Resource.get(self.__necessaryResource[i]);
                    if (!resource.loaded) throw Error('resource is not loaded');
                }
                self.canvas = document.getElementById(_elementId);
                self.width = self.canvas.getAttribute('width');
                self.height = self.canvas.getAttribute('height');
                self.__ready = true;
            } catch(e) {
                if (tryCount > self.__readyTimeout / 10) {
                    self.__onError(e);
                    throw e;
                } else {
                    if (document.getElementById(_elementId)) {
                        setTimeout(function() {
                            init(_elementId);
                            tryCount++;
                        }, 10);
                    }
                }
            }
        };
        setTimeout(function() { init(elementId); }, 1);
        var drawAnimationDuration = function() {
            var duration = now() - self.startTS,
                text = sprintf('%d:%d:%d.%d', duration/60/60/1000, duration/60/1000, duration/1000, duration%1000);
            self.context.save();
            self.context.font = '31px';
            self.context.strokeStyle = 'red';
            self.context.strokeText(text, 20, 20);
            self.context.restore();
        };
        self.amountOfChange = function(p1, p2) {
            return p2 - p1;
        };
        self.delta = function(p1, p2, duration) {
            return self.amountOfChange(p1, p2) / duration;
        };
        self.debug = !isEmpty($tenjoh.options.debugAnimation) && $tenjoh.options.debugAnimation === true;
        self.__elementId = elementId;
        self.getElementId = function() { return self.__elementId; };
        self.canvas = null;
        self.context = null;
        self.width = null;
        self.height = null;
        self.objects = {};
        self.__ready = false;
        self.isReady = function() { return self.__ready; };
        self.__readyTimeout = 10000;
        self.setReadyTimeout = function(readyTimeout) { self.__readyTimeout = readyTimeout; };
        self.__start = false;
        self.isStart = function() { return self.__start; };
        self.__pose = false;
        self.isPose = function() { return self.__pose; };
        self.__finished = false;
        self.isFinished = function() { return self.__finished; };
        self.__necessaryResource = null;
        self.setNecessaryResource = function(resources) { self.__necessaryResource = resources; };
        self.beforeAnimate = false;
        self.__onFinish = null;
        self.setOnFinish = function(fn) { self.__onFinish = fn; };
        self.__onError = function() {};
        self.setOnError = function(fn) { self.__onError = fn; };
        self.__beforeAnimate = null;
        self.setBeforeAnimate = function(fn) { self.__beforeAnimate = fn; };
        self.__drawFunction = null;
        self.setDrawFunction = function(fn) { self.__drawFunction = fn; };
        self.__defaultFrameRate = 29.97;
        self.__frameRate = self.__defaultFrameRate;
        self.__lastFrameTime = null;
        self.currentTS = null;
        self.startTS = null;
        self.now = null;
        self.makePoint = function(x, y) { return new Point(x, y); };
        self.makeRect = function(x, y, width, height) { return new Rect(x, y, width, height); };
        self.makeTimer = function(start, end) { end = (isEmpty(end) ? 10000 : end) ; return new Timer(start, end); };
        self.setStartTime = function() {
            self.startTS = now();
        };
        self.clear = function() {
            self.canvas.getContext('2d').clearRect(0, 0, self.width, self.height);
        };
        self.animate = function() {
            var frameStartTime, frameEndTime, processTime,
                frameLength = 1000 / self.__frameRate;
            self.context = self.canvas.getContext('2d');
            frameStartTime = now();
            self.currentTS = frameStartTime;
            self.now = self.currentTS - self.startTS;

            if (!self.beforeAnimate) {
                try {
                    self.__beforeAnimate(self);
                } catch(e) {
                    self.__onError(e);
                    throw e;
                }
                self.beforeAnimate = true;
            }

            if (self.__pose) {
                return false;
            }

            self.clear();
            try {
                if (self.__drawFunction(self)) {
                    frameEndTime = now();
                    processTime = frameEndTime - frameStartTime;

                    if (self.debug) {
                        self.context.save();
                        self.context.font = '31px';
                        self.context.strokeStyle = 'red';
                        self.context.strokeText(self.__frameRate, 20, 20);
                        self.context.restore();
                    }

                    self.__frameRate = 1000 / processTime;
                    if (frameLength <= processTime) {
                        setTimeout(self.animate, 0);
                    } else {
                        if (self.__frameRate >= self.__defaultFrameRate) {
                            self.__frameRate = self.__defaultFrameRate;
                        }
                        frameLength = 1000 / self.__frameRate;
                        setTimeout(self.animate, frameLength - processTime);
                    }
                } else {
                    self.__finished = true;
                    if (self.debug) {
                        drawAnimationDuration();
                    }
                    if (self.__onFinish) self.__onFinish();
                }
            } catch(e) {
                self.__onError(e);
                throw e;
            }
        };
        self.stop = function() {
            self.__drawFunction = function() { return false; };
        };
        self.pose = function() {
            self.__lastFrameTime = now();
            self.__pose = true;
        };
        self.play = function(time) {
            var suspendTime = self.__lastFrameTime - self.startTS;
            self.__finished = false;
            if (self.__pose) {
                self.startTS = now() - suspendTime;
                self.__pose = false;
            }
            if (!isEmpty(time)) {
                self.startTS = now() - time;
            }
            self.animate();
        };

        self.drawImage = function(image, rect, timer) {
            if (!isEmpty(timer)) {
                if (self.currentTS < timer.start || self.currentTS >= timer.end) {
                    return false;
                }
            }
            self.context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
        };
        self.drawImageRotate = function(image, rect, timer, angle) {
            if (!isEmpty(timer)) {
                if (self.currentTS < timer.start || self.currentTS >= timer.end) {
                    return false;
                }
            }
            var radian = angle * Math.PI / 180,
                center = rect.getCenter();
            self.context.save();
            self.context.setTransform(1, 0, 0, 1, 0, 0);
            self.context.translate(center.x, center.y);
            self.context.rotate(radian);
            self.context.translate(-center.x, -center.y);
            self.context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
            self.context.restore();
        };

        self.drawImageAnimate = function(image, startRect, endRect, options) {
            var currentRect, center, alpha = 1.0, alphaEffectTiming, radian;

            if (isEmpty(endRect)) {
                endRect = startRect;
            }
            if (!isEmpty(options)) {
                if (isEmpty(options.timer)) {
                    options.timer = self.makeTimer(0);
                }
                if (self.now < options.timer.start) {
                    return;
                } else if (self.now >= options.timer.start && self.now < options.timer.end) {
                    if (!isEmpty(options.timingFunction) && isFunction(options.timingFunction)) {
                        currentRect = new Rect(
                            options.timingFunction(self.now - options.timer.start, startRect.x, self.amountOfChange(startRect.x, endRect.x), options.timer.duration),
                            options.timingFunction(self.now - options.timer.start, startRect.y, self.amountOfChange(startRect.y, endRect.y), options.timer.duration),
                            options.timingFunction(self.now - options.timer.start, startRect.width, self.amountOfChange(startRect.width, endRect.width), options.timer.duration),
                            options.timingFunction(self.now - options.timer.start, startRect.height, self.amountOfChange(startRect.height, endRect.height), options.timer.duration)
                        );
                    } else if (!isEmpty(options.timingFunction) && isObject(options.timingFunction)) {
                        currentRect = new Rect(
                            options.timingFunction.x(self.now - options.timer.start, startRect.x, self.amountOfChange(startRect.x, endRect.x), options.timer.duration),
                            options.timingFunction.y(self.now - options.timer.start, startRect.y, self.amountOfChange(startRect.y, endRect.y), options.timer.duration),
                            options.timingFunction.width(self.now - options.timer.start, startRect.width, self.amountOfChange(startRect.width, endRect.width), options.timer.duration),
                            options.timingFunction.height(self.now - options.timer.start, startRect.height, self.amountOfChange(startRect.height, endRect.height), options.timer.duration)
                        );
                    }


                } else {
                    if (!isEmpty(options.drawAfterAnimate) && options.drawAfterAnimate === false) {
                        return;
                    }
                    currentRect = endRect;
                }

                center = currentRect.getCenter();
                if (!isEmpty(options.rotateCenter)){
                    center = options.rotateCenter;
                }
                if (!isEmpty(options.angle)) {
                    radian = options.angle * Math.PI / 180;
                } else if (isEmpty(options.angle) && !isEmpty(options.startAngle) && !isEmpty(options.endAngle)) {
                    if(isEmpty(options.rotationDirection) || options.rotationDirection === 1){
                        radian = options.startAngle + (self.delta(options.startAngle, options.endAngle, options.timer.end - options.timer.start) * (self.now - options.timer.start));
                        radian = radian * Math.PI / 180;
                        if (radian < options.startAngle * Math.PI / 180) {
                            radian = options.startAngle * Math.PI / 180;
                        } else if (radian > options.endAngle * Math.PI / 180) {
                            radian = options.endAngle * Math.PI / 180;
                        }
                    } else if(options.rotationDirection === -1) {
                        radian = options.startAngle + (self.delta(options.startAngle, options.endAngle, options.timer.end - options.timer.start) * (self.now - options.timer.start));
                        radian = radian * Math.PI / 180;
                        if (radian < options.endAngle * Math.PI / 180) {
                            radian = options.endAngle * Math.PI / 180;
                        } else if (radian > options.startAngle * Math.PI / 180) {
                            radian = options.startAngle * Math.PI / 180;
                        }
                    }
                } else {
                    radian = 0;
                }

                if (!isEmpty(options.alpha)) {
                    if (isString(options.alpha)) {
                        switch(options.alpha) {
                            case 'fadeInOut':
                                alphaEffectTiming = (self.now - (options.timer.start - self.startTS)) % options.iterationDuration;
                                if (alphaEffectTiming < 0) {
                                    alpha = 0.0
                                } else {
                                    alpha = (Math.sin(360 * alphaEffectTiming / options.iterationDuration * Math.PI / 180) + 1) / 2;
                                }
                                break;
                        }
                    } else if(isNumber(options.alpha)) {
                        alpha = options.alpha;
                    }
                } else if (isEmpty(options.alpha) && !isEmpty(options.startAlpha) && !isEmpty(options.endAlpha)) {
                    alpha = options.startAlpha + (self.delta(options.startAlpha, options.endAlpha, options.timer.end - options.timer.start) * (self.now - options.timer.start));
                    if (alpha < 0.0) {
                        alpha = 0.0
                    } else if (alpha > 1.0) {
                        alpha = 1.0;
                    }
                } else {
                    alpha = 1.0;
                }
            }

            self.context.save();
            self.context.setTransform(1, 0, 0, 1, 0, 0);
            self.context.translate(center.x, center.y);
            self.context.rotate(radian);
            self.context.translate(-center.x, -center.y);
            self.context.globalAlpha = alpha;
            if (options.clipX != undefined && options.clipY != undefined) {
                self.context.drawImage(image, options.clipX, options.clipY, currentRect.width, currentRect.height, currentRect.x, currentRect.y, currentRect.width, currentRect.height);
            } else {
                self.context.drawImage(image, currentRect.x, currentRect.y, currentRect.width, currentRect.height);
            }
            self.context.restore();
        };
        self.drawRectAnimate = function(startRect, endRect, options) {
            var currentRect, alpha;
            var radian = options.angle * Math.PI / 180,
                center;
            if (!isEmpty(options)) {
                if (isEmpty(options.timer)) {
                    options.timer = self.makeTimer(0);
                }
                if (self.now < options.timer.start) {
                    return;
                } else if (self.now >= options.timer.start && self.now < options.timer.end) {
                    if (!isEmpty(options.timingFunction) && isFunction(options.timingFunction)) {
                        currentRect = new Rect(
                            options.timingFunction(self.now - options.timer.start, startRect.x, self.amountOfChange(startRect.x, endRect.x), options.timer.duration),
                            options.timingFunction(self.now - options.timer.start, startRect.y, self.amountOfChange(startRect.y, endRect.y), options.timer.duration),
                            options.timingFunction(self.now - options.timer.start, startRect.width, self.amountOfChange(startRect.width, endRect.width), options.timer.duration),
                            options.timingFunction(self.now - options.timer.start, startRect.height, self.amountOfChange(startRect.height, endRect.height), options.timer.duration)
                        );
                    } else if (!isEmpty(options.timingFunction) && isObject(options.timingFunction)) {
                        currentRect = new Rect(
                            options.timingFunction.x(self.now - options.timer.start, startRect.x, self.amountOfChange(startRect.x, endRect.x), options.timer.duration),
                            options.timingFunction.y(self.now - options.timer.start, startRect.y, self.amountOfChange(startRect.y, endRect.y), options.timer.duration),
                            options.timingFunction.width(self.now - options.timer.start, startRect.width, self.amountOfChange(startRect.width, endRect.width), options.timer.duration),
                            options.timingFunction.height(self.now - options.timer.start, startRect.height, self.amountOfChange(startRect.height, endRect.height), options.timer.duration)
                        );
                    }
                } else {
                    if (!isEmpty(options.drawAfterAnimate) && options.drawAfterAnimate === false) {
                        return;
                    }
                    currentRect = endRect;
                }
                center = currentRect.getCenter();
                if (!isEmpty(options.startAlpha) && !isEmpty(options.endAlpha)) {
                    alpha = options.startAlpha + (self.delta(options.startAlpha, options.endAlpha, options.timer.end - options.timer.start) * (self.now - options.timer.start));
                    if (alpha < 0.0) {
                        alpha = 0.0
                    } else if (alpha > 1.0) {
                        alpha = 1.0;
                    }
                } else {
                    alpha = 1.0;
                }
            }
            self.context.save();
            self.context.setTransform(1, 0, 0, 1, 0, 0);
            self.context.translate(center.x, center.y);
            self.context.rotate(radian);
            self.context.translate(-center.x, -center.y);
            self.context.globalAlpha = alpha;
            self.context.fillStyle = options.color;
            self.context.fillRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
            self.context.restore();
        };


        var processText = function (text, rect, options) {
            var totalHeight, totalWidth, offset,
                overflowed, hyphenation, character, measure,
                fontSize, lines, line;
            lines = text.replaceAll('"', '').split(/[\r\n]+/);
            fontSize = options.fontSize >> 0 || 24;
            totalHeight = 0;

            self.context.save();
            if (isEmpty(options.fontfamily)) {
                if (navigator.userAgent.indexOf("iPhone") != -1 || navigator.userAgent.indexOf("iPad") != -1)
                    options.fontfamily = "HiraKakuProN-W3";
                else if (navigator.userAgent.indexOf("Android") != -1)
                    options.fontfamily = "Droid Sans";
                else
                    options.fontfamily = "MS PGothic";
            }
            self.context.font = fontSize + "px '" + options.fontfamily + "'";
            self.context.textBaseline = "top";
            self.context.strokeStyle = options.color || '#000';

            for (var i = 0; i < lines.length; i += 1) {
                totalWidth = 0;
                offset = 0;
                overflowed = null;
                hyphenation = false;
                line = lines[i].split('');
                for (var k = 0; k < line.length; k += 1) {
                    character = line[k];
                    measure = self.context.measureText(character);
                    totalWidth += measure.width;

                    if (totalWidth > (rect.width || 300)) {
                        if (!hyphenation && /[!%\),\.:;\?\]\}¢°’”‰′″℃、。々〉》」』】〕ぁぃぅぇぉっゃゅょゎ゛゜ゞァィゥェォッャュョヮヵヶ・ーヽヾ！％），．：；？］｝｡｣､･ｧｨｩｪｫｬｭｮｯｰﾞﾟ¢]+/.test(character)) {
                            hyphenation = true;
                        } else {
                            lines.splice(i + 1, 0, lines[i].substring(k));
                            lines[i] = lines[i].substring(0, k);
                            break;
                        }
                    }

                    offset += measure.width;
                }
                totalHeight += options.lineSpacing >> 0 || 30;
            }
            self.context.restore();
            return lines;
        };

        self.drawText = function(text, rect, options) {
            if (isEmpty(text)) text = '';
            var line, lines = processText(text, rect, options);
            var totalTime;
            var showLength;
            var metrics;
            var drawText;
            var lineCount = 0;

            if (self.now < options.startTime) return;
            totalTime = text.length * options.messageSpeed;
            showLength = Math.floor(text.length * ((self.now - options.startTime) / totalTime));
            for (var i = 0; i < lines.length; i++) {
                if (showLength <= 0) break;
                line = lines[i];
                lineCount = i;
                drawText = line.slice(0, showLength);
                self.context.save();
                if (isEmpty(options.fontfamily)) {
                    if (navigator.userAgent.indexOf("iPhone") != -1 || navigator.userAgent.indexOf("iPad") != -1)
                        options.fontfamily = "HiraKakuProN-W3";
                    else if (navigator.userAgent.indexOf("Android") != -1)
                        options.fontfamily = "Droid Sans";
                    else
                        options.fontfamily = "MS PGothic";
                }
                self.context.font = options.fontSize + "px '" + options.fontfamily + "'";
                self.context.fillStyle = options.color;
                metrics = self.context.measureText(drawText);
                self.context.fillText(
                    line.slice(0, showLength),
                    rect.x,
                    rect.y + options.fontSize + (lineCount * (options.fontSize + 10))
                );
                self.context.restore();
                showLength -= line.length;
            }
        };
    };

    return new Animation();
});$tenjoh.addComponent('UI.LayeredImage', function() {
    var LayeredImageFactory = function() {
        var self = this;
        var LayeredImageFrame = function(element, width, height) {
            var frame = this, layers = [];
            frame._element = element;
            frame._width = width;
            frame._height = height;
            frame._element.style.position = 'relative';
            frame._element.style.width = frame._width + 'px';
            frame._element.style.height = frame._height + 'px';
            if (!frame._element.id) {
                frame._element.id = $tenjoh.uniqueId();
            }
            frame.add = function(layer, order) {
                if (!layer._element.id) {
                    layer._element.id = frame._element.id + '.' + $tenjoh.uniqueId();
                }
                layer = {
                    layer: layer,
                    id: layer._element.id,
                    order: order
                };
                layers.push(layer);
                return layer.id;
            };
            frame.remove = function(id) {
                var layer;
                for (var i = 0; i < layers.length; i++) {
                    if (layers[i].id == id) {
                        layer = layers[i];
                        layers.splice(i, 1);
                        break;
                    }
                }
            };
            frame.refresh = function() {
                layers.sort(function(a, b) {
                    return a.order - b.order;
                });
                for (var i = 0; i < layers.length; i++) {
                    layers[i].layer.refresh();
                    frame._element.appendChild(layers[i].layer._element);
                }
            };
        };
        var ImageLayer = function() {
            var image = this;
            image._element = document.createElement('div');
            image.url = null;
            image.width = 0;
            image.height = 0;
            image.x = 0;
            image.y = 0;
            image.refresh = function() {
                if (isEmpty(image.url)) throw Error('ImageLayer.url is not defined.');
                image._element.style.position = 'absolute';
                image._element.style.width = image.width + 'px';
                image._element.style.height = image.height + 'px';
                image._element.style.left = image.x + 'px';
                image._element.style.top = image.y + 'px';
                image._element.style.backgroundImage = 'url(' + image.url + ')';
                image._element.style.backgroundRepeat = 'no-repeat';
            };
        };
        var AnimationLayer = function(element, width, height) {
            var animation = this;
            var applyKeyframesToDocument = function(keyframes) {
                var style = document.getElementById(animation._name), keyframeStyle;
                if (keyframes.length <= 1) throw Error('keyframes must set at least 1 keyframe.');
                keyframes.sort(function(a, b) { return a.position - b.position; });
                if (!style) {
                    style = document.createElement('style');
                    style.id = animation._name;
                    $root.rootElement.appendChild(style);
                }
                style.innerHTML = '@-webkit-keyframes ' + animation._name + ' { ';
                for (var i = 0; i < keyframes.length; i++) {
                    style.innerHTML += keyframes[i].position + '% {';
                    for (keyframeStyle in keyframes[i].styles) {
                        if (!keyframes[i].styles.hasOwnProperty(keyframeStyle)) continue;
                        style.innerHTML += keyframeStyle + ': ' + keyframes[i].styles[keyframeStyle] + '; ';
                    }
                    style.innerHTML += '} ';
                }
                style.innerHTML += ' }';
            };
            animation._element = document.createElement('div');
            animation._name = '˝˝DOMAnimationLayer_' + $tenjoh.uniqueId();
            animation.url = null;
            animation.width = 0;
            animation.height = 0;
            animation.x = 0;
            animation.y = 0;
            animation.duration = 0.0;
            animation.iteration = 'infinite';
            animation.direction = 'linear';
            animation.delay = 0.0;
            animation.keyframes = [];

            animation.addKeyframe = function(position, styles) {
                if (position == 'from') position = 0;
                if (position == 'to') position = 100;
                animation.keyframes.push({
                    position: position,
                    styles: styles
                });
            };

            animation.refresh = function() {
                if (isEmpty(animation.url)) throw Error('ImageLayer.url is not defined.');
                if (isEmpty(animation.keyframes)) throw Error('Animation Keyframe is not defined.');
                animation._element.style.position = 'absolute';
                animation._element.style.width = animation.width + 'px';
                animation._element.style.height = animation.height + 'px';
                animation._element.style.left = animation.x + 'px';
                animation._element.style.top = animation.y + 'px';
                animation._element.style.backgroundImage = 'url(' + animation.url + ')';
                animation._element.style.backgroundRepeat = 'no-repeat';
                animation._element.style.webkitAnimationName = animation._name;
                animation._element.style.webkitAnimationDuration = '' + animation.duration + 's';
                animation._element.style.webkitAnimationIterationCount = animation.iteration;
                animation._element.style.webkitAnimationDirection = animation.direction;
                animation._element.style.webkitAnimationDelay = animation.delay;
                applyKeyframesToDocument(animation.keyframes);
            };
        };

        self.createFrame = function(element, width, height) {
            return new LayeredImageFrame(element, width, height);
        };
        self.createImageLayer = function() {
            return new ImageLayer();
        };
        self.createAnimationLayer = function() {
            return new AnimationLayer();
        };
    };

    return new LayeredImageFactory();
});
$tenjoh.__widgets['Repeat'] = function() {
    var self = this;
    var nameResolve = function(tpl, index, widget) {
        var regxDoubleCurly = /\{\{[^\}]+\}\}/gm,
            subject = tpl, replace;
        return subject.replace(regxDoubleCurly, function(match) {
            var regx = new RegExp(widget.item + '([\\.\\s])', 'gm'),
                regxLoopIndex = /\$index[\s]*([\+\-\*\/%]?)[\s]*([0-9]*)/gm;
            match = match.replace(regx, function(match, sign) {
                return widget.from + '.' + index + sign;
            });
            match = match.replace(regxLoopIndex, function(match, sign, number) {
                if (sign == '' && number == '') {
                    replace = index;
                } else if (sign != '' && number != '') {
                    if (sign == '+') replace = index + Number(number);
                    else if (sign == '-') replace = index - number;
                    else if (sign == '*') replace = index * number;
                    else if (sign == '/') replace = index / number;
                    else if (sign == '%') replace = index % number;
                }
                return replace;
            });
            return match;
        });
    };
    self.Handler = function(element, template, partial) {
        var handler = this;
        handler.element = element;
        handler.template = template;
        handler.partial = partial;
        handler.from = self.from;
        handler.item = self.item;
        handler.execute = function() {
            var controller = handler.partial.getController(),
                objects, object, tpl, buffer = '', compiler;
            if (!handler.from || !handler.item) return false;
            if (isUndefined(controller[handler.from])) return false;
            objects = controller[handler.from];
            for (var i = 0; i < objects.length; i++) {
                object = objects[i];
                tpl = nameResolve(handler.template, i, handler);
                buffer += tpl;
            }
            handler.element.innerHTML = buffer;
            $tenjoh.Compiler.compileElement(handler.element, handler.partial);
            document.dispatchEvent($tenjoh.Event.onPartialLoad);
        };
    };
    self.load = function(element) {
        var controller = self.__caller.getController(),
            objects, object, tpl, buffer = '', handler, template = element.innerHTML;
        if (!self.from || !self.item) return false;
        if (isUndefined(controller[self.from])) return false;
        objects = controller[self.from];
        for (var i = 0; i < objects.length; i++) {
            object = objects[i];
            tpl = nameResolve(template, i, self);
            buffer += tpl;
        }
        element.innerHTML = buffer;
        $tenjoh.Compiler.compileElement(element, self.__caller);
        handler = new self.Handler(element, template, self.__caller);
        controller.getWatcher().handlers.push({name: self.from, handler: handler});
    };
};
$tenjoh.addWidget('LazyImage', function() {
    var self = this;
    var clear = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAMAAAAoyzS7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbW' +
                'FnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2' +
                'VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUC' +
                'BDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPS' +
                'JodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9Ii' +
                'IgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS' +
                '94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIH' +
                'htcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZD' +
                'pGREI5QzE2RjdENUYxMUUxQjg2NURGODZFMERFNjJFQyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGREI5QzE3MDdENUYxMU' +
                'UxQjg2NURGODZFMERFNjJFQyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkZEQjlDMTZEN0' +
                'Q1RjExRTFCODY1REY4NkUwREU2MkVDIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkZEQjlDMTZFN0Q1RjExRTFCODY1REY4Nk' +
                'UwREU2MkVDIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+dW' +
                'GPQQAAAAZQTFRF////AAAAVcLTfgAAAAF0Uk5TAEDm2GYAAAAMSURBVHjaYmAACDAAAAIAAU9tWeEAAAAASUVORK5CYII=';
    self.load = function(element) {
        var imageURL, image, wrapper, circle,
            onPartialLoad, onImageLoad, isImageLoad = false,
            style, styleId = 'TenjohLazyImage',
            ringRadius = self.ringradius || 25,
            circleRadius = self.circleradius || 10,
            numCircles = self.numcircles || 8,
            circleColor = self.circlecolor || 'pink',
            centerX, centerY, pointX, pointY, deltaOfAngle = 360 / numCircles;
        if (element.nodeName != 'IMG') {
            return;
        } else {
            if (!element.hasAttribute('width')) {
                throw Error('width attribute is not defined');
            }
            if (!element.hasAttribute('height')) {
                throw Error('height attribute is not defined');
            }
        }

        if (!document.getElementById(styleId)) {
            style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = '@-webkit-keyframes ' + styleId + ' { 0%{-webkit-transform:scale(1);} 100%{-webkit-transform:scale(.3);} }';
            $root.rootElement.appendChild(style);
        }

        imageURL = element.getAttribute('data-src');
        if (!isEmpty($tenjoh.options.baseImageURL)) imageURL = $tenjoh.options.baseImageURL + imageURL;
        if ($tenjoh.Compiler.hasDoubleCurly(imageURL)) {
            return;
        }
        element.src = clear;
        wrapper = document.createElement('div');
        wrapper.style.width = element.getAttribute('width') + 'px';
        wrapper.style.height = element.getAttribute('height') + 'px';
        wrapper.style.position = 'relative';
        centerX = element.getAttribute('width') / 2 >> 0;
        centerY = element.getAttribute('height') / 2 >> 0;
        for (var i = 0; i < numCircles; i++) {
            pointX = ringRadius * Math.sin(deltaOfAngle * i * (Math.PI/180)) >> 0;
            pointY = ringRadius * Math.cos(deltaOfAngle * i * (Math.PI/180)) >> 0;
            circle = document.createElement('div');
            circle.style.width = circle.style.height = circleRadius + 'px';
            circle.style.position = 'absolute';
            circle.style.left = pointX + centerX + 'px';
            circle.style.top = pointY + centerY + 'px';
            circle.style.backgroundColor = circleColor;
            circle.style.webkitBorderRadius = circleRadius + 'px';
            circle.style.webkitAnimationName = styleId;
            circle.style.webkitAnimationDuration = '' + (numCircles - 1) / 10.0 + 's';
            circle.style.webkitAnimationIterationCount = 'infinite';
            circle.style.webkitAnimationDirection = 'linear';
            circle.style.webkitAnimationDelay = '' + (i + 1) / 10.0 + 's';
            wrapper.appendChild(circle);
        }
        image = new Image();
        image.src = imageURL;
        onImageLoad = image.addEventListener('load', function(event) {
            isImageLoad = true;
            image.removeEventListener('load', onImageLoad);
            var interval = setInterval(function() {
                if (wrapper.parentNode) {
                    wrapper.parentNode.replaceChild(element, wrapper);
                    element.src = imageURL;
                    clearInterval(interval);
                } else {
                    element.src = imageURL;
                    clearInterval(interval);
                }
            }, 100);
        });
        onPartialLoad = document.addEventListener('onPartialLoad', function(event) {
            document.removeEventListener('onPartialLoad', onPartialLoad);
            var interval = setInterval(function() {
                if (element.parentNode){
                    if (!isImageLoad) {
                        element.parentNode.replaceChild(wrapper, element);
                    }
                    clearInterval(interval);
                }
            }, 100);
        });
    };
});$tenjoh.addWidget('Show', function() {
    var self = this;
    self.Handler = function(element, template, partial) {
        var handler = this;
        handler.element = element;
        handler.template = template;
        handler.partial = partial;
        handler.param = self.param;
        handler.condition = self.condition;
        handler.execute = function() {
            var controller = handler.partial.getController(),
                object, tpl, buffer = '';
            if (handler.param == null) return false;
            if (handler.condition == null) return false;
            if (isUndefined(controller.getProperty(handler.param))) return false;
            object = controller.getProperty(handler.param);
            if (String(object) == String(handler.condition)) {
                buffer = handler.template;
                element.style.display = '';
            } else {
                element.style.display = 'none';
            }
            handler.element.innerHTML = buffer;
            $tenjoh.Compiler.compileElement(handler.element, handler.partial);
        };
    };
    self.load = function(element) {
        var controller = self.__caller.getController(),
            object, tpl, buffer = '', handler, template = element.innerHTML;
        if (self.param == null) return false;
        if (self.condition == null) return false;
        if (isUndefined(controller.getProperty(self.param))) return false;
        object = controller.getProperty(self.param);
        if (String(object) == String(self.condition)) {
            buffer = template;
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }
        element.innerHTML = buffer;
        $tenjoh.Compiler.compileElement(element, self.__caller);
        handler = new self.Handler(element, template, self.__caller);
        controller.getWatcher().handlers.push({name: self.param, handler: handler});
    };
});
$tenjoh.addWidget('Hide', function() {
    var self = this;
    self.Handler = function(element, template, partial) {
        var handler = this;
        handler.element = element;
        handler.template = template;
        handler.partial = partial;
        handler.param = self.param;
        handler.condition = self.condition;
        handler.execute = function() {
            var controller = handler.partial.getController(),
                object, tpl, buffer = '';
            if (handler.param == null) return false;
            if (handler.condition == null) handler.condition = false;
            if (isUndefined(controller.getProperty(handler.param))) return false;
            object = controller.getProperty(handler.param);
            if (String(object) == String(handler.condition) || object == null || String(object) == '') {
                element.style.display = 'none';
            } else {
                buffer = handler.template;
                element.style.display = '';
            }
            handler.element.innerHTML = buffer;
            $tenjoh.Compiler.compileElement(handler.element, handler.partial);
        };
    };
    self.load = function(element) {
        var controller = self.__caller.getController(),
            object, tpl, buffer = '', handler, template = element.innerHTML;
        if (self.param == null) return false;
        if (self.condition == null) self.condition = false;
        if (isUndefined(controller.getProperty(self.param))) return false;
        object = controller.getProperty(self.param);
        if (String(object) == String(self.condition) || object == null || String(object) == '') {
            element.style.display = 'none';
        } else {
            buffer = template;
            element.style.display = '';
        }
        element.innerHTML = buffer;
        $tenjoh.Compiler.compileElement(element, self.__caller);
        handler = new self.Handler(element, template, self.__caller);
        controller.getWatcher().handlers.push({name: self.param, handler: handler});
    };
});(function() {
    var createElement = function(type, value, options, isInitial) {
        if (isInitial) return $tenjoh.DOM.createElement(type, value, options);
        else return value;
    };
    $tenjoh.UI.Fillter.addFilter('$div', function(value, controller, options, isInitial) { return createElement('div', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$span', function(value, controller, options, isInitial) { return createElement('span', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$img', function(value, controller, options, isInitial) { return createElement('img', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$p', function(value, controller, options, isInitial) { return createElement('p', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$em', function(value, controller, options, isInitial) { return createElement('em', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$text', function(value, controller, options, isInitial) { return createElement('text', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$password', function(value, controller, options, isInitial) { return createElement('password', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$submit', function(value, controller, options, isInitial) { return createElement('submit', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$reset', function(value, controller, options, isInitial) { return createElement('reset', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$hidden', function(value, controller, options, isInitial) { return createElement('hidden', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$checkbox', function(value, controller, options, isInitial) { return createElement('checkbox', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$radio', function(value, controller, options, isInitial) { return createElement('radio', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$textarea', function(value, controller, options, isInitial) { return createElement('textarea', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$button', function(value, controller, options, isInitial) { return createElement('button', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$a', function(value, controller, options, isInitial) { return createElement('a', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$h1', function(value, controller, options, isInitial) { return createElement('h1', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$h2', function(value, controller, options, isInitial) { return createElement('h2', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$h3', function(value, controller, options, isInitial) { return createElement('h3', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$h4', function(value, controller, options, isInitial) { return createElement('h4', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$h5', function(value, controller, options, isInitial) { return createElement('h5', value, options, isInitial); });
    $tenjoh.UI.Fillter.addFilter('$h6', function(value, controller, options, isInitial) { return createElement('h6', value, options, isInitial); });
})();

$tenjoh.UI.Fillter.addFilter('$date', function(value, controller, options) {
    var date = new Date(value);
    if (isEmpty(options) || isEmpty(options.format)) {
        return sprintf('%s/%s/%s %s:%s:%s',
            zeroPadding('' + date.getFullYear(), 4),
            zeroPadding('' + (date.getMonth() + 1), 2),
            zeroPadding('' + date.getDate(), 2),
            zeroPadding('' + date.getHours(), 2),
            zeroPadding('' + date.getMinutes(), 2),
            zeroPadding('' + date.getSeconds(), 2)
        );
    } else {
        if (options.format == 'mm/dd') {
            return sprintf('%s/%s',
                zeroPadding('' + (date.getMonth() + 1), 2),
                zeroPadding('' + date.getDate(), 2)
            );
        } else if (options.format == 'yyyy/mm/dd') {
            return sprintf('%s/%s/%s',
                zeroPadding('' + date.getFullYear(), 4),
                zeroPadding('' + (date.getMonth() + 1), 2),
                zeroPadding('' + date.getDate(), 2)
            );
        } else if (options.format == 'mm/dd hh:mm') {
            return sprintf('%s/%s %s:%s',
                zeroPadding('' + (date.getMonth() + 1), 2),
                zeroPadding('' + date.getDate(), 2),
                zeroPadding('' + date.getHours(), 2),
                zeroPadding('' + date.getMinutes(), 2)
            );
        }
    }
});$tenjoh.UI.Fillter.addFilter('$before', function(value, partial, options) {
	if (isUndefined(options.param)) return value;
	return options.param + value;
});
$tenjoh.UI.Fillter.addFilter('$after', function(value, partial, options) {
	if (isUndefined(options.param)) return value;
	return value + options.param;
});$tenjoh.UI.Fillter.addFilter('$figure', function(value, partial, options) {
    return String(value).replace(/([0-9]+?)(?=(?:[0-9]{3})+$)/g, '$1,');
});$tenjoh.RootController = function() {
    var self = this;
    var getPartialName = function(partialURL) {
        return partialURL.substr(partialURL.lastIndexOf('/') + 1, 1).toUpperCase() +
            partialURL.substring(partialURL.lastIndexOf('/') + 2, partialURL.indexOf('.'));
    };
    var appendPartialView = function(partialView) {
        self.rootElement.appendChild(partialView);
    };

    self.__controllers = [];
    self.getController = function(name) { return self.__controllers[name]; };
    self.setController = function(name, controller) { self.__controllers[name] = controller; };

    self.__partials = {};
    self.getPartial = function(partialName) { return self.__partials[partialName]; };
    self.setPartial = function(partial) { self.__partials[partial.name] = partial; };

    self.init = function() {
        var initPartial, partialName = 'Index';
        self.rootElement = document.getElementById('TenjohRoot');
        if (isEmpty(self.rootElement)) throw new Error('no root element defined');
        $tenjoh.Router.start();
    };
    self.discardPartial = function(name) {
        if (self.getPartial(name)) {
            self.getPartial(name).getView().innerHTML = '';
            delete self.__partials[name];
        }
    };
};
$tenjoh.Controller = function(partial) {
    var Watcher = function() {
        var watcher = this;
        watcher.__controller = null;
        watcher.setController = function(controller) { watcher.__controller = controller; };
        watcher.handlers = [];
        watcher.TagValueHandler = function() {
            var handler = this;
            handler.element = null;
            handler.execute = function(newValue) {
                if (isEmpty(handler.element) || isEmpty(newValue)) return false;
                newValue = $tenjoh.Compiler.compileDoubleCurly(handler.element.getAttribute('data-template'), watcher.__controller, false);
                $tenjoh.DOM.setValue(handler.element, newValue);
            };
        };
        watcher.TagAttributeHandler = function() {
            var handler = this;
            handler.element = null;
            handler.attributeName = null;
            handler.execute = function(newValue) {
                if (isEmpty(handler.element) || isEmpty(handler.attributeName) || isEmpty(newValue)) return false;
                handler.element.setAttribute(handler.attributeName, newValue);
            };
        };
        watcher.watchValue = function(element, propertyName) {
            var handler = new watcher.TagValueHandler();
            handler.element = element;
            watcher.handlers.push({name: propertyName, handler: handler});
        };
        watcher.watchAttribute = function(element, attributeName, propertyName) {
            var handler = new watcher.TagAttributeHandler();
            handler.element = element;
            handler.attributeName = attributeName;
            watcher.handlers.push({name: propertyName, handler: handler});
        };
        watcher.sync = function (propertyName) {
            var targetHandler, object;
            if (isEmpty(propertyName) || propertyName == '*') {
                for (var i = 0; i < watcher.handlers.length; i++) {
                    targetHandler = watcher.handlers[i];
                    targetHandler.handler.execute(watcher.__controller.getProperty(targetHandler.name));
                }
            } else {
                for (var i = 0; i < watcher.handlers.length; i++) {
                    targetHandler = watcher.handlers[i];
                    if (targetHandler.name && targetHandler.name == propertyName) {
                        targetHandler.handler.execute(watcher.__controller.getProperty(propertyName));
                    }
                }
                object = watcher.__controller.getProperty(propertyName);
                if (typeof object == $object) {
                    for (var key in object) {
                        if (object.hasOwnProperty(key)) {
                            watcher.sync(propertyName + '.' + key);
                        }
                    }
                }
            }
        };
    };
    var self = this;
    var watchElement = function(element) {
        partial.getController().getWatcher().watchValue(element, element.getAttribute('data-property-name'));
    };
    var watchAttribute = function(element) {
        if (element.hasAttribute('data-template')) {
            var templateString = element.getAttribute('data-template'),
                regxVariables = /([^:\s]+)\s*:\s*([^0-9:\s'"][^:\s'"]+)/g,
                commands = templateString.split('|'),
                tmpFillters = commands.slice(1);

            tmpFillters.forEach(function(fillter, index, array) {
                var fillterString = fillter.trim();
                var param;
                if (fillterString.indexOf(':') != -1) {
                    while (param = regxVariables.exec(fillterString)) {
                        partial.getController().getWatcher().watchAttribute(element, param[1], param[2]);
                    }
                }
            });
        }
    };
    var compileEventHandlers = function(element) {
        var eventHandler,
            eventHandlers =
                ['onblur', 'onchange', 'onclick', 'onfocus', 'onresize',
                 'onscroll', 'ontouchstart', 'ontouchend', 'ontouchmove', 'ontouchcancel'],
            attribute,
            attributes = element.attributes,
            handlerScript;
        if (element.hasAttributes()) {
            for (var i = attributes.length - 1; i >= 0; i--) {
                attribute = attributes[i];
                if (eventHandlers.indexOf(attribute.name) != -1) {
                    eventHandler = eventHandlers[eventHandlers.indexOf(attribute.name)];
                    handlerScript = element.getAttribute(eventHandler);
                    element.setAttribute(eventHandler, handlerScript);
                }
            }
        };
    };
    var autoBind = function(element) {
        var autoBindEvents = ['oninput', 'onchange'],
            eventHandler;
        for (var i = 0; i < autoBindEvents.length; i++) {
            if (element.name) {
                eventHandler  = element.getAttribute(autoBindEvents[i]) || '';
                eventHandler += sprintf("$root.getPartial('%s').getController().setProperty('%s', event.target.value);", partial.name, element.name);
                eventHandler += sprintf("$root.getPartial('%s').getController().getWatcher().sync('%s');", partial.name, element.name);
                element.setAttribute(autoBindEvents[i], eventHandler);
            }
        }
    };

    self.__partial = partial;
    self.getPartial = function() { return self.__partial; };
    self.__watcher = new Watcher();
    self.getWatcher = function() { return self.__watcher; };
    self.getWatcher().setController(self);
    self.getProperty = function(propertyName, object) {
        var index = propertyName.indexOf('.');
        if (isUndefined(object)) object = this;
        if (index == -1) {
            return object[propertyName];
        } else {
            return self.getProperty(propertyName.slice(index+1), object[propertyName.slice(0, index)]);
        }
    };
    self.setProperty = function(propertyName, value, object) {
        var index = propertyName.indexOf('.');
        if (isUndefined(object)) object = this;
        if (index == -1) {
            object[propertyName] = value;
        } else {
            if (isUndefined(object[propertyName.slice(0, index)])) object[propertyName.slice(0, index)] = {};
            return self.setProperty(propertyName.slice(index+1), value, object[propertyName.slice(0, index)]);
        }
    };
    self.discard = function() {
        self.__partial.discard();
    };
    self.bindElement = function(element) {
        if (element.hasAttribute('data-property-name')) {
            watchElement(element);
            watchAttribute(element);
            compileEventHandlers(element);
            autoBind(element);
        }
    };
};

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

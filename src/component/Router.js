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

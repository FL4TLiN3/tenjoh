$tenjoh.addComponent('Storage', function() {
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
});
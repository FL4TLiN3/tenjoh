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

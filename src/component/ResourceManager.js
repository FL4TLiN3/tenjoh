$tenjoh.addComponent('Resource', function() {
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
});
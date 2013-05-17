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

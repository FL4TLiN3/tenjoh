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

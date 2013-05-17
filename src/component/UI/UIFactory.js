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

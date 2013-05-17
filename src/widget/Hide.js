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
});
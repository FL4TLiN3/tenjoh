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

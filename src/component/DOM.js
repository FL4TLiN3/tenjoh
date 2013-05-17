$tenjoh.addComponent('DOM', function() {
    var DOM = function() {
        var self = this;
        var inputTags = ['input', 'textarea', 'select', 'button'];
        self.getValue = function(element) {
            if (element.nodeName == 'INPUT') {
                switch (element.type) {
                    case 'img':
                        return element.getAttribute('src');
                    case 'text':
                    case 'password':
                    case 'radio':
                    case 'button':
                    case 'submit':
                    case 'reset':
                    case 'hidden':
                        return element.value;
                    case 'checkbox':
                        return element.checked;
                }
            } else if (element.nodeName == 'TEXTAREA' ||
                       element.nodeName == 'SELECT' ||
                       element.nodeName == 'P' ||
                       element.nodeName == 'H1' ||
                       element.nodeName == 'H2' ||
                       element.nodeName == 'H3' ||
                       element.nodeName == 'H4' ||
                       element.nodeName == 'H5' ||
                       element.nodeName == 'H6' ||
                       element.nodeName == 'EM' ||
                       element.nodeName == 'SPAN') {
                return element.innerHTML;
            } else if (element.nodeName == 'IMG') {
                return element.getAttribute('src');
            }
        };
        self.setValue = function(element, value) {
            if (element.nodeName == 'INPUT') {
                switch (element.type) {
                    case 'text':
                    case 'password':
                    case 'radio':
                    case 'button':
                    case 'submit':
                    case 'reset':
                    case 'hidden':
                        element.setAttribute('value', value);
                        break;
                    case 'checkbox':
                        if (typeof value == $boolean) element.setAttribute('checked', value);
                        break;
                }
            } else if (element.nodeName == 'TEXTAREA' ||
                       element.nodeName == 'SELECT' ||
                       element.nodeName == 'P' ||
                       element.nodeName == 'H1' ||
                       element.nodeName == 'H2' ||
                       element.nodeName == 'H3' ||
                       element.nodeName == 'H4' ||
                       element.nodeName == 'H5' ||
                       element.nodeName == 'H6' ||
                       element.nodeName == 'EM' ||
                       element.nodeName == 'SPAN') {
                element.innerHTML = value;
            } else if (element.nodeName == 'IMG') {
                if (!isEmpty(value)) {
                    if (!isEmpty($tenjoh.options) && !isEmpty($tenjoh.options.baseImageURL))
                        element.setAttribute('src', $tenjoh.options.baseImageURL + value);
                    else
                        element.setAttribute('src', value);
                }
            }
        };
        self.findInputElements = function(element) {
            var inputElements = [], tempInputElements;
            inputTags.forEach(function(tagName, index,array){
                tempInputElements = element.getElementsByTagName(tagName);
                if (!isEmpty(tempInputElements)) {
                    inputElements = $tenjoh.Array.merge(inputElements, tempInputElements);
                }
            });
            return inputElements;
        };

        self.isElement = function(element) {
            return element && typeof element == $object && !isEmpty(element.nodeType) && element.nodeType === 1;
        };
        self.isTextNode = function(element) {
            return element && element.nodeType && element.nodeType == 3;
        };
        self.isCommentNode = function(element) {
            return element && element.nodeType && element.nodeType == 8;
        };
        self.isInputElement = function(element) {
            return (inputTags.indexOf(lowercase(element.tagName)) == -1) ? false : true;
        };
        self.isPartialElement = function(element) {
            return element.hasAttribute('data-partial');
        };
        self.isWidgetElement = function(element) {
            return element.hasAttribute('data-widget');
        };

        self.createElement = function(type, value, options) {
            var element;
            switch (type) {
                case 'img':
                    element = document.createElement('img');
                    if (!isEmpty(value)) {
                        if (!isEmpty($tenjoh.options) && !isEmpty($tenjoh.options.baseImageURL))
                            element.setAttribute('src', $tenjoh.options.baseImageURL + value);
                        else
                            element.setAttribute('src', value);
                    }
                    break;
                case 'text':
                case 'password':
                case 'submit':
                case 'reset':
                case 'hidden':
                    element = document.createElement('input');
                    element.setAttribute('type', type);
                    element.setAttribute('value', value);
                    if (options && options['data-property-name']) {
                        element.setAttribute('name', options['data-property-name']);
                    }
                    break;
                case 'checkbox':
                    element = document.createElement('input');
                    element.setAttribute('type', type);
                    if (typeof value == $boolean) element.setAttribute('checked', value);
                    break;
                case 'radio':
                    return createRadioButtons(type, value, options);
                case 'textarea':
                case 'button':
                default:
                    element = document.createElement(type);
                    element.innerHTML = value;
                    break;
            }
            for (var propertyName in options) {
                if (options.hasOwnProperty(propertyName)) {
                    if (propertyName != 'fillterName') element.setAttribute(propertyName, options[propertyName]);
                }
            }
            if (!element.hasAttribute('id')) {
                element.setAttribute('id', 'tenjoh#' + $tenjoh.uniqueId());
            }
            return element;
        };
    };

    return new DOM();
});



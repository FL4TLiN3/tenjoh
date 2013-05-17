$tenjoh.addComponent('Compiler', function() {
    var Compiler = function() {
        var self = this,
            regxDoubleCurly = /\{\{([^{}]+)\}\}/gm,
            regxFillterName = /^\s*[^\s]+/,
            regxStringSingleQuote = /([^:\s]+)\s*:\s*'([^']+)'/g,
            regxNumber = /([^:\s]+)\s*:\s*([0-9\.]+)/g,
            regxVariables = /([^:\s]+)\s*:\s*([^0-9:\s'"][^:\s'"]+)/g,
            regxLiteral = /(?:(^[0-9\.]+$)|^'((?:[^\\']|\\.)*)'$|^"((?:[^\\"]|\\.)*)"$)/gm;
        self.hasDoubleCurly = function(string) {
            return string && !(string.indexOf("{{") == -1 || string.lastIndexOf("}}") == -1);
        };
        var unescape = function(string) {
            var regxEscaped = /\\(.)/gm;
            return string.replace(regxEscaped, function(match, simbol) {
                return simbol;
            });
        };
        var isLiteral = function(string) {
            return regxLiteral.test(string);
        };
        var getLiteral = function(fillterOperand) {
            return fillterOperand.replace(regxLiteral, function(match, number, singleQuote, doubleQuote) {
                if (singleQuote || singleQuote == '') return unescape(singleQuote);
                else if (doubleQuote || doubleQuote == '') return unescape(doubleQuote);
                else return number;
            });
        };
        var loadSubPartial = function(element, superPartial) {
            var defaultParam = {}, attributes = element.attributes, subPartial,
                partialBuilder = new $tenjoh.UI.PartialBuilder();
            for (var i = 0; i < attributes.length; i++) {
                if (attributes[i].name.indexOf('data-') != -1) {
                    if (attributes[i].name == 'data-name') partialBuilder.name = attributes[i].value;
                    else if (attributes[i].name == 'data-partial') partialBuilder.url = attributes[i].value;
                    else defaultParam[attributes[i].name.replaceFirst('data-', '')] = attributes[i].value;
                }
            }
            partialBuilder.defaultParam = defaultParam;
            partialBuilder.element = element;
            partialBuilder.parent = superPartial;
            subPartial = partialBuilder.create();
            superPartial.__children.push(subPartial);
        };
        var loadWidget = function(element, partial) {
            var widgetName = element.getAttribute('data-widget'),
                widget = $tenjoh.getWidget(widgetName, partial),
                attributes = element.attributes, attribute;
            if (isEmpty(widget)) return false;
            for (var i = 0; i < attributes.length; i++) {
                attribute = attributes[i];
                if (attribute.name !== 'data-widget') {
                    widget[attribute.name.replaceAll('data-', '')] = attribute.value;
                }
            }
            widget.load(element);
        };
        var findFilltersByDoubleCurly = function(templateString, controller) {
            var commands = templateString.split('|'),
                fillters = [], propertyName = commands[0].trim(),
                tmpFillters = commands.slice(1);
            tmpFillters.forEach(function(fillter, index, array) {
                var fillterString = fillter.trim(); fillter = {};
                var param;
                if (fillterString.indexOf(':') == -1) {
                    fillter["fillterName"] = fillterString;
                } else {
                    fillter['fillterName'] = fillterString.match(regxFillterName)[0].trim();
                    while (param = regxStringSingleQuote.exec(fillterString)) {
                        fillter[param[1]] = param[2];
                    }
                    while (param = regxNumber.exec(fillterString)) {
                        if (param[2].indexOf('.') == -1) {
                            fillter[param[1]] = parseInt(param[2]);
                        } else {
                            fillter[param[1]] = parseFloat(param[2]);
                        }
                    }
                    while (param = regxVariables.exec(fillterString)) {
                        if (isUndefined(controller.getProperty(param[2]))) controller.setProperty(param[2], '');
                        fillter[param[1]] = controller.getProperty(param[2]);
                    }
                }
                fillter['data-property-name'] = propertyName;
                fillter['data-template'] = templateString;
                fillters.push(fillter);
            });
            return fillters;
        };
        var applyFillters = function(fillteredValue, fillters, controller, isInitial) {
            if (fillters.length > 0) {
                for (var i = 0; i < fillters.length; i++) {
                    fillteredValue = $tenjoh.UI.Fillter.execFillter(fillters[i].fillterName, fillteredValue, controller, fillters[i], isInitial);
                }
            }
            return fillteredValue;
        };
        var compileTextNode = function(textNode, parentElement, partial) {
            var match, newTextNode, replaces = [],
                nodes, parent;
            match = textNode.wholeText.match(regxDoubleCurly);
            if (match.length < 1) return;
            for (var i = 0; i < match.length; i++) {
                replaces.push({
                    key: match[i],
                    value: self.compileDoubleCurly(match[i], partial.getController(), true)
                });
            }
            nodes = correctTextNode(textNode, replaces);
            return nodes;
        };
        var correctTextNode = function(destTextNode, replaces) {
            var subject = destTextNode.wholeText, index, tmpIndex, target, atoms = [];
            var joinStringBefore = function(array, appendSring) {
                var result = array.clone();
                if (result.length == 0 || !isString(appendSring) || !isString(result[result.length - 1])) result.push(appendSring);
                else result[result.length - 1] = result[result.length - 1] + appendSring;
                return result;
            };
            var stringToText = function(array) {
                var result = array.clone();
                for (var i = 0; i < result.length; i++) if (isString(result[i])) result[i] = document.createTextNode(result[i]);
                return result;
            };
            do {
                index = subject.length;
                for (var i = 0; i < replaces.length; i++) {
                    tmpIndex = subject.indexOf(replaces[i].key);
                    if (tmpIndex == -1 || tmpIndex >= index) {
                        continue;
                    } else {
                        index = tmpIndex;
                        target = replaces[i];
                    }
                }
                if (index == subject.length) {
                    atoms = joinStringBefore(atoms, subject);
                    break;
                } else if (index == 0) {
                    atoms = joinStringBefore(atoms, target.value);
                    subject = subject.substr(target.key.length);
                } else if (index > 0) {
                    atoms = joinStringBefore(atoms, subject.substr(0, index));
                    atoms = joinStringBefore(atoms, target.value);
                    subject = subject.substr(index + target.key.length);
                }
            } while (subject.length != 0);
            return stringToText(atoms);
        };
        var compileAttribute = function(element, partial) {
            var match, newAttribute;
            for (var i = 0; i < element.attributes.length; i++) {
                if (self.hasDoubleCurly(element.attributes[i].value)) {
                    match = element.attributes[i].value.match(regxDoubleCurly);
                    for (var j = 0; j < match.length; j++) {
                        newAttribute = self.compileDoubleCurly(match[j], partial.getController(), true);
                        if (newAttribute) {
                            element.setAttribute(element.attributes[i].name, element.attributes[i].value.replaceFirst(match[j], newAttribute));
                        }
                    }
                }
            }
        };
        self.compileElement = function(element, partial) {
            var node, nodes, stack = [];
            var nodeIterator = document.createNodeIterator(
                element,
                NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_TEXT,
                { acceptNode: function(node) { return NodeFilter.FILTER_ACCEPT; } },
                false
            );

            while (node = nodeIterator.nextNode()) {
                if (node === element) continue;
                if (!$tenjoh.DOM.isTextNode(node)) {
                    if (node.hasAttributes()) compileAttribute(node, partial);
                    if ($tenjoh.DOM.isPartialElement(node)) {
                        stack.push({
                            fn: loadSubPartial,
                            node: node,
                            partial: partial
                        });
                    } else if ($tenjoh.DOM.isWidgetElement(node)) {
                        stack.push({
                            fn: loadWidget,
                            node: node,
                            partial: partial
                        });
                    }
                }
            }
            for (var i = 0; i < stack.length; i++) {
                if (stack[i].fn === loadSubPartial) stack[i].fn(stack[i].node, stack[i].partial);
                if (stack[i].fn === loadWidget) stack[i].fn(stack[i].node, stack[i].partial);
            }

            nodeIterator = document.createNodeIterator(
                element,
                NodeFilter.SHOW_ELEMENT + NodeFilter.SHOW_TEXT,
                { acceptNode: function(node) { return NodeFilter.FILTER_ACCEPT; } },
                false
            );
            while (node = nodeIterator.nextNode()) {
                if (node === element) continue;
                if ($tenjoh.DOM.isTextNode(node)) {
                    if (self.hasDoubleCurly(node.wholeText)) {
                        nodes = compileTextNode(node, element, partial);
                        for (var i = 0; i < nodes.length; i++) {
                            node.parentNode.insertBefore(nodes[i], node);
                            if ($tenjoh.DOM.isElement(nodes[i])) {
                                partial.getController().bindElement(nodes[i]);
                            }
                        }
                        node.parentNode.removeChild(node);
                    }
                }
            }
        };
        self.compileDoubleCurly = function(doubleCurly, controller, isInitial) {
            var propertyName, fillters;
            if (isEmpty(isInitial)) isInitial = false;
            doubleCurly = doubleCurly.replaceFirst('{{', '');
            doubleCurly = doubleCurly.replaceFirst('}}', '');
            if (doubleCurly.indexOf('|') == -1) {
                propertyName = doubleCurly.trim();
                if (isLiteral(propertyName)) return getLiteral(propertyName);
                if (isUndefined(controller.getProperty(propertyName))) {
                    controller.setProperty(propertyName, '');
                }
                return '' + controller.getProperty(propertyName);
            } else {
                fillters = findFilltersByDoubleCurly(doubleCurly, controller);
                propertyName = doubleCurly.split('|')[0].trim();
                if (isLiteral(propertyName)) return applyFillters(getLiteral(propertyName), fillters, controller, isInitial);
                if (isUndefined(controller.getProperty(propertyName))) {
                    controller.setProperty(propertyName, '');
                }
                return applyFillters(controller.getProperty(propertyName), fillters, controller, isInitial);
            }
        };
    };

    return new Compiler();
});

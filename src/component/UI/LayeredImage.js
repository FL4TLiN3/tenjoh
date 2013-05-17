$tenjoh.addComponent('UI.LayeredImage', function() {
    var LayeredImageFactory = function() {
        var self = this;
        var LayeredImageFrame = function(element, width, height) {
            var frame = this, layers = [];
            frame._element = element;
            frame._width = width;
            frame._height = height;
            frame._element.style.position = 'relative';
            frame._element.style.width = frame._width + 'px';
            frame._element.style.height = frame._height + 'px';
            if (!frame._element.id) {
                frame._element.id = $tenjoh.uniqueId();
            }
            frame.add = function(layer, order) {
                if (!layer._element.id) {
                    layer._element.id = frame._element.id + '.' + $tenjoh.uniqueId();
                }
                layer = {
                    layer: layer,
                    id: layer._element.id,
                    order: order
                };
                layers.push(layer);
                return layer.id;
            };
            frame.remove = function(id) {
                var layer;
                for (var i = 0; i < layers.length; i++) {
                    if (layers[i].id == id) {
                        layer = layers[i];
                        layers.splice(i, 1);
                        break;
                    }
                }
            };
            frame.refresh = function() {
                layers.sort(function(a, b) {
                    return a.order - b.order;
                });
                for (var i = 0; i < layers.length; i++) {
                    layers[i].layer.refresh();
                    frame._element.appendChild(layers[i].layer._element);
                }
            };
        };
        var ImageLayer = function() {
            var image = this;
            image._element = document.createElement('div');
            image.url = null;
            image.width = 0;
            image.height = 0;
            image.x = 0;
            image.y = 0;
            image.refresh = function() {
                if (isEmpty(image.url)) throw Error('ImageLayer.url is not defined.');
                image._element.style.position = 'absolute';
                image._element.style.width = image.width + 'px';
                image._element.style.height = image.height + 'px';
                image._element.style.left = image.x + 'px';
                image._element.style.top = image.y + 'px';
                image._element.style.backgroundImage = 'url(' + image.url + ')';
                image._element.style.backgroundRepeat = 'no-repeat';
            };
        };
        var AnimationLayer = function(element, width, height) {
            var animation = this;
            var applyKeyframesToDocument = function(keyframes) {
                var style = document.getElementById(animation._name), keyframeStyle;
                if (keyframes.length <= 1) throw Error('keyframes must set at least 1 keyframe.');
                keyframes.sort(function(a, b) { return a.position - b.position; });
                if (!style) {
                    style = document.createElement('style');
                    style.id = animation._name;
                    $root.rootElement.appendChild(style);
                }
                style.innerHTML = '@-webkit-keyframes ' + animation._name + ' { ';
                for (var i = 0; i < keyframes.length; i++) {
                    style.innerHTML += keyframes[i].position + '% {';
                    for (keyframeStyle in keyframes[i].styles) {
                        if (!keyframes[i].styles.hasOwnProperty(keyframeStyle)) continue;
                        style.innerHTML += keyframeStyle + ': ' + keyframes[i].styles[keyframeStyle] + '; ';
                    }
                    style.innerHTML += '} ';
                }
                style.innerHTML += ' }';
            };
            animation._element = document.createElement('div');
            animation._name = '˝˝DOMAnimationLayer_' + $tenjoh.uniqueId();
            animation.url = null;
            animation.width = 0;
            animation.height = 0;
            animation.x = 0;
            animation.y = 0;
            animation.duration = 0.0;
            animation.iteration = 'infinite';
            animation.direction = 'linear';
            animation.delay = 0.0;
            animation.keyframes = [];

            animation.addKeyframe = function(position, styles) {
                if (position == 'from') position = 0;
                if (position == 'to') position = 100;
                animation.keyframes.push({
                    position: position,
                    styles: styles
                });
            };

            animation.refresh = function() {
                if (isEmpty(animation.url)) throw Error('ImageLayer.url is not defined.');
                if (isEmpty(animation.keyframes)) throw Error('Animation Keyframe is not defined.');
                animation._element.style.position = 'absolute';
                animation._element.style.width = animation.width + 'px';
                animation._element.style.height = animation.height + 'px';
                animation._element.style.left = animation.x + 'px';
                animation._element.style.top = animation.y + 'px';
                animation._element.style.backgroundImage = 'url(' + animation.url + ')';
                animation._element.style.backgroundRepeat = 'no-repeat';
                animation._element.style.webkitAnimationName = animation._name;
                animation._element.style.webkitAnimationDuration = '' + animation.duration + 's';
                animation._element.style.webkitAnimationIterationCount = animation.iteration;
                animation._element.style.webkitAnimationDirection = animation.direction;
                animation._element.style.webkitAnimationDelay = animation.delay;
                applyKeyframesToDocument(animation.keyframes);
            };
        };

        self.createFrame = function(element, width, height) {
            return new LayeredImageFrame(element, width, height);
        };
        self.createImageLayer = function() {
            return new ImageLayer();
        };
        self.createAnimationLayer = function() {
            return new AnimationLayer();
        };
    };

    return new LayeredImageFactory();
});

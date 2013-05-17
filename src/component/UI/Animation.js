$tenjoh.addComponent('Animation', function() {
    var Animation = function() {
        var self = this;
        var tryCount = 0;
        self.createScene = function(elementId) {
            return new Scene(elementId);
        };
        self.startScene = function(scene) {
            if (scene.start) {
                return false;
            }
            try {
                if (!scene.isReady()) throw Error('scene is not ready');
            } catch(e) {
                if (tryCount > scene.__readyTimeout / 10) {
                    scene.__onError(e);
                    throw e;
                } else {
                    if (document.getElementById(scene.__elementId)) {
                        setTimeout(function() {
                            self.startScene(scene);
                            tryCount++;
                        }, 10);
                    }
                    return false;
                }
            }
            scene.__start = true;
            scene.setStartTime();
            scene.animate();
        };

        self.linearTween = function (time, startValue, amountOfChange, duration) { return amountOfChange*time/duration + startValue; };
        self.easeInQuad = function (time, startValue, amountOfChange, duration) { time /= duration; return amountOfChange*time*time + startValue; };
        self.easeOutQuad = function (time, startValue, amountOfChange, duration) { time /= duration; return -amountOfChange * time*(time-2) + startValue; };
        self.easeInOutQuad = function (time, startValue, amountOfChange, duration) { time /= duration/2; if (time < 1) return amountOfChange/2*time*time + startValue; time--; return -amountOfChange/2 * (time*(time-2) - 1) + startValue; };
        self.easeInCubic = function (time, startValue, amountOfChange, duration) { time /= duration; return amountOfChange*time*time*time + startValue; };
        self.easeOutCubic = function (time, startValue, amountOfChange, duration) { time /= duration; time--; return amountOfChange*(time*time*time + 1) + startValue; };
        self.easeInOutCubic = function (time, startValue, amountOfChange, duration) { time /= duration/2; if (time < 1) return amountOfChange/2*time*time*time + startValue; time -= 2; return amountOfChange/2*(time*time*time + 2) + startValue; };
        self.easeInQuart = function (time, startValue, amountOfChange, duration) { time /= duration; return amountOfChange*time*time*time*time + startValue; };
        self.easeOutQuart = function (time, startValue, amountOfChange, duration) { time /= duration; time--; return -amountOfChange * (time*time*time*time - 1) + startValue; };
        self.easeInOutQuart = function (time, startValue, amountOfChange, duration) { time /= duration/2; if (time < 1) return amountOfChange/2*time*time*time*time + startValue; time -= 2; return -amountOfChange/2 * (time*time*time*time - 2) + startValue; };
        self.easeInQuint = function (time, startValue, amountOfChange, duration) { time /= duration; return amountOfChange*time*time*time*time*time + startValue; };
        self.easeOutQuint = function (time, startValue, amountOfChange, duration) { time /= duration; time--; return amountOfChange*(time*time*time*time*time + 1) + startValue; };
        self.easeInOutQuint = function (time, startValue, amountOfChange, duration) { time /= duration/2; if (time < 1) return amountOfChange/2*time*time*time*time*time + startValue; time -= 2; return amountOfChange/2*(time*time*time*time*time + 2) + startValue; };
        self.easeInSine = function (time, startValue, amountOfChange, duration) { return -amountOfChange * Math.cos(time/duration * (Math.PI/2)) + amountOfChange + startValue; };
        self.easeOutSine = function (time, startValue, amountOfChange, duration) { return amountOfChange * Math.sin(time/duration * (Math.PI/2)) + startValue; };
        self.easeInOutSine = function (time, startValue, amountOfChange, duration) { return -amountOfChange/2 * (Math.cos(Math.PI*time/duration) - 1) + startValue; };
        self.easeInExpo = function (time, startValue, amountOfChange, duration) { return amountOfChange * Math.pow( 2, 10 * (time/duration - 1) ) + startValue; };
        self.easeOutExpo = function (time, startValue, amountOfChange, duration) { return amountOfChange * ( -Math.pow( 2, -10 * time/duration ) + 1 ) + startValue; };
        self.easeInOutExpo = function (time, startValue, amountOfChange, duration) { time /= duration/2; if (time < 1) return amountOfChange/2 * Math.pow( 2, 10 * (time - 1) ) + startValue; time--; return amountOfChange/2 * ( -Math.pow( 2, -10 * time) + 2 ) + startValue; };
        self.easeInCirc = function (time, startValue, amountOfChange, duration) { time /= duration; return -amountOfChange * (Math.sqrt(1 - time*time) - 1) + startValue; };
        self.easeOutCirc = function (time, startValue, amountOfChange, duration) { time /= duration; time--; return amountOfChange * Math.sqrt(1 - time*time) + startValue; };
        self.easeInOutCirc = function (time, startValue, amountOfChange, duration) { time /= duration/2; if (time < 1) return -amountOfChange/2 * (Math.sqrt(1 - time*time) - 1) + startValue; time -= 2; return amountOfChange/2 * (Math.sqrt(1 - time*time) + 1) + startValue; };
        self.easeTitleMove = function(time, startValue, amountOfChange, duration){
            return startValue + amountOfChange * Math.sin(((time/duration) * 130 * Math.PI / 180)) * 1.3;
        };
        self.easeStarMove = function(time, startValue, amountOfChange, duration){
            return startValue + amountOfChange * Math.sin(((time/duration) * 180 * Math.PI / 180));
        };
        self.easeSinUp = function (time, startValue, amountOfChange, duration) {
            return amountOfChange * Math.sin(time/duration * 720 * (Math.PI/180)) * 0.05 + startValue;
        };
        self.easeSinUp2 = function (time, startValue, amountOfChange, duration) {
            return amountOfChange * Math.sin(time/duration * 1440 * (Math.PI/180)) * 0.05 + startValue;
        };
    };

    var Point = function(x, y) {
        this.x = x;
        this.y = y;
    };
    var Rect = function(x, y, width, height) {
        var self = this;
        self.x = x;
        self.y = y;
        self.width = width;
        self.height = height;
        self.getPoint = function() { return new Point(self.x, self.y); };
        self.getCenter = function() { return new Point(self.width / 2 + self.x, self.height / 2 + self.y); };
    };
    var Timer = function(start, end) {
        this.start = start;
        this.end = end;
        this.duration = end - start;
    };

    var Scene = function(elementId) {
        var self = this;
        var tryCount = 0;
        var init = function(_elementId) {
            try {
                for (var i = 0; i < self.__necessaryResource.length; i++) {
                    var resource = $tenjoh.Resource.get(self.__necessaryResource[i]);
                    if (!resource.loaded) throw Error('resource is not loaded');
                }
                self.canvas = document.getElementById(_elementId);
                self.width = self.canvas.getAttribute('width');
                self.height = self.canvas.getAttribute('height');
                self.__ready = true;
            } catch(e) {
                if (tryCount > self.__readyTimeout / 10) {
                    self.__onError(e);
                    throw e;
                } else {
                    if (document.getElementById(_elementId)) {
                        setTimeout(function() {
                            init(_elementId);
                            tryCount++;
                        }, 10);
                    }
                }
            }
        };
        setTimeout(function() { init(elementId); }, 1);
        var drawAnimationDuration = function() {
            var duration = now() - self.startTS,
                text = sprintf('%d:%d:%d.%d', duration/60/60/1000, duration/60/1000, duration/1000, duration%1000);
            self.context.save();
            self.context.font = '31px';
            self.context.strokeStyle = 'red';
            self.context.strokeText(text, 20, 20);
            self.context.restore();
        };
        self.amountOfChange = function(p1, p2) {
            return p2 - p1;
        };
        self.delta = function(p1, p2, duration) {
            return self.amountOfChange(p1, p2) / duration;
        };
        self.debug = !isEmpty($tenjoh.options.debugAnimation) && $tenjoh.options.debugAnimation === true;
        self.__elementId = elementId;
        self.getElementId = function() { return self.__elementId; };
        self.canvas = null;
        self.context = null;
        self.width = null;
        self.height = null;
        self.objects = {};
        self.__ready = false;
        self.isReady = function() { return self.__ready; };
        self.__readyTimeout = 10000;
        self.setReadyTimeout = function(readyTimeout) { self.__readyTimeout = readyTimeout; };
        self.__start = false;
        self.isStart = function() { return self.__start; };
        self.__pose = false;
        self.isPose = function() { return self.__pose; };
        self.__finished = false;
        self.isFinished = function() { return self.__finished; };
        self.__necessaryResource = null;
        self.setNecessaryResource = function(resources) { self.__necessaryResource = resources; };
        self.beforeAnimate = false;
        self.__onFinish = null;
        self.setOnFinish = function(fn) { self.__onFinish = fn; };
        self.__onError = function() {};
        self.setOnError = function(fn) { self.__onError = fn; };
        self.__beforeAnimate = null;
        self.setBeforeAnimate = function(fn) { self.__beforeAnimate = fn; };
        self.__drawFunction = null;
        self.setDrawFunction = function(fn) { self.__drawFunction = fn; };
        self.__defaultFrameRate = 29.97;
        self.__frameRate = self.__defaultFrameRate;
        self.__lastFrameTime = null;
        self.currentTS = null;
        self.startTS = null;
        self.now = null;
        self.makePoint = function(x, y) { return new Point(x, y); };
        self.makeRect = function(x, y, width, height) { return new Rect(x, y, width, height); };
        self.makeTimer = function(start, end) { end = (isEmpty(end) ? 10000 : end) ; return new Timer(start, end); };
        self.setStartTime = function() {
            self.startTS = now();
        };
        self.clear = function() {
            self.canvas.getContext('2d').clearRect(0, 0, self.width, self.height);
        };
        self.animate = function() {
            var frameStartTime, frameEndTime, processTime,
                frameLength = 1000 / self.__frameRate;
            self.context = self.canvas.getContext('2d');
            frameStartTime = now();
            self.currentTS = frameStartTime;
            self.now = self.currentTS - self.startTS;

            if (!self.beforeAnimate) {
                try {
                    self.__beforeAnimate(self);
                } catch(e) {
                    self.__onError(e);
                    throw e;
                }
                self.beforeAnimate = true;
            }

            if (self.__pose) {
                return false;
            }

            self.clear();
            try {
                if (self.__drawFunction(self)) {
                    frameEndTime = now();
                    processTime = frameEndTime - frameStartTime;

                    if (self.debug) {
                        self.context.save();
                        self.context.font = '31px';
                        self.context.strokeStyle = 'red';
                        self.context.strokeText(self.__frameRate, 20, 20);
                        self.context.restore();
                    }

                    self.__frameRate = 1000 / processTime;
                    if (frameLength <= processTime) {
                        setTimeout(self.animate, 0);
                    } else {
                        if (self.__frameRate >= self.__defaultFrameRate) {
                            self.__frameRate = self.__defaultFrameRate;
                        }
                        frameLength = 1000 / self.__frameRate;
                        setTimeout(self.animate, frameLength - processTime);
                    }
                } else {
                    self.__finished = true;
                    if (self.debug) {
                        drawAnimationDuration();
                    }
                    if (self.__onFinish) self.__onFinish();
                }
            } catch(e) {
                self.__onError(e);
                throw e;
            }
        };
        self.stop = function() {
            self.__drawFunction = function() { return false; };
        };
        self.pose = function() {
            self.__lastFrameTime = now();
            self.__pose = true;
        };
        self.play = function(time) {
            var suspendTime = self.__lastFrameTime - self.startTS;
            self.__finished = false;
            if (self.__pose) {
                self.startTS = now() - suspendTime;
                self.__pose = false;
            }
            if (!isEmpty(time)) {
                self.startTS = now() - time;
            }
            self.animate();
        };

        self.drawImage = function(image, rect, timer) {
            if (!isEmpty(timer)) {
                if (self.currentTS < timer.start || self.currentTS >= timer.end) {
                    return false;
                }
            }
            self.context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
        };
        self.drawImageRotate = function(image, rect, timer, angle) {
            if (!isEmpty(timer)) {
                if (self.currentTS < timer.start || self.currentTS >= timer.end) {
                    return false;
                }
            }
            var radian = angle * Math.PI / 180,
                center = rect.getCenter();
            self.context.save();
            self.context.setTransform(1, 0, 0, 1, 0, 0);
            self.context.translate(center.x, center.y);
            self.context.rotate(radian);
            self.context.translate(-center.x, -center.y);
            self.context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
            self.context.restore();
        };

        self.drawImageAnimate = function(image, startRect, endRect, options) {
            var currentRect, center, alpha = 1.0, alphaEffectTiming, radian;

            if (isEmpty(endRect)) {
                endRect = startRect;
            }
            if (!isEmpty(options)) {
                if (isEmpty(options.timer)) {
                    options.timer = self.makeTimer(0);
                }
                if (self.now < options.timer.start) {
                    return;
                } else if (self.now >= options.timer.start && self.now < options.timer.end) {
                    if (!isEmpty(options.timingFunction) && isFunction(options.timingFunction)) {
                        currentRect = new Rect(
                            options.timingFunction(self.now - options.timer.start, startRect.x, self.amountOfChange(startRect.x, endRect.x), options.timer.duration),
                            options.timingFunction(self.now - options.timer.start, startRect.y, self.amountOfChange(startRect.y, endRect.y), options.timer.duration),
                            options.timingFunction(self.now - options.timer.start, startRect.width, self.amountOfChange(startRect.width, endRect.width), options.timer.duration),
                            options.timingFunction(self.now - options.timer.start, startRect.height, self.amountOfChange(startRect.height, endRect.height), options.timer.duration)
                        );
                    } else if (!isEmpty(options.timingFunction) && isObject(options.timingFunction)) {
                        currentRect = new Rect(
                            options.timingFunction.x(self.now - options.timer.start, startRect.x, self.amountOfChange(startRect.x, endRect.x), options.timer.duration),
                            options.timingFunction.y(self.now - options.timer.start, startRect.y, self.amountOfChange(startRect.y, endRect.y), options.timer.duration),
                            options.timingFunction.width(self.now - options.timer.start, startRect.width, self.amountOfChange(startRect.width, endRect.width), options.timer.duration),
                            options.timingFunction.height(self.now - options.timer.start, startRect.height, self.amountOfChange(startRect.height, endRect.height), options.timer.duration)
                        );
                    }


                } else {
                    if (!isEmpty(options.drawAfterAnimate) && options.drawAfterAnimate === false) {
                        return;
                    }
                    currentRect = endRect;
                }

                center = currentRect.getCenter();
                if (!isEmpty(options.rotateCenter)){
                    center = options.rotateCenter;
                }
                if (!isEmpty(options.angle)) {
                    radian = options.angle * Math.PI / 180;
                } else if (isEmpty(options.angle) && !isEmpty(options.startAngle) && !isEmpty(options.endAngle)) {
                    if(isEmpty(options.rotationDirection) || options.rotationDirection === 1){
                        radian = options.startAngle + (self.delta(options.startAngle, options.endAngle, options.timer.end - options.timer.start) * (self.now - options.timer.start));
                        radian = radian * Math.PI / 180;
                        if (radian < options.startAngle * Math.PI / 180) {
                            radian = options.startAngle * Math.PI / 180;
                        } else if (radian > options.endAngle * Math.PI / 180) {
                            radian = options.endAngle * Math.PI / 180;
                        }
                    } else if(options.rotationDirection === -1) {
                        radian = options.startAngle + (self.delta(options.startAngle, options.endAngle, options.timer.end - options.timer.start) * (self.now - options.timer.start));
                        radian = radian * Math.PI / 180;
                        if (radian < options.endAngle * Math.PI / 180) {
                            radian = options.endAngle * Math.PI / 180;
                        } else if (radian > options.startAngle * Math.PI / 180) {
                            radian = options.startAngle * Math.PI / 180;
                        }
                    }
                } else {
                    radian = 0;
                }

                if (!isEmpty(options.alpha)) {
                    if (isString(options.alpha)) {
                        switch(options.alpha) {
                            case 'fadeInOut':
                                alphaEffectTiming = (self.now - (options.timer.start - self.startTS)) % options.iterationDuration;
                                if (alphaEffectTiming < 0) {
                                    alpha = 0.0
                                } else {
                                    alpha = (Math.sin(360 * alphaEffectTiming / options.iterationDuration * Math.PI / 180) + 1) / 2;
                                }
                                break;
                        }
                    } else if(isNumber(options.alpha)) {
                        alpha = options.alpha;
                    }
                } else if (isEmpty(options.alpha) && !isEmpty(options.startAlpha) && !isEmpty(options.endAlpha)) {
                    alpha = options.startAlpha + (self.delta(options.startAlpha, options.endAlpha, options.timer.end - options.timer.start) * (self.now - options.timer.start));
                    if (alpha < 0.0) {
                        alpha = 0.0
                    } else if (alpha > 1.0) {
                        alpha = 1.0;
                    }
                } else {
                    alpha = 1.0;
                }
            }

            self.context.save();
            self.context.setTransform(1, 0, 0, 1, 0, 0);
            self.context.translate(center.x, center.y);
            self.context.rotate(radian);
            self.context.translate(-center.x, -center.y);
            self.context.globalAlpha = alpha;
            if (options.clipX != undefined && options.clipY != undefined) {
                self.context.drawImage(image, options.clipX, options.clipY, currentRect.width, currentRect.height, currentRect.x, currentRect.y, currentRect.width, currentRect.height);
            } else {
                self.context.drawImage(image, currentRect.x, currentRect.y, currentRect.width, currentRect.height);
            }
            self.context.restore();
        };
        self.drawRectAnimate = function(startRect, endRect, options) {
            var currentRect, alpha;
            var radian = options.angle * Math.PI / 180,
                center;
            if (!isEmpty(options)) {
                if (isEmpty(options.timer)) {
                    options.timer = self.makeTimer(0);
                }
                if (self.now < options.timer.start) {
                    return;
                } else if (self.now >= options.timer.start && self.now < options.timer.end) {
                    if (!isEmpty(options.timingFunction) && isFunction(options.timingFunction)) {
                        currentRect = new Rect(
                            options.timingFunction(self.now - options.timer.start, startRect.x, self.amountOfChange(startRect.x, endRect.x), options.timer.duration),
                            options.timingFunction(self.now - options.timer.start, startRect.y, self.amountOfChange(startRect.y, endRect.y), options.timer.duration),
                            options.timingFunction(self.now - options.timer.start, startRect.width, self.amountOfChange(startRect.width, endRect.width), options.timer.duration),
                            options.timingFunction(self.now - options.timer.start, startRect.height, self.amountOfChange(startRect.height, endRect.height), options.timer.duration)
                        );
                    } else if (!isEmpty(options.timingFunction) && isObject(options.timingFunction)) {
                        currentRect = new Rect(
                            options.timingFunction.x(self.now - options.timer.start, startRect.x, self.amountOfChange(startRect.x, endRect.x), options.timer.duration),
                            options.timingFunction.y(self.now - options.timer.start, startRect.y, self.amountOfChange(startRect.y, endRect.y), options.timer.duration),
                            options.timingFunction.width(self.now - options.timer.start, startRect.width, self.amountOfChange(startRect.width, endRect.width), options.timer.duration),
                            options.timingFunction.height(self.now - options.timer.start, startRect.height, self.amountOfChange(startRect.height, endRect.height), options.timer.duration)
                        );
                    }
                } else {
                    if (!isEmpty(options.drawAfterAnimate) && options.drawAfterAnimate === false) {
                        return;
                    }
                    currentRect = endRect;
                }
                center = currentRect.getCenter();
                if (!isEmpty(options.startAlpha) && !isEmpty(options.endAlpha)) {
                    alpha = options.startAlpha + (self.delta(options.startAlpha, options.endAlpha, options.timer.end - options.timer.start) * (self.now - options.timer.start));
                    if (alpha < 0.0) {
                        alpha = 0.0
                    } else if (alpha > 1.0) {
                        alpha = 1.0;
                    }
                } else {
                    alpha = 1.0;
                }
            }
            self.context.save();
            self.context.setTransform(1, 0, 0, 1, 0, 0);
            self.context.translate(center.x, center.y);
            self.context.rotate(radian);
            self.context.translate(-center.x, -center.y);
            self.context.globalAlpha = alpha;
            self.context.fillStyle = options.color;
            self.context.fillRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
            self.context.restore();
        };


        var processText = function (text, rect, options) {
            var totalHeight, totalWidth, offset,
                overflowed, hyphenation, character, measure,
                fontSize, lines, line;
            lines = text.replaceAll('"', '').split(/[\r\n]+/);
            fontSize = options.fontSize >> 0 || 24;
            totalHeight = 0;

            self.context.save();
            if (isEmpty(options.fontfamily)) {
                if (navigator.userAgent.indexOf("iPhone") != -1 || navigator.userAgent.indexOf("iPad") != -1)
                    options.fontfamily = "HiraKakuProN-W3";
                else if (navigator.userAgent.indexOf("Android") != -1)
                    options.fontfamily = "Droid Sans";
                else
                    options.fontfamily = "MS PGothic";
            }
            self.context.font = fontSize + "px '" + options.fontfamily + "'";
            self.context.textBaseline = "top";
            self.context.strokeStyle = options.color || '#000';

            for (var i = 0; i < lines.length; i += 1) {
                totalWidth = 0;
                offset = 0;
                overflowed = null;
                hyphenation = false;
                line = lines[i].split('');
                for (var k = 0; k < line.length; k += 1) {
                    character = line[k];
                    measure = self.context.measureText(character);
                    totalWidth += measure.width;

                    if (totalWidth > (rect.width || 300)) {
                        if (!hyphenation && /[!%\),\.:;\?\]\}¢°’”‰′″℃、。々〉》」』】〕ぁぃぅぇぉっゃゅょゎ゛゜ゞァィゥェォッャュョヮヵヶ・ーヽヾ！％），．：；？］｝｡｣､･ｧｨｩｪｫｬｭｮｯｰﾞﾟ¢]+/.test(character)) {
                            hyphenation = true;
                        } else {
                            lines.splice(i + 1, 0, lines[i].substring(k));
                            lines[i] = lines[i].substring(0, k);
                            break;
                        }
                    }

                    offset += measure.width;
                }
                totalHeight += options.lineSpacing >> 0 || 30;
            }
            self.context.restore();
            return lines;
        };

        self.drawText = function(text, rect, options) {
            if (isEmpty(text)) text = '';
            var line, lines = processText(text, rect, options);
            var totalTime;
            var showLength;
            var metrics;
            var drawText;
            var lineCount = 0;

            if (self.now < options.startTime) return;
            totalTime = text.length * options.messageSpeed;
            showLength = Math.floor(text.length * ((self.now - options.startTime) / totalTime));
            for (var i = 0; i < lines.length; i++) {
                if (showLength <= 0) break;
                line = lines[i];
                lineCount = i;
                drawText = line.slice(0, showLength);
                self.context.save();
                if (isEmpty(options.fontfamily)) {
                    if (navigator.userAgent.indexOf("iPhone") != -1 || navigator.userAgent.indexOf("iPad") != -1)
                        options.fontfamily = "HiraKakuProN-W3";
                    else if (navigator.userAgent.indexOf("Android") != -1)
                        options.fontfamily = "Droid Sans";
                    else
                        options.fontfamily = "MS PGothic";
                }
                self.context.font = options.fontSize + "px '" + options.fontfamily + "'";
                self.context.fillStyle = options.color;
                metrics = self.context.measureText(drawText);
                self.context.fillText(
                    line.slice(0, showLength),
                    rect.x,
                    rect.y + options.fontSize + (lineCount * (options.fontSize + 10))
                );
                self.context.restore();
                showLength -= line.length;
            }
        };
    };

    return new Animation();
});
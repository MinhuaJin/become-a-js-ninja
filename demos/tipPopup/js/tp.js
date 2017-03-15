/**
 * Created by minhua on 2017/2/14.
 */
(function (w) {
    var _ = {
        $: function (id) {
            return document.getElementById(id);
        },
        on: function (ele, type, fn) {
            if (window.addEventListener) {
                ele.addEventListener(type, fn, false);
            } else if (window.attachEvent) {
                ele.attachEvent('on' + type, function (e) {
                    e = window.event;
                    e.target = e.srcElement;
                    fn.call(ele, e);
                });
            } else {
                ele['on' + type] = function (e) {
                    e = window.event;
                    e.target = e.srcElement;
                    fn.call(ele, e);
                };
            }
        }
    };

    function Tooltip() {
        this.wrap = (function () {
            var domEl = document.createElement('div');
            domEl.id = 'tp_wrap';
            domEl.className = 'tp-wrap';
            domEl.style.display = 'none';
            document.getElementsByTagName('body')[0].appendChild(domEl);
            return domEl;
        })();
        this.isLoaded = !1;
        this.debouncer = null;
        this.delay = 300;//ms
        this.followMargin = 20;
        this.tmpl = '<div class="tp-cont">\
                        <img src="@img@">\
                        @msg@\
                    </div>';

        if (!this.bindTip && this instanceof Tooltip) {
            Tooltip.prototype.init = function (target, isBubble) {
                if (isBubble) {
                    if (target.style.position === 'static' || target.style.position === '') {
                        target.style.position = 'relative';
                    }
                    this.bindBubble(target);
                } else {
                    this.bindTip(target);
                }
            };

            Tooltip.prototype.bindTip = function (target) {
                var _this = this,
                    m = this.followMargin;
                _.on(target, 'mouseover', function (e) {
                    e = e || w.event;
                    _this.wrap.className = 'tp-wrap';
                    _this.follow(e.clientX, e.clientY);
                    _this.render(target);
                });
                _.on(target, 'mousemove', function (e) {
                    e = e || w.event;
                    _this.follow(e.clientX, e.clientY);
                });
                _.on(target, 'mouseout', function (e) {
                    _this.wrap.style.display = 'none';
                });
            };

            Tooltip.prototype.bindBubble = function (target) {
                var _this = this;
                _.on(target, 'mouseenter', function (e) {
                    clearTimeout(_this.debouncer);
                    e = e || w.event;
                    _this.wrap.className = 'tp-wrap bubble';
                    _this.locate(target, e.clientY);
                    _this.debouncer = setTimeout(function () {
                        _this.render(target);
                    }, _this.delay);
                });
                _.on(target, 'mouseleave', function (e) {
                    clearTimeout(_this.debouncer);
                    _this.debouncer = setTimeout(function () {
                        _this.wrap.style.display = 'none';
                    }, _this.delay);
                });
            };

            Tooltip.prototype.render = function (target) {
                var wrapEl = this.wrap;
                wrapEl.innerHTML = this.tmpl.replace(/@(\w+)@/g, function (match, p1) {
                    return target.getAttribute('data-' + p1);
                });
                wrapEl.style.display = 'block';
            };

            Tooltip.prototype.follow = function (x, y) {
                var wrap = this.wrap,
                    m = this.followMargin;
                wrap.style.left = x + m + 'px';
                wrap.style.top = y + m + 'px';
                wrap.style.bottom = 'auto';
            };
            Tooltip.prototype.locate = function (target, clientY) {
                var wrap = this.wrap,
                    totalH = target.offsetHeight + this.followMargin;
                wrap.style.left = '50%';
                if (clientY >= totalH) {
                    wrap.style.top = 'auto';
                    wrap.style.bottom = totalH + 'px';
                    wrap.className = 'tp-wrap bubble up';
                } else {
                    wrap.style.top = totalH + 'px';
                    wrap.style.bottom = 'auto';
                    wrap.className = 'tp-wrap bubble down';
                }
                target.appendChild(wrap);
            };
        }

    }

    var tooltip = new Tooltip();
    tooltip.init(_.$('icon_help'));
    tooltip.init(_.$('icon_help_2'), true);
})(window);



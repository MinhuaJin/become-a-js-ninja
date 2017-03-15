/**
 * Created by minhua on 2017/1/23.
 */
var ut = (function () {
    /**
     * isEs5 判断浏览器是否支持ES5
     * Firefox4(2.0)+  Chrome5+  IE9+  Opera12+  Safari5+
     * @type {boolean}
     */
    var isEs5 = (Object.keys instanceof Function);
    /**
     * forIn 遍历对象的可枚举自身属性
     * @param o 被遍历对象
     * @param fn 每次遍历时执行的函数，执行时有3个参数传入：当前属性值，当前属性名，被遍历对象
     */
    var forIn = (function (o, fn) {
        if (isEs5) {
            return function (o, fn) {
                Object.keys(o).forEach(function (key) {
                    fn(o[key], key, o);
                });
            }
        } else {
            return function (o, fn) {
                for (var key in o) {
                    if (o.hasOwnProperty(key)) {
                        fn(o[key], key, o);
                    }
                }
            }
        }
    })();
    /**
     * filter 过滤数组
     * @param arr 被遍历数组
     * @param fn 每次遍历时执行的函数，返回值为真则保留当前元素，执行时有3个参数传入：当前元素，当前索引，被遍历数组
     * @param thisArg 可选，传值则指定fn中的this指向，
     * @return [array] 新数组，只保留满足条件的元素。原数组不变。
     */
    var filter = (function (arr, testFn, thisArg) {
        if (isEs5) {
            return function (arr, testFn, thisArg) {
                return arr.filter(testFn, thisArg);
            }
        } else {
            return function (arr, testFn, thisArg) {
                var filtered = [], i = 0, len = arr.length;
                thisArg = thisArg || arr;
                for (i; i < len; i++) {
                    if (testFn.call(thisArg, arr[i], i, arr)) {
                        filtered.push(arr[i]);
                    }
                }
                return filtered;
            }
        }
    })();
    /**
     * getByClass 根据类名获取元素集合
     * @param strClass 支持多个类名获取，以空格字符（\s）分隔，前后可有多余空格字符
     * @param context 获取元素的上下文语境，不传值时默认body
     * return 返回数组（不是类数组）
     */
    var getByClass = (function () {
        if (document.getElementsByClassName) {
            return function (strClass, context) {
                context = context || $('body')[0];
                return Array.prototype.slice.call(context.getElementsByClassName(strClass), 0);
            }
        } else {
            return function (strClass, context) {
                context = context || $('body')[0];
                var nodes = context.getElementsByTagName('*'),
                    nodesLen = nodes.length,
                    aClass = trim(strClass).replace(/\s+/g, ' ').split(' '),
                    clsLen = aClass.length,
                    i, j,
                    curNode,
                    isMatch,
                    matched = [];
                for (i = 0; i < nodesLen; i++) {
                    curNode = nodes[i];
                    isMatch = !0;
                    for (j = 0; j < clsLen; j++) {
                        if (!hasClass(curNode, aClass[j])) {
                            isMatch = !1;
                            break;
                        }
                    }
                    isMatch && (matched.push(curNode));
                }
                return matched;
            };
        }
    })();

    /**
     * $ 模拟JQ元素选择器(只支持单层)
     * @param selector '#ABC'获取ID为'ABC'的元素，'.ABC.DE'获取同时具有'ABC'和'DE'类名的元素，'LI'获取标签名为'LI'的元素
     * @param context 获取元素的上下文语境，不传值时 获取类名默认body,获取其他默认document
     * @return {*}
     */
    function $(selector, context) {
        var mark = selector[0],
            name = selector.slice(1),
            doms;
        switch (mark) {
            case '#':
                context = context || document;
                doms = context.getElementById(name);
                break;
            case '.':
                context = context || $('body')[0];
                doms = getByClass(name.split('.').join(' '), context);
                break;
            default:
                context = context || document;
                doms = context.getElementsByTagName(selector);
        }
        return doms;
    }

    /**
     * request
     * @param cfg
     */
    function request(cfg) {
        var isIE = window.navigator.appName.toUpperCase() === 'MICROSOFT INTERNET EXPLORER',
            body = document.getElementsByTagName('body')[0],
            firstChild = body.firstChild,
            script = document.createElement('script'),
            url = cfg.url,
            isScript = cfg.dataType === 'script' || !cfg.dataType,
            data = cfg.data,
            success = cfg.success,
            jsonp,//callback = ?
            callback,//callbackName
            query,
            key;

        if (data) {
            query = [];
            for (key in data) {
                if (data.hasOwnProperty(key)) {
                    query.push(key + '=' + data[key]);
                }
            }
        }
        if (isScript) {
            url = url + '?' + (query ? query.join('&') : '');
        } else {//dataType === 'jsonp'
            jsonp = cfg.jsonp || 'callback';
            callback = cfg.callback || 'jsonp' + new Date().getTime();
            url = url + '?' + (query ? query.join('&') : '') + '&' + jsonp + '=' + callback;
            window[callback] = function (result) {
                success(result);
            };
        }
        script.src = url;
        script.type = 'text/javascript';
        script.charset = 'utf-8';
        if (isIE) {
            script.onreadystatechange = function () {
                if (script.readyState === 'loaded') {
                    console.log('loaded');
                    isScript && success && success();
                    destroy();
                }
            };
        } else {
            script.onload = function () {
                console.log('loaded');
                isScript && success && success();
                destroy();
            }
        }
        body.insertBefore(script, firstChild);

        function destroy() {
            setTimeout(function () {
                body.removeChild(script);
                script.onload = script.onreadystatechange = null;
                !isScript && (window[callback] = null);
            }, 50);
        }
    }


    function parseUrl(url) {
        var _url, location, hash, query, params, i, len, search, param;
        if (url) {
            url = decodeURIComponent(url);
            _url = url.split('#');
            hash = _url[1];
            query = _url[0].split('?')[1];
        } else {
            location = window.location;
            url = decodeURIComponent(location);
            hash = decodeURIComponent(location.hash.slice(1));
            query = decodeURIComponent(location.search.slice(1));
        }
        if (query) {
            params = query.split('&');
            len = params.length;
            search = {};
            for (i = 0; i < len; i++) {
                param = params[i].split('=');
                search[param[0]] = param[1];
            }
        }
        return {search: search, hash: hash, url: url};
    }

    var on = (function () {
        if (window.addEventListener) {
            return function (ele, type, fn, useCapture) {
                ele.addEventListener(type, fn, !!useCapture);
            }
        } else if (window.attachEvent) {
            return function (ele, type, fn) {
                ele.attachEvent('on' + type, function (e) {
                    e = window.event;
                    e.target = e.srcElement;
                    fn.call(ele, e);
                });
            }
        }
    })();


    function hasClass(curEle, strClass) {
        var reg = new RegExp('(?:^|\\s+)' + strClass + '(?:\\s+|$)');
        return reg.test(curEle.className);
    }

    function addClass(curEle, strClass) {
        if (hasClass(curEle, strClass)) return;
        curEle.className += ' ' + strClass;
        curEle.className = trim(curEle.className.replace(/\s+/g, ' '));
    }

    function removeClass(curEle, strClass) {
        var reg;
        if (!hasClass(curEle, strClass)) return;
        reg = new RegExp('(?:^|\\s+)' + strClass + '(?:\\s+|$)');
        curEle.className = trim(curEle.className.replace(reg, ' ').replace(/\s+/g, ' '));
    }

    function trim(str) {
        return str.replace(/^\s+/, '').replace(/\s+$/, '');
    }

    function forEach(arr, fn) {
        var i = 0, len = arr.length;
        for (i; i < len; i++) {
            fn(arr[i], i, arr);
        }
    }

    /**
     * find 遍历数组，找到满足条件的第一项元素时跳出循环并返回该元素
     * @param arr 被遍历数组
     * @param testFn 用于检验的函数，必须有返回值，且为布尔值
     * @param callback 可选，找到元素后执行的回调函数
     * @return {*}
     */
    function find(arr, testFn, callback) {
        var found, i = 0, len = arr.length;
        for (i; i < len; i++) {
            if (testFn(arr[i], i, arr)) {
                found = arr[i];
                callback && callback(found, i, arr);
                break;
            }
        }
        return found;
    }

    /**
     * children 获取元素的子元素，支持单个类名过滤或标签名过滤
     * @param ele
     * @param selector 可选，支持单个类名过滤或标签名过滤
     * @return {Array} 返回数组，没有找到满足条件的子元素时返回空数组
     */
    function children(ele, selector) {
        var nodes,
            doms = [],
            clsName,
            tagName;
        if (selector && selector.indexOf('.') === -1) {//filter by tagName
            tagName = selector.toLowerCase();
            nodes = ele.getElementsByTagName(tagName);
            forEach(nodes, function (curNode) {
                if (curNode.parentNode === ele) {
                    doms.push(curNode);
                }
            });
        } else if (selector && selector.indexOf('.') > -1) {//filter by className
            clsName = selector.substring(1);
            nodes = ele.childNodes;
            forEach(nodes, function (curNode) {
                if (curNode.parentNode === ele && curNode.nodeType === 1 &&
                    clsName && hasClass(curNode, clsName)) {
                    doms.push(curNode);
                }
            });
        } else {
            if (isEs5) {
                nodes = ele.children;
                forEach(nodes, function (curNode) {
                    if (curNode.parentNode === ele) {
                        doms.push(curNode);
                    }
                });
            } else {
                nodes = ele.childNodes;
                forEach(nodes, function (curNode) {
                    if (curNode.parentNode === ele && curNode.nodeType === 1) {
                        doms.push(curNode);
                    }
                });
            }
        }
        return doms;
    }

    /**
     * css 获取或设置样式
     * @param ele 元素
     * @param prop 属性
     * @param val 可选，不传值为获取，传值则为设置，必须传单位
     * @return {Number} 设置时没有返回值，获取时返回不带单位的值
     */
    function css(ele, prop, val) {
        var result;
        if (arguments.length === 2) {//get
            result = getComputedStyle in window ? window.getComputedStyle(ele, null)[prop] : ele.currentStyle[prop];
            return isNaN(parseFloat(result)) ? result : parseFloat(result);
        } else {//set
            ele.style[prop] = val;
        }
    }

    function changeHeightTo(ele, end) {
        var pace = (end - css(ele, 'height')) / 10;
        ele.changeHeightTimer && clearInterval(ele.changeHeightTimer);

        if (pace >= 0) {
            ele.changeHeightTimer = setInterval(function () {
                var now = css(ele, 'height');
                if (now + pace >= end) {
                    css(ele, 'height', end);
                    clearInterval(ele.changeHeightTimer);
                    return;
                }
                css(ele, 'height', now + pace);
            }, 30);
        } else {
            ele.changeHeightTimer = setInterval(function () {
                var now = css(ele, 'height');
                if (now + pace <= end) {
                    css(ele, 'height', end);
                    clearInterval(ele.changeHeightTimer);
                    return;
                }
                css(ele, 'height', now + pace);
            }, 30);
        }
    }

    function timestamp(interval) {
        var factor = 1;
        if (!interval && typeof interval === 'string') {
            switch (interval) {
                case 'day':
                    factor = 24 * 60 * 60 * 1000;
                    break;
                case 'hour':
                    factor = 60 * 60 * 1000;
                    break;
                case 'min':
                    factor = 60 * 1000;
                    break;
            }
        }
        return Math.round(Date.now() / factor);
    }

    function lazyImg(cont) {
        forEach(cont.getElementsByTagName('img'), function (curImg) {
            if (!curImg.src) {
                curImg.src = curImg.getAttribute('data-src');
            }
        });
    }

    function bind(fn, ele) {
        var arg = Array.prototype.slice.call(arguments, 2);
        return function () {
            fn.apply(ele, arg);
        }
    }

    function show(ele) {
        ele.style.display = 'block';
    }

    function hide(ele) {
        ele.style.display = 'none';
    }

    function round(number, precision) {
        var factor = Math.pow(10, precision),
            tempNumber = number * factor,
            roundedTempNumber = Math.round(tempNumber);
        return (roundedTempNumber / factor).toFixed(precision);
    }

    return {
        isEs5: isEs5,
        $: $,
        forIn: forIn,
        filter: filter,
        getByClass: getByClass,
        hasClass: hasClass,
        addClass: addClass,
        removeClass: removeClass,
        forEach: forEach,
        find: find,
        children: children,
        css: css,
        on: on,
        changeHeightTo: changeHeightTo,
        timestamp: timestamp,
        request: request,
        lazyImg: lazyImg,
        bind: bind,
        show: show,
        hide: hide,
        round: round
    };
})();

var widgets = (function () {
    var $ = ut.$;
    var isCss3App = !/MSIE [6-9]/i.test(navigator.appVersion);
    //选项卡
    function Tab(opt) {
        this.onChange = opt.onChange;
        this.onRendor = opt.onRendor;
        this.pairs = opt.pairs;
        this.tags = [];
        this.type = opt.type;
        this.activeClass = opt.activeClass;
        for (tagId in this.pairs) {
            if (this.pairs.hasOwnProperty(tagId)) {
                this.add(tagId, this.pairs[tagId]);
            }
        }
        this.curTagId = this.tags[0];
        this.curConId = this.pairs[this.curTagId];
        this.shiftStyle();
        this.onRendor && this.onRendor.call(this);
        this.onChange && this.onChange.call(this);
    }

    Tab.prototype = {
        constructor: Tab,
        add: function (tagId, conId) {
            var that = this;
            this.pairs[tagId] = conId;
            this.tags.push(tagId);
            ut.on($('#' + tagId), that.type, function () {
                that.trigger.call(that, this.id);
            });
        },
        shiftStyle: function () {
            for (var tag in this.pairs) {
                if (this.pairs.hasOwnProperty(tag)) {
                    ut.hide($('#' + this.pairs[tag]));
                    ut.removeClass($('#' + tag), this.activeClass);
                }
            }
            ut.addClass($('#' + this.curTagId), this.activeClass);
            ut.show($('#' + this.curConId));
        },
        trigger: function (tagId) {
            if (tagId === this.curTagId) return;
            this.curTagId = tagId;
            this.curConId = this.pairs[this.curTagId];
            this.shiftStyle();
            this.onChange && this.onChange.call(this);
        }
    };
    //手风琴
    function buildAccordion(opt) {
        var container = opt.container,
            itemBoxes = ut.children(container, '.can-unfold'),
            firstBox = itemBoxes[0],
            foldHeight = opt.foldHeight,
            unfoldHeight = opt.unfoldHeight,
            timer;

        var doAccord = (function (curItemBox) {//isCss3App只判断一次后重写方法
            if (isCss3App) {
                return function (curItemBox) {
                    init(curItemBox)
                }
            } else {
                return function (curItemBox) {
                    ut.forEach(itemBoxes, function (box) {
                        ut.changeHeightTo(box, foldHeight);
                    });
                    ut.changeHeightTo(curItemBox, unfoldHeight);
                    ut.lazyImg(curItemBox);
                }
            }
        })();

        ut.forEach(itemBoxes, function (curItemBox) {
            var itemTt = ut.children(curItemBox)[0];
            ut.on(itemTt, 'mouseenter', function (e) {
                timer = setTimeout(function () {
                    doAccord(itemTt.parentNode);
                }, 300);
            });
            ut.on(itemTt, 'mouseleave', function (e) {
                timer && clearTimeout(timer);
            });

        });
        init(firstBox);
        isCss3App && ut.addClass(container, 'css-animate');

        function init(curBox) {
            ut.forEach(itemBoxes, function (box) {
                ut.css(box, 'height', foldHeight);
            });
            ut.css(curBox, 'height', unfoldHeight);
            ut.lazyImg(curBox);
        }
    }

    return {
        Tab: Tab,
        buildAccordion: buildAccordion
    }
})();


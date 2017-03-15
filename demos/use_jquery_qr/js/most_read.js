/**
 * Created by minhua on 2017/3/3.
 */
(function ($) {

    var mostRead = {
        init: function ($cont) {
            this.loadStyle();
            this.$cont = $cont;
            this.request();
        },
        newsTmpl: '<div class="item-card">\
                            <img class="item-pic" src="@image@" alt="@title@">\
                            <div class="item-text">\
                                <h4>@title@</h4>\
                                <ul><li>@create_date@</li><li>@create_time@</li><li>@author_name@</li></ul>\
                            </div>\
                            <span>\u0041\u0050\u0050\u4e13\u4eab</span>\
                       </div>',
        popupTmpl: '<div class="item-text">\
                            <h4>@title@</h4>\
                            <ul><li>@create_date@</li><li>@create_time@</li><li>@author_name@</li></ul>\
                        </div>\
                        <div class="pop-body">\
                            <div class="qr">@qr_code@</div>\
                            <div class="text">\u626b\u7801\u770b\u539f\u6587</div>\
                        </div>',
        loadStyle: function(){
            $('<link rel="stylesheet" href="css/most_read.css">').appendTo($('head'));
        },
        request: function () {
            var _this = this,
                data = window.data,
                res = data.result,
                stat = res.status,
                aData = res.data;
            /*$.ajax({
                url: 'api/article_top3',
                dataType: 'script',
                success: function (data) {
                    var res = data.result,
                        stat = res.status,
                        aData = res.data;

                    if (stat.code) {
                        console.log('Request for article_top3 failed with msg:' + stat.msg);
                    } else {
                        _this.renderNews(aData);
                        _this.bindPopup(aData);
                    }
                }
            });*/
            if (stat.code) {
                console.log('Request for article_top3 failed with msg:' + stat.msg);
            } else {
                _this.renderNews(aData);
                _this.bindPopup(aData);
            }
        },
        renderNews: function (newsData) {
            var _this = this, contHtml = [];
            $(newsData).each(function (index, itemData) {
                var curElContent = _this.newsTmpl.replace(/@(\w+)@/g, function (m, p1) {
                    return itemData[p1];
                });

                if(!itemData.image){//if no image, add class 'no-pic' to the container;
                    curElContent = curElContent.replace('class="item-card"','class="item-card no-pic"');
                }
                contHtml.push(curElContent);
            });
            this.$cont.append(contHtml.join(''));
        },
        bindPopup: function (newsData) {
            var _this = this,
                newsItems = this.$cont.find('.item-card');
            //init popup content and its event handler for each item to store the content in this closure
            //no need for repetitive initiation for popup content on every click
            $(newsData).each(function (index, itemData) {
                var popContent,
                    curItem = newsItems.eq(index);
                //store the qrcode(table html) as string in itemData to allow global regExp replacement of the html template
                itemData.qr_code = _this.getQrCode(itemData.url);
                popContent = _this.popupTmpl.replace(/@(\w+)@/g, function (m, p1) {
                    return itemData[p1];
                });
                curItem.on('click', function () {
                    _this.showPopup(popContent);
                });
            });
            $('#tmp_qr_div').remove();//remove the el used for preloading qr tables
        },
        showPopup: (function () {
            var body = $('body'),
                milkyLayer = $('<div class="milky-layer" style="display: none;"></div>').appendTo(body),
                popupWrap = $('<div class="most-read-popup" style="display: none;"></div>').appendTo(body);
            popupWrap.on('click', '.btn-close', function () {
                popupWrap.hide();
                milkyLayer.hide();
            });
            return function (content) {
                milkyLayer.show();
                popupWrap.empty().append('<span class="btn-close"></span>').append(content).show();
            }
        })(),
        getQrCode: (function () {
            //rendering qrcode as table is costly, so preload it in a temporary node and save it in itemData as string
            var tmpQrDiv = $('<div id="tmp_qr_div" style="display:none;"></div>').appendTo('body');
            return function (url) {
                tmpQrDiv.empty().qrcode({
                    render: 'table',//either 'table' or 'canvas'; choose table for wide compatibility;
                    text: url,
                    width: 150,
                    height: 150
                });
                return tmpQrDiv.html();
            }
        })()
    };

    mostRead.init($('#most_read'));

})(jQuery);

/**
 * Created by minhua on 2016/11/29.
 */

var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var url = [
    'http://survey.finance.sina.com.cn/survey.php?id=115656&dpc=1',
    'http://survey.finance.sina.com.cn/survey.php?id=115471&dpc=1',
    'http://survey.finance.sina.com.cn/survey.php?id=115696&dpc=1',
    'http://survey.finance.sina.com.cn/survey.php?id=115278&dpc=1'
];

function processBody($){
    var $form = $('#JS_Survey_Form');
    var pollData = {
        pollId : $form.attr('name').slice(7),//调查标识
        pollCont : []//调查内容，存放所有调查问题和选项
    };
    $form.find('dl').each(function(){
        var dl =$(this);
        var question = {
            required : dl.attr('checknull') === '1',//是否必填
            cover : dl.attr('cover') || null,//checkedNum的验证合法范围，如1-4意味着选择数=0或者>4都无法通过验证
            question : dl.find('dt').text().replace('（必选 ）',''),//问题（不包含‘（必填 ）’）
            options : []//选项
        };
        dl.find('dd').each(function(){
            var dd = $(this);
            var input = dd.find('input');
            question.options.push({
                label: dd.find('label').text(),
                name: input.attr('name'),
                value: input.val(),
                type : input.attr('type')//分别保存input type，方便后期字符串拼接
            });
        });
        pollData.pollCont.push(question);
    });
    fs.writeFileSync('./json/pollData_' + pollData.pollId + '.json',JSON.stringify(pollData));
}
url.forEach(function(curUrl){
    http.get(curUrl, function (res) {
        var chunks = [];
        res.on('data', function (chunk) {
            chunks.push(chunk);
        });
        res.on('end', function () {
            var decodedBody = iconv.decode(Buffer.concat(chunks),'gb2312');
            var $ = cheerio.load(decodedBody,{decodeEntities:false});
            processBody($);
        });
    }).on('error',function(){
        console.log('获取数据出错！')
    });
});


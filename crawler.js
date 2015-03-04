var http = require('http');

if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
  };
}

var request = require('request');
var cheerio = require('cheerio');
function getPage(){
    
    var proxy = request.defaults({proxy: "http://173.208.248.221:7808"});

    var req = proxy.get({uri: 'http://www.yelp.com/search?find_loc=CA', encoding: 'utf8'});
    var str;
    req.on('data', function(chunk){
        str+=chunk;
    });
    req.on('end', function() {
        $ = cheerio.load(str);
        if($("#content h2").html() === "Sorry, you&apos;re not allowed to access this page."){
            console.log("fail proxy");
        }
    });
}

function getProxyList(){
    req = request.get({uri: 'http://www.us-proxy.org/', encoding: 'utf8'});
    var str;
    req.on('data', function(chunk){
        str+=chunk;
    });
    req.on('end', function() {
        $ = cheerio.load(str);
        $("#proxylisttable tr").each(function(key,val){
            if($(val).html().startsWith("<td>")){
                var row = $(val).html()
                var ip = $(row).first().html();
                var port = $(row).first().next().html()
                console.log(ip+":"+port);
            }
        })
//        console.log($("#proxylisttable tr"));
    });
}

getProxyList();
//getPage();


//callback = function(response) {
//  var str = '';
//
//  //another chunk of data has been recieved, so append it to `str`
//  response.on('data', function (chunk) {
//    str += chunk;
//  });
//
//  //the whole response has been recieved, so we just print it out here
//  response.on('end', function () {
//      var cheerio = require('cheerio'),
//    $ = cheerio.load(str);
//    console.log(str);
////    var res = $('address');
//////    console.log(res);
////    for(var key in res){
////        console.log(res[key]['children']);
////    }
//  });
//}



//callback = function(response) {
//  var str = '';
//
//  //another chunk of data has been recieved, so append it to `str`
//  response.on('data', function (chunk) {
//    str += chunk;
//  });
//
//  //the whole response has been recieved, so we just print it out here
//  response.on('end', function () {
//      var cheerio = require('cheerio'),
//    $ = cheerio.load(str);
//    console.log(str);
////    var res = $('address');
//////    console.log(res);
////    for(var key in res){
////        console.log(

//http.request(options, callback).end();
var http = require('http');
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : '54.254.209.30',
  user     : 'crawler',
  password : 'yelpcrawler123',
  database : 'crawler'
});

connection.connect();

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
                var row = $(val).html();
                var ip = $(row).first().html();
                var port = $(row).first().next().html();
                
                console.log(ip+":"+port);
                connection.query('insert into proxylist (ip, status) values ("'+ip+":"+port+'","normal") on duplicate key update status = status', function(err, rows, fields) {
                    if (err) throw err;
                });
                
            }
        });
        getPage();
//        connection.end();
    });
}

getProxyList();
//getPage();



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
function getPage(start,proxy){
    
    var proxy = request.defaults({proxy: "http://"+proxy});

    var req = proxy.get({uri: 'http://www.yelp.com/search?find_loc=CA&start='+start, encoding: 'utf8'});
    var str;
    req.on('data', function(chunk){
        str+=chunk;
    });
    req.on('end', function() {
        $ = cheerio.load(str);
        if($("#content h2").html() === "Sorry, you&apos;re not allowed to access this page."){
            return false;
        }else{
            return true;
        }
    });
}

function getProxyList(callback){
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
        callback();
    });
}

function getNumberOfPage(location, callback){
    console.log("getNumberOfPage");
    var req = request.get({uri: 'http://www.yelp.com/search?find_loc='+location, encoding: 'utf8'});
    var str;
    req.on('data', function(chunk){
        str+=chunk;
    });
    req.on('end', function() {
        $ = cheerio.load(str);
        var pageStr = $(".pagination-results-window").html();
        var str_arr = pageStr.split(" of ");
        callback(str_arr[1]);
    });
}

function chooseProxyList(i, callback){
    connection.query('select * from proxylist where status = "normal" order by rand()', function(err, rows, fields) {
        if (err) throw err;
        callback(i, rows[0].ip);
        
    });
}

function main(location){
    getProxyList(function(){
        getNumberOfPage(location,function(totalpage){
            for(var i = 0; i<totalpage; i+=10){
                var succeed = false;
                while(!succeed){
                    chooseProxyList(i, function(i,proxy){
                        var result = getPage(i,proxy,function(){
                            if(!result){
                                connection.query('update proxylist set status = "banned" where ip = "'+proxy+'"', function(err, rows, fields) {
                                    if (err) throw err;
                                });
                            }
                        });
                        
                    });
                    
                }
                console.log("Job: "+location+", Page: "+i+", Success");
            }
        });
    });
}

var location = "CA";
main(location);
//getNumberOfPage("CA");
//getProxyList();
//getPage();



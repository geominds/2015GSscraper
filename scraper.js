var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var token ="";

console.log("Reading homepage");
request({
    url: "http://trend.kerala.gov.in/views/lnkResultsGrama.php",
    jar: true
    },function (err, res, body) {
        fs.writeFile("homepage.html", body, 'utf8', function(){
            console.log("writing to file...");
        });
        var $ = cheerio.load(body);
        console.log($.html());
        token = $("#token").attr("value");
        $("option").each(function(i,elm){
            var districtCode = $(this).attr("value");
            if (districtCode.startsWith("D")){
                getPanchayathsByDistrict(districtCode);
            }
        });

    });


function getPanchayathsByDistrict(districtCode) {
    request.post({
        url: "http://trend.kerala.gov.in/includes/detailed_results_grama_ajax.php",
        form: {'process': 'getPanchayathsByDistrict', distCode: districtCode},
        jar: true
        },function (err, res, body) {
            fs.writeFileSync('data/'+districtCode+".json", body, 'utf8');
            body = JSON.parse(body);
            var data = body['data'];
            for (k in data) {
                console.log("Processing "+ districtCode);
                getGramaWonCandData(districtCode, data[k]['GramaCd']);
            }
        });
}

function getGramaWonCandData(districtCode, Panchayat){

    var process="getGramaWonCandData"
    var cno="48"
    request.post({
        url: "http://trend.kerala.gov.in/includes/detailed_results_grama_ajax.php",
        form: {process: process, districtCode: districtCode, Panchayat: Panchayat, token: token, cno: cno},
        jar: true,
        },function (err, res, body) {
            console.log(body);
            fs.writeFileSync('data/' + Panchayat + ".json", body, 'utf8');
            body = JSON.parse(body);
        });

}

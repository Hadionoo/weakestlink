var request = require('request');

var BASE_URL = "https://na.api.pvp.net";
var API_KEY = require('./config.js').api_key;

var getSummonerId = function(summonerName, callback) {
request(
	BASE_URL + "/api/lol/na/v1.4/summoner/by-name/"
	+ summonerName + "?api_key=" + API_KEY
	, function(err, res, body) {
		if (err) {
			throw err;
		} else if (res.statusCode !== 200) {
			callback(new Error('> 200 response code'));
		} else {
			body = JSON.parse(body);
			summonerName = summonerName.toLowerCase().replace(' ', '');
			var id = body[summonerName].id;
			callback(null, id);
		}
	})

}

getSummonerId('Cpt FlappyDong', function(err, id) {
	console.log(id);
});

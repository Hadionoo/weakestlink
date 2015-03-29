var request = require('request');

var BASE_URL = "https://na.api.pvp.net";
var API_KEY = require('./config.js').api_key;
var api_key_string = "?api_key=" + API_KEY;

var getSummonerId = function(summonerName, callback) {
request(
	BASE_URL + "/api/lol/na/v1.4/summoner/by-name/"
	+ summonerName + api_key_string
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

var getMatchParticipants = function(summonerId, callback) {
	request(
		BASE_URL + "/observer-mode/rest/consumer/getSpectatorGameInfo/NA1/" 
		+ summonerId + api_key_string
		, function(err,res,body) {
			if (err) {
				throw err;
			} else if (res.statusCode !== 200) {
				callback(new Error('> 200 response code'));
			} else {
				body = JSON.parse(body);
				var participants = body.participants
				var enemyParticipants = [];
				var summonerTeamId;
				for (var i = 0; i<participants.length;i++)
				{
					if(participants[i].summonerId === summonerId)
					{
						summonerTeamId = participants[i].teamId;
					}

				}
				for (var i = 0; i<participants.length;i++)
				{
					if(participants[i].summonerTeamId != summonerTeamId)
					{
						enemyParticipants.push(participants[i].summonerId);

					}

				} 
				callback(null, enemyParticipants);
			}
	});
};

var getMatchHistory = function(summonerId, callback) {
	request(
		BASE_URL + "/api/lol/na/v2.2/matchhistory/" + summonerId 
		+ api_key_string
		, function(err, res, body) {
			if (err) {
				throw err;
			} else if (res.statusCode !== 200) {
				callback(new Error('> 200 response code'));
			} else {
				body = JSON.parse(body);
				callback(null, body);
			}
		})
}

var getTiltScore = function(responseObject) {
	var matches = responseObject.matches;
	var stats = matches.map(function(match) {
		return match.participants[0].stats;
	})
	var kills = stats.reduce(function(kills, stats){
		return kills+stats.kills;		
	}, 0)

	var deaths = stats.reduce(function(deaths, stats){
		return deaths+stats.deaths;

	}, 0)
	var assists = stats.redue(function(assists, stats){
		return assists + stats.assists;
	}, 0)
	return ((kills + (assists * 0.5) / deaths);
}

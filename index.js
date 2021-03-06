var request = require('request');
var async = require('async');

var BASE_URL = "https://na.api.pvp.net";

var WeakestLink = function(options) {
	this.api_key = options.api_key;
	return this;
};

WeakestLink.prototype.getSummonerId = function(summonerName, callback) {
	var api_key = this.api_key;
	request(
		BASE_URL + "/api/lol/na/v1.4/summoner/by-name/"
		+ summonerName + "?api_key=" + api_key
		, function(err, res, body) {
			if (err) {
				throw err;
			} else if (res.statusCode !== 200) {
				callback(new Error('> 200 response code'));
			} else {
				body = JSON.parse(body);
				summonerName = summonerName.toLowerCase().replace(/ /g, '');
				var id = body[summonerName].id;
				callback(null, id);
			}
		})
}

WeakestLink.prototype.getEnemyParticipants = function(summonerId, callback) {
	var api_key = this.api_key;
	request(
		BASE_URL + "/observer-mode/rest/consumer/getSpectatorGameInfo/NA1/" 
		+ summonerId + "?api_key=" + api_key
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
					if(participants[i].teamId != summonerTeamId)
					{
						enemyParticipants.push(participants[i].summonerId);

					}

				} 
				callback(null, enemyParticipants);
			}
	});
};

WeakestLink.prototype.getMatchHistory = function(summonerId, callback) {
	var api_key = this.api_key;
	request(
		BASE_URL + "/api/lol/na/v2.2/matchhistory/" + summonerId 
		 + "?api_key=" + api_key
		 + "&endIndex=5&rankedQueues=RANKED_SOLO_5x5"
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
		return kills + stats.kills;		
	}, 0)

	var deaths = stats.reduce(function(deaths, stats){
		return deaths + stats.deaths;

	}, 0)
	var assists = stats.reduce(function(assists, stats){
		return assists + stats.assists;
	}, 0)
	return (kills + assists * 0.5) / deaths;
}

WeakestLink.prototype.getEnemyTiltScores = function(summonerName, callback) {
	var self = this;
	self.getSummonerId(summonerName, function(err, summonerId) {
		self.getEnemyParticipants(summonerId, function(err, enemyParticipantIds){
			async.map(enemyParticipantIds, self.getMatchHistory.bind(self), function(err, matchHistories){
				var tiltStats = matchHistories.map(function(matchhistory) 	{
					return {
						tiltScore: getTiltScore(matchhistory).toFixed(5), 
						summonerName: matchhistory.matches[0].participantIdentities[0].player.summonerName
					};
				});
			
				callback(null, tiltStats);
			});
		});
	});
};

module.exports = WeakestLink;

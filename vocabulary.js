var fs = require('fs');
require('colors');

var sWordsEnglishFile = 'vocabulary_en';
var sWordsDutchFile = 'vocabulary_nl';
var aoDictionary = [];
var fnPrepareData = function(fnCallback){
	fs.readFile(sWordsEnglishFile, function(err, sEnglishData){
		if (err){
			console.log(err);
			process.exit(1);
		}
		fs.readFile(sWordsDutchFile, function(err, sDutchData){
			if (err){
				console.log(err);
				process.exit(1);
			}
			var fnFilter = function(sWord){return sWord !== '';};
			var asLinesEnglish = sEnglishData.toString().replace(/\r\n/g, '\n').split('\n').filter(fnFilter);
			var asLinesDutch = sDutchData.toString().replace(/\r\n/g, '\n').split('\n').filter(fnFilter);
			var sType = '';
			var nFrequency = 1; //less means more common
			for (var i = 0; i < asLinesEnglish.length; i++) {
				if (asLinesEnglish[i][0] !== '\t') {
					sType = asLinesDutch[i];
					nFrequency = 1;
				}
				else{
					aoDictionary.push({
						type: sType,
						english: asLinesEnglish[i].replace('\t', ''),
						dutch: asLinesDutch[i].replace('\t', ''),
						frequency: nFrequency,
						pronunciation: ''
					});
					nFrequency ++;
				}
			}
			fnCallback();
		});
	});
};
var fnGetRandomInteger = function(nMin, nMax){
	return Math.floor(Math.random()*(nMax-nMin+1)+nMin);
};

var fnMain = function(){
	fnPrepareData(function(){
		//var aoNouns = aoDictionary.filter(function(oEntry){return oEntry.sType === 'nouns';});
		console.log(JSON.stringify(aoDictionary, null, '\t'));
		process.exit(0);
		var sDutch;
		var nLevel = 1;
		var fnAnalyze = function(sWord){
			var oEntry = aoDictionary.filter(function(oE){ //if 2 times correct, delete it from the list
				return oE.sDutch === sDutch;
			})[0];
			if (sWord !== sDutch){
				console.log(('Incorrect -> '+sDutch).red);
				oEntry.bPreviousCorrect = false;
				nLevel = nLevel<=1 ? nLevel : nLevel-1;
			}
			else{
				if (!oEntry.bPreviousCorrect) {
					oEntry.bPreviousCorrect = true;
				}
				else{ //this is the second time it is correct
					aoDictionary = aoDictionary.filter(function(oE){return oE.sDutch !== sDutch;});
				}
				nLevel ++;
				//console.log(('Level '+nLevel).green);
			}
			fnLoop();
		};
		process.stdin.resume();
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', function(input) {
			var sData = input.toString();
			sData = sData.replace('\r\n', '');
			sData = sData.replace('\n', '');
			fnAnalyze(sData);
		});
		var fnLoop = function fnLoop(){
			var aoMini = aoDictionary.filter(function(oEntry){
				return oEntry.nFrequency <= nLevel && oEntry.sType !== 'sentences';
			});
			var nIndex = fnGetRandomInteger(0, Math.min(aoMini.length - 1));
			sDutch = aoMini[nIndex].sDutch;
			console.log((aoMini[nIndex].sEnglish+' ('+aoMini[nIndex].sType+')').yellow);
		};
		fnLoop();
	});

	
};


fnMain();



console.log("content script");
// Copyright (c) 2013 TANIGUCHI Takaki 
// License: GPL version 3 or later  

function zeperf(request, sender) {
	var result = {};

	var htmlBlockTitle = $("#content > h1 > strong");
	result.title = htmlBlockTitle.text();

	var htmlBlockCaract= $("#Caractéristiques > div.mod.cadrezpcontent");
	var textBlockCaract = htmlBlockCaract.text();
	var regMoteur = new  RegExp("(\\d) cylindres (\\S+ \\S+)");
	var regMoteurResult = regMoteur.exec(textBlockCaract);
	result.nbCylindre = regMoteurResult[1];
	result.type = regMoteurResult[2];
	regMoteur = new  RegExp("(\\d+) cm³");
	regMoteurResult = regMoteur.exec(textBlockCaract);
	result.cylindre   = regMoteurResult[1];
	result.turbo      = textBlockCaract.indexOf("Turbo") >= 0;
	
	var regPuissance = new RegExp("Puissance Maxi : (\\d+) ch");
	var regPuissanceResult = regPuissance.exec(textBlockCaract);
	result.puissance = regPuissanceResult[1];
	
	var regCouple = new RegExp("Couple Maxi : (\\d+) Nm");
	var regCoupleResult = regCouple.exec(textBlockCaract);
	result.couple = regCoupleResult[1];
	
	var regAnnee = new RegExp("Année de lancement : (\\d+)");
	var regAnneeResult = regAnnee.exec(textBlockCaract);
	result.annee = regAnneeResult[1];

	var regPuissanceFiscale = new RegExp("Puissance fiscale : (\\d+)");
	var regPuissanceFiscaleResult = regPuissanceFiscale.exec(textBlockCaract);
	result.puissanceFiscale = regPuissanceFiscaleResult[1];
	
	var htmlBlockLabel = $("#Performances > div.mod.cadrezpcontent.pb2 > div:nth-child(2) > table td:nth-child(1)");
	var htmlBlockValue = $("#Performances > div.mod.cadrezpcontent.pb2 > div:nth-child(2) > table td:nth-child(2)");
	var textBlockLabel = htmlBlockLabel.html();
	var textBlockValue = htmlBlockValue.html();
	var splitedLabel = textBlockLabel.split("<br>");
	var splitedValue = textBlockValue.split("<br>");
	var reg = new RegExp("[\\dƼ]+‚[\\dƼ]+");
	for (var i = 0; i < splitedLabel.length; i++) {
		var label = $(splitedLabel[i]).text();
		if (label == " Km DA :") {
			var textValue = $(splitedValue[i]).text();
			result.perfKMDA =textValue.substring(0, textValue.indexOf("@zeperfs.com")).trim();
			continue;
		} else if (label == " 0 à 100 km/h :") {
			var textValue = $(splitedValue[i]).text();
			result.perf0a100 = textValue.substring(0, textValue.indexOf("@zeperfs.com")).trim();
			break;
		}
	}
	return result;
};

function autoplus(request, sender) {
	var result = {};
	var cotation = $("div.quotation-config > h3 > span").text();
	result.cotation = cotation;
	return result;
};

// http://www.lacentrale.fr/cote-auto-renault-megane-iii+coupe+2.0+t+265+rs+trophy-2012.html
function lacentrale (request, sender) {
	var result = {};
	var cotation = $("#CoteBruteInnerCont > div.tx12 > span").text();
	result.cotation = cotation;
	return result;
};


$(document).ready(function(){
	console.log(url);
	var url = window.location.href;
	if (url.indexOf("http://www.zeperfs.com/fiche") > -1) {
		var f = zeperf;
	} else if (url.indexOf("http://voiture.autoplus.fr/") > -1) {
		var f = autoplus;
	} else if (url.indexOf("http://www.lacentrale.fr/cote-auto-") > -1) {
		var f = lacentrale;
	}
    chrome.extension.onRequest.addListener(	
		function(request, sender, sendResponse) {
			var result = {};
			if (f != null) {
				result = f(request, sender);			
			}
			sendResponse({response : result});
		}
    );
});



// Copyright (c) 2013 TANIGUCHI Takaki 
// License: GPL version 3 or later  

var dataExtractor = {
	
	add : function (item) {
		if (this.items == null) {
			this.items = new Array();
			this.items.push(item);
			return;
		}
		for (var i = 0; i < this.items.length; i++) {
			if (this.items[i].url == item.url) {
				this.items[i] = item;
				return;
			}
		}
		this.items.push(item);
	},
	
	items : null	
};

var session = {};

function refresh() {
	if (dataExtractor.items != null) {
		$("#read").text(dataExtractor.items.length);
		$('#items').find('option').remove();
		$("#items").html(dataExtractor.items.forEach(function(item){
			$("#items").append($("<option>", {value : item.id, text : item.title}));
		}));

	}
	var json = JSON.stringify(session.response, null, 2);
	$('#result').text(json);
}

$(document).ready(function(){

    var ls = localStorage['selector'];
    var type = localStorage['type'];
	
	//$("#memory").text(dataExtractor.items.length);

});

/*
    $(window).unload(function(){
	clear_css();
    });
*/

function clear_css(){
    chrome.tabs.executeScript(
	null, {code:
	       "$('*').css('background','');" +
	       "$('*').css('border','')" 
	      });
};

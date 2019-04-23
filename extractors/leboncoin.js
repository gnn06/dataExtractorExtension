https://www.leboncoin.fr/informatique/

text = $(".content-CxPmi").html();
result.title = $("div[data-qa-id='adview_spotlight_container'] div[data-qa-id='adview_title'] h1").text();
result.prix = $("div[data-qa-id='adview_spotlight_container'] div[data-qa-id='adview_price'] > div > span").text();
result.date = $("div[data-qa-id='adview_spotlight_container'] div[data-qa-id='adview_date']").text();
result.text = text;
result.location = $("div[data-qa-id='adview_location_informations'] span").text();
result.vendeur = $("div[data-qa-id='adview_contact_container'] a.trackable:eq(1)").text();
result.url = window.location.href;

result.model = matchAny(words, ["ux360", "ux370"]);
result.screen = search(words, ["13", "13.3", "13,3", "14", "15"], ["écran", "ecran", "screen", "Ecran", "Écran", "hd"]);
result.ram = search(words, ["4", "8", "16", "32"], ["go", "Go", "gb", "GB", "ram", "RAM", "Ram", "mémoire", "Mémoire"]);
result.disk = search(words, ["128", "256", "500", "512", "64"], ["ssd", "go", "Go", "GB", "gigas", "SSD", "stockage"]);
result.processeur = search(words, ["i5", "i7"], []);
result.date = formatDate(result.date);

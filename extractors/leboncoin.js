text = $(".content-CxPmi").text();
result.title = $("div[data-qa-id='adview_spotlight_container'] div[data-qa-id='adview_title'] h1").text();
result.prix = $("div[data-qa-id='adview_spotlight_container'] div[data-qa-id='adview_price'] > div > span").text();
result.date = $("div[data-qa-id='adview_spotlight_container'] div[data-qa-id='adview_date']").text();
result.text = text;
result.processeur = text.match(/i[357]/)[0];
result.ecran = text.match(/1\d([,.]\d)?/)[0];
result.memoire = text.match(/(8|16|32|64)/)[0];
result.location = $("div[data-qa-id='adview_location_informations'] span").text();
result.vendeur = $("div[data-qa-id='adview_contact_container'] a.trackable:eq(1)").text();
result.url = window.location.href;
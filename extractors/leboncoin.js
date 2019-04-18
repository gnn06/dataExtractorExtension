text = $(".content-CxPmi").text();
result.title = $("div[data-qa-id='adview_spotlight_container'] div[data-qa-id='adview_title'] h1").text();
result.prix = $("div[data-qa-id='adview_spotlight_container'] div[data-qa-id='adview_price'] > div > span").text();
result.date = $("div[data-qa-id='adview_spotlight_container'] div[data-qa-id='adview_date']").text();
result.text = text;
result.location = $("div[data-qa-id='adview_location_informations'] span").text();
result.vendeur = $("div[data-qa-id='adview_contact_container'] a.trackable:eq(1)").text();
result.url = window.location.href;
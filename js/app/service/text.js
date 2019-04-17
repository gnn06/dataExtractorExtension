var v = require('voca');

console.log(extractItAd(`Bonjour,

Je souhaite échanger ma surface pro 4 Microsoft contre un pc portable 14 ou 15 pouces
C'est une tablette-pc portable tactile

IL s'agit du modèle avec un core i5, 8go de ram et 256go de ssd
Je laisse avec une station d’accueil neuve permettant de rajouter :
- 2 Ports USB 3.0 
- 1 Port USB 2.0 
- 1 Port Gigabit Ethernet LAN
- 1 Porta HDMI 
- 1 DisplayPort
- 1 Port 3.5mm Audio Output 
- 1 Port DC 5V In

le bouton power est un peu tordu mais c'est juste esthétique, le bouton fonctionne correctement et l’écran n'est pas impacté

Je cherche en échange un pc portable avec écran 14 ou 15 pouces, ssd et port usb-c

zenbook flip, hp spectre, lenovo yoga 730 740

ou un smartphone galaxy note 9 , S9 plus dual sim, Iphone xr, Iphone x, Google pixel 3 xl`));

console.log(extractItAd(`Processeur Intel Core i7-7500U 2.70 GHz (7th gen) 
Quantité de mémoire vive 8 Go DDR3L-SDRAM
Capacité de stockage SSD Micron 512 Go M2 / 6Gb-s
Clavier retroéclairé Oui Clavier chiclet
Taille d'écran 13.3 " 16:9 / Tactile Multitouch
Définition de l'écran 1920 x 1080 pixels (Full HD)
Processeur graphique Intel HD Graphics 620
Système audio embarqué Stéréo HARMAN KARDON
Support du Wi-Fi Wi-Fi 802.11a/11b/11ac/11g/11n
Support du Bluetooth Bluetooth 4.2
Ports HDMI/2 usb-3/jack/sd/usb-c
Système d'exploitation Windows 10 PRO 64-bits OEM
taille 31.1 cm x 1.35 cm x 21.1 cm (1.110 kg)

Lecteur d'empreinte pour se connecter au PC et/ou 
Windows Hello (scan du visage pour déverrouiller la session)
etat neuf pas une rayure tres tres peu servi (environ 12 h)

Non sérieux s'abstenir , telephoner de preference , si vous tombez sur l'annonce 
ne pas demander si dispo`));

console.log(extractItAd(`Vend cause double emploi mon ultraportable AZUS ZENBOOK FLIP S
Ecran Tactile 
Stylet
Souris bluetooth
Le portable peut etre mis en mode tablette

Processeur Intel Core i7-7500U de 2,5 ghz
Quantité de mémoire vive 16 Go
Capacité de stockage principal 512 Go
Taille d'écran 13.3 "
Processeur graphique Intel HD Graphics 620 

SMS pour plus d'information

Très bon état

Remise en main propre uniquement

Prix négociable dans la limite du raisonnable`));

function extractItAd(text) {
    text = text.toLowerCase();
    var version = searchRegOrNull(text, /zenbook flip( s)?/);
    var processeur = searchRegOrNull(text, /i[357]/);
    var words = v.words(text);
    var ram = search(words, ["8", "16", "32"], ["go", "ram"]);
    var disk = search(words, ["64", "128", "256", "512"], ["go", "ssd"]);
    var result = {
        version : version,
        processeur : processeur,
        ram : ram,
        disk : disk
    };
    return result;
}

function searchRegOrNull(text, regex) {
    var tmp = text.match(regex);
    return tmp ? tmp[0] : null;
}

function search(array, tokens, surounded) {
    var result = null;
    var i = 0;
    do {
        var indice = array.indexOf(tokens[i]);
        if (indice > -1) {
            var s = closedTo(array, indice, surounded);
            if (s) {
                result = array[indice];
                return result;
            }
        }
        i += 1;
    } while (i < tokens.length);
    return result;
}

function findAny(array, subjects) {
    let i = 0;
    let found = -1;
    do {
        found = array.indexOf(subjects[i]);
        i += 1;
    } while (found == -1 && i < subjects.length);
    return found;
}

function closedTo(array, indice, subjects) {
    const distance = 4;
    sentence = array.slice(indice - distance, indice + distance);
    match = findAny(sentence, subjects) > -1;
    return match;
}
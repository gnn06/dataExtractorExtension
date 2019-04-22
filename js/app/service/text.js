function extractItAd(text) {
    text = text.toLowerCase();
    var version = searchRegOrNull(text, /zenbook flip( s)?/);
    var processeur = searchRegOrNull(text, /i[357]/);
    var words = splitWords(text);
    var screen = search(words, ["13", "13.3", "14", "15"], ["écran", "ecran", "screen"]);
    var ram = search(words, ["8", "16", "32"], ["go", "ram", "mémoire"]);
    var disk = search(words, ["64", "128", "256", "512"], ["go", "ssd", "stockage"]);
    var result = {
        version : version,
        screen : screen,
        processeur : processeur,
        ram : ram,
        disk : disk
    };
    return result;
}

function splitWords(text) {
    return text.toLowerCase()
        .replace(/<br>/g,"\n")
        .match(/[a-zA-Z\xC0-\xD6\xD8-\xDE\xDF-\xF6\xF8-\xFF]+[0-9a-zA-Z\xC0-\xD6\xD8-\xDE\xDF-\xF6\xF8-\xFF]*|\d+[.,:]\d+|\d+/g);
}

function searchRegOrNull(text, regex) {
    var tmp = text.match(regex);
    return tmp ? tmp[0] : null;
}

/* recherche un des mots et si le trouve vérifie qu'il est encadré par les mots entourants */
function search(array, tokens, surounded) {
    var result = null;
    var i = 0;
    do {
        var indice = array.indexOf(tokens[i]);
        while (indice > -1) {
            if (surounded.length == 0) {
                result = array[indice];
                return result;
            } else {
                var s = closedTo(array, indice, surounded);
                if (s) {
                    result = array[indice];
                    return result;
                }
            }
            indice = array.indexOf(tokens[i], indice + 1);
        }
        i += 1;
    } while (i < tokens.length);
    return result;
}

/* recherche un des mots et retourne le mot trouvé */
function findAny(array, subjects) {
    let i = 0;
    let found = -1;
    do {
        found = array.indexOf(subjects[i]);
        i += 1;
    } while (found == -1 && i < subjects.length);
    return found;
}

function matchAny(array, subjects) {
    let i = 0;
    let found = undefined;
    do {
        found = array.find(x => x.indexOf(subjects[i]) > -1);
        i += 1;
    } while (found == undefined && i < subjects.length);
    return found;
}

/* recherche un des mots autour de l'indice spécifié 
 * et retourne le mot trouvé
 */
function closedTo(array, indice, subjects) {
    const distance = 8;
    var deb = indice - distance < 0 ? 0 : indice - distance;
    sentence = array.slice(deb, indice + distance);
    match = findAny(sentence, subjects) > -1;
    return match;
}

function formatDate(text) {
    // 21/04/2019 à 19h05
    return text.replace(/(\d+)\/(\d+)\/(\d+) à (\d+)h(\d+)/,"$1/$2/$3 $4:$5");
}

exports.matchAny = matchAny;
exports.splitWords = splitWords;
exports.search = search;
exports.closedTo = closedTo;
exports.formatDate = formatDate;
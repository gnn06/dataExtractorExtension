function extractItAd(text) {
    text = text.toLowerCase();
    var version = searchRegOrNull(text, /zenbook flip( s)?/);
    var processeur = searchRegOrNull(text, /i[357]/);
    // var words = v.words(text);
    var words = text.match(/[a-zA-Z\xC0-\xD6\xD8-\xDE\xDF-\xF6\xF8-\xFF]+[0-9-a-zA-Z\xC0-\xD6\xD8-\xDE\xDF-\xF6\xF8-\xFF]*|\d+[.,:]\d+|\d+/g);
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
function flipmyChar(c) { //Its gets the job done.
    if (c == 'a') {
        return 'ɐ'
    }
    else if (c == 'ɐ') {
        return 'a'
    }
    else if (c == 'b') {
        return 'q'
    }
    else if (c == 'q') {
        return 'b'
    }
    else if (c == 'c') {
        return 'ɔ'
    }
    else if (c == 'ɔ') {
        return 'c'
    }
    else if (c == 'd') {
        return 'p'
    }
    else if (c == 'p') {
        return 'd'
    }
    else if (c == 'e') {
        return 'ǝ'
    }
    else if (c == 'ǝ') {
        return 'e'
    }
    else if (c == 'f') {
        return 'ɟ'
    }
    else if (c == 'ɟ') {
        return 'f'
    }
    else if (c == 'g') {
        return 'ƃ'
    }
    else if (c == 'ƃ') {
        return 'g'
    }
    else if (c == 'h') {
        return 'ɥ'
    }
    else if (c == 'ɥ') {
        return 'h'
    }
    else if (c == 'i') {
        return 'ı'
    }
    else if (c == 'ı') {
        return 'i'
    }
    else if (c == 'j') {
        return 'ɾ'
    }
    else if (c == 'ɾ') {
        return 'j'
    }
    else if (c == 'k') {
        return 'ʞ'
    }
    else if (c == 'ʞ') {
        return 'k'
    }
    else if (c == 'l') {
        return 'l'
    }
    else if (c == 'l') {
        return 'l'
    }
    else if (c == 'm') {
        return 'ɯ'
    }
    else if (c == 'ɯ') {
        return 'm'
    }
    else if (c == 'n') {
        return 'u'
    }
    else if (c == 'u') {
        return 'n'
    }
    else if (c == 'o') {
        return 'o'
    }
    else if (c == 'p') {
        return 'd'
    }
    else if (c == 'q') {
        return 'b'
    }
    else if (c == 'r') {
        return 'ɹ'
    }
    else if (c == 'ɹ') {
        return 'r'
    }
    else if (c == 's') {
        return 's'
    }
    else if (c == 't') {
        return 'ʇ'
    }
    else if (c == 'ʇ') {
        return 't'
    }
    else if (c == 'u') {
        return 'n'
    }
    else if (c == 'n') {
        return 'u'
    }
    else if (c == 'v') {
        return 'ʌ'
    }
    else if (c == 'ʌ') {
        return 'v'
    }
    else if (c == 'w') {
        return 'ʍ'
    }
    else if (c == 'ʍ') {
        return 'w'
    }
    else if (c == 'x') {
        return 'x'
    }
    else if (c == 'y') {
        return 'ʎ'
    }
    else if (c == 'ʎ') {
        return 'y'
    }
    else if (c == 'z') {
        return 'z'
    }
    else if (c == '[') {
        return ']'
    }
    else if (c == ']') {
        return '['
    }
    else if (c == '(') {
        return ')'
    }
    else if (c == ')') {
        return '('
    }
    else if (c == '{') {
        return '}'
    }
    else if (c == '}') {
        return '{'
    }
    else if (c == '?') {
        return '¿'
    }
    else if (c == '¿') {
        return '?'
    }
    else if (c == '!') {
        return 'i'
    }
    else if (c == 'i') {
        return '!'
    }
    else if (c == "'") {
        return ','
    }
    else if (c == ',') {
        return "'"
    }
    else if (c == '.') {
        return '˙'
    }
    else if (c == '_') {
        return '‾'
    }
    else if (c == '‾') {
        return '_'
    }
    else if (c == '9') {
        return '6'
    }
    else if (c == '6') {
        return '9'
    }
    return c;
}

function reverse(s) {
    for (var i = s.length - 1, o = ''; i >= 0; o += s[i--]) { }
    return o;
  }

function flipmyString(aString) {
    var last = aString.length - 1;
    var result = "";
    for (var i = last; i >= 0; --i) {
        result += flipmyChar(aString.charAt(i))
    }
    return result;
}

module.exports = {
    flipmyString: function (aString) {
        return flipmyString(aString);
    },

    flipmyChar: function (char) {
        return flipmyChar(char);
    }
}
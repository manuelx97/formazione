const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require('./american-to-british-titles.js');
const britishOnly = require('./british-only.js');

class Translator {
  constructor() {
    this.americanToBritishTerms = {
      ...americanOnly,
      ...americanToBritishSpelling,
      ...americanToBritishTitles
    };

    this.britishToAmericanTerms = {
      ...this.reverse(americanToBritishSpelling),
      ...britishOnly,
      ...this.reverse(americanToBritishTitles)
    };
  }

  reverse(dictionary) {
    return Object.entries(dictionary).reduce(function (reversed, entry) {
      const source = entry[0];
      const translation = entry[1].toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(reversed, translation)) {
        reversed[translation] = source;
      }
      return reversed;
    }, {});
  }

  preserveCase(source, translation) {
    if (source === source.toUpperCase() && /[A-Z]/i.test(source)) {
      return translation.toUpperCase();
    }
    if (/^[A-Z]/.test(source)) {
      return translation.charAt(0).toUpperCase() + translation.slice(1);
    }
    return translation;
  }

  escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  replaceTerms(text, dictionary, highlight) {
    const terms = Object.keys(dictionary)
      .sort(function (a, b) { return b.length - a.length; })
      .map(this.escapeRegExp)
      .join('|');

    const expression = new RegExp('(^|[^A-Za-z0-9])(' + terms + ')(?=$|[^A-Za-z0-9])', 'gi');
    return text.replace(expression, (match, prefix, source) => {
      const translated = this.preserveCase(source, dictionary[source.toLowerCase()]);
      return prefix + (highlight
        ? '<span class="highlight">' + translated + '</span>'
        : translated);
    });
  }

  replaceTimes(text, locale, highlight) {
    const expression = locale === 'american-to-british'
      ? /\b([0-2]?\d):([0-5]\d)\b/g
      : /\b([0-2]?\d)\.([0-5]\d)\b/g;
    const separator = locale === 'american-to-british' ? '.' : ':';

    return text.replace(expression, function (match, hours, minutes) {
      const translated = hours + separator + minutes;
      return highlight
        ? '<span class="highlight">' + translated + '</span>'
        : translated;
    });
  }

  translate(text, locale, highlight = false) {
    const dictionary = locale === 'american-to-british'
      ? this.americanToBritishTerms
      : this.britishToAmericanTerms;
    const translatedTerms = this.replaceTerms(text, dictionary, highlight);
    return this.replaceTimes(translatedTerms, locale, highlight);
  }

  americanToBritish(text, highlight = false) {
    return this.translate(text, 'american-to-british', highlight);
  }

  britishToAmerican(text, highlight = false) {
    return this.translate(text, 'british-to-american', highlight);
  }

}

module.exports = Translator;

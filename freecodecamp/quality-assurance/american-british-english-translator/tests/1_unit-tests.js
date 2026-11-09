'use strict';

const chai = require('chai');
const assert = chai.assert;
const Translator = require('../components/translator.js');

suite('Unit Tests', function () {
  let translator;

  setup(function () {
    translator = new Translator();
  });

  const americanToBritishCases = [
    ['Mangoes are my favorite fruit.', 'Mangoes are my favourite fruit.'],
    ['I ate yogurt for breakfast.', 'I ate yoghurt for breakfast.'],
    ["We had a party at my friend's condo.", "We had a party at my friend's flat."],
    ['Can you toss this in the trashcan for me?', 'Can you toss this in the bin for me?'],
    ['The parking lot was full.', 'The car park was full.'],
    ['Like a high tech Rube Goldberg machine.', 'Like a high tech Heath Robinson device.'],
    ['To play hooky means to skip class or work.', 'To bunk off means to skip class or work.'],
    ['No Mr. Bond, I expect you to die.', 'No Mr Bond, I expect you to die.'],
    ['Dr. Grosh will see you now.', 'Dr Grosh will see you now.'],
    ['Lunch is at 12:15 today.', 'Lunch is at 12.15 today.']
  ];

  americanToBritishCases.forEach(function (testCase) {
    test('Translate ' + testCase[0] + ' to British English', function () {
      assert.equal(translator.americanToBritish(testCase[0]), testCase[1]);
    });
  });

  const britishToAmericanCases = [
    ['We watched the footie match for a while.', 'We watched the soccer match for a while.'],
    ['Paracetamol takes up to an hour to work.', 'Tylenol takes up to an hour to work.'],
    ['First, caramelise the onions.', 'First, caramelize the onions.'],
    ['I spent the bank holiday at the funfair.', 'I spent the public holiday at the carnival.'],
    ['I had a bicky then went to the chippy.', 'I had a cookie then went to the fish-and-chip shop.'],
    ["I've just got bits and bobs in my bum bag.", "I've just got odds and ends in my fanny pack."],
    ['The car boot sale at Boxted Airfield was called off.', 'The swap meet at Boxted Airfield was called off.'],
    ['Have you met Mrs Kalyani?', 'Have you met Mrs. Kalyani?'],
    ["Prof Joyner of King's College, London.", "Prof. Joyner of King's College, London."],
    ['Tea time is usually around 4 or 4.30.', 'Tea time is usually around 4 or 4:30.']
  ];

  britishToAmericanCases.forEach(function (testCase) {
    test('Translate ' + testCase[0] + ' to American English', function () {
      assert.equal(translator.britishToAmerican(testCase[0]), testCase[1]);
    });
  });

  test('Highlight translation in Mangoes are my favorite fruit.', function () {
    assert.equal(
      translator.americanToBritish('Mangoes are my favorite fruit.', true),
      'Mangoes are my <span class="highlight">favourite</span> fruit.'
    );
  });

  test('Highlight translation in I ate yogurt for breakfast.', function () {
    assert.equal(
      translator.americanToBritish('I ate yogurt for breakfast.', true),
      'I ate <span class="highlight">yoghurt</span> for breakfast.'
    );
  });

  test('Highlight translation in We watched the footie match for a while.', function () {
    assert.equal(
      translator.britishToAmerican('We watched the footie match for a while.', true),
      'We watched the <span class="highlight">soccer</span> match for a while.'
    );
  });

  test('Highlight translation in Paracetamol takes up to an hour to work.', function () {
    assert.equal(
      translator.britishToAmerican('Paracetamol takes up to an hour to work.', true),
      '<span class="highlight">Tylenol</span> takes up to an hour to work.'
    );
  });
});

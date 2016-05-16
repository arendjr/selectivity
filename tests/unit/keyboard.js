'use strict';

var TestUtil = require('../test-util');

TestUtil.createDomTest(
    'keyboard: test select nested item',
    ['single', 'dropdown', 'keyboard', 'templates'],
    function(test, $input, $) {
        $input.selectivity({
            items: [{
                text: 'Austria',
                children: [
                    { id: 54, text: 'Vienna' }
                ]
            }, {
                text: 'Belgium',
                children: [
                    { id: 2, text: 'Antwerp' },
                    { id: 9, text: 'Brussels' }
                ]
            }, {
                text: 'Bulgaria',
                children: [
                    { id: 48, text: 'Sofia' }
                ]
            }]
        });

        $input.find('.selectivity-single-select').click();
        $('.selectivity-search-input').val('belg')
                                      .trigger('keyup')
                                      .trigger(new $.Event('keyup', { keyCode: 13 }));

        test.deepEqual($input.selectivity('value'), 2);
    }
);

TestUtil.createDomTest(
    'keyboard: test change event after enter',
    ['multiple', 'dropdown', 'keyboard', 'templates'],
    function(test, $input, $) {
        var numChangeEvents = 0;

        $input.selectivity({
            items: ['Amsterdam', 'Antwerp', 'Athens'],
            multiple: true
        }).on('change', function(event) {
            numChangeEvents++;

            test.deepEqual(event.added, { id: 'Amsterdam', text: 'Amsterdam' });
            test.deepEqual(event.value, ['Amsterdam']);
        });

        $input.find('.selectivity-multiple-input').val('Amsterdam')
                                                  .trigger('keyup')
                                                  .trigger('change')
                                                  .trigger(new $.Event('keyup', { keyCode: 13 }));

        test.deepEqual($input.selectivity('value'), ['Amsterdam']);

        test.equal(numChangeEvents, 1);
    }
);

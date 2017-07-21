'use strict';

var tape = require('tape');

var Selectivity = require('../../src/selectivity');

tape('matcher: test basic matcher', function(test) {
    test.plan(6);

    test.deepEqual(Selectivity.matcher({ id: 1, text: 'Amsterdam' }, 'am'), {
        id: 1,
        text: 'Amsterdam'
    });
    test.deepEqual(Selectivity.matcher({ id: 1, text: 'Amsterdam' }, 'sterdam'), {
        id: 1,
        text: 'Amsterdam'
    });

    test.deepEqual(Selectivity.matcher({ id: 45, text: 'Rotterdam' }, 'am'), {
        id: 45,
        text: 'Rotterdam'
    });
    test.deepEqual(Selectivity.matcher({ id: 45, text: 'Rotterdam' }, 'sterdam'), null);

    test.deepEqual(Selectivity.matcher({ id: 29, text: 'Łódź' }, 'łódź'), { id: 29, text: 'Łódź' });
    test.deepEqual(Selectivity.matcher({ id: 29, text: 'Łódź' }, 'lodz'), null);
});

tape('matcher: test diacritics', function(test) {
    test.plan(5);

    require('../../src/plugins/diacritics');

    test.deepEqual(Selectivity.matcher({ id: 1, text: 'Amsterdam' }, 'am'), {
        id: 1,
        text: 'Amsterdam'
    });
    test.deepEqual(Selectivity.matcher({ id: 1, text: 'Amsterdam' }, 'sterdam'), {
        id: 1,
        text: 'Amsterdam'
    });

    test.deepEqual(Selectivity.matcher({ id: 45, text: 'Rotterdam' }, 'am'), {
        id: 45,
        text: 'Rotterdam'
    });
    test.deepEqual(Selectivity.matcher({ id: 45, text: 'Rotterdam' }, 'sterdam'), null);

    test.deepEqual(Selectivity.matcher({ id: 29, text: 'Łódź' }, 'lodz'), { id: 29, text: 'Łódź' });
});

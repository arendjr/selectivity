'use strict';

var jsdom = require('jsdom');
var tape = require('tape');

var EventListener = require('../../src/event-listener');

tape('event-listener: it supports listeners on the root', function(test) {
    test.plan(1);

    jsdom.env({
        file: 'tests/resources/testcase-event-listener.html',
        onload: function(window) {
            global.document = window.document;
            global.window = window;

            var numCallbacksCalled = 0;
            function callback() {
                numCallbacksCalled++;
            }

            var events = new EventListener(document.body);
            events.on('click', callback);

            var event = new window.MouseEvent('click', { bubbles: true, view: window });
            document.querySelector('.some-class').dispatchEvent(event);

            test.equal(numCallbacksCalled, 1);

            window.close();
        }
    });
});

tape('event-listener: it supports multiple listeners on an element', function(test) {
    test.plan(1);

    jsdom.env({
        file: 'tests/resources/testcase-event-listener.html',
        onload: function(window) {
            global.document = window.document;
            global.window = window;

            var numCallbacksCalled = 0;
            function callback1() {
                numCallbacksCalled++;
            }
            function callback2() {
                numCallbacksCalled++;
            }

            var events = new EventListener(document.body);
            events.on('click', '.some-class', callback1);
            events.on('click', '.some-class', callback1); // the same handler twice will be filtered
            events.on('click', '.some-class', callback2);

            var event = new window.MouseEvent('click', { bubbles: true, view: window });
            document.querySelector('.some-class').dispatchEvent(event);

            test.equal(numCallbacksCalled, 2);

            window.close();
        }
    });
});

tape('event-listener: it supports an event map', function(test) {
    test.plan(1);

    jsdom.env({
        file: 'tests/resources/testcase-event-listener.html',
        onload: function(window) {
            global.document = window.document;
            global.window = window;

            var numCallbacksCalled = 0;
            function callback1() {
                numCallbacksCalled++;
            }
            function callback2() {
                numCallbacksCalled++;
            }

            var events = new EventListener(document.body);
            events.on({
                'click .some-class': callback1,
                'click .another-class': callback2
            });

            var event = new window.MouseEvent('click', { bubbles: true, view: window });
            document.querySelector('.another-class').dispatchEvent(event);

            test.equal(numCallbacksCalled, 2);

            window.close();
        }
    });
});

tape('event-listener: it supports stopping the propagation', function(test) {
    test.plan(4);

    jsdom.env({
        file: 'tests/resources/testcase-event-listener.html',
        onload: function(window) {
            global.document = window.document;
            global.window = window;

            var timesCallback1Called = 0;
            function callback1() {
                timesCallback1Called++;
            }

            var timesCallback2Called = 0;
            function callback2(event) {
                if (timesCallback2Called) {
                    event.stopPropagation();
                }
                timesCallback2Called++;
            }

            var events = new EventListener(document.body);
            events.on('click', '.some-class', callback1);
            events.on('click', '.another-class', callback2);

            var event = new window.MouseEvent('click', { bubbles: true, view: window });
            document.querySelector('.another-class').dispatchEvent(event);

            test.equal(timesCallback1Called, 1);
            test.equal(timesCallback2Called, 1);

            // now the stopPropagation will kick in...
            document.querySelector('.another-class').dispatchEvent(event);

            test.equal(timesCallback1Called, 1);
            test.equal(timesCallback2Called, 2);

            window.close();
        }
    });
});

tape('event-listener: it supports unregistering a listener', function(test) {
    test.plan(2);

    jsdom.env({
        file: 'tests/resources/testcase-event-listener.html',
        onload: function(window) {
            global.document = window.document;
            global.window = window;

            var numCallbacksCalled = 0;
            function callback() {
                numCallbacksCalled++;
            }

            var events = new EventListener(document.body);
            events.on('click', '.some-class', callback);

            var event = new window.MouseEvent('click', { bubbles: true, view: window });
            document.querySelector('.some-class').dispatchEvent(event);

            test.equal(numCallbacksCalled, 1);

            events.off('click', '.some-class', callback);
            document.querySelector('.some-class').dispatchEvent(event);

            test.equal(numCallbacksCalled, 1);

            window.close();
        }
    });
});

tape('event-listener: it supports capturing an event', function(test) {
    test.plan(1);

    jsdom.env({
        file: 'tests/resources/testcase-event-listener.html',
        onload: function(window) {
            global.document = window.document;
            global.window = window;

            var numCallbacksCalled = 0;
            function callback() {
                numCallbacksCalled++;
            }

            var events = new EventListener(document.body);
            events.on('blur', '.some-class', callback);

            var event = new window.FocusEvent('blur', { bubbles: false, view: window });
            document.querySelector('.another-class').dispatchEvent(event);

            test.equal(numCallbacksCalled, 1);

            window.close();
        }
    });
});

tape('event-listener: it has a destructor', function(test) {
    test.plan(2);

    jsdom.env({
        file: 'tests/resources/testcase-event-listener.html',
        onload: function(window) {
            global.document = window.document;
            global.window = window;

            var numCallbacksCalled = 0;
            function callback() {
                numCallbacksCalled++;
            }

            var events = new EventListener(document.body);
            events.on('click', '.some-class', callback);

            var event = new window.MouseEvent('click', { bubbles: true, view: window });
            document.querySelector('.some-class').dispatchEvent(event);

            test.equal(numCallbacksCalled, 1);

            events.destruct();
            document.querySelector('.some-class').dispatchEvent(event);

            test.equal(numCallbacksCalled, 1);

            window.close();
        }
    });
});

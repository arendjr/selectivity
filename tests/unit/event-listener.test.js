import { noop } from "lodash";

import EventListener from "../../src/event-listener";

const bodyInnerHTML = `<div class="some-class">
    <div class="another-class"></div>
</div>`;

test("event-listener: it supports listeners on the root", () => {
    document.body.innerHTML = bodyInnerHTML;

    const callback = jest.fn();

    const events = new EventListener(document.body);
    events.on("click", callback);

    document.querySelector(".some-class").dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(callback).toHaveBeenCalledTimes(1);
});

test("event-listener: it supports multiple listeners on an element", () => {
    document.body.innerHTML = bodyInnerHTML;

    const callback1 = jest.fn();
    const callback2 = jest.fn();

    const events = new EventListener(document.body);
    events.on("click", ".some-class", callback1);
    events.on("click", ".some-class", callback1); // the same handler twice will be filtered
    events.on("click", ".some-class", callback2);

    const event = new MouseEvent("click", { bubbles: true });
    document.querySelector(".some-class").dispatchEvent(event);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
});

test("event-listener: it supports an event map", () => {
    document.body.innerHTML = bodyInnerHTML;

    const callback1 = jest.fn();
    const callback2 = jest.fn();

    const events = new EventListener(document.body);
    events.on({
        "click .some-class": callback1,
        "click .another-class": callback2,
    });

    const event = new MouseEvent("click", { bubbles: true });
    document.querySelector(".another-class").dispatchEvent(event);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
});

test("event-listener: it supports stopping the propagation", () => {
    document.body.innerHTML = bodyInnerHTML;

    const callback1 = jest.fn();
    const callback2 = jest
        .fn()
        .mockImplementationOnce(noop)
        .mockImplementationOnce(event => {
            event.stopPropagation();
        });

    const events = new EventListener(document.body);
    events.on("click", ".some-class", callback1);
    events.on("click", ".another-class", callback2);

    const event = new MouseEvent("click", { bubbles: true });
    document.querySelector(".another-class").dispatchEvent(event);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);

    // now the stopPropagation will kick in...
    document.querySelector(".another-class").dispatchEvent(event);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(2);
});

test("event-listener: it supports unregistering a listener", () => {
    document.body.innerHTML = bodyInnerHTML;

    const callback = jest.fn();

    const events = new EventListener(document.body);
    events.on("click", ".some-class", callback);

    const event = new MouseEvent("click", { bubbles: true });
    document.querySelector(".some-class").dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);

    events.off("click", ".some-class", callback);
    document.querySelector(".some-class").dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
});

test("event-listener: it supports unregistering a non-registered listener", () => {
    document.body.innerHTML = bodyInnerHTML;

    expect(() => {
        const events = new EventListener(document.body);
        events.off("click", ".some-class", noop);
    }).not.toThrow();
});

test("event-listener: it supports capturing an event", () => {
    document.body.innerHTML = bodyInnerHTML;

    const callback = jest.fn();

    const events = new EventListener(document.body);
    events.on("blur", ".some-class", callback);

    const event = new FocusEvent("blur");
    document.querySelector(".some-class").dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
});

test("event-listener: it has a destructor", () => {
    document.body.innerHTML = bodyInnerHTML;

    const callback = jest.fn();

    const events = new EventListener(document.body);
    events.on("click", ".some-class", callback);

    const event = new MouseEvent("click", { bubbles: true });
    document.querySelector(".some-class").dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);

    events.destruct();
    document.querySelector(".some-class").dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
});

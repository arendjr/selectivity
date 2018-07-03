'use strict';

var assign = require('lodash/assign');
var PropTypes = require('prop-types');
var React = require('react');

var Selectivity = require('../selectivity');

var selectivityOptions = {
    ajax: PropTypes.object,
    allowClear: PropTypes.bool,
    backspaceHighlightsBeforeDelete: PropTypes.bool,
    closeOnSelect: PropTypes.bool,
    createTokenItem: PropTypes.func,
    dropdown: PropTypes.func,
    dropdownCssClass: PropTypes.string,
    initSelection: PropTypes.func,
    inputType: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    items: PropTypes.array,
    itemsCollection: PropTypes.object,
    matcher: PropTypes.func,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    positionDropdown: PropTypes.func,
    query: PropTypes.func,
    readOnly: PropTypes.bool,
    removeOnly: PropTypes.bool,
    searchInputPlaceholder: PropTypes.string,
    shouldOpenSubmenu: PropTypes.func,
    showDropdown: PropTypes.bool,
    showSearchInputInDropdown: PropTypes.bool,
    suppressWheelSelector: PropTypes.string,
    tabIndex: PropTypes.number,
    templates: PropTypes.object,
    tokenizer: PropTypes.func,
    tokenSeparators: PropTypes.array
};

var selectivityCallbacks = {
    onChange: PropTypes.func,
    onDropdownClose: PropTypes.func,
    onDropdownOpen: PropTypes.func,
    onDropdownOpening: PropTypes.func,
    onHighlight: PropTypes.func,
    onSelect: PropTypes.func,
    onSelecting: PropTypes.func
};

var otherProps = {
    autoFocus: PropTypes.bool,
    className: PropTypes.string,
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    defaultData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    defaultValue: PropTypes.oneOfType([PropTypes.array, PropTypes.number, PropTypes.string]),
    multiple: PropTypes.bool,
    onClick: PropTypes.func,
    onInput: PropTypes.func,
    style: PropTypes.object,
    value: PropTypes.oneOfType([PropTypes.array, PropTypes.number, PropTypes.string])
};

var eventMapping = {
    onChange: 'selectivity-change',
    onDropdownClose: 'selectivity-close',
    onDropdownOpen: 'selectivity-open',
    onDropdownOpening: 'selectivity-opening',
    onHighlight: 'selectivity-highlight',
    onSelect: 'selectivity-selected',
    onSelecting: 'selectivity-selecting'
};

function propsToOptions(props) {
    var options = {};
    for (var key in props) {
        if (props.hasOwnProperty(key) && !(key in selectivityCallbacks) && !(key in otherProps)) {
            options[key] = props[key];
        }
    }
    return options;
}

function SelectivityReact(props) {
    React.Component.call(this, props);
}

SelectivityReact.displayName = 'Selectivity';

SelectivityReact.propTypes = assign({}, selectivityOptions, selectivityCallbacks, otherProps);

Selectivity.inherits(SelectivityReact, React.Component, {
    /**
     * Closes the dropdown.
     */
    close: function() {
        return this.selectivity.close();
    },

    componentDidMount: function() {
        var el = this.el;
        var props = this.props;

        var options = propsToOptions(props);
        var data = props.data || props.defaultData;
        if (data) {
            options.data = data;
        } else {
            var value = props.value || props.defaultValue;
            if (value) {
                options.value = value;
            }
        }

        var Inputs = Selectivity.Inputs;
        var InputType = props.inputType || (props.multiple ? 'Multiple' : 'Single');
        if (typeof InputType !== 'function') {
            if (Inputs[InputType]) {
                InputType = Inputs[InputType];
            } else {
                throw new Error('Unknown Selectivity input type: ' + InputType);
            }
        }

        options.element = el;
        el.selectivity = this.selectivity = new InputType(options);

        for (var propName in eventMapping) {
            if (eventMapping.hasOwnProperty(propName)) {
                var listener = props[propName];
                if (listener) {
                    var eventName = eventMapping[propName];
                    el.addEventListener(eventName, listener);
                }
            }
        }

        if (!props.onChange && (props.data || props.value) && !props.readOnly) {
            throw new Error(
                'Selectivity: You have specified a data or value property without an ' +
                    'onChange listener. You should use defaultData or defaultValue ' +
                    'instead.'
            );
        }

        if (props.autoFocus) {
            this.focus();
        }
    },

    componentDidUpdate: function(prevProps) {
        var props = this.props;
        var selectivity = this.selectivity;

        for (var propName in eventMapping) {
            if (eventMapping.hasOwnProperty(propName)) {
                var listener = props[propName];
                var prevListener = prevProps[propName];
                if (listener !== prevListener) {
                    var eventName = eventMapping[propName];
                    this.el.removeEventListener(eventName, prevListener);
                    this.el.addEventListener(eventName, listener);
                }
            }
        }

        selectivity.setOptions(propsToOptions(props));
        if (props.data !== prevProps.data) {
            selectivity.setData(props.data, { triggerChange: false });
            selectivity.rerenderSelection();
        }
        if (props.value !== prevProps.value || (props.value && props.items !== props.items)) {
            selectivity.setValue(props.value, { triggerChange: false });
            selectivity.rerenderSelection();
        }
    },

    /**
     * Applies focus to the input.
     */
    focus: function() {
        this.selectivity.focus();
    },

    /**
     * Returns the selection data.
     *
     * The selection data contains both IDs and text labels. If you only want to set or get the IDs,
     * you should use the getValue() method.
     */
    getData: function() {
        return this.selectivity.getData();
    },

    /**
     * Returns the value of the selection.
     *
     * The value of the selection only concerns the IDs of the selection items. If you are
     * interested in the IDs and the text labels, you should use the getData() method.
     */
    getValue: function() {
        return this.selectivity.getValue();
    },

    /**
     * Opens the dropdown.
     */
    open: function() {
        return this.selectivity.open();
    },

    render: function() {
        var self = this;
        var props = self.props;
        return React.createElement('div', {
            className: props.className,
            onClick: props.onClick,
            onInput: props.onInput,
            style: props.style,
            ref: function(el) {
                self.el = el;
            }
        });
    }
});

module.exports = Selectivity.React = SelectivityReact;

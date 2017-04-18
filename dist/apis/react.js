'use strict';

var extend = require('lodash/extend');
var React = require('react');
var PropTypes = React.PropTypes;

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

function propsToOptions(props) {

    var options = {};
    for (var key in props) {
        if (props.hasOwnProperty(key) && !(key in selectivityCallbacks) && !(key in otherProps)) {
            options[key] = props[key];
        }
    }
    return options;
}

var SelectivityReact = React.createClass({

    displayName: 'Selectivity',

    propTypes: extend({}, selectivityOptions, selectivityCallbacks, otherProps),

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
        var InputType = (props.inputType || (props.multiple ? 'Multiple' : 'Single'));
        if (typeof InputType !== 'function') {
            if (Inputs[InputType]) {
                InputType = Inputs[InputType];
            } else {
                throw new Error('Unknown Selectivity input type: ' + InputType);
            }
        }

        options.element = el;
        el.selectivity = this.selectivity = new InputType(options);

        if (props.onChange) {
            el.addEventListener('selectivity-change', props.onChange);
        } else if ((props.data || props.value) && !props.readOnly) {
            throw new Error('Selectivity: You have specified a data or value property without an ' +
                            'onChange listener. You should use defaultData or defaultValue ' +
                            'instead.');
        }

        if (props.onDropdownClose) {
            el.addEventListener('selectivity-close', props.onDropdownClose);
        }
        if (props.onDropdownOpen) {
            el.addEventListener('selectivity-open', props.onDropdownOpen);
        }
        if (props.onDropdownOpening) {
            el.addEventListener('selectivity-opening', props.onDropdownOpening);
        }
        if (props.onHighlight) {
            el.addEventListener('selectivity-highlight', props.onHighlight);
        }
        if (props.onSelect) {
            el.addEventListener('selectivity-selected', props.onSelect);
        }
        if (props.onSelecting) {
            el.addEventListener('selectivity-selecting', props.onSelecting);
        }

        if (props.autoFocus) {
            this.focus();
        }
    },

    componentWillReceiveProps: function(nextProps) {

        var selectivity = this.selectivity;

        selectivity.setOptions(propsToOptions(nextProps));
        if (nextProps.data !== this.props.data) {
            selectivity.setData(nextProps.data, { triggerChange: false });
            selectivity.rerenderSelection();
        }
        if (nextProps.value !== this.props.value ||
            (nextProps.value && nextProps.items !== this.props.items)) {
            selectivity.setValue(nextProps.value, { triggerChange: false });
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

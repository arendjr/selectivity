'use strict';

var isValidElement = require('react').isValidElement;
var ReactDOM = require('react-dom');

var Selectivity = require('../../selectivity');

var div = null;
function renderToString(element) {
    div = div || document.createElement('div');
    ReactDOM.render(element, div);
    return div.innerHTML;
}

/**
 * Overrides the Selectivity template() method to support React templates.
 *
 * This allows templates to be specified through JSX such as these:
 *
 *     const templates = {
 *         resultLabel: props => <div className='selectivity-result-label'>{props.text}</div>,
 *         singleSelectInput: (
 *             <div className='selectivity-single-select'>
 *                 <input className='selectivity-single-select-input' type='text' />
 *                 <div class='selectivity-single-result-container' />
 *                 <i className='fa fa-sort-desc selectivity-caret' />
 *             </div>
 *         )
 *     };
 */
var templateMethod = Selectivity.prototype.template;
Selectivity.prototype.template = function(templateName, options) {

    var template = this.templates[templateName];
    if (isValidElement(template)) {
        return renderToString(template);
    }

    var result = templateMethod.call(this, templateName, options);
    if (isValidElement(result)) {
        return renderToString(result);
    } else {
        return result;
    }
};

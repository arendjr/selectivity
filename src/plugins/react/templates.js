'use strict';

var isValidElement = require('react').isValidElement;
var ReactDOMServer = require('react-dom/server');

var Selectivity = require('../../selectivity');

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
        return ReactDOMServer.renderToStaticMarkup(template);
    }

    var result = templateMethod.call(this, templateName, options);
    if (isValidElement(result)) {
        return ReactDOMServer.renderToStaticMarkup(result);
    } else {
        return result;
    }
};

import Selectivity from "../selectivity";

let latestQueryNum = 0;

/**
 * Option listener that will discard any callbacks from the query function if another query has
 * been called afterwards. This prevents responses from remote sources arriving out-of-order.
 */
Selectivity.OptionListeners.push(function(selectivity, options) {
    const query = options.query;
    if (query && !query._async) {
        options.query = function(queryOptions) {
            latestQueryNum++;
            const queryNum = latestQueryNum;

            const callback = queryOptions.callback;
            const error = queryOptions.error;
            queryOptions.callback = function() {
                if (queryNum === latestQueryNum) {
                    callback.apply(null, arguments);
                }
            };
            queryOptions.error = function() {
                if (queryNum === latestQueryNum) {
                    error.apply(null, arguments);
                }
            };
            query(queryOptions);
        };
        options.query._async = true;
    }
});

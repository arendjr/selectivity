/* global $ */
"use strict";

function htmlEscape(string) {
    return string
        ? String(string).replace(/[&<>"']/g, function(match) {
              return {
                  "&": "&amp;",
                  "<": "&lt;",
                  ">": "&gt;",
                  '"': "&quot;",
                  "'": "&#39;",
              }[match];
          })
        : "";
}

$(document).ready(function() {
    // ['Amsterdam', 'Antwerp', ...]
    const cities = $("#single-select-box")
        .find("option")
        .map(function() {
            return this.textContent;
        })
        .get();

    // [ { text: 'Austria', children: [ { id: 54, text: 'Vienna' } ] }, ... ]
    const citiesByCountry = $("#multiple-select-box")
        .find("optgroup")
        .map(function() {
            return {
                text: this.getAttribute("label"),
                children: $(this)
                    .find("option")
                    .map(function() {
                        return {
                            id: parseInt(this.getAttribute("value"), 10),
                            text: this.textContent,
                        };
                    })
                    .get(),
            };
        })
        .get();

    // [{ id: 'Amsterdam', timezone: '+01:00' }, ...]
    const citiesWithTimezone = $("#multiple-select-box")
        .find("option")
        .map(function() {
            return {
                id: this.textContent,
                timezone: this.getAttribute("data-timezone"),
            };
        })
        .get();

    const transformText = $.Selectivity.transformText;

    // example query function that returns at most 10 cities matching the given text
    function queryFunction(query) {
        const selectivity = query.selectivity;
        const term = query.term;
        const offset = query.offset || 0;
        let results;
        if (selectivity.el.getAttribute("id") === "single-input-with-submenus") {
            if (selectivity.dropdown) {
                const timezone = selectivity.dropdown.highlightedResult.id;
                results = citiesWithTimezone
                    .filter(function(city) {
                        return (
                            transformText(city.id).indexOf(transformText(term)) > -1 &&
                            city.timezone === timezone
                        );
                    })
                    .map(function(city) {
                        return city.id;
                    });
            } else {
                query.callback({ more: false, results: [] });
                return;
            }
        } else {
            results = cities.filter(function(city) {
                return transformText(city).indexOf(transformText(term)) > -1;
            });
        }
        results.sort(function(a, b) {
            a = transformText(a);
            b = transformText(b);
            const startA = a.slice(0, term.length) === term,
                startB = b.slice(0, term.length) === term;
            if (startA) {
                return startB ? (a > b ? 1 : -1) : -1;
            } else {
                return startB ? 1 : a > b ? 1 : -1;
            }
        });
        setTimeout(function() {
            query.callback({
                more: results.length > offset + 10,
                results: results.slice(offset, offset + 10),
            });
        }, 500);
    }

    $("#single-input").selectivity({
        allowClear: true,
        placeholder: "No city selected",
        query: queryFunction,
        searchInputPlaceholder: "Type to search a city",
    });

    $("#single-input-without-search").selectivity({
        allowClear: true,
        items: cities,
        placeholder: "No city selected",
        showSearchInputInDropdown: false,
    });

    $("#single-input-with-labels").selectivity({
        allowClear: true,
        items: citiesByCountry,
        placeholder: "No city selected",
        searchInputPlaceholder: "Type to search a city",
    });

    const submenu = {
        query: queryFunction,
        showSearchInput: true,
    };

    $("#single-input-with-submenus").selectivity({
        allowClear: true,
        items: [
            { text: "Western European Time Zone", id: "+00:00", submenu: submenu },
            { text: "Central European Time Zone", id: "+01:00", submenu: submenu },
            { text: "Eastern European Time Zone", id: "+02:00", submenu: submenu },
        ],
        placeholder: "No city selected",
        showSearchInputInDropdown: false,
    });

    $("#multiple-input").selectivity({
        multiple: true,
        placeholder: "Type to search cities",
        query: queryFunction,
    });

    $("#tags-input").selectivity({
        items: ["red", "green", "blue"],
        multiple: true,
        tokenSeparators: [" "],
        value: ["brown", "red", "green"],
    });

    $("#emails-input").selectivity({
        inputType: "Email",
        placeholder: "Type or paste email addresses",
    });

    $("#single-select-box").selectivity();

    $("#multiple-select-box").selectivity();

    $("#repository-input").selectivity({
        ajax: {
            url: "https://api.github.com/search/repositories",
            dataType: "json",
            minimumInputLength: 3,
            quietMillis: 250,
            fetch: function(url, init, queryOptions) {
                return fetch(url, init)
                    .then(function(response) {
                        return response.json();
                    })
                    .then(function(data) {
                        const offset = queryOptions.offset || 0;
                        return {
                            results: data.items.map(function(item) {
                                return {
                                    id: item.id,
                                    text: item.name,
                                    description: item.description,
                                };
                            }),
                            more: data.total_count > offset + data.items.length,
                        };
                    });
            },
            params: function(term, offset) {
                // GitHub uses 1-based pages with 30 results, by default
                const page = 1 + Math.floor(offset / 30);

                return { q: term, page: page };
            },
        },
        placeholder: "Search for a repository",
        templates: {
            resultItem: function(item) {
                return (
                    `<div class="selectivity-result-item" data-item-id="${item.id}">` +
                    `<b>${htmlEscape(item.text)}</b><br>${htmlEscape(item.description)}</div>`
                );
            },
        },
    });
});

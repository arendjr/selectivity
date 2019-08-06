/* global React, ReactDOM, Selectivity */
"use strict";

const cities = [
    "Amsterdam",
    "Antwerp",
    "Athens",
    "Barcelona",
    "Berlin",
    "Birmingham",
    "Bradford",
    "Bremen",
    "Brussels",
    "Bucharest",
    "Budapest",
    "Cologne",
    "Copenhagen",
    "Dortmund",
    "Dresden",
    "Dublin",
    "Düsseldorf",
    "Essen",
    "Frankfurt",
    "Genoa",
    "Glasgow",
    "Gothenburg",
    "Hamburg",
    "Hannover",
    "Helsinki",
    "Leeds",
    "Leipzig",
    "Lisbon",
    "Łódź",
    "London",
    "Kraków",
    "Madrid",
    "Málaga",
    "Manchester",
    "Marseille",
    "Milan",
    "Munich",
    "Naples",
    "Palermo",
    "Paris",
    "Poznań",
    "Prague",
    "Riga",
    "Rome",
    "Rotterdam",
    "Seville",
    "Sheffield",
    "Sofia",
    "Stockholm",
    "Stuttgart",
    "The Hague",
    "Turin",
    "Valencia",
    "Vienna",
    "Vilnius",
    "Warsaw",
    "Wrocław",
    "Zagreb",
    "Zaragoza",
];

const citiesByCountry = [
    {
        text: "Austria",
        children: [{ id: 54, text: "Vienna" }],
    },
    {
        text: "Belgium",
        children: [{ id: 2, text: "Antwerp" }, { id: 9, text: "Brussels" }],
    },
    {
        text: "Bulgaria",
        children: [{ id: 48, text: "Sofia" }],
    },
    {
        text: "Croatia",
        children: [{ id: 58, text: "Zagreb" }],
    },
    {
        text: "Czech Republic",
        children: [{ id: 42, text: "Prague" }],
    },
    {
        text: "Denmark",
        children: [{ id: 13, text: "Copenhagen" }],
    },
    {
        text: "England",
        children: [
            { id: 6, text: "Birmingham" },
            { id: 7, text: "Bradford" },
            { id: 26, text: "Leeds" },
            { id: 30, text: "London" },
            { id: 34, text: "Manchester" },
            { id: 47, text: "Sheffield" },
        ],
    },
    {
        text: "Finland",
        children: [{ id: 25, text: "Helsinki" }],
    },
    {
        text: "France",
        children: [{ id: 35, text: "Marseille" }, { id: 40, text: "Paris" }],
    },
    {
        text: "Germany",
        children: [
            { id: 5, text: "Berlin" },
            { id: 8, text: "Bremen" },
            { id: 12, text: "Cologne" },
            { id: 14, text: "Dortmund" },
            { id: 15, text: "Dresden" },
            { id: 17, text: "Düsseldorf" },
            { id: 18, text: "Essen" },
            { id: 19, text: "Frankfurt" },
            { id: 23, text: "Hamburg" },
            { id: 24, text: "Hannover" },
            { id: 27, text: "Leipzig" },
            { id: 37, text: "Munich" },
            { id: 50, text: "Stuttgart" },
        ],
    },
    {
        text: "Greece",
        children: [{ id: 3, text: "Athens" }],
    },
    {
        text: "Hungary",
        children: [{ id: 11, text: "Budapest" }],
    },
    {
        text: "Ireland",
        children: [{ id: 16, text: "Dublin" }],
    },
    {
        text: "Italy",
        children: [
            { id: 20, text: "Genoa" },
            { id: 36, text: "Milan" },
            { id: 38, text: "Naples" },
            { id: 39, text: "Palermo" },
            { id: 44, text: "Rome" },
            { id: 52, text: "Turin" },
        ],
    },
    {
        text: "Latvia",
        children: [{ id: 43, text: "Riga" }],
    },
    {
        text: "Lithuania",
        children: [{ id: 55, text: "Vilnius" }],
    },
    {
        text: "Netherlands",
        children: [
            { id: 1, text: "Amsterdam" },
            { id: 45, text: "Rotterdam" },
            { id: 51, text: "The Hague" },
        ],
    },
    {
        text: "Poland",
        children: [
            { id: 29, text: "Łódź" },
            { id: 31, text: "Kraków" },
            { id: 41, text: "Poznań" },
            { id: 56, text: "Warsaw" },
            { id: 57, text: "Wrocław" },
        ],
    },
    {
        text: "Portugal",
        children: [{ id: 28, text: "Lisbon" }],
    },
    {
        text: "Romania",
        children: [{ id: 10, text: "Bucharest" }],
    },
    {
        text: "Scotland",
        children: [{ id: 21, text: "Glasgow" }],
    },
    {
        text: "Spain",
        children: [
            { id: 4, text: "Barcelona" },
            { id: 32, text: "Madrid" },
            { id: 33, text: "Málaga" },
            { id: 46, text: "Seville" },
            { id: 53, text: "Valencia" },
            { id: 59, text: "Zaragoza" },
        ],
    },
    {
        text: "Sweden",
        children: [{ id: 22, text: "Gothenburg" }, { id: 49, text: "Stockholm" }],
    },
];

const citiesWithTimezone = [
    { id: "Amsterdam", timezone: "+01:00" },
    { id: "Antwerp", timezone: "+01:00" },
    { id: "Athens", timezone: "+02:00" },
    { id: "Barcelona", timezone: "+00:00" },
    { id: "Berlin", timezone: "+01:00" },
    { id: "Birmingham", timezone: "+00:00" },
    { id: "Bradford", timezone: "+00:00" },
    { id: "Bremen", timezone: "+01:00" },
    { id: "Brussels", timezone: "+01:00" },
    { id: "Bucharest", timezone: "+02:00" },
    { id: "Budapest", timezone: "+01:00" },
    { id: "Cologne", timezone: "+01:00" },
    { id: "Copenhagen", timezone: "+01:00" },
    { id: "Dortmund", timezone: "+01:00" },
    { id: "Dresden", timezone: "+01:00" },
    { id: "Dublin", timezone: "+00:00" },
    { id: "Düsseldorf", timezone: "+01:00" },
    { id: "Essen", timezone: "+01:00" },
    { id: "Frankfurt", timezone: "+01:00" },
    { id: "Genoa", timezone: "+01:00" },
    { id: "Glasgow", timezone: "+00:00" },
    { id: "Gothenburg", timezone: "+01:00" },
    { id: "Hamburg", timezone: "+01:00" },
    { id: "Hannover", timezone: "+01:00" },
    { id: "Helsinki", timezone: "+02:00" },
    { id: "Kraków", timezone: "+01:00" },
    { id: "Leeds", timezone: "+00:00" },
    { id: "Leipzig", timezone: "+01:00" },
    { id: "Lisbon", timezone: "+00:00" },
    { id: "Łódź", timezone: "+01:00" },
    { id: "London", timezone: "+00:00" },
    { id: "Madrid", timezone: "+00:00" },
    { id: "Málaga", timezone: "+00:00" },
    { id: "Manchester", timezone: "+00:00" },
    { id: "Marseille", timezone: "+01:00" },
    { id: "Milan", timezone: "+01:00" },
    { id: "Munich", timezone: "+01:00" },
    { id: "Naples", timezone: "+01:00" },
    { id: "Palermo", timezone: "+01:00" },
    { id: "Paris", timezone: "+01:00" },
    { id: "Poznań", timezone: "+01:00" },
    { id: "Prague", timezone: "+01:00" },
    { id: "Riga", timezone: "+02:00" },
    { id: "Rome", timezone: "+01:00" },
    { id: "Rotterdam", timezone: "+01:00" },
    { id: "Seville", timezone: "+00:00" },
    { id: "Sheffield", timezone: "+00:00" },
    { id: "Sofia", timezone: "+02:00" },
    { id: "Stockholm", timezone: "+01:00" },
    { id: "Stuttgart", timezone: "+01:00" },
    { id: "The Hague", timezone: "+01:00" },
    { id: "Turin", timezone: "+01:00" },
    { id: "Valencia", timezone: "+00:00" },
    { id: "Vienna", timezone: "+01:00" },
    { id: "Vilnius", timezone: "+02:00" },
    { id: "Warsaw", timezone: "+01:00" },
    { id: "Wrocław", timezone: "+01:00" },
    { id: "Zagreb", timezone: "+01:00" },
    { id: "Zaragoza", timezone: "+00:00" },
];

const transformText = Selectivity.transformText;

// example query function that returns at most 10 cities matching the given text
function queryFunction(query) {
    const selectivity = query.selectivity;
    const term = query.term;
    const offset = query.offset || 0;
    let results;
    if (selectivity.el.parentElement.getAttribute("id") === "single-input-with-submenus") {
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

const submenu = {
    query: queryFunction,
    showSearchInput: true,
};

window.onload = function() {
    ReactDOM.render(
        React.createElement(Selectivity.React, {
            allowClear: true,
            className: "selectivity-input",
            placeholder: "No city selected",
            query: queryFunction,
            searchInputPlaceholder: "Type to search a city",
        }),
        document.querySelector("#single-input"),
    );

    ReactDOM.render(
        React.createElement(Selectivity.React, {
            allowClear: true,
            className: "selectivity-input",
            items: cities,
            placeholder: "No city selected",
            showSearchInputInDropdown: false,
        }),
        document.querySelector("#single-input-without-search"),
    );

    ReactDOM.render(
        React.createElement(Selectivity.React, {
            allowClear: true,
            className: "selectivity-input",
            items: citiesByCountry,
            placeholder: "No city selected",
            searchInputPlaceholder: "Type to search a city",
        }),
        document.querySelector("#single-input-with-labels"),
    );

    ReactDOM.render(
        React.createElement(Selectivity.React, {
            allowClear: true,
            className: "selectivity-input",
            items: [
                { text: "Western European Time Zone", id: "+00:00", submenu: submenu },
                { text: "Central European Time Zone", id: "+01:00", submenu: submenu },
                { text: "Eastern European Time Zone", id: "+02:00", submenu: submenu },
            ],
            placeholder: "No city selected",
            showSearchInputInDropdown: false,
        }),
        document.querySelector("#single-input-with-submenus"),
    );

    ReactDOM.render(
        React.createElement(Selectivity.React, {
            className: "selectivity-input",
            multiple: true,
            placeholder: "Type to search cities",
            query: queryFunction,
        }),
        document.querySelector("#multiple-input"),
    );

    ReactDOM.render(
        React.createElement(Selectivity.React, {
            className: "selectivity-input",
            defaultValue: ["brown", "red", "green"],
            items: ["red", "green", "blue"],
            multiple: true,
            tokenSeparators: [" "],
        }),
        document.querySelector("#tags-input"),
    );

    ReactDOM.render(
        React.createElement(Selectivity.React, {
            className: "selectivity-input",
            inputType: "Email",
            placeholder: "Type or paste email addresses",
        }),
        document.querySelector("#emails-input"),
    );

    ReactDOM.render(
        React.createElement(Selectivity.React, {
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
            className: "selectivity-input",
            placeholder: "Search for a repository",
            templates: {
                resultItem: function(props) {
                    const attrs = {
                        className: "selectivity-result-item",
                        "data-item-id": props.id,
                    };
                    return React.createElement(
                        "div",
                        attrs,
                        React.createElement("b", null, props.text),
                        React.createElement("br"),
                        props.description,
                    );
                },
            },
        }),
        document.querySelector("#repository-input"),
    );
};

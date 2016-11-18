function escape(string) {
    return string ? String(string).replace(/[&<>"']/g, function(match) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[match];
    }) : '';
}

var cities = [
    'Amsterdam',
    'Antwerp',
    'Athens',
    'Barcelona',
    'Berlin',
    'Birmingham',
    'Bradford',
    'Bremen',
    'Brussels',
    'Bucharest',
    'Budapest',
    'Cologne',
    'Copenhagen',
    'Dortmund',
    'Dresden',
    'Dublin',
    'Düsseldorf',
    'Essen',
    'Frankfurt',
    'Genoa',
    'Glasgow',
    'Gothenburg',
    'Hamburg',
    'Hannover',
    'Helsinki',
    'Leeds',
    'Leipzig',
    'Lisbon',
    'Łódź',
    'London',
    'Kraków',
    'Madrid',
    'Málaga',
    'Manchester',
    'Marseille',
    'Milan',
    'Munich',
    'Naples',
    'Palermo',
    'Paris',
    'Poznań',
    'Prague',
    'Riga',
    'Rome',
    'Rotterdam',
    'Seville',
    'Sheffield',
    'Sofia',
    'Stockholm',
    'Stuttgart',
    'The Hague',
    'Turin',
    'Valencia',
    'Vienna',
    'Vilnius',
    'Warsaw',
    'Wrocław',
    'Zagreb',
    'Zaragoza'
];

var citiesByCountry = [
    {
        text: 'Austria',
        children: [
            { id: 54, text: 'Vienna' }
        ]
    },
    {
        text: 'Belgium',
        children: [
            { id: 2, text: 'Antwerp' },
            { id: 9, text: 'Brussels' }
        ]
    },
    {
        text: 'Bulgaria',
        children: [
            { id: 48, text: 'Sofia' }
        ]
    },
    {
        text: 'Croatia',
        children: [
            { id: 58, text: 'Zagreb' }
        ]
    },
    {
        text: 'Czech Republic',
        children: [
            { id: 42, text: 'Prague' }
        ]
    },
    {
        text: 'Denmark',
        children: [
            { id: 13, text: 'Copenhagen' }
        ]
    },
    {
        text: 'England',
        children: [
            { id: 6, text: 'Birmingham' },
            { id: 7, text: 'Bradford' },
            { id: 26, text: 'Leeds' },
            { id: 30, text: 'London' },
            { id: 34, text: 'Manchester' },
            { id: 47, text: 'Sheffield' }
        ]
    },
    {
        text: 'Finland',
        children: [
            { id: 25, text: 'Helsinki' }
        ]
    },
    {
        text: 'France',
        children: [
            { id: 35, text: 'Marseille' },
            { id: 40, text: 'Paris' }
        ]
    },
    {
        text: 'Germany',
        children: [
            { id: 5, text: 'Berlin' },
            { id: 8, text: 'Bremen' },
            { id: 12, text: 'Cologne' },
            { id: 14, text: 'Dortmund' },
            { id: 15, text: 'Dresden' },
            { id: 17, text: 'Düsseldorf' },
            { id: 18, text: 'Essen' },
            { id: 19, text: 'Frankfurt' },
            { id: 23, text: 'Hamburg' },
            { id: 24, text: 'Hannover' },
            { id: 27, text: 'Leipzig' },
            { id: 37, text: 'Munich' },
            { id: 50, text: 'Stuttgart' }
        ]
    },
    {
        text: 'Greece',
        children: [
            { id: 3, text: 'Athens' }
        ]
    },
    {
        text: 'Hungary',
        children: [
            { id: 11, text: 'Budapest' }
        ]
    },
    {
        text: 'Ireland',
        children: [
            { id: 16, text: 'Dublin' }
        ]
    },
    {
        text: 'Italy',
        children: [
            { id: 20, text: 'Genoa' },
            { id: 36, text: 'Milan' },
            { id: 38, text: 'Naples' },
            { id: 39, text: 'Palermo' },
            { id: 44, text: 'Rome' },
            { id: 52, text: 'Turin' }
        ]
    },
    {
        text: 'Latvia',
        children: [
            { id: 43, text: 'Riga' }
        ]
    },
    {
        text: 'Lithuania',
        children: [
            { id: 55, text: 'Vilnius' }
        ]
    },
    {
        text: 'Netherlands',
        children: [
            { id: 1, text: 'Amsterdam' },
            { id: 45, text: 'Rotterdam' },
            { id: 51, text: 'The Hague' }
        ]
    },
    {
        text: 'Poland',
        children: [
            { id: 29, text: 'Łódź' },
            { id: 31, text: 'Kraków' },
            { id: 41, text: 'Poznań' },
            { id: 56, text: 'Warsaw' },
            { id: 57, text: 'Wrocław' }
        ]
    },
    {
        text: 'Portugal',
        children: [
            { id: 28, text: 'Lisbon' }
        ]
    },
    {
        text: 'Romania',
        children: [
            { id: 10, text: 'Bucharest' }
        ]
    },
    {
        text: 'Scotland',
        children: [
            { id: 21, text: 'Glasgow' }
        ]
    },
    {
        text: 'Spain',
        children: [
            { id: 4, text: 'Barcelona' },
            { id: 32, text: 'Madrid' },
            { id: 33, text: 'Málaga' },
            { id: 46, text: 'Seville' },
            { id: 53, text: 'Valencia' },
            { id: 59, text: 'Zaragoza' }
        ]
    },
    {
        text: 'Sweden',
        children: [
            { id: 22, text: 'Gothenburg' },
            { id: 49, text: 'Stockholm' }
        ]
    }
];

var citiesByTimezone = [
    {
        id: '+00:00',
        text: 'Western European Time Zone',
        submenu: {
            items: [
                { id: 4, text: 'Barcelona' },
                { id: 6, text: 'Birmingham' },
                { id: 7, text: 'Bradford' },
                { id: 16, text: 'Dublin' },
                { id: 21, text: 'Glasgow' },
                { id: 26, text: 'Leeds' },
                { id: 28, text: 'Lisbon' },
                { id: 30, text: 'London' },
                { id: 32, text: 'Madrid' },
                { id: 33, text: 'Málaga' },
                { id: 34, text: 'Manchester' },
                { id: 46, text: 'Seville' },
                { id: 47, text: 'Sheffield' },
                { id: 53, text: 'Valencia' },
                { id: 59, text: 'Zaragoza' }
            ],
            showSearchInput: true
        }
    },
    {
        id: '+01:00',
        text: 'Central European Time Zone',
        submenu: {
            items: [
                { id: 1, text: 'Amsterdam' },
                { id: 2, text: 'Antwerp' },
                { id: 5, text: 'Berlin' },
                { id: 8, text: 'Bremen' },
                { id: 9, text: 'Brussels' },
                { id: 11, text: 'Budapest' },
                { id: 12, text: 'Cologne' },
                { id: 13, text: 'Copenhagen' },
                { id: 14, text: 'Dortmund' },
                { id: 15, text: 'Dresden' },
                { id: 17, text: 'Düsseldorf' },
                { id: 18, text: 'Essen' },
                { id: 19, text: 'Frankfurt' },
                { id: 20, text: 'Genoa' },
                { id: 22, text: 'Gothenburg' },
                { id: 23, text: 'Hamburg' },
                { id: 24, text: 'Hannover' },
                { id: 27, text: 'Leipzig' },
                { id: 29, text: 'Łódź' },
                { id: 31, text: 'Kraków' },
                { id: 35, text: 'Marseille' },
                { id: 36, text: 'Milan' },
                { id: 37, text: 'Munich' },
                { id: 38, text: 'Naples' },
                { id: 39, text: 'Palermo' },
                { id: 40, text: 'Paris' },
                { id: 41, text: 'Poznań' },
                { id: 42, text: 'Prague' },
                { id: 44, text: 'Rome' },
                { id: 45, text: 'Rotterdam' },
                { id: 49, text: 'Stockholm' },
                { id: 50, text: 'Stuttgart' },
                { id: 51, text: 'The Hague' },
                { id: 52, text: 'Turin' },
                { id: 54, text: 'Vienna' },
                { id: 56, text: 'Warsaw' },
                { id: 57, text: 'Wrocław' },
                { id: 58, text: 'Zagreb' }
            ],
            showSearchInput: true
        }
    },
    {
        id: '+02:00',
        text: 'Eastern European Time Zone',
        submenu: {
            items: [
                { id: 3, text: 'Athens' },
                { id: 10, text: 'Bucharest' },
                { id: 25, text: 'Helsinki' },
                { id: 43, text: 'Riga' },
                { id: 48, text: 'Sofia' },
                { id: 55, text: 'Vilnius' }
            ]
        }
    }
];

$('#example-1').selectivity({
    allowClear: true,
    items: cities,
    placeholder: 'No city selected'
});

$('#example-2').selectivity({
    items: cities,
    multiple: true,
    placeholder: 'Type to search a city'
});

$('#example-3').selectivity({
    allowClear: true,
    items: citiesByCountry,
    placeholder: 'No city selected'
});

$('#example-4').selectivity({
    allowClear: true,
    items: citiesByTimezone,
    placeholder: 'No city selected',
    showSearchInputInDropdown: false
});

$('#example-5').selectivity({
    inputType: 'Email',
    placeholder: 'Type or paste email addresses'
});

$('#example-6').selectivity({
    ajax: {
        url: 'https://api.github.com/search/repositories',
        minimumInputLength: 3,
        quietMillis: 250,
        params: function(term, offset) {
            // GitHub uses 1-based pages with 30 results, by default
            return { q: term, page: 1 + Math.floor(offset / 30) };
        },
        fetch: function(url, init, queryOptions) {
            return $.ajax(url).then(function(data) {
                return {
                    results: $.map(data.items, function(item) {
                        return {
                            id: item.id,
                            text: item.name,
                            description: item.description
                        };
                    }),
                    more: (data.total_count > queryOptions.offset + data.items.length)
                };
            });
        }
    },
    placeholder: 'Search for a repository',
    templates: {
        resultItem: function(item) {
            return (
                '<div class="selectivity-result-item" data-item-id="' + escape(item.id) + '">' +
                    '<b>' + escape(item.text) + '</b><br>' +
                    escape(item.description) +
                '</div>'
            );
        }
    }
});

// toggle between code samples
$('body').on('click', '.handle', function(event) {
    var active = ($(event.currentTarget).hasClass('jquery') ? 'jquery' : 'react');
    $('.example-code').removeClass('active');
    $('.example-code.' + active).addClass('active');
    $('.handle').removeClass('active');
    $('.handle.' + active).addClass('active');
});

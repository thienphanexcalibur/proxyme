const profile = {
    'rules': [
        [
            'http://example.com/*',
            'http://localhost:4444/*'
        ],
        {
            'regex': {
                'from': '^https?://example\\.com/(.*)$',
                'to': 'http://localhost:4444/$1'
            },
            'wildcards': [
                'http://example.com/*',
                'https://example.com/*'
            ]
        }
    ]
};
module.exports = profile;

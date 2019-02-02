const openInDefaultBrowser = require('opn');

// #region Constants
const GOOGLE = 'google';
const GITHUB = 'github';

const searchEngineTokens = {
    [GOOGLE]: ['go', 'goo', 'goog', 'google'],
    [GITHUB]: ['gh', 'git', 'github'],
};

const searchEngineURLs = {
    [GOOGLE]: 'https://www.google.com/search?q=',
    [GITHUB]: 'https://github.com/search?q=',
};

const args = process.argv;
// Expecting searchTokenIndex to be 2 given ['node', 'main.js', 'searchToken'] args
const searchTokenIndex = 2;
// #endregion

// #region Helper Functions
function prepareSearchQuery(tokenIndex, processArgs) {
    return processArgs.slice((tokenIndex + 1), processArgs.length).join(' ');
}

function getSearchEngine(userToken, validSearchTokens) {
    let matchedToken;

    const engineTokenEntries = Object.entries(validSearchTokens);
    for (const searchEngine of engineTokenEntries) {
        if (searchEngine[1].indexOf(userToken) !== -1) {
            matchedToken = searchEngine[0];
            break;
        }
    }
    return matchedToken;
}
// #endregion

// #region Main Program
if (args.length > (searchTokenIndex + 1)) {
    const matchedToken = getSearchEngine(args[searchTokenIndex], searchEngineTokens);

    if (matchedToken) {
        const searchQuery = prepareSearchQuery(searchTokenIndex, args);

        openInDefaultBrowser(searchEngineURLs[matchedToken] + searchQuery);
    }
}

process.exit(0);
// #endregion

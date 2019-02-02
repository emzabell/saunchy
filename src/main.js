const opn = require('opn');

const args = process.argv;
const searchTokenIndex = 2;

const searchTokens = {
    google: ['go', 'goo', 'goog', 'google'],
    github: ['gh', 'git', 'github']
};

const tokenURLs = {
    [searchTokens.google]: 'https://www.google.com/search?q=',
    [searchTokens.github]: 'https://github.com/search?q=',
};

const indexOfUserSearchToken = getSearchTokenIndex(args[searchTokenIndex], searchTokens);

if (args.length > (searchTokenIndex + 1) &&  indexOfUserSearchToken != -1) {
    const searchQuery = joinTrailingArgs(searchTokenIndex, args);

    opn(tokenURLs[searchTokens[indexOfUserSearchToken]] + searchQuery);

    process.exit(0);
}

function joinTrailingArgs(tokenIndex, processArgs) {
    return processArgs.slice((tokenIndex + 1), processArgs.length).join(' ');
}

function getSearchTokenIndex(userToken, acceptableSearchTokens) {
    let matchIndex = -1;
    let matchFound = false;

    for (let index in acceptableSearchTokens) {
        if (acceptableSearchTokens[index].indexOf(userToken) != -1) {
            matchIndex = index;
            matchFound = true;
        }
        if (matchFound) {
            break;
        }
    }

    return matchIndex;
}
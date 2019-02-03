const openInDefaultBrowser = require('opn');
const fs = require('fs');
const cheerio = require('cheerio');

// #region Constants
const DEFINE = 'define';
const GOOGLE = 'google';
const GITHUB = 'github';
const NPM = 'npm';
const STACKOVERFLOW = 'stackoverflow';
const YOUTUBE = 'youtube';

const searchEngineTokens = {
    [DEFINE]: ['define', 'def', 'dict'],
    [GOOGLE]: ['google', 'go', 'goo', 'goog'],
    [GITHUB]: ['gh', 'git', 'github'],
    [NPM]: ['npm', 'package', 'pkg'],
    [STACKOVERFLOW]: ['so', 'stackoverflow', 'stack', 'overflow'],
    [YOUTUBE]: ['youtube', 'yt', 'video', 'vid'],
};

const searchEngineURLs = {
    [DEFINE]: 'https://www.google.com/search?q=define+',
    [GOOGLE]: 'https://www.google.com/search?q=',
    [GITHUB]: 'https://github.com/search?q=',
    [NPM]: 'https://www.npmjs.com/search?q=',
    [STACKOVERFLOW]: 'https://stackoverflow.com/search?q=',
    [YOUTUBE]: 'https://www.youtube.com/results?search_query=',
};

const topLevelDomains = ['.com', '.org', '.edu', '.gov', '.net', '.io', '.uk', '.us'];

const args = process.argv;
const firstUserArgIndex = 2;
const firstUserArg = args[firstUserArgIndex];
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

function getBookmarksFromFile() {
    const bookmarks = {};
    const bookmarksFilePath = `${__dirname}/bookmarks.html`;

    if (fs.existsSync(bookmarksFilePath)) {
        const bookmarksFileString = fs.readFileSync(bookmarksFilePath, 'utf-8');
        const $ = cheerio.load(bookmarksFileString);

        $('a').each((index, element) => {
            const bookmarkName = $(element).text();
            if (bookmarkName) {
                const bookmarkPropertyName = Symbol(`${bookmarkName.toLowerCase()}`);
                bookmarks[bookmarkPropertyName] = $(element).attr('href');
            }
        });
    }

    return bookmarks;
}

function getBookmarkURLToLaunch(requestedBookmark, knownBookmarks) {
    let bookmarkURL;
    const matchedBookmarkURLs = [];
    const bookmarkNames = Object.getOwnPropertySymbols(knownBookmarks);

    bookmarkNames.forEach((symbol) => {
        if (symbol.description.includes(requestedBookmark.toLowerCase())) {
            matchedBookmarkURLs.push(knownBookmarks[symbol]);
        }
    });

    // Assume that shorter URL is desired if more than one match
    if (matchedBookmarkURLs.length > 1) {
        matchedBookmarkURLs.sort((a, b) => a.length - b.length);
    }

    if (matchedBookmarkURLs.length > 0) {
        bookmarkURL = matchedBookmarkURLs[0];
    }

    return bookmarkURL;
}
// #endregion

// #region Main Program
// URL passthrough or bookmark mode when only one argument was provided by user
if (args.length === (firstUserArgIndex + 1)) {
    const userHasSuppliedURL = topLevelDomains.some(domain => firstUserArg.includes(domain));

    if (userHasSuppliedURL) {
        let userSuppliedURL = firstUserArg;

        if (!userSuppliedURL.startsWith('http://') && !userSuppliedURL.startsWith('https://')) {
            userSuppliedURL = `https://${userSuppliedURL}`;
        }

        openInDefaultBrowser(userSuppliedURL);
    } else {
        const bookmarks = getBookmarksFromFile();
        const bookmarkURLToLaunch = getBookmarkURLToLaunch(firstUserArg, bookmarks);

        if (bookmarkURLToLaunch) {
            openInDefaultBrowser(bookmarkURLToLaunch);
        }
    }
}

// Search mode when two or more arguments were provided by user
if (args.length > (firstUserArgIndex + 1)) {
    const searchEngineFound = getSearchEngine(firstUserArg, searchEngineTokens);

    if (searchEngineFound) {
        const searchQuery = prepareSearchQuery(firstUserArgIndex, args);

        openInDefaultBrowser(searchEngineURLs[searchEngineFound] + searchQuery);
    }
}

process.exit(0);
// #endregion

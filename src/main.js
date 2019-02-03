#!/usr/bin/env node
const fs = require('fs');
const cheerio = require('cheerio');
const launchDefaultBrowser = require('opn');

// #region Constants
const CONFIG_FILE_PATH = `${__dirname}/config.json`;
const BOOKMARKS_FILE_PATH = `${__dirname}/bookmarks.html`;
const ARGS = process.argv;
const FIRST_USER_ARG_INDEX = 2; // args = ['node', 'src/main.js', 'firstUserArg']
const FIRST_USER_ARG = ARGS[FIRST_USER_ARG_INDEX];
// #endregion

// #region Helper Functions
function getConfig() {
    let userConfig;

    if (fs.existsSync(CONFIG_FILE_PATH)) {
        const configFileString = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');

        userConfig = JSON.parse(configFileString);
    }

    return userConfig;
}

function getSearchEngineTokens(config) {
    const tokens = {};

    config.searchEngines.forEach((searchEngine) => {
        tokens[searchEngine.name] = searchEngine.tokens;
    });

    return tokens;
}

function getSearchEngineURLs(config) {
    const urls = {};

    config.searchEngines.forEach((searchEngine) => {
        urls[searchEngine.name] = searchEngine.path;
    });

    return urls;
}

function getSearchEngine(userToken, validSearchTokens) {
    let matchedToken;
    const engineTokenEntries = Object.entries(validSearchTokens);

    for (const searchEngine of engineTokenEntries) {
        // [0] key/search engine name, [1] value/array of valid tokens
        if (searchEngine[1].indexOf(userToken.toLowerCase()) !== -1) {
            matchedToken = searchEngine[0];
            break;
        }
    }

    return matchedToken;
}

function getBookmarksFromFile() {
    const bookmarks = {};

    if (fs.existsSync(BOOKMARKS_FILE_PATH)) {
        const bookmarksFileString = fs.readFileSync(BOOKMARKS_FILE_PATH, 'utf-8');
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

    // Assume shorter URL is desired if more than one match
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
const userConfig = getConfig();
const searchEngineTokens = getSearchEngineTokens(userConfig);
const searchEngineURLs = getSearchEngineURLs(userConfig);
const topLevelDomains = userConfig.topLevelDomains;

if (ARGS.length === (FIRST_USER_ARG_INDEX + 1)) {
    // URL passthrough or bookmark mode when only one argument was provided by user
    const userHasSuppliedURL = topLevelDomains.some(domain => FIRST_USER_ARG.includes(domain));

    if (userHasSuppliedURL) {
        let userSuppliedURL = FIRST_USER_ARG;

        if (!userSuppliedURL.startsWith('http://') && !userSuppliedURL.startsWith('https://')) {
            userSuppliedURL = `https://${userSuppliedURL}`;
        }

        launchDefaultBrowser(userSuppliedURL);
    } else {
        const bookmarks = getBookmarksFromFile();
        if (bookmarks) {
            const bookmarkURLToLaunch = getBookmarkURLToLaunch(FIRST_USER_ARG, bookmarks);

            if (bookmarkURLToLaunch) {
                launchDefaultBrowser(bookmarkURLToLaunch);
            }
        }
    }
} else if (ARGS.length > (FIRST_USER_ARG_INDEX + 1)) {
    // Search mode when two or more arguments were provided by user
    const searchEngineFound = getSearchEngine(FIRST_USER_ARG, searchEngineTokens);

    if (searchEngineFound) {
        const searchQuery = ARGS.slice((FIRST_USER_ARG_INDEX + 1), ARGS.length).join(' ');

        launchDefaultBrowser(searchEngineURLs[searchEngineFound] + searchQuery);
    }
}

process.exit(0);
// #endregion

#!/usr/bin/env node
const fs = require('fs');
const cheerio = require('cheerio');
const launchDefaultBrowser = require('opn');

// #region Constants
const args = process.argv;
const firstUserArgIndex = 2; // npm run start = ['node', 'src/main.js', 'firstUserArg']
const firstUserArg = args[firstUserArgIndex];
// #endregion

// #region Helper Functions
function getConfig() {
    let userConfig;
    const configFilePath = `${__dirname}/config.json`;

    if (fs.existsSync(configFilePath)) {
        const configFileString = fs.readFileSync(configFilePath, 'utf-8');

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

function prepareSearchQuery(tokenIndex, processArgs) {
    return processArgs.slice((tokenIndex + 1), processArgs.length).join(' ');
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
const userConfig = getConfig();
const searchEngineTokens = getSearchEngineTokens(userConfig);
const searchEngineURLs = getSearchEngineURLs(userConfig);
const topLevelDomains = userConfig.topLevelDomains;

// URL passthrough or bookmark mode when only one argument was provided by user
if (args.length === (firstUserArgIndex + 1)) {
    const userHasSuppliedURL = topLevelDomains.some(domain => firstUserArg.includes(domain));

    if (userHasSuppliedURL) {
        let userSuppliedURL = firstUserArg;

        if (!userSuppliedURL.startsWith('http://') && !userSuppliedURL.startsWith('https://')) {
            userSuppliedURL = `https://${userSuppliedURL}`;
        }

        launchDefaultBrowser(userSuppliedURL);
    } else {
        const bookmarks = getBookmarksFromFile();
        if (bookmarks) {
            const bookmarkURLToLaunch = getBookmarkURLToLaunch(firstUserArg, bookmarks);

            if (bookmarkURLToLaunch) {
                launchDefaultBrowser(bookmarkURLToLaunch);
            }
        }
    }
}

// Search mode when two or more arguments were provided by user
if (args.length > (firstUserArgIndex + 1)) {
    const searchEngineFound = getSearchEngine(firstUserArg, searchEngineTokens);

    if (searchEngineFound) {
        const searchQuery = prepareSearchQuery(firstUserArgIndex, args);

        launchDefaultBrowser(searchEngineURLs[searchEngineFound] + searchQuery);
    }
}

process.exit(0);
// #endregion

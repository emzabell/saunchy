# saunchy
A very simple Node CLI utility to replace Launchy search functionality due to software restrictions at work. I love Launchy and you should probably use that instead (if you're allowed).

### Getting Started
Clone repo, configure src/config.json as desired, import bookmarks (optional), and run 'npm link' if you'd like to access the CLI globablly via 'saunchy'.

Within config.json:
* *topLevelDomains* are the domains that you'd like to support for passthrough URL launching. If any of these strings are found within your search string, it will simply launch the URL you provided.
* *searchEngines* define the search engines you'd like to support for searching.
  * The name field can be anything you like. It does not change how you'll call the utility.
  * The tokens field is used to define the arguments you'd like to support when selecting that engine. E.g., "npm run start **google** mySearchQueryHere" and "npm run start **goo** mySearchQueryHere" are equivalent due to the default token config.
  
If you'd like to import your bookmarks, place a Netscape-format Bookmark HTML File (as is exported by Chrome) in the src directory named bookmarks.html. Anytime you call the utility with a single argument that doesn't contain a topLevelDomain (suggesting URL passthrough), it will try to find and launch the bookmark you requested.

### Commands
* Use 'npm run start' if you don't want to run 'npm link' to create a symlink to the bin


**saunchy < URL | Bookmark Name >** -- Runs utility in URL Passthrough or Bookmark Mode, respectively.

**saunchy < Search Engine Token > < Keywords For Search >** -- Runs utility in Search Mode.

### Potential Future Enhancements
* Package as exe
* Build lightweight GUI
* ???

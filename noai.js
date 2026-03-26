// makes the JS interpreter in the browser do some more checks, to make sure I didn't make obvious
// mistakes.
"use strict"

// The function that gets called when a request is made to google's search page.
function hook(details) {
    // This is the query parameter (e.g. ?q=search+term) that google uses for searching
    const QUERY_PARAM = "q";

    // This is the -noai flag that will be added to the end of the search.
    const NOAI_FLAG = "-noai"

    // This is converting the URL in `details` into a full URL object, so we can look into it without
    // messing around with strings a ton.
    let url = new URL(details.url);

    // This is doing the same with the search parameters, which is everything after `www.google.com/search`.
    // the url.search.substring(1) removes the question mark, which is required here.
    let params = new URLSearchParams(url.search.substring(1))

    // do the URL parameters contain the "q" (are we doing a search for something)?
    const containsQuery = params.has(QUERY_PARAM);

    // if we're doing a search, does the search contain the "-noai" flag? (indexOf will return -1 if
    // it can't find a match)
    const containsNoAi = params.get(QUERY_PARAM)?.indexOf(NOAI_FLAG) !== -1;

    // if we're doing a search, and the search doesn't already have the "-noai" flag, then execute
    // whatever's in this if block
    if (containsQuery && !containsNoAi) {

        // instead of the original search, set the search parameters to be the original search + the
        // -noai flag. The trimEnd() just removes extra spaces at the end of the original search.
        let search = params.get(QUERY_PARAM);
        params.set(QUERY_PARAM, search.trimEnd() + NOAI_FLAG)


        // construct the new URL with the flag included
        let newUrl = new URL(`${url.origin}${url.pathname}?${params.toString()}`).toString();
        
        // return an object indicating that we want to redirect to the new URL created above
        return {
            redirectUrl: newUrl
        }
    } else {
        // we're not doing a search, or the search already contained -noai, so we return an empty
        // object, which tells the browser to continue with the request unchanged.
        return {}
    }

}

// This is the main function, where everything starts
function main() {
    // These are the URLs that the extension will listen for requests on
    const FILTER = {
        urls: ["*://*.google.com/search?*", "*://google.com/search?*"]
    };

    // When the browser sends a request to google's search page, we call the function above (hook)
    // and wait for it to finish (that's what the "blocking" means below)
    browser.webRequest.onBeforeRequest.addListener(
        hook,
        FILTER,
        ["blocking"]
    );

    // log the extension startup somewhere
    console.log("google-noai extension loaded")
}

// call the main function to start the extension
main();
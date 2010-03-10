# Suggest Results

Easily customizable search suggestion plugin for jQuery, which suggests results directly, rather than search terms.

It supports feeding results from a local Javascript array, or fetching results via Ajax.

Check out the [Demo][].

## Setup

First of all you will need [jQuery][], visit their [site][jquery] for more info.

Then include both `jquery.suggest_results.js` and `jquery.suggest_results.css` on your page.

    <script src="/suggest_results/jquery.suggest_results.js" type="text/javascript"></script>
    <link href="/suggest_results/jquery.suggest_results.css" rel="stylesheet" type="text/css" />

## Usage

### Local Javascript Array

To use Suggest Results, simply call it on a targeted text input element. For example if you have a search box for a users friends:

    $("#search_friends").suggest_results({
    	data: userFriends
    });

In the above example, `userFriends` is a javascript array that would look something like this:

    var userFriends = [
        {title: "John Doe", href: "/user/johndoe", match: "johndoe j.doe@gmail.com"},
        {title: "Mike Smith", href: "/user/msmith", match: "msmith mikesmith@gmail.com"}
    ];

This array needs to have two vital attributes, `title` and `href`. When filtering results based on what's been typed in the input field, the `title` and `match` attributes are used. `match` is optional, but `title` is required. `href` is the url to redirect the browser to when the result is selected.

The `match` attribute is useful when you need to include extra information like a username or email and get results based on this data without having to display it.

### Ajax Call

To fetch results via an Ajax call, attach Suggest Results like this to your input element:

    $("#search_friends").suggest_results({
    	url: "/search_friends_json.php"
    });

As a user starts typing, this will trigger a GET request to `/search_friends/json?limit=6&search=j` if the user has started typing `j`. We'll get to the `limit` option a bit later.

Output from `search_friends_json.php` must be in JSON, and look something like this:

    {"results": [
        {"title": "John Doe", "href": "/user/johndoe"},
        {"title": "Mike Smith", "href": "/user/msmith"}
    ]}

Notice how the `match` attribute is not included, as it's not supported for server-side result fetching. No filtering is done client-side of the results returned, hence `match` is useless. You should do all filtering and ordering server-side if going ajax-style.

Also, a query cache is used so a specific search term is only requested once per page load. Otherwise new ajax calls would be triggered each time a user hits the backspace key to remove a letter for example.

## Options

There's a number of options you can pass `$.suggest_results()`.

* **data:** Javascript array with available results.
* **url:** URL to send ajax request to for results. Either `url` or `data` are required for Suggest Results to work at all.
* **name:** When used, the value is used as the class for the suggest box. Useful for having a custom styled suggest box one of two or more input fields with suggestion turned on.
* **exact_match:** Results much be an exact match to typed input. If disabled any one word typed is a value match. Enabled by default, and has no effect when fetching results via Ajax.
* **limit:** Limit the number of suggestions shown. When using the Ajax method, an extra `limit` GET/POST var is supplied.
* **no_results:** When set to true, a "No Results" label is shown if entered text doesn't yield any results. Enabled by default.
* **no\_results\_label:** Text shown when there are no results if `no_results` is enabled. Default is "No Results".
* **url_method:** URL method used for Ajax call. Set to "get" or "post". Default is "get".

## Customization

One of the things I felt most important developing this was it would be really easy to customize the suggestion results, to add an extra field, or a thumbnail icon or whatever you wanted. Cause of this, all html used to generate the suggest box, is stored as an option, and data is inserted mustache style.

For example, if we want to display some extra info underneath our friend's names, we'd start with adding it to the result JSON data if we're fetching things via Ajax:

    {"results": [
        {"title": "John Doe", "href": "/user/johndoe", "info": "Helltown"},
        {"title": "Mike Smith", "href": "/user/msmith", "info": "New York"}
    ]}

When we attach the suggestions to our input element, we specify the `tpl_result_body` option:

    $("#search_friends").suggest_results({
    	url: "/search_friends_json.php",
    	name: "search_friends",
    	tpl_result_body: '<span class="title">{{title}}</span><span class="info">{{info}}</span>'
    });

In the `tpl_result_body` option, `{{title}}` is replaced with the `title` attribute from the result object, and `{{info}}` is replaced with the `info` attribute.

Then to prettify it, we add some CSS:

    /* Effects all suggestion boxes */
    #suggest_results li span.info {
    	color: #888;
    }
    /* Effects only the #search_friends suggestion box */
    #suggest_results.search_friends li {
		border-bottom-style: dashed;
	}

There are some more options available too for customization, so I recommend you dig through the code a bit ;)

## To-Do

* Better documentation and readme.
* Handle mouse hovering and keyboard navigation a bit better when used at the same time on a suggest box.
* Support suggesting search terms in addition to currently only supporting results.

## Notice

I wrote this plugin in about 6-7 hours, so things could be a bit stupid. But at least it works. If you wanna improve it, please feel free to fork and send me a pull request.

## License

(The MIT License)

Copyright (c) 2009 Jim Myhrberg.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[jquery]: http://jquery.com/
[demo]: http://files.jimeh.me/projects/suggest_results/demo/


// Our testing API

// Esprima example:
// var syntax = esprima.parse('var answer = 42');
// 
// Returns an object. A tree.



// Three testing methods
// 1. Whitelist
//
// Provide things to whitelist for.
//
// AKA: "This program MUST use...""
//
// - If statement
// - For loop
// - While loop
// - Variable declaration

// 2. Blacklist
//
// Provide things to blacklist for. (same things as in whitelist above)

// 3. Structure?

var kv = (function () {

    // A version of traverse that can (hypothetically) accept multiple functions
    // to be run on each node.
    function multiTraverse(object) {
        var key,
            child,
            argsCopy = [].slice.call(arguments);

        argsCopy.shift();

        for (var i = 1; i < argsCopy.length; i++) {
            if (argsCopy[i].call(null, object) === false) {
                return;
            }
        }

        for (key in object) {
            if (object.hasOwnProperty(key)) {
                child = object[key];
                if (typeof child === 'object' && child !== null) {
                    multiTraverse.apply(this, argsCopy);
                }
            }
        }
    }

    // Step recursively through the syntax tree object, applying our function.
    // Borrowed from this esprima.js example:
    // http://ariya.ofilabs.com/2012/06/detecting-boolean-traps-with-esprima.html
    function traverse(object, visitor) {
        var key, child;

        visitor.call(null, object);
        for (key in object) {
            if (object.hasOwnProperty(key)) {
                child = object[key];
                if (typeof child === 'object' && child !== null) {
                    traverse(child, visitor);
                }
            }
        }
    }

    // Private vars for translating to official "type" names in esprima.
    var listmap = {
        "condition": "ConditionalExpression", // ternary
        "if": "IfStatement",
        "for": "ForStatement",
        "var": "VariableDeclaration",
        "while": "WhileStatement"
    };

    var translatedList = [];

    var whitelistCount = {};

    function translateListItems(listitems) {
        for (var i = 0; i < listitems.length; i++) {
            translatedList.push(listmap[listitems[i]]);
        }
        console.log(translatedList);
    }

    function parse(codestring, options) {
        return esprima.parse(codestring, options);
    }

    function blacklist(codestring, listitems) {
        var tree = esprimaParse(codestring);
        translateListItems(listitems);
        result = traverse(tree, blacklistTest);
    }

    function blacklistTest(node) {
        for (var i = 0; i < translatedList.length; i++) {
            if (node.type === translatedList[i]) {
                alert("Oops, you shouldn't need to use a " + translatedList[i]);
            }
        }
    }

    function whitelist(codestring, listitems) {
        var tree = esprimaParse(codestring);
        translateListItems(listitems);
        result = traverse(tree, blacklistTest);
        // Throw an alert if the whitelistTest object is empty for any of the list
        // items provided.
    }

    function whitelistTest(node) {
        var counter = {};

        for (var i = 0; i < translatedList.length; i++) {
            if (node.type === translatedList[i]) {
                // Increment a private object keeping track of counts. Once all
                // the nested tests completes, we need to check this private object
                // and throw an error if there were no counts collected.
            }
        }

    }

    // Reveal public pointers to
    // private functions and properties
    return {
        read: parse,
        blacklist: blacklist
    };

})();







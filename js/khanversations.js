// Our testing API
var kv = (function () {

    // A version of traverse that can (hypothetically) accept multiple functions
    // to be run on each node (basically, a premature optimization).
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

    /**
     * A list of all testable functionality, with human readable versions.
     */
    var listmap = {
        "ConditionalExpression": "Conditional Expression", // ternary
        "IfStatement": "If Statement",
        "ForStatement": "For Statement",
        "VariableDeclaration": "Variable Declaration",
        "WhileStatement": "While Statement"
    };

    var testArray = ['ConditionalExpression', 'IfStatement', 'ForStatement'];

    function Tree() {
        // Properties.
        this.jsTree  = {},
        this.messages = [],
        this.blacklist = function(listitems) {
            traverse(this.jsTree, function(node) {
                for (var i = 0; i < listitems.length; i++) {
                    if (node.type === listitems[i]) {
                        this.messages.push("Oops, you don't need to use a " + listmap[listitems[i]]);
                    }
                }
            });
            return this;
        },
        this.whitelist = function(listitems) {
            var nodeCounts = {};
            for (var i = 0; i < listitems.length; i++) {
                nodeCounts[listitems[i]] = 0;
            }
            result = traverse(this.jsTree, function(node) {
                for (var i = 0; i < listitems.length; i++) {
                    if (node.type === listitems[i]) {
                        nodeCounts[listitems[i]]++;
                    }
                }
            });
            for (var i = 0; i < listitems.length; i++) {
                if (nodeCounts[listitems[i]] === 0) {
                    this.messages.push("Oops, you need to use a " + listmap[listitems[i]]);
                }
            }
            return this;
        };
    }

    function parse(codestring, options) {
        treeData = new Tree();
        treeData.jsTree = esprima.parse(codestring, options);
        return treeData;
    }

    // Reveal public pointers to
    // private functions and properties
    return {
        read: parse,
        tree: Tree
        // blacklist: blacklist
    };

})();







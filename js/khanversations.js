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
     * A list of supported testable functionality, with human readable text.
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
        this.jsTree  = {},
        this.messages = [],
        this.blacklist = function(listitems) {
            var self = this;
            traverse(this.jsTree, function(node) {
                for (var i = 0; i < listitems.length; i++) {
                    if (node.type === listitems[i]) {
                        self.messages.push("Oops, you don't need to use a " + listmap[listitems[i]]);
                    }
                }
            });
            return this;
        },
        this.whitelist = function(listitems) {
            var nodeCounts = {},
                self = this;
            for (var i = 0; i < listitems.length; i++) {
                nodeCounts[listitems[i]] = 0;
            }
            traverse(this.jsTree, function(node) {
                for (i = 0; i < listitems.length; i++) {
                    if (node.type === listitems[i]) {
                        nodeCounts[listitems[i]]++;
                    }
                }
            });
            for (i = 0; i < listitems.length; i++) {
                if (nodeCounts[listitems[i]] === 0) {
                    self.messages.push("Oops, you need to use a " + listmap[listitems[i]]);
                }
            }
            return this;
        },
        this.compareStructure = function(item1, item2) {
            // This currently only supports parsed javascript where there are
            // one or zero instances of each item you are comparing.
            //
            // Bitmask Scoring Rubric
            //
            // 000001  1   Either item 1 or item 2 is missing.
            // 000010  2   Item 2 precedes Item 1.
            // 000100  4   Item 1 precedes Item 2.
            // 001000  8   Item 2 contains Item 1.
            // 010000  16  Item 1 contains Item 2.

            var score = 0,
                subtree1 = null,
                subtree2 = null,
                foundFirst = '';

            traverse(this.jsTree, function(node) {
                if (node.type === item1) {
                    if (!foundFirst) {
                        foundFirst = node.type;
                        score += 4;
                    }
                    subtree1 = node;
                } else if (node.type === item2) {
                    if (!foundFirst) {
                        foundFirst = node.type;
                        score += 2;
                    }
                    subtree2 = node;
                }
            });

            if (!subtree1 || !subtree2) {
                return 1;
            }

            traverse(subtree1, function(node) {
                if (node.type === item2) {
                    score += 16;
                }
            });

            traverse(subtree2, function(node) {
                if (node.type === item1) {
                    score += 8;
                }
            });

            return score;
        },

        // Provide Synonyms
        this.mustContain = this.whitelist,
        this.mustNotContain = this.blacklist,

        this.alertMessages = function() {
            var allMessages = this.messages;
            for (var i = 0; i < allMessages.length; i++) {
                alert(allMessages[i]);
            }
        }
    }

    function parse(codestring, options) {
        treeData = new Tree();
        treeData.jsTree = esprima.parse(codestring, options);
        return treeData;
    }

    return {
        read: parse,
        tree: Tree
    };

})();







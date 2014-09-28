var kv = (function () {
    /**
     * Config data.
     *
     * @todo: Integrate Esprima's more descriptive error messages.
     */
    config = {
        errorMsg: "There is an error in your code.",
        youNeedMsg: "Oops, you need to use a ",
        youDontNeedMsg: "Oops, you don't need to use a "
    };

    /**
     * A list of common testable functionality, with human readable text (see
     * Esprima API for all possible options).
     *
     * @todo: Pull the list directly from Esprima, which ensures it's always
     *        current.
     */
    var listmap = {
        "ConditionalExpression": "Conditional Expression",
        "IfStatement": "If Statement",
        "ForStatement": "For Statement",
        "VariableDeclaration": "Variable Declaration",
        "WhileStatement": "While Statement",
        "ContinueStatement": "Continue Statement",
        "SwitchStatement": "Switch Statement",
        "SwitchCase": "Switch Case",
        "BreakStatement": "Break Statement",
        "DoWhileStatement": "Do-While Statement",
        "UpdateExpression": "Update Expression", // Increment or decrement
        "TryStatement": "Try Statment",
        "CatchClause": "Catch Clause",
        "ThrowStatement": "Throw Statement",
        "NewExpression": "New Expression", // For instantiating objects
        "FunctionDeclaration": "Function Declaration",
        "ReturnStatement": "Return Statement"
    };

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

    function Tree() {
        this.jsTree  = {},
        this.messages = [],
        this.scores = [],
        this.error = false,
        this.blacklist = function(listitems) {
            var self = this;

            if (this.error !== true) {
                traverse(this.jsTree, function(node) {
                    for (var i = 0; i < listitems.length; i++) {
                        if (node.type === listitems[i]) {
                            self.messages.push(config.youDontNeedMsg + listmap[listitems[i]]);
                        }
                    }
                });
            }
            return this;
        },
        this.whitelist = function(listitems) {
            var nodeCounts = {},
                self = this;

            for (var i = 0; i < listitems.length; i++) {
                nodeCounts[listitems[i]] = 0;
            }
            if (this.error !== true) {
                traverse(this.jsTree, function(node) {
                    for (i = 0; i < listitems.length; i++) {
                        if (node.type === listitems[i]) {
                            nodeCounts[listitems[i]]++;
                        }
                    }
                });
                for (i = 0; i < listitems.length; i++) {
                    if (nodeCounts[listitems[i]] === 0) {
                        self.messages.push(config.youNeedMsg + listmap[listitems[i]]);
                    }
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
            // 000010  2   Item 1 does not contain Item 2.
            // 000100  4   Item 2 does not contain Item 1.
            // 000010  8   Item 1 contains Item 2.
            // 000100  16  Item 2 contains Item 1.

            var scores = [],
                subtrees = [],
                item1Found,
                item2Found,
                currentItem;

            if (this.error !== true) {
                traverse(this.jsTree, function(node) {
                    if (node.type === item1) {
                        subtrees.push(node);
                        if (!item1Found) {
                            item1Found = true;
                        }
                    } else if (node.type === item2) {
                        subtrees.push(node);
                        if (!item2Found) {
                            item2Found = true;
                        }
                    }
                });

                if (!item1Found || !item2Found) {
                    this.scores = scores;
                    return [1];
                }

                for (var i = 0; i < subtrees.length; i++) {
                    currentItem = subtrees[i].type;
                    if (currentItem === item1) {
                        traverse(subtrees[i], function(node) {
                            if (node.type === item2) {
                                scores[i] = 8;
                            }
                        });
                        if (scores[i] !== 8) {
                            scores[i] = 2;
                        }
                    } else if (currentItem === item2) {
                        traverse(subtrees[i], function(node) {
                            if (node.type === item1) {
                                scores[i] = 16;
                            }
                        });
                        if (scores[i] !== 16) {
                            scores[i] = 4;
                        }
                    }
                }

                this.scores = scores;
            }
            return this;
        },
        this.areAnyXContainingY = function(x, y) {

            this.compareStructure(x, y);
            var allScores = this.scores;
            for (var i = 0; i < allScores.length; i++) {
                if (allScores[i] === 8) {
                    return true;
                }
            }
            return false;
        },
        this.anXMustContainY = function(x, y){
            this.compareStructure(x, y);
            var allScores = this.scores;
            for (var i = 0; i < allScores.length; i++) {
                if (allScores[i] === 8) {
                    return this;
                }
            }
            this.messages.push(config.youNeedMsg + listmap[y] + " inside of a " + listmap[x] + ".");
            return this;
        },
        this.noXShouldContainY = function(x, y){
            this.compareStructure(x, y);
            var allScores = this.scores;
            for (var i = 0; i < allScores.length; i++) {
                if (allScores[i] === 8) {
                    this.messages.push(config.youDontNeedMsg + listmap[y] + " inside of a " + listmap[x] + ".");
                    return this;
                }
            }
            return this;
        },
        this.alertMessages = function() {
            var allMessages = this.messages;
            for (var i = 0; i < allMessages.length; i++) {
                alert(allMessages[i]);
            }
        },

        // Provide Synonyms
        this.mustContain = this.whitelist,
        this.mustNotContain = this.blacklist
    }

    function parse(codestring, options) {
        treeData = new Tree();
        try {
            treeData.jsTree = esprima.parse(codestring, options);
        } catch (e) {
            treeData.error = true;
            treeData.messages = [config.errorMsg];
        }
        return treeData;
    }

    return {
        check: parse,
        tree: Tree
    };

})();

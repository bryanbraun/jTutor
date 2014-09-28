// Application code (the consumer of our API).
(function app() {

function printMessages(messages) {
    $('.messages').empty();
    for (var i = 0; i < messages.length; i++) {
        $('.messages').append('<div class="message">' + messages[i] + '</div>');
    }
}

function inspectCode() {
    // An example of using the khanversation API.
    var code = $('.codebox').val();
    var tree = kv.check(code).mustContain(['VariableDeclaration', 'ForStatement'])
                             .mustNotContain(['IfStatement'])
                             .anXMustContainY('ForStatement', 'VariableDeclaration')
                             .noXShouldContainY('IfStatement', 'ConditionalExpression');
    printMessages(tree.messages);
}

$('.example1').click(function(e) {
    e.preventDefault();
    var exampleText1 = $('.hidden-example1').text();
    $('.codebox').val('');
    $('.codebox').val(exampleText1);
    inspectCode();
});

var timeoutId = 0;
$('.codebox').keyup(function () {
    clearTimeout(timeoutId); // doesn't matter if it's 0
    timeoutId = setTimeout(inspectCode, 500);
});


}());
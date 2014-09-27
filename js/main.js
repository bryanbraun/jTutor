// Application code (the consumer of our API).
(function app() {

$('.example1').click(function(e) {
    console.log('working');
    e.preventDefault();
    var exampleText1 = $('.hidden-example1').text();
    $('.codebox').append(exampleText1);
});
$('.example2').click(function() {
    e.preventDefault();
    var exampleText2 = $('.hidden-example2').text();
    $('.codebox').append(exampleText1);
});

}());
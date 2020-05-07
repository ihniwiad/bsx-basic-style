/*
<body>
    <a class="sr-only sr-only-focusable" href="#main">Skip to main content</a>
    <div class="wrapper" id="top">
        ...
        <div class="to-top-wrapper" data-fn="to-top-wrapper">
            <a class="btn btn-secondary btn-only-icon" href="#top"><i class="fa fa-arrow-up" aria-hidden="true"></i><span class="sr-only">Scroll to top</span></a>
        </div>
    </div>
</body>
*/

( function( $, Utils ) {

    $.fn.toggleToTopButton = function( options ) {

        var $elem = $( this );

        var defaults = {
            threshold: 100,
            visibleClass: Utils.classes.open
        };

        options = $.extend( {}, defaults, options );
    
        function _positionToTopButton() {
            if ( Utils.$document.scrollTop() > 100 ) {
                if ( ! $elem.is( '.' + options.visibleClass ) ) {
                    $elem.addClass( options.visibleClass );
                }
            }
            else {
                if ( $elem.is( '.' + options.visibleClass ) ) {
                    $elem.removeClass( options.visibleClass );
                }
            }
        }

        // position
        _positionToTopButton()
        
        Utils.$window.on( 'scroll resize', function() {
            _positionToTopButton();
        });
    
    }

    // init
    Utils.$window.on( Utils.events.initJs, function() {

        Utils.$functionElems.filter( '[data-fn="to-top-wrapper"]' ).toggleToTopButton();

    } );

} )( jQuery, BSX_UTILS );
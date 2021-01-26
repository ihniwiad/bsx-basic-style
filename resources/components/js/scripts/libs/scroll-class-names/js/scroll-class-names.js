

( function( $, Utils ) {

    var Scrolling = {
        target: Utils.$body,
        position: 0,
        direction: ''
    };

    Scrolling.getPosition = function() {
        return Utils.$document.scrollTop();
    };

    Scrolling.getDirection = function() {
        var recentPosition = Scrolling.position;
        var currentPosition = Scrolling.getPosition();
        if ( recentPosition < currentPosition ) {
            return 'down';
        }
        else if ( recentPosition > currentPosition ) {
            return 'up';
        }
        else {
            return '';
        }
    };

    Scrolling.init = function() {

        var defaults = {
            scrollDownClassName: 'scroll-down',
            scrollUpClassName: 'scroll-up',
            scrollTopClassName: 'scroll-top',
            scrollBottomClassName: 'scroll-bottom',
            scrollNearTopClassName: 'scroll-near-top',
            scrollAwayTopClassName: 'scroll-away-top',
            nearTopThreshold: 100
        };

        var $elem = $( Scrolling.target );

        var options = $elem.getOptionsFromAttr();

        options = $.extend( {}, defaults, options );

        // initial scroll position
        Scrolling.position = Scrolling.getPosition();
        
        Utils.$window.on( 'scroll', function() {

            var currentPosition = Scrolling.getPosition();
            var currentDirection = Scrolling.getDirection();

            // console.log( 'position: ' + currentPosition );
            // console.log( 'scroll direction: ' + currentDirection );

            // check & set up / down class names
            if ( currentDirection && Scrolling.direction != currentDirection ) {
                if ( currentDirection == 'down' ) {
                    // scrolling down
                    if ( ! $elem.is( '.' + options.scrollDownClassName ) ) {
                        $elem.addClass( options.scrollDownClassName );
                    }
                    if ( $elem.is( '.' + options.scrollUpClassName ) ) {
                        $elem.removeClass( options.scrollUpClassName );
                    }
                }
                else {
                    // scrolling up
                    if ( ! $elem.is( '.' + options.scrollUpClassName ) ) {
                        $elem.addClass( options.scrollUpClassName );
                    }
                    if ( $elem.is( '.' + options.scrollDownClassName ) ) {
                        $elem.removeClass( options.scrollDownClassName );
                    }
                }
            }

            // check & set top class names
            if ( currentPosition == 0 ) {
                if ( ! $elem.is( '.' + options.scrollTopClassName ) ) {
                    $elem.addClass( options.scrollTopClassName );
                }
            }
            else {
                if ( $elem.is( '.' + options.scrollTopClassName ) ) {
                    $elem.removeClass( options.scrollTopClassName );
                }
            }

            // check & set bottom class name
            if ( currentPosition + Utils.$window.height() >= Scrolling.target.height() ) {
                if ( ! $elem.is( '.' + options.scrollBottomClassName ) ) {
                    $elem.addClass( options.scrollBottomClassName );
                }
            }
            else {
                if ( $elem.is( '.' + options.scrollBottomClassName ) ) {
                    $elem.removeClass( options.scrollBottomClassName );
                }
            }

            // check & set near away / class names
            if ( currentPosition < options.nearTopThreshold ) {
                if ( ! $elem.is( '.' + options.scrollNearTopClassName ) ) {
                    $elem.addClass( options.scrollNearTopClassName );
                }
                if ( $elem.is( '.' + options.scrollAwayTopClassName ) ) {
                    $elem.removeClass( options.scrollAwayTopClassName );
                }
            }
            else {
                if ( ! $elem.is( '.' + options.scrollAwayTopClassName ) ) {
                    $elem.addClass( options.scrollAwayTopClassName );
                }
                if ( $elem.is( '.' + options.scrollNearTopClassName ) ) {
                    $elem.removeClass( options.scrollNearTopClassName );
                }
            }

            // remember
            Scrolling.position = currentPosition;
            Scrolling.direction = currentDirection;
        } );
    }

    // init
    Utils.$window.on( Utils.events.initJs, function() {
        Scrolling.init();
    } );

} )( jQuery, BSX_UTILS );
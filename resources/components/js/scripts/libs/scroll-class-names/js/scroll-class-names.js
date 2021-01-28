

( function( $, Utils ) {

    var Scrolling = {
        target: Utils.$body,
        position: 0,
        direction: '',
        place: ''
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

        // TEST
        // $( window ).on('scrollUp', function() { console.log( 'scrollUp' ) })
        // $( window ).on('scrollDown', function() { console.log( 'scrollDown' ) })
        // $( window ).on('scrollTop', function() { console.log( 'scrollTop' ) })
        // $( window ).on('scrollNearTop', function() { console.log( 'scrollNearTop' ) })
        // $( window ).on('scrollAwayTop', function() { console.log( 'scrollAwayTop' ) })
        // $( window ).on('scrollBottom', function() { console.log( 'scrollBottom' ) })

        var defaults = {
            scrollDownClassName: 'scroll-down',
            scrollUpClassName: 'scroll-up',
            scrollTopClassName: 'scroll-top',
            scrollBottomClassName: 'scroll-bottom',
            scrollNearTopClassName: 'scroll-near-top',
            scrollAwayTopClassName: 'scroll-away-top',
            nearTopThreshold: 100,
            triggerEvents: true,
            scrollDownEventName: 'scrollDown',
            scrollUpEventName: 'scrollUp',
            scrollTopEventName: 'scrollTop',
            scrollBottomEventName: 'scrollBottom',
            scrollNearTopEventName: 'scrollNearTop',
            scrollAwayTopEventName: 'scrollAwayTop'

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

                    if ( options.triggerEvents ) {
                        Utils.$window.trigger( options.scrollDownEventName );
                    }
                    
                    if ( ! $elem.is( '.' + options.scrollDownClassName ) ) {
                        $elem.addClass( options.scrollDownClassName );
                    }
                    if ( $elem.is( '.' + options.scrollUpClassName ) ) {
                        $elem.removeClass( options.scrollUpClassName );
                    }
                }
                else {
                    // scrolling up
                    
                    if ( options.triggerEvents ) {
                        Utils.$window.trigger( options.scrollUpEventName );
                    }
                    
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
                if ( options.triggerEvents && Scrolling.place != 'top' ) {
                    Utils.$window.trigger( options.scrollTopEventName );
                    Scrolling.place = 'top';
                }
                    
                if ( ! $elem.is( '.' + options.scrollTopClassName ) ) {
                    $elem.addClass( options.scrollTopClassName );
                }
            }
            else {
                if ( $elem.is( '.' + options.scrollTopClassName ) ) {
                    $elem.removeClass( options.scrollTopClassName );
                }
            }

            // check & set near away / class names
            if ( currentPosition < options.nearTopThreshold ) {
                if ( options.triggerEvents && Scrolling.position != 0 && Scrolling.place != 'near-top' ) {
                    // do not trigger near-top event if top
                    Utils.$window.trigger( options.scrollNearTopEventName );
                    Scrolling.place = 'near-top';
                }

                if ( ! $elem.is( '.' + options.scrollNearTopClassName ) ) {
                    $elem.addClass( options.scrollNearTopClassName );
                }
                if ( $elem.is( '.' + options.scrollAwayTopClassName ) ) {
                    $elem.removeClass( options.scrollAwayTopClassName );
                }
            }
            else {
                if ( options.triggerEvents && Scrolling.place != 'away-top' ) {
                    Utils.$window.trigger( options.scrollAwayTopEventName );
                    Scrolling.place = 'away-top';
                }

                if ( ! $elem.is( '.' + options.scrollAwayTopClassName ) ) {
                    $elem.addClass( options.scrollAwayTopClassName );
                }
                if ( $elem.is( '.' + options.scrollNearTopClassName ) ) {
                    $elem.removeClass( options.scrollNearTopClassName );
                }
            }

            // check & set bottom class name
            // place AFTER checking away-top to mak bottom event last while scrolling down (after away-top)
            // round body height since might be larger than sum of both rounded scroll position and window height
            if ( currentPosition + Utils.$window.height() >= Math.round( Scrolling.target.height() ) ) {
                if ( options.triggerEvents && Scrolling.place != 'bottom' ) {
                    Utils.$window.trigger( options.scrollBottomEventName );
                    Scrolling.place = 'bottom';
                }
                    
                if ( ! $elem.is( '.' + options.scrollBottomClassName ) ) {
                    $elem.addClass( options.scrollBottomClassName );
                }
            }
            else {
                if ( $elem.is( '.' + options.scrollBottomClassName ) ) {
                    $elem.removeClass( options.scrollBottomClassName );
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
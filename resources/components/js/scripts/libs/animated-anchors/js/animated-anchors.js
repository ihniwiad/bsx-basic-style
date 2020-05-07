( function( $, Utils ) {

    // animated anchors (e.g. knowledge hash navigation)
    $.fn.animatedAnchors = function( options ) {

        var $elems = $( this );

        var defaults = {
            scrollToInitialHash: true,
            scrollDurationMin: 300,
            scrollDurationMax: 800,
            scrollDurationPer1000: 400,
            offset: function() {
                return Utils.anchorOffsetTop;
            },
            scrollTolerance: 1, // scroll little bit more than to anchor position to make sure to trigger scrollspy navigation
            excludedSelectors: [ '[role="tabpanel"]' ]
        };

        options = $.extend( {}, defaults, options );

        // function
        
        $.fn._animatedScrollTo = function( itemOptions ) {

            // merge item options
            options = $.extend( {}, options, itemOptions );

            $this = $( this );

            var scrollTop = Utils.$window.scrollTop();
            var thisOffsetTop = $this.offset().top + options.scrollTolerance;

            var scrollDuration = Math.abs( thisOffsetTop - options.offset() - scrollTop ) * options.scrollDurationPer1000 / 1000;

            // limit scroll duration (min, max)
            if  ( scrollDuration < options.scrollDurationMin ) {
                scrollDuration = options.scrollDurationMin;
            }
            else if ( scrollDuration > options.scrollDurationMax ) {
                scrollDuration = options.scrollDurationMax;
            }

            Utils.$scrollRoot.animate( { scrollTop: ( thisOffsetTop - options.offset() ) }, scrollDuration );

        }

        // scroll to initial url anchor
        if ( options.scrollToInitialHash ) {
            var $currentAnchor = $( window.location.hash );
            if ( window.location.hash && $currentAnchor.length > 0 ) {

                // TODO: use browser native jumping to hash instead of smooth (but late) scrolling?

                // scroll only if hash element is not excluded
                var scrollToElem = true;
                for ( var i = 0; i < options.excludedSelectors.length; i++ ) {
                    if ( $currentAnchor.is( options.excludedSelectors[ i ] ) ) {
                        scrollToElem = false;
                    }
                }

                if ( scrollToElem ) {

                    // scroll to anchor
                    $currentAnchor._animatedScrollTo();

                    /*
                    setTimeout( function() {

                    } );
                    */

                    // scroll to anchor again after fonts loaded
                    Utils.$window.on( 'load', function() {
                        $currentAnchor._animatedScrollTo();
                    } );

                }
            }
        }

        $elems.each( function() {

            var $elem = $( this );

            // add options from attr
            var itemOptions = $elem.getOptionsFromAttr();

            $elem.on( 'click', function( event ) {

                // check if prevent default (e.g. jumping to elem within hash tabs which do not allow hash change)
                if ( !! itemOptions && itemOptions.preventDefault === true ) {
                    event.preventDefault();
                }

                var targetSelector = $elem.attr( 'href' );
                var $target = $( targetSelector );

                if ( $target.length > 0 ) {
                    $target._animatedScrollTo( itemOptions );
                }

            } );

        } );

    };

    // init
    Utils.$window.on( Utils.events.initJs, function() {

        $( 'a[href^="#"]:not([href="#"]):not([role="tab"]):not([aria-controls])' ).animatedAnchors();

    } );

} )( jQuery, BSX_UTILS );
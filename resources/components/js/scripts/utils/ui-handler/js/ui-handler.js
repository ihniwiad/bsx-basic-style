/*

<div data-fn-options="{ appearOffset: 100 }">Listen to element to appear (call ui handler via js function)</div>

*/

/*

TODO: 
    - clean up
    - make global function from _elemInWindow() listening appear left / right too

*/

( function( $, Utils ) {

    var UiHandler = {
        id: -1
    };

    UiHandler.listenAppear = function( elem, options ) {

        var $elem = $( elem );

        var defaults = {
            appearEventTriggered: false,
            appearEvent: 'appear.uiHandler',
            appearOffset: 0
        };

        // get options from function
        var options = $.extend( {}, defaults, options );

        // get options from attr
        options = $.extend( {}, options, $elem.getOptionsFromAttr() );

        // data
        $elem.data( {
            appearEventTriggered: false,
            id: UiHandler.id + 1
        } );

        /*

        // functions
        $.fn._belowTheFold = function( offset ) {
            var fold = Utils.$window.height() + Utils.$window.scrollTop();
            console.log( '_belowTheFold: ' + ( fold <= $( this ).offset().top - offset ) );
            console.log( '$( this ).offset().top - offset: ' + ( $( this ).offset().top - offset ) );
            console.log( 'fold: ' + ( fold ) );
            return fold <= $( this ).offset().top - offset;
        };
        $.fn._rightOfFold = function( offset ) {
            var fold = Utils.$window.width() + Utils.$window.scrollLeft();
            console.log( '_rightOfFold: ' + ( fold <= $( this ).offset().left - offset ) );
            return fold <= $( this ).offset().left - offset;
        };
        $.fn._aboveTheTop = function( offset ) {
            var fold = Utils.$window.scrollTop();
            console.log( '_aboveTheTop: ' + ( fold >= $( this ).offset().top + offset  + $( this ).height() ) );
            return fold >= $( this ).offset().top + offset  + $( this ).height();
        };
        $.fn._leftOfBegin = function( offset ) {
            var fold = Utils.$window.scrollLeft();
            console.log( '_leftOfBegin: ' + ( fold >= $( this ).offset().left + offset + $( this ).width() ) );
            return fold >= $( this ).offset().left + offset + $( this ).width();
        };
        $.fn._withinViewport = function( offset ) {
            console.log( '_withinViewport: ' + ( ! $( this )._rightOfFold( offset ) && ! $( this )._leftOfBegin( offset ) && ! $( this )._belowTheFold( offset ) && ! $( this )._aboveTheTop( offset ) ) );
            return
                ! $( this )._rightOfFold( offset ) 
                && ! $( this )._leftOfBegin( offset )
                && ! $( this )._belowTheFold( offset )
                && ! $( this )._aboveTheTop( offset )
            ;
        }

        $.fn._triggerEventIfInViewport = function( offset ) {
            var $elem = $( this );
            console.log( '$elem.offset().top: ' + $elem.offset().top );
            if ( ! options.appearEventTriggered && $elem._withinViewport( offset ) ) {
                $elem.trigger( options.appearEvent );
                options.appearEventTriggered = true;
            }
            else {
                // remove event listeners after event triggered
                //Utils.$window.off( 'scroll.uiHandler.appear' 'resize.uiHandler.appear');
            }

        }

        // initial check
        $elem._triggerEventIfInViewport( options.appearOffset );

        // listen events
        Utils.$window.on( 'scroll.uiHandler.appear resize.uiHandler.appear', function() {
            $elem._triggerEventIfInViewport( options.appearOffset );
        } );
        $.fn._elemPositionedInsideWindow = function() {

            var $this = $( this );
            var $container = Utils.$window;

            var elemOffsetLeft = $this.offset().left;
            var elemOffsetTop = $this.offset().top;
            var elemWidth = $this.width();
            var elemHeight = $this.height();

            var containerOffsetLeft = $container.scrollLeft();
            var containerOffsetTop = $container.scrollTop();
            var containerWidth = $container.width();
            var containerHeight = $container.height();

            console.log( 'elemOffsetLeft: ' + elemOffsetLeft + ' – elemOffsetTop: ' + elemOffsetTop + ' - elemWidth: ' + elemWidth + ' – elemHeight: ' + elemHeight );
            console.log( 'containerOffsetLeft: ' + containerOffsetLeft + ' – containerOffsetTop: ' + containerOffsetTop + ' - containerWidth: ' + containerWidth + ' – containerHeight: ' + containerHeight );

            console.log( 'elemOffsetLeft >= containerOffsetLeft: ' + elemOffsetLeft >= containerOffsetLeft );
            console.log( '( elemOffsetLeft + elemWidth ) <= ( containerOffsetLeft + containerWidth ): ' + ( elemOffsetLeft + elemWidth ) <= ( containerOffsetLeft + containerWidth ) );
            console.log( 'elemOffsetTop >= containerOffsetTop: ' + elemOffsetTop >= containerOffsetTop );
            console.log( '( elemOffsetTop + elemHeight ) <= ( containerOffsetTop + containerHeight ): ' + ( elemOffsetTop + elemHeight ) <= ( containerOffsetTop + containerHeight ) );

            return elemOffsetLeft >= containerOffsetLeft
                && ( elemOffsetLeft + elemWidth ) <= ( containerOffsetLeft + containerWidth )
                && elemOffsetTop >= containerOffsetTop
                && ( elemOffsetTop + elemHeight ) <= ( containerOffsetTop + containerHeight );
        };

        */



        function _elemInWindow( elem, tol ) {

            var $this = $( elem );
            var tolerance = tol || 0;

            var elemOffsetTop = $this.offset().top;
            var elemHeight = $this.height();

            var windowScrollTop = Utils.$window.scrollTop();
            var windowHeight = Utils.$window.height();

            //console.log( 'elemOffsetTop: ' + elemOffsetTop + ' – elemHeight: ' + elemHeight + ' - windowScrollTop: ' + windowScrollTop + ' – windowHeight: ' + windowHeight );
            //console.log( 'containerOffsetLeft: ' + containerOffsetLeft + ' – containerOffsetTop: ' + containerOffsetTop + ' - containerWidth: ' + containerWidth + ' – containerHeight: ' + containerHeight );

            //console.log( '! ' + elemOffsetTop + ' (elemOffsetTop) > ' + ( windowScrollTop + windowHeight ) + '(windowScrollTop + windowHeight)' );
            //console.log( ! ( elemOffsetTop > windowScrollTop + windowHeight ) );

            //console.log( '! ' + windowScrollTop + ' (windowScrollTop) > ' + ( elemOffsetTop + elemHeight ) + '(elemOffsetTop + elemHeight)' );
            //console.log( ! ( windowScrollTop > elemOffsetTop + elemHeight ) );

            //console.log( 'RESULT: ' + ( ( ! ( elemOffsetTop > windowScrollTop + windowHeight ) ) && ( ! ( windowScrollTop > elemOffsetTop + elemHeight ) ) ) );

            return ( ! ( elemOffsetTop > windowScrollTop + windowHeight + tolerance ) ) 
                && ( ! ( windowScrollTop > elemOffsetTop + elemHeight + tolerance ) );
        };

        Utils.$window.on( 'scroll.' + options.appearEvent + '.' + $elem[ 'id' ] + ' resize.' + options.appearEvent + '.' + $elem[ 'id' ], function() {

            //console.log( '$elem.data( \'appearEventTriggered\' ): ' + $elem.data( 'appearEventTriggered' ) );
            //console.log( '_elemInWindow( $elem, options.appearOffset ): ' + _elemInWindow( $elem, options.appearOffset ) );

            if ( 
                ! $elem.data( 'appearEventTriggered' )
                && _elemInWindow( $elem, options.appearOffset )
                //&& ! ( Utils.$window.scrollTop() + Utils.$window.height() < $elem.offset().top + options.appearOffset ) // below the fold
                //&& ! ( Utils.$window.scrollTop() > $elem.offset().top + $elem.height() + options.appearOffset ) // above the top
                //&& ! Utils.$window.scrollLeft() > $elem.offset().left + $elem.width() + options.appearOffset // right of fold
                //&& ! Utils.$window.scrollLeft() + Utils.$window.width() < $elem.offset().left + options.appearOffset // left of begin
            ) {
                $elem[ 'appearEventTriggered' ] = true;
                $elem.trigger( options.appearEvent );
                //console.log( 'TRIGGERED: ' + options.appearEvent );
            }
            else {
                if ( $elem.data.appearEventTriggered ) {
                    // remove event listeners after event triggered
                    Utils.$window.off( 'scroll.' + options.appearEvent + '.' + $elem[ 'id' ] + ' resize.' + options.appearEvent + '.' + $elem[ 'id' ] );
                    //console.log( 'OFF: ' + options.appearEvent );
                }
            }
        } );

        //console.log( 'STARTET LISTEN: ' + options.appearEvent );

    };

    // add ui handler to utils to use global
    Utils.UiHandler = UiHandler;

} )( jQuery, BSX_UTILS );
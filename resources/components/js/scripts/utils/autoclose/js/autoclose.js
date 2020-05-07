( function( $, Utils ) {

    var Autoclose = {
        timeouts: [],
        intervals: [],
        init: function( elem, options ) {
            return initAutoclose( elem, options );
        }
    };

    function initAutoclose( elem, options ) {

        var defaults = {
            $countdownElem: null,
            $pauseEventElem: null,
            autoclose: false,
            autocloseDelay: 5000,
            pauseEvent: 'mouseenter',
            continueEvent: 'mouseleave',
            stopEvent: 'hide.bs.modal',
            closeFunctionName: 'modal',
            closeFunctionParams: 'hide'
        };

        var options = $.extend( {}, defaults, options );

        // prepare data object to give into functions
        var data = {
            $elem: $( elem ),
            options: options,
            id: options.id,
            hasCountdown: 
                typeof options.$countdownElem !== 'undefined' 
                && options.$countdownElem != null 
                && options.$countdownElem.length > 0
            ,
            remainingTime: options.autocloseDelay,
            startTime: null,
            paused: false
        };

        // functions

        _startCounting = function( data ) {

            if ( ! data.options.$countdownElem.is( ':visible' ) ) {
                data.options.$countdownElem.show();
            }
            data.options.$countdownElem.text( Math.round( data.remainingTime / 1000 ) );
            
            Autoclose.intervals[ data.id ] = window.setInterval( function() { return ( function( data ) {

                var $elem = $( data.$elem );

                remaingSeconds = data.remainingTime - ( new Date() ).getTime() + data.startTime;
                options.$countdownElem.text( Math.round( remaingSeconds / 1000 ) );

            } )( data ) }, 1000 );
            
            // remove existing event listeners (pause / continue)
            _destroyPausingListeners( data );

            // bind new event listeners (pause / continue)
            if ( !! data.options.$pauseEventElem ) {
                data.options.$pauseEventElem.on( data.options.pauseEvent + '.alert.countdown', function() {
                    _pauseTimeout( data );
                } );
                data.options.$pauseEventElem.on( data.options.continueEvent + '.alert.countdown', function() {
                    _continueTimeout( data );
                } );
            }
        }

        _startTimeout = function( data ) {

            data.startTime = ( new Date() ).getTime();

            Autoclose.timeouts[ data.id ] = window.setTimeout( function() { return ( function( data ) {

                var $elem = $( data.$elem );

                if ( data.hasCountdown ) {
                    window.clearInterval( Autoclose.intervals[ data.id ] );
                }
                $elem[ data.options.closeFunctionName ]( data.options.closeFunctionParams );

            } )( data ) }, data.options.autocloseDelay );

            // coundown
            if ( data.hasCountdown ) {

                // start counting
                _startCounting( data );

            }
        }

        _pauseTimeout = function( data ) {

            data.paused = true;
            data.remainingTime -= ( new Date() ).getTime() - data.startTime;
            window.clearTimeout( Autoclose.timeouts[ data.id ] );

            if ( data.hasCountdown ) {
                window.clearInterval( Autoclose.intervals[ data.id ] );
            }
        }

        _continueTimeout = function( data ) {

            data.paused = false;
            data.startTime = ( new Date() ).getTime();
            Autoclose.timeouts[ data.id ] = window.setTimeout( function() { return ( function( data ) {

                var $elem = $( data.$elem );

                _destroyPausingListeners( data );
                $elem[ data.options.closeFunctionName ]( data.options.closeFunctionParams );
                window.clearInterval( Autoclose.intervals[ data.id ] );

            } )( data ) }, data.remainingTime );

            // coundown
            if ( data.hasCountdown ) {
                // restart counting
                _startCounting( data );
            }
        }

        _stopTimeout = function( data ) {

            _destroyPausingListeners( data );
            window.clearTimeout( Autoclose.timeouts[ data.id ] );

            if ( data.hasCountdown ) {
                window.clearInterval( Autoclose.intervals[ data.id ] );
            }
        }

        _destroyPausingListeners = function( data ) {

            data.options.$pauseEventElem.off( data.options.pauseEvent + '.alert.countdown' + ' ' + data.options.continueEvent + '.alert.countdown' );
        }

        // start autoclose
        _startTimeout( data );

        // clear autoclose if closing manually
        data.$elem.one( data.options.stopEvent, function() {

            _stopTimeout( data );

        } );

    }

    $.fn.autoclose = function( options ) {
        options = options || {};
        this.each( function() {
            return new Autoclose.init( this, options );
        } );
    }

} )( jQuery, BSX_UTILS );

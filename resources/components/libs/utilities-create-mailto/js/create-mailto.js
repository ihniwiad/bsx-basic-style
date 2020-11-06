/*

MARKUP

<a class="create-mt" data-fn="create-mt" data-mt-n="info" data-mt-d="example" data-mt-s="com"></a>

*/

( function( $, Utils ) {

    $.fn._createMt = function( options, index ) {

        var defaults = {
        	// events: 'touch hover'
        };

        options = $.extend( {}, defaults, options );

		var a = '@';
		var d = '.';
		var p = 'ma' + 'il' + 'to:';

		$.fn._addHref = function( href, index ) {
            if ( typeof $( this ).attr( 'href' ) == 'undefined' ) {
                $( this )
                    .attr( 'href', href )
                    .off( 'mouseenter.' + index )
                    .off( 'touchstart.' + index )
                ;
                // console.log( 'added: ' + href );
            }
            else {
                // console.log( 'href already set (please destroy event listener)' );
            }
		}

        var $elem = $( this );

        var addr = $elem.attr( 'data-mt-n' ) + a + $elem.attr( 'data-mt-d' ) + d + $elem.attr( 'data-mt-s' );
        var href = p + addr;

        // add href
        if ( typeof Modernizr !== "undefined" && Modernizr.touchevents ) {
        	$elem.on( 'touchstart.' + index, function() {
        		$( this )._addHref( href, index );
        	} );
        }
        else {
        	$elem.on( 'mouseenter.' + index, function() {
        		$( this )._addHref( href, index );
        	} );
        }

    };

    $.fn._initCreateMt = function( options ) {

    	$( this ).each( function( i, elem ) {

			var $elem = $( elem );

			var options = $elem.getOptionsFromAttr();

			return $elem._createMt( options, i );

		} );

    };

	// init
    Utils.$window.on( Utils.events.initJs, function() {

    	Utils.$functionElems.filter( '[data-fn~="create-mt"]' )._initCreateMt();

    } );

} )( jQuery, BSX_UTILS );

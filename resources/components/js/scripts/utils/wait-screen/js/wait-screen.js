/*
<!-- WAIT SCREEN -->
<div class="wait-screen" data-tg="wait-screen">
	<i class="fa fa-circle-o-notch fa-spin wait-screen-icon" aria-hidden="true"></i>
</div>
*/

( function( $, Utils ) {

	var WaitScreen = {
		isOpen: false,
		count: 0
	};

	WaitScreen.show = function() {

		WaitScreen.count++;
		WaitScreen.$waitScreen.addClass( WaitScreen.options.openClass );
		WaitScreen.isOpen = true;

	}

	WaitScreen.hide = function( forceClosing ) {

		WaitScreen.count--;
		if ( WaitScreen.count < 1 || forceClosing ) {
			WaitScreen.count = 0;
			WaitScreen.$waitScreen.removeClass( WaitScreen.options.openClass );
			WaitScreen.isOpen = false;
		}

	}

	WaitScreen.init = function( options ) {

		var defaults = {
			openClass: Utils.classes.open
		}

		WaitScreen.options = $.extend( {}, defaults, options );

		WaitScreen.$waitScreen = Utils.$targetElems.filter( '[data-tg="wait-screen"]' );

	}

	// init wait screen
	WaitScreen.init();

	// add wait screen to utils to use globally
	Utils.WaitScreen = WaitScreen;

} )( jQuery, BSX_UTILS );

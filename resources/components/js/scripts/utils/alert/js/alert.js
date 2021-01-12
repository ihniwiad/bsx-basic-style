/*
<!-- ALERT MODAL -->

<!-- alert modal (empty) -->
<div class="modal fade bsx-alert-modal" tabindex="-1" role="alert" data-tg="bsx-alert-modal">
	<div class="modal-dialog" role="document">
		<div class="modal-content" data-tg="bsx-alert-modal-content">
		</div>
	</div>
</div>

<div style="display: none;" aria-hidden="true">

	<!-- alert template to clone into alert modal -->

	<div class="alert alert-danger alert-dismissible my-1" data-tg="bsx-error-alert">
		<div class="font-weight-bold" data-g-tg="bsx-alert-title"></div>
		<div class="d-inline">Code <span data-g-tg="bsx-alert-code">0</span>: </div>
		<div class="d-inline" data-g-tg="bsx-alert-content"></div>
		<button type="button" class="close" data-dismiss="alert" aria-label="Close">
			<span aria-hidden="true">×</span>
		</button>
	</div>

	<!-- message template to clone into alert modal -->

	<div class="alert alert-success alert-dismissible my-1" data-tg="bsx-message-alert">
		<div class="font-weight-bold" data-g-tg="bsx-alert-title"></div>
		<div data-g-tg="bsx-alert-content"></div>
		<span class="modal-countdown" data-g-tg="bsx-alert-countdown" style="display: none;"></span>
		<button type="button" class="close" data-dismiss="alert" aria-label="Close">
			<span aria-hidden="true">×</span>
		</button>
	</div>

</div>
*/

( function( $, Utils ) {

	var Alert = {
		currentAlerts: 0,
		ids: [],
		isOpen: false,
		isClosing: false,
		cancelClosing: false,
		singleClosedEvent: 'singleAlertClosed'
	};

	Alert.adaptAlert = function( currentAlert, options ) {

		var defaults = {
			titleSelector: '[data-g-tg="bsx-alert-title"]',
			contentSelector: '[data-g-tg="bsx-alert-content"]',
			codeSelector: '[data-g-tg="bsx-alert-code"]',
			countdownSelector: '[data-g-tg="bsx-alert-countdown"]',
			title: 'Unknown message',
			content: 'Message information missing.'
		};

		var options = $.extend( {}, defaults, options );

		$currentAlert = $( currentAlert );
		$currentAlertTitle = $currentAlert.find( options.titleSelector );
		$currentAlertContent = $currentAlert.find( options.contentSelector );
		$currentAlertCountdown = $currentAlert.find( options.countdownSelector );
		$currentAlertCode = $currentAlert.find( options.codeSelector );

		// create alert id
        var alertId = ( Alert.ids.length > 0 ) ? Alert.ids[ Alert.ids.length - 1 ] + 1 : 0;
        Alert.ids.push( alertId );
        $currentAlert.attr( 'data-autoclose-id', alertId );


		// fill data
		if ( options.title != '' ) {
			$currentAlertTitle.html( options.title );
		}
		$currentAlertContent.html( options.content );

		// add error code if available
		if ( !! options.errorCode ) {
			$currentAlertCode.html( options.errorCode );
		}
		
		// bind autoclose if available
		if ( options.autoclose === true ) {
			$currentAlert.autoclose( {
				id: alertId,
				$countdownElem: $currentAlertCountdown,
				$pauseEventElem: $currentAlert,
	            stopEvent: 'close.bs.alert',
	            closeFunctionName: 'alert',
	            closeFunctionParams: 'close'
			} );
		}

	}

	Alert.showAlert = function( state, options ) {

		// count new alert
		Alert.currentAlerts++;

		// cancel closing if alert appears while closing
		if ( Alert.isOpen && Alert.isClosing ) {
			Alert.cancelClosing = true;
		}

		// clone alert from template
		var $errorAlertClone;

		switch ( state ) {
			case 'error':
				$currentAlertClone = Alert.$errorAlert.clone();
				break;
			case 'message':
				$currentAlertClone = Alert.$messageAlert.clone();
				break;
		} 

		// adapt alert contents
		Alert.adaptAlert( $currentAlertClone, options );

		// enable close (bootstrap)
		$currentAlert.alert();

		// bind event on close single alert (bootstrap)
		$currentAlert.on( 'close.bs.alert', function() {

			Alert.$modal.trigger( Alert.singleClosedEvent );

			// subtract dismissed alert
			Alert.currentAlerts--;

			// try close modal
			Alert.tryCloseModal();
		} );

		// append alert
		$currentAlertClone.appendTo( Alert.$modalContent );

		// show modal
		Alert.openModal( options );
	}

	// separate functions for error and message
	Alert.showError = function( options ) {

		Alert.showAlert( 'error', options );

	}
	Alert.showMessage = function( options ) {

		Alert.showAlert( 'message', options );

	}

	// alert modal functions

	Alert.openModal = function() {

		Alert.cancelClosing = false;
		
		if ( ! Alert.$modal.is( ':visible' ) ) {

			// open modal (bootstrap)
			Alert.$modal.modal( 'show' );

			// remember open
			Alert.isOpen == true;

			// bind close (bootstrap)
			Alert.$modal.one( 'hide.bs.modal', function() {

				// remember closing
				Alert.isClosing = true;

				// close
				Alert.setModalClosed();
			} );
		}

	}

	Alert.tryCloseModal = function() {

		// close modal if currently < 1 alert shown
		if ( Alert.currentAlerts < 1 ) {

			// close (bootstrap)
			Alert.$modal.modal( 'hide' );

		}

	}

	Alert.setModalClosed = function() {
		
		Alert.$modal.one( 'hidden.bs.modal', function() {

			// check cancel closing
			if ( Alert.cancelClosing === true ) {
				// do nothing, reopen
			}
			else {

				// empty if closing done
				Alert.$modalContent.empty();

				// remember closing complete
				Alert.currentAlerts = 0;
				Alert.isOpen = false;
				Alert.isClosing = false;
			}

		} );

	}

	Alert.init = function() {

		/*
 		var defaults = {
			defaultClass: 'alert alert-dismissible m-0',
			titleClass: 'font-weight-bold',
			states: {
				success: {
					stateClass: 'alert-success',
					autoclose: true,
					autocloseDelay: 5000,
					title: 'Note',
					content: 'Action succesfull done.'
				},
				error: {
					stateClass: 'alert-danger',
					autoclose: false,
					autocloseDelay: null,
					title: 'Error',
					content: 'An unknown error occured.'
				}
			},
			closeCallback: null
		};

		Alert.options = $.extend( {}, defaults, options );
		*/

		Alert.$modal = Utils.$targetElems.filter( '[data-tg="bsx-alert-modal"]' );
        Alert.$modalContent = Utils.$targetElems.filter( '[data-tg="bsx-alert-modal-content"]' );

        Alert.$errorAlert = Utils.$targetElems.filter( '[data-tg="bsx-error-alert"]' );
        Alert.$messageAlert = Utils.$targetElems.filter( '[data-tg="bsx-message-alert"]' );

	}

	// init alert modal
	Alert.init();

	/*
	$.fn.bsxAlert = function( options ) {

        var defaults = {
        	defaultClass: 'alert alert-dismissible m-0',
        	stateClass: 'alert-success',
        	autoclose: true,
        	autocloseDelay: 5000,
        	iconClass: null,
			titleClass: 'font-weight-bold',
			title: 'Bitte beachten',
			content: 'Die Aktion wurde erforgreich ausgeführt.',
			closeCallback: null
        };

        options = $.extend( {}, defaults, options );

        var $modal = $( this );
        var $modalAlert = Utils.$targetElems.filter( '[data-tg="bsx-alert"]' );
        var $modalAlertTitle = Utils.$targetElems.filter( '[data-tg="bsx-alert-title"]' );
        var $modalAlertContent = Utils.$targetElems.filter( '[data-tg="bsx-alert-content"]' );

		var title = ( typeof options.title === 'object' ) ? options.title[ Utils.lang ] : options.title;
		var content = ( typeof options.content === 'object' ) ? options.content[ Utils.lang ] : options.content;

		// TEST – TODO: remove
		//content += '&nbsp;<span data-fn="coundown">countdown</span>';

		$modalAlert.attr( 'class', options.defaultClass + ' ' + options.stateClass );
		$modalAlertTitle
			.attr( 'class', options.titleClass )
			.html( title )
		;
		$modalAlertContent.html( content );

		// open
		$modal.modal( 'show' );

		if ( options.closeCallback && typeof options.closeCallback === 'function' ) {
			$modal.one( 'hide.bs.modal', function() {
				options.closeCallback();
			} );
		}
 
		// auto close
		if ( options.autoclose && Number( parseFloat( options.autocloseDelay ) ) === options.autocloseDelay ) {
			$modal.autoclose( {
				autoclose: true,
				$countdownElem: Utils.$targetElems.filter( '[data-tg="bsx-alert-countdown"]' ),
				$pauseEventElem: Utils.$targetElems.filter( '[data-tg="bsx-alert"]' )
			} );
		}
	}
	*/

	// init
	// TEST – TODO: remove
	/*
	Utils.$functionElems.filter( '[data-fn="bsx-alert-modal-trigger"]' ).on( 'click', function() {

		var $alertModal = Utils.$targetElems.filter( '[data-tg="bsx-message-modal"]' );

		$alertModal.bsxAlert( {
        	stateClass: 'alert-success',
        	autoclose: true,
        	autocloseDelay: 5000,
			title: {
				de: 'Hinweis',
				en: 'Note'
			},
			content: {
				de: 'Du hast dich erfolgreich ausgeloggt.',
				en: 'You logged out.'
			}
		} );
	} );
	*/
	/*
	// TEST – TODO: remove
	Utils.$functionElems.filter( '[data-fn="bsx-add-message-alert"]' ).on( 'click', function() {
		var options = {
			title: 'Message',
			content: 'Faucibus tincidunt.',
			autoclose: true
		};
		Alert.showMessage( options );
	} );
	// TEST – TODO: remove
	Utils.$functionElems.filter( '[data-fn="bsx-add-error-alert"]' ).on( 'click', function() {
		var options = {
			errorCode: 123,
			title: 'Fehler',
			content: 'Lorem ipsum dolor set.'
		};
		Alert.showError( options );
	} );
	// TEST – TODO: remove (cursor up: create message, cursor down: create error)
	if ( location.href.indexOf( 'debug=1' ) >= 0 ) {
		$( document ).keydown( function( event ) {
			switch ( event.keyCode ) {
				case 38:
					var options = {
						title: 'Message',
						content: 'Faucibus tincidunt.',
						autoclose: true
					};
					Alert.showMessage( options );
					break;
				case 40:
					var options = {
						errorCode: 123,
						title: 'Fehler',
						content: 'Lorem ipsum dolor set.'
					};
					Alert.showError( options );
					break;
			}
		} );
	}
	*/
	// add alert to utils to use global
	Utils.Alert = Alert;

} )( jQuery, BSX_UTILS );

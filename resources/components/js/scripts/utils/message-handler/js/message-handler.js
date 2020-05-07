( function( $, Utils ) {

	var MessageHandler = {};

	MessageHandler.handleError = function( jqXHR ) {

		var fallbackErrorMessage = 'unknown error';
		var fallbackErrorCode = 0;

		var responseText = ( jqXHR.responseText != '' ) ? $.parseJSON( jqXHR.responseText ) : false;
		if ( 
			!! responseText
			&& responseText.error.error_stack !== undefined
			&& responseText.error.error_stack.length > 0 
		) {
			throwErrorStack( responseText.error.error_stack );
		}
		else if ( 
			!! responseText 
			&& ( responseText.error.message !== undefined || responseText.error.code !== undefined )
		) {
			var errorCode;
			var errorMessage;

			if ( responseText.error.code !== undefined ) {
				errorCode = responseText.error.code;
			}
			else {
				errorCode = fallbackErrorCode;
			}

			if ( responseText.error.message !== undefined ) {
				errorMessage = responseText.error.message;
			}
			else {
				errorMessage = fallbackErrorMessage;
			}

			MessageHandler.throwError( errorCode, errorMessage );
		}
		else {
			MessageHandler.throwError( fallbackErrorCode, fallbackErrorMessage );
		}
	};

	MessageHandler.throwError = function( code, message ) {
		throwErrorStack( [ { code: code, message: message } ] );
	};

	function throwErrorStack( errorStack ) {

		$.each( errorStack, function( i, error ) {

			// add errors
			var options = {
				errorCode: error.code,
				title: '',
				content: error.message
			};
			Utils.Alert.showError( options );

		});

		Utils.WaitScreen.hide();
	}

	MessageHandler.printMessage = function( message ) {

		var options = {
			title: '',
			content: message,
			autoclose: true
		};
		Utils.Alert.showMessage( options );

	};

	// add message handler to utils to use global
	Utils.MessageHandler = MessageHandler;

} )( jQuery, BSX_UTILS );

( function( $, Utils ) {

	customerLogin = function( $form ) {

		if ( $form.validateForm() ) {
			var values = $form.getFormValues();

			var params = {
				Email: values.loginMail,
				Password: values.loginPassword
			};

			Utils.WaitScreen.show();

			$.ajax( '/rest/checkout/login/', {
				data: JSON.stringify( params ),
				dataType: 'json',
				type: 'POST',
				success: function () {
					window.location.href = $form.attr( 'action' );
				},
				error: Utils.MessageHandler.handleError
			} );
		}
	};

	// init
    Utils.$window.on( Utils.events.initJs, function() {

	    Utils.$functionElems.filter( '[data-fn*="login-form"]' ).each( function( i, form ) {
	        $( form ).submit( function( event ) {
	            event.preventDefault();
	            customerLogin( $( event.target ) );
	        } );
	    } );

    } );

} )( jQuery, BSX_UTILS );

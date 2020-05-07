( function( $, Utils ) {

	unsubscribe = function( $form ) {

		if ( $form.validateForm() ) {
			var values = $form.getFormValues();

			var params = {
				Email: values.mail
			};

			var nlid = values.nlid || '';

			Utils.WaitScreen.show();

			$.ajax( '/rest/checkout/login/' + nlid, {
				data: JSON.stringify( params ),
				dataType: 'json',
				type: 'DELETE',
				success: function () {

					$form.trigger( 'submit-success' );
        			Utils.WaitScreen.hide();

        			if ( options.showSuccessMessage ) {
		                // add success message
		                Utils.MessageHandler.printMessage( options.successMessage );
        			}

	                // replace form by permanent success message element
	                $form.replaceFormByMessage();

				},
				error: Utils.MessageHandler.handleError
			} );
		}
	};

	// init
    Utils.$window.on( Utils.events.initJs, function() {

	    Utils.$functionElems.filter( '[data-fn*="unsubscribe-form"]' ).each( function( i, form ) {
	        $( form ).submit( function( event ) {
	            event.preventDefault();
	            customerLogin( $( event.target ) );
	        } );
	    } );

    } );

} )( jQuery, BSX_UTILS );

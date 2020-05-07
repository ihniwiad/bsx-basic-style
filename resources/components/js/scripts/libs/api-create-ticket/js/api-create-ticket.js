/*

<form class="needs-validation" novalidate data-fn="api-create-ticket" data-fn-options="{ title: 'MY TICKET TITLE', message: 'The following customer needs your attention:', lineBreakNames: [ 'message' ], addTitleNames: [ 'first_name', 'last_name' ], successMessage: 'Your message has been sent successfully.' }" data-fn-callback="myCallbackFunction( 'bla', 'blub' )">
    ...
</form>

--

function attribute: data-fn="create-ticket"

options (data-fn-options="{ ... }"):

	invalidClass		... class for invalid form controls (default: Utils.classes.invalid)
	typeId 				... TypeId for creating plenty ticket (default: 1)
	statusId 			... StatusId for creating plenty ticket (default: 1)
	confidential 		... Confidential for creating plenty ticket (default: 1)
	showSuccessMessage 	... show success alert after ticket has been createt (default: true)
	title 				... ticket title (required) (any form values can be added to title)
	successMessage 		... message for success alert (default: “Your message has been sent successfully.”)
	sendEmptyValues     ... send value if “” (default: true)
	message 			... text at beginning of ticket content (required) (ticket content consists of this text followed by list of all form values)
	lineBreakNames 		... list of form values which need a line break between key and value, e.g. large text (optional)
	addTitleNames 		... list of form values which will be added to ticket title separated by space (optional)

callback (data-fn-callback="..." – optional):

	callback function, e.g. google analytics function, fired after ticket has been created

*/

( function( $, Utils ) {

	var _apiCreateTicket = function( $form ) {

        $form.on( 'submit', function( event ) {

            event.preventDefault();
            event.stopPropagation();

            var defaults = {
            	invalidClass: Utils.classes.invalid,
            	typeId: 1,
            	statusId: 1,
            	confidential: '1',
				plentyId: 1155,
			    source: 'frontend',
			    owners: [
			        {
			            userId: 88,
			            roleId: 1
			        }
			    ],
            	showSuccessMessage: true,
            	successMessage : 'Your message has been sent successfully.',
            	sendEmptyValues: true
            };

            var options = $.extend( {}, defaults, $form.getOptionsFromAttr() );

            if ( ! $form.validateForm( { successCallback: false } ) ) {
                return false;
            }

	    	// prepare callback
            $form.on( 'submit-success', function( event ) {
	            $form.executeCallbackFunction();
            } );

            Utils.WaitScreen.show();

            var values = $form.getFormValues();

            // build message
            var newLine = '\n';
			var message = options.message + newLine + newLine;
			for ( var key in values ) {

				if ( options.sendEmptyValues || values[ key ] !== '' ) {
					var additionalBreak = false;
					if ( !! options.lineBreakNames && $.isArray( options.lineBreakNames ) && $.inArray( key, options.lineBreakNames ) !== -1 ) {
						additionalBreak = true;
					}
					message += key + ': ' + ( additionalBreak ? newLine : '' ) + values[ key ] + newLine;
				}
				
			}

			// build title
			var titleSeparator = ' ';
			var title = options.title;

			if ( typeof options.addTitleNames !== 'undefined' ) {
				for ( var i = 0; i < options.addTitleNames.length; i++ ) {
					if ( !! values[ options.addTitleNames[ i ] ] ) {
						title += titleSeparator + values[ options.addTitleNames[ i ] ];
					}
				}
			}

			Utils.WaitScreen.show();

			// prepare params
			var params = {
				typeId: options.typeId,
				statusId: options.statusId,
				title: title,
				plentyId: options.plentyId,
			    source: options.source,
			    owners: options.owners
			}

			$.ajax( "/rest/tickets", {
				data: JSON.parse( JSON.stringify( params ) ),
				dataType: 'json',
				type: 'POST',
				success: function ( data ) {

					// TODO: get id, add message


					$form.trigger( 'submit-success' );
        			Utils.WaitScreen.hide();

        			if ( options.showSuccessMessage ) {
		                // add success message
		                Utils.MessageHandler.printMessage( options.successMessage );
        			}

	                // replace form by permanent success message element
	                $form.replaceFormByMessage();
				},
				error: function() {
					Utils.MessageHandler.handleError;
        			Utils.WaitScreen.hide();
				}
			} );

			Utils.WaitScreen.hide();
            return false;
        } );

	};

    $.fn.initApiCreateTicket = function() {

    	var $form = $( this );

    	return _apiCreateTicket( $form );
    }

	// init
    Utils.$window.on( Utils.events.initJs, function() {

	    Utils.$functionElems.filter( '[data-fn="api-create-ticket"]' ).each( function() {
	        $( this ).initApiCreateTicket();
	    } );

    } );

} )( jQuery, BSX_UTILS );

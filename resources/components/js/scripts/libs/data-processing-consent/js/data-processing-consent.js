// TODO: add cookie list to remove existing cookies after disallow

/*

<!-- button to show consent popup -->
<button class="btn btn-primary" id="consent-popup-trigger" aria-controls="consent-popup" aria-expanded="false" data-fn="data-processing-popup-trigger">Show consent banner</button>


<!-- consent popup -->      
<div class="fixed-banner fixed-banner-bottom fixed-banner-closable bg-secondary d-none" id="consent-popup" aria-labeledby="consent-popup-trigger" tabindex="-1" role="dialog" hidden data-fn="cookie-related-elem" data-tg="data-processing-popup" data-fn-options="{ cookieName: 'dataProcessingConsentBannerHidden', cookieExpiresDays: 365, hiddenCookieValue: '1', hiddenClass: 'd-none', remoteOpenable: true }">
            
	<div class="container py-3">
		
		<form data-fn="data-processing-form" data-fn-options="{ cookieName: 'dataProcessingConsent', cookieExpiresDays: 365, categoryInputSelector: '[data-g-tg=category-input]' }">
            <div class="form-row align-items-center">

                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" id="data-processing-consent-0-0" value="analytics" data-g-tg="category-input">
                    <label class="form-check-label" for="data-processing-consent-0-0">Analytics</label>
                </div>

                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" id="data-processing-consent-1-0" value="other-category" data-g-tg="category-input">
                    <label class="form-check-label" for="data-processing-consent-1-0">Other category</label>
                </div>

                <div class="col-auto">
                    <button class="btn btn-outline-primary btn-sm" type="submit" data-fn="cookie-related-elem-close" data-g-fn="save">Save</button>
                </div>

                <div class="col-auto">
                    <button class="btn btn-primary btn-sm" data-fn="cookie-related-elem-close" data-g-fn="allow-all">Allow all</button>
                </div>

            </div>
        </form>
		
	</div>
	
</div>


<!-- hidden scripts -->
<div aria-hidden="true" data-tg="data-processing-consent-content">

    <script type="text/x-template" data-category="analytics" data-position="header" src="http://localhost/tmp/dev-testing/testing.js"></script>
    <script type="text/x-template" data-category="analytics" data-position="header">
        console.log( 'hello from inline script' );
    </script>
    
    <script type="text/x-template" data-category="other-category" src="http://localhost/tmp/dev-testing/testing-2.js"></script>
    <script type="text/x-template" data-category="other-category">
        console.log( 'hello from inline script 2' );
    </script>
	
</div>


<!-- single cat consent trigger -->
<button class="btn btn-primary test-hello" data-fn="data-processing-cat-consent-trigger" data-fn-options="{ cat: 'other-category', consentClass: 'd-none', nonConsentClass: 'test-hello' }">Allow “Other category”</button>

<!-- wrapped single cat consent trigger -->
<div data-g-tg="consent-trigger-wrapper">
	<button class="btn btn-primary test-hello" data-fn="data-processing-cat-consent-trigger" data-fn-options="{ cat: 'other-category', consentClass: 'd-none', nonConsentClass: 'test-hello', classTarget: '[data-g-tg=consent-trigger-wrapper]' }">Allow “Other category”</button>
</div>

*/


( function( $, Utils ) {

	/*
		TODO: 
			- copy all (but type!) script attributes (async, etc.) from src scripts (is this really necessary when new script is beeing applied by already runnig script?)
			- (?) option to append to head
	*/
	
	var defaultConsentStatus = {
		"cats": []
	};
	var renewCookie = false;
	var showConsentHint = false;
	
	var $consentForm = Utils.$functionElems.filter( '[data-fn="data-processing-form"]' );
	var $consentBanner = Utils.$targetElems.filter( '[data-tg="data-processing-popup"]' );
	var $saveAllButton = $consentForm.find( '[data-g-fn="allow-all"]' );
	var $singleCatConsentTriggers = Utils.$functionElems.filter( '[data-fn~="data-processing-cat-consent-trigger"]' );
	
	// get categories, read cookie, set checkboxes according to cookie value
	
	var options = $consentForm.getOptionsFromAttr();
	var bannerOptions = $consentBanner.getOptionsFromAttr();
	
	// initial get cookie
	var consentCookieStr = Utils.CookieHandler.getCookie( options.cookieName );
	
	// initial consent status
	if ( consentCookieStr ) {
		consentStatus = $.extend( {}, defaultConsentStatus, JSON.parse( consentCookieStr ) );
	}
	else {
		consentStatus = $.extend( {}, defaultConsentStatus );
		renewCookie = true;
	}
	
	var $categoryIputs = $consentForm.find( options.categoryInputSelector );
	var categories = [];
	$categoryIputs.each( function() {
		var currentCategory = $( this ).attr( 'value' );
		categories.push( currentCategory );
		
		// add to consent object
		var currentCatFound = false;
		for ( var i = 0; i < consentStatus.cats.length; i++ ) {
			if ( consentStatus.cats[ i ].name == currentCategory ) {
				currentCatFound = true;
				
				if ( consentStatus.cats[ i ].cons == 1 ) {
					// set checked
					$( this ).prop( 'checked', true );

					// initial set each single category button status
					setCatConsentTriggers( currentCategory, true );
				}
			}
		}
		if ( ! currentCatFound ) {
			// add new category to cookie, show hint
			consentStatus.cats.push( { name: currentCategory, cons: 0 } );
			showConsentHint = true;
		}
	} );
	
	
	// do update only if changed to keep max age
	
	if ( renewCookie ) {
		// initial cookie update
		Utils.CookieHandler.setCookie( options.cookieName, JSON.stringify( consentStatus ), 365, '/' );
	}
    
    
    // bind allow all button (before bind form submit)
	$saveAllButton.on( 'click', function( event ) {
		
        event.preventDefault();
        
        $categoryIputs.each( function() {
        	$( this ).prop( 'checked', true );
        } );
        
        $consentForm.trigger( 'submit' );
	} );


	// allow single category button (e.g. load Google map(s) on click on map containing element)
	$singleCatConsentTriggers.each( function() {

		var $singleCatConsentTrigger = $( this );
	
		var triggerOptions = $singleCatConsentTrigger.getOptionsFromAttr();
		var currentCategory = triggerOptions.cat || null;
	
		$singleCatConsentTrigger.on( 'click', function( event ) {
			
	        event.preventDefault();

        	$categoryIputs.filter( '[value="' + currentCategory + '"]' ).prop( 'checked', true );
	        
	        $consentForm.trigger( 'submit' );
		} );

	} );
	
	
	// bind form sumbit
    $consentForm.submit( function( event ) {
        event.preventDefault();
        $categoryIputs.each( function() {

        	var currentCategory = $( this ).attr( 'value' );
        	var currentConsent = $( this ).is( ':checked' );

        	// console.log( '$categoryIputs.each: ' + currentCategory );
        	
        	// update consent object
			for ( var i = 0; i < consentStatus.cats.length; i++ ) {
				if ( consentStatus.cats[ i ].name == currentCategory ) {
        			consentStatus.cats[ i ].cons = ( currentConsent ) ? 1 : 0;
				}
			}

			// set each single category button status
			setCatConsentTriggers( currentCategory, currentConsent );

        } );
        
        
        // if changes 
		var consentCookieStr = Utils.CookieHandler.getCookie( options.cookieName );
        
        
        if ( JSON.stringify( consentStatus ) != consentCookieStr ) {
        	
        	// remember consent status before update cookie
        	var beforeChangeConsentStatus = JSON.parse( consentCookieStr );
        	
			// user interactes cookie update
			Utils.CookieHandler.setCookie( options.cookieName, JSON.stringify( consentStatus ), 365, '/' );
        
        
        	for ( var i = 0; i < consentStatus.cats.length; i++ ) {
				// if anything denied which was allowed before do reload
				if ( consentStatus.cats[ i ].cons == 0 && ( beforeChangeConsentStatus.cats[ i ] !== undefined && beforeChangeConsentStatus.cats[ i ].cons == 1 ) ) {
					
					// do reload
					location.reload();
					
					break;
				}
        		
        		// if anything allowed which was dynied before do apply
        		if ( consentStatus.cats[ i ].cons == 1 && ( ( beforeChangeConsentStatus.cats[ i ] !== undefined && beforeChangeConsentStatus.cats[ i ].cons == 0 ) || beforeChangeConsentStatus.cats[ i ] === undefined ) ) {
        			
        			// use function for following tasks
        			applyCategory( consentStatus.cats[ i ].name );
        		}
        	}
					
        }
        else {
			// no changes, do nothing
        }
        
    } );


	// set cat consent triggers to current state
	function setCatConsentTriggers( currentCategory, currentConsent ) {

		var $currentCatTriggers = $singleCatConsentTriggers.filter( '[data-fn-options*="cat: \'' + currentCategory + '\'"]' );

		$currentCatTriggers.each( function( index, elem ) {

    		// console.log( '$currentCatTriggers.each: ' + index );

			var $currentCatTrigger = $( this );
		
			var triggerOptions = $currentCatTrigger.getOptionsFromAttr();
			var consentClass = triggerOptions.consentClass || '';
			var nonConsentClass = triggerOptions.nonConsentClass || '';

			var $classTarget = ( triggerOptions.classTarget ) ? $currentCatTrigger.closest( triggerOptions.classTarget ) : $currentCatTrigger;

    		// console.log( 'consentClass: ' + consentClass );

			if ( consentClass ) {

				if ( currentConsent ) {
					$classTarget.addClass( consentClass );
				}
				else {
					$classTarget.removeClass( consentClass );
				}
			}

			if ( nonConsentClass ) {
				if ( currentConsent ) {
					$classTarget.removeClass( nonConsentClass );
				}
				else {
					$classTarget.addClass( nonConsentClass );
				}
			}

		} );

	}
        
        
    // initial apply of script content if consent given via cookie
    for ( var i = 0; i < consentStatus.cats.length; i++ ) {
    	
		if ( consentStatus.cats[ i ].cons == 1 ) {
			
			// apply contents
			applyCategory( consentStatus.cats[ i ].name );
			
		}
		
    }
	
	
    
    // manage popup display
    if ( showConsentHint ) {

    	// set cookie value to make visible (in case popup will be inited later)
        Utils.CookieHandler.setCookie( bannerOptions.cookieName, 0, bannerOptions.cookieExpiresDays, '/' );
    	
    	// wait for CookieRelatedElem to be inited
    	window.setTimeout( function() {
    		$consentBanner.trigger( 'CookieRelatedElem.open' );
    	} );
    }
    
    
    // button to show popup manually
    var $showConsentBannerButton = Utils.$functionElems.filter( '[data-fn="data-processing-popup-trigger"]' );
    
    $showConsentBannerButton.on( 'click', function() {
    	$consentBanner.trigger( 'CookieRelatedElem.open' );
    } );
	
	
	// functions
	
	function applyCategory( category ) {
		
		// find related templates
		var $relatedContents = Utils.$targetElems.filter( '[data-tg="data-processing-consent-content"]' ).find( '[data-category="' + category + '"]' );
		
		// activate related templates
		$relatedContents.each( function() {
			var $elem = $( this );
			if ( $elem[0].nodeName.toLowerCase() == 'script' ) {
				if ( $elem.attr( 'src' ) !== undefined ) {
					// is src script

					// append src script
					appendSrcScript( $elem.attr( 'src' ) );
				}
				else {
					// is inline script
					
					// append inline script
					appendInlineScript( $elem.html() );
				}
			}
		} );
		
	}
	
	function appendSrcScript( src, appendTo ) {
		var currentAppendTo = ( !! appendTo ) ? appendTo : 'body';
		var script = document.createElement( 'script' );
	    script.setAttribute( 'src', src );
	    document[ currentAppendTo ].appendChild( script );
	}
	
	function appendInlineScript( textContent, appendTo ) {
		var currentAppendTo = ( !! appendTo ) ? appendTo : 'body';
		var script = document.createElement( 'script' );
		script.textContent = textContent;
	    document[ currentAppendTo ].appendChild( script );
	}
	
} )( jQuery, BSX_UTILS );

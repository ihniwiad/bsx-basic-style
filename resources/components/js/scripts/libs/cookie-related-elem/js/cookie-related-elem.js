/*
<div class="fixed-banner fixed-banner-bottom fixed-banner-closable bg-warning text-black d-none" tabindex="-1" role="dialog" hidden data-fn="cookie-related-elem" data-fn-options="{ cookieName: 'privacyBannerHidden', cookieExpiresDays: 365, hiddenCookieValue: '1', hiddenClass: 'd-none' }">
	<div class="container py-3">
		<div class="mb-2">
			Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. 
		</div>
		<div class="text-center">
			<button class="btn btn-success" data-fn="cookie-related-elem-close"><span>Accept</span><i class="fa fa-check" aria-hidden="true"></i></button><button class="btn btn-secondary ml-2" data-fn="cookie-related-elem-close"><span>Close</span><i class="fa fa-close" aria-hidden="true"></i></button>
		</div>
	</div>
</div>
*/


( function( $, Utils ) {

	var CookieRelatedElem = {};

	CookieRelatedElem.init = function( elem, options ) {

		var defaults = {
			closeElemSelector: '[data-fn="cookie-related-elem-close"]',
			hiddenCookieValue: '1',
			cookieExpiresDays: 365, 
			cookiePath: '/',
			focusOnOpen: true,
			remoteOpenable: false
		};

        options = $.extend( {}, defaults, options );
		/*
		options = { 
			cookieName: 'privacyBannerHidden', 
			cookieExpiresDays: 365, 
			hiddenCookieValue: '1', 
			hiddenClass: 'd-none'
		};
		*/

		var $elem = $( elem );
		if ( options.focusOnOpen ) {
			CookieRelatedElem.$focussedElem = null;
		}

		$.fn._showElem = function() {

			var $elem = $( this );

			if ( options.focusOnOpen ) {
				if ( CookieRelatedElem.$focussedElem === null ) {
					CookieRelatedElem.$focussedElem = $( Utils.$document.activeElement );
				}

				CookieRelatedElem.$focussableChildren = $elem.find( Utils.selectors.focussableElements );
			}

			// open dialog
			$elem.removeClass( options.hiddenClass );

			$elem.removeAttr( 'hidden' );

			// set focus to first focussable elem
			if ( options.focusOnOpen ) {
				CookieRelatedElem.$focussableChildren.first().focus();
			}
		};

		$.fn._hideElem = function() {

			var $elem = $( this );
			
			if ( !! options.hiddenClass ) {
				$elem.addClass( options.hiddenClass );
			}
			else {
				$elem.hide();
			}

			$elem.attr( 'hidden', '' );

			// set focus back to elem that was focussed before opening dialog
			if ( options.focusOnOpen && !! CookieRelatedElem.$focussedElem ) {
				CookieRelatedElem.$focussedElem.focus();
				CookieRelatedElem.$focussedElem = null;
			}
		};

		$.fn._bindClose = function() {

			var $currentElem = $( this );
			var $close = $currentElem.find( options.closeElemSelector );

			// bind hide elem & cookie set (if options.remoteOpenable always set close click event to be able to close manually after open remote)
			$close.on( 'click', function() {

				console.log( 'close clicked' );

				// set cookie, hide elem
				if ( !! options.cookieName && !! options.hiddenCookieValue && !! options.cookieExpiresDays && !! options.cookiePath ) {
					Utils.CookieHandler.setCookie( options.cookieName, options.hiddenCookieValue, options.cookieExpiresDays, options.cookiePath );

					$currentElem._hideElem();
				}

			} );
		};



		// check if cookie already set

		// TODO: if following condition is true click handler to close will be missing – apply method to open & close?
		if ( !! options.cookieName && !! Utils.CookieHandler.getCookie( options.cookieName ) && Utils.CookieHandler.getCookie( options.cookieName ) == options.hiddenCookieValue ) {

			// hide elem im visible
			if ( ! $elem.is( '.' + options.hiddenClass ) ) {
				$elem._hideElem();
			}

			if ( options.remoteOpenable ) {

				// bind hide elem & cookie set
				$elem._bindClose();

			}
		}
		else {

			// show elem if hidden
			if ( $elem.is( '.' + options.hiddenClass ) ) {
				$elem._showElem();
			}

			// bind hide elem & cookie set
			$elem._bindClose();
		}

		// remote openable & closable
		if ( options.remoteOpenable ) {

			// open
			$elem.on( 'CookieRelatedElem.open', function() {
				$( this )._showElem();
			} );

			// close
			$elem.on( 'CookieRelatedElem.close', function() {
				$( this )._hideElem();
			} );
		}

	}

	$.fn.initCookieRelatedElem = function() {
		$( this ).each( function( i, elem ) {

			var $elem = $( elem );

			var options = $elem.getOptionsFromAttr();

			return CookieRelatedElem.init( $elem, options );
		} );
	}

	// init
    Utils.$window.on( Utils.events.initJs, function() {

	    Utils.$functionElems.filter( '[data-fn="cookie-related-elem"]' ).initCookieRelatedElem();

    } );

} )( jQuery, BSX_UTILS );

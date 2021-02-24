( function( Utils ) {
	
	// detect ios / android
	var isIos = /iPad|iPhone|iPod/.test( navigator.platform ) && ! window.MSStream;
	var iosVersion = null;
	var iosFullVersion = null;
	var isAndroid = /(android)/i.test( navigator.userAgent );
	var isWin = navigator.platform.indexOf( 'Win' ) > -1;
	var isMobileIe = navigator.userAgent.match( /iemobile/i );
	var isWinPhone = navigator.userAgent.match( /Windows Phone/i );
	if ( isIos ) {
		document.body.className += ' is-ios';

		// detect version (required for fixes)
		var iosMaxVersion = 11;
		iosVersion = parseInt(
			( '' + ( /CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec( navigator.userAgent ) || [ 0,'' ] )[ 1 ] )
			.replace( 'undefined', '3_2' ).replace( '_', '.' ).replace( /_/g, '' )
		) || false;
		iosFullVersion = ( '' + ( /CPU.*OS ([0-9_]{1,9})|(CPU like).*AppleWebKit.*Mobile/i.exec( navigator.userAgent ) || [ 0,'' ] )[ 1 ] )
			.replace( 'undefined', '3_2' ) || false;
		if ( iosVersion !== false ) {
			document.body.className += ' ios' + iosVersion;
			for ( i = iosVersion; i <= iosMaxVersion; i++ ) {
				document.body.className += ' ioslte' + i;
			}
		}

	}
	else if ( isAndroid ) {
		document.body.className += ' is-android';
	}
	else if ( isWin ) {
		document.body.className += ' is-win';
		if ( isMobileIe ) {
			document.body.className += ' is-mobile-ie';
		}
	}
	if ( isWinPhone ) {
		document.body.className += ' is-win-phone';
	}
	
	function detectIe() {
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf( 'MSIE ' );
			if ( msie > 0 ) {
			return parseInt( ua.substring( msie + 5, ua.indexOf( '.', msie ) ), 10 );
		}
		var trident = ua.indexOf( 'Trident/' );
		if ( trident > 0 ) {
			var rv = ua.indexOf( 'rv:' );
			return parseInt( ua.substring( rv + 3, ua.indexOf( '.', rv ) ), 10 );
		}
		var edge = ua.indexOf( 'Edge/' );
		if ( edge > 0 ) {
			return parseInt( ua.substring( edge + 5, ua.indexOf( '.', edge ) ), 10 );
		}
		return false;
	}

	// detect ie gt 9
	var ieMaxVersion = 14;
	var ieVersion = detectIe();
	var isIe = ( ieVersion !== false );
	if ( isIe && ieVersion > 9 ) {
		document.body.className += ' ie ie' + ieVersion;
		for ( i = ieVersion; i <= ieMaxVersion; i++ ) {
			document.body.className += ' ielte' + i;
		}
	}

	// fix ios missing body click event (set event to all div elements which are children of body)
	// if ( isIos ) {
	// 	var bodyChildren = document.body.children;
	// 	for ( i = 0; i < bodyChildren.length; i++ ) {
	// 		if ( bodyChildren[ i ].tagName == 'DIV' ) {
	// 			bodyChildren[ i ].setAttribute( 'onclick', 'void(0);' );
	// 		}
	// 	}
	// }


	var AnalyzeBrowser = {
		isIos: isIos,
		iosVersion: iosVersion,
		iosFullVersion: iosFullVersion,
		isAndroid: isAndroid,
		isWin: isWin,
		isIe: isIe,
		ieVersion: ieVersion,
		isMobileIe: isMobileIe,
		isWinPhone: isWinPhone
	};

	// add browser data to utils to use global
	Utils.AnalyzeBrowser = AnalyzeBrowser;

} )( BSX_UTILS );
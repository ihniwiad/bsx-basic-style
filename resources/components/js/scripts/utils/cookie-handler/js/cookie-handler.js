( function( $, Utils ) {

	var CookieHandler = {};

	CookieHandler.setCookie = function( cookieName, cookieValue, expiresDays, path, sameSite ) {
	    var date = new Date();
	    var sameSiteDefault = 'strict';
	    date.setTime( date.getTime() + ( expiresDays * 24 * 60 * 60 * 1000 ) );
	    document.cookie = cookieName + '=' + cookieValue + '; ' + 'expires=' + date.toUTCString() + ( !! path ? '; path=' + path : '' ) + '; sameSite=' + ( !! sameSite ? sameSite : sameSiteDefault ) + ( sameSite == 'none' ? '; secure' : '' );
	};

	CookieHandler.getCookie = function( cookieName ) {
	    var searchStr = cookieName + '=';
	    var cookies = document.cookie.split( ';' );
	    for ( var i = 0; i < cookies.length; i++ ) {
	        var cookie = cookies[ i ];
	        while ( cookie.charAt( 0 ) == ' ' ) {
	        	cookie = cookie.substring( 1 );
	        };
	        if ( cookie.indexOf( searchStr ) == 0 ) {
	        	return cookie.substring( searchStr.length, cookie.length );
	        };
	    }
	    return '';
	};

	// add cookie handler to utils to use global
	Utils.CookieHandler = CookieHandler;

} )( jQuery, BSX_UTILS );

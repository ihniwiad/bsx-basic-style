/*
IE lte 11 handle overflow of -banner-inner within .banner-vh-{ ... }

<body class="ie ielte11">
	...
	<div class="banner-vh-1 d-flex align-items-center">
		<div class="banner-inner">
			...
	    </div>
	</div>
	...
</body>
*/

( function( $, Utils ) {

	//console.log( 'loaded ielte11-banner-height (not inited yet)' );

	// ie lte 11 fix: handle banner overflow (resize .banner-vh-{ ... } to minimum .banner-inner height)
	if ( Utils.$body.is( '.ielte11' ) ) {

		//console.log( 'init ielte11-banner-height' );

		var $banners = $( '[class*="banner-vh-"]' );

		$banners.each( function() {

			var $banner = $( this );
			var $bannerInner = $banner.children( '.banner-inner' );
			var $bannerInnerChildren = $bannerInner.children();

			Utils.$window.on( 'resize', function() {

				//console.log( 'resize' );

				// reset height (keep other element style)
				$banner.css( { height: '' } );

				var bannerHeight = parseInt( $banner.css( 'height' ) );
				var bannerPaddingY = parseInt( $banner.css( 'padding-top' ) ) + parseInt( $banner.css( 'padding-bottom' ) );

				// TODO: calculate height of .banner-inner children since .banner-inner will never overflow .banner

				var bannerInnerChildrenHeight = 0;
				var recentMarginBottom = 0;
				$bannerInnerChildren.each( function() {
					// TODO: margin top, height, margin-bottom
					$child = $( this );

					currentMarginTop = parseInt( $child.css( 'margin-top' ) );

					bannerInnerChildrenHeight += ( recentMarginBottom > currentMarginTop ) ? recentMarginBottom : currentMarginTop;
					bannerInnerChildrenHeight += parseInt( $child.css( 'height' ) );

					// remember
					recentMarginBottom = parseInt( $child.css( 'margin-bottom' ) );

					//console.log( '    item (mt: ' + currentMarginTop + ' h:' + parseInt( $child.css( 'height' ) ) + ' mb:' + recentMarginBottom + ')' );
				} );

				var bannerInnerPaddingY = parseInt( $bannerInner.css( 'padding-top' ) ) + parseInt( $bannerInner.css( 'padding-bottom' ) );

				var bannerInnerHeight = parseInt( $bannerInner.css( 'height' ) );

				// get banner padding y

				if ( bannerInnerChildrenHeight > bannerHeight - bannerPaddingY - bannerInnerPaddingY ) {

					//console.log( 'set inner height (bich:' + bannerInnerChildrenHeight + ' bh:' + bannerHeight + ' bih:' + bannerInnerHeight + ' bipy' + bannerInnerPaddingY + ')' );

					$banner.css( { height: ( bannerInnerChildrenHeight + bannerInnerPaddingY + bannerPaddingY ) + 'px' } );
				}
				else {

					//console.log( 'do nothing (bich:' + bannerInnerChildrenHeight + ' bh:' + bannerHeight + ' bih:' + bannerInnerHeight + ' bipy' + bannerInnerPaddingY + ')' );

				}

			} );

		} );

		Utils.$window.on( 'load', function() {
			Utils.$window.trigger( 'resize' );
		} );

	}

} )( jQuery, BSX_UTILS );

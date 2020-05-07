<?php 
	// template part of ###PROJECT_NAME### including atf style

	$isDevMode = false;
	if ( isset( $_GET[ 'dev' ] ) && $_GET[ 'dev' ] == '1' ) {
		$isDevMode = true;
	}

	if ( $isDevMode ) {
		print('
<style>
###ATF_STYLE###
</style>
		');
	}
	else {
		print('
<style>
###COMPRESSED_ATF_STYLE###
</style>
		');
	}
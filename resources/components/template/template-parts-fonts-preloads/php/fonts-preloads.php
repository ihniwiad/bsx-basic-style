<?php 
	// template part of ###PROJECT_NAME### including fonts preloads

	// NOTE: Pay attention to the order of included fonts since is important to pagespeed (check components order and components content). Do not include fonts which are not in use.

	// NOTE: The following line will be used by gulpfile as template.

	// ###TEMPLATE_BEGIN###<link rel="preload" href="' . $assetsPath . '###HREF###" as="font" type="font/###TYPE###" crossorigin>###TEMPLATE_END###

	print('
###FONTS_PRELOADS###
	');
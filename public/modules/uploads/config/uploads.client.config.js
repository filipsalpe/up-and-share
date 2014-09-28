'use strict';

// Configuring the Uploads module
angular.module('uploads').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Uploads', 'uploads', 'dropdown', '/uploads(/create)?');
		Menus.addSubMenuItem('topbar', 'uploads', 'List Uploads', 'uploads');
		Menus.addSubMenuItem('topbar', 'uploads', 'New Upload', 'uploads/create');
	}
]);

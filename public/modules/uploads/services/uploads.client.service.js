'use strict';

//Uploads service used to communicate Uploads REST endpoints
angular.module('uploads').factory('Uploads', ['$resource',
	function($resource) {
		return $resource('uploads/:uploadId', { uploadId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
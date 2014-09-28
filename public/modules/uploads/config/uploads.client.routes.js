'use strict';

//Setting up route
angular.module('uploads').config(['$stateProvider',
	function($stateProvider) {
		// Uploads state routing
		$stateProvider.
		state('listUploads', {
			url: '/uploads',
			templateUrl: 'modules/uploads/views/list-uploads.client.view.html'
		}).
		state('createUpload', {
			url: '/uploads/create',
			templateUrl: 'modules/uploads/views/create-upload.client.view.html'
		}).
		state('viewUpload', {
			url: '/uploads/:uploadId',
			templateUrl: 'modules/uploads/views/view-upload.client.view.html'
		}).
		state('editUpload', {
			url: '/uploads/:uploadId/edit',
			templateUrl: 'modules/uploads/views/edit-upload.client.view.html'
		});
	}
]);
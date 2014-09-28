'use strict';

// Uploads controller
angular.module('uploads').controller('UploadsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Uploads',
	function($scope, $stateParams, $location, Authentication, Uploads ) {
		$scope.authentication = Authentication;

		// Create new Upload
		$scope.create = function() {
			// Create new Upload object
			var upload = new Uploads ({
				name: this.name
			});

			// Redirect after save
			upload.$save(function(response) {
				$location.path('uploads/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Upload
		$scope.remove = function( upload ) {
			if ( upload ) { upload.$remove();

				for (var i in $scope.uploads ) {
					if ($scope.uploads [i] === upload ) {
						$scope.uploads.splice(i, 1);
					}
				}
			} else {
				$scope.upload.$remove(function() {
					$location.path('uploads');
				});
			}
		};

		// Update existing Upload
		$scope.update = function() {
			var upload = $scope.upload ;

			upload.$update(function() {
				$location.path('uploads/' + upload._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Uploads
		$scope.find = function() {
			$scope.uploads = Uploads.query();
		};

		// Find existing Upload
		$scope.findOne = function() {
			$scope.upload = Uploads.get({ 
				uploadId: $stateParams.uploadId
			});
		};
	}
]);
'use strict';

(function() {
	// Uploads Controller Spec
	describe('Uploads Controller Tests', function() {
		// Initialize global variables
		var UploadsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Uploads controller.
			UploadsController = $controller('UploadsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Upload object fetched from XHR', inject(function(Uploads) {
			// Create sample Upload using the Uploads service
			var sampleUpload = new Uploads({
				name: 'New Upload'
			});

			// Create a sample Uploads array that includes the new Upload
			var sampleUploads = [sampleUpload];

			// Set GET response
			$httpBackend.expectGET('uploads').respond(sampleUploads);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.uploads).toEqualData(sampleUploads);
		}));

		it('$scope.findOne() should create an array with one Upload object fetched from XHR using a uploadId URL parameter', inject(function(Uploads) {
			// Define a sample Upload object
			var sampleUpload = new Uploads({
				name: 'New Upload'
			});

			// Set the URL parameter
			$stateParams.uploadId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/uploads\/([0-9a-fA-F]{24})$/).respond(sampleUpload);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.upload).toEqualData(sampleUpload);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Uploads) {
			// Create a sample Upload object
			var sampleUploadPostData = new Uploads({
				name: 'New Upload'
			});

			// Create a sample Upload response
			var sampleUploadResponse = new Uploads({
				_id: '525cf20451979dea2c000001',
				name: 'New Upload'
			});

			// Fixture mock form input values
			scope.name = 'New Upload';

			// Set POST response
			$httpBackend.expectPOST('uploads', sampleUploadPostData).respond(sampleUploadResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Upload was created
			expect($location.path()).toBe('/uploads/' + sampleUploadResponse._id);
		}));

		it('$scope.update() should update a valid Upload', inject(function(Uploads) {
			// Define a sample Upload put data
			var sampleUploadPutData = new Uploads({
				_id: '525cf20451979dea2c000001',
				name: 'New Upload'
			});

			// Mock Upload in scope
			scope.upload = sampleUploadPutData;

			// Set PUT response
			$httpBackend.expectPUT(/uploads\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/uploads/' + sampleUploadPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid uploadId and remove the Upload from the scope', inject(function(Uploads) {
			// Create new Upload object
			var sampleUpload = new Uploads({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Uploads array and include the Upload
			scope.uploads = [sampleUpload];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/uploads\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleUpload);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.uploads.length).toBe(0);
		}));
	});
}());
angular.module('cornerstoneExample')
	.directive('cornerstonePreview', function($rootScope) {
		return {
			restrict: 'E',
			template: '<div></div>',
			replace: true,
			scope: {
				imageId: '@imageId',
			},
			link: function(scope, element, attributes) {
				var imageId = scope.imageId;
				var st = scope.imageId + '_load';

				var img = window.document.getElementById(st);
				if (img) {
					img.style.display = 'block';
				}

				element.bind("click", function(e) {
					scope.$apply;
				});

				var onLoadProgress = function(imageId, loaded) {
						var st = scope.imageId + '_progress';
						var span = window.document.getElementById(st);
						// Validate if async onProgress has the same imageId
						if (scope.imageId == loaded.imageId) {
							span.innerHTML = loaded.percentComplete + '%';
						}
					}
					// Catch the fired event CornerstoneImageLoadProgress
				$(cornerstone).on("CornerstoneImageLoadProgress", onLoadProgress);

				cornerstone.loadImage(imageId)
					.then(function(image) {
						document.getElementById(scope.imageId + '_load').style.display = 'none';
						document.getElementById(scope.imageId).appendChild(cornerstone.getImageCanvas(image, 85, 85));
					})
					.fail(function(err) {
						// Handle Failure request 
						// TODO - Better with Angular
						var i = document.getElementById(scope.imageId + '_spin');
						if (i) {
							i.className = 'fa fa-refresh loader'
						}
						var span = window.document.getElementById(scope.imageId + '_progress').style.display = 'none';
						var a = window.document.getElementById(scope.imageId + '_refresh');
						a.style = 'block'
						a.innerHTML = 'No encontrado';
						setTimeout(function() {
							a.innerHTML = 'Intentar nuevamente';
						}, 3000)
					});
			}
		};
	})

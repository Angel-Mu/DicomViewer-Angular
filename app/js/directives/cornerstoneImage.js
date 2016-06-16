angular.module('cornerstoneExample')
	.directive('cornerstoneImage', function($rootScope) {
		return {
			restrict: 'E',
			template: '<section style=\"padding: 0px 10px;\">\r\n\t<div id=\"dicomImage\" ng-model=\"selected_image\" oncontextmenu=\"return false\" unselectable=\"off\" onselectstart=\"return false;\" onmousedown=\"return false;\" style=\"width:475px;height:475px; margin:auto\">\r\n\t<\/div><div id=\"zoomValue\" style=\"position: absolute;bottom:5px; right:100px; color:#68C8C5;font-weight:bold;\">\r\nZoom:\r\n<\/div>\r\n<div id=\"wwwcValue\" style=\"position: absolute;bottom:5px; left:100px;color:#68C8C5;font-weight:bold;\">\r\nWW\/WC:\r\n<\/div>\r\n<\/section>',
			replace: true,
			require: 'ngModel',
			scope: {
				imageId: '@imageId',
				dataSet: '@'
			},
			link: function(scope, element, attributes) {
				scope.$watch('imageId', function(newValue) {
					var imageId = scope.imageId;
					var loader = window.document.getElementById(imageId + '_dicom');
					if (loader) {
						loader.style.display = 'block';
					}

					var cornerstoneContainer = element[0];
					var cornerstoneElement = cornerstoneContainer.querySelector("#dicomImage");

					// Adds values at the bottom
					function onViewportUpdated(e) {
						var viewport = cornerstone.getViewport(e.target)
						$('#wwwcValue').text("WW/WC: " + Math.round(viewport.voi.windowWidth) + "/" + Math.round(viewport.voi.windowCenter));
						$('#zoomValue').text("Zoom: " + viewport.scale.toFixed(2));
					};
					$('#dicomImage').on("CornerstoneImageRendered", onViewportUpdated);

					cornerstone.enable(cornerstoneElement);

					// Lets multitouch enabled
					var configuration = {
						testPointers: function(eventData) {
							return (eventData.numPointers >= 3);
						}
					};
					cornerstoneTools.panMultiTouch.setConfiguration(configuration);

					cornerstone.loadAndCacheImage(imageId)
						.then(function(image) {
							if (document.getElementById(imageId + '_dicom')) {
								document.getElementById(imageId + '_dicom').style.display = 'none';
							}
							cornerstone.displayImage(cornerstoneElement, image);
							// Remove empty canvas from DOM
							var el = document.getElementById("dicomImage");
							var el = document.getElementById("dicomImage").lastChild;
							var div = document.getElementById("dicomImage");
							var nodelist = div.getElementsByTagName("CANVAS");
							if ((el.nodeName == '<canvas>' || el.nodeName == 'CANVAS') && nodelist.length > 1) {
								for (var i = nodelist.length; i > 1; i--) {
									document.getElementById("dicomImage").removeChild(nodelist[i - 1]);
								}
							}

							// Enable touch input
							cornerstoneTools.touchInput.enable(cornerstoneElement);
							// Enable all tools we want to use with this element
							cornerstoneTools.zoomTouchPinch.activate(cornerstoneElement);
							// cornerstoneTools.rotateTouch.activate(cornerstoneElement);
							cornerstoneTools.wwwcTouchDrag.activate(cornerstoneElement);
							cornerstoneTools.panMultiTouch.activate(cornerstoneElement);

							// Enable mouse input
							cornerstoneTools.mouseInput.enable(cornerstoneElement);
							// Enable mouse input
							cornerstoneTools.mouseWheelInput.enable(cornerstoneElement);
							// Enable all tools we want to use with this element
							cornerstoneTools.wwwc.activate(cornerstoneElement, 1); // ww/wc is the default tool for left mouse button
							cornerstoneTools.pan.activate(cornerstoneElement, 2); // pan is the default tool for middle mouse button
							cornerstoneTools.zoom.activate(cornerstoneElement, 4); // zoom is the default tool for right mouse button
							cornerstoneTools.zoomWheel.activate(cornerstoneElement); // zoom is the default tool for middle mouse wheel
							var jsonArray =   [];
							var dataSet = image.data;
							dumpDataSet(dataSet, jsonArray);
							// scope.dataSet = jsonArray;
							// scope.$apply();
						})
						.fail(function(err) {
							// Emits an event listened on controller to handle error
							$rootScope.$emit('dicom_not_found', scope.imageId);
							// Handle Failure request 
							return;
						});
				});
			}
		};
	});
// Array.prototype.forEach.call(element, function(node) {
// 	node.parentNode.removeChild(node);
// });

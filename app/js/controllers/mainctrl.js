angular.module("cornerstoneExample")
	.controller('MainCtrl', function($scope, $rootScope) {

		$scope.selected_image = "";
		var wadouri = 'wadouri://';
		$scope.params = {
			enable_dicom: false
		};

		// HARDCODE - data
		$scope.data = {
			_id: "570c210bae27478376a3a17e",
			fullname: "MONTIEL HERNANDEZ MARIA DEL CARMEN",
			accession_number: "26AN10506",
			gender: "FEMALE",
			transfers: [{
				unit_identification: {
					truck_plate: "Prueba",
					truck: "CM"
				},
				patient: {
					given_name: "MARIA DEL CARMEN",
					surname_father: "MONTIEL",
					surname_mother: "HERNANDEZ",
					age: "62",
					birthdate: "1954-03-04T18:00:00.000Z",
					fullname: "MONTIEL HERNANDEZ MARIA DEL CARMEN",
					accession_number: "26AN10506"
				},
				study_info: {
					study_datetime: "2016-04-11T17:00:00.000Z",
					technique: "Screening-Bilateral Mammography",
					type: "MG"
				},
				gateway_info: {
					path: "http://localhost/RestService/RestServiceImpl.svc/xml/C|RouterPacs|26AN10506|26AN10506.LCC2.jpeg|26AN10506.LMLO3.jpeg|26AN10506.RCC1.jpeg|26AN10506.RMLO4.jpeg",
					transfer_is_complete: true,
					total_images_sended: 7,
					total_images: 7,
					bytes_sended_to_pacs: 190863852,
					bytes_total_size: 190863852,
					sended_to_pacs_datetime: "2016-04-12T14:43:59.622Z",
					received_datetime: "2016-04-12T07:08:28.460Z"
				},
				creation_date: "2016-04-13T02:41:43.480Z",
				putpatient: false,
				attempts: 0,
				active: true,
				__v: 0,
				radiologist_fullname: "ISAMAR",
				radiologist: "56c4c09b4a1310d99f000007",
				_id: "20160812020828463"
			}],
			nationality: "MX",
			update_date: "2016-04-20T14:01:10.473Z",
			creation_date: "2016-04-11T22:11:23.968Z",
			relationship: "0",
			surname_mother: "HERNANDEZ",
			surname_father: "MONTIEL",
			given_name: "MARIA DEL CARMEN",
			type_of_beneficiary: "B"
		}

		$scope.selected_image = "";
		var wadouri = 'wadouri://';
		// HARDCODE - ID
		// var patientId = $stateParams.patientId || '570c210bae27478376a3a17e';
		var patientId = '570c210bae27478376a3a17e';

		$rootScope.$on('dicom_not_found', function(e, str) {
			for (var i = 0; i < $scope.imagesList.length; i++) {
				if (str === $scope.imagesList[i].image_id) {
					$scope.imagesList[i].exists = false;
				} else {
					if ($scope.imagesList[i].exists != false) {
						$scope.selected_image = $scope.imagesList[i].image_id;
						$scope.$apply();
						break;
					}
				}
			}
		});

		var purgeCache = function() {
			// Clears browser cache
			cornerstone.imageCache.purgeCache();
		}
		window.onbeforeunload = purgeCache;

		// 5730a527d4b3c13be40743ee
		// 26AN10705
		// "192.34.63.214/static|26AN10505.LCC.dcm|26AN10505.LMLO.dcm|26AN10505.RCC.dcm|26AN10505.RMLO.dcm",

		$scope.reload = function(image) {
			var imageId = image.image_id;
			var i = document.getElementById(image.image_id + '_spin');
			var className = i.className;
			i.className = className + ' fa-spin'
			image.reload = true;
			document.getElementById(image.image_id + '_refresh').style.display = 'none';
			var span = document.getElementById(image.image_id + '_progress');
			console.log(span);
			span.style.display = 'inline-block';
			span.innerHTML = '0%'
			setTimeout(function() {
				delete image.reload;
				image.image_id = imageId;
				$scope.$apply();
			}, 1000);
		}

		$scope.getPatient = function() {
			$scope.diagnosis = {};
			$scope.RadiologistDiagnosis = {};
			// $scope.patientId = $scope.patient._id;

			// GetPatient hardcode 
			// PatientServices.getPatientByIdPop(function(err, result) {
			// 	if (err) alert("No fue posible cargar información del paciente. Favor de intentar más tarde.");
			// 	else {
			// console.log(result)
			$scope.data = $scope.data;
			var splited_objects = $scope.data.transfers[0].gateway_info.path.split('|');
			$scope.patient = $scope.data.transfers[0].patient;
			$scope.study_info = $scope.data.transfers[0].study_info;
			var base_url = splited_objects[0].split('http://')[1];
			base_url = base_url.split('/')[0];
			base_url = base_url + '/CarpetaPrueba/' + splited_objects[2];
			// console.log(splited_objects)
			base_url = base_url.replace('localhost', 'pacs.sicem.mx');
			// console.log(base_url)
			var uri = wadouri + base_url + '/';
			$scope.imagesList = [];
			for (var i = 3; i < splited_objects.length; i++) {
				var s = splited_objects[i].split('.');
				s = s[0] + '.' + s[1] + '.jpeg';
				$scope.imagesList.push({ image_id: uri + s, name: splited_objects[i] });
				if (i == 3) {
					$scope.selected_image = uri + s;
				}
			}
			// }
			// $scope.finish_loading();
			// }, patientId);
		}

		$scope.start_loading = function() {
			setTimeout(function() {
				$loading.start('loading');

			}, 1);

		};

		$scope.finish_loading = function(name) {
			setTimeout(function() {
				$loading.finish('loading');
			}, 1);
		};

		$scope.changeSelected = function(image_id) {
			var element = $('#dicomImage').get(0);
			var canvas = $('#dicomImage canvas').get(0);
			var enabledElement = cornerstone.getEnabledElement(element);
			var viewport = cornerstone.getDefaultViewport(canvas, enabledElement.image);
			cornerstone.setViewport(element, viewport);
			$scope.selected_image = image_id;
			console.log("------")
		}

		function init() {
			// $scope.start_loading();
			$scope.getPatient();
			// var splited_objects = $scope.data.gateway_info.path.split('|')
			// var uri = wadouri + splited_objects[0] + '/';
			// $scope.imagesList = [];
			// for (var i = 1; i < splited_objects.length; i++) {
			// 	$scope.imagesList.push({ image_id: uri + splited_objects[i], name: splited_objects[i] });
			// 	if (i == 1) {
			// 		$scope.selected_image = uri + splited_objects[i];
			// 	}
			// }
			// $scope.patient = $scope.data.patient;
			// $scope.study_info = $scope.data.study_info;
		}

		init();

		function disableAllTools() {
			var cornerstoneElement = $('#dicomImage')[0];
			cornerstoneTools.wwwc.disable(cornerstoneElement);
			cornerstoneTools.pan.activate(cornerstoneElement, 2); // 2 is middle mouse button
			cornerstoneTools.zoom.activate(cornerstoneElement, 4); // 4 is right mouse button
			cornerstoneTools.probe.deactivate(cornerstoneElement, 1);
			cornerstoneTools.length.deactivate(cornerstoneElement, 1);
			cornerstoneTools.ellipticalRoi.deactivate(cornerstoneElement, 1);
			cornerstoneTools.rectangleRoi.deactivate(cornerstoneElement, 1);
			cornerstoneTools.stackScroll.deactivate(cornerstoneElement, 1);
			cornerstoneTools.wwwcTouchDrag.deactivate(cornerstoneElement);
			cornerstoneTools.zoomTouchDrag.deactivate(cornerstoneElement);
			cornerstoneTools.panTouchDrag.deactivate(cornerstoneElement);
			cornerstoneTools.stackScrollTouchDrag.deactivate(cornerstoneElement);
		}

		$scope.activateWWWC = function() {
			var element = $('#dicomImage')[0];
			disableAllTools();
			cornerstoneTools.wwwc.activate(element, 1);
			cornerstoneTools.wwwcTouchDrag.activate(element);
		}

		$scope.toggleInvert = function() {
			var element = $('#dicomImage')[0];
			disableAllTools();
			var viewport = cornerstone.getViewport(element);
			if (viewport.invert === true) {
				viewport.invert = false;
			} else {
				viewport.invert = true;
			}
			cornerstone.setViewport(element, viewport);
		}

		$scope.activateZoom = function() {
			var element = $('#dicomImage')[0];
			disableAllTools();
			cornerstoneTools.zoom.activate(element, 5); // 5 is right mouse button and left mouse button
			cornerstoneTools.zoomTouchDrag.activate(element);
		}

		$scope.activateMove = function() {
			var element = $('#dicomImage')[0];
			disableAllTools();
			cornerstoneTools.pan.activate(element, 3); // 3 is middle mouse button and left mouse button
			cornerstoneTools.panTouchDrag.activate(element);
		}
	})

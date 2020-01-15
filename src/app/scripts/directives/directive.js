(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name app.directives:fs-address
     * @restrict E
     * @param {object} fs-options Options to configure directive.
     * @param {array} fs-options.countries List of all possible countries
     * @param {boolean} fs-options.disabled Sets the disabled attribute on the elements
     * @param {boolean} fs-options.map Show or hide map
     * @param {array} fs-options.domestics An array of country codes that are to be placed at the top of the countries dropdown
     * @param {object} fs-options.address address field options
                <ul>
                    <li><label>required</label> Required validation rule</li>
                    <li><label>name</label> Name used to map to the address model</li>
                </ul>
     * @param {object} fs-options.address2 address2 field options. If false - field not showing
                <ul>
                    <li><label>required</label> Required validation rule</li>
                    <li><label>name</label> Name used to map to the address model</li>
                </ul>
     * @param {object} fs-options.city city field options
                <ul>
                    <li><label>required</label> Required validation rule</li>
                    <li><label>name</label> Name used to map to the address model</li>
                </ul>
     * @param {object} fs-options.region region field options
                <ul>
                    <li><label>required</label> Required validation rule</li>
                    <li><label>name</label> Name used to map to the address model</li>
                </ul>
     * @param {object} fs-options.zip zip field options
                <ul>
                    <li><label>required</label> Required validation rule</li>
                    <li><label>name</label> Name used to map to the address model</li>
                </ul>
     * @param {object} fs-options.country country field options
                <ul>
                    <li><label>required</label> Required validation rule</li>
                </ul>
     * @param {object} fs-address Data for showing. Possible fields:
                <ul>
                    <li>address</li>
                    <li>address2</li>
                    <li>city</li>
                    <li>country</li>
                    <li>region</li>
                    <li>zip</li>
                    <li>lat</li>
                    <li>lng</li>
                </ul>
    */
    angular.module('fs-angular-address',['fs-angular-country','fs-angular-util','fs-angular-array','uiGmapgoogle-maps'])
    .directive('fsAddress', function(COUNTRIES, $filter, uiGmapIsReady, $q, fsUtil, fsArray) {
        return {
            templateUrl: 'views/directives/address.html',
            restrict: 'E',
            scope: {
              options: '=?fsOptions',
              address: '=fsAddress'
            },

            link: function($scope, element) {
            	angular.forEach(element[0].querySelectorAll('.address-input'),function(input) {
            		angular.element(input).data('required-scope',$scope);
            	});
            },
            controller: function($scope, uiGmapIsReady) {

                try {
                    var g = google;
                } catch(e) {
                    throw 'Google Map API not found. Include <script type="text/javascript" src="https://maps.google.com/maps/api/js?key=AIzaSyDfOOiu1FrPzHkxMbL3ItZLeSTZuwShVFQ"></script>';
                }

                $scope.options = $scope.options || {};
                $scope.options = angular.extend({},{    cords: {    lat: 43.6379967,
                                                                    lng: -79.3819992 },
                                                        address2: true,
                                                        disabled: false,
                                                        domestics: ['CA','US'],
                                                        map: true },$scope.options);

                $scope.address = $scope.address || {};
                $scope.address.lat = $scope.address.lat || '';
                $scope.address.lng = $scope.address.lng || '';
                $scope.regions = [];
                $scope.countries = { 	domestic: [],
                						international: [] };
                $scope.zipLabel = '';
                $scope.regionLabel = '';
                $scope.center = null;
                $scope.searched = false;
                $scope.searchedAddress = '';
                $scope.recenter = recenter;
                $scope.search = search;
                $scope.changeCountry = changeCountry;
                $scope.map = { center: { latitude: $scope.address.lat || $scope.options.cords.lat, longitude: $scope.address.lng || $scope.options.cords.lng }, zoom: 14, control:{} };
                $scope.mapOptions = angular.merge({ scrollwheel: false,
                                                    streetViewControl: false,
                                                    mapTypeControlOptions: { mapTypeIds: [] }},$scope.mapOptions || {});
                $scope.marker = {   id: 0,
                                    coords: { latitude: $scope.address.lat, longitude: $scope.address.lng },
                                    options: { draggable: true },
                                	control: {},
                                	events: {
							        	dragend: function(marker) {
								        	$scope.address.lat = marker.getPosition().lat();
								        	$scope.address.lng = marker.getPosition().lng();
								        }
							        }};

                angular.forEach(['address','address2','city','region','country','zip'],function(item) {

                	var option = $scope.options[item];

                    if(fsUtil.isBoolean(option)) {
                        option = { show: $scope.options[item] };
                    }

                    if(!fsUtil.isObject($scope.options[item])) {
                        option = {};
                    }

                    if(!option.id) {
                        option.id = 'input_' + fsUtil.guid();
                    }

                    if(!option.name) {
                        option.name = item;
                    }

                    $scope.options[item] = option;
                });

                var countries = [];
                if($scope.options.countries) {
                    angular.forEach($scope.options.countries,function(code) {

                        var country = $filter('filter')(COUNTRIES,{ code: code },true)[0];

                        if(country) {
                            countries.push(country);
                        }
                    });

                } else {
                    countries = angular.copy(COUNTRIES);
                }

                if($scope.options.domestics) {

                	$scope.countries.international = countries;

                	for(var i=$scope.options.domestics.length-1;i>=0;i--) {

                		var item = fsArray.remove($scope.countries.international,{ code: $scope.options.domestics[i] })[0];

                		if(item) {
                			$scope.countries.domestic.unshift(item);
	                	}
                	}

                } else {
                	$scope.countries.domestic = countries;
                }

                if(!$scope.address.country && $scope.countries.domestic[0]) {
                    $scope.address.country = $scope.countries.domestic[0].code;
                }

                if(	$scope.address[$scope.options.address.name] ||
                    $scope.address[$scope.options.address2.name] ||
                    $scope.address[$scope.options.city.name] ||
                    $scope.address[$scope.options.region.name] ||
                    $scope.address[$scope.options.zip.name]) {
                		$scope.address.lat = 9999;
                		$scope.address.lng = 9999;
                		search();
                }

                $scope.$watch('address.country',function(country) {
                    var country = $filter('filter')(COUNTRIES,{ code: country },true)[0];
                    $scope.regions = country ? country.regions : [];
                    $scope.zipLabel = country && country.code=='CA' ? 'Postal Code' : 'Zip';
                    $scope.regionLabel = country && country.code=='CA' ? 'Province' : 'State';
                });

               	function recenter() {

                	if($scope.center) {
	                	$scope.map.control.refresh({ latitude: $scope.center.lat, longitude: $scope.center.lng });

		                $scope.marker.coords.latitude = $scope.center.lat;
		                $scope.marker.coords.longitude = $scope.center.lng;
		            }
                }

                function changeCountry() {
                    $scope.address[$scope.options.region.name] = null;
                    search();
                }

                function search() {
                    var geocoder = new google.maps.Geocoder();
                    var country = $filter('filter')(COUNTRIES,{ code: $scope.address.country },true)[0] || {};
                    var parts = [	$scope.address[$scope.options.address.name],
                    				$scope.address[$scope.options.city.name],
                    				$scope.address[$scope.options.region.name],
                    				country.name];

                    parts = parts.filter(function(value){ return fsUtil.string(value).trim() });

                    $scope.searchedAddress = parts.join(', ');
                    geocoder.geocode( { 'address': $scope.searchedAddress  }, function(results, status) {

                    	$scope.$apply(function() {
                    		$scope.searched = true;
	                        if(status == google.maps.GeocoderStatus.OK && results.length > 0) {
	                            var location = results[0].geometry.location;
	                            var control = $scope.map.control;

	                            $scope.address.lat = location.lat();
	                            $scope.address.lng = location.lng();

	                            $scope.center = { lat: location.lat(), lng: location.lng() };

	                           	control.refresh({ latitude: location.lat(), longitude: location.lng() });

	                           	if($scope.marker.control.getGMarkers) {
									var marker = $scope.marker.control.getGMarkers()[0];
									if(control.getGMap().getBounds().contains(marker.getPosition())!==true) {
			                            $scope.marker.coords.latitude = location.lat();
		    		                    $scope.marker.coords.longitude = location.lng();
		        		            }
		        		        }
	                        } else {
	                        	$scope.address.lat = null;
	                        	$scope.address.lng = null;
	                        }
	                    });
                    });
                }

                // Used to wait for directives to finish augmenting control objects.
                // Do not use for that purposes uiGmapGoogleMapApi.
                uiGmapIsReady.promise(1).then(function(instances) {
                    google.maps.event.trigger($scope.map.control.getGMap(), 'resize');
                });
            }
        };
    })
    .directive('fsAddressFormat', function(COUNTRIES, $filter, uiGmapIsReady, $q, fsUtil, fsArray) {
        return {
            templateUrl: 'views/directives/addressformat.html',
            restrict: 'E',
            scope: {
              address: '=fsAddress',
              options: '=?fsOptions'
            },
            controller: function($scope) {

            	$scope.$watch('options',function(options) {
            		$scope.options = options || {}
	                angular.forEach(['address','address2','city','region','country','zip'],function(item) {

	       				if(!fsUtil.isObject($scope.options[item])) {
	                        $scope.options[item] = {};
	                    }

	                    if(!$scope.options[item].name) {
	                        $scope.options[item].name = item;
	                    }
	                });
	            });
           	}
    }});

    var head = document.getElementsByTagName('head')[0];
    // Save the original method
    var insertBefore = head.insertBefore;
    // Replace it!
    head.insertBefore = function (newElement, referenceElement) {
        if (newElement.href && newElement.href.indexOf('https://fonts.googleapis.com/css?family=Roboto') === 0) {
            return;
        }

        insertBefore.call(head, newElement, referenceElement);
    };
})();
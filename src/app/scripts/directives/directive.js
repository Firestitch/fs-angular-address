(function () {
    'use strict';

    angular.module('fs-angular-address',['fs-angular-country','uiGmapgoogle-maps'])
    .directive('fsAddress', function(COUNTRIES, $filter, uiGmapIsReady, $q) {
        return {
            templateUrl: 'views/directives/address.html',
            restrict: 'E',
            scope: {
              options: '=?fsOptions',
              address: '=fsAddress'
            },

            link: function($scope, element, attrs, ctrl) {

                $scope.options.cords = { lat: 43.6379967, lng: -79.3819992 };
               
                $scope.address.lat = $scope.address.lat || '';
                $scope.address.lng = $scope.address.lng || '';
                $scope.regions = [];
                $scope.countries = [];
                $scope.zipLabel = '';
                $scope.regionLabel = '';                
                $scope.marker = {   id: Date.now(), 
                                    latitude: $scope.address.lat,
                                    longitude: $scope.address.lng,
                                    options: { draggable: true }};                                 
                $scope.markers = [$scope.marker];
                $scope.map = { center: { latitude: $scope.address.lat || $scope.options.cords.lat, longitude: $scope.address.lng || $scope.options.cords.lng }, zoom: 14, control:{} };
                $scope.mapOptions = angular.merge({ scrollwheel: false, 
                                                    streetViewControl: false, 
                                                    mapTypeControlOptions: { mapTypeIds: [] }},$scope.mapOptions || {});                

                if($scope.options.countries) {
                    angular.forEach($scope.options.countries,function(code) {
                            
                        var country = $filter('filter')(COUNTRIES,{ code: code },true)[0];

                        if(country) {
                            $scope.countries.push(country);  
                        }
                    });

                } else {
                    $scope.countries = COUNTRIES;
                }

                if(!$scope.address.country && $scope.countries[0]) {
                    $scope.address.country = $scope.countries[0].code;
                    $scope.regions = $scope.countries[0].regions;
                }

                $scope.$watch('address.country',function(country) {
                    var country = $filter('filter')(COUNTRIES,{ code: country },true)[0];
                    $scope.regions = country ? country.regions : [];
                    $scope.zipLabel = country && country.code=='CA' ? 'Postal Code' : 'Zip';
                    $scope.regionLabel = country && country.code=='CA' ? 'Province' : 'State';
                });

                $scope.populateSearch = function() {

                    var address = $scope.address;
                    var populated = !!(address.address && address.city && address.region && address.zip && address.country) || address.lat || address.lng;

                    if((!$scope.address.lat || !$scope.address.lng) && populated) {
                        $scope.search()
                        .then(function() {
                            $scope.populated = true;
                        });
                    }
                }

                $scope.search = function() {

                    var defer = $q.defer();
                    var geocoder = new google.maps.Geocoder();
                    var address = $scope.address;                    
                    var parts = [address.address,address.address2,address.city,address.region,address.zip];
                    var country = $filter('filter')(COUNTRIES,{ code: address.country },true)[0];

                    if(country) {
                        parts.push(country.name);
                    }

                    geocoder.geocode( { 'address': parts.join(' ,')  }, function(results, status) {
                       
                        if (status == google.maps.GeocoderStatus.OK && results.length > 0) {

                            var location = results[0].geometry.location;
                            $scope.address.lat = location.lat();
                            $scope.address.lng = location.lng();                            
                            $scope.map.control.refresh({ latitude: $scope.address.lat, longitude: $scope.address.lng });
                            
                            $scope.marker.latitude = $scope.address.lat;
                            $scope.marker.longitude = $scope.address.lng;
                            defer.resolve();  
                        }
                    });
                    
                    return defer.promise;
                }
            }  
        };
    });

    var head = document.getElementsByTagName('head')[0];
    // Save the original method
    var insertBefore = head.insertBefore;
    // Replace it!
    head.insertBefore = function (newElement, referenceElement) {
        if (newElement.href && newElement.href.indexOf('https://fonts.googleapis.com/css?family=Roboto') === 0) {

            console.info('Prevented Roboto from loading!');
            return;
        }

        insertBefore.call(head, newElement, referenceElement);
    };
})();

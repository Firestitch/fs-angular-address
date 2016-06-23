
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

            controller: function($scope, uiGmapIsReady) {

                try {
                    var g = google;
                } catch(e) {
                    throw 'Google Map API not found. Include <script type="text/javascript" src="https://maps.google.com/maps/api/js?sensor=false"></script>';
                }

                $scope.options = $scope.options || {};                
                $scope.options = angular.extend({},{    cords: {    lat: 43.6379967, 
                                                                    lng: -79.3819992 },
                                                        address2: true,
                                                        map: true },$scope.options);
     
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

                angular.forEach(['address','address2','city','region','country','zip'],function(item) {
                 
                    if($scope.options[item]===false) {
                        $scope.options[item] = { show: false };
                    }

                    if($scope.options[item]===undefined) {
                        $scope.options[item] = {};
                    }

                    if(!$scope.options[item].name) {
                        $scope.options[item].name = 'input_' + guid();
                    }
                });

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
                    var populated = !!((address.address && address.city && address.region && address.zip && address.country) || address.lat || address.lng);

                    if(!$scope.populated) {
                        $scope.search()
                        .then(function() {
                            
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
                };

                // Used to wait for directives to finish augmenting control objects.
                // Do not use for that purposes uiGmapGoogleMapApi.
                uiGmapIsReady.promise(1).then(function(instances) {
                    google.maps.event.trigger($scope.map.control.getGMap(), 'resize');
                });

                function guid() {
                    return 'xxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
                        return v.toString(16);
                    });
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


angular.module('fs-angular-address').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/directives/address.html',
    "<div layout=\"row\">\r" +
    "\n" +
    "    <md-input-container flex>\r" +
    "\n" +
    "        <label>Address</label>\r" +
    "\n" +
    "        <input ng-model=\"address.address\" ng-change=\"populateSearch()\" ng-model-options=\"{debounce: 400}\" ng-required=\"options.address.required\" name=\"{{options.address.name}}\">\r" +
    "\n" +
    "    </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <md-input-container flex ng-show=\"options.address2.show\">\r" +
    "\n" +
    "        <label>Address 2</label>\r" +
    "\n" +
    "        <input ng-model=\"address.address2\" ng-change=\"populateSearch()\" ng-model-options=\"{debounce: 400}\" ng-required=\"options.address2.required\" name=\"{{options.address2.name}}\">\r" +
    "\n" +
    "    </md-input-container>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div layout=\"row\">\r" +
    "\n" +
    "    <md-input-container flex>\r" +
    "\n" +
    "        <label>City</label>\r" +
    "\n" +
    "        <input ng-model=\"address.city\" ng-change=\"populateSearch()\" ng-model-options=\"{debounce: 400}\" ng-required=\"options.city.required\"  name=\"{{options.city.name}}\">\r" +
    "\n" +
    "    </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <md-input-container flex>\r" +
    "\n" +
    "        <label>{{zipLabel}}</label>\r" +
    "\n" +
    "        <input ng-model=\"address.zip\" ng-change=\"populateSearch()\" ng-model-options=\"{debounce: 400}\" ng-required=\"options.zip.required\" name=\"{{options.zip.name}}\">\r" +
    "\n" +
    "    </md-input-container>\r" +
    "\n" +
    "</div>    \r" +
    "\n" +
    "\r" +
    "\n" +
    "<div layout=\"row\">\r" +
    "\n" +
    "    <md-input-container flex=\"50\">\r" +
    "\n" +
    "        <label>Country</label>\r" +
    "\n" +
    "        <md-select ng-model=\"address.country\" ng-change=\"populateSearch()\" ng-required=\"options.country.required\" name=\"{{options.country.name}}\">\r" +
    "\n" +
    "            <md-option ng-repeat=\"country in countries\" value=\"{{country.code}}\">\r" +
    "\n" +
    "                {{country.name}}\r" +
    "\n" +
    "            </md-option>\r" +
    "\n" +
    "        </md-select>\r" +
    "\n" +
    "    </md-input-container>  \r" +
    "\n" +
    "\r" +
    "\n" +
    "    <md-input-container flex>\r" +
    "\n" +
    "        <label>{{regionLabel}}</label>\r" +
    "\n" +
    "        <md-select ng-model=\"address.region\" ng-change=\"populateSearch()\" ng-required=\"options.region.required\" name=\"{{options.region.name}}\">\r" +
    "\n" +
    "            <md-option ng-repeat=\"region in regions\" value=\"{{region.code}}\">\r" +
    "\n" +
    "                {{region.name}}\r" +
    "\n" +
    "            </md-option>\r" +
    "\n" +
    "        </md-select>\r" +
    "\n" +
    "    </md-input-container>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"map-container\" ng-show=\"options.map\">\r" +
    "\n" +
    "    <md-button class=\"center\"ng-show=\"address.lat && address.lng\" ng-click=\"search()\">Center Map using Address</md-button>\r" +
    "\n" +
    "    <ui-gmap-google-map center=\"map.center\" zoom=\"13\" options=\"mapOptions\" control=\"map.control\" events=\"mapOptions.events\">\r" +
    "\n" +
    "        <ui-gmap-markers models=\"markers\" coords=\"'self'\" options=\"'self'\"/></ui-gmap-google-map>\r" +
    "\n" +
    "    </ui-gmap-google-map>\r" +
    "\n" +
    "    <div class=\"address-incomplete\" layout=\"row\" layout-align=\"center center\" ng-hide=\"address.lat && address.lng\"><div>Please populate the address above to locate it on the map</div></div>\r" +
    "\n" +
    "</div>"
  );

}]);

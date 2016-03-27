
(function () {
    'use strict';

    angular.module('fs-angular-address',['uiGmapgoogle-maps'])
    .directive('fsAddress', function(COUNTRIES, $filter, uiGmapIsReady, $q) {
        return {
            templateUrl: 'views/directives/address.html',
            restrict: 'E',
            scope: {
              options: '=?fsOptions',
              address: '=?fsAddress'
            },

            link: function($scope, element, attrs, ctrl) {
                                            
                $scope.address = $scope.address || {};
                $scope.address.lat = $scope.address.lat || '';
                $scope.address.lng = $scope.address.lng || '';
                $scope.countries = [];
                $scope.zipLabel = '';
                $scope.regionLabel = '';                
                $scope.marker = {   id: Date.now(), 
                                    latitude: $scope.address.lat,
                                    longitude: $scope.address.lng,
                                    options: { draggable: true }, 
                                    events: { drag: function(marker) {
                                        //$scope.address.lat = marker.latitude;
                                        //$scope.address.lng = marker.longitude;  
                                    }}};                                 
                $scope.markers = [$scope.marker];
                $scope.map = { center: { latitude: 43.6479967, longitude: -79.3798992 }, zoom: 14, control:{} };
                $scope.populated = $scope.address.lat || $scope.address.lng;
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

                $scope.country = {};
                $scope.regions = [];

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

                    if(!$scope.populated && populated) {
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
})();

angular.module('fs-angular-address').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/directives/address.html',
    "<div layout=\"row\">\r" +
    "\n" +
    "    <md-input-container flex=\"50\">\r" +
    "\n" +
    "        <label>Address</label>\r" +
    "\n" +
    "        <input ng-model=\"address.address\" ng-blur=\"populateSearch()\">\r" +
    "\n" +
    "    </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <md-input-container flex>\r" +
    "\n" +
    "        <label>Address 2</label>\r" +
    "\n" +
    "        <input ng-model=\"address.address2\" ng-blur=\"populateSearch()\">\r" +
    "\n" +
    "    </md-input-container>\r" +
    "\n" +
    "</div>\r" +
    "\n" +
    "<div layout=\"row\">\r" +
    "\n" +
    "    <md-input-container flex=\"50\">\r" +
    "\n" +
    "        <label>City</label>\r" +
    "\n" +
    "        <input ng-model=\"address.city\" ng-blur=\"populateSearch()\">\r" +
    "\n" +
    "    </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <md-input-container flex>\r" +
    "\n" +
    "        <label>{{zipLabel}}</label>\r" +
    "\n" +
    "        <input name=\"zip\" ng-model=\"address.zip\" ng-blur=\"populateSearch()\">\r" +
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
    "        <label>{{regionLabel}}</label>\r" +
    "\n" +
    "        <md-select ng-model=\"address.region\" ng-change=\"populateSearch()\">\r" +
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
    "\r" +
    "\n" +
    "    <md-input-container flex>\r" +
    "\n" +
    "        <label>Country</label>\r" +
    "\n" +
    "        <md-select ng-model=\"address.country\" ng-change=\"populateSearch()\">\r" +
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
    "</div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "<div class=\"map-container\">\r" +
    "\n" +
    "    <md-button class=\"center\"ng-show=\"populated\" ng-click=\"search()\">Center Map using Address</md-button>\r" +
    "\n" +
    "    <ui-gmap-google-map center=\"map.center\" zoom=\"13\" options=\"mapOptions\" control=\"map.control\" events=\"mapOptions.events\">\r" +
    "\n" +
    "        <ui-gmap-markers models=\"markers\" coords=\"'self'\" options=\"'self'\"/></ui-gmap-google-map>\r" +
    "\n" +
    "    </ui-gmap-google-map>\r" +
    "\n" +
    "    <div class=\"address-incomplete\" layout=\"row\" layout-align=\"center center\" ng-hide=\"populated\"><div>Please populate the address above to locate it on the map</div></div>\r" +
    "\n" +
    "</div>\r" +
    "\n"
  );

}]);

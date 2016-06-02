
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

                    //if((!$scope.address.lat || !$scope.address.lng) && populated) {
                    if(!$scope.populated) {
                        $scope.search()
                        .then(function() {
                            
                        });
                    }
                    //}
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
    "<div layout=\"row\">\n" +
    "    <md-input-container flex>\n" +
    "        <label>Address</label>\n" +
    "        <input ng-model=\"address.address\" ng-change=\"populateSearch()\" ng-model-options=\"{debounce: 400}\" ng-required=\"options.address.required\">\n" +
    "    </md-input-container>\n" +
    "\n" +
    "    <md-input-container flex ng-show=\"options.address2\">\n" +
    "        <label>Address 2</label>\n" +
    "        <input ng-model=\"address.address2\" ng-change=\"populateSearch()\" ng-model-options=\"{debounce: 400}\" ng-required=\"options.address2.required\">\n" +
    "    </md-input-container>\n" +
    "</div>\n" +
    "<div layout=\"row\">\n" +
    "    <md-input-container flex>\n" +
    "        <label>City</label>\n" +
    "        <input ng-model=\"address.city\" ng-change=\"populateSearch()\" ng-model-options=\"{debounce: 400}\" ng-required=\"options.city.required\">\n" +
    "    </md-input-container>\n" +
    "\n" +
    "    <md-input-container flex>\n" +
    "        <label>{{zipLabel}}</label>\n" +
    "        <input name=\"zip\" ng-model=\"address.zip\" ng-change=\"populateSearch()\" ng-model-options=\"{debounce: 400}\" ng-required=\"options.zip.required\">\n" +
    "    </md-input-container>\n" +
    "</div>    \n" +
    "\n" +
    "<div layout=\"row\">\n" +
    "    <md-input-container flex=\"50\">\n" +
    "        <label>Country</label>\n" +
    "        <md-select ng-model=\"address.country\" ng-change=\"populateSearch()\" ng-required=\"options.country.required\">\n" +
    "            <md-option ng-repeat=\"country in countries\" value=\"{{country.code}}\">\n" +
    "                {{country.name}}\n" +
    "            </md-option>\n" +
    "        </md-select>\n" +
    "    </md-input-container>  \n" +
    "\n" +
    "    <md-input-container flex>\n" +
    "        <label>{{regionLabel}}</label>\n" +
    "        <md-select ng-model=\"address.region\" ng-change=\"populateSearch()\" ng-required=\"options.region.required\">\n" +
    "            <md-option ng-repeat=\"region in regions\" value=\"{{region.code}}\">\n" +
    "                {{region.name}}\n" +
    "            </md-option>\n" +
    "        </md-select>\n" +
    "    </md-input-container>\n" +
    "</div>\n" +
    "\n" +
    "<div class=\"map-container\" ng-show=\"map\">\n" +
    "    <md-button class=\"center\"ng-show=\"address.lat && address.lng\" ng-click=\"search()\">Center Map using Address</md-button>\n" +
    "    <ui-gmap-google-map center=\"map.center\" zoom=\"13\" options=\"mapOptions\" control=\"map.control\" events=\"mapOptions.events\">\n" +
    "        <ui-gmap-markers models=\"markers\" coords=\"'self'\" options=\"'self'\"/></ui-gmap-google-map>\n" +
    "    </ui-gmap-google-map>\n" +
    "    <div class=\"address-incomplete\" layout=\"row\" layout-align=\"center center\" ng-hide=\"address.lat && address.lng\"><div>Please populate the address above to locate it on the map</div></div>\n" +
    "</div>"
  );

}]);

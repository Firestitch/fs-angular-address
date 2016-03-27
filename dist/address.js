
(function () {
    'use strict';

    angular.module('fs-angular-address',[])
    .directive('fsAddress', function(COUNTRIES, $filter) {
        return {
            templateUrl: 'views/directives/address.html',
            restrict: 'E',
            scope: {
              options: '=?fsOptions',
              address: '=?fsAddress'
            },

            link: function($scope, element, attrs, ctrl) {
                            
                $scope.address = $scope.address || {};
                $scope.countries = [];

                if($scope.options.countries) {

                    angular.forEach(COUNTRIES,function(country) {
                        if($scope.options.countries.indexOf(country.code)>=0) {
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
                });               
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
    "        <input ng-model=\"address.address\">\r" +
    "\n" +
    "    </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <md-input-container flex>\r" +
    "\n" +
    "        <label>Address 2</label>\r" +
    "\n" +
    "        <input ng-model=\"address.address2\">\r" +
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
    "        <input ng-model=\"address.city\">\r" +
    "\n" +
    "    </md-input-container>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <md-input-container flex>\r" +
    "\n" +
    "        <label>Postal Code</label>\r" +
    "\n" +
    "        <input name=\"zip\" ng-model=\"address.zip\">\r" +
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
    "        <label>State</label>\r" +
    "\n" +
    "        <md-select ng-model=\"address.region\">\r" +
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
    "        <md-select ng-model=\"address.country\">\r" +
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
    "\n"
  );

}]);

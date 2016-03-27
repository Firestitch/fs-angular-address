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
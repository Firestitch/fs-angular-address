'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope) {

    //$scope.address = { lat: 43.9754689, lng: 4.3423691 };
    $scope.address = {};
    $scope.options = { map: true, countries: ['CA','US'], address2: false };
    
    $scope.submit = function() {
        alert('submit');
    }
});

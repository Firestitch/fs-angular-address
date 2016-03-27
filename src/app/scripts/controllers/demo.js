'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope) {

    //$scope.address = { lat: 43.9754689, lng: 4.3423691 };
    $scope.address = {};
    
    $scope.submit = function() {
        alert('submit');
    }
});

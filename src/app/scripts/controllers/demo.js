'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope) {

    //$scope.address = { lat: 43.9754689, lng: 4.3423691 };
    $scope.address = { address1: '348 Wellington St W', city: 'Toronto',country: 'CA', region: 'ON', zip: 'M3M 1W3' };
    //$scope.address = {  };
    $scope.options1 = { 	map: true,
    					countries: ['CA','US'],
    					address: { required: true, name: 'address1' },
    					address2: { show: true },
    					city: { required: true },
    					region: { required: true },
    					zip: { required: true },
    					country: { required: true },

    					 };

    $scope.submit = function() {
        alert('submit');
    }

    $scope.toggleDisabled = function() {
    	$scope.options.disabled = !$scope.options.disabled;
    }
});

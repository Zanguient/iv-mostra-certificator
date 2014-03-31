

angular.module('certificator', [
  'ngCpfCnpj',
  'ui.mask'
]).
controller('buscarCertificados', function($scope) {

  // evita enviar o fomulário se ele estiver com erros
  $scope.submit = function($event){
    if(!$scope.buscarCertificados.cpf.$valid){
      $event.preventDefault();
      $event.stopPropagation();
    }
  }

});


angular.bootstrap(document, ['certificator']);




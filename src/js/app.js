var hero = angular.module('superhero', ['ui.bootstrap',
                                        'ngRoute',
                                        'lightcontroller']);
hero.config(['$controllerProvider',
  function($controllerProvider) {
    $controllerProvider.allowGlobals();
  }
]);

hero.config(['$routeProvider',function($routeProvider) {
  $routeProvider.
    when('/dash', {
      templateUrl: '/pages/windows/dash.ejs',
      controller: ''
    }).
    when('/about', {
      templateUrl: '/pages/windows/about.ejs',
      controller: ''
    }).
    when('/time', {
      templateUrl: '/pages/windows/time.ejs',
      controller: ''
    }).
    when('/power', {
      templateUrl: '/pages/windows/power.ejs',
      controller: ''
    }).
    when('/list', {
      templateUrl: '/pages/windows/list.ejs',
      controller: ''
    }).
    when('/control', {
      templateUrl: '/pages/windows/control.ejs',
      controller: ''
    }).
    when('/users', {
      templateUrl: '/pages/windows/users.ejs',
      controller: ''
    }).
    when('/pass', {
      templateUrl: '/pages/windows/pass.ejs',
      controller: ''
    }).
    when('/csv', {
      templateUrl: '/pages/windows/csv.ejs',
      controller: ''
    }).
    otherwise({
      redirectTo: '/dash',
      controller: 'groupCtrl'
    });
}]);

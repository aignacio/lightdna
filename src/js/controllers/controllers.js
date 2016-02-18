var lightcontroller = angular.module('lightcontroller', [
                                                         'ngAnimate',
                                                         'smart-table',
                                                         'ngLocationUpdate',
                                                         'ui.bootstrap',
                                                         'ngCsvImport',
                                                         'ngCsv',
                                                         'ngSanitize',
                                                         'ui.knob',
                                                         'ui.bootstrap-slider',
                                                         'kk.timepicker',
                                                         'chart.js',
                                                         'ntt.TreeDnD',
                                                         'uiSwitch']);

lightcontroller.controller('loginCtrl',[ '$scope',function ($scope) {
}]);

lightcontroller.controller('gmapsCtrl', ['$scope','$timeout','$templateCache','$http','$uibModal','$compile','$routeParams','ShareZoomLight','SharelightTAGid',function($scope, $timeout,$templateCache, $http, $uibModal, $compile, $routeParams,ShareZoomLight,SharelightTAGid) {
  var GMarkersData = {'markers':[]};
  var map = new google.maps.Map(document.getElementById('map_canvas'), {
    // center: {lat: -34.397, lng: 150.644},
    zoom: 8,
    scrollwheel: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  // $timeout(function() {
  //     // google.maps.event.trigger($scope.mapInst, 'resize');
  //     console.log('update with timeout fired');
  // }, 3000);

  //Bind the two services to shares scopes between controllers
  $scope.lightZ = ShareZoomLight;
  $scope.lightSel = SharelightTAGid;
  // $scope.mapInst
  // var mcOp
  tions = {gridSize: 50, maxZoom: 15};
  var inMarkers = [];
  // var mc = new MarkerClusterer(map, [], mcOptions);
  var infowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();
  // var map = L.map( 'map_canvas' );

  //Create Markers in Gmaps - LIGHTS
  function CreateMarkers_on(data) {
    $.each(data.markers, function (i, MarkLight) {
      var marker;

      if(MarkLight.status == '1'){
        if(MarkLight.dimmer === 0){
          marker = new google.maps.Marker({
           position: MarkLight.position,
           map: map,
           title: MarkLight.title,
           text: MarkLight.group,
           icon: '../../img/icons/light_off.png'
          });
        }
        else {
          marker = new google.maps.Marker({
           position: MarkLight.position,
           map: map,
           title: MarkLight.title,
           text: MarkLight.group,
           icon: '../../img/icons/light_ok.png'
          });
        }
      }
      else {
        marker = new google.maps.Marker({
         position: MarkLight.position,
         map: map,
         title: MarkLight.title,
         text: MarkLight.group,

         icon: '../../img/icons/light_warn.png'
        });
      }

      bounds.extend(marker.position);
      marker.addListener('click', function() {
        var compiled = $compile(MarkLight.content)($scope); //I need to compile to 'refresh' the ng-two way binding the ng-click of dimmer
        //console.log(compiled);
        infowindow.setContent(compiled[0]);
        $scope.$apply();
        infowindow.setOptions({ position: MarkLight.position });
        infowindow.open(map, this);
      });

      inMarkers.push(marker);
    });
  }

  //Generate Light template to control
  function GenLightControl(light){
      var status,aux;

      if(light.status.status=='1'){
        status = '<span style="color:green;">OK</span>';
      }
      else {
        status = '<span style="color:#D8A619;">Alerta</span>';
      }

      if(light.status.dimmer=='0'){
        aux = "Desligada";
      }
      else {
        aux = light.status.dimmer+"%";
      }
      var control = '<div id="light"><b>Luminária - '+light.TAG+':</br></b>'+
                    '<b>Corrente:</b>'+light.status.current+'mA</br>'+
                    '<b>Dimmer:</b><a style="font-weight:bold;" type="button" ng-click="DimmerLight(\''+light.TAG+'\',\''+light.status.dimmer+'\',\''+light.LAT+'\',\''+light.LONG+'\')">'+aux+'</a></br>'+
                    '<b>RSSI:</b>'+light.status.rssi+'dBm</br>'+
                    '<b>Status:'+status+'</b></br>'+
                    '<b>Grupo</b>:'+light.group.grupo+'</b></br><div>';
      return control;
  }

  $http({method: 'GET', url: '/lights/getLights'}).
    then(function(response) {
      for(var i=0;i<response.data.length;i++){
        GMarkersData.markers.push({
          'position':{
            'lat': Number(response.data[i].LAT),
            'lng': Number(response.data[i].LONG)
          },
            'title': 'Luminária '+response.data[i].TAG,
            'content': GenLightControl(response.data[i]),
            'group': response.data[i].group.grupo,
            'status': response.data[i].status.status,
            'dimmer': response.data[i].status.dimmer
        });
      }
      CreateMarkers_on(GMarkersData);
      if ($scope.lightZ.view === true){
        // var lat = $routeParams.lat.split(':');
        // var LatLng = new google.maps.LatLng(Number(lat[1]),Number(lat[2]));
        // map.setCenter(LatLng);
        // map.setZoom(20);
        $scope.lightZ.view = false;

        // var lat = $routeParams.lat.split(':');
        var LatLng = new google.maps.LatLng(Number($scope.lightZ.lat),Number($scope.lightZ.long));
        map.setCenter(LatLng);
        map.setZoom(20);
      }else {
        map.fitBounds(bounds); //Adjust center of map
      }
      var mcOptions = {gridSize: 50, maxZoom: 17};
      var markerCluster = new MarkerClusterer(map, inMarkers,mcOptions); //Old MODE
      }, function(response) {
      $scope.data = response.data || "Request failed";
      $scope.status = response.status;
      console.log($scope.status);
  });

  /******************************************** MODAL DIM LIGHT ********************************************/
  $scope.DimmerLight = function (light,dimmer,lat,long) {
    // $templateCache.get('dash.ejs');
    // alert(light);
    // console.log(light);
    $scope.lightSel.tag = light;
    $scope.lightSel.dimmer = dimmer;
    $scope.lightSel.lat = lat;
    $scope.lightSel.long = long;
    $scope.mapInst = map;
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'modalLights.html',
    //   template:"<div class=\"modal-header\">"+
    // "      <h3 class=\"modal-title\">Dimmer {{SharelightTAGid.tag}} Individual</h3>"+
    // "  </div>"+
    // "  <div class=\"modal-footer\">"+
    // "      <button class=\"btn btn-primary\" type=\"button\" ng-click=\"ok()\">Atuar</button>"+
    // "      <button class=\"btn btn-warning\" type=\"button\" ng-click=\"cancel()\">Fechar</button>"+
    // "  </div>",
      controller: 'ModalInstanceCtrl'
    });
  };
}]);

lightcontroller.service('SharelightTAGid', function () {
    var lightSel = {
      tag: '',
      dimmer:'',
      lat:'',
      long:''
    };
    var mapInst;
    return lightSel;
});

lightcontroller.service('ShareZoomLight', function () {
    var lightZ = {
        lat: '',
        long: '',
        view: false
    };
    return lightZ;
});

lightcontroller.controller('ModalInstanceCtrl', ['$scope','$uibModalInstance','SharelightTAGid','$http', function ($scope, $uibModalInstance, SharelightTAGid, $http) {
  $scope.lightSel = SharelightTAGid;
  $scope.mapInst = SharelightTAGid;
  $scope.tag = $scope.lightSel.tag;
  if($scope.lightSel.dimmer == '0'){
    $scope.dimmer = 'Desligada';
    // $scope.dimmer = '20%';
  }
  else
    $scope.dimmer = $scope.lightSel.dimmer;

  $scope.lightSlider = {
    name: 'teste',
    value: $scope.dimmer,
    max: "100",
    min: "0",
    step: "10",
    ticks: [20,30,40,50,60,70,80,90,100],
    labels: ['Mínimo','30%','40%','50%','60%','70%','80%','90%','Máximo']
  };

  $scope.off = function () {
    $uibModalInstance.close();
    $http({
      url: '/lights/setLights', // No need of IP address
      method: 'POST',
      data:{ 'light': $scope.tag,'dimmer':'0'},
      headers: {'Content-Type': 'application/json'}
    }).then(function(response) {
      if(response.data.status=='ok'){
        alert("Luminária "+$scope.tag+" desligada!");
      }
      else
        alert('Não foi possível alterar o valor de dimmer!');
      // $location.path('/main');
    }, function(response) {
      $scope.data = response.data || "Request failed";
      $scope.status = response.status;
      // console.log($scope.status);
    });
  };

  $scope.DimmerLight = function () {
    // if ($scope.dimmer == 'Desligada') {
    //   $scope.lightSlider.value = '20';
    // }
    $uibModalInstance.close();
    $http({
      url: '/lights/setLights', // No need of IP address
      method: 'POST',
      data:{ 'light': $scope.tag,'dimmer':$scope.lightSlider.value},
      headers: {'Content-Type': 'application/json'}
    }).then(function(response) {
      if(response.data.status=='ok'){
        alert("Luminária "+$scope.tag+" atualizada!"+"\n\r"+$scope.lightSel.lat+"\n\r"+$scope.lightSel.long);
        // google.maps.event.trigger($scope.mapInst, 'resize');
      }
      else
        alert('Não foi possível alterar o valor de dimmer!');
      // $location.path('/main');
    }, function(response) {
      $scope.data = response.data || "Request failed";
      $scope.status = response.status;
      console.log($scope.status);
    });
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss();
  };
}]);

lightcontroller.controller('groupCtrl', ['$scope','$uibModal','ShareOfflineGroup','$parse','$timeout','$http','$templateCache',function($scope,$uibModal,ShareOfflineGroup,$parse,$timeout,$http,$templateCache) {
  $scope.groups={};
  $scope.dimmer = 0;

  // Function to replicate setInterval using $timeout service.
  $scope.intervalFunction = function(){
    time = $timeout(function() {
      updateGroups();
      // $scope.getData();
            // console.log("demo");
      // $scope.getTreeData();
      $scope.intervalFunction();
    }, 1000);
  };
  $scope.intervalFunction();

  $scope.$on('$routeChangeStart', function(scope, next, current){
    $timeout.cancel(time);
  });

  $scope.$watch('enabled',function(){
      // console.log("botao de dimmer mexido");
      $scope.switchDimmer = 1;
      // if (!$scope.enabled) {
      //   $scope.dimmer = 0;
      // }
      // else {
      //   $scope.dimmer = $scope.groupSelected.dimmer;
      // }
  });

  $scope.$watch('group',function(){
      // console.log("grupo trocado");
      $scope.groupChange = 1;
      $scope.uptoDate = 1;
      //setKNOB();
      // $scope.uptoDate = 1;
  });

  function setKNOB(){
    // $scope.dimmer = $scope.groupSelected.dimmer;
    if ($scope.dimmer >= 20) {
      $scope.enabled = true;
    }
    else {
      $scope.dimmer = 0;
      $scope.enabled = false;
    }
  }

  function updateGroups(){
    if(!$scope.enabled) {
      $scope.dimmer = 0;
    }
    else if($scope.switchDimmer){
      $scope.switchDimmer = 0;
      if (!$scope.groupSelected.dimmer) {
        $scope.dimmer = 20;
      }else {
        $scope.dimmer = $scope.groupSelected.dimmer;
      }
    }

    if($scope.enabled && $scope.dimmer < 20 && !$scope.wasZero){
      $scope.dimmer = 0;
      $scope.enabled = 0;
    }

    if($scope.groupSelected.dimmer === 0 && $scope.dimmer < 20 && $scope.enabled){
      $scope.dimmer = 0;
      $scope.enabled = 0;
    }

    // if($scope.wasZero && $scope.enabled){
    //   // $scope.wasZero = 0;
    //   $scope.enabled = true;
    //   $scope.dimmer = 20;
    // }

    $http({method: 'GET', url: '/groups/getGroups'}).
      then(function(response) {
        $scope.groups = response.data;
        $scope.rowCollection = response.data;

        // console.log($scope.groups);
        for (var i = 0; i < $scope.groups.length; i++) {
          if ($scope.group == $scope.groups[i].name) {
            $scope.groupSelected = $scope.groups[i];
            defineKNOB();
          }
        }
      }, function(response) {
        $scope.data = response.data || "Request failed";
        $scope.status = response.status;
        console.log($scope.status);
    });
  }

  function defineKNOB() {
    if($scope.uptoDate && $scope.groupChange) {
      $scope.uptoDate = 0;
      $scope.groupChange = 0;
      $scope.dimmer = $scope.groupSelected.dimmer;
      if($scope.dimmer === 0){
        $scope.wasZero = 1;
      }
      else{
        $scope.wasZero = 0;
      }
      if ($scope.dimmer >= 20) {
        $scope.enabled = true;
      }
      else {
        $scope.dimmer = 0;
        $scope.enabled = false;
      }
    }
  }
  /*****************************************/
  $scope.options = {
   size: 250,
   unit: "%",
   startAngle: -120,
   endAngle: 120,
   step: 10,
   displayPrevious: true,
   trackWidth: 40,
   barWidth: 30,
   trackColor: 'rgba(0,0,0,.1)',
   barColor: '#494B52',
   prevBarColor: 'gray',
   scale: {
     enabled: true,
     type: 'dots',
     width: 1,
     quantity: 11
   },
   textColor: '#494B52',
   subText: {
     enabled: true,
     text: 'Dimmer',
     color: 'gray'
   }
  };

  $scope.setDimmerGroup = function(){
    console.log("Grupo:"+$scope.group+"\nDimmer:"+$scope.dimmer);
    var data = {
      group:  $scope.group,
      dimmer: $scope.dimmer
    };
    $http({
      url: '/groups/setDimmer', // No need of IP address
      method: 'POST',
      data: data,
      headers: {'Content-Type': 'application/json'}
    }).then(function(response) {
      if(response.data.status=='ok'){
        alert('Valor setado de dimmer para o grupo!');
        //updateGroups();
      }
      else
        alert('Não foi possível setar este valor de dimmer!');
    }, function(response) {
      $scope.data = response.data || "Request failed";
      $scope.status = response.status;
      console.log($scope.status);
    });
  };

  $scope.itemsByPage=5;

  $scope.displayedCollection = [];
  $scope.rowCollection = [];
  $scope.displayedCollection = [].concat($scope.rowCollection);

  var groupData = {
    values: []
  };

  $http({method: 'GET', url: '/groups/getGroups'}).
    then(function(response) {
      $scope.group = response.data[0].name;
      $scope.rowCollection = response.data;
      $scope.groupSelected = response.data[0];
      defineKNOB();
      for(var i=0;i<response.data.length;i++) {
        groupData.values.push(response.data[i].name);
      }
      if($scope.dimmer === 0){
        $scope.wasZero = 1;
      }
      // init = true;
      // formatTree(response.data);
      // $scope.groups = response.data;
      $scope.groupopt = groupData;
    }, function(response) {
      $scope.data = response.data || "Request failed";
      $scope.status = response.status;
      console.log($scope.status);
  });

  // $http({method: 'GET', url: '/alarms/getAlarms'}).
  //   then(function(response) {
  //       $scope.rowCollection = response.data;
  //       // updateChart(response.data);
  //   }, function(response) {
  //     $scope.data = response.data || "Request failed";
  //     $scope.status = response.status;
  //     console.log($scope.status);
  // });

  $scope.groupName = ShareOfflineGroup;
  /******************************************** MODAL OFFLINE LIGHT ********************************************/
  $scope.offlineLights = function () {
    $scope.groupName.name = $scope.groupSelected.name;
    // console.log($scope.groupName);
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'modal.html',
      controller: 'modalOfflineCtrl'
    });
  };
}]);

lightcontroller.service('ShareOfflineGroup', function () {
    var groupName = {
      name: ''
    };
    return groupName;
});

lightcontroller.controller('modalOfflineCtrl', ['$scope','$uibModalInstance','ShareOfflineGroup','$http', 'ShareZoomLight','$location', function ($scope, $uibModalInstance, ShareOfflineGroup, $http, ShareZoomLight,$location) {
  $scope.groupName = ShareOfflineGroup;
  // console.log($scope.groupName.name);
  $scope.lightZ = ShareZoomLight;

  $scope.light = {};
  $scope.displayedCollection = [];
  $scope.rowCollection = [];
  $scope.displayedCollection = [].concat($scope.rowCollection);

  // $templateCache.removeAll();
  $scope.ZoomLight = function(lat,long) {
    $scope.lightZ.lat = lat;
    $scope.lightZ.long = long;
    $scope.lightZ.view = true;
    $location.path('#/dash');
    pageInd('1');
    $uibModalInstance.dismiss();
  };

  $scope.itemsByPage=10;

  $http({method: 'GET', url: '/lights/getLights'}).
    then(function(response) {
      var lightsOffline = [];
      for(var i=0;i<response.data.length;i++) {
        if(response.data[i].group.grupo == $scope.groupName.name){
          if (response.data[i].status.status == '0') {
            if(response.data[i].status.status == '1')
              response.data[i].status.status = 'OK';
            else
              response.data[i].status.status = 'Alerta';

            if(response.data[i].status.dimmer == '0')
              response.data[i].status.dimmer = 'Desligada';
            else
              response.data[i].status.dimmer = response.data[i].status.dimmer+'%';

            lightsOffline.push(response.data[i]);
          }
        }
      }
      $scope.rowCollection = lightsOffline;
      console.log($scope.rowCollection);
    }, function(response) {
      $scope.data = response.data || "Request failed";
      $scope.status = response.status;
      console.log($scope.status);
  });


  $scope.cancel = function () {
    $uibModalInstance.dismiss();
  };
}]);

lightcontroller.controller('powerGraphCtrl', ['$scope', '$http', '$timeout','$location', '$window',function($scope, $http, $timeout, $location, $window){
  /********************************Chart of Power******************************/
  // Function to replicate setInterval using $timeout service.
  var timeGraph = 5000;

  $scope.intervalFunction = function(){
    time = $timeout(function() {
      // updateGroups();
      $scope.getData();
            // console.log("demo");
      // $scope.getTreeData();
      $scope.intervalFunction();
    }, timeGraph);
  };
  $scope.intervalFunction();

  $scope.$on('$routeChangeStart', function(scope, next, current){
    $timeout.cancel(time);
  });

  var dataPower;

  var init = false;

  $scope.groupName = "Total";

  var chartd = new Highcharts.Chart({
       chart: {
          type: 'spline',
          renderTo: 'powerGraph',
           animation: Highcharts.svg, // don't animate in old IE
           marginRight: 10,
           events: {
               load: function () {
                   // set up the updating of the chart each second
                   var series = this.series[0];
                   setInterval(function () {
                       var x = (new Date()).getTime(), // current time
                           y = dataPower;
                       series.addPoint([x, y], true, true);
                   }, timeGraph);
               }
           }
       },
       title: {
           text: ' '
       },
       xAxis: {
           type: 'datetime',
           tickPixelInterval: 150
       },
       yAxis: {
           title: {
               text: 'Potência Instantânea'
           },
           plotLines: [{
               value: 0,
               width: 1,
               color: '#000000'
           }]
       },
       tooltip: {
           formatter: function () {
               return '<b>' + this.series.name + '-'+$scope.groupName+'</b><br/>' +
                   Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                   '<b>'+Highcharts.numberFormat(this.y, 2)+'W</b>';
           }
       },
       legend: {
           enabled: false
       },
       plotOptions: {
            series: {
                color: '#000000'
            },
            line: {
                connectNulls: true
            }
       },
       exporting: {
           enabled: false
       },
       series: [{
           name: 'Potência',
           data: (function () {
               // generate an array of random data
               var data = [],
                   time = (new Date()).getTime(),
                   i;

               for (i = -19; i <= 0; i += 1) {
                   data.push({
                       x: time + i * 1000,
                       y: 0
                   });
               }
               return data;
           }())
       }]
   });

  $scope.getData = function(){
    // var data = [];
    // for(var i=0;i<groupData.values.length;i++) {
    //     data.push(groupData.values[i]);
    // }
    $http({
      url: '/log/getPower', // No need of IP address
      method: 'POST',
      data: [$scope.groupName],
      headers: {'Content-Type': 'application/json'}
    }).then(function(response) {
      if (response.data[0].power.value) {
        dataPower = response.data[0].power.value;
      }
      else {
        dataPower = 0;
      }
    }, function(response) {
      $scope.data = response.data || "Request failed";
      $scope.status = response.status;
      console.log($scope.status);
    });
    // console.log('Getting data from server!');
  };

  $scope.changeGraph = function(group){
    $scope.groupName = group;
  };

  $(".toggled").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
    if(document.getElementById("powerGraph") !== null)
      chartd.setSize($('#powerGraph').width(),$('#powerGraph').height());
    // alert("data binding");
  });

  $(".untoggled").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
    if(document.getElementById("powerGraph") !== null)
      chartd.setSize($('#powerGraph').width(),$('#powerGraph').height());
    // alert("added untoggled class");
  });

  /********************************Chart of Power******************************/

}]);

lightcontroller.controller('alertCtrl', ['$scope', '$http', '$timeout','$location', '$window',function($scope, $http, $timeout, $location, $window){
  /********************************Manage alert of lights******************************/
  $http({method: 'GET', url: '/cfg/defaultCfg'}).
  then(function(response) {
      $scope.maxAlert = response.data[0].numberAlert;
  }, function(response) {
    $scope.data = response.data || "Request failed";
    $scope.status = response.status;
    console.log($scope.status);
  });

  $scope.alerts = [];

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.intervalFunction = function(){
    time = $timeout(function() {
      $http({method: 'GET', url: '/groups/getGroups'}).
        then(function(response) {
          $scope.groups = response.data;
          var totalOffline = 0;
          for (var i = 0; i < $scope.groups.length; i++) {
              totalOffline += $scope.groups[i].offline;
          }
          // console.log(totalOffline);

          if (totalOffline >= $scope.maxAlert) {
            $scope.alerts[0] = { type: 'danger', msg: 'Luminárias em alerta!' };
          }
        }, function(response) {
          $scope.data = response.data || "Request failed";
          $scope.status = response.status;
          console.log($scope.status);
      });
      $scope.intervalFunction();
    }, 2000);
  };
  $scope.intervalFunction();

}]);

lightcontroller.controller('usersCtrl', ['$scope', '$http', '$templateCache','$location', '$window',function($scope, $http, $templateCache, $location, $window){
    $scope.user = {
      admin: false
    };
    $scope.displayedCollection = [];
    $scope.rowCollection = [];
    $scope.displayedCollection = [].concat($scope.rowCollection);

    $scope.addRow = function() {
      $scope.rowCollection.push(
        {profile: {
          admin: 'sim',
          username: "teste"}
        });
    };

    $http({method: 'GET', url: '/users/getUsers'}).
      then(function(response) {
        // $scope.status = response.status;
        // $scope.users = response.data;
        // for(var i=0;i<response.data.length;i++) {
        //   response.data[i].profile.created = new Date(response.data[i].profile.created);
        //   response.data[i].profile.updated = new Date(response.data[i].profile.updated);
        // }
        for(var i=0;i<response.data.length;i++) {
          if(response.data[i].profile.admin)
            response.data[i].profile.admin = 'Sim';
          else
            response.data[i].profile.admin = 'Não';
        }
        $scope.rowCollection = response.data;
        // console.log($scope.users);
      }, function(response) {
        $scope.data = response.data || "Request failed";
        $scope.status = response.status;
        console.log($scope.status);
    });

    //$templateCache.removeAll();
    function updateUsers(){
      $http({method: 'GET', url: '/users/getUsers'}).
        then(function(response) {
          // $scope.status = response.status;
          // $scope.users = response.data;
          // for(var i=0;i<response.data.length;i++) {
          //   response.data[i].profile.created = new Date(response.data[i].profile.created);
          //   response.data[i].profile.updated = new Date(response.data[i].profile.updated);
          // }
          for(var i=0;i<response.data.length;i++) {
            if(response.data[i].profile.admin)
              response.data[i].profile.admin = 'Sim';
            else
              response.data[i].profile.admin = 'Não';
          }
          $scope.rowCollection = response.data;
          // console.log($scope.users);
        }, function(response) {
          $scope.data = response.data || "Request failed";
          $scope.status = response.status;
          console.log($scope.status);
      });
    }

    $scope.listUsers = function(row) {
      $http({method: 'POST', url: '/users/getUsers'}).
        then(function(response) {
          // $scope.status = response.status;
          // $scope.users = response.data;
          // for(var i=0;i<response.data.length;i++) {
          //   response.data[i].profile.created = new Date(response.data[i].profile.created);
          //   response.data[i].profile.updated = new Date(response.data[i].profile.updated);
          // }
          for(var i=0;i<response.data.length;i++) {
            if(response.data[i].profile.admin)
              response.data[i].profile.admin = 'Sim';
            else
              response.data[i].profile.admin = 'Não';
          }
          $scope.rowCollection = response.data;
          // console.log($scope.users);
        }, function(response) {
          $scope.data = response.data || "Request failed";
          $scope.status = response.status;
          console.log($scope.status);
      });
    };

    $scope.removeUser = function(row) {
        $http({
          url: '/users/removeUsers', // No need of IP address
          method: 'POST',
          data: { 'username':row.profile.username},
          headers: {'Content-Type': 'application/json'}
        }).then(function(response) {
          if(response.data.status=='ok'){
            console.log('Usuário removido com sucesso!');
            // var index = $scope.displayedCollection.indexOf(row);
            // if (index !== -1) {
            //    $scope.displayedCollection.splice(index, 1);
            // }
            updateUsers();
          }
          else {
            alert('Usuário não encontrado!');
          }
          // $location.path('/main');
        }, function(response) {
          $scope.data = response.data || "Request failed";
          $scope.status = response.status;
          console.log($scope.status);
      });
    };

    $scope.adduser = function() {
      // console.log($scope.user);
        $http({
          url: '/users/addUsers', // No need of IP address
          method: 'POST',
          data: $scope.user,
          headers: {'Content-Type': 'application/json'}
        }).then(function(response) {
          if(response.data.status=='ok'){
            //console.log('Usuário adicionado com sucesso!');
            //$scope.rowCollection.push({'profile':{'name':'ANDERSON'}});
            updateUsers();
            alert('Usuário adicionado com sucesso!');
          }
          else
            alert('Não foi possível adicionar o usuário informado, \n[Nome de usuário] já existe!');
          // $location.path('/main');
        }, function(response) {
          $scope.data = response.data || "Request failed";
          $scope.status = response.status;
          console.log($scope.status);
      });
    };

    $scope.changePass = function() {
        $http({
          url: '/users/changePass', // No need of IP address
          method: 'POST',
          data:{ 'username': $window.loginUser,'password':$scope.user.password},
          headers: {'Content-Type': 'application/json'}
        }).then(function(response) {
          if(response.data.status=='ok'){
            //console.log('Usuário adicionado com sucesso!');
            //$scope.rowCollection.push({'profile':{'name':'ANDERSON'}});
            alert('Senha alterada com sucesso!');
          }
          else
            alert('Não foi possível alterar a senha informada!');
          // $location.path('/main');
        }, function(response) {
          $scope.data = response.data || "Request failed";
          $scope.status = response.status;
          console.log($scope.status);
      });
    };
}]);

lightcontroller.controller('csvCtrl',['$scope', '$http','$parse', '$templateCache',function ($scope,$http,$parse,$templateCache) {
  var dataLights,
      dataMongo = [],
      dataExport = [];

  var lights;

  $scope.csv = {
  	content: null,
  	header: true,
  	separator: ',',
  	result: null,
  	encoding: 'ISO-8859-1',
    accept:'.csv'
  };

  function testinput(re, str) {
    var midstring;
    if (str.search(re) != -1) {
      midstring = true;
    } else {
      midstring = false;
    }
    return midstring;
  }

  function getDuplicates(data){
    var sorted_arr = data;
    var results = [];
    for (var i = 0; i < data.length - 1; i++) {
        if (sorted_arr[i + 1] == sorted_arr[i]) {
            results.push(sorted_arr[i]);
        }
    }

    return results;
  }

  function verifyCSV(){
      var verif = $scope.csv.content;
      // console.log(verif);
      var h1 = testinput('DeviceAddress',verif);
      var h2 = testinput('MAC',verif);
      var h3 = testinput('TAG',verif);
      var h4 = testinput('LAT',verif);
      var h5 = testinput('LONG',verif);
      var h6 = testinput('Grupo',verif);
      var h7 = testinput('Modelo',verif);
      // var h8 = testinput('GC',verif);
      var h9 = testinput('Status',verif);
      var h10 = testinput('Nome',verif);

      if(h1){
        if (h2) {
          if (h3) {
            if (h4) {
              if (h5) {
                if (h6) {
                  if (h7) {
                    // if (h8) {
                      //if (h9) {
                        if (h10) {
                          return 'ok';
                        } else {
                          alert('Problema:Arquivo.csv não contém a tag [Nome]');
                          return 'bad';
                        }
                      // } else {
                      //   alert('Problema:Arquivo.csv não contém a tag [Status]');
                      //   return 'bad';
                      // }
                    // } else {
                    //   alert('Problema:Arquivo.csv não contém a tag [GC]');
                    //   return 'bad';
                    // }
                  } else {
                    alert('Problema:Arquivo.csv não contém a tag [Modelo]');
                    return 'bad';
                  }
                } else {
                  alert('Problema:Arquivo.csv não contém a tag [Grupo]');
                  return 'bad';
                }
              } else {
                alert('Problema:Arquivo.csv não contém a tag [LONG]');
                return 'bad';
              }
            } else {
              alert('Problema:Arquivo.csv não contém a tag [LAT]');
              return 'bad';
            }
          } else {
            alert('Problema:Arquivo.csv não contém a tag [TAG]');
            return 'bad';
          }
        }
        else {
          alert('Problema:Arquivo.csv não contém a tag [MAC]');
          return 'bad';
        }
      }
      else {
        alert('Problema:Arquivo.csv não contém a tag [DeviceAddress]');
        return 'bad';
      }

  }

  function saveLights(lights) {
      for(var i=0;i<lights.length;i++){
        // if (lights[i].Status == '0' || lights[i].Status == '1') {
          dataMongo.push({
            'name':lights[i].Nome,
            'deviceAddress':lights[i].DeviceAddress,
            'MAC':lights[i].MAC,
            'TAG':lights[i].TAG,
            'LAT':lights[i].LAT,
            'LONG':lights[i].LONG,
            'group':{
                'grupo':lights[i].Grupo
                // 'groupC2':lights[i].GB,
                // 'groupC3':lights[i].GC
            },
            'status':{
                'status':'0',
                'dimmer':20,
                'rssi':-50,
                'current':100
            },
            'model':lights[i].Modelo
          });
        // }
        // else {
        //   $scope.problem = true;
        // }
      }

      // if ($scope.problem) {
      //   alert("Problema na coluna [STATUS]!");
      // }else {
        $http({
            url: '/lights/save', // No need of IP address
            method: 'POST',
            data: dataMongo,
            headers: {'Content-Type': 'application/json'}
          }).then(function(response) {
            if(response.data.status=='ok'){
              //console.log('Usuário adicionado com sucesso!');
              //$scope.rowCollection.push({'profile':{'name':'ANDERSON'}});
              alert('Luminárias salvas com sucesso no banco de dados!');
            }
            else
              alert('Não foi possível adicionar o arquivo csv informado!');
            // $location.path('/main');
          }, function(response) {
            $scope.data = response.data || "Request failed";
            $scope.status = response.status;
            console.log($scope.status);
        });
      // }
  }

  //Watch if user input some file and pass to POST that will save the lights
  $scope.$watch('csv.result', function() {
    if($scope.csv.result){
      dataLights = $scope.csv.result;
      var uniqueTAGS = [];
      for(var jk=0;jk<dataLights.length;jk++){
        uniqueTAGS.push(dataLights[jk].TAG);
      }
      // console.log(uniqueTAGS);
      var dup = getDuplicates(uniqueTAGS);
      if(dup[0]){
        alert('Não foi possível carregar o arquivo de configurações, existem TAGs duplicadas:\n'+dup);
      }
      else{
        if(verifyCSV() == 'ok')
            saveLights(dataLights);
      }
    }
  });

  $scope.exportLights = function() {
    $http({method: 'GET', url: '/lights/getLights'}).
      then(function(response) {
        lights = response.data;
        for(var i=1;i<lights.length;i++){
          dataExport.push({
            'DeviceAddress':lights[i].deviceAddress,
            'Nome':lights[i].name,
            'MAC':lights[i].MAC,
            'TAG':lights[i].TAG,
            'LAT':lights[i].LAT,
            'LONG':lights[i].LONG,
            'Grupo':lights[i].group.grupo,
            'Modelo':lights[i].model
          });
        }
        $scope.dataCSV = dataExport;
        // console.log($scope.users);
      }, function(response) {
        $scope.data = response.data || "Request failed";
        $scope.status = response.status;
        console.log($scope.status);
    });
  };

  var demoLights = [];
  var lat = ['-29.67423597',
             '-29.68663011',
             '-29.66839225',
             '-29.69386197'];
  var longt = ['-51.12000968',
              '-51.09775882',
              '-51.08316544',
              '-51.1169544'];
  for(var i=0;i<4;i++){
    demoLights.push({
      'DeviceAddress':"XXXXXX"+i,
      'Nome':"Luminaria "+i,
      'MAC':"XX-XX-XX-XX-XX-X"+i,
      'TAG':"L000"+i,
      'LAT':lat[i],
      'LONG':longt[i],
      'Grupo':"Grupo "+i,
      'Modelo':"HDA-01"
    });
  }
  $scope.demoCSV = demoLights;

  $scope.restoreCfgs = function(){
    $http({method: 'GET', url: '/cfg/defaultCfg'}).
      then(function(response) {
        // console.log(response);
        if (!response.data[0].voltagePlant && !response.data[0].numberAlert) {
          alert("[ATENÇÃO]Nenhum valor configurado para tensão e alertas!");
        }
        else {
          $scope.voltagePlant = response.data[0].voltage;
          $scope.numberAlert = response.data[0].numberAlert;
          $scope.slackToken = response.data[0].slackToken;
          $scope.botSlack = response.data[0].botSlack;
          $scope.channelSlack = response.data[0].channelSlack;

          if (response.data[0].emailAlert) {
            $scope.emailAlert = response.data[0].emailAlert;
          }
          if (response.data[0].timeEmailAlert) {
            $scope.timeEmailAlert = response.data[0].timeEmailAlert;
          }
        }
      }, function(response) {
        $scope.data = response.data || "Request failed";
        $scope.status = response.status;
        console.log($scope.status);
    });
  };

  $scope.saveCfg = function(){
    var cfgData = {
      voltage: $scope.voltagePlant,
      numberAlert: $scope.numberAlert,
      emailAlert: $scope.emailAlert,
      timeEmailAlert: $scope.timeEmailAlert,
      slackToken: $scope.slackToken,
      channelSlack: $scope.channelSlack,
      botSlack: $scope.botSlack
    };
    if ($scope.emailAlert) {
      if (!$scope.timeEmailAlert || $scope.timeEmailAlert < 30) {
        alert("[Atenção] Você inseriu um e-mail porém não um intervalo valido em segundos!");
      }
      else {
        $http({
            url: '/cfg/save', // No need of IP address
            method: 'POST',
            data: cfgData,
            headers: {'Content-Type': 'application/json'}
          }).then(function(response) {
            if(response.data.status=='ok'){
              alert('Configurações salvas com sucesso!');
            }
            else
              alert('Não foi possível salvar as configurações!');
            // $location.path('/main');
          }, function(response) {
            $scope.data = response.data || "Request failed";
            $scope.status = response.status;
            console.log($scope.status);
        });
      }
    }
    else {
      alert("[Atenção] Você não inseriu um e-mail válido!");
    }
    // alert($scope.voltagePlant+'\n\r'+$scope.numberAlert);

  };
}]);

lightcontroller.service('SharelightTAGlist', function () {
    var lightSelDev = {
      tag: '',
      dimmer:'',
      lat:'',
      long:''
    };
    return lightSelDev;
});

lightcontroller.controller('listCtrl',['$scope','SharelightTAGid', '$uibModal', '$http', '$templateCache','ShareZoomLight','SharelightTAGlist','$location', function ($scope,SharelightTAGid,$uibModal,$http,$templateCache,ShareZoomLight,SharelightTAGlist,$location) {
  $scope.light = {};
  $scope.displayedCollection = [];
  $scope.rowCollection = [];
  $scope.displayedCollection = [].concat($scope.rowCollection);

  // $templateCache.removeAll();

  $scope.itemsByPage=20;

  $scope.lightZ = ShareZoomLight;

  $scope.ZoomLight = function(lat,long) {
    // alert(lat+long);
    $scope.lightZ.lat = lat;
    $scope.lightZ.long = long;
    $scope.lightZ.view = true;
    $location.path('#/dash');
    pageInd('1');
  };

  $http({method: 'GET', url: '/lights/getLights'}).
    then(function(response) {
      for(var i=0;i<response.data.length;i++) {
        if(response.data[i].status.status == '1')
          response.data[i].status.status = 'OK';
        else
          response.data[i].status.status = 'Alerta';

        if(response.data[i].status.dimmer == '0')
          response.data[i].status.dimmer = 'Desligada';
        else
          response.data[i].status.dimmer = response.data[i].status.dimmer+'%';
      }
      $scope.rowCollection = response.data;
      // console.log($scope.users);
    }, function(response) {
      $scope.data = response.data || "Request failed";
      $scope.status = response.status;
      console.log($scope.status);
  });

  $scope.lightSelDev = SharelightTAGlist;

  /******************************************** MODAL DIM LIGHT ********************************************/
  //Bind the two services to shares scopes between controllers
  $scope.lightZ = ShareZoomLight;
  $scope.lightSel = SharelightTAGid;

  $scope.DimmerLight = function (light,dimmer,lat,long) {
    // $templateCache.get('dash.ejs');
    // alert(light);
    // console.log(light);
    $scope.lightSel.tag = light;
    $scope.lightSel.dimmer = dimmer;
    $scope.lightSel.lat = lat;
    $scope.lightSel.long = long;
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'modalLights.html',
    //   template:"<div class=\"modal-header\">"+
    // "      <h3 class=\"modal-title\">Dimmer {{SharelightTAGid.tag}} Individual</h3>"+
    // "  </div>"+
    // "  <div class=\"modal-footer\">"+
    // "      <button class=\"btn btn-primary\" type=\"button\" ng-click=\"ok()\">Atuar</button>"+
    // "      <button class=\"btn btn-warning\" type=\"button\" ng-click=\"cancel()\">Fechar</button>"+
    // "  </div>",
      controller: 'ModalInstanceCtrl'
    });
  };

  /******************************************** MODAL LIGHT ********************************************/
  $scope.pageLight = function (TAGD) {
    $scope.lightSelDev.TAG = TAGD;
    var modalInstance = $uibModal.open({
      size:'lg',
      animation: true,
      templateUrl: 'modal.html',
      controller: 'modalLightCtrl'
    });
  };
}]);

lightcontroller.controller('modalLightCtrl', ['$scope','$timeout','$uibModalInstance','SharelightTAGlist','$http','$location', function ($scope, $timeout,$uibModalInstance, SharelightTAGlist, $http,$location) {
  $scope.lightSelDev = SharelightTAGlist;

  $http({method: 'GET', url: '/lights/getLights'}).
    then(function(response) {
      for(var i=0;i<response.data.length;i++) {
        if(response.data[i].TAG == $scope.lightSelDev.TAG){
          if (response.data[i].status.status == '1') {
            response.data[i].status.status = 'Ativa';
          }
          else {
            response.data[i].status.status = 'Offline';
          }
          $scope.lightSpec = response.data[i];
          $scope.toggle = false;
        }

          // console.log($scope.lightSpec);
      }
    }, function(response) {
      $scope.data = response.data || "Request failed";
      $scope.status = response.status;
      console.log($scope.status);
  });

  // $scope.toggle = false;
  //
  // $scope.showLoading = function(){
  //   time = $timeout(function() {
  //   if(!$scope.toggle){
  //     $timeout.cancel(time);
  //     // console.log('Carregado!');
  //     // $scope.toggle = false;
  //     $("#loading").fadeOut();
  //     $("#mainPwrScr").fadeIn();
  //   }
  //   $scope.intervalFunction();
  //   }, 500);
  // };
  //
  // $scope.showLoading();

  $scope.cancel = function () {
    $uibModalInstance.dismiss();
  };
}]);

lightcontroller.controller('timeCtrl',['$scope','$http', '$timeout',function ($scope,$http,$timeout){
  $scope.settings = {
     default: function(){
       var date = new Date();
       return date;
     }
   };

  $scope.hstep = 1;
  $scope.mstep = 1;
  $scope.ismeridian = false;

  $scope.dimmer = "20% - Mínimo";
  $scope.dimopt ={
    values: ["Desligar","20% - Mínimo","30%","40%","50%","60%","70%","80%","90%","100% - Máximo"]
  };

  var groupData = {
    values: []
  };

  //Get the groups to list in the select box
  $http({method: 'GET', url: '/groups/getGroups'}).
    then(function(response) {
      $scope.groups = response.data[0].name;
      for(var i=0;i<response.data.length;i++) {
        groupData.values.push(response.data[i].name);
      }
      $scope.groupopt = groupData;
      createChartGroups($scope.groupopt);
    }, function(response) {
      $scope.data = response.data || "Request failed";
      $scope.status = response.status;
      console.log($scope.status);
  });

  $scope.displayedCollection = [];
  $scope.rowCollection = [];
  $scope.displayedCollection = [].concat($scope.rowCollection);

  $scope.itemsByPage=20;

  function updateAlarms(){
    $http({method: 'GET', url: '/alarms/getAlarms'}).
      then(function(response) {
          $scope.rowCollection = response.data;
          // updateChart(response.data);
      }, function(response) {
        $scope.data = response.data || "Request failed";
        $scope.status = response.status;
        console.log($scope.status);
    });
  }

  $http({method: 'GET', url: '/alarms/getAlarms'}).
    then(function(response) {
        $scope.rowCollection = response.data;
    }, function(response) {
      $scope.data = response.data || "Request failed";
      $scope.status = response.status;
      console.log($scope.status);
  });

  $scope.createAlarm = function(time,groups,dimmer){
    // console.log(time);
    if(typeof time === 'undefined'){
      time = new Date();
    }
    if(dimmer=='Desligar'){
      dimmer = "0%";
    }
    var dataAlarm = {
      // timeAlarm: new Date (new Date().toDateString() + ' ' + time.toString().split(' ')[0]),
      timeAlarm: time,
      dimmer: dimmer.split(' ')[0].split('%')[0],
      group: groups
    };
    var dataToChart = {
      time: time,
      dimmer: dimmer.split(' ')[0].split('%')[0],
      group: groups
    };
    updateChart(dataToChart);
    $http({
        url: '/alarms/save', // No need of IP address
        method: 'POST',
        data: dataAlarm,
        headers: {'Content-Type': 'application/json'}
      }).then(function(response) {
        if(response.data.status=='ok'){
          alert('Alarme agendado com sucesso!');
          updateAlarms();
          $scope.updatedGroup = dataAlarm.groups;
        }
        else
          alert('Não foi possível agendar o alarme pois ele já existe!');
        // $location.path('/main');
      }, function(response) {
        $scope.data = response.data || "Request failed";
        $scope.status = response.status;
        console.log($scope.status);
    });
  };

  $scope.deleteAlarm = function(row){
      deleteFromChart(row);
      $http({
        url: '/alarms/removeAlarms', // No need of IP address
        method: 'POST',
        data: { 'dimmer':row.dimmer,
                'group':row.group,
                'time':row.time },
        headers: {'Content-Type': 'application/json'}
      }).then(function(response) {
        if(response.data.status=='ok'){
          $http({method: 'GET', url: '/alarms/getAlarms'}).
            then(function(response) {
                $scope.rowCollection = response.data;
            }, function(response) {
              $scope.data = response.data || "Request failed";
              $scope.status = response.status;
              console.log($scope.status);
          });

          console.log('Alarme removido com sucesso!');
        }
        else {
          alert('Alarme não encontrado!');
        }
        // $location.path('/main');
      }, function(response) {
        $scope.data = response.data || "Request failed";
        $scope.status = response.status;
        console.log($scope.status);
    });
  };

  var refreshDates = function() {
    $timeout(refreshDates, 1000);
    $http({method: 'GET', url: '/time/getServerTime'}).
      then(function(response) {
          $scope.timeN = response.data.data;
          // $scope.rowCollection = response.data;
      }, function(response) {
        $scope.data = response.data || "Request failed";
        $scope.status = response.status;
        console.log($scope.status);
    });
  };

  refreshDates();

  // Functions to manipulate the highcharts.js - KEEP DISTANCE
  var chart = new Highcharts.Chart({
        chart: {
            type: 'area',
            renderTo: 'graphTime'
        },
        title: {
            text: 'Horários'
        },
        subtitle: {
            text: 'Diário'
        },
        credits: {
        		enabled: false
        },
        xAxis: {
		        min : 0,
            max : 86400000,
            showFirstLabel: true,
            tickInterval: 3600 * 2000,
            type: 'datetime',
            dateTimeLabelFormats: {
                hour: '%H:%M',
            },
            title: {
                text: 'Time'
            },
            labels: {
 								format: "{value:%H:%M}",
                enabled: true,

						},
            gridLineWidth: 1,
            plotBands: [{
                from: 0,
                to: 21600000,
                color: '#f5f5f5',
                label: {
                    text: '',
                    style: {
                        color: '#999999'
                    },
                    //y: 50
                }
            },{
                from: 21600000,
                to: 64800000,
                color: '#ffffff',
                label: {
                    text: '',
                    style: {
                        color: '#999999'
                    },
                  //  y: 100
                }
            },{
                from: 64800000,
                to: 86400000,
                color: '#f5f5f5',
                label: {
                    text: '',
                    style: {
                        color: '#999999'
                    },
                    //y: 50
                }
            }],
        },
        global: {
                useUTC: false
            },
        yAxis: {
            title: {
                text: 'Dimmer'
            },
            min: 0,
            max: 100,
            tickInterval: 10,
            minTickInterval: 10,
            labels: {
								format: '{value} %'
            },

        },
        tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.x:%H:%M} - {point.y} %',
            shared: false,
            borderRadius: 0,
            borderWidth: 0,
            shadow: true,
            enabled: true,
            backgroundColor: 'none'
        },
        plotOptions: {
            spline: {
                marker: {
                    enabled: true
                },
            },
            area: {
                fillOpacity: 0.1
            }
        }
    });

  function deleteFromChart(row){
    /********************** DELETE DATA ON THE CHART **********************/
    // var chart = $('#graph_sch').highcharts();
    var  graphSeries = chart.series;
    // console.log("TRABALHAREI COM:"+getTimestamp(row.time)+" "+Number(row.dimmer));
    // console.log(chart);
    for (var j = 0; j < graphSeries.length; j++) {
      if(row.group == graphSeries[j].name){
        var times = chart.series[j].data;
        for (var i = 0; i < times.length; i++) {
          if(times[i].x == getTimestamp(row.time)){
            if (times[i].y == Number(row.dimmer)) {
              // console.log("Existe esse alarme no gráfico");
              // console.log("ENCONTREI COM:"+getTimestamp(row.time)+" "+Number(row.dimmer));
              chart.series[j].data[i].remove();
              // console.log(times[i]);
            }
          }
        }
      }
    }
    /********************** DELETE DATA ON THE CHART **********************/
  }

  function createChart(data){
    //NOT CALL THIS FUNCTION AFTER THE CHART WAS DONE
    var  graphSeries = chart.series;
    // console.log(data);
    for (var j = 0; j < graphSeries.length; j++) {
      for (var i = 0; i < data.length; i++) {
        if(data[i].group == graphSeries[j].name){
          chart.series[j].addPoint([
            getTimestamp(data[i].time),
            Number(data[i].dimmer)
          ]);
        }
      }
    }
  }

  function getTimestamp(dataS) {
    var teste = moment(dataS).format('HH:mm');
    var valueArray = teste.split(':');

    var result = Number(valueArray[0])*60*60*1000+Number(valueArray[1])*60*1000;
    // var hour = dataS.toString().split(':'),
    //     minute = hour[1].toString().split(' '),
    //     meri = minute[1];
    //
    // var calcHour,calcMinute,result;
    // if (hour[0] == '12' && meri == 'PM'){
    //    calcHour = (Number(hour[0]))*60*60*1000;
    //  }
    //  else if (meri == 'PM') {
    //     calcHour = (Number(hour[0])+12)*60*60*1000;
    //  }
    //  else if (hour[0] == '12' && meri == 'AM'){
    //    calcHour = (Number(hour[0]-12))*60*60*1000;
    //  }
    //  else {
    //     calcHour = (Number(hour[0]))*60*60*1000;
    //  }
    // calcMinute = Number(minute[0])*60*1000;
    // result = calcHour+calcMinute;
    // // console.log(Number(minute[0]));
    // return result;
    // console.log("DATA="+result);
    // console.log(result);
    return result;
  }

  function updateChart(pointToAdd) {
    /********************** ADD DATA ON THE CHART **********************/
    // console.log(moment(pointToAdd.time).format('x'));
    var  graphSeries = chart.series;
    for (var j = 0; j < graphSeries.length; j++) {
      if(pointToAdd.group == graphSeries[j].name){
        console.log(pointToAdd.time);
        chart.series[j].addPoint([
          getTimestamp(pointToAdd.time),
          Number(pointToAdd.dimmer)
        ]);
      }
    }
    /********************** ADD DATA ON THE CHART **********************/
  }

  function createChartGroups(data) {
    // console.log(data);
    // var chart = $('#graph_sch').highcharts();
    for (var i = 0; i < data.values.length; i++) {
      // alert("Criando grupo:"+data.values[i]);
      chart.addSeries({
            name: data.values[i],
            step: 'left',
            data: [
                [0, 0],
                [86400000, 0]]
      });
    }
    $http({method: 'GET', url: '/alarms/getAlarms'}).
      then(function(response) {
          createChart(response.data);
      }, function(response) {
        $scope.data = response.data || "Request failed";
        $scope.status = response.status;
        // console.log($scope.status);
    });
  }

  // listen to class-manipulation
  $(".toggled").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
    if(document.getElementById("graphTime") !== null)
      chart.setSize($('#graphTime').width(),$('#graphTime').height());
    // alert("data binding");
  });

  $(".untoggled").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
    if(document.getElementById("graphTime") !== null)
      chart.setSize($('#graphTime').width(),$('#graphTime').height());
    // alert("added untoggled class");
  });
  //
  // $('.sidebar-nav').attrchange(function(e, attrName) {
  //   chart.setSize($('#graphTime').width(),$('#graphTime').height());
  //
  // });
  // $("#wrapper").addClass("toggled").trigger('classChange');
  // $("#wrapper").on('classChange', function() {
  // });

  // in another js file, far, far away
  // $('#wrapper').on('classChange', function() {
  //   chart.setSize($('#graphTime').width(),$('#graphTime').height());
  //   alert("teste");
  // });

  // $("#wrapper").on("domchange",
  //   {
  //       descendents: false,
  //       recordPriorValues: {
  //           attributes: true
  //       }
  //   },
  //   function() {
  //     chart.setSize($('#graphTime').width(),$('#graphTime').height());
  //   }
  //   );

}]);

//Not used anymore, if you want to see just call /power in webpage
lightcontroller.controller('powerCtrl',['$scope','$http', '$timeout','$TreeDnDConvert',function ($scope,$http,$timeout,$TreeDnDConvert){
  // Function to replicate setInterval using $timeout service.
  $scope.intervalFunction = function(){
    time = $timeout(function() {
      $scope.getData();
      // $scope.getTreeData();
      $scope.intervalFunction();
    }, 900);
  };
  //$scope.intervalFunction();
  $scope.$on('$routeChangeStart', function(scope, next, current){
    $timeout.cancel(time);
  });

  /********************************Chart of Power******************************/

  var groupData = {
    values: []
  };
  var dataPower;

  var init = false;

  $scope.groupName = "Total";

  $http({method: 'GET', url: '/groups/getGroups'}).
    then(function(response) {
      $scope.groups = response.data[0].name;
      // $scope.groupName = response.data[0].name;
      for(var i=0;i<response.data.length;i++) {
        groupData.values.push(response.data[i].name);
      }
      // init = true;
      // formatTree(response.data);
      // $scope.groups = response.data;
      $scope.groupopt = groupData;
    }, function(response) {
      $scope.data = response.data || "Request failed";
      $scope.status = response.status;
      console.log($scope.status);
  });

  Highcharts.setOptions({
      global: {
          useUTC: false
      }
  });

  var chart = new Highcharts.Chart({
       chart: {
          type: 'spline',
          renderTo: 'powerGraph',
           animation: Highcharts.svg, // don't animate in old IE
           marginRight: 10,
           events: {
               load: function () {
                   // set up the updating of the chart each second
                   var series = this.series[0];
                   setInterval(function () {
                       var x = (new Date()).getTime(), // current time
                           y = dataPower;
                       series.addPoint([x, y], true, true);
                   }, 1000);
               }
           }
       },
       title: {
           text: ' '
       },
       xAxis: {
           type: 'datetime',
           tickPixelInterval: 150
       },
       yAxis: {
           title: {
               text: 'Potência Instantânea'
           },
           plotLines: [{
               value: 0,
               width: 1,
               color: '#000000'
           }]
       },
       tooltip: {
           formatter: function () {
               return '<b>' + this.series.name + '-'+$scope.groupName+'</b><br/>' +
                   Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                   '<b>'+Highcharts.numberFormat(this.y, 2)+'W</b>';
           }
       },
       legend: {
           enabled: false
       },
       plotOptions: {
            series: {
                color: '#000000'
            },
            line: {
                connectNulls: true
            }
       },
       exporting: {
           enabled: false
       },
       series: [{
           name: 'Potência',
           data: (function () {
               // generate an array of random data
               var data = [],
                   time = (new Date()).getTime(),
                   i;

               for (i = -19; i <= 0; i += 1) {
                   data.push({
                       x: time + i * 1000,
                       y: 0
                   });
               }
               return data;
           }())
       }]
   });

  $scope.getData = function(){
    // var data = [];
    // for(var i=0;i<groupData.values.length;i++) {
    //     data.push(groupData.values[i]);
    // }
    $http({
      url: '/log/getPower', // No need of IP address
      method: 'POST',
      data: [$scope.groupName],
      headers: {'Content-Type': 'application/json'}
    }).then(function(response) {
      if (response.data[0].power.value) {
        dataPower = response.data[0].power.value;
      }
      else {
        dataPower = 0;
      }
    }, function(response) {
      $scope.data = response.data || "Request failed";
      $scope.status = response.status;
      console.log($scope.status);
    });
    // console.log('Getting data from server!');
  };

  $scope.changeGraph = function(group){
    $scope.groupName = group;
  };


  $(".toggled").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
    if(document.getElementById("powerGraph") !== null)
      chart.setSize($('#powerGraph').width(),$('#powerGraph').height());
    // alert("data binding");
  });

  $(".untoggled").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
    if(document.getElementById("powerGraph") !== null)
      chart.setSize($('#powerGraph').width(),$('#powerGraph').height());
    // alert("added untoggled class");
  });

  /********************************Data of angular-tree-table******************************/
  var tree;
  $scope.tree_data = {};
  $scope.my_tree = tree = {};
  $scope.tree_data = 'load';

  $http({method: 'GET', url: '/groups/getGroupsList'}).
    then(function(response) {
      $scope.tree_data = $TreeDnDConvert.line2tree(response.data, 'DemographicId', 'ParentId');
    }, function(response) {
      $scope.data = response.data || "Request failed";
      $scope.status = response.status;
      console.log($scope.status);
  });

  $scope.toggle = true;

  $scope.showLoading = function(){
    time = $timeout(function() {
    if($scope.tree_data == 'load'){
      console.log('Carregando...');
    }
    else{
      $timeout.cancel(time);
      console.log('Carregado!');
      $scope.toggle = false;
      $("#loading").fadeOut();
      $("#mainPwrScr").fadeIn();
    }
    $scope.intervalFunction();
    }, 500);
  };

  $scope.showLoading();

  $scope.expanding_property = {
      /*template: "<td>OK All</td>",*/
      field:       "Grupo",
      titleClass:  'text-left',
      cellClass:   'v-middle',
      displayName: 'Grupo'
  };

  $scope.col_defs = [{
      field: "Potência"
    },
    {
      field:"Status"
    }];
}]);

lightcontroller.config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
      colours: ['#464646', '#FF8A80','blue'],
      responsive: true
    });
    // Configure all line charts
    ChartJsProvider.setOptions('Line', {
      datasetFill: true
    });
}]);

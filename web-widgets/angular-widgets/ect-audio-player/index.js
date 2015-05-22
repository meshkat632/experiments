
var app = angular.module('calendarDemoApp', ['ect-scheduler']);
app.controller('CalendarCtrl', ['$scope', function($scope){
  function generateUUID(){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    }
  $scope.events=[


    { id:generateUUID(), "title": "", start:{day:0 ,"time": "06:15:00"}, end:{day:0, "time":"08:00:00"}, color:  'pink'},
    { id:generateUUID(), "title": "", start:{day:0 ,"time": "08:00:00"}, end:{day:0,"time":"17:00:00"}, color:  'green'},
    { id:generateUUID(), "title": "", start:{day:0 ,"time": "17:00:00"}, end:{day:0,"time":"18:00:00"}, color:  'pink'},

    { id:generateUUID(), "title": "", start:{day:1 ,"time": "06:15:00"}, end:{day:1, "time":"08:00:00"}, color:  'pink'},
    { id:generateUUID(), "title": "", start:{day:1 ,"time": "08:00:00"}, end:{day:1,"time":"17:00:00"}, color:  'green'},
    { id:generateUUID(),"title": "", start:{day:1 ,"time": "17:00:00"}, end:{day:1,"time":"18:00:00"}, color:  'pink'},

    { id:generateUUID(),"title": "", start:{day:2 ,"time": "06:15:00"}, end:{day:2,"time":"08:00:00"}, color:  'pink'},
    { id:generateUUID(),"title": "", start:{day:2 ,"time": "08:00:00"}, end:{day:2,"time":"17:00:00"}, color:  'green'},
    { id:generateUUID(),"title": "", start:{day:2 ,"time": "17:00:00"}, end:{day:2,"time":"18:00:00"}, color:  'pink'},

    { id:generateUUID(),"title": "", start:{day:3 ,"time": "06:15:00"}, end:{day:3,"time":"08:00:00"}, color:  'pink'},
    { id:generateUUID(),"title": "", start:{day:3 ,"time": "08:00:00"}, end:{day:3,"time":"17:00:00"}, color:  'green'},
    { id:generateUUID(),"title": "", start:{day:3 ,"time": "17:00:00"}, end:{day:3,"time":"18:00:00"}, color:  'pink'},

    { id:generateUUID(), "title": "", start:{day:4 ,"time": "06:15:00"}, end:{day:4,"time":"08:00:00"}, color:  'pink'},
    { id:generateUUID(),"title": "", start:{day:4 ,"time": "08:00:00"}, end:{day:4,"time":"17:00:00"}, color:  'green'},
    { id:generateUUID(),"title": "", start:{day:4 ,"time": "17:00:00"}, end:{day:4,"time":"18:00:00"}, color:  'pink'}
  ];


    /*
    $scope.options ={
        minTime: "05:00:00",
        maxTime: "19:00:00",
        slotDuration:'00:30:00',
        dayNames:['sunday', 'monday', 'Tuesday', 'Wednesday','Thursday', 'Friday', 'Saturday']

    };
    */

}]);

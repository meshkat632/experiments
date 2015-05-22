angular.module('ect-scheduler', []).directive('ectScheduler', ['$document', function($document) {

  function generateid(){
    var d = new Date().getTime();
    var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return id;
  }
  function start($scope,element, readonly) {

    $scope.cleancount = 0;



    function onClicked(event, jsEvent){

      console.log('onClicked:', event._toString(), jsEvent.which);

      /*
      if($scope.options.onClicked){
        var temp = event.originalModel;
        $scope.options.onClicked(temp);
      }
      */
    }



    function updateGeometry(event){

      var frt = "dd, HH:mm:ss";

      var min = angular.copy(moment.min([event.start, event.end])).day(0).hour(0).minute(0).second(0);
      //console.log('min-day:',min.format(frt));

      var _min = min.toDate().getTime();
      var x1 = event.start.toDate().getTime();
      var y1 = event.end.toDate().getTime();
      //console.log('min-day:',_min, x1, y1);

      if( x1 == y1){
        event.errors.push('start and end time cannot be same');
      }
      if( x1 > y1){
        event.errors.push('end time cannot be smaller then start');
      }

      var start_day = event.start.day();
      var end_day = event.end.day();

      if( start_day != end_day){
        event.errors.push('start and end must be on the same day');
      }

      if(_min > x1 || _min>y1){
        //console.error('invalid time');
        event.errors.push('invalid structure');
        return false;
      }

      if(event.errors.length>0){
        return false;
      }

      var CONST_1800000 = 1;




      //var _start = moment(event.start, moment.ISO_8601);
      //var _end = moment(event.end, moment.ISO_8601);

      //console.log('_end:',_end.format(frt));

      x1 = x1-_min;
      y1 = y1-_min;
      var height = Math.abs((y1-x1)/CONST_1800000);
      event.geometry = {top: (x1/CONST_1800000), height: height};
      event._toString = function(){
        var ret ="";
        ret = ret +" top:"+event.geometry.top;
        ret = ret +" height:"+event.geometry.height;
        ret = ret +" id:"+event.id;

        return ret;
      }
      return true;

    }



    function isGeometryOverlapping(geom1, geom2){
      var distance = getDistance(geom1, geom2);
      console.log('distance',distance, geom1, geom2);

      var x = geom2.top-geom1.top-geom1.height;
      console.log(x);
      if(x == 0) return false;
      if(x > 0) return false;
      return true;
    }

    function getDistance(geom1, geom2){
      var x= Math.abs((2*geom2.top+geom2.height)- (2*geom1.top+geom1.height)) - geom1.height -geom2.height;
      //console.log('getDistance', geom1, geom2,x/2);
      return x/2;

    }

    function isValidChange(__event){
      updateGeometry(__event);
      //console.log('$scope.events.length',$scope.events.length, __event.id, __event.geometry );
      var validEvents = $scope.events.filter(function(event){
        //console.log('_event.ignored',event.ignored);
        if(event.ignored || __event.id == event.id)
          return false;
        else
          return true;
      });
      //console.log('validEvents',validEvents);
      var ret = 0;
      validEvents.forEach(function(validEvent){
        //console.log(__event.id , 'checking with ',validEvent);
        var dis = getDistance(__event.geometry, validEvent.geometry);
        //console.log(__event.geometry, '-->',validEvent.geometry, dis);
        if( dis < 0 ){
           ret = ret+1;
        }
      });
      if(ret == 0)
        return true;
      else
        return false;
    }

    function onResize(event, revertFunc){
      var _isValidChange = isValidChange(event);
      //console.log('onResize', event.title + " end is now " + event.end.format());
      //console.log('onResize old',event.id, event.start.format(), event.end.format());

      if(_isValidChange){
        console.log('validResize',event._toString());
        onChanges(event);
      }else{
        console.log('invalidResize',event._toString());
        revertFunc();
      }
      //onChanges(event);

    }

    function onEventDrop(event, revertFunc){
      var _isValidChange = isValidChange(event);
      //console.log('onEventDrop', event.title + " end is now " + event.end.format(), _isValidChange);
      if(_isValidChange){
        //console.log('validDrop',event._toString());
        event.title = 'changed';
        onChanges(event);
      }else{
        //console.log('invalidDrop',event._toString());
        revertFunc();
      }

    }
    function onChanges(event){
      var start = event.start;
      var end = event.end;


      var oldEvent  = getEventWithId(event.id);
      //console.log('oldEvent',oldEvent);

      var newEvent = { id:oldEvent.id,title: oldEvent.title, start: { day: start.day(), time:start.format("HH:mm:ss")}, end:{day: end.day(), time:end.format("HH:mm:ss")}, color: oldEvent.color};
      //console.log('onChanges',newEvent);


      if($scope.options.onChanges){
        if($scope.options.onChanges(oldEvent, newEvent)){
          oldEvent.color = newEvent.color;
          oldEvent.title = newEvent.title;
          oldEvent.start = newEvent.start;
          oldEvent.end = newEvent.end;
          $scope.$apply();
        }
      }

    }
    function onSelect(start, end){

      if(start.day() == end.day()){
        var newEvent = {  id:generateid(),"title": "", "start": { day: start.day(), time:start.format("HH:mm:ss")}, "end":{day: end.day(), time:end.format("HH:mm:ss")}, color: 'blue'};
        //var newEvent = {  id:generateid(),"title": "", "start": start, "end":end, color: 'blue'};
        if($scope.options.onAddEvent){
          $scope.options.onAddEvent(newEvent);
        }
      }else{
        element.fullCalendar('unselect');
      }

    }




    function getEventWithId(eventId){
      var ret = undefined;
      $scope.events.forEach(function(event){
          //console.log('getEventWithId',eventId, event);
          if(event.id == eventId){
            ret = event;
            //console.log(event);
          }

      });
      return ret;
    }
    function onDblclicked(eventId){
      var eventTobedeleted = getEventWithId(eventId);
      if($scope.options.onDblclicked && eventTobedeleted ) {
        $scope.options.onDblclicked(eventTobedeleted);
      }
    }

    function onRemove(eventId){

      //console.log('onRemove eventId:',eventId);
      var eventTobedeleted = getEventWithId(eventId);

      if($scope.options.onRemoveEvent){
        if($scope.options.onRemoveEvent(eventTobedeleted)){
          var index = $scope.events.indexOf(eventTobedeleted);
          $scope.events.splice(index, 1);
          $scope.$apply();
          return;
        }
        else return;

      }



    }
    function onEdit(eventId){
      //console.log('onEdit eventId:',eventId);
      var eventTobeEdited = getEventWithId(eventId);
      //console.log('onEdit:',eventTobeEdited);
      if($scope.options.onEditEvent){
        $scope.options.onEditEvent(eventTobeEdited);
        return;
      }

    }
      var getEditText = function(){
          if($scope.options)
              if($scope.options.contextMenuTexts)
                return $scope.options.contextMenuTexts.edit;
          return undefined;
      }
      var getDeleteText = function(){
          if($scope.options)
              if($scope.options.contextMenuTexts)
                  return $scope.options.contextMenuTexts.delete;
          return undefined;
      }


    var options ={
      defaultView:'agendaWeek',
      weekends: true,
      editable: !readonly,
      header:{
        left: '',
        center: '',
        right: ''
      },
    /*
      eventConstraint: {
        start: '00:00', // a start time (10am in this example)
        end: '24:00', // an end time (6pm in this example)

        dow: [ 0,1, 2, 3, 4,5,6,7 ]
        // days of week. an array of zero-based day of week integers (0=Sunday)
        // (Monday-Thursday in this example)
      },
      */
        selectConstraint : {
        start: '00:00', // a start time (10am in this example)
        end: '24:00', // an end time (6pm in this example)

        dow: [ 0,1, 2, 3, 4,5,6,7 ]
        // days of week. an array of zero-based day of week integers (0=Sunday)
        // (Monday-Thursday in this example)
      },
      columnFormat: 'dddd',
      axisFormat: 'H:mm',
      timeFormat:'H:mm',
      allDaySlot: false,
      minTime: $scope.options.minTime|| "00:00:00",
      maxTime: $scope.options.maxTime||"24:00:00",

      slotDuration: $scope.options.slotDuration|| '00:30:00',
      slotEventOverlap: false,
      eventRender: function( _event, element, view ) {
        element.addClass('context-event-id-'+_event.id);
        element.addClass('context-class-ect');
        element.dblclick(function() {
          //console.log( "dblclicked",_event.id);
          onDblclicked(_event.id);
        });
        element.one("click",function() {
          //console.log( "clicked",_event.id, _event.geometry);

        });

      },
      eventAfterAllRender: function(view ){
         if(readonly){
             return;
         }
         $.contextMenu({
         selector: '.context-class-ect',
         callback: function(key, options) {
           /*
           //console.log('key',key);
           //console.log('options',options);
           console.log('options.event',$(this).parent());
           console.log('ectEventId',$(this).parent().ectEventId);
           console.log('options.event',$(this).get());
           console.log('options.class',$(this).attr("class"));
           */
           var classes = $(this).attr("class").split(' ');
           $.each(classes, function( index, value ) {
             if( value.indexOf("context-event-id-") != -1){
               var eventid = value.replace("context-event-id-", "");
               //console.log('eventid',eventid);
               if(key == 'delete')onRemove(eventid);
               if(key == 'edit')onEdit(eventid);
             }
           });








          /*
          if(key == 'delete')onRemove(event);
          if(key == 'edit')onEdit(event);
          */
         },
         items: {
          //"edit": {name: $scope.options.contextMenuTexts.edit||"Edit", icon: "edit"},
          //"delete": {name: $scope.options.contextMenuTexts.delete||"Delete", icon: "delete"},
          "edit": {name: getEditText()||"Edit", icon: "edit"},
          "delete": {name: getDeleteText()||"Delete", icon: "delete"},

             "sep1": "---------"
         }
         });

      },
      eventClick: function(calEvent, jsEvent, view) {
        //onClicked(calEvent,jsEvent);
      },
      defaultDate: '2015-03-01',
      selectOverlap: false,
      selectable: true,
      selectHelper: false,
      select: function(start, end) {
        onSelect(start, end);
      },
      dayNames:$scope.options.dayNames|| ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'],
      eventResize: function(event, delta, revertFunc) {
        onResize(event, revertFunc);
      },
      eventResizeStop:function(event, delta, revertFunc) {
        //onChanges(event);
        //onResize(event, revertFunc);
      },
      eventDrop:function(event, delta, revertFunc) {
        onEventDrop(event, revertFunc);
      }

    };
    $scope.getDayNanme = function (day) {
      return options.dayNames[day-1];
    };
    element.fullCalendar(options);




    element.find('fc-toolbar').remove();









    function draw(events){

      var eventSource =[];
      events.forEach(function(event){
        //console.log('event:',event);

        var newEvent ={
          id:  generateid(),
          title: event.title,
          start: moment('2015-03-0'+(event.start.day+1)+'T'+event.start.time),
          end: moment('2015-03-0'+(event.end.day+1)+'T'+event.end.time),
          color:event.color,
          originalModel: event,
          _overlap:{ overlapped: false, overlappedWith: [], overlappedChecked: false},
          overlap: false,
          validationErrors:[]
        }

        //event.$guiModel$ = newEvent;
        eventSource.push(newEvent);
      });
      element.fullCalendar( 'removeEvents');
      if(events.length>0)
        element.fullCalendar('addEventSource', eventSource);
    }

    function onData(){

      //console.log('events changes',$scope.events);
      var eventSource =[];
      $scope.events.forEach(function(event){
        //console.log('event:',event);

        var newEvent ={
          id: $scope.generateid(),
          title: event.title,
          start: moment('2015-03-0'+(event.start.day+1)+'T'+event.start.time),
          end: moment('2015-03-0'+(event.end.day+1)+'T'+event.end.time),
          color:event.color,
          originalModel: event,
          _overlap:{ overlapped: false, overlappedWith: [], overlappedChecked: false},
          overlap: false,
          validationErrors:[]
        }

        //event.$guiModel$ = newEvent;
        eventSource.push(newEvent);
      });


      var invalidEventsCount = validateEvents(eventSource);
      var overlapCount = checkoverlaping(eventSource);




      var validEventSource = eventSource.filter(function(event){
        if(event.validationErrors.length>0){
          //console.error('event.validationErrors:',event.validationErrors);
          event.originalModel.invalid = true;
          event.originalModel.error = event.validationErrors;
          //return false;
        }
        event.originalModel.invalid = false;
        event.originalModel.error = undefined;
        event.validationErrors =[];
        return true;
      });

      if(invalidEventsCount >0 || overlapCount >0){
        var valids = [];
        $scope.events.forEach(function(event){
          if(!event.invalid){
            valids.push(event);
          }
        });
        $scope.events = valids;
      }

      draw(validEventSource);
    }






  function generateid(){
    var d = new Date().getTime();
    var id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return id;
  }

  function validateEvents(events){
    var invalidEventCount = 0;
    events.forEach(function(event){
      var x1 = event.start.toDate().getTime();
      var y1 = event.end.toDate().getTime();

      if(x1 > y1) { invalidEventCount ++; event.validationErrors.push('failed rule: start < end ');}
      if(x1 == y1){ invalidEventCount ++; event.validationErrors.push('failed rule: start != end ');}

      var startWeekday = event.start.weekday();
      var endWeekday = event.end.weekday();
      if(startWeekday != endWeekday) { invalidEventCount ++; event.validationErrors.push('failed rule: every event must starts and ends on the same day!');}
    });
    return invalidEventCount;
  }




  function clean(events){
    $scope.cleancount =$scope.cleancount+1;
    //console.log('$scope.cleancount:',$scope.cleancount);
    var count = 0;
    events.forEach(function(event){
      event.errors = [];

      event.id = event.id|| generateid();
      event.invalid = true;
      event.geometry = undefined;
      event.overlap = false;
      if(!event.start.parsed){
        event.originalcolor = event.color;
        event.start = moment('2015-03-0'+(event.start.day+1)+'T'+event.start.time,moment.ISO_8601);
        event.start.parsed = true;
      }
      if(!event.end.parsed){
        event.originalcolor = event.color;
        event.end = moment('2015-03-0'+(event.end.day+1)+'T'+event.end.time,moment.ISO_8601);
        event.end.parsed = true;
      }

      updateGeometry(event);
      /*
      var isvalid =
      if(isvalid){
        //event.color = event.originalcolor;
      }
      else{
        //event.color = 'black';
        event.errors.push('invalid structure');

      }
      */
    });


    events.forEach(function(event){
      events.forEach(function(_event){
        if(event.id != _event.id && event.geometry && _event.geometry){
          var dis = getDistance(event.geometry, _event.geometry);
          //console.log('checking distance ', event.geometry,  'with ',_event.geometry, dis );
          if( dis < 0 ){
            //console.log('overlapping ', event.geometry,  'with ',_event.geometry);
            var frt = "dddd, HH:mm:ss";
            event.errors.push('overlapping with other event: start:['+_event.start.format(frt)+'] end:['+ _event.end.format(frt)+']');
            //_event.color = 'red';
          }
        }
      });
    });


    var eventSource = events.filter(function(__event){
      //console.log('__event errors ', __event.errors);
      if(__event.errors.length > 0){
        __event.ignored = true;
        //__event.color = 'black';
        return false;

      }
      else {
        //__event.color = __event.originalcolor;
        __event.ignored = false;
        return true;
      }
    });


    element.fullCalendar( 'removeEvents');
    if(events.length>0)
      element.fullCalendar('addEventSource', eventSource);
  }


    if(!readonly){
        $scope.$watch('events', function(newValue, oldValue) {
            console.log('onchanges:',newValue);
            if(newValue){
                clean(newValue);
                //draw($scope.events);
            }
            //onData();
        }, true);
    }

  clean($scope.events);


  }

  return {
    templateUrl: 'js/ect-scheduler.html',
    replace: true,
    scope:{
      events : "=events",
      options: "=options",
      readonly:"@"
    },
    link: function(scope, element, attr) {
        scope.options = scope.options || {};
        scope.events = scope.events || [];
        if(attr.readonly){
            //console.log('events:', scope.events);
            //console.log('options:', scope.options);
            start(scope, element, true);
        }
        else
            start(scope, element, false);
        //start(scope, element);
    }
  };
}]);

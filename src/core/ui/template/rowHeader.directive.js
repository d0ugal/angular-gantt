(function(){
    'use strict';
    angular.module('gantt').directive('ganttRowHeader', ['GanttDirectiveBuilder', function(Builder) {
        var builder = new Builder('ganttRowHeader');
        builder.controller = function($scope, $element) {
            $scope.gantt.rowHeader.$element = $element;
            $scope.gantt.rowHeader.$scope = $scope;
        };
        return builder.build();
    }]);
}());


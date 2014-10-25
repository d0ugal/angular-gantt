'use strict';
gantt.directive('ganttScrollable', ['GanttScrollable', 'ganttDebounce', 'GANTT_EVENTS', function(Scrollable, debounce, GANTT_EVENTS) {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        templateUrl: function(tElement, tAttrs) {
            if (tAttrs.templateUrl === undefined) {
                return 'template/default.scrollable.tmpl.html';
            } else {
                return tAttrs.templateUrl;
            }
        },
        controller: ['$scope', '$element', function($scope, $element) {
            $scope.template.scrollable = new Scrollable($element);

            var lastScrollLeft;

            $element.bind('scroll', debounce(function() {
                var el = $element[0];
                var direction;
                var date;

                if (el.scrollLeft < lastScrollLeft && el.scrollLeft === 0) {
                    direction = 'left';
                    date = $scope.gantt.from;
                } else if (el.scrollLeft > lastScrollLeft && el.offsetWidth + el.scrollLeft >= el.scrollWidth - 1) {
                    direction = 'right';
                    date = $scope.gantt.to;
                }

                lastScrollLeft = el.scrollLeft;

                if (date !== undefined) {
                    $scope.autoExpandColumns(el, date, direction);
                    $scope.$emit(GANTT_EVENTS.SCROLL, {left: el.scrollLeft, date: date, direction: direction});
                } else {
                    $scope.$emit(GANTT_EVENTS.SCROLL, {left: el.scrollLeft});
                }
            }, 5));

            $scope.$watch('gantt.columns.length', function(newValue, oldValue) {
                if (!angular.equals(newValue, oldValue) && newValue > 0 && $scope.gantt.scrollAnchor !== undefined) {
                    // Ugly but prevents screen flickering (unlike $timeout)
                    $scope.$$postDigest(function() {
                        $scope.scrollToDate($scope.gantt.scrollAnchor);
                    });
                }
            });
        }]
    };
}]);
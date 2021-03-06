(function() {
    'use strict';
    angular.module('gantt').factory('GanttTask', [function() {
        var Task = function(row, model) {
            this.rowsManager = row.rowsManager;
            this.row = row;
            this.model = model;
            this.truncatedLeft = false;
            this.truncatedRight = false;
        };

        Task.prototype.isMilestone = function() {
            return !this.model.to || this.model.from - this.model.to === 0;
        };

        // Updates the pos and size of the task according to the from - to date
        Task.prototype.updatePosAndSize = function() {
            this.modelLeft = this.rowsManager.gantt.getPositionByDate(this.model.from);
            this.modelWidth = this.rowsManager.gantt.getPositionByDate(this.model.to) - this.modelLeft;

            this.left = Math.min(Math.max(this.modelLeft, 0), this.rowsManager.gantt.width);
            if (this.modelLeft < 0) {
                this.truncatedLeft = true;
                if (this.modelWidth + this.modelLeft > this.rowsManager.gantt.width) {
                    this.truncatedRight = true;
                    this.width = this.rowsManager.gantt.width;
                } else {
                    this.truncatedRight = false;
                    this.width = this.modelWidth + this.modelLeft;
                }
            } else if (this.modelWidth + this.modelLeft > this.rowsManager.gantt.width) {
                this.truncatedRight = true;
                this.truncatedLeft = false;
                this.width = this.rowsManager.gantt.width - this.modelLeft;
            } else {
                this.truncatedLeft = false;
                this.truncatedRight = false;
                this.width = this.modelWidth;
            }

            if (this.width < 0) {
                this.left = this.left + this.width;
                this.width = -this.width;
            }

            this.updateView();
        };

        Task.prototype.updateView = function() {
            if (this.$element) {
                this.$element.css('left', this.left + 'px');
                this.$element.css('width', this.width + 'px');

                this.$element.css('background-color', this.model.color);
                this.$element.css('z-index', this.model.priority);

                this.$element.toggleClass('gantt-task-milestone', this.isMilestone());
                this.$element.toggleClass('gantt-task', !this.isMilestone());

                for (var i = 0; i < this.model.classes; i++) {
                    this.$element.toggleClass(this.model.classes[i], true);
                }

                this.$element.toggleClass('gantt-task', !this.isMilestone());
            }
        };

        // Expands the start of the task to the specified position (in em)
        Task.prototype.setFrom = function(x, magnetEnabled) {
            this.model.from = this.rowsManager.gantt.getDateByPosition(x, magnetEnabled);
            this.row.setFromToByTask(this);
            this.updatePosAndSize();
        };

        // Expands the end of the task to the specified position (in em)
        Task.prototype.setTo = function(x, magnetEnabled) {
            this.model.to = this.rowsManager.gantt.getDateByPosition(x, magnetEnabled);
            this.row.setFromToByTask(this);
            this.updatePosAndSize();
        };

        // Moves the task to the specified position (in em)
        Task.prototype.moveTo = function(x, magnetEnabled) {
            if (x > this.left) {
                // Driven by right/to side.
                this.model.to = this.rowsManager.gantt.getDateByPosition(x + this.modelWidth, magnetEnabled);
                var newTaskRight = this.rowsManager.gantt.getPositionByDate(this.model.to);
                this.model.from = this.rowsManager.gantt.getDateByPosition(newTaskRight - this.modelWidth, false);
            } else {
                // Drive by left/from side.
                this.model.from = this.rowsManager.gantt.getDateByPosition(x, magnetEnabled);
                var newTaskLeft = this.rowsManager.gantt.getPositionByDate(this.model.from);
                this.model.to = this.rowsManager.gantt.getDateByPosition(newTaskLeft + this.modelWidth, false);
            }

            this.row.setFromToByTask(this);
            this.updatePosAndSize();
        };

        Task.prototype.clone = function() {
            return new Task(this.row, angular.copy(this.model));
        };

        return Task;
    }]);
}());


;(function (define, undefined) {
'use strict';
define(['jquery', 'underscore', 'annotator'], function ($, _, Annotator) {
    /**
     * Adds the Accessibility Plugin
     **/
    Annotator.Plugin.Accessibility = function () {
        // Call the Annotator.Plugin constructor this sets up the element and
        // options properties.
        Annotator.Plugin.apply(this, arguments);
    };

    $.extend(Annotator.Plugin.Accessibility.prototype, new Annotator.Plugin(), {
        pluginInit: function () {
            this.annotator.subscribe('annotationViewerTextField', _.bind(this.addAriaAttributes, this));
            this.annotator.element.on('keydown', '.annotator-hl', _.bind(this.onHighlightKeyDown, this));
            this.annotator.element.on('keydown', '.annotator-controls', _.bind(this.onControlsKeyDown, this));
            this.addTabIndex();
        },

        destroy: function () {
            this.annotator.unsubscribe('annotationViewerTextField', this.addAriaAttributes);
            this.annotator.element.off('keydown', '.annotator-hl');
            this.annotator.element.off('keydown', '.annotator-controls');
        },

        addTabIndex: function () {
            var controls, edit, del;
            controls = this.annotator.element.find('.annotator-controls');
            edit = controls.find('.annotator-edit');
            edit.attr('tabindex', 0);
            del = controls.find('.annotator-delete');
            del.attr('tabindex', 0);
        },

        addAriaAttributes: function (field, annotation) {
            var ariaNoteId = 'aria-note-' + annotation.id;
            // Add ARIA attributes to highlighted text ie <span class="annotator-hl">Highlighted text</span>
            // tabindex is set to 0 to make the span focusable via the TAB key.
            // aria-describedby refers to the actual note that was taken.
            _.each(annotation.highlights, function(highlight) {
                $(highlight).attr('aria-describedby', ariaNoteId);
            });
            // Add ARIA attributes to associated note ie <div>My note</div>
            $(field).attr({
                'id': ariaNoteId,
                'role': 'note',
                'aria-label': 'Note'
            });
        },

        onHighlightKeyDown: function (event) {
            var KEY = $.ui.keyCode,
                keyCode = event.keyCode,
                target = $(event.currentTarget),
                annotations, position,
                controls, edit;

            switch (keyCode) {
                case KEY.TAB:
                    if (this.annotator.viewer.isShown()) {
                        controls = this.annotator.element.find('.annotator-controls');
                        edit = controls.find('.annotator-edit');
                        edit.focus();
                    }
                    break;
                case KEY.ENTER:
                case KEY.SPACE:
                    if (!this.annotator.viewer.isShown()) {
                        position = target.position();
                        annotations = target.parents('.annotator-hl').addBack().map(function() {
                            return $(this).data('annotation');
                        });
                        this.annotator.showViewer($.makeArray(annotations), {top: position.top, left: position.left});
                    }
                    break;
                case KEY.ESCAPE:
                    this.annotator.viewer.hide();
                    break;
            }
            // We do not stop propagation and default behavior on a TAB keypress
            if (event.keyCode !== KEY.TAB || (event.keyCode == KEY.TAB && this.annotator.viewer.isShown())) {
                event.preventDefault();
                event.stopPropagation();
            }
        },

        onControlsKeyDown: function (event) {
            var KEY = $.ui.keyCode,
                keyCode = event.keyCode,
                target = $(event.target),
                controls, edit, del, note, id;

            controls = this.annotator.element.find('.annotator-controls');
            edit = controls.find('.annotator-edit');
            del = controls.find('.annotator-delete');

            switch (keyCode) {
                case KEY.TAB:
                    if (target.is('.annotator-edit')) {
                        del.focus();
                    } else if (target.is('.annotator-delete')) {
                        edit.focus();
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    break;
                case KEY.ESCAPE:
                    this.annotator.viewer.hide();
                    note = controls.siblings('div[role="note"]');
                    id = note.attr('id');
                    $('.annotator-hl[aria-describedby='+id+']').focus();
                    break;
            }
        }
    });
});
}).call(this, define || RequireJS.define);

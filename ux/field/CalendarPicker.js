Ext.define('Ux.field.CalendarPicker', {
    extend: 'Ext.field.DatePicker',
    xtype: 'calendarpickerfield',

    requires: ['Ux.picker.Calendar'],

    config:{
        picker: { xclass: 'Ux.picker.Calendar'}
    },

    onMaskTap: function() {
        if (this.getDisabled()) {
            return false;
        }

        if (this.getReadOnly()) {
            return false;
        }

        this.getPicker().showBy(this, 'fadeIn');

        return false;
    }
});
Ext.define("CalendarPickerST2.view.Main", {
    extend: 'Ext.form.Panel',
    requires:['Ext.form.FieldSet', 'Ux.field.CalendarPicker'],
    config:{
        items: [
            {
                xtype: 'fieldset',
                items: [
                    {
                        xtype: 'calendarpickerfield',
                        label: 'Date latvian',
                        name: 'birthday',
                        dateFormat:'d-m-Y',
                        picker:{
                            weekStartsOnSunday:false,
                            dateFormat:'d-m-Y',
                            cancelButtonText:'Atcelt',
                            todayButtonText:'Šodien',
                            dayNames :  [ 'P', 'O', 'T', 'C', 'P', 'S', 'Sv'],
                            monthNames : ['Janvāris', 'Februāris', 'Marts', 'Aprīlis', 'Maijs', 'Jūnijs', 'Jūlijs', 'Augusts', 'Septembris', 'Oktobris', 'Novembris', 'Decembris']
                        },
                        value: new Date()
                    },
                    {
                        xtype: 'calendarpickerfield',
                        label: 'Date english',
                        name: 'otherdate',
                        value: new Date()
                    }
                ]
            },
            {
                xtype: 'toolbar',
                docked: 'bottom',
                items: [
                    {
                        text: 'getValue',
                        handler: function() {
                            var datePickerField = Ext.ComponentQuery.query('datepickerfield')[0];
                            Ext.Msg.alert(null, datePickerField.getValue());
                        }
                    },
                    { xtype: 'spacer' },
                    {
                        text: 'getFormattedValue for Birthday',
                        handler: function() {
                            var datePickerField = Ext.ComponentQuery.query('datepickerfield')[0];
                            Ext.Msg.alert(null, datePickerField.getFormattedValue());
                        }
                    }
                ]
            }
        ]
    }
});
Ext.define('Ux.picker.Calendar',{
    extend:'Ext.Panel',
    alternateClassName: 'Ux.CalendarPicker',

    requires: ['Ext.Toolbar','Ext.Anim'],

    isPicker: true,
    dateFormat: 'm/d/Y',
    monthNames : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    dayNames :  ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    cancelButtonText:'Cancel',
    todayButtonText:'Today',
    weekStartsOnSunday:true,
    heading:'',
    config:{
        modal:true,
        hideOnMaskTap:true,
        value: null,
        width:400,
        left: 0
    },

    constructor:function(container){
        var me = this,
            tableTop = [];
        me.callParent(arguments);

        me.now = new Date();
        if (Ext.isDate(me.value))
            me.setDate(me.value);
        else
            me.setDate(me.now);

        tableTop.push('<table class="calendar-month ">');
        tableTop.push('<tr>');

        for (var d = 0; d < 7; d++) {
            tableTop.push('<th class="weekday">' + me.dayNames[d] + '</th>');
        }

        tableTop.push('</tr>');
        me.heading = tableTop.join('');

        me.topToolBar = Ext.create('Ext.Toolbar',{
            docked:'top',
            defaults:{
                iconMask: true,
                scope:me
            },
            items:[
                {
                    iconCls: 'arrow_left',
                    handler:me.prevMonth
                },
                {
                    iconCls: 'rewind',
                    handler: me.prevYear
                },
                {
                    xtype:'spacer'
                },
                {
                    iconCls: 'fforward',
                    handler: me.nextYear
                },
                {
                    iconCls: 'arrow_right',
                    handler:me.nextMonth
                }
            ]
        }) ;

        me.bottomToolbar = Ext.create('Ext.Toolbar',{
            docked:'bottom',
            defaults:{
                scope:me
            },
            items:[
                {
                    text:me.cancelButtonText,
                    handler:me.onCancelButtonTap
                },
                {
                    xtype:'spacer'
                },
                {
                    text:me.todayButtonText,
                    handler:me.today
                }
            ]
        }) ;

        me.element.on('tap', function(obj, e) {
            var currSelection;
            if ((e.className.search('date') != -1)) {
                dateTap = true;
                currSelection = e.getAttribute("date").split(',');
            }
            else {
                if ((e.className.search('day') != -1)) {
                    dateTap = true;
                    if(e.parentNode.getAttribute("date"))
                        currSelection = e.parentNode.getAttribute("date").split(',');
                }
            }
            if (currSelection) {
                var d = new Date(currSelection[0], currSelection[1], currSelection[2]);
                me.onPickerChange(me, d);
                me.hide('fadeOut');
            }
        },me);

        me.add([me.topToolBar, me.bottomToolbar]);
    },

    showBy: function(component, animation, alignment) {
        var me = this,
            args = Ext.Array.from(arguments),
            viewport = Ext.Viewport,
            parent = me.getParent();

        me.setVisibility(false);

        if (parent !== viewport) {
            viewport.add(me);
        }

        me.show(animation);

        me.on('erased', 'onShowByErased', me, { single: true });
        viewport.on('resize', 'refreshShowBy', me, { args: [component, alignment] });

        me.currentShowByArgs = args;

        me.alignTo(component, alignment);
        me.setVisibility(true);
    },

    setValue: function(value) {
        var me = this;
        if (!Ext.isDate(value)) return;

        me.value = value;

        me.setDate(value);
        me.drawCalendar();
        return me;
    },

    getText: function() {
        var me = this;
        return  Ext.Date.format(me.value, me.dateFormat);
    },

    getValue: function() {
        return this.value || null;
    },

    onPickerChange: function(picker, value) {
        var me = this;
        me.fireEvent('beforeselect', me, me.getValue(), value);
        me.setValue(value);
        me.fireEvent('change', me, me.getValue());
    },

    onCancelButtonTap: function() {
        this.hide('fadeOut');
    },

    nextMonth: function() {
        var me = this;
        if (me.month == 11) {
            me.month = 0;
            me.year += 1;
        }
        else me.month += 1;
        me.drawCalendar();
    },

    prevMonth: function() {
        var me = this;
        if (me.month == 0) {
            me.month = 11;
            me.year -= 1;
        }
        else me.month = me.month - 1;
        me.drawCalendar();
    },

    nextYear: function() {
        var me = this;
        me.year += 1;
        me.drawCalendar();
    },

    prevYear: function() {
        var me = this;
        me.year = me.year - 1;
        me.drawCalendar();
    },

    getDaysInMonth: function(month, year) {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if ((month == 1) && (year % 4 == 0) && ((year % 100 != 0) || (year % 400 == 0))) {
            return 29;
        } else {
            return daysInMonth[month];
        }
    },

    setDate: function(d) {
        var me = this;
        me.day = d.getDate();
        me.month = d.getMonth();
        me.year = d.getYear() + 1900;
    },

    today: function() {
        var me = this;
        me.now = new Date();
        me.setDate(me.now);
        me.drawCalendar();
        me.onPickerChange(me, me.now);
        me.hide('fadeOut');
    },

    drawCalendar: function() {
        var me = this,
            month = me.month,
            year = me.year,
            day = me.day,
            today = me.now.getDate(),
            dayselected = me.value.getDate(),
            table = [],
            i = 0,
            rowday;

        var firstDayDate = new Date(year, month, 1);
        var firstDay = firstDayDate.getDay();

        me.topToolBar.setTitle(me.monthNames[month] + ' ' + year);

        table.push(me.heading);

        if(!me.weekStartsOnSunday){
            firstDay = firstDay-1;
            if(firstDay == -1){
                firstDay=6;
            }
        }

        var prev_m = month == 0 ? 11: month - 1;
        var prev_y = prev_m == 11 ? year - 1: year;
        var prev_days = me.getDaysInMonth(prev_m, prev_y);
        firstDay = (firstDay == 0 && firstDayDate) ? 7: firstDay;
        var prev_m2 = month == 11 ? 0: month + 1;
        var prev_y2 = month == 11 ? year + 1: year;

        for (var j = 0; j < 42; j++) {

            if ((j < firstDay)) {
                rowday = (prev_days - firstDay + j + 1);
                table.push('<td class="calendar-other date" date="' + prev_y + ',' + prev_m + ',' + rowday + '"><span class="day">' + rowday + '</span></td>');
            } else if ((j >= firstDay + me.getDaysInMonth(month, year))) {
                i = i + 1;
                table.push('<td class="calendar-other date" date="' + prev_y2 + ',' + prev_m2 + ',' + i + '"><span class="day">' + i + '</span></td>');
            } else {
                rowday = (j - firstDay + 1);
                clsToday = '';
                clsSelected = '';
                if (rowday == today) {
                    if (year == me.now.getFullYear() && month == me.now.getMonth()) clsToday = ' calendar-today';
                }
                if (rowday == dayselected) {
                    if (year == me.value.getFullYear() && month == me.value.getMonth()) clsSelected = ' calendar-select';
                }
                table.push('<td class="current-month date day' + (j - firstDay + 1) + clsToday + clsSelected + '" date="' + year + ',' + month + ',' + rowday + '"><span class="day">' + rowday + '</span></td>');
            }
            if (j % 7 == 6) table.push('</tr>');
        }

        table.push('</table>');

        setTimeout(function() {
            me.setHtml(table.join(''));
        },5);
    }
});
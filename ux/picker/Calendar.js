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
    config:{
        modal:true,
        hideOnMaskTap:true,
        value: null,
        width:400,
        left: 0
    },

    showBy: function(component, animation, alignment) {
        var args = Ext.Array.from(arguments);

        var viewport = Ext.Viewport,
            parent = this.getParent();

        this.setVisibility(false);

        if (parent !== viewport) {
            viewport.add(this);
        }

        this.show(animation);

        this.on('erased', 'onShowByErased', this, { single: true });
        viewport.on('resize', 'refreshShowBy', this, { args: [component, alignment] });

        this.currentShowByArgs = args;

        this.alignTo(component, alignment);
        this.setVisibility(true);
    },

    constructor:function(container){
        this.callParent(arguments);

        this.now = new Date();
        if (Ext.isDate(this.value))
            this.setDate(this.value);
        else
            this.setDate(this.now);

        this.topToolBar = Ext.create('Ext.Toolbar',{
            docked:'top',
            defaults:{
                iconMask: true,
                scope:this
            },
            items:[
                {
                    iconCls: 'arrow_left',
                    handler:this.prevMonth
                },
                {
                    iconCls: 'rewind',
                    handler: this.prevYear
                },
                {
                    xtype:'spacer'
                },
                {
                    iconCls: 'fforward',
                    handler: this.nextYear
                },
                {
                    iconCls: 'arrow_right',
                    handler:this.nextMonth
                }
            ]
        }) ;

        this.bottomToolbar = Ext.create('Ext.Toolbar',{
            docked:'bottom',
            defaults:{
                scope:this
            },
            items:[
                {
                    text:this.cancelButtonText,
                    handler:this.onCancelButtonTap
                },
                {
                    xtype:'spacer'
                },
                {
                    text:this.todayButtonText,
                    handler:this.today
                }
            ]
        }) ;

        this.element.on('tap', function(obj, e) {
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
                this.onPickerChange(this, d);
                this.hide('fadeOut');
            }
        },this);

        this.add([this.topToolBar, this.bottomToolbar]);
    },

    setValue: function(value) {
        if (!Ext.isDate(value)) return;

        this.value = value;

        this.setDate(value);
        this.drawCalendar();
        return this;
    },

    getText: function() {
        return  Ext.Date.format(this.value, this.dateFormat);
    },

    getValue: function() {
        return this.value || null;
    },

    onPickerChange: function(picker, value) {
        this.fireEvent('beforeselect', this, this.getValue(), value);
        this.setValue(value);
        this.fireEvent('change', this, this.getValue());
    },

    onCancelButtonTap: function() {
        this.hide('fadeOut');
    },

    nextMonth: function() {
        if (this.month == 11) {
            this.month = 0;
            this.year += 1;
        }
        else this.month += 1;
        this.drawCalendar();
    },

    prevMonth: function() {
        if (this.month == 0) {
            this.month = 11;
            this.year -= 1;
        }
        else this.month = this.month - 1;
        this.drawCalendar();
    },

    nextYear: function() {
        this.year += 1;
        this.drawCalendar();
    },

    prevYear: function() {
        this.year = this.year - 1;
        this.drawCalendar();
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
        this.day = d.getDate();
        this.month = d.getMonth();
        this.year = d.getYear() + 1900;
    },

    today: function() {
        this.now = new Date();
        this.setDate(this.now);
        this.drawCalendar();
        this.onPickerChange(this, this.now);
        this.hide('fadeOut');
    },


    drawCalendar: function() {
        var month = this.month;
        var year = this.year;
        var day = this.day;
        var today = this.now.getDate();
        var dayselected = this.value.getDate();

        var table = '';

        this.topToolBar.setTitle(this.monthNames[month] + ' ' + year);
        table += ('<table class="calendar-month " ' + ' " cellspacing="0">');
        table += '<tr>';

        for (var d = 0; d < 7; d++) {
            table += '<th class="weekday">' + this.dayNames[d] + '</th>';
        }

        table += '</tr>';

        var firstDayDate = new Date(year, month, 1);
        var firstDay = firstDayDate.getDay();

        if(!this.weekStartsOnSunday){
            firstDay = firstDay-1;
            if(firstDay == -1){
                firstDay=6;
            }
        }

        var prev_m = month == 0 ? 11: month - 1;
        var prev_y = prev_m == 11 ? year - 1: year;
        var prev_days = this.getDaysInMonth(prev_m, prev_y);
        firstDay = (firstDay == 0 && firstDayDate) ? 7: firstDay;
        var prev_m2 = month == 11 ? 0: month + 1;
        var prev_y2 = month == 11 ? year + 1: year;


        var i = 0;
        var rowday;
        for (var j = 0; j < 42; j++) {

            if ((j < firstDay)) {
                rowday = (prev_days - firstDay + j + 1);
                table += ('<td class="calendar-other date" date="' + prev_y + ',' + prev_m + ',' + rowday + '"><span class="day">' + rowday + '</span></td>');
            } else if ((j >= firstDay + this.getDaysInMonth(month, year))) {
                i = i + 1;
                table += ('<td class="calendar-other date" date="' + prev_y2 + ',' + prev_m2 + ',' + i + '"><span class="day">' + i + '</span></td>');
            } else {
                rowday = (j - firstDay + 1);
                clsToday = '';
                clsSelected = '';
                if (rowday == today) {
                    if (year == this.now.getFullYear() && month == this.now.getMonth()) clsToday = ' calendar-today';
                }
                if (rowday == dayselected) {
                    if (year == this.value.getFullYear() && month == this.value.getMonth()) clsSelected = ' calendar-select';
                }
                table += ('<td class="current-month date day' + (j - firstDay + 1) + clsToday + clsSelected + '" date="' + year + ',' + month + ',' + rowday + '"><span class="day">' + rowday + '</span></td>');
            }
            if (j % 7 == 6) table += ('</tr>');
        }

        table += ('</table>');

        this.setHtml(table);
    }
});
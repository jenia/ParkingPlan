/**
    ParkingPlan is a program that maps the parking schedules across the streets of the World.
    Copyright (C) <2014>  <Evgeniy Ivlev>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    You can contact me at jenia.ivlev@gmail.com.
**/

function Forbidden_Slot(index, forbidden_slots_array, pk, paid){
    if(paid == "False" || paid==undefined){
        this.paid=false;
    }else{
        this.paid=true;
    }
        
    this.forbidden_slots_array = forbidden_slots_array;
    this.index = index;
    this.pk = pk;
    var self = this;
    if(pk > 0){
    }else{
	Forbidden_Slot.prototype.add_yourself.call(this);
    }
}


Forbidden_Slot.prototype.is_already_in_the_database = function(){
    if(this.pk==-1){
        return false;
    }
    return true;
}


Forbidden_Slot.prototype.add_yourself = function(start_date, end_date, start_time, end_time, pk, days, allowed, paid){
    days == undefined ? days = [] : '';
    var self= this;
    $('\
          <li id="forbidden-slot-'+this.index+'" data-role="list-divider" class="divider-between-forbidden-slots"><h1>Forbidden Slot ' + (this.index+1) +'</h1></li>\
          <li><label for="paid-'+this.index+'"><input type="checkbox"  id="paid-'+this.index+'" name="paid"' + (this.paid ? ' checked="true"' : 'false') + ' />Paid</label></li>\
          <li>\
            <select id="fs-allowed-time-list'+this.index+'">\
                <option name="allowed" '+(allowed == "0" ? 'selected' : '')+'>Allowed Parking Time Duration (default is 0)</option>\
                <option name="allowed" '+(allowed == "15" ? 'selected' : '')+'>15 min</option>\
                <option name="allowed" '+(allowed == "30" ? 'selected' : '')+'>30 min</option>\
                <option name="allowed" '+(allowed == "45" ? 'selected' : '')+'>45 min</option>\
                <option name="allowed" '+(allowed == "60" ? 'selected' : '')+'>60 min</option>\
                <option name="allowed" '+(allowed == "90" ? 'selected' : '')+'>90 min</option>\
                <option name="allowed" '+(allowed == "120" ? 'selected' : '')+'>120 min</option>\
                <option name="allowed" '+(allowed == "240" ? 'selected' : '')+'>240 min</option>\
            </select>\
          </li>\
          <li>\
            <select id="fs-options-list'+this.index+'">\
                <option>Common Schedules</option>\
                <option >All Day</option>\
            </select>\
          </li>\
          <li data-role="list-divider"><h3>Times*</h3></li>\
          <li><label for="start-time'+this.index+'"><input type="time" step="300" id="start-time'+this.index+'" name="start-time"' + (start_time ? ' value="' + start_time + '"' : '') + ' />Start Time</label></li>\
          <li><label for="end-time'+this.index+'"><input type="time" step="300" id="end-time'+this.index+'" name="end-time"' + (end_time? ' value="' + end_time + '"': '') + ' />End Time</label></li>\
          <li data-role="list-divider"><h3>Days*</h3></li>\
          <li class="days">\
            <fieldset name="days" data-role="controlgroup">\
                <input type="checkbox"  name="monday" id="monday'+this.index+'" '+(days.indexOf("monday") > -1 ? " checked" : "")+' \><label for="monday'+this.index+'">Monday</label>\
                <input type="checkbox"  name="tuesday" id="tuesday'+this.index+'" '+(days.indexOf("tuesday") > -1 ? " checked" : "")+' \><label for="tuesday'+this.index+'">Tuesday</label>\
                <input type="checkbox"  name="Wed" id="Wed'+this.index+'" '+(days.indexOf("Wed") > -1 ? " checked" : "")+' \><label for="Wed'+this.index+'">Wednesday</label>\
                <input type="checkbox"  name="thursday" id="thursday'+this.index+'" '+(days.indexOf("thursday") > -1 ? " checked" : "")+' \><label for="thursday'+this.index+'">Thursday</label>\
                <input type="checkbox"  name="friday" id="friday'+this.index+'" '+(days.indexOf("friday") > -1 ? " checked" : "")+' \><label for="friday'+this.index+'">Friday</label>\
                <input type="checkbox"  name="saturday" id="saturday'+this.index+'" '+(days.indexOf("saturday") > -1 ? " checked" : "")+' \><label for="saturday'+this.index+'">Saturday</label>\
                <input type="checkbox"  name="sunday" id="sunday'+this.index+'" '+(days.indexOf("sunday") > -1 ? " checked" : "")+' \><label for="sunday'+this.index+'">Sunday</label><br><br><br>\
            </fieldset>\
          </li>\
          <li data-role="list-divider"><h3>Dates</h3></li>\
          <li><label for="start-date'+this.index+'"><input type="date" id="start-date'+this.index+'" name="start-date"' + (start_date ? ' value="' + start_date + '"': '') + ' />Start Date</label></li>\
          <li><label for="end-date'+this.index+'"><input type="date" id="end-date'+this.index+'" name="end-date"' + (end_date ? ' value="' + end_date + '"': '') + '" />End Date</label></li>\
          <li><input type="button" id="remove-slot-'+this.index+'" value="Remove"/></li>\
          <li><input type="hidden" name="forbidden_slot_pk" value="' + pk + '"/> </li> \
      ').insertBefore("#last-list-divider");

    var self = this;
    $('#remove-slot-' + this.index).on('click', function(){
	Forbidden_Slot_Array.prototype.remove.call(self.forbidden_slots_array, self.index);
    });
    $(".divider-between-forbidden-slots").css("background-color","pink");
    $(".divider-between-forbidden-slots").css("text-align","center");
    $("#dialog-page [data-role=listview]").listview("refresh");
    $("#dialog-page [data-role=listview]").trigger("create");
    $("#fs-options-list"+this.index).change(function(){
        if($(this).val() == "All Day"){
            Forbidden_Slot.prototype.all_day_forbidden.call(self);
        }
    });
    
}

Forbidden_Slot.prototype.all_day_forbidden = function(){

    $("#start-time"+this.index).val("00:00")
    $("#end-time"+this.index).val("23:59")
    $("#start-date"+this.index).val("2000-01-01")
    $("#end-date"+this.index).val("2020-12-31")
    $('#monday'+this.index).prop('checked', true).checkboxradio('refresh');
    $('#tuesday'+this.index).prop('checked', true).checkboxradio('refresh');
    $('#Wed'+this.index).prop('checked', true).checkboxradio('refresh');
    $('#thursday'+this.index).prop('checked', true).checkboxradio('refresh');
    $('#friday'+this.index).prop('checked', true).checkboxradio('refresh');
    $('#saturday'+this.index).prop('checked', true).checkboxradio('refresh');
    $('#sunday'+this.index).prop('checked', true).checkboxradio('refresh');
}


//NEW CLASS

Forbidden_Slot.prototype.unselect_paid_checkbox = function(){
    $('#paid').prop('checked', false).checkboxradio('refresh');
};

Forbidden_Slot.prototype.select_paid_checkbox = function(){
    $('#paid').prop('checked', this.paid).checkboxradio('refresh');
};

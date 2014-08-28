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


    

Forbidden_Slot.prototype.add_yourself = function(start_date, end_date, start_time, end_time, pk, days, allowed, paid, votes_up, votes_down, user_already_voted){
    days == undefined ? days = [] : '';
    var self= this;
    $("#set").append('\
        <div id="forbidden-slot-'+this.index+'" data-role="collapsible" id="set1" data-collapsed="'+(pk ? 'true' : 'false') + '">\
          <h3>' + (pk ? 'Start-Time: ' + start_time + '<br> End-Time: ' + end_time + '<br>Days: ' + days  +
               '<input id="up' + this.index + '" type="image" src="/static/img/hand-sketch.png" style="height:50px; width:50px; float:right"><label id="up_label_'
                   + this.index + '" for="up' + this.index + '" style="margin-top:30px; float:right ">' + votes_up + '</label>\
                <input id="down' + this.index + '" type="image" src="/static/img/hand-sketch-down.png" style="height:50px; width:50px; float:right"><label id="down_label_'
                   + this.index + '" for="down' + this.index + '" style="margin-top:30px; float:right">' + votes_down + '</label>' : 'New Forbidden-Slot' + this.index) +
          '</h3>\
          <ul data-role="listview">\
            <li data-role="list-divider" class="divider-between-forbidden-slots"><h1>Forbidden Slot ' + (this.index+1) +'</h1></li>\
            <li><label for="paid-'+this.index+'"><input type="checkbox" id="paid-'+this.index+'" name="paid"' + (this.paid ? ' checked="true"' : 'false') + ' />Paid</label></li>\
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
                  <input type="checkbox"  name="Monday" id="Monday'+this.index+'" '+(days.indexOf("Monday") > -1 ? " checked" : "")+' \><label for="Monday'+this.index+'">Monday</label>\
                  <input type="checkbox"  name="Tuesday" id="Tuesday'+this.index+'" '+(days.indexOf("Tuesday") > -1 ? " checked" : "")+' \><label for="Tuesday'+this.index+'">Tuesday</label>\
                  <input type="checkbox"  name="Wednesday" id="Wednesday'+this.index+'" '+(days.indexOf("Wednesday") > -1 ? " checked" : "")+' \><label for="Wednesday'+this.index+'">Wednesday</label>\
                  <input type="checkbox"  name="Thursday" id="Thursday'+this.index+'" '+(days.indexOf("Thursday") > -1 ? " checked" : "")+' \><label for="Thursday'+this.index+'">Thursday</label>\
                  <input type="checkbox"  name="Friday" id="Friday'+this.index+'" '+(days.indexOf("Friday") > -1 ? " checked" : "")+' \><label for="Friday'+this.index+'">Friday</label>\
                  <input type="checkbox"  name="Saturday" id="Saturday'+this.index+'" '+(days.indexOf("Saturday") > -1 ? " checked" : "")+' \><label for="Saturday'+this.index+'">Saturday</label>\
                  <input type="checkbox"  name="Sunday" id="Sunday'+this.index+'" '+(days.indexOf("Sunday") > -1 ? " checked" : "")+' \><label for="Sunday'+this.index+'">Sunday</label><br><br><br>\
              </fieldset>\
            </li>\
            <li data-role="list-divider"><h3>Dates</h3></li>\
            <li><label for="start-date'+this.index+'"><input type="date" id="start-date'+this.index+'" name="start-date"' + (start_date ? ' value="' + start_date + '"': '') + ' />Start Date</label></li>\
            <li><label for="end-date'+this.index+'"><input type="date" id="end-date'+this.index+'" name="end-date"' + (end_date ? ' value="' + end_date + '"': '') + '" />End Date</label></li>\
            <li><input type="button" id="remove-slot-'+this.index+'" value="Remove"/></li>\
            <li><input type="hidden" name="forbidden_slot_pk" value="' + pk + '"/> </li> \
          </ul>\
       </div>\
      ').collapsibleset('refresh');

    if(user_already_voted){
        this.color_vote(user_already_voted);
    }
    var self = this;
    $('#remove-slot-' + this.index).on('click', function(){
	Forbidden_Slot_Array.prototype.remove.call(self.forbidden_slots_array, self.index);
    });
    $(".divider-between-forbidden-slots").css("background-color","pink");
    $(".divider-between-forbidden-slots").css("text-align","center");
    $("#dialog-page [data-role=listview]").listview();
    $("#dialog-page [data-role=listview]").trigger("create");
    $("#fs-options-list"+this.index).change(function(){
        if($(this).val() == "All Day"){
            Forbidden_Slot.prototype.all_day_forbidden.call(self);
        }
    });

    $("#up" + this.index).on("click", function(e){
        Forbidden_Slot.prototype.make_call_about_voting.call(self, e, "up", pk);
    });
    $("#down" + this.index).on("click", function(e){
        Forbidden_Slot.prototype.make_call_about_voting.call(self, e, "down", pk);
    });
                    
    
}

Forbidden_Slot.prototype.make_call_about_voting = function(e, up_or_down, pk){
    var self = this;
    e.preventDefault();
    var submission_string = "vote=" + up_or_down + "&pk=" + pk;
    Forbidden_Slot.prototype.vote.call(self, submission_string);
    e.stopPropagation();
    e.stopImmediatePropagation();
}


Forbidden_Slot.prototype.color_vote = function(user_already_voted){
    if(user_already_voted=="up"){
        $("#up_label_" + this.index).css("color", "blue");
    }else if(user_already_voted == "down"){
        $("#down_label_" + this.index).css("color", "blue");
    }
}
        


Forbidden_Slot.prototype.vote = function(submission_string){
    var self = this;
    call_server(domain + "/vote", function(response){
        var json = JSON.parse(response);
        if(json.vote == "up"){
            $("#up_label_" + self.index)[0].textContent = parseInt($("#up_label_" + self.index)[0].textContent) + 1;
            $("#up_label_" + self.index).css("color", "blue");
        }
        else if(json.vote == "down"){
            $("#down_label_" + self.index)[0].textContent = parseInt($("#down_label_" + self.index)[0].textContent) + 1;
            $("#down_label_" + self.index).css("color", "blue");
        }
        else if(json.remove == "up"){
            $("#up_label_" + self.index)[0].textContent = parseInt($("#up_label_" + self.index)[0].textContent) - 1;
            $("#up_label_" + self.index).css("color", "black");
        }
        else if(json.remove == "down"){
            $("#down_label_" + self.index)[0].textContent = parseInt($("#down_label_" + self.index)[0].textContent) - 1;
            $("#down_label_" + self.index).css("color", "black");
        }
    }, submission_string, "POST");
}
    
Forbidden_Slot.prototype.all_day_forbidden = function(){

    $("#start-time"+this.index).val("00:00")
    $("#end-time"+this.index).val("23:59")
    $("#start-date"+this.index).val("2000-01-01")
    $("#end-date"+this.index).val("2020-12-31")
    $('#Monday'+this.index).prop('checked', true).checkboxradio('refresh');
    $('#Tuesday'+this.index).prop('checked', true).checkboxradio('refresh');
    $('#Wednesday'+This.index).prop('checked', true).checkboxradio('refresh');
    $('#Thursday'+this.index).prop('checked', true).checkboxradio('refresh');
    $('#Friday'+this.index).prop('checked', true).checkboxradio('refresh');
    $('#Saturday'+this.index).prop('checked', true).checkboxradio('refresh');
    $('#Sunday'+this.index).prop('checked', true).checkboxradio('refresh');
}


//NEW CLASS

Forbidden_Slot.prototype.unselect_paid_checkbox = function(){
    $('#paid').prop('checked', false).checkboxradio('refresh');
};

Forbidden_Slot.prototype.select_paid_checkbox = function(){
    $('#paid').prop('checked', this.paid).checkboxradio('refresh');
};

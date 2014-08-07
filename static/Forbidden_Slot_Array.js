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


function Forbidden_Slot_Array(geom, pk){
    this.forbidden_slots = new Array();
    this.pk = pk;
    this.side = geom.side;
    this.geom = geom;
    var self = this;
    Forbidden_Slot_Array.prototype.register_listeners.call(this);

}


Forbidden_Slot_Array.prototype.add_forbidden_slots = function(){
    var self = this; 
    var foo = function(event, data){
            for(var i = 0; i<self.geom.forbidden_slots.length; i++){
                var fs = new Forbidden_Slot(self.forbidden_slots.length, self, self.geom.forbidden_slots[i].pk, self.geom.forbidden_slots[i].paid);
                self.forbidden_slots.push(fs);
                Forbidden_Slot.prototype.add_yourself.call(fs, self.geom.forbidden_slots[i].start_date,
                                                                 self.geom.forbidden_slots[i].end_date,
                                                                 self.geom.forbidden_slots[i].start_time,
                                                                 self.geom.forbidden_slots[i].end_time,
                                                                 self.geom.forbidden_slots[i].pk,
                                                                 self.geom.forbidden_slots[i].days,
                                                                 self.geom.forbidden_slots[i].allowed,
                                                                 self.geom.forbidden_slots[i].paid);
            }

    };
    foo();   
};


Forbidden_Slot_Array.prototype.add_forbidden_slot = function(){
    this.forbidden_slots.push(new Forbidden_Slot(this.forbidden_slots.length, this, -1));
}; 


Forbidden_Slot_Array.prototype.register_listeners = function(){
    
    var self = this;
        $( '#submit-slots' ).unbind();
        $('#add-slot').unbind();
    $( '#submit-slots' ).on('click', function(){
	Forbidden_Slot_Array.prototype.save.call(self);
    });
    $('#add-slot').on('click', function(){
	Forbidden_Slot_Array.prototype.add_forbidden_slot.call(self);
    });
    $('#close').on('click', function(){
	$('[data-role="dialog"]').dialog("close");
    });

    
                                        
        
};

    
Forbidden_Slot_Array.prototype.remove = function(index){
    var self = this;
    var remove = function(){
            $('#forbidden-slot-' + index).nextUntil(".divider-between-forbidden-slots").remove();
            $('#forbidden-slot-' + index).remove();
            self.forbidden_slots.splice(index, 1);
    }
    
    if(!this.forbidden_slots[index].is_already_in_the_database()){
        remove();
        return;
    }
    var pk = this.forbidden_slots[index].pk;
    var submission_string = "pk=" + pk;
    if (this.forbidden_slots[index].pk != -1){
        call_server(domain+"/remove_forbidden_slot", function(text){
            remove();
        }, submission_string, "POST");
    }
};


Forbidden_Slot_Array.prototype.remove_all = function(){
    this.forbidden_slots = new Array();
};



Forbidden_Slot_Array.prototype.element_saved = function(element, index){
    if(element == -1){
	this.remove(index);
    }else if(element > -1){
	this.forbidden_slots[index].pk = element;
    }
};


Forbidden_Slot_Array.prototype.save = function(){
    var self = this;
    var length = $('[data-role="dialog"] form').length-1;
    var submission_string = "";
    var number_of_forbidden_slots = $('.divider-between-forbidden-slots').length-1;
    for(var i=0; i< number_of_forbidden_slots; i++){
        var selected_options_for_allowed_duration = find_selected_option($(".divider-between-forbidden-slots").slice(i,i + 1).nextUntil('.divider-between-forbidden-slots option').find("[name*=allowed]"));
        submission_string+="allowed="+selected_options_for_allowed_duration + "&";
        var input_elements_for_this_forbidden_slot = $(".divider-between-forbidden-slots").slice(i, i+1).nextUntil('.divider-between-forbidden-slots').find("input").slice(0,14);
	for(var j=0;j<input_elements_for_this_forbidden_slot.length ; j++){
	    var name = input_elements_for_this_forbidden_slot[j].name;
	    var value = "";
	    if(input_elements_for_this_forbidden_slot[j].type == "checkbox"){
                value += input_elements_for_this_forbidden_slot[j].checked;
	    }else{
		value = input_elements_for_this_forbidden_slot[j].value; 
	    }
	    submission_string += name + "=" + value + "&";
	}
        var days = input_elements_for_this_forbidden_slot.filter(".days [type=checkbox]");
        var value = "";
        submission_string+="days=[";
        for(var j=0; j<days.length; j++){
            if(days[j].checked){
                value += '"' + days[j].name + '",';

            }
        }
        submission_string += value.slice(0, value.length-1) + "]&";
	submission_string += "side=" + this.side + "&";
	
    }
    submission_string += "pk=" + this.pk + "&";
    call_server(
        domain+"/save_form",
        function(text){
            var answer = eval('(' + text + ')');
            if (answer.redirect){
                document.location.href = answer.redirect;
            }else{
                answer.keys.map(function(element, index){
                    map.forbidden_slots_array.element_saved(element, index);
                });
            $.mobile.changePage("#index", {transition : "pop", role : "page"});
            }
        },
        submission_string,
        "POST",
        function(){
            error_flag = true;
            $.mobile.changePage('#error-dialog', {transition : 'pop', role : 'dialog'});
            $("#mistake-message").text("Could not save Forbidden-Slots. Please see that you have successfully\
                                        entered the start and end dates and times.");
            $("#error-dialog [data-role=content]").css("height", "300px");
        },
        function(){},
        function(){console.log("302 redirect has happned after save()");}
    );

};

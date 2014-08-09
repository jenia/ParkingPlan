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
var domain = "http://localhost:8000";
var csrf_token;
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
function sameOrigin(url) {
    return "http://" + url.slice(7, url.length).split("/")[0]==domain;
}

var redirect = function(json){
    if(json.redirect==""){
        window.location = "";
    }
}

var error_message = function(json){
        if(json.error_message){
                error_flag = true;
                $.mobile.changePage('#error-dialog', {transition : 'pop', role : 'dialog'})
                $("#mistake-message").text(json.error_message);
                $("#error-dialog [data-role=content]").css("height", "300px");
                return;

        }
} 


function call_server(address,  call_back, values, type, error_500_callback, redirect_302){
     var xmlhttp;
     

    if (type=="POST") {
	// Send the token to same-origin, relative URLs only.
	// Send the token only if the method warrants CSRF protection
	// Using the CSRFToken value acquired earlier

	$.ajax({
	    url : address,
	    type : type,
	    data : values,
            statusCode: {
                500 : error_500_callback,
                302 : redirect_302
            }
	}).done(function(txt){
            redirect(JSON.parse(txt));
            error_message(JSON.parse(txt))
            call_back(txt);
        });
    }else{
	$.ajax({
	    url : address,
	    type : type,
	    data : values
	}).done(function(txt){
            redirect(JSON.parse(txt));
            error_message(JSON.parse(txt))
            call_back(txt);
        });
    }

}

function setup_ajax() {
            $.ajaxSetup({
                beforeSend: function(xhr, settings) {
                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", getCookie("csrftoken"));
                    }
                }
            });
    }

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

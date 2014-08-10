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



//this might be confusing.
//There's the Map object. The one in file Map.js.
//There's also the map from OpenLayers.
//This particular variable, called map, is the OpenLayers' map.


var error_flag = false;
var entry_point;
function Entry_Point(){
    this.get_csrf_cookie();

    var self = this;
	var screen_size = $.mobile.getScreenHeight() - parseInt($("[data-role=content]").css("padding-bottom")) - parseInt($("[data-role=content]").css("padding-top"));
	$("[data-role=content]").css("height", screen_size)
	$('#dialog-page').on("pagebeforehide", function(event, data){
            if(data.nextPage[0].id == "index"){
                $("#dialog-page [data-role=listview]").children().slice(0, $("#dialog-page [data-role=listview]").children().length -4).remove();
                map.highlightctrl.unselectAll()
            }
	})
	$.mobile.pageContainer.on("pagechange", function(event, data){

		if(data.absUrl == undefined){//if it back to the root
		    //map.selectctrl.unselectAll();
		} else if(data.absUrl.search("dialog-page") > -1){
                    if(!error_flag){
			Forbidden_Slot_Array.prototype.add_forbidden_slots.call(map.forbidden_slots_array);
                       
                    }else{
                        error_flag = false;
                    }

		}
	});
    


    
   $('#where-am-i').on('click', function(){
        self.find_gps(function(e) {
            var zoom = 16;
            var location = new OpenLayers.LonLat(e.coords.longitude, e.coords.latitude).transform(map.epsg4326,map.epsg900913);
            map.marker.removeMarker(map.marker.markers[0]);
            map.map.setCenter(location, zoom);
            self.place_marker(location);
            self.get_streets();
        }, function(e) {

        });

       $.mobile.changePage("#index", {transition : "pop", role : "page"});
    });
    
    $("#login-list-option").on("click", function(){
        $.mobile.changePage("#login-options-list-page", {transition: 'pop'});
    });

    $("#parking-plan-login").on("click", function(){
        window.location=domain+"/login";
    });
    $("#google-login").on("click", function(){
        window.location=domain+"/login/google-oauth2/";
    });

    

    $("#get-all-streets").on("click", function(){
	map.vectors.removeAllFeatures();
	map.output_layer.removeAllFeatures();
        self.get_streets();
    });

    
}
Entry_Point.prototype.loadMapLibrary = function() {

    this.map = new Map(this);


    this.zoomToDefaultPosition();

},


Entry_Point.prototype.get_csrf_cookie = function (){
    call_server(
        domain+"/set_csrf_cookie",
        function(response){
            console.log(response);
            var json = JSON.parse(response);
            csrf_token = json.csrf_token;
            setup_ajax();
        },
        "",
        "GET",
        function(){},
        function(){}
    );
    

}


Entry_Point.prototype.register_listener = function(call_back){
    this.call_backs.add(call_back);
}

Entry_Point.prototype.notify_listeners = function(){
    this.call_backs.map(function(call_back){
	call_back();
    });
}

Entry_Point.prototype.zoomToDefaultPosition = function() {
    Entry_Point.prototype.zoomToPosition.call(this,16);
},


Entry_Point.prototype.get_streets = function(){
    var $this = $( this ),
    theme = $this.jqmData( "theme" ) || $.mobile.loader.prototype.options.theme,
    msgText = $this.jqmData( "msgtext" ) || $.mobile.loader.prototype.options.text,
    textVisible = $this.jqmData( "textvisible" ) || $.mobile.loader.prototype.options.textVisible,
    textonly = !!$this.jqmData( "textonly" );
    html = $this.jqmData( "html" ) || "";
    $.mobile.loading("show", {
        text: msgText,
        textVisible: textVisible,
        theme: theme,
        textonly: textonly,
        html: html
    })
    var epsg4326 = new OpenLayers.Projection("EPSG:4326");
    var epsg900913 = new OpenLayers.Projection("EPSG:900913");
    var self = this;
    call_server(domain+"/get_all_streets/?extent=" + new OpenLayers.Geometry.Point(map.map.center.lon, map.map.center.lat).transform(epsg900913, epsg4326).toString(),
		function(text){
                    var json = eval('(' + text + ')');
                    Entry_Point.prototype.draw_streets.call(self, json.streets);
                    $.mobile.loading("hide");
                    $.mobile.changePage("#index", {transition : "pop", role : "page"});
                }, "", "GET");
},


Entry_Point.prototype.draw_streets = function(streets, availability_flag){
    var epsg4326 = new OpenLayers.Projection("EPSG:4326");
    var epsg900913 = new OpenLayers.Projection("EPSG:900913");
    var pnts = [];
    var features_streets = [];
    for (var i = 0; i < streets.length; i++){
        for(var j = 0; j < streets[i].coordinates.length; j++){
            pnts.push(new OpenLayers.Geometry.Point(streets[i].coordinates[j][0], streets[i].coordinates[j][1]).transform(epsg4326, epsg900913 ));
        }
        ls = new OpenLayers.Geometry.LineString(pnts);
        ls.pk = streets[i].pk;
        v = new OpenLayers.Feature.Vector(ls);
        map.vectors.addFeatures(v);
        if(availability_flag){
            map.vectors.features[map.vectors.features.length-1].style= {
                                                                            fillColor : "#00FF00",
                                                                            strokeColor: "#00FF00",
                                                                            strokeWidth : 25,
                                                                            strokeOpacity:0.3,
                                                                            fillOpacity: 0.3,
                                                                        };
        }
        pnts = [];
    }
    if(availability_flag){
        map.vectors.redraw();
    }

}

Entry_Point.prototype.zoomToPosition = function(zoom) {
    var fromProjection = new OpenLayers.Projection("EPSG:4326");
    var epsg4326 = new OpenLayers.Projection("EPSG:4326");
    var toProjection = new OpenLayers.Projection("EPSG:900913");
    var epsg900913 = new OpenLayers.Projection("EPSG:900913");
    var lon_lat=new OpenLayers.LonLat( -73.6207, 45.5000).transform(map.epsg4326,map.epsg900913);
    var self = this;
    this.find_gps(function(e) {
        /**
           Uncomment the following line if you want the initial position to be your GPS position
        **/
        
	//var location = new OpenLayers.LonLat(e.coords.longitude, e.coords.latitude).transform(map.epsg4326,map.epsg900913);

        /**
           Default GPS coordinates made to match the sample data
        **/
        var location = new OpenLayers.LonLat(-73.63961, 45.46610).transform(map.epsg4326,map.epsg900913);
	map.map.setCenter(location, zoom);
        self.place_marker(location);
        self.get_streets();
    }, function(e) {
	map.map.setCenter(lon_lat, zoom);

    });
}


Entry_Point.prototype.find_gps = function(success, failure){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success);
    }
}
    

Entry_Point.prototype.place_marker = function(lonlat){
        var size = new OpenLayers.Size(21,25);
        var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
        var icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);
        map.marker.addMarker(new OpenLayers.Marker(lonlat));
}
    

function nachat(){

            user.construct_user();
            new FetchAvailableParkingSlot();
            var pathname = document.URL;
            var index_url = new RegExp(domain + '/static/index.html$');
            entry_point = new Entry_Point();
            $.mobile.pageContainer.on("pagechange", function(event, data){
                if(!map && data.absUrl.match(index_url)){
                    entry_point = new Entry_Point();
                    Entry_Point.prototype.loadMapLibrary.call(entry_point);
                }
            });
            if(pathname.match(index_url)){
                Entry_Point.prototype.loadMapLibrary.call(entry_point);
            }
    //app.initialize();
}




//NEW CLASS






function find_selected_option(options){
    for (var i=0; i<options.length; i++){
        if(options[i].selected){
            return options[i].value;
        }
    }
    return {};
}














function FetchAvailableParkingSlot(){


    var self = this;
    $("#availability-constraints-dialog [type=button]").on("click", function(){
        map.output_layer.removeAllFeatures();
        map.vectors.removeAllFeatures();
        self.fetch();
    });
    availability_constraints_flag = true;
        

}



FetchAvailableParkingSlot.prototype.fetch = function(){
    var epsg4326 = new OpenLayers.Projection("EPSG:4326");
    var epsg900913 = new OpenLayers.Projection("EPSG:900913");
    var duration = $("#allowed-duration").find(":selected").text();
    duration = duration.slice(0, duration.length -4);


    var all_inputs = $("#availability-constraints-dialog").find(":input");
    var name;
    var value;
    var submission_string = "";
    for(var i = 0; i<all_inputs.length; i++){
        name = all_inputs[i].name;
        value = all_inputs[i].value;
        submission_string += name + "=" + value + "&";
    }

    submission_string +="allowed-duration=" + duration;
    call_server(
        domain+"/get_available_streets",
        function(text){
                    var streets = eval('(' + text + ')');
                    var availability_flag = true;
                    Entry_Point.prototype.draw_streets.call(entry_point, streets, availability_flag);
                    $.mobile.changePage("#index", {transition : "pop", role : "page"});
        },
        submission_string + "&extent=" + new OpenLayers.Geometry.Point(map.map.center.lon, map.map.center.lat).transform(epsg900913, epsg4326).toString(),
        "GET"
    );
}
        


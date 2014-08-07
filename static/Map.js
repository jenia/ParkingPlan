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
OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
    defaultHandlerOptions: {
	'single': true,
	'double': false,
	'pixelTolerance': 0,
	'stopSingle': false,
	'stopDouble': false
    },

    initialize: function(options) {
	this.handlerOptions = OpenLayers.Util.extend(
	    {}, this.defaultHandlerOptions
	);
	OpenLayers.Control.prototype.initialize.apply(
	    this, arguments
	); 
	this.handler = new OpenLayers.Handler.Click(
	    this, {
		'click': this.trigger
	    }, this.handlerOptions
	);
    }, 

    trigger: function(e) {
	map.output_layer.removeAllFeatures()
	if(map.forbidden_slots_array != null){
	    Forbidden_Slot_Array.prototype.remove_all.call(map.forbidden_slots_array);
	    map.forbidden_slots_array = null;
	}
    },

});
var selected_block;
var map;
var geolocate;

function Map(map_from_the_mobile_interface){
    arrayOSM = ["http://otile1.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
                    "http://otile2.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
                    "http://otile3.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
                    "http://otile4.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg"];
    var self = this;
    this.map_from_the_mobile_interface = map_from_the_mobile_interface;
    this.map;
    this.selectCtrl;
    this.highlightCtrl; 
    this.output_layer=null;
    this.vectors;
    this.marker;
    this.epsg900913 = new OpenLayers.Projection('EPSG:900913');
    this.epsg4326 = new OpenLayers.Projection('EPSG:4326');
    this.line_control;
    this.renderer;
    this.renderer=OpenLayers.Util.getParameters(window.location.href).renderer;
    this.renderer= (this.renderer) ? [this.renderer] : OpenLayers.Layer.Vector.prototype.renderers;
    this.side1 = null;
    this.side2 = null;
    geolocate = new OpenLayers.Control.Geolocate({
       bind: false,
       geolocationOptions: {
	   enableHighAccuracy: false,
	   maximumAge: 0,
	   timeout: 7000
       }
    })
    this.panel1 = new OpenLayers.Control.Panel({
			    displayClass: 'Panel1'
		    });
    this.legal_panel = new OpenLayers.Control.Panel({
			    displayClass: 'Panel2'
		    });
    this.btn1 = null;
    this.map = new OpenLayers.Map('map', {
	controls: [
                        new OpenLayers.Control.Navigation(),
                        new OpenLayers.Control.PanZoomBar(),
                        new OpenLayers.Control.ScaleLine(),
                        new OpenLayers.Control.OverviewMap(),
                        new OpenLayers.Control.KeyboardDefaults(),
	                new OpenLayers.Control.TouchNavigation({
			    dragPanOptions : {
				enableKinetic : true
			    }
			}),
			new OpenLayers.Control.ScaleLine(),
									 
	                geolocate
                    ],
    });
    this.map.addControl(this.panel1);
    this.map.addControl(this.legal_panel);

    $(".Panel2").append('<p>©<a id="osm-license"> OpenStreetMap</a></p>')
    //sometimes some strange symbol appears: a kind of A with a hat on it. I dont know why.
    //So here I trimm that symbol if needed
    $(".Panel2").append('<p>Tiles Courtesy of <a id="mapquest-license" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png"></p>')
    if ($(".panel2 p")[0].innerHTML.length > 39){
        $(".panel2 p")[0].innerHTML=$(".panel2 p")[0].innerHTML.slice(1, $(".panel2 p")[0].innerHTML.length-1)
    }

    Map.prototype.add_button.call(this);
    //Create a Google layer
    var gmap = new OpenLayers.Layer.OSM(
        "mapnik", // the default
        null,
	{resolutions: [156543.03390625, 78271.516953125, 39135.7584765625,
                      19567.87923828125, 9783.939619140625, 4891.9698095703125,
                      2445.9849047851562, 1222.9924523925781, 611.4962261962891,
                      305.74811309814453, 152.87405654907226, 76.43702827453613,
                      38.218514137268066, 19.109257068634033, 9.554628534317017,
                      4.777314267158508, 2.388657133579254, 1.194328566789627,
                      0.5971642833948135, 0.25, 0.1, 0.05],
        serverResolutions: [156543.03390625, 78271.516953125, 39135.7584765625,
                            19567.87923828125, 9783.939619140625,
                            4891.9698095703125, 2445.9849047851562,
                            1222.9924523925781, 611.4962261962891,
                            305.74811309814453, 152.87405654907226,
                            76.43702827453613, 38.218514137268066,
                            19.109257068634033, 9.554628534317017,
                            4.777314267158508, 2.388657133579254,
                            1.194328566789627, 0.5971642833948135],}
    );
    var wms = new OpenLayers.Layer.WMS( "OpenLayers WMS",
            arrayOSM, {layers: 'basic',
    projection: new OpenLayers.Projection("EPSG:4326")});



    var my_style1 = new OpenLayers.StyleMap({
	"default" : new OpenLayers.Style({
	    fillColor: "#FF3300",
	    strokeColor: "#FF3300",
	    strokeWidth : 25,
            strokeOpacity:0.1,
            fillOpacity: 0.1,
	}),
        "select":new OpenLayers.Style({
            fillColor:"#FF3300",
            strokeWidth:5,
            //fillColor:"#e39119",
            strokeOpacity:0.5,
            //strokeColor:"#e39119"
            strokeColor:"#1484e6"
        }),
        "temporary":new OpenLayers.Style({
            strokeWidth:25,
            fillColor:"#Fc3300",
            strokeColor:"#1484e6"
        })
    });
	


    
    var my_style2=new OpenLayers.StyleMap({
        "default":new OpenLayers.Style({
            strokeWidth:20,
            fillColor:"#1484e6",
            strokeOpacity:0.5,
            fillOpacity: 0.1,
            strokeColor:"#fc001c"
        }),
        "select":new OpenLayers.Style({
            fillColor:"#FF3300",
            //fillColor:"#e39119",
            strokeOpacity:0.5,
            //strokeColor:"#e39119"
            strokeColor:"#1484e6"
        }),
        "temporary":new OpenLayers.Style({
            strokeWidth:20,
            fillColor:"#Fc3300",
            strokeColor:"#1484e6",
            strokeOpacity:0.1,
            fillOpacity: 0.1,
        })

    });

    this.vectors= new OpenLayers.Layer.Vector(
        "Vector Layer",
        {
            renderers:this.renderer, styleMap : my_style1
        }
    );
    this.marker = new OpenLayers.Layer.Markers("");
    
    this.output_layer=new OpenLayers.Layer.Vector("Output Layer",
    {
        renderers:this.renderer,styleMap:my_style2
    });

    this.map.addLayers([gmap,wms,this.vectors,this.output_layer, this.marker]);
    var click = new OpenLayers.Control.Click();
    this.map.addControl(click);
    click.activate();


    this.get_select_control.call(this,this.vectors,this.map);

    var self = this;
    map = this;
	    
	    

    return this.map;

    
}



function make_line_strings(array_of_coordiantes){
    var blocks = [];
    var epsg4326 = new OpenLayers.Projection("EPSG:4326");
    var epsg900913 = new OpenLayers.Projection("EPSG:900913");
    for (var i = 0; i<array_of_coordiantes.length-1; i++){
	var p1 = new OpenLayers.Geometry.Point(array_of_coordiantes[i][0], array_of_coordiantes[i][1]).transform(epsg4326, epsg900913 );
	var p2 = new OpenLayers.Geometry.Point(array_of_coordiantes[i+1][0], array_of_coordiantes[i+1][1]).transform(epsg4326, epsg900913);
	blocks.push(new OpenLayers.Geometry.LineString([p1, p2]));
        var fl = new OpenLayers.Feature.Vector(blocks[i]);
        map.vectors.addFeatures(fl);
	//draw_two_sides(p1.transform(epsg900913,epsg4326), p2.transform(epsg900913,epsg4326));
    }
    return blocks;
}



Map.prototype.draw_two_sides = function(p1, p2, pk, line){

    var epsg4326 = new OpenLayers.Projection("EPSG:4326");
    var epsg900913 = new OpenLayers.Projection("EPSG:900913");
    var all_end_points_side1=[];
    var all_end_points_side2=[];
    for (var i=0; i<line.components.length-1 ; i++){
	var p1 = line.components[i];
	var p2 = line.components[i + 1];
	var pnt1 = p1.clone().transform(epsg900913, epsg4326);
	var pnt2 = p2.clone().transform(epsg900913, epsg4326);
        var end_points_side1 = Map.prototype.get_end_points_for_segment.call(this, pnt1.x, pnt1.y, pnt2.x, pnt2.y, 0.00020);
        var end_points_side2 = Map.prototype.get_end_points_for_segment.call(this, pnt1.x, pnt1.y, pnt2.x, pnt2.y, -0.00020);
	all_end_points_side1.push(end_points_side1.start.transform(epsg4326, epsg900913), end_points_side1.end.transform(epsg4326, epsg900913));
	all_end_points_side2.push(end_points_side2.start.transform(epsg4326, epsg900913), end_points_side2.end.transform(epsg4326, epsg900913));
    }
    //var parallel_points1 = Map.prototype.get_parallel.call(this, pnt1.x, pnt1.y, pnt2.x, pnt2.y, 0.00020);
    //var parallel_points2 = Map.prototype.get_parallel.call(this, pnt1.x, pnt1.y, pnt2.x, pnt2.y, -0.00020);
    var side1 = new OpenLayers.Geometry.LineString(all_end_points_side1)
    var side2 = new OpenLayers.Geometry.LineString(all_end_points_side2);
    var fl1 = new OpenLayers.Feature.Vector(side1);
    var fl2 = new OpenLayers.Feature.Vector(side2);
    map.output_layer.addFeatures([fl1, fl2]);
    this.side1 = side1;
    this.side2 = side2;
    this.side1.pk = pk;
    this.side2.pk = pk;
    this.side1.side=1;
    this.side2.side=2;
	    
	    
}



Map.prototype.get_end_points_for_segment = function(x1, y1, x2, y2, offsetPixels){
    var L = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))
    var x1p = x1 + offsetPixels * (y2-y1) / L;
    var x2p = x2 + offsetPixels * (y2-y1) / L;
    var y1p = y1 + offsetPixels * (x1-x2) / L;
    var y2p = y2 + offsetPixels * (x1-x2) / L;
    return {'start' : new OpenLayers.Geometry.Point(x1p, y1p), 'end' : new OpenLayers.Geometry.Point(x2p, y2p)};
}



Map.prototype.populate_side_with_forbidden_slots = function(forbidden_slots, geom){
    geom.forbidden_slots = [];
    geom.forbidden_slots = [];

    /**
    **/
    for(var i = 0; i < forbidden_slots.length; i++){
	if(forbidden_slots[i].street_side == 1 && geom.side==1){
	    geom.forbidden_slots.push({
		start_date : forbidden_slots[i].start_date,
		end_date : forbidden_slots[i].end_date,
		start_time : forbidden_slots[i].start_time,
		end_time : forbidden_slots[i].end_time,
		pk : forbidden_slots[i].pk,
		days : forbidden_slots[i].days,
                allowed : forbidden_slots[i].allowed,
                paid : forbidden_slots[i].paid
	    });
	}
	else if(forbidden_slots[i].street_side == 2 && geom.side==2){
	    geom.forbidden_slots.push({
		start_date : forbidden_slots[i].start_date,
		end_date : forbidden_slots[i].end_date,
		start_time : forbidden_slots[i].start_time,
		end_time : forbidden_slots[i].end_time,
		pk : forbidden_slots[i].pk,
		days : forbidden_slots[i].days,
                allowed : forbidden_slots[i].allowed,
                paid : forbidden_slots[i].paid
	    });
	}
    }
}
    



Map.prototype.get_select_control=function(){
    this.highlightctrl = new OpenLayers.Control.SelectFeature([this.vectors, this.output_layer], {
        
        hover: true,
        highlightOnly: true,
        renderIntent: "temporary",
    });

    this.selectctrl = new OpenLayers.Control.SelectFeature([this.vectors, this.output_layer],
        {
            onSelect:process_select_block,
            clickout: true,
        }
    );
    this.map.addControl(this.highlightctrl);
    this.highlightctrl.activate();
    this.map.addControl(this.selectctrl);
    this.selectctrl.activate();
}



function process_select_block(e){
    if(map.forbidden_slots_array != null){
	Forbidden_Slot_Array.prototype.remove_all.call(map.forbidden_slots_array);
	map.forbidden_slots_array = null;
    }
    if(e.layer.name == "Vector Layer"){
	Map.prototype.remove_two_sides.call(map);
	Map.prototype.draw_two_sides.call(map, e.geometry.components[0], e.geometry.components[1],
					  e.geometry.pk, e.geometry)
    }else if(e.layer.name == "Output Layer"){
    call_server(domain+"/get_forbidden_slots/?pk=" + e.geometry.pk,
		function(text){
		    console.log("hello world");
		    var json = eval('(' + text + ')');
		    //Map.prototype.populate_each_side_with_forbidden_slots.call(map, json.forbidden_slots);
		    Map.prototype.populate_side_with_forbidden_slots.call(map, json.forbidden_slots, e.geometry);
		    map.forbidden_slots_array = new Forbidden_Slot_Array(e.geometry, e.geometry.pk);
                    $.mobile.changePage("#dialog-page", {transition: 'pop'});
		},
		"",
		"GET");
    }
}



Map.prototype.add_button = function(){
    if(this.btn1 == null){
	this.btn1 = new OpenLayers.Control.Button({  displayClass: 'first',
						     type : OpenLayers.Control.BUTTON,
						     trigger : function(){
							 var self = this;
							 $.mobile.changePage("#list-page", {transition: 'pop'});

						     },
						 });
	this.panel1.addControls([this.btn1]);
	$(document).ready(function(){
	    $(".Panel1").css({
		"width" : "58px",
		"height" : "54px",
		"cursor" : "pointer",
		"right" : "10px",
		"top" : "10px"
	    });

	    $(".firstItemInactive").css({
                "background-image": "url('/static/img/format-justify-fill.png')",
		"border" : "2px solid #075f67",
		"width" : "48px",
		"height" : "48px"
	    });
            $("#osm-license").on("click", function(){
                var authWindow = window.open("http://www.openstreetmap.org/copyright", '_blank', 'location=yes,toolbar=no', 'EnableViewPortScale=yes');
            });
            $("#mapquest-license").on("click", function(){
                var authWindow = window.open("http://www.mapquest.com/", '_blank', 'location=yes,toolbar=no', 'EnableViewPortScale=yes');
            });

	    $(".Panel2").css({
                "text-align" : "right",
		"height" : "54px",
		"cursor" : "pointer",
		"right" : "10px",
		"bottom" : "5px",
                "font-size" : "12"
	    });
	})
    }

}





Map.prototype.remove_two_sides = function(){
    this.output_layer.removeAllFeatures();
}



var user = {
    username : undefined,
    logout_li : undefined,


    is_user_logged_in : function(){
	if(this.username == undefined){
	    return false;
	}
	return true;
    
    },

    construct_user : function(){
        var self = this;
	call_server(
	    domain+"/is_user_logged_in",
	    function(text){
                var json = JSON.parse(text);
                if(json.username){
                    self.username=json.username;
                    $("#list-page").on("pagecreate", function(){
                        self.change_options_entries();
                    });
                }
	    },
	    "",
	    "GET"
	);
    },


    change_options_entries : function(){
            var parent_ul = $("#login-list-option").parent().parent();
            $("#login-list-option").parent().remove();
            parent_ul.append('<li><a id="view-profile">'+ this.username+'<p>View Profile</p></a></li>');
            $("#view-profile").attr("rel", "external");
            $("#view-profile").attr("data-ajax", "false");
        
            this.logout_li = $("#list-page ul").append('<li><a id="logout" ref="external" data-ajax="false">Logout</a></li>')
            this.logout_li.attr("rel", "external");
            this.logout_li.attr("data-ajax", "false");
            $("#list-page ul").listview("refresh");
            $("#list-page ul").trigger("create");


            $("#logout").on("click", function(){
                call_server(domain+"/logout", function(txt){
                }, "", "POST", function(){}, function(text){
                    console.log(text)
                });
                
            });
            $("#view-profile").on("click", function(){
                        window.location=domain+"/change_profile"
            });
        
    },

    am_i_loading_into_the_options_list_itself : function(pathname){
        return pathname.match(/#list-page$/);
    }
        
};

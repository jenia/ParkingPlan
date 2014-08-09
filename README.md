ParkingPlan.ca
===========

ParkingPlan is a program that maps the parking schedules across the streets of the World.

ParkingPlan is created by Evgeniy Ivlev. I'm a programmer from Montreal. I've created this software
to avoid paying parking tickets unnecessarily.

This is the first release of this software. Further releases will include features such as:
address interpolation, votings, comments, reminders and generally changes for the better incurred
from your feedback and my own experience in using this app.

    The app works for the following cities:
    
      Montreal

      Toronro

      Vancouver

      Atlanta

      Baltimor

      Boston

      Buffalo

      Chicago

      New-Jersey

      Newark

      New-York

      Philadelphia

      Pitsburg
      
Thank you very much for trying my software.

Evgeniy Ivlev



Installation:

(python 3 is required)

    Virtualenv <parking-plan-folder>
    cd <parking-plan-folder>
    source bin/activate

    pip install django-simple-captcha
    pip install python-social-auth
    pip install pyscopg2


Database:

Follow the - clear, high quality - instructions here: https://docs.djangoproject.com/en/dev/ref/contrib/gis/install/postgis/

Or this is what I do:

     

     su
     su - postgres
     createdb map01
     psql map01
     
     create extension postgis;
     create extension postgis_topology;
     \q
     exit
     exit
     

     python manage.py syncdb
     psql -f sample.sql map01


And that is it.
To start the server run

     python manage.py runserver
     
Now simply open your browser and go to localhost:8000/static/index.html


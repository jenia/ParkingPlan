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

    Virtualenv <folder>
    cd <folder>
    source bin/activate

    pip install django-simple-captcha
    pip install python-social-auth
    pip install pyscopg2

Database:

Follow the - clear, high quality - instructions here: https://docs.djangoproject.com/en/dev/ref/contrib/gis/install/postgis/


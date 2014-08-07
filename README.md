ParkingPlan
===========

    ParkingPlan is a program that maps the parking schedules across the streets of the World.

Installation:

(python 3 is required)

    Virtualenv <folder>
    cd <folder>
    source bin/activate

    pip install django-simple-captcha
    pip install python-social-auth
    pip install pyscopg2

Database:

Creating a spatial database with PostGIS 2.0 and PostgreSQL 9.1+

PostGIS 2 includes an extension for Postgres 9.1+ that can be used to enable spatial functionality:

    $ createdb  <db name>
    $ psql <db name>
    > CREATE EXTENSION postgis;
    > CREATE EXTENSION postgis_topology;


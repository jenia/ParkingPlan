'''
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
'''
from django.conf.urls import patterns, include, url
from zones.views import set_csrf_cookie
from django.conf import settings
from django.conf.urls.static import static
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
        # url(r'^$', 'map.views.home', name='home'),
        # url(r'^map/', include('map.foo.urls')),
    url(r'^subscribe$','zones.views.subscribe'),
    url(r'^login$','zones.views.my_login'),
    url(r'^delete_block$', 'zones.views.delete_block'),
    url(r'captcha', include('captcha.urls')),
    url(r'change_profile$', 'zones.views.change_profile'),
    url(r'get_all_streets', 'zones.views.init'),
    url(r'save_form', 'zones.views.save_form'),
    url(r'get_forbidden_slots', 'zones.views.get_forbidden_slots_for_one_street'),
    url(r'remove_forbidden_slot', 'zones.views.remove_forbidden_slot'),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url(r'is_user_logged_in', 'zones.views.is_user_logged_in'),
    url(r'figure_out_if_post_data_is_in_session', 'zones.views.figure_out_if_post_data_is_in_session'),
    url(r'logout', 'zones.views.my_logout'),
    url(r'get_available_streets', 'zones.views.get_all_streets_given_constraints'),
                       url(r'set_csrf_cookie', set_csrf_cookie),


    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)


urlpatterns += [
    # ... the rest of your URLconf goes here ...
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

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


import json
from django.views.decorators.csrf import ensure_csrf_cookie
import pdb
from zones.models import Voters
from zones.models import Day
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth import authenticate, login as auth_login, logout
from zones.models import CaptchaTestForm
from zones.models import ChangeProfileForm
from django.core.exceptions import ValidationError
import re
from datetime import time
from datetime import datetime
from zones.models import forbidden_slot
from datetime import date
from django.contrib.gis.geos.error import GEOSException
from django.template import RequestContext
from django.db import IntegrityError
from django.contrib.auth.models import User
from django.contrib.gis.geos import LineString
from django.contrib.gis.geos import Polygon
from django.http import HttpResponse
from zones.models import RegisterForm
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response
from zones.models import UserLoginForm
from zones.models import individual_streets



domain = "http://localhost:8000"





def is_logged_in(request):
    return HttpResponse(request.user.is_authenticated())


    



def init(request):
    
    from django.contrib.gis.geos import fromstr
    pnt = fromstr(request.GET['extent'])
    if(request.method =="GET"):
       return HttpResponse(get_all_streets(pnt))




def get_all_streets(pnt):
    from django.contrib.gis.measure import Distance, D
    all_streets = individual_streets.objects.raw("\
        select * from zones_individual_streets where ST_DWITHIN  (\
                                                                       st_transform(geom, 900913), \
                                                                       st_transform(ST_GeomFromText('POINT(%s %s )', 4326), 900913),\
                                                                       1000.0 \
                                                                   )", [pnt.x, pnt.y])
    json = ""
    for i in all_streets:
        json += i.geom.json[0: -1] + ', "pk" : ' + str(i.pk) + ' },'
    return '{"streets" : [' + json[0 : -1] + ']}'


    
def get_forbidden_slots_for_one_street(request):
    all_streets = individual_streets.objects.filter(id_0 = int(request.GET.get('pk', '')))
    json_str = '{'
    for i in all_streets:
        all_forbidden_slots = i.forbidden_slot_set.all()
        if len(all_forbidden_slots) > 0:
            json_str += '"forbidden_slots" : ['
            for j in range(len(all_forbidden_slots)):
                json_str += '{' + all_forbidden_slots[j].to_json(request.user) + '},'
            
            json_str = json_str[0 : -1] + ']},'
        else:
            json_str += '"forbidden_slots" : [] }}' #the }} is so that when the last letter is trimmer, evertying worked out fine
    return HttpResponse(json_str[0 : -1])
    


def subscribe(request):
    if request.method == "POST":
        capt = CaptchaTestForm(request.POST)
        form = RegisterForm(request.POST)
        if form.is_valid() and capt.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            email = form.cleaned_data['email']
            my_user = None
            try:
                my_user = User.objects.create_user(username, email, password)
            except IntegrityError:
                return render_to_response('subscribe.html', {'user_form': form}, context_instance=RequestContext(request))
            my_user.first_name = form.cleaned_data['first_name']
            my_user.last_name = form.cleaned_data['last_name']
            my_user.is_staff = False
            my_user.save()
            #now log the user in
            user = authenticate(username=form.cleaned_data['username'], password=form.cleaned_data['password'])

            if user is not None:
                auth_login(request, user)
                return HttpResponseRedirect(domain+'/figure_out_if_post_data_is_in_session')
            #send the user to log himself in
            else:
                #this is for the inappbrowser
                return HttpResponseRedirect(domain+'/login')
        else:
            return render_to_response("subscribe.html",
                                      {"user_form": form, 'capcha_form': capt},
                                      context_instance=RequestContext(request))
    #method is get
    else:
        capt = CaptchaTestForm()
        form = RegisterForm()
        return render_to_response("subscribe.html",
                                  {"user_form": form, 'capcha_form': capt},
                                  context_instance=RequestContext(request))


def change_profile(request):

    if request.method == 'POST':
        form = ChangeProfileForm(request.POST, instance=request.user)
        capt = CaptchaTestForm(request.POST)
        print(request.user.check_password('12341234'))
        if form.is_valid() and capt.is_valid():
            print(request.user.check_password('12341234'))
            if request.user.is_authenticated():
                if request.user.check_password(form.cleaned_data['current_password']):
                    try:
                        form.save()
                        if len(form.cleaned_data['new_password']) > 0:
                            request.user.set_password(form.cleaned_data['new_password'])
                            request.user.save()
                    except:
                        return render_to_response('change_profile.html',
                                                  {'change_profile_form': form, 'capcha_form': capt},
                                                  context_instance=RequestContext(request))
                    return HttpResponseRedirect(domain)
        return render_to_response('change_profile.html',
                                  {'change_profile_form': form, 'capcha_form': capt},
                                  context_instance=RequestContext(request))
    else:
        if request.user.is_authenticated():
            if not find_out_if_user_was_registered_using_django_social_auth(request.user):
                form = ChangeProfileForm(instance=request.user)
                capt = CaptchaTestForm()
                return render_to_response('change_profile.html',
                                          {'change_profile_form': form, 'capcha_form': capt},
                                          context_instance=RequestContext(request))
            else:
                provider = get_provider(request.user)
                return HttpResponse('You logged in using ' + provider + " That's all we know. We promise")

def my_login(request):
    if request.method == "POST":
        form = UserLoginForm(request.POST)
        # is valid check for the password to be correct
        if form.is_valid():
            user = authenticate(username=form.cleaned_data['username'], password=form.cleaned_data['password'])
            if user is not None:
                auth_login(request, user)
                #this is for the inappbrowser
                return HttpResponseRedirect(domain+'/figure_out_if_post_data_is_in_session')
        #TODO: say that the user does not exist or that the password is incorrect 16 sep 2012
            return render_to_response("login.html", {"form": form}, context_instance=RequestContext(request))
        else:
            return render_to_response("login.html", {"form": form}, context_instance=RequestContext(request))
        
    else:
        if request.user.username is not '':
            logout(request)
            return HttpResponse({'{"redirect" : ""}'})
        else:
            form = UserLoginForm()
            return render_to_response("login.html", {"form": form}, context_instance=RequestContext(request))



@csrf_protect
def delete_block(request):
    if request.method == "POST":
        if request.user.is_authenticated():
            pk = request.POST.get('id', '')
            blocks = None
            try:
                blocks = block.objects.filter(pk=pk)
            except ValueError:
                return HttpResponseRedirect({'redirect' : 'map'})
            if(len(blocks) == 1):
                if(blocks[0].user.pk == request.user.pk and not blocks[0].approved):
                    blocks[0].delete()
                    return HttpResponse('map')
                elif request.user.is_superuser:
                    blocks[0].delete()
                    return HttpResponse('map')
            return HttpResponse('error in deletion')
        else:
            return HttpResponse('login required')
    return HttpResponse('not deleted')







@csrf_protect
def save_form(request):
    if request.user.is_authenticated():
        try: 
            keys = save_form_to_database(request)
        except Exception as e:
            return HttpResponse('{"error_message" : "' + str(e) +'"}')  
        if '_old_post' in request.session:
            del request.session['_old_post']
            return HttpResponse('{"redirect" :""}')
            
        else:
            import json
            return HttpResponse(json.dumps({'keys' : keys}))
    else:
        request.session['start-date'] = request.POST.getlist('start-date')
        request.session['end-date'] = request.POST.getlist('end-date')
        request.session['start-time'] = request.POST.getlist('start-time')
        request.session['end-time'] =  request.POST.getlist('end-time')
        request.session['days'] = request.POST.getlist('days')
        request.session['allowed'] = request.POST.getlist('allowed')
        request.session['pk'] = request.POST['pk']
        request.session['forbidden_slot_pk'] = request.POST.getlist('forbidden_slot_pk')
        request.session['side'] = request.POST['side']
        request.session['paid'] = request.POST.getlist('paid')
        request.session['_old_post'] = True
        import json
        return HttpResponse(json.dumps({'redirect' : '#login-options-list-page'}))


def figure_out_if_theres_at_least_one_day_checked_for_each_forbidden_slot(request):
    number_of_forbidden_slots = len(request.POST.getlist('forbidden_slot_pk'))
    mondays = request.POST.getlist('Monday')
    tuesdays = request.POST.getlist('Tuesday')
    Wed = request.POST.getlist('Wednesday')
    thursdays = request.POST.getlist('Thursday')
    fridays = request.POST.getlist('Friday')
    saturdays = request.POST.getlist('Saturday')
    sundays = request.POST.getlist('Sunday')
    for i in range(number_of_forbidden_slots):
        if request.POST.getlist('days')[i] == '[]':
            raise Exception("You must enter at least one effective day for each forbidden-slot")

         
            
            
     

def save_form_to_database(request):
    start_times = None
    end_times = None
    start_dates = None
    end_dates = None
    days = None
    allowed = None
    pk = None
    fspk = None
    side = None
    paid_list = None
    if '_old_post' in request.session:
        start_times = list(filter(lambda x : len(x) > 0, request.session['start-time']))
        end_times = list(filter(lambda x : len(x) > 0, request.session['end-time']))
        start_dates = list(filter(lambda x : len(x) > 0, request.session['start-date']))
        end_dates = list(filter(lambda x : len(x) > 0,  request.session['end-date']))
        days = list(filter(lambda x : len(x) > 0, request.session['days']))
        allowed = list(filter(lambda x : len(x) > 0,request.session['allowed']))
        pk = request.session.get('pk', None)
        fspk = list(filter(lambda x : len(x) > 0, request.session['forbidden_slot_pk']))
        side = request.session.get('side', None)
        paid_list = request.session.get('paid', None)
    else:
        start_times = request.POST.getlist('start-time')
        end_times = request.POST.getlist('end-time')
        start_dates = request.POST.getlist('start-date')
        end_dates =  request.POST.getlist('end-date')
        days = request.POST.getlist('days')
        allowed = request.POST.getlist('allowed')
        pk = request.POST.get('pk', None)
        fspk = request.POST.getlist('forbidden_slot_pk')
        side = request.POST.get('side', None)
        paid_list = request.POST.getlist('paid', None)


            
    dates = get_dates(start_dates, end_dates)
    times = get_times(start_times, end_times)
    figure_out_if_theres_at_least_one_day_checked_for_each_forbidden_slot(request)
    time_lengths_allowed = take_care_of_allowed(allowed)
    individual_street = individual_streets.objects.get(id_0 = int(pk))
    keys = []
        
    for i in range(len(times)):
        
        if fspk[i] == 'undefined':
            fbs = forbidden_slot(start_time = times[i]['start_time'],
                           end_time = times[i]['end_time'],
                           start_date = dates[0]['start_date'],
                           end_date = dates[0]['end_date'],
                           street_side = side,
                                 line = individual_streets.objects.get(pk=int(pk)),
                           accessed = 1,
                           allowed = time_lengths_allowed[i],
                           paid = True if paid_list[i] == "true" else False,
                           user=request.user)
            keys.append(my_save(fbs))
        else:
            fbs = forbidden_slot.objects.get(pk = int(fspk[i]))
            changed_flag = fbs.has_changed(dates[i]['start_date'], dates[i]['end_date'], times[i]['start_time'], times[i]['end_time'], time_lengths_allowed[i], paid_list[i], json.loads(days[i]))
            if changed_flag and fbs.user == request.user:
                fbs.start_time = times[i]['start_time']
                fbs.end_time = times[i]['end_time']
                fbs.start_date = dates[i]['start_date']
                fbs.allowed = time_lengths_allowed[i]
                fbs.end_date = dates[i]['end_date']
                fbs.paid = True if paid_list[i] == "true" else False
                keys.append(my_save(fbs))
            elif changed_flag and not fbs.user == request.user:
                raise Exception("You are not the owner of this Forbidden-Slot and therefore cannot change. Voting feature will be added soon to accomodate feedback on Forbidden-Slots of other users.")
            else:
                keys.append(-1)

    #when the flow has gotten to this point, all the Forbidden_Slots that have changed, must be owned by the user
    for i in range(len(keys)):
        if keys[i] != -1:
            deal_with_days(json.loads(days[i]), keys[i])

    individual_street.save()
    return list(filter(lambda x: x != -1, keys))

        
def take_care_of_allowed(allowed_times_input):
    allowed_times = []
    for allowed in allowed_times_input:
        time_length = 0
        if not allowed == "Allowed Parking Time Duration (default is 0)":
            if allowed == "15 min":
                time_length = 15

            if allowed == "30 min":
                time_length = 30 

            if allowed == "45 min":
                time_length = 45 

            if allowed == "60 min":
                time_length = 60 

            if allowed == "90 min":
                time_length = 90 

            if allowed == "120 min":
                time_length = 120 

            if allowed == "240 min":
                time_length = 240 
            allowed_times.append(time_length)
        else :
            allowed_times.append(time_length)
    return allowed_times

        

def my_save(fbs):
    fbs.save()
    if fbs.id == None:
        return -1
    else:
        return fbs.id


def deal_with_days(days_list, key):
    fs = forbidden_slot.objects.get(pk = key)
    old_days = []
    for i in fs.days.all(): old_days.append(i.day)
    to_remove = set(old_days) - set(days_list)
    for i in to_remove: fs.days.remove(Day.objects.filter(day=i)[0])

    to_add = set(days_list) - set(old_days)
    for i in to_add:
        day, created = Day.objects.get_or_create(day = i)
        fs.days.add(day)
                
        

def get_times(start_time, end_time):
    times_list_with_python_objects = []
    import time
    import datetime
    try:
        for i in range(len(start_time)):
            times_list_with_python_objects.append({'start_time' : datetime.datetime.strptime(start_time[i], '%H:%M'), 'end_time' : datetime.datetime.strptime(end_time[i], '%H:%M')})
    except ValueError as e:
        raise Exception("Please enter the start-time and end-time")
    return times_list_with_python_objects




def get_dates(start_date, end_date):
    import time
    import datetime
    dates_list_with_python_objects = []
    if len(start_date) == 0:
        dates_list_with_python_objects.append({'start_date' : datetime.datetime.strptime('1900-01-01', '%Y-%m-%d'), 'end_date' : datetime.datetime.strptime('2100-12-31', '%Y-%m-%d')})
    for i in range(len(start_date)):
        try:
            dates_list_with_python_objects.append({'start_date' : datetime.datetime.strptime(start_date[i], '%Y-%m-%d'), 'end_date' : datetime.datetime.strptime(end_date[i], '%Y-%m-%d')})
        except ValueError as e:
            dates_list_with_python_objects.append({'start_date' : datetime.datetime.strptime('1900-01-01', '%Y-%m-%d'), 'end_date' : datetime.datetime.strptime('2100-12-31', '%Y-%m-%d')})
    return dates_list_with_python_objects

@csrf_protect
def remove_forbidden_slot(request):
    if request.user.is_authenticated():
        pk = request.POST.get('pk')
        fs = forbidden_slot.objects.get(pk = int(pk))
        if fs.user == request.user:
            fs.delete()
            return HttpResponse("{}")
        else:
            return HttpResponse('{"error_message" : "You are not the owner of this Forbidden-Slot, and therefore cannot delete it. Voting feature will be added soon to accomodate feedback on Forbidden-Slots of other users."}')
    return HttpResponse('{"error_message" : "You are not logged in. Please login first."}')



def social_login(request):
    from django.template import RequestContext, loader
    template = loader.get_template('social_login.html')
    context = RequestContext(request, {
            'latest_question_list': "asti",
    })
    return HttpResponse(template.render(context))



def is_user_logged_in(request):
    if(request.user.is_authenticated()):
        return HttpResponse('{"username" : "' + request.user.username+'"}')
    return HttpResponse("{}")

def figure_out_if_post_data_is_in_session(request):
    if request.user.is_authenticated():
        if '_old_post' in request.session:
            try: 
                save_form_to_database(request)
            except Exception as e:
                return HttpResponse('{"error_message" : "' + str(e) +'"}')  
           #this is for the inappbrowser
    return HttpResponseRedirect(domain)






def find_out_if_user_was_registered_using_django_social_auth(user):
    if len(user.social_auth.filter(user=user)) == 1:
        return True
    return False



def import_UserSocialAuth():
    #I cant find where to import UserSocialAuth from so i made this function as a temporary hack
    return User.objects.get(username=user).social_auth
                                          
def get_provider(user):
    user_social_auth = import_UserSocialAuth(user)
    return user_social_auth.get(user=user).provider
                                          


def my_logout(request):
    logout(request)
    return HttpResponse(json.dumps({"redirect" : ""}))



def get_all_streets_given_constraints(request):
    from django.contrib.gis.geos import fromstr
    pnt = fromstr(request.GET['extent'])
    from datetime import datetime
    start_date = datetime.strptime(request.GET['start-date'], '%Y-%m-%d')
    start_time = datetime.strptime(request.GET['start-time'], '%H:%M')
    end_time = datetime.strptime(request.GET['end-time'], '%H:%M')
    allowed = request.GET['allowed-duration']

    from django.contrib.gis.measure import Distance, D
    wanted_day = get_day_name(start_date.weekday())
    
    start_date_text = start_date.strftime('%Y-%m-%d') 
    start_time_text = start_time.strftime('%H:%M:%S')
    end_time_text = end_time.strftime('%H:%M:%S')


    
    all_streets = individual_streets.objects.raw("\
        select ST_ASTEXT(geom), id_0 from zones_individual_streets where zones_individual_streets.id_0 IN\
            (select DISTINCT line_id as id_0 FROM zones_forbidden_slot fs WHERE fs.id NOT IN\
                (SELECT forbidden_slot_id FROM zones_forbidden_slot_days fsd where fsd.day_id IN (SELECT id FROM zones_day where day=%s)\
                AND (SELECT (DATE %s, DATE %s) OVERLAPS (fs.start_date, fs.end_date))\
                AND (SELECT (TIME %s, TIME %s) OVERLAPS (fs.start_time, fs.end_time))\
                GROUP BY fs.line_id, fsd.forbidden_slot_id))\
            AND ST_DWITHIN  (st_transform(geom, 900913), st_transform(ST_GeomFromText('POINT(%s %s )', 4326), 900913), 1000.0)", [wanted_day, start_date_text, start_date_text, start_time_text, end_time_text, pnt.x, pnt.y])

    json = ""
    for i in all_streets:
        json += i.geom.json[0: -1] + ', "pk" : ' + str(i.pk) + ' },'
    return HttpResponse('[' + json[0 : -1] + ']')



def get_day_name(i):
        if i == 0:
            return 'Monday'
        if i == 1:
            return 'Tuesday'
        if i == 2:
            return 'Wednesday'
        if i == 3:
            return 'Thursday'
        if i == 4:
            return 'Friday'
        if i == 5:
            return 'Saturday'
        if i == 6:
            return 'Sunday'



            
@ensure_csrf_cookie
def set_csrf_cookie(request):
    app_id = request.GET.get('app_id', False)
    #put your app id here:
    if app_id == "":
        return HttpResponse('{"csrf_token" : "' + request.META['CSRF_COOKIE'] + '"}')
    else:
        return HttpResponse('{}')
        
    




def vote(request):
    if request.method == "POST":
        if request.user.is_authenticated():
            fs_id = request.POST.get("pk")
            fs = forbidden_slot.objects.get(pk=int(fs_id))
            verdict = request.POST.get("vote")
            flag_user_already_voted, up_or_down, vote= fs.did_user_already_vote_for_this_forbidden_slot(request.user)
            if flag_user_already_voted:
                if verdict == "up" and up_or_down=="up":
                    remove_user_vote(vote)
                    return HttpResponse('{"remove" : "up"}')
                if verdict == "down" and up_or_down=="down":
                    remove_user_vote(vote)
                    return HttpResponse('{"remove" : "down"}')
            elif verdict == "up":
                vote = Voters(voter=request.user, fs=fs, up_or_down = True)
                vote.save()
                return HttpResponse('{"vote" : "up"}')
            elif verdict == "down":
                vote = Voters(voter=request.user, fs=fs, up_or_down = False)
                vote.save()
                return HttpResponse('{"vote" : "down"}')
            fs.save()
    return HttpResponse('{}')




    
                


def remove_user_vote(voter):
    voter.delete()
    

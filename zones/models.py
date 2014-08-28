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
from django.core.exceptions import ValidationError
from django.contrib.gis.db import models
from django import forms
from django.contrib.auth.models import User
from django.forms import ModelForm
import json
from captcha.fields import CaptchaField
#


class Day(models.Model):
    #DAYS=(('Monday','Monday'),('Tuesday','Tuesday'),('Wednesday','Wednesday'),('Thursday','Thursday'),('Friday','Friday'),
            #('Saturday','Saturday'),('Sunday','Sunday'),)
    day = models.CharField(max_length=9)
    objects = models.GeoManager()

class individual_streets(models.Model):
    id_0 = models.IntegerField(primary_key = True)
    id = models.IntegerField();
    geom = models.LineStringField()
    objects = models.GeoManager()



    
    

class forbidden_slot(models.Model):
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    days = models.ManyToManyField(Day)
    objects = models.GeoManager()
    street_side = models.CharField(max_length=9)
    votes_up = models.IntegerField(default=0)
    votes_down = models.IntegerField(default=0)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    voters = models.ManyToManyField(User, through='Voters', related_name="voters")
    approved = models.BooleanField(default=False)
    accessed = models.IntegerField(null=False)
    added = models.DateField(auto_now_add=True)
    line = models.ForeignKey(individual_streets)
    allowed = models.IntegerField(default = 0)
    paid = models.BooleanField(default=False)

    def to_json(self, user):
        flag_user_already_voted, verdict, vote_object = self.did_user_already_vote_for_this_forbidden_slot(user)
        if not flag_user_already_voted:
            verdict=""
        json_str = '"start_date" : "' + self.start_date.isoformat() + '", ' + \
                   '"end_date" : "' + self.end_date.isoformat() + '", ' + \
                   '"start_time" : "' + self.start_time.isoformat()[0:-3] + '", ' + \
                   '"end_time" : "' + self.end_time.isoformat()[0:-3] + '", ' + \
                   '"street_side" : "' + self.street_side + '", ' + \
                   '"pk" : "' + str(self.pk) + '",' + \
                   '"allowed" : "' + str(self.allowed) + '",' + \
                   '"paid" : "' + str(self.paid) + '",' + \
                   '"votes_up" : ' + self.get_votes_up() + ',' + \
                   '"votes_down" : ' + self.get_votes_down() + ',' + \
                   '"user_already_voted" : "' + verdict + '",' + \
                   '"days" : ' + self.get_days()

        return json_str


    def has_changed(self, start_date, end_date, start_time, end_time, allowed, paid, days):
        has_changed_flag = False
        paid = True if paid == "true" else False
        if self.start_date == start_date.date() and self.start_time == start_time.time() and self.end_date == end_date.date() and self.end_time == end_time.time() and self.allowed==allowed and self.paid==paid and self.see_if_days_arrays_are_equal(days):
            pass
        else:
            has_changed_flag = True
        return has_changed_flag
    
    def see_if_days_arrays_are_equal(self, days):
        if len(days) != len(self.days.all()):
            return False
        at_least_one_not_in_flag = False
        for i in self.days.all():
            at_least_one_not_in_flag = True if not i.day in days else False
        return not at_least_one_not_in_flag
        
    def get_days(self):
        answer = []
        for i in self.days.all():
            answer.append(i.day)
        return json.dumps(answer)

    def get_votes_up(self):
        number = 0
        for i in self.voters.through.objects.all():
            if i.up_or_down:
                number=number+1
        return json.dumps(number)
            
    def get_votes_down(self):
        number = 0
        for i in self.voters.through.objects.all():
            if not i.up_or_down:
                number=number+1
        return json.dumps(number)


    def did_user_already_vote_for_this_forbidden_slot(self, user):
        if not user.is_authenticated():
            return False, "", None
        vote=Voters.objects.filter(voter=user, fs=self)
        flag_user_already_voted = False
        verdict = None
        if len(vote)>0:
            flag_user_already_voted = True
            verdict = vote[0].up_or_down

        verdict = self.convert_verdict_to_string(verdict)

        return flag_user_already_voted, verdict, vote

        
    def convert_verdict_to_string(self, verdict):
        if verdict == True:
            verdict = "up"
        else:
            verdict = "down"

        return verdict
        
    

        



class Voters(models.Model):
    voter = models.ForeignKey(User, related_name="voter")
    fs = models.ForeignKey(forbidden_slot, related_name="fs")
    up_or_down = models.BooleanField()
        
        
class UserLoginForm(ModelForm):
    from django import forms
    password = forms.CharField(widget=forms.PasswordInput, label="Your Password")

    class Meta:
        model = User
        fields = ('username',)

    def clean(self):
        if 'username' not in self.cleaned_data or 'password' not in self.cleaned_data:
            raise ValidationError("Please fill in both the username and password")
        username = self.cleaned_data['username']
        if User.objects.filter(username=username):
            if User.objects.get(username=username):
                return self.cleaned_data
        else:
            raise ValidationError("Username does not exist")
        raise ValidationError("Password and username did not match")






class SingleUserNameField(forms.CharField):
    def validate(self, value):
        if value == '':
            raise ValidationError('This field cant be blank')
        user = User.objects.filter(username=value)
        if len(user) is not 0:
            #TODO: display an error message for this field(also in the template ofcourse)
            #self.error_messages['my_message']="blabla"
            raise ValidationError('User already exists')


class RegisterForm(ModelForm):
    def __init__(self, *args, **kw):
            super(ModelForm, self).__init__(*args, **kw)
            self.fields.keyOrder = ['username', 'first_name', 'last_name', 'email', 'password', 'password_confirmation']
    username = SingleUserNameField(label="Username:")
    password = forms.CharField(widget=forms.PasswordInput, label="Your Password", help_text="Alphanumeric characters and underscores are allowed")
    password_confirmation = forms.CharField(widget=forms.PasswordInput, label="Repeat your Password")

    class Meta:
        model = User

    def clean_password(self):
        password = self.cleaned_data['password']
        if len(password) < 8:
            raise forms.ValidationError("Password too short. Please use at least 8 alphanumerical character")
        import re
        if re.match('[a-zA-Z0-9_]*$', password) is None:
            raise forms.ValidationError('Password must be a alphanumbeical character or the _ character')
        return password

    def clean(self):
        #form.fields['username'].error_messages['my_message']='blabla'
        if "password" not in self.cleaned_data or "password_confirmation" not in self.cleaned_data or "username" not in self.cleaned_data:
            raise forms.ValidationError("Please fill in all fields")
        password = self.cleaned_data['password']
        password_confirmation = self.cleaned_data['password_confirmation']
        if password_confirmation != password:
            raise forms.ValidationError("Passwords did not match")
        return self.cleaned_data
        
from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth.models import User

#class ChangeProfileForm(UserChangeForm):
    #def __init__(self, *args, **kwargs):
        #super(ChangeProfileForm, self).__init__(*args, **kwargs)
        #del self.fields['password']
#
    #class Meta:
        #model = User
        #fields = ('username','email','first_name','last_name')

class ChangeProfileForm(ModelForm):
    def __init__(self, *args, **kw):
            super(ChangeProfileForm, self).__init__(*args, **kw)
            del self.fields['password']
            self.fields.keyOrder = ['username', 'first_name', 'last_name', 'email', 'new_password', 'password_confirmation', 'current_password']
    new_password = forms.CharField(widget=forms.PasswordInput, label="Your new password", help_text="Alphanumeric characters and underscores are allowed", required=False)
    password_confirmation = forms.CharField(widget=forms.PasswordInput, label="Repeat your new password", required=False)
    current_password = forms.CharField(widget=forms.PasswordInput, label="Your current password", help_text="Alphanumeric characters and underscores are allowed")

    class Meta:
        model = User

    #def clean_new_password(self):
        #new_password = self.cleaned_data['new_password']
        #if len(new_password) > 0:
            #if len(new_password) < 8 :
                #raise forms.ValidationError("Password too short. Please use at least 8 alphanumerical character")
            #import re
            #if re.match('[a-zA-Z0-9_]*$', new_password) is None:
                #raise forms.ValidationError('Password must be a alphanumbeical character or the _ character')
        #return new_password
#
    #def clean(self):
        ##form.fields['username'].error_messages['my_message']='blabla'
        #if "password" not in self.cleaned_data or "password_confirmation" not in self.cleaned_data or "username" not in self.cleaned_data:
            #raise forms.ValidationError("Please fill in all fields")
        #password = self.cleaned_data['password']
        #password_confirmation = self.cleaned_data['password_confirmation']
        #if password_confirmation != password:
            #raise forms.ValidationError("Passwords did not match")
        #return self.cleaned_data


class CaptchaTestForm(forms.Form):
    captcha = CaptchaField()

# -*- coding: utf-8 -*-
from django import forms
from django.contrib.auth.forms import AuthenticationForm,UserChangeForm,PasswordResetForm
from django.contrib.auth.forms import get_current_site,urlsafe_base64_encode,default_token_generator,force_bytes
from django.template import loader
from django.contrib.auth.models import Group,Permission,User
from django.contrib.auth import authenticate
from django.conf import settings
from django.db.models import get_model

import e89_beta_testing.models
import sys,json,os
import e89_tools.tools
import dropbox

class BetaTesterForm(forms.ModelForm):
	class Meta:
		model = e89_beta_testing.models.BetaTester
		exclude = ('udid','token',)


class IphoneBetaAppForm(forms.ModelForm):
	class Meta:
		model = e89_beta_testing.models.IphoneBetaApp

	def save(self, *args,**kwargs):
		instance = super(IphoneBetaAppForm, self).save(*args,**kwargs)
		instance.set_plist_url()
		instance.upload_dropbox()

		instance.save()

class EnvioIosForm(forms.Form):
	beta_app = forms.ModelChoiceField(e89_beta_testing.models.IphoneBetaApp.objects.all(),empty_label=None)

	def save(self,data):
		beta_app = self.cleaned_data['beta_app']
		beta_testers = data.getlist('beta_tester')
		beta_testers = e89_beta_testing.models.BetaTester.objects.filter(id__in=beta_testers,platform='ios')

		url = 'itms-services://?action=download-manifest&url=' + beta_app.plist_url

		e89_tools.tools.send_email(beta_testers,
		subject=settings.BETA_EMAIL_LINK_IPHONE_SUBJECT,
		template=getattr(settings,'BETA_EMAIL_LINK_IPHONE_TEMPLATE','e89_beta_testing/email_link_iphone.html'),
		template_kwargs={'download_url':url, 'web_url':settings.WEBSITE_DOMAIN},
		html=True)

class EnvioAndroidForm(forms.Form):
	link_download = forms.CharField(max_length=300)

	def save(self,data):
		beta_testers = data.getlist('beta_tester')
		beta_testers = e89_beta_testing.models.BetaTester.objects.filter(id__in=beta_testers,platform='android')

		link_download = self.cleaned_data['link_download']
		if not link_download.startswith('https://'):
			link_download = 'https://' + link_download

		e89_tools.tools.send_email(beta_testers,
		subject=settings.BETA_EMAIL_LINK_ANDROID_SUBJECT,
		template=getattr(settings,'BETA_EMAIL_LINK_ANDROID_TEMPLATE','e89_beta_testing/email_link_android.html'),
		template_kwargs={'download_url':link_download, 'web_url':settings.WEBSITE_DOMAIN},
		html=True)




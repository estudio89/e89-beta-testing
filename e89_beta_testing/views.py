# -*- coding: utf-8 -*-
from django.shortcuts import render_to_response, get_object_or_404, redirect
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.template import RequestContext
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_protect, csrf_exempt
from django.views.decorators.http import condition
from django.views.decorators.clickjacking import xframe_options_exempt
from django.contrib.auth.decorators import login_required,user_passes_test,permission_required
from django.contrib.auth.models import Group
from django.db.models import get_model
from django.template import loader
from e89_beta_testing.forms import BetaTesterForm,IphoneBetaAppForm,EnvioIosForm,EnvioAndroidForm
from django.conf import settings
from django.utils import timezone

import e89_tools.tools
from xml.dom import minidom
import sys

def registro_beta_tester(request):
	''' Página de registro do beta tester. '''

	if not getattr(settings, 'BETA_REGISTRATION_ALLOWED',True):
		raise Http404

	if request.method == 'GET':
		form = BetaTesterForm()
		return render_to_response(getattr(settings,'BETA_REGISTRATION_TEMPLATE','e89_beta_testing/registro.html'),{'form':form},context_instance=RequestContext(request))

	elif request.method == 'POST':
		email = request.POST['email']
		BetaTester = get_model('e89_beta_testing', 'BetaTester')
		try:
			instance = BetaTester.objects.get(email=email)
		except BetaTester.DoesNotExist:
			instance = None

		form = BetaTesterForm(data=request.POST, instance=instance)
		assert form.is_valid(),"BetaTesterForm invalido. Errors: %s"%(form.errors)
		beta_tester = form.save()

		e89_tools.tools.send_email(beta_tester,
			subject=settings.BETA_EMAIL_REGISTRATION_OK_SUBJECT,
			template=getattr(settings,'BETA_EMAIL_REGISTRATION_OK_TEMPLATE','e89_beta_testing/email_registro_ok.html'),
			template_kwargs={'beta_tester':beta_tester,'url':settings.WEBSITE_DOMAIN + reverse('e89_beta_testing.views.registrar_iphone',kwargs={'token':beta_tester.token}),'url_login':settings.WEBSITE_DOMAIN +reverse(settings.BETA_LOGIN_VIEW)},
			static_images=['/static/e89_beta_testing/img/udid_iphone.png','/static/e89_beta_testing/img/udid_iphone_2.png'] if beta_tester.platform == 'ios' else [],
			html=True)

		if hasattr(settings, 'BETA_NOTIFY_EMAIL'):
			email = settings.BETA_NOTIFY_EMAIL
			e89_tools.tools.send_email(email,
				subject='[BETA_TESTER]',
				template='e89_beta_testing/email_new_beta_tester.html',
				template_kwargs={'beta_tester':beta_tester})

		return render_to_response(getattr(settings,'BETA_REGISTRATION_OK_TEMPLATE','e89_beta_testing/registro_ok.html'),context_instance=RequestContext(request))

@xframe_options_exempt
@csrf_exempt
def registrar_iphone(request,token):
	''' Página de instalação do profile de obtenção do UDID do iphone. Um link para essa view é enviado ao usuário.'''

	if not getattr(settings, 'BETA_REGISTRATION_ALLOWED',True):
		raise Http404

	domain = request.META['HTTP_HOST']
	url = domain + reverse('e89_beta_testing.views.udid')
	xml = loader.render_to_string('e89_beta_testing/udid.mobileconfig',{'token':token, 'description':settings.BETA_IOS_PROFILE_DESCRIPTION, 'url':url, 'domain':domain})

	response = HttpResponse(xml,content_type='application/octet-stream')
	response['Accept-Ranges']='bytes'
	response['Last-Modified']=timezone.now().strftime("%a, %d %b %Y %H:%M:%S GMT")
	response['ETag']='"%s"'%(token[:32])
	return response

@csrf_exempt
def udid(request):
	''' View chamada pelo iPhone do usuário após o usuário cadastrar o profile. Essa view é utilizada para obtenção do UDID.
		Um link para ela é incluido no arquivo udid.mobileconfig acessado no iphone do usuário.'''

	if not getattr(settings, 'BETA_REGISTRATION_ALLOWED',True):
		raise Http404

	xml_data = request.body
	end_idx = xml_data.index("</plist>") + len("</plist>")
	start_idx = xml_data.index("<!DOCTYPE")
	xml_data = xml_data[start_idx:end_idx]

	xml_dom = minidom.parseString(xml_data)
	plist = xml_dom.childNodes[1]
	dict_node = plist.childNodes[1]

	keys = dict_node.getElementsByTagName('key')

	for key in keys:
		if key.childNodes[0].nodeValue == u'UDID':
			udid = key.nextSibling.nextSibling.firstChild.nodeValue
		elif key.childNodes[0].nodeValue == u'CHALLENGE':
			token = key.nextSibling.nextSibling.firstChild.nodeValue

	BetaTester = get_model("e89_beta_testing", "BetaTester")
	beta_tester = BetaTester.objects.get(token=token)
	beta_tester.udid = udid
	beta_tester.save()

	if hasattr(settings, 'BETA_NOTIFY_EMAIL'):
		email = settings.BETA_NOTIFY_EMAIL
		e89_tools.tools.send_email(email,
			subject='[BETA_TESTER] UDID',
			template='e89_beta_testing/email_new_udid.html',
			template_kwargs={'beta_tester':beta_tester})

	return redirect("e89_beta_testing.views.udid_done",permanent=True)

@csrf_exempt
def udid_done(request):
	''' Página exibida ao usuário em seu iPhone após o envio do UDID.'''

	if not getattr(settings, 'BETA_REGISTRATION_ALLOWED',True):
		raise Http404

	return render_to_response(getattr(settings,'BETA_REGISTRATION_IPHONE_OK','e89_beta_testing/registro_iphone_ok.html'))

@user_passes_test(lambda u: u.is_superuser)
def view_testers(request):
	''' Página de visualização dos beta testers cadastrados. '''

	BetaTester = get_model("e89_beta_testing", "BetaTester")
	IphoneBetaApp = get_model("e89_beta_testing", "IphoneBetaApp")
	testers = BetaTester.objects.all()
	beta_apps = IphoneBetaApp.objects.all()
	form_envio_ios = EnvioIosForm()
	form_envio_android = EnvioAndroidForm()
	texto_email_ios = loader.render_to_string('e89_beta_testing/email_link_iphone.html',{'download_url':'<url_download>','web_url':settings.WEBSITE_DOMAIN })
	texto_email_android = loader.render_to_string('e89_beta_testing/email_link_android.html',{'download_url':'<url_download>','web_url':settings.WEBSITE_DOMAIN })
	if request.method == "GET":
		form = IphoneBetaAppForm()
	else:
		form = IphoneBetaAppForm(data=request.POST,files=request.FILES)
		assert form.is_valid(), "IphoneBetaAppForm invalido. Errors: %s"%(str(form.errors))
		form.save()

	return render_to_response("e89_beta_testing/view_testers.html",locals(),context_instance=RequestContext(request))

@user_passes_test(lambda u: u.is_superuser)
def ajax_send_ios_download_link(request):
	''' View de envio do link de download para usuários iOS. Acessível a partir da página de visualização dos beta testers.'''

	if request.method == 'POST':
		form = EnvioIosForm(data=request.POST)
		assert form.is_valid(), "EnvioIosForm invalido. Errors: %s"%(str(form.errors))
		form.save(request.POST)
		return HttpResponse('Email enviado')
	return HttpResponse('')

@user_passes_test(lambda u: u.is_superuser)
def ajax_send_android_download_link(request):
	''' View de envio do link de download para usuários Android. Acessível a partir da página de visualização dos beta testers.'''

	if request.method == 'POST':
		form = EnvioAndroidForm(data=request.POST)
		assert form.is_valid(), "EnvioAndroidForm invalido. Errors: %s"%(str(form.errors))
		form.save(request.POST)
		return HttpResponse('Email enviado')
	return HttpResponse('')

@user_passes_test(lambda u: u.is_superuser)
def ajax_delete_beta_app(request,id_beta_app):
	if request.method == 'POST':
		IphoneBetaApp = get_model('e89_beta_testing', 'IphoneBetaApp')
		beta_app = get_object_or_404(IphoneBetaApp,id=id_beta_app)
		beta_app.delete()
	return HttpResponse('[]')

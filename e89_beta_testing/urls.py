from django.conf.urls import url
import e89_beta_testing.views

urlpatterns = [
	url(r'^registro/$', e89_beta_testing.views.registro_beta_tester),
	url(r'^registrar-iphone/(?P<token>[^/]+)/udid.mobileconfig$', e89_beta_testing.views.registrar_iphone),
	url(r'^udid/$', e89_beta_testing.views.udid),
	url(r'^udid/done/$', e89_beta_testing.views.udid_done),
	url(r'^testers/$', e89_beta_testing.views.view_testers),
	url(r'^ajax/enviar/iphone/$', e89_beta_testing.views.ajax_send_ios_download_link),
	url(r'^ajax/enviar/android/$', e89_beta_testing.views.ajax_send_android_download_link),
	url(r'^ajax/delete-beta-app/(?P<id_beta_app>\d+)/$', e89_beta_testing.views.ajax_delete_beta_app),
]

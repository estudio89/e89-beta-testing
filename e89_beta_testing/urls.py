from django.conf.urls import patterns, include, url

urlpatterns = patterns('e89_beta_testing.views',

	(r'^registro/$', 'registro_beta_tester'),
	(r'^registrar-iphone/(?P<token>[^/]+)/udid.mobileconfig$', 'registrar_iphone'),
	(r'^udid/$', 'udid'),
	(r'^udid/done/$', 'udid_done'),
	(r'^testers/$', 'view_testers'),
	(r'^ajax/enviar/iphone/$', 'ajax_send_ios_download_link'),
	(r'^ajax/enviar/android/$', 'ajax_send_android_download_link'),
	(r'^ajax/delete-beta-app/(?P<id_beta_app>\d+)/$', 'ajax_delete_beta_app'),


)
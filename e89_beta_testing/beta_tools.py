# -*- coding: utf-8 -*-
from django.conf import settings
from e89_beta_testing.oauth2 import RefreshToken
import urllib,urllib2,json

def add_user_to_beta_group(email):
	response = RefreshToken(settings.BETA_GOOGLE_CLIENT_ID, settings.BETA_GOOGLE_CLIENT_SECRET,
                            settings.BETA_GOOGLE_REFRESH_TOKEN)
	access_token = response['access_token']

	url = 'https://www.googleapis.com/admin/directory/v1/groups/%s/members/'%(settings.BETA_GOOGLE_GROUP_EMAIL)

	payload = {'email':email,'role':'MEMBER'}
	params = {'access_token':access_token}
	url += '?' + urllib.urlencode(params)
	print url
	request = urllib2.Request(url,json.dumps(payload))
	request.add_header('Content-Type', 'application/json')

	response = urllib2.urlopen(request)
	assert response.getcode() == 200, 'Error in google admin sdk response. Response: %s'%(response.read())
	response = json.loads(response.read())
	print response


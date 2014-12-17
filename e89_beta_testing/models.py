# -*- coding: utf-8 -*-
from django.db import models
from django.conf import settings
import e89_tools.tools
import os
import dropbox
from xml.dom import minidom

class BetaTester(models.Model):
	PLATFORM_CHOICES = (("ios","iOS (iPhone)"),("android","Android"))
	email = models.CharField(max_length=255,unique=True)
	name = models.CharField(max_length=255)
	platform = models.CharField(max_length=30,choices=PLATFORM_CHOICES,null=True,blank=True)
	udid = models.CharField(max_length=255,null=True,blank=True)
	phone = models.CharField(max_length=20)
	token = models.CharField(max_length=50)

	def save(self,*args, **kwargs):
		if self.id is None:
			from uuid import uuid3, uuid4
			from datetime import datetime as dt
			self.token = str(uuid3(uuid4(), str(dt.now())))
		super(BetaTester, self).save(*args,**kwargs)

class IphoneBetaApp(models.Model):
	plist_url = models.CharField(max_length=300,null=True,blank=True)
	ipa = models.FileField(upload_to='BETA_APPS')
	plist = models.FileField(upload_to='BETA_APPS')

	def __unicode__(self):
		return os.path.basename(self.ipa.path)

	def upload_dropbox(self):
		client = dropbox.client.DropboxClient(settings.BETA_DROPBOX_AUTHORIZATION_CODE)
		self.plist.open()
		url = '/' + os.path.basename(self.plist.path)
		client.put_file(url,self.plist)

		share_url = client.share(url,short_url=False)['url']
		share_url = share_url.replace('?dl=0','')
		share_url = share_url.replace('www.dropbox.com','dl.dropboxusercontent.com')
		self.plist_url = share_url.replace('?dl=0','')

	def delete_dropbox(self):
		client = dropbox.client.DropboxClient(settings.BETA_DROPBOX_AUTHORIZATION_CODE)
		path = os.path.basename(self.plist.path)
		client.file_delete(path)

	def set_plist_url(self):
		''' Garante que dentro do arquivo .plist, a url correta do .ipa é referenciada. '''
		self.plist.open()
		xml_data = self.plist.read()
		self.plist.close()

		xml_dom = minidom.parseString(xml_data)
		els=xml_dom.getElementsByTagName("key")
		key = [e for e in els if e.firstChild.nodeValue=='url'][0]
		key.nextSibling.nextSibling.firstChild.nodeValue = settings.WEBSITE_DOMAIN + self.ipa.url

		self.plist.open('w')
		self.plist.write(xml_dom.toxml())
		self.plist.close()

	def get_plist_filename(self):
		return os.path.basename(self.plist.path)

	def get_ipa_filename(self):
		return os.path.basename(self.ipa.path)
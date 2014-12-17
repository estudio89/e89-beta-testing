# -*- coding: utf-8 -*-
from django.apps import AppConfig

class BetaTestingConfig(AppConfig):
	name='e89_beta_testing'
	def ready(self):
		import e89_beta_testing.signals

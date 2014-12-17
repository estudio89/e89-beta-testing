# -*- coding: utf-8 -*-
from django.db.models.signals import pre_delete
from django.dispatch.dispatcher import receiver
import e89_beta_testing.models

@receiver(pre_delete, sender=e89_beta_testing.models.IphoneBetaApp)
def beta_app_delete(sender, instance, **kwargs):
    ''' Método chamado sempre que um IphoneBetaApp é excluído,
        mesmo que através do método .delete() de um QuerySet. '''
    instance.ipa.delete(save=False)
    instance.delete_dropbox()
    instance.plist.delete(save=False)

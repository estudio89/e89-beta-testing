# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('beta_testing', '0002_iphonebetaapp'),
    ]

    operations = [
        migrations.AlterField(
            model_name='iphonebetaapp',
            name='plist_url',
            field=models.CharField(max_length=300, null=True, blank=True),
        ),
    ]

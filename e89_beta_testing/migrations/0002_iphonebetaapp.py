# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('beta_testing', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='IphoneBetaApp',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('plist_url', models.CharField(max_length=50, null=True)),
                ('ipa', models.FileField(upload_to=b'BETA_APPS')),
                ('plist', models.FileField(upload_to=b'BETA_APPS')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]

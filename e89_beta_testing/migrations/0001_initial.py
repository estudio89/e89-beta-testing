# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_change_auth_user'),
    ]

    operations = [
        migrations.CreateModel(
            name='BetaTester',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('platform', models.CharField(blank=True, max_length=30, null=True, choices=[(b'ios', b'iOS (iPhone)'), (b'android', b'Android')])),
                ('udid', models.CharField(max_length=255, null=True, blank=True)),
                ('telefone', models.CharField(max_length=20)),
                ('user', models.ForeignKey(to='accounts.CustomUser')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]

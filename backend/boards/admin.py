from django.contrib import admin

from .models import Board, BoardMembership, Column, Card

admin.site.register(Board)
admin.site.register(BoardMembership)
admin.site.register(Column)
admin.site.register(Card)

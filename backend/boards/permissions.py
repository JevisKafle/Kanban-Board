from rest_framework import permissions
from .models import Board, Column


class IsBoardMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Board):
            board = obj
        elif isinstance(obj, Column):
            board = obj.board
        else:
            board = obj.column.board
        return board.memberships.filter(user=request.user).exists()

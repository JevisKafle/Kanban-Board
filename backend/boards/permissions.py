from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from .models import Board, Column

EDITOR_ROLES = ("owner", "editor")


def _board_for(obj):
    if isinstance(obj, Board):
        return obj
    if isinstance(obj, Column):
        return obj.board
    return obj.column.board


def require_editor(user, board):
    """
    For create endpoints, where there is no object yet for DRF's
    has_object_permission to check. Raises unless `user` is an owner/editor
    of `board`.
    """
    membership = board.memberships.filter(user=user).first()
    if membership is None:
        raise PermissionDenied("You are not a member of this board.")
    if membership.role not in EDITOR_ROLES:
        raise PermissionDenied("Viewers can't modify this board.")


class IsBoardMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return _board_for(obj).memberships.filter(user=request.user).exists()


class IsBoardEditor(permissions.BasePermission):
    """
    Object-level: reads are open to any member (IsBoardMember checks that);
    writes (PUT/PATCH/DELETE) need the owner or editor role.
    Create has no object, so views call require_editor() in perform_create.
    """

    message = "Viewers can't modify this board."

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            _board_for(obj)
            .memberships.filter(user=request.user, role__in=EDITOR_ROLES)
            .exists()
        )


class IsBoardOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner_id == request.user.id

from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Board, BoardMembership, Column, Card
from .serializers import BoardSerializer, ColumnSerializer, CardSerializer
from .permissions import IsBoardMember
from .events import broadcast_to_board
from .positions import compute_position
from rest_framework.exceptions import PermissionDenied, ValidationError


class BoardViewSet(viewsets.ModelViewSet):
    serializer_class = BoardSerializer
    permission_classes = [IsBoardMember]

    def get_queryset(self):
        return Board.objects.filter(memberships__user=self.request.user)

    def perform_create(self, serializer):
        board = serializer.save(owner=self.request.user)
        BoardMembership.objects.create(
            board=board, user=self.request.user, role="owner"
        )


class ColumnViewSet(viewsets.ModelViewSet):
    serializer_class = ColumnSerializer
    permission_classes = [IsBoardMember]

    def get_queryset(self):
        return Column.objects.filter(board__memberships__user=self.request.user)


class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [IsBoardMember]

    def get_queryset(self):
        return Card.objects.filter(column__board__memberships__user=self.request.user)

    def perform_create(self, serializer):
        board = serializer.validated_data["board"]
        if not board.memberships.filter(user=self.request.user).exists():
            raise PermissionDenied("You are not a member of this board.")
        last = (
            Column.objects.filter(board=board)
            .order_by("position")
            .values_list("position", flat=True)
            .last()
        )
        column = serializer.save(position=(last + 1.0) if last is not None else 1.0)
        broadcast_to_board(
            board.id, "column.created", {"column": ColumnSerializer(column).data}
        )

    def perform_update(self, serializer):
        new_board = serializer.validated_data.get("board")
        if new_board and new_board.id != serializer.instance.board_id:
            raise ValidationError({"board": "Cannot move a column to another board."})
        column = serializer.save()
        broadcast_to_board(
            column.board_id, "column.updated", {"column": ColumnSerializer(column).data}
        )

    def perform_destroy(self, instance):
        board_id, column_id = instance.board_id, instance.id
        instance.delete()
        broadcast_to_board(board_id, "column.deleted", {"column_id": column_id})

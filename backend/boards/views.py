from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Board, BoardMembership, Column, Card
from .serializers import BoardSerializer, ColumnSerializer, CardSerializer
from .permissions import IsBoardMember
from .events import broadcast_to_board
from .positions import compute_position
from rest_framework.exceptions import ValidationError


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
        column_id = serializer.validated_data["column"].id
        last = (
            Card.objects.filter(column_id=column_id)
            .order_by("position")
            .values_list("position", flat=True)
            .last()
        )
        position = (last + 1.0) if last is not None else 1.0
        card = serializer.save(position=position)
        broadcast_to_board(
            card.column.board_id, "card.created", {"card": CardSerializer(card).data}
        )


def perform_update(self, serializer):
    card = serializer.instance
    data = self.request.data

    target = serializer.validated_data.get("column", card.column)
    if target.board_id != card.column.board_id:
        raise ValidationError({"column": "Cannot move a card to another board."})

    if "before_id" in data or "after_id" in data:

        def neighbour_position(key):
            pk = data.get(key)
            if pk is None:
                return None
            pos = (
                Card.objects.filter(pk=pk, column=target)
                .exclude(pk=card.pk)
                .values_list("position", flat=True)
                .first()
            )
            if pos is None:
                raise ValidationError({key: "Card not in target column."})
            return pos

        position = compute_position(
            neighbour_position("before_id"), neighbour_position("after_id")
        )
        card = serializer.save(position=position)
    else:
        card = serializer.save()

    broadcast_to_board(
        card.column.board_id,
        "card.updated",
        {"card": CardSerializer(card).data},
    )

    def perform_destroy(self, instance):
        board_id = instance.column.board_id
        card_id = instance.id
        instance.delete()
        broadcast_to_board(board_id, "card.deleted", {"card_id": card_id})

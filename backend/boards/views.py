from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Board, BoardMembership, Column, Card
from .serializers import BoardSerializer, ColumnSerializer, CardSerializer
from .permissions import IsBoardMember
from .events import broadcast_to_board
from .positions import compute_position


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
            card.column.board_id, "card_created", {"card": CardSerializer(card).data}
        )


    def perform_update(self, serializer):
        before_id = self.request.data.get("before_id")
        after_id = self.request.data.get("after_id")

        if before_id or after_id:
            before = (
                Card.objects.filter(id=before_id)
                .values_list("position", flat=True)
                .first()
                if before_id
                else None
            )
            after = (
                Card.objects.filter(id=after_id)
                .values_list("position", flat=True)
                .first()
                if after_id
                else None
            )
            card = serializer.save(position=compute_position(before, after))
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

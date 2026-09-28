from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from .models import Board, BoardMembership, Column, Card
from .serializers import (
    BoardSerializer,
    BoardListSerializer,
    ColumnSerializer,
    CardSerializer,
    BoardMemberShipSerializer,
    AddMemberSerializer,
)
from .permissions import IsBoardMember, IsBoardOwner
from .events import broadcast_to_board
from .positions import compute_position
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response


class BoardViewSet(viewsets.ModelViewSet):
    def get_serializer_class(self):
        return BoardListSerializer if self.action == "list" else BoardSerializer

    def get_permissions(self):
        # Renaming or deleting a board is owner-only; other actions need membership.
        if self.action in ("update", "partial_update", "destroy"):
            return [IsBoardMember(), IsBoardOwner()]
        return [IsBoardMember()]

    def get_queryset(self):
        return Board.objects.filter(memberships__user=self.request.user).order_by("-id")

    def perform_create(self, serializer):
        board = serializer.save(owner=self.request.user)
        BoardMembership.objects.create(
            board=board, user=self.request.user, role="owner"
        )
        # Start every board with usable columns instead of an empty screen.
        Column.objects.bulk_create(
            [
                Column(board=board, title="To do", position=1.0),
                Column(board=board, title="In progress", position=2.0),
                Column(board=board, title="Done", position=3.0, is_done_column=True),
            ]
        )

    @action(detail=True, methods=["get", "post"], url_path="members")
    def members(self, request, pk=None):
        board = self.get_object()

        if request.method == "GET":
            memberships = board.memberships.select_related("user")
            return Response(BoardMemberShipSerializer(memberships, many=True).data)

        # POST: only the owner can add members
        requester_membership = board.memberships.filter(user=request.user).first()
        if not requester_membership or requester_membership.role != "owner":
            raise PermissionDenied("Only the board owner can add members.")

        serializer = AddMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.get_user()

        membership, created = BoardMembership.objects.update_or_create(
            board=board,
            user=user,
            defaults={"role": serializer.validated_data["role"]},
        )
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(BoardMemberShipSerializer(membership).data, status=status_code)


class ColumnViewSet(viewsets.ModelViewSet):
    serializer_class = ColumnSerializer
    permission_classes = [IsBoardMember]

    def get_queryset(self):
        return Column.objects.filter(board__memberships__user=self.request.user)

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


class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [IsBoardMember]

    def get_queryset(self):
        return Card.objects.filter(column__board__memberships__user=self.request.user)

    def perform_create(self, serializer):
        column = serializer.validated_data["column"]
        if not column.board.memberships.filter(user=self.request.user).exists():
            raise PermissionDenied("You are not a member of this board.")

        last = (
            Card.objects.filter(column=column)
            .order_by("position")
            .values_list("position", flat=True)
            .last()
        )
        position = (last + 1.0) if last is not None else 1.0
        card = serializer.save(position=position, owner=self.request.user)
        broadcast_to_board(
            column.board_id, "card.created", {"card": CardSerializer(card).data}
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

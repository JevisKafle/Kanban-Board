from .models import Board, BoardMembership, Column, Card
from rest_framework import serializers


class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = [
            "id",
            "column",
            "title",
            "description",
            "position",
            "owner",
            "updated_at",
        ]
        read_only_fields = ["id", "position", "updated_at"]


class ColumnSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)

    class Meta:
        model = Column
        fields = ["id", "board", "title", "position", "cards", "is_done_column"]
        read_only_fields = ["id", "position"]


class BoardSerializer(serializers.ModelSerializer):
    columns = ColumnSerializer(many=True, read_only=True)

    class Meta:
        model = Board
        fields = ["id", "title", "owner", "columns"]


class BoardMemberShipSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardMembership
        fields = ["id", "board", "user", "role"]

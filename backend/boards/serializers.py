from .models import Board, BoardMembership, Column, Card
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


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


class BoardListSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = Board
        fields = ["id", "title", "owner", "role"]
        read_only_fields = ["id", "owner"]

    def get_role(self, obj):
        request = self.context.get("request")
        if not request:
            return None
        membership = obj.memberships.filter(user=request.user).first()
        return membership.role if membership else None


class BoardSerializer(BoardListSerializer):
    columns = ColumnSerializer(many=True, read_only=True)

    class Meta(BoardListSerializer.Meta):
        fields = ["id", "title", "owner", "role", "columns"]


class BoardMemberShipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = BoardMembership
        fields = ["id", "board", "user", "username", "role"]
        read_only_fields = ["id", "board", "user"]


class AddMemberSerializer(serializers.Serializer):
    username = serializers.CharField()
    role = serializers.ChoiceField(choices=BoardMembership.ROLE_CHOICES)

    def validate_username(self, value):
        user = User.objects.filter(username=value).first()
        if user is None:
            raise serializers.ValidationError("No user with that username.")
        self._user = user
        return value

    def get_user(self):
        return self._user

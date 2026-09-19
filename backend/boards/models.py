from django.db import models
from django.conf import settings


class Board(models.Model):
    title = models.CharField(max_length=150)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="owned_boards"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class BoardMembership(models.Model):
    ROLE_CHOICES = [
        ("owner", "Owner"),
        ("editor", "Editor"),
        ("viewer", "Viewer"),
    ]
    board = models.ForeignKey(
        Board, on_delete=models.CASCADE, related_name="memberships"
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="editor")

    class Meta:
        unique_together = ("board", "user")

    def __str__(self):
        return f"{self.user} on {self.board} as {self.role}"


class Column(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="columns")
    title = models.CharField(max_length=100)
    position = models.FloatField()
    is_done_column = models.BooleanField(default=False)

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return f"{self.title} ({self.board})"


class Card(models.Model):
    column = models.ForeignKey(Column, on_delete=models.CASCADE, related_name="cards")
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    position = models.FloatField()
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return self.title

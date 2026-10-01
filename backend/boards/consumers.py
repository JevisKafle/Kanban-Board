import json
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import BoardMembership


class BoardConsumer(AsyncWebsocketConsumer):
    """
    Receive-only for clients. Writes go through the REST API, whose views call
    broadcast_to_board(); the handlers below just forward those events. There
    is deliberately no receive() so a connected client can't push messages to
    everyone else on the board.
    """

    async def connect(self):
        self.group_name = None
        try:
            board_id = uuid.UUID(self.scope["url_route"]["kwargs"]["board_id"])
        except ValueError:
            await self.close()
            return
        # str(UUID) is the canonical lowercase form, so the group name always
        # matches the one broadcast_to_board() builds, whatever case the URL used.
        self.board_id = str(board_id)
        self.group_name = f"board_{self.board_id}"
        user = self.scope["user"]

        if not user.is_authenticated:
            await self.close()
            return

        is_member = await self.check_membership(user, self.board_id)
        if not is_member:
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    @database_sync_to_async
    def check_membership(self, user, board_id):
        return BoardMembership.objects.filter(board_id=board_id, user=user).exists()

    async def disconnect(self, close_code):
        if self.group_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def card_created(self, event):
        await self.send(text_data=json.dumps(event))

    card_updated = card_created
    card_deleted = card_created
    column_created = card_created
    column_updated = card_created
    column_deleted = card_created
    board_updated = card_created
    board_deleted = card_created

    async def member_removed(self, event):
        await self.send(text_data=json.dumps(event))
        if event["user_id"] == self.scope["user"].id:
            await self.close()

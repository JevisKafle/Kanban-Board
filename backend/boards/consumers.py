import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import BoardMembership


class BoardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.board_id = self.scope["url_route"]["kwargs"]["board_id"]
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
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        await self.channel_layer.group_send(
            self.group_name, {"type": "board_echo", "message": data}
        )

    async def board_echo(self, event):
        await self.send(text_data=json.dumps(event["message"]))


    async def card_created(self, event):
        await self.send(text_data=json.dumps(event))

    card_updated = card_created
    card_deleted = card_created
    column_created = card_created

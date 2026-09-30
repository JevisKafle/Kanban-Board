import json
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.serializers.json import DjangoJSONEncoder


def broadcast_to_board(board_id, event_type, payload):
    channel_layer = get_channel_layer()
    payload = json.loads(json.dumps(payload, cls=DjangoJSONEncoder))
    async_to_sync(channel_layer.group_send)(
        f"board_{board_id}",
        {"type": event_type, **payload},
    )

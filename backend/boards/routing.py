from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(
        r"ws/boards/(?P<board_id>[0-9a-fA-F-]{36})/$", consumers.BoardConsumer.as_asgi()
    )
]
from rest_framework.routers import DefaultRouter
from .views import BoardViewSet,ColumnViewSet,CardViewSet

router = DefaultRouter()
router.register("boards",BoardViewSet,basename="board")
router.register("columns",ColumnViewSet,basename="column")
router.register("cards",CardViewSet,basename="card")

urlpatterns = router.urls

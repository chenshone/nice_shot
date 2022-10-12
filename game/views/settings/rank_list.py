from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from game.models.player.player import Player


class RankListView(APIView):
    permission_classes = ([IsAuthenticated])

    def get(self, request):
        players = Player.objects.all().order_by('-score')[:10]
        resp = []
        for player in players:
            resp.append({
                'username': player.user.username,
                'photo': player.photo,
                'score': player.score
            })
        return Response(resp)

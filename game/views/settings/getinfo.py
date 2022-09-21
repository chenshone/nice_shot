from django.http import JsonResponse

from game.models.player.player import Player


def getinfo(request):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({
            'result': "未登录"
        })
    else:
        player = Player.objects.filter(user__username=user.username)[0]
        return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo
        })

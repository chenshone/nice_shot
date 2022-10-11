from django.contrib.auth import login
from django.contrib.auth.models import User
from django.http import JsonResponse

from game.models.player.player import Player


def register(request):
    data = request.GET
    username = data.get("username", "").strip()
    password = data.get("password", "")
    password_confirm = data.get("password_confirm", "")
    if not username or not password:
        return JsonResponse({
            "result": "用户名或密码不能为空"
        })
    if password != password_confirm:
        return JsonResponse({
            'result': "两次密码不一致"
        })
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            "result": "用户名已存在"
        })
    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user,
                          photo="https://cdn.jsdelivr.net/gh/chenshone/myPictureHost@main/code_class/avatar.jpg")
    login(request, user)
    return JsonResponse({
        'result': "success"
    })

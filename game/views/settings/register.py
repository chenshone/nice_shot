from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.views import APIView

from game.models.player.player import Player


class RegisterView(APIView):
    def post(self, request):
        data = request.POST
        username = data.get("username", "").strip()
        password = data.get("password", "")
        password_confirm = data.get("password_confirm", "")
        if not username or not password:
            return Response({
                "result": "用户名或密码不能为空"
            })
        if password != password_confirm:
            return Response({
                'result': "两次密码不一致"
            })
        if User.objects.filter(username=username).exists():
            return Response({
                "result": "用户名已存在"
            })
        user = User(username=username)
        user.set_password(password)
        user.save()
        Player.objects.create(user=user,
                              photo="https://cdn.jsdelivr.net/gh/chenshone/myPictureHost@main/code_class/avatar.jpg")
        return Response({
            'result': "success"
        })

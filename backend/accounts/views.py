from django.shortcuts import render
from .serializers import UserSerializer, RegisterSerializer
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout


class RegisterView(generics.CreateAPIView):
    serializer_class = (RegisterSerializer)
    permission_classes = [permissions.AllowAny]


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"detail":"Invalid credentials"},status=status.HTTP_401_UNAUTHORIZED)
        login(request,user)
        return Response(UserSerializer(user).data)

class LogoutView(APIView):
    permission_classes =  [permissions.AllowAny]
    
    def post(self,request):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)

class MeView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self,request):
        return Response(UserSerializer(request.user).data)

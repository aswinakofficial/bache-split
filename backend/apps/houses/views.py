from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from .models import House, HouseMembership, HouseJoinToken
from .serializers import (
    HouseSerializer,
    HouseMembershipSerializer,
    HouseJoinTokenSerializer,
    HouseJoinAcceptSerializer,
)
import secrets
import string


class HouseViewSet(viewsets.ModelViewSet):
    serializer_class = HouseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return House.objects.filter(members=self.request.user)

    def perform_create(self, serializer):
        invite_code = "".join(
            secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8)
        )
        house = serializer.save(creator=self.request.user, invite_code=invite_code)
        HouseMembership.objects.create(house=house, user=self.request.user)

    @action(detail=False, methods=["post"])
    def join_house(self, request):
        invite_code = request.data.get("invite_code")
        try:
            house = House.objects.get(invite_code=invite_code)
            membership, created = HouseMembership.objects.get_or_create(
                house=house, user=request.user
            )
            if created:
                return Response({"message": "Successfully joined house"})
            else:
                return Response({"message": "Already a member"})
        except House.DoesNotExist:
            return Response(
                {"error": "Invalid invite code"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"], url_path="generate_join_token")
    def generate_join_token(self, request, pk=None):
        house = self.get_object()
        # Only allow members to generate
        if not house.members.filter(id=request.user.id).exists():
            return Response(
                {"detail": "Not a member of this house."},
                status=status.HTTP_403_FORBIDDEN,
            )
        # Create a new token (optionally: reuse unexpired tokens)
        token_obj = HouseJoinToken.objects.create(house=house, created_by=request.user)
        serializer = HouseJoinTokenSerializer(token_obj)
        return Response(serializer.data)


class HouseJoinTokenRetrieveView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = HouseJoinTokenSerializer
    lookup_field = "token"
    queryset = HouseJoinToken.objects.all()

    def get_object(self):
        obj = super().get_object()
        if not obj.is_valid():
            from rest_framework.response import Response
            from rest_framework import status

            raise Response(
                {"detail": "Join link expired."}, status=status.HTTP_400_BAD_REQUEST
            )
        return obj


class HouseJoinAcceptView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = HouseJoinAcceptSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data["token"]
        join_token = get_object_or_404(HouseJoinToken, token=token)
        if not join_token.is_valid():
            return Response(
                {"detail": "Join link expired."}, status=status.HTTP_400_BAD_REQUEST
            )
        house = join_token.house
        # Add user to house if not already a member
        membership, created = HouseMembership.objects.get_or_create(
            house=house, user=request.user
        )
        if not membership.is_active:
            membership.is_active = True
            membership.save()
        return Response({"detail": "Joined house successfully.", "house": house.id})

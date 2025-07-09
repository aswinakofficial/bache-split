from django.core.management.base import BaseCommand
from apps.houses.models import House
from apps.houses import HouseJoinToken
from django.contrib.auth import get_user_model
from django.utils import timezone


class Command(BaseCommand):
    help = "Generate a join token for a house"

    def add_arguments(self, parser):
        parser.add_argument("house_id", type=str)
        parser.add_argument("--user_id", type=int, default=None)
        parser.add_argument(
            "--expires", type=int, default=0, help="Expiry in hours (0 = never)"
        )

    def handle(self, *args, **options):
        house = House.objects.get(id=options["house_id"])
        user = None
        if options["user_id"]:
            user = get_user_model().objects.get(id=options["user_id"])
        expires_at = None
        if options["expires"]:
            expires_at = timezone.now() + timezone.timedelta(hours=options["expires"])
        token = HouseJoinToken.objects.create(
            house=house, created_by=user, expires_at=expires_at
        )
        self.stdout.write(
            self.style.SUCCESS(f"Join link: /api/houses/join/{token.token}/")
        )

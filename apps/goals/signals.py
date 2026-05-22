from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import SavingsGoal
from .services import fetch_goal_image


@receiver(post_save, sender=SavingsGoal)
def attach_goal_image(sender, instance, created, **kwargs):
    if created and not instance.cover_image:
        keyword = instance.title.split()[0]
        image = fetch_goal_image(keyword)
        if image:
            instance.cover_image.save(image.name, image, save=True)

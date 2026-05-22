import requests
from django.conf import settings
from django.core.files.base import ContentFile


def fetch_goal_image(keyword: str) -> ContentFile | None:
    access_key = getattr(settings, 'UNSPLASH_ACCESS_KEY', None)
    if not access_key:
        return None

    try:
        res = requests.get(
            'https://api.unsplash.com/search/photos',
            params={'query': keyword, 'per_page': 1, 'orientation': 'landscape'},
            headers={'Authorization': f'Client-ID {access_key}'},
            timeout=5,
        )
        if res.status_code != 200:
            return None

        results = res.json().get('results', [])
        if not results:
            return None

        image_url = results[0]['urls']['regular']
        image_data = requests.get(image_url, timeout=10).content
        safe_name = ''.join(c for c in keyword if c.isalnum() or c == ' ').strip()[:30]
        return ContentFile(image_data, name=f'{safe_name}.jpg')
    except Exception:
        return None

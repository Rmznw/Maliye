import os
from pathlib import Path
from decouple import config, Csv
from datetime import timedelta
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY') or config('SECRET_KEY', default='django-insecure-dev-key-change-me')
DEBUG = os.environ.get('DEBUG', '').lower() not in ('false', '0', 'no') if 'DEBUG' in os.environ else config('DEBUG', default=True, cast=bool)
_allowed = os.environ.get('ALLOWED_HOSTS') or config('ALLOWED_HOSTS', default='localhost,127.0.0.1')
ALLOWED_HOSTS = [h.strip() for h in _allowed.split(',') if h.strip()]
# Accept Railway-generated domains automatically
ALLOWED_HOSTS += [h for h in [
    os.environ.get('RAILWAY_PUBLIC_DOMAIN', ''),
    os.environ.get('RAILWAY_PRIVATE_DOMAIN', ''),
] if h]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'django_celery_beat',
    'apps.users',
    'apps.expenses',
    'apps.income',
    'apps.analytics',
    'apps.goals',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# os.environ is checked first — works reliably in Docker/Railway without a .env file
_db_url = os.environ.get('DATABASE_URL') or config('DATABASE_URL', default=None)
if _db_url:
    DATABASES = {'default': dj_database_url.parse(_db_url, conn_max_age=600)}
else:
    # Railway Postgres plugin also exports individual PG* vars
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME':     os.environ.get('PGDATABASE') or config('DB_NAME',     default='talyp_finance'),
            'USER':     os.environ.get('PGUSER')     or config('DB_USER',     default='postgres'),
            'PASSWORD': os.environ.get('PGPASSWORD') or config('DB_PASSWORD', default='secret'),
            'HOST':     os.environ.get('PGHOST')     or config('DB_HOST',     default='localhost'),
            'PORT':     os.environ.get('PGPORT')     or config('DB_PORT',     default='5432'),
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Ashgabat'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Talyp Maliýe API',
    'DESCRIPTION': 'Student Finance Manager API',
    'VERSION': '1.0.0',
}

_cors = os.environ.get('CORS_ALLOWED_ORIGINS') or config('CORS_ALLOWED_ORIGINS', default='http://localhost:3000,http://localhost:5173')
CORS_ALLOWED_ORIGINS = [h.strip() for h in _cors.split(',') if h.strip()]

REDIS_URL = os.environ.get('REDIS_URL') or config('REDIS_URL', default='redis://localhost:6379/0')

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL,
        'OPTIONS': {'CLIENT_CLASS': 'django_redis.client.DefaultClient'},
    }
}

CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'
CELERY_TIMEZONE = TIME_ZONE

from celery.schedules import crontab
CELERY_BEAT_SCHEDULE = {
    'create-recurring-expenses-daily': {
        'task': 'apps.expenses.tasks.create_recurring_expenses',
        'schedule': crontab(hour=0, minute=5),  # runs at 00:05 every day
    },
}

UNSPLASH_ACCESS_KEY = config('UNSPLASH_ACCESS_KEY', default='')
GEMINI_API_KEY = config('GEMINI_API_KEY', default='')
GROQ_API_KEY   = config('GROQ_API_KEY', default='')

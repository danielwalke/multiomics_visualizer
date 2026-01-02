# Multiomics-Visualizer
Clustering and visualization of multiple omics layers

## Configuration

### Environment Variables

The backend requires the following environment variables for secure operation:

- `DJANGO_SECRET_KEY`: Secret key for Django (required for production)
- `DJANGO_DEBUG`: Set to `True` for development, `False` for production (default: `False`)
- `DJANGO_ALLOWED_HOSTS`: Comma-separated list of allowed hosts (default: `localhost,127.0.0.1`)

See `.env.example` for a template configuration file.

### Running with Docker Compose

For development, the environment variables are pre-configured in `docker-compose.yml`:

```bash
docker-compose up
```

### Production Deployment

This application is deployed at:
- Frontend: https://mdoa-tools.bi.denbi.de/multiomics/
- Backend: https://mdoa-tools.bi.denbi.de/multiomics_upload

For production deployment, ensure you:

1. Generate a unique secret key:
   ```bash
   python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
   ```

2. Set environment variables:
   ```bash
   export DJANGO_SECRET_KEY="your-generated-secret-key"
   export DJANGO_DEBUG=False
   export DJANGO_ALLOWED_HOSTS="mdoa-tools.bi.denbi.de,multiomics-visualizer.isas.de"
   ```

3. Never commit `.env` files containing secrets to version control.


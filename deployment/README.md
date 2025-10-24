# Deployment Notes

Use the provided `docker-compose.yml` for local development. For production, build the backend and frontend images separately and deploy them alongside managed PostgreSQL and Redis instances. Ensure HTTPS termination is handled by your ingress layer.

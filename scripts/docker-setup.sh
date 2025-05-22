#!/bin/zsh

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${YELLOW}Creating and switching to docker-support branch...${NC}"
git checkout -b docker-support

echo "${YELLOW}Adding Docker-related files...${NC}"
git add \
    docker-compose.yml \
    frontend/Dockerfile \
    frontend/.dockerignore \
    frontend/nginx.conf \
    backend/Dockerfile \
    backend/.dockerignore \
    README.md

echo "${YELLOW}Committing changes...${NC}"
git commit -m "feat: add Docker support

- Add Dockerfiles for frontend and backend
- Add docker-compose.yml for orchestration
- Configure nginx for frontend
- Update README with Docker instructions
- Add .dockerignore files"

echo "${YELLOW}Pushing to remote...${NC}"
git push origin docker-support

echo "${GREEN}Done! Now create a pull request on GitHub and add '/review' in the comments${NC}"

#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEPLOY_CONFIG="$SCRIPT_DIR/deploy-config.json"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

load_config() {
    if [ ! -f "$DEPLOY_CONFIG" ]; then
        log_error "Deployment config not found: $DEPLOY_CONFIG"
        exit 1
    fi
    
    GITHUB_REPO=$(jq -r '.github.repo' "$DEPLOY_CONFIG")
    RELEASE_DRAFT=$(jq -r '.github.draft' "$DEPLOY_CONFIG")
    RELEASE_PRERELEASE=$(jq -r '.github.prerelease' "$DEPLOY_CONFIG")
    
    CDN_ENDPOINT=$(jq -r '.cdn.endpoint' "$DEPLOY_CONFIG")
    CDN_BUCKET=$(jq -r '.cdn.bucket' "$DEPLOY_CONFIG")
    
    DOCKER_REGISTRY=$(jq -r '.docker.registry' "$DEPLOY_CONFIG")
    DOCKER_NAMESPACE=$(jq -r '.docker.namespace' "$DEPLOY_CONFIG")
}

get_version() {
    if git describe --tags --exact-match HEAD 2>/dev/null; then
        VERSION=$(git describe --tags --exact-match HEAD)
    else
        VERSION="v$(date +%Y.%m.%d)-$(git rev-parse --short HEAD)"
        log_warning "No tag found, using generated version: $VERSION"
    fi
    echo "$VERSION"
}

deploy_github_release() {
    log_info "Deploying to GitHub Releases..."
    
    VERSION=$(get_version)
    
    if gh release view "$VERSION" >/dev/null 2>&1; then
        log_warning "Release $VERSION already exists, updating..."
        gh release delete "$VERSION" --yes
    fi
    
    RELEASE_NOTES=$(cat << EOF
## Better GIMP $VERSION

### 🚀 What's New
- High-performance C++ image processing core
- Modern React-based Electron frontend
- FastAPI Python backend with REST API
- Cross-platform support (Linux, macOS, Windows)

### 📦 Downloads
Choose the appropriate package for your platform:

**Linux:**
- \`bettergimp-linux-x64.tar.gz\` - 64-bit Linux

**macOS:**
- \`bettergimp-macos-x64.tar.gz\` - Intel Macs
- \`bettergimp-macos-arm64.tar.gz\` - Apple Silicon Macs

**Windows:**
- \`bettergimp-windows-x64.zip\` - 64-bit Windows

### 🛠️ Installation
1. Download the appropriate package for your platform
2. Extract the archive to a directory of your choice
3. Run the included startup script:
   - Linux/macOS: \`./bettergimp.sh\`
   - Windows: \`bettergimp.bat\`

### 📋 System Requirements
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 500MB for installation
- **OS:** 
  - Linux: Ubuntu 20.04+ or equivalent
  - macOS: 10.15+ (Intel) or 11.0+ (Apple Silicon)
  - Windows: Windows 10/11 64-bit

### 🐛 Known Issues
- First startup may take longer due to dependency initialization
- Some advanced filters require additional GPU drivers

### 🤝 Contributing
Visit our [GitHub repository]($GITHUB_REPO) to contribute or report issues.

---
*Built with ❤️ by the Better GIMP team*
EOF
)
    
    gh release create "$VERSION" \
        --title "Better GIMP $VERSION" \
        --notes "$RELEASE_NOTES" \
        --draft="$RELEASE_DRAFT" \
        --prerelease="$RELEASE_PRERELEASE" \
        dist/*.tar.gz dist/*.zip
    
    log_success "GitHub release created: $VERSION"
}

deploy_cdn() {
    log_info "Deploying to CDN..."
    
    VERSION=$(get_version)
    
    if command -v aws >/dev/null 2>&1; then
        aws s3 sync dist/ "s3://$CDN_BUCKET/releases/$VERSION/" \
            --exclude "*.git*" \
            --cache-control "max-age=31536000"
        
        aws s3 cp "s3://$CDN_BUCKET/releases/$VERSION/" "s3://$CDN_BUCKET/releases/latest/" \
            --recursive
        
        log_success "Uploaded to CDN: $CDN_ENDPOINT/releases/$VERSION/"
    else
        log_warning "AWS CLI not found, skipping CDN deployment"
    fi
}

deploy_docker() {
    log_info "Deploying Docker images..."
    
    VERSION=$(get_version)
    IMAGE_BASE="$DOCKER_REGISTRY/$DOCKER_NAMESPACE/bettergimp"
    
    docker buildx create --use --name bettergimp-builder 2>/dev/null || true
    
    docker buildx build \
        --platform linux/amd64,linux/arm64 \
        --file .docker/Dockerfile.build-env \
        --target runtime \
        --tag "$IMAGE_BASE:$VERSION" \
        --tag "$IMAGE_BASE:latest" \
        --push \
        .
    
    docker buildx build \
        --platform linux/amd64,linux/arm64 \
        --file .docker/Dockerfile.build-env \
        --target dev-env \
        --tag "$IMAGE_BASE:$VERSION-dev" \
        --tag "$IMAGE_BASE:dev" \
        --push \
        .
    
    log_success "Docker images deployed: $IMAGE_BASE:$VERSION"
}

deploy_docs() {
    log_info "Deploying documentation..."
    
    if [ ! -d "docs/build" ]; then
        log_info "Building documentation..."
        cd docs
        npm install
        npm run build
        cd ..
    fi
    
    if [ -d "docs/build" ]; then
        gh-pages -d docs/build -m "docs: update documentation for $(get_version)"
        log_success "Documentation deployed to GitHub Pages"
    else
        log_warning "Documentation build not found, skipping docs deployment"
    fi
}

update_package_managers() {
    log_info "Updating package managers..."
    
    VERSION=$(get_version)
    
    if [ -f "packaging/homebrew/bettergimp.rb" ]; then
        log_info "Updating Homebrew formula..."
        sed -i "s/version \".*\"/version \"${VERSION#v}\"/" packaging/homebrew/bettergimp.rb
        
        if [ -f "dist/bettergimp-macos-x64.tar.gz" ]; then
            SHA256=$(shasum -a 256 "dist/bettergimp-macos-x64.tar.gz" | cut -d' ' -f1)
            sed -i "s/sha256 \".*\"/sha256 \"$SHA256\"/" packaging/homebrew/bettergimp.rb
        fi
    fi
    
    if [ -f "packaging/arch/PKGBUILD" ]; then
        log_info "Updating AUR package..."
        sed -i "s/pkgver=.*/pkgver=${VERSION#v}/" packaging/arch/PKGBUILD
        
        if [ -f "dist/bettergimp-linux-x64.tar.gz" ]; then
            SHA256=$(sha256sum "dist/bettergimp-linux-x64.tar.gz" | cut -d' ' -f1)
            sed -i "s/sha256sums=.*/sha256sums=('$SHA256')/" packaging/arch/PKGBUILD
        fi
    fi
    
    if [ -f "packaging/snap/snapcraft.yaml" ]; then
        log_info "Updating Snap package..."
        sed -i "s/version: .*/version: '${VERSION#v}'/" packaging/snap/snapcraft.yaml
    fi
    
    log_success "Package managers updated"
}

send_notifications() {
    log_info "Sending deployment notifications..."
    
    VERSION=$(get_version)
    
    if [ -n "${DISCORD_WEBHOOK_URL:-}" ]; then
        curl -X POST "$DISCORD_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"embeds\": [{
                    \"title\": \"🚀 Better GIMP $VERSION Released!\",
                    \"description\": \"New version has been deployed across all platforms.\",
                    \"color\": 3066993,
                    \"fields\": [
                        {\"name\": \"Version\", \"value\": \"$VERSION\", \"inline\": true},
                        {\"name\": \"Platforms\", \"value\": \"Linux, macOS, Windows\", \"inline\": true},
                        {\"name\": \"Download\", \"value\": \"[GitHub Releases]($GITHUB_REPO/releases/tag/$VERSION)\", \"inline\": false}
                    ],
                    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
                }]
            }"
    fi
    
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"✅ Better GIMP $VERSION deployed successfully!\",
                \"attachments\": [{
                    \"color\": \"good\",
                    \"fields\": [
                        {\"title\": \"Version\", \"value\": \"$VERSION\", \"short\": true},
                        {\"title\": \"Download\", \"value\": \"<$GITHUB_REPO/releases/tag/$VERSION|GitHub Releases>\", \"short\": true}
                    ]
                }]
            }"
    fi
    
    if [ -n "${TWITTER_API_KEY:-}" ] && [ -n "${TWITTER_API_SECRET:-}" ]; then
        log_info "Posting to Twitter/X..."
    fi
    
    log_success "Notifications sent"
}

main() {
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}   Better GIMP Deployment Script${NC}"
    echo -e "${BLUE}======================================${NC}"
    
    if ! command -v jq >/dev/null 2>&1; then
        log_error "jq is required but not installed"
        exit 1
    fi
    
    if ! command -v gh >/dev/null 2>&1; then
        log_error "GitHub CLI (gh) is required but not installed"
        exit 1
    fi
    
    load_config
    
    cd "$PROJECT_ROOT"
    
    case "${1:-all}" in
        github)
            deploy_github_release
            ;;
        cdn)
            deploy_cdn
            ;;
        docker)
            deploy_docker
            ;;
        docs)
            deploy_docs
            ;;
        packages)
            update_package_managers
            ;;
        notify)
            send_notifications
            ;;
        all|*)
            deploy_github_release
            deploy_cdn
            deploy_docker
            deploy_docs
            update_package_managers
            send_notifications
            ;;
    esac
    
    log_success "Deployment completed successfully!"
}

main "$@"

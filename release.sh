#!/bin/bash

# Script pour créer une release BetterPS
# Usage: ./release.sh [version] [message]
# Example: ./release.sh v1.0.0 "Major release with new features"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "This is not a git repository!"
    exit 1
fi

# Check if working directory is clean
if ! git diff-index --quiet HEAD --; then
    print_error "Working directory is not clean. Please commit your changes first."
    exit 1
fi

# Get version and message
VERSION=${1}
MESSAGE=${2:-"Release $VERSION"}

if [ -z "$VERSION" ]; then
    # Read current version from VERSION file
    if [ -f "VERSION" ]; then
        CURRENT_VERSION=$(cat VERSION)
        print_status "Current version: $CURRENT_VERSION"
    else
        CURRENT_VERSION="0.0.0"
    fi
    
    echo "Enter new version (current: $CURRENT_VERSION):"
    read -r VERSION
    
    if [ -z "$VERSION" ]; then
        print_error "Version cannot be empty!"
        exit 1
    fi
fi

# Ensure version starts with 'v'
if [[ ! $VERSION == v* ]]; then
    VERSION="v$VERSION"
fi

print_status "Creating release: $VERSION"
print_status "Message: $MESSAGE"

# Update VERSION file
echo "${VERSION#v}" > VERSION
print_success "Updated VERSION file"

# Update package.json version
if [ -f "ui/package.json" ]; then
    cd ui
    npm version "${VERSION#v}" --no-git-tag-version
    cd ..
    print_success "Updated package.json version"
fi

# Run tests before release
print_status "Running tests..."

# Build and test C++ core
print_status "Testing C++ core..."
cd core
if [ ! -d "build" ]; then
    mkdir build
fi
cd build
cmake ..
make -j$(nproc)
if ./bettergimp_tests; then
    print_success "C++ tests passed"
else
    print_error "C++ tests failed"
    exit 1
fi
cd ../..

# Test UI build
print_status "Testing UI build..."
cd ui
if bun install && bun run build; then
    print_success "UI build successful"
else
    print_error "UI build failed"
    exit 1
fi
cd ..

# Commit version changes
git add VERSION ui/package.json CHANGELOG.md
git commit -m "chore: bump version to $VERSION

$MESSAGE"

# Create and push tag
git tag -a "$VERSION" -m "$MESSAGE"

print_success "Created tag: $VERSION"

# Ask for confirmation before pushing
echo
print_warning "This will push the tag to origin and trigger the release workflow."
echo "Do you want to continue? (y/N)"
read -r CONFIRM

if [[ $CONFIRM == [yY] || $CONFIRM == [yY][eE][sS] ]]; then
    git push origin main
    git push origin "$VERSION"
    
    print_success "🚀 Release $VERSION has been created!"
    print_status "GitHub Actions will now build and create the release automatically."
    print_status "Visit https://github.com/sertr4linee/symmetrical-octo-spork/releases to see the release."
else
    print_warning "Release creation cancelled. You can push manually later with:"
    print_status "git push origin main"
    print_status "git push origin $VERSION"
fi
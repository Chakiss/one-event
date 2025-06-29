#!/bin/bash

# OneEvent - Installation Guide for macOS
# สคริปต์นี้จะติดตั้งเครื่องมือที่จำเป็นสำหรับ auto-deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo -e "${BLUE}🚀 OneEvent - macOS Setup Guide${NC}"
echo "=================================="

# Check if Homebrew is installed
check_homebrew() {
    if ! command -v brew &> /dev/null; then
        print_warning "Homebrew not found. Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        print_status "Homebrew installed"
    else
        print_status "Homebrew already installed"
    fi
}

# Install Google Cloud CLI
install_gcloud() {
    print_info "Installing Google Cloud CLI..."
    
    if command -v gcloud &> /dev/null; then
        print_status "Google Cloud CLI already installed"
        gcloud version
    else
        # Download and install gcloud
        curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-458.0.1-darwin-x86_64.tar.gz
        tar -xf google-cloud-cli-458.0.1-darwin-x86_64.tar.gz
        ./google-cloud-sdk/install.sh --quiet
        
        # Add to PATH
        echo 'export PATH="$HOME/google-cloud-sdk/bin:$PATH"' >> ~/.zshrc
        export PATH="$HOME/google-cloud-sdk/bin:$PATH"
        
        # Clean up
        rm google-cloud-cli-458.0.1-darwin-x86_64.tar.gz
        
        print_status "Google Cloud CLI installed"
    fi
}

# Install GitHub CLI
install_github_cli() {
    print_info "Installing GitHub CLI..."
    
    if command -v gh &> /dev/null; then
        print_status "GitHub CLI already installed"
        gh --version
    else
        brew install gh
        print_status "GitHub CLI installed"
    fi
}

# Install Docker
install_docker() {
    print_info "Checking Docker installation..."
    
    if command -v docker &> /dev/null; then
        print_status "Docker already installed"
        docker --version
    else
        print_warning "Docker not found. Please install Docker Desktop from:"
        print_info "https://www.docker.com/products/docker-desktop/"
        print_info "After installation, restart this script."
        exit 1
    fi
}

# Install Node.js
install_nodejs() {
    print_info "Checking Node.js installation..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js already installed: $NODE_VERSION"
        
        # Check if version is 18 or higher
        if [[ "$NODE_VERSION" < "v18" ]]; then
            print_warning "Node.js version should be 18 or higher. Please update."
        fi
    else
        print_info "Installing Node.js via Homebrew..."
        brew install node@18
        print_status "Node.js installed"
    fi
}

# Main installation
main() {
    echo -e "\n${YELLOW}This script will install the following tools:${NC}"
    echo "• Google Cloud CLI (gcloud)"
    echo "• GitHub CLI (gh)"
    echo "• Docker (check only)"
    echo "• Node.js (check only)"
    echo ""
    
    read -p "Continue with installation? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Installation cancelled"
        exit 1
    fi
    
    check_homebrew
    install_gcloud
    install_github_cli
    install_docker
    install_nodejs
    
    echo -e "\n${GREEN}🎉 Installation Complete!${NC}"
    echo "=================================="
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Restart your terminal or run: source ~/.zshrc"
    echo "2. Run: gcloud auth login"
    echo "3. Run: gh auth login"
    echo "4. Run: ./scripts/setup-gcp-auto-deploy.sh"
    echo ""
    print_info "After restart, verify installations with:"
    echo "• gcloud --version"
    echo "• gh --version"
    echo "• docker --version"
    echo "• node --version"
}

main "$@"

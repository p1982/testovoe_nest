#!/usr/bin/env sh

# Install Husky hooks
echo "🔧 Installing Husky hooks..."

# Make all hook files executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/prepare-commit-msg
chmod +x .husky/post-merge
chmod +x .husky/_/husky.sh

echo "✅ Husky hooks installed successfully!"
echo ""
echo "Available hooks:"
echo "  • pre-commit: Runs linting, formatting, and tests"
echo "  • commit-msg: Validates commit message format"
echo "  • prepare-commit-msg: Adds branch info to commits"
echo "  • post-merge: Runs cleanup after merges"
echo ""
echo "To skip hooks temporarily, use:"
echo "  HUSKY=0 git commit -m 'your message'" 
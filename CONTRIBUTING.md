# Contributing to OctoEdit

We love your input! We want to make contributing to OctoEdit as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Development Process

We use GitHub to host code, track issues and feature requests, and accept pull requests.

### 1. Pull Request Process

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue the pull request!

### 2. Code Review Process

All submissions require review. We use GitHub pull requests for this purpose. Consult [GitHub Help](https://help.github.com/articles/about-pull-requests/) for more information on using pull requests.

## 🐛 Bug Reports

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

### Bug Report Template
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Desktop (please complete the following information):**
 - OS: [e.g. iOS]
 - Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

## 💡 Feature Requests

We welcome feature requests! Please use the feature request template and provide:

- **Use case**: Describe the problem you're trying to solve
- **Proposed solution**: Describe the feature you'd like to see
- **Alternatives**: Describe any alternative solutions you've considered
- **Additional context**: Add any other context about the feature request

## 🔧 Development Setup

### Prerequisites

- **C++17** compatible compiler (GCC 9+, Clang 10+, MSVC 2019+)
- **Python 3.9+**
- **Node.js 16+** and npm
- **CMake 3.20+**
- **Git**

### Quick Start

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/symmetrical-octo-spork.git
cd symmetrical-octo-spork

# Build C++ core
mkdir build && cd build
cmake ..
make -j$(nproc)

# Setup Python environment
cd ../python
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup UI development
cd ../ui
npm install
npm run dev
```

## 📝 Coding Standards

### C++ Code Style

- Follow [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)
- Use `clang-format` with provided configuration
- Prefer modern C++17 features
- Use RAII for resource management
- Include comprehensive unit tests

Example:
```cpp
namespace OctoEdit::Core {
    class ImageProcessor {
    public:
        // Use descriptive names
        std::unique_ptr<ImageData> processImage(
            const ImageData& input,
            const ProcessingParams& params
        );
        
    private:
        // Use const when possible
        void validateParams(const ProcessingParams& params) const;
    };
}
```

### Python Code Style

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/)
- Use `black` for code formatting
- Use `mypy` for type checking
- Include docstrings for all public functions
- Write unit tests using `pytest`

Example:
```python
from typing import Optional, List
import octoedit

def process_batch(
    file_paths: List[str], 
    output_dir: str,
    quality: Optional[int] = None
) -> None:
    """Process a batch of images.
    
    Args:
        file_paths: List of input image file paths
        output_dir: Directory to save processed images
        quality: Optional quality setting (1-100)
    """
    for path in file_paths:
        # Implementation here
        pass
```

### TypeScript/JavaScript Code Style

- Follow project ESLint configuration
- Use TypeScript for all new code
- Prefer functional components with hooks
- Use meaningful component and variable names
- Include JSDoc comments for complex functions

Example:
```typescript
interface ImageCanvasProps {
  imageData: ImageData;
  onImageChange: (newData: ImageData) => void;
  zoom: number;
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({
  imageData,
  onImageChange,
  zoom
}) => {
  // Component implementation
  return <canvas />;
};
```

## 🧪 Testing Guidelines

### Unit Tests
- Write tests for all new functionality
- Aim for >90% code coverage
- Use descriptive test names
- Include edge cases and error conditions

### Integration Tests
- Test component interactions
- Verify cross-language communication
- Test file format compatibility
- Performance regression tests

### Test Organization
```
tests/
├── unit/
│   ├── core/         # C++ unit tests
│   ├── python/       # Python unit tests
│   └── ui/          # React component tests
├── integration/     # Cross-component tests
└── performance/     # Performance benchmarks
```

## 📚 Documentation

### Code Documentation
- **C++**: Use Doxygen-style comments
- **Python**: Use Google-style docstrings
- **TypeScript**: Use JSDoc comments

### User Documentation
- Update user manual for UI changes
- Include screenshots for new features
- Write clear, step-by-step instructions
- Consider multiple skill levels

### Developer Documentation
- Update API documentation for changes
- Include architectural decisions
- Provide examples and tutorials
- Keep README files current

## 🔄 Git Workflow

### Branch Naming
- `feature/short-description` for new features
- `fix/short-description` for bug fixes
- `docs/short-description` for documentation updates
- `refactor/short-description` for code refactoring

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description

Longer description if needed

- List any breaking changes
- Reference issues: Fixes #123, Closes #456
```

Examples:
- `feat(core): add gaussian blur filter`
- `fix(ui): resolve layer panel scrolling issue`
- `docs(api): update Python plugin documentation`

### Pull Request Guidelines

1. **Clear title**: Summarize the change in 50 characters or less
2. **Detailed description**: Explain what and why
3. **Link issues**: Reference related issues
4. **Test coverage**: Ensure adequate testing
5. **Documentation**: Update relevant docs
6. **Screenshots**: Include for UI changes

## 🏆 Recognition

### Contributors
We recognize all types of contributions:
- Code contributions
- Documentation improvements
- Bug reports and testing
- Feature suggestions
- Community support
- Design and UX feedback

### Hall of Fame
Outstanding contributors will be featured in:
- Project README
- Release notes
- Community showcases
- Annual contributor awards

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community chat
- **Discord**: Real-time development discussion (link in README)
- **Email**: maintainers@octoedit.org for sensitive issues

### Mentorship
New contributors can request mentorship:
- Pair programming sessions
- Code review guidance
- Architecture explanations
- Best practices training

## 📄 License

By contributing, you agree that your contributions will be licensed under the GPL-3.0 License that covers the project. Feel free to contact the maintainers if that's a concern.

## 🎉 Welcome Aboard!

Thank you for your interest in contributing to OctoEdit! Every contribution, no matter how small, makes a difference. We're excited to see what you'll bring to the project.

Happy coding! 🚀
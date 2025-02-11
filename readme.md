# Node Repo Runner

1. A script to clone and install dependencies for submissions from a folder of HTML files with a meta refresh or anchor tag to a GitHub repository (which is how Canvas downloads link submissions).
2. A script to easily run the projects in the cloned repositories.

# Setup

Clone the repository

```bash



git clone <repository-url>
```

Install dependencies

```bash
npm install
```

Download submissions (website urls of GitHub repos) from Canvas and extract them.  

# Repository Cloning & Dependency Installation

Run the script

```bash
node process_repos.js <submissions-folder-path>
```

This will process all the submissions in the specified submissions folder and clone the repositories, install the dependencies, and run the tests. 

Outputs will be placed in a new cloned_repos folder in the submissions directory.

If no path is provided, it will use the current directory.

Any errors will be logged to the console.

# Example

```bash
node process_repos.js C:\Users\username\Downloads\submissions
```
# Running Projects

```bash
node run_projects.js C:\Users\username\Downloads\submissions
```

Terminal controls:

- [Enter] - Start/Stop the current project
- n - Skip to next project
- p - Go to previous project
- q - Quit

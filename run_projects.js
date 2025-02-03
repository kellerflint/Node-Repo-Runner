import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import chalk from 'chalk';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function runProjects(baseDir) {
    try {
        const reposDir = path.join(baseDir, 'cloned_repos');
        const projects = await fs.readdir(reposDir);
        let currentProcess = null;

        console.log(chalk.blue('\nAvailable projects:'));
        projects.forEach((proj, i) => console.log(chalk.blue(`${i + 1}. ${proj}`)));

        for (let i = 0; i < projects.length;) {
            const projectDir = path.join(reposDir, projects[i]);
            
            console.log(chalk.yellow('\n----------------------------------------'));
            console.log(chalk.green(`\nCurrent project (${i + 1}/${projects.length}): ${projects[i]}`));
            console.log(chalk.blue('\nCommands:'));
            console.log(chalk.blue('  [Enter] - Start/Stop project'));
            console.log(chalk.blue('  n - Skip to next project'));
            console.log(chalk.blue('  p - Go to previous project'));
            console.log(chalk.blue('  q - Quit'));
            
            const answer = await new Promise(resolve => rl.question(chalk.yellow('\nEnter command: '), resolve));

            switch(answer.toLowerCase()) {
                case '':
                    if (currentProcess) {
                        // Stop current process
                        currentProcess.kill();
                        currentProcess = null;
                        console.log(chalk.red('\nStopped project'));
                    } else {
                        // Start new process
                        try {
                            console.log(chalk.green('\nStarting project...'));
                            currentProcess = spawn('node', ['app.js'], {
                                cwd: projectDir,
                                stdio: 'inherit'
                            });

                            currentProcess.on('error', (err) => {
                                console.log(chalk.red(`\nError starting project: ${err.message}`));
                                currentProcess = null;
                            });
                        } catch (err) {
                            console.log(chalk.red(`\nError: ${err.message}`));
                        }
                    }
                    break;
                
                case 'n':
                    if (currentProcess) {
                        currentProcess.kill();
                        currentProcess = null;
                    }
                    i++;
                    break;
                
                case 'p':
                    if (currentProcess) {
                        currentProcess.kill();
                        currentProcess = null;
                    }
                    i = Math.max(0, i - 1);
                    break;
                
                case 'q':
                    if (currentProcess) {
                        currentProcess.kill();
                    }
                    rl.close();
                    return;
                
                default:
                    console.log(chalk.red('\nInvalid command'));
            }

            if (i >= projects.length) {
                console.log(chalk.green('\nReached end of projects!'));
                rl.close();
                return;
            }
        }
    } catch (error) {
        console.error(chalk.red('Error:', error.message));
        rl.close();
    }
}

// Get directory path from command line argument or use current directory
const directoryPath = process.argv[2] || '.';
runProjects(directoryPath);

// For example: node run_projects.js C:\Users\kflin\Downloads\submissions 
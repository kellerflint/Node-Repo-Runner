import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as cheerio from 'cheerio';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function processRepositories(directoryPath) {
    try {
        // Read all HTML files in the directory
        const files = await fs.readdir(directoryPath);
        const htmlFiles = files.filter(file => file.endsWith('.html'));

        for (const htmlFile of htmlFiles) {
            const filePath = path.join(directoryPath, htmlFile);
            const content = await fs.readFile(filePath, 'utf8');
            
            // Parse HTML using cheerio
            const $ = cheerio.load(content);
            
            // Extract GitHub URL from meta refresh or anchor tag
            let githubUrl = '';
            const metaRefresh = $('meta[http-equiv="Refresh"]').attr('content');
            
            if (metaRefresh) {
                const urlMatch = metaRefresh.match(/url=(.*)/i);
                if (urlMatch) githubUrl = urlMatch[1];
            } else {
                githubUrl = $('a').attr('href');
            }

            if (!githubUrl || !githubUrl.includes('github.com')) {
                console.log(chalk.red(`No valid GitHub URL found in ${htmlFile}`));
                continue;
            }

            // Use HTML filename (without .html extension) as folder name
            const folderName = htmlFile.replace('.html', '');
            const folderPath = path.join(directoryPath, 'cloned_repos', folderName);

            try {
                // Create cloned_repos directory if it doesn't exist
                await fs.mkdir(path.join(directoryPath, 'cloned_repos'), { recursive: true });

                // Clone the repository
                console.log(chalk.blue(`Cloning ${githubUrl} into ${folderPath}`));
                await execAsync(`git clone ${githubUrl} "${folderPath}"`);
                console.log(chalk.green(`Successfully cloned ${folderName}`));

                // Check if package.json exists before running npm install
                const hasPackageJson = await fs.access(path.join(folderPath, 'package.json'))
                    .then(() => true)
                    .catch(() => false);

                if (hasPackageJson) {
                    // Run npm install
                    console.log(chalk.blue(`Running npm install in ${folderPath}`));
                    await execAsync('npm install', { cwd: folderPath });
                    console.log(chalk.green(`Successfully installed dependencies for ${folderName}`));
                } else {
                    console.log(chalk.red(`No package.json found in ${folderName}, skipping npm install`));
                }
            } catch (error) {
                console.error(chalk.red(`Error processing ${folderName}:`, error.message));
            }
        }
        console.log(chalk.green('\nAll repositories processed successfully!'));
    } catch (error) {
        console.error(chalk.red('Error:', error.message));
    }
}

// Get directory path from command line argument or use current directory
const directoryPath = process.argv[2] || '.';
processRepositories(directoryPath); 

// For example node process_repos.js C:\Users\kflin\Downloads\submissions
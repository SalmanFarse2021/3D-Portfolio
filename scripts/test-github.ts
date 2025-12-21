
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { fetchGitHubData } from '../src/lib/github';

async function testFetch() {
    try {
        console.log('Fetching GitHub Data...');
        const data = await fetchGitHubData();
        if (data) {
            console.log('Profile:', data.profile.login);
            console.log('Public Repos:', data.profile.public_repos);
            console.log('Fetched Repos Count:', data.repositories.length);
            if (data.repositories.length > 0) {
                console.log('First Repo:', data.repositories[0].name);
                console.log('First Repo Stars:', data.repositories[0].stargazers_count);
            }
        } else {
            console.log('Failed to fetch data.');
        }
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testFetch();

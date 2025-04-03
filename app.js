// Import the required modules
const express = require('express');
const axios = require('axios');

// Create an Express app
const app = express();

// Set the port number
const port = 3001;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define a route for the GitHub stats API
app.get('/api/github-stats', async (req, res) => {
  try {
    // Get the username and token from the query parameters
    const username = req.query.username || 'your username'; // default to your username
    const token = req.query.token || '';

    // Check if the username and token are provided
    if (!username ||!token) {
      console.error('Error: Username and token are required');
      return res.status(400).send({ error: 'Username and token are required' });
    }

    // Log a message to indicate that we are getting GitHub stats
    console.log('Getting GitHub stats...');

    // Use Axios to make a GET request to the GitHub API
    const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Check if the response was successful (200 OK)
    if (response.status!== 200) {
      console.error(`Error: Failed to fetch GitHub data (status code ${response.status})`);
      return res.status(500).send({ error: 'Failed to fetch GitHub data' });
    }

    // Log a message to indicate that we got a successful response
    console.log('Got GitHub stats response...');

    // Extract the repository data from the response
    const repos = response.data;
    const stats = {};

    // Loop through each repository and extract its data
    repos.forEach((repo) => {
      const repoName = repo.name;
      const repoUrl = repo.html_url;
      const repoDescription = repo.description;
      const repoLanguage = repo.language;
      const repoSize = repo.size;
      const repoForks = repo.forks;
      const repoWatchers = repo.watchers;

      // Create an object to store the repository stats
      stats[repoName] = {
        url: repoUrl,
        description: repoDescription,
        language: repoLanguage,
        size: repoSize,
        forks: repoForks,
        watchers: repoWatchers,
      };
    });

    // Log a message to indicate that we are sending the GitHub stats response
    console.log('Sending GitHub stats response...');

    // Send the GitHub stats response
    res.send(stats);
  } catch (error) {
    // Log an error message if there was an error
    console.error('Error getting GitHub stats:', error);
    res.status(500).send({ error: 'Failed to fetch GitHub data' });
  }
});

// Define a route for the GitHub commits API
app.get('/api/github-commits', async (req, res) => {
  try {
    // Get the username, repository name, and token from the query parameters
    const username = req.query.username || 'your username'; // default to your username
    const repoName = req.query.repoName || ''; // default to your repository name
    const token = req.query.token || ''; // default to your token

    // Check if the username, repository name, and token are provided
    if (!username ||!repoName ||!token) {
      console.error('Error: Username, repoName, and token are required');
      return res.status(400).send({ error: 'Username, repoName, and token are required' });
    }

    // Log a message to indicate that we are getting GitHub commits
    console.log('Getting GitHub commits...');

    // Use Axios to make a GET request to the GitHub API
    const response = await axios.get(`https://api.github.com/repos/${username}/${repoName}/commits`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Check if the response was successful (200 OK)
    if (response.status!== 200) {
      console.error(`Error: Failed to fetch GitHub commits (status code ${response.status})`);
      return res.status(500).send({ error: 'Failed to fetch GitHub commits' });
    }

    // Log a message to indicate that we got a successful response
    console.log('Got GitHub commits response...');

    // Extract the commit data from the response
    const commits = response.data;
    const commitStats = {};

    // Loop through each commit and extract its data
    commits.forEach((commit) => {
      const commitDate = new Date(commit.commit.author.date);
      const commitMessage = commit.commit.message;

      // Create an object to store the commit stats
      if (!commitStats[commitDate.getFullYear()]) {
        commitStats[commitDate.getFullYear()] = {};
      }

      if (!commitStats[commitDate.getFullYear()][commitDate.getMonth()]) {
        commitStats[commitDate.getFullYear()][commitDate.getMonth()] = 0;
      }

      commitStats[commitDate.getFullYear()][commitDate.getMonth()]++;
    });

    // Log a message to indicate that we are sending the GitHub commits response
    console.log('Sending GitHub commits response...');

    // Send the GitHub commits response
    res.send(commitStats);
  } catch (error) {
    // Log an error message if there was an error
    console.error('Error getting GitHub commits:', error);
    res.status(500).send({ error: 'Failed to fetch GitHub commits' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

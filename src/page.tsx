"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

export default function GitHubDashboard() {
  const [username, setUsername] = useState("")
  const [token, setToken] = useState("")
  const [repository, setRepository] = useState("")
  const [repositories, setRepositories] = useState<string[]>([])
  const [stats, setStats] = useState<any>(null)
  const [commits, setCommits] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getStats = async () => {
    if (!username || !token) {
      setError("Username and token are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Make a real API call to GitHub
      const response = await fetch(`https://api.github.com/users/${username}/repos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const repos = await response.json()

      // Transform the data to match our expected format
      const statsData: Record<string, any> = {}

      repos.forEach((repo: any) => {
        statsData[repo.name] = {
          url: repo.html_url,
          description: repo.description,
          language: repo.language,
          size: repo.size,
          forks: repo.forks_count,
          watchers: repo.watchers_count,
        }
      })

      setStats(statsData)
      setRepositories(Object.keys(statsData))
      setLoading(false)
    } catch (err: any) {
      setError(`Failed to fetch GitHub stats: ${err.message}`)
      setLoading(false)
    }
  }

  const getCommits = async () => {
    if (!username || !token || !repository) {
      setError("Username, token, and repository are required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Make a real API call to GitHub
      const response = await fetch(`https://api.github.com/repos/${username}/${repository}/commits`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const commitsData = await response.json()

      // Transform the data to match our expected format
      const commitStats: Record<string, Record<string, number>> = {}

      commitsData.forEach((commit: any) => {
        const date = new Date(commit.commit.author.date)
        const year = date.getFullYear().toString()
        const month = date.getMonth().toString()

        if (!commitStats[year]) {
          commitStats[year] = {}
        }

        if (!commitStats[year][month]) {
          commitStats[year][month] = 0
        }

        commitStats[year][month]++
      })

      setCommits(commitStats)
      setLoading(false)
    } catch (err: any) {
      setError(`Failed to fetch GitHub commits: ${err.message}`)
      setLoading(false)
    }
  }

  const formatMonth = (month: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months[month]
  }

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any "Bearer " prefix if the user pastes a full token
    const value = e.target.value.replace(/^Bearer\s+/i, "")
    setToken(value)
  }

  const handleRepositorySelect = (value: string) => {
    setRepository(value)
    // Reset commits when changing repositories
    setCommits(null)
  }

  const NoRepositoriesMessage = () => (
    <div className="text-center py-6 text-muted-foreground">
      <p className="mb-2">No repositories found for this user.</p>
      <p className="text-sm">Make sure the username is correct and the token has sufficient permissions.</p>
    </div>
  )

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <GitHubLogoIcon className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl">GitHub Stats Dashboard</CardTitle>
          <CardDescription>View statistics and commit history for your GitHub repositories</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 mb-6">
            <div className="grid gap-3">
              <Label htmlFor="username">GitHub Username</Label>
              <Input
                id="username"
                placeholder="Enter your GitHub username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="token">GitHub Token</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>A GitHub Personal Access Token is required to access the GitHub API.</p>
                      <p className="mt-2">
                        You can create one in your GitHub account under Settings → Developer settings → Personal access
                        tokens.
                      </p>
                      <p className="mt-2">
                        Make sure it has the 'repo' scope for private repositories or 'public_repo' for public
                        repositories.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="token"
                type="password"
                placeholder="Enter your GitHub token"
                value={token}
                onChange={handleTokenChange}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="repository">Repository</Label>
              {repositories.length > 0 ? (
                <Select value={repository} onValueChange={handleRepositorySelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a repository" />
                  </SelectTrigger>
                  <SelectContent>
                    {repositories.map((repo) => (
                      <SelectItem key={repo} value={repo}>
                        {repo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="repository"
                  placeholder="Enter repository name (or get stats first)"
                  value={repository}
                  onChange={(e) => setRepository(e.target.value)}
                />
              )}
            </div>

            <div className="flex gap-4">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 transition-colors"
                onClick={getStats}
                disabled={loading}
              >
                {loading ? "Loading..." : "Get Stats"}
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors"
                onClick={getCommits}
                disabled={loading || !repository}
              >
                {loading ? "Loading..." : "Get Commits"}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="stats" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stats">Repository Stats</TabsTrigger>
              <TabsTrigger value="commits">Commit History</TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="mt-4">
              {stats ? (
                Object.keys(stats).length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Repository</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Language</TableHead>
                          <TableHead className="text-right">Size (KB)</TableHead>
                          <TableHead className="text-right">Forks</TableHead>
                          <TableHead className="text-right">Watchers</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(stats).map(([repoName, repoData]: [string, any]) => (
                          <TableRow key={repoName}>
                            <TableCell className="font-medium">
                              <a
                                href={repoData.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {repoName}
                              </a>
                            </TableCell>
                            <TableCell>{repoData.description || "No description"}</TableCell>
                            <TableCell>{repoData.language || "N/A"}</TableCell>
                            <TableCell className="text-right">{repoData.size}</TableCell>
                            <TableCell className="text-right">{repoData.forks}</TableCell>
                            <TableCell className="text-right">{repoData.watchers}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <NoRepositoriesMessage />
                )
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No stats available. Click "Get Stats" to fetch repository data.
                </div>
              )}
            </TabsContent>

            <TabsContent value="commits" className="mt-4">
              {commits ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Commit Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(commits).map(([year, months]: [string, any]) =>
                        Object.entries(months).map(([month, count]: [string, any]) => (
                          <TableRow key={`${year}-${month}`}>
                            <TableCell>{year}</TableCell>
                            <TableCell>{formatMonth(Number.parseInt(month))}</TableCell>
                            <TableCell className="text-right">{count}</TableCell>
                          </TableRow>
                        )),
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No commit data available. Select a repository and click "Get Commits" to fetch commit history.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}


import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  Alert,
} from '@mui/material';

import {
  Instagram,
  Facebook,
  Twitter,
  TrendingUp,
  TrendingDown,
  Refresh,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

interface SocialPlatform {
  name: string;
  icon: React.ReactNode;
  followers: number;
  engagement: number;
  weeklyGrowth: number;
  color: string;
  posts: number;
  reach: number;
}

interface EngagementData {
  date: string;
  instagram: number;
  facebook: number;
  twitter: number;
  bluesky: number;
  threads: number;
  tiktok: number;
}

const SocialMediaAnalytics: React.FC = () => {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const mockPlatforms: SocialPlatform[] = [
      {
        name: 'Instagram',
        icon: <Instagram />,
        followers: 2847,
        engagement: 4.2,
        weeklyGrowth: 12.5,
        color: '#E1306C',
        posts: 45,
        reach: 18500,
      },
      {
        name: 'Facebook',
        icon: <Facebook />,
        followers: 1523,
        engagement: 3.8,
        weeklyGrowth: 8.2,
        color: '#1877F2',
        posts: 32,
        reach: 12300,
      },
      {
        name: 'Twitter/X',
        icon: <Twitter />,
        followers: 892,
        engagement: 2.1,
        weeklyGrowth: -2.3,
        color: '#1DA1F2',
        posts: 78,
        reach: 8500,
      },
      {
        name: 'TikTok',
        icon: <Box sx={{ width: 24, height: 24, backgroundColor: '#000', borderRadius: '50%' }} />,
        followers: 456,
        engagement: 6.7,
        weeklyGrowth: 25.8,
        color: '#000000',
        posts: 12,
        reach: 15600,
      },
      {
        name: 'Threads',
        icon: <Box sx={{ width: 24, height: 24, backgroundColor: '#000', borderRadius: '50%' }} />,
        followers: 234,
        engagement: 3.4,
        weeklyGrowth: 15.2,
        color: '#000000',
        posts: 23,
        reach: 4200,
      },
      {
        name: 'Bluesky',
        icon: <Box sx={{ width: 24, height: 24, backgroundColor: '#00A8E8', borderRadius: '50%' }} />,
        followers: 167,
        engagement: 5.1,
        weeklyGrowth: 18.7,
        color: '#00A8E8',
        posts: 15,
        reach: 2800,
      },
    ];

    const mockEngagementData: EngagementData[] = [
      { date: '2024-01-01', instagram: 120, facebook: 85, twitter: 45, bluesky: 25, threads: 35, tiktok: 180 },
      { date: '2024-01-02', instagram: 135, facebook: 92, twitter: 52, bluesky: 28, threads: 42, tiktok: 210 },
      { date: '2024-01-03', instagram: 142, facebook: 88, twitter: 38, bluesky: 32, threads: 38, tiktok: 195 },
      { date: '2024-01-04', instagram: 158, facebook: 105, twitter: 62, bluesky: 35, threads: 48, tiktok: 245 },
      { date: '2024-01-05', instagram: 165, facebook: 98, twitter: 55, bluesky: 40, threads: 52, tiktok: 220 },
      { date: '2024-01-06', instagram: 172, facebook: 112, twitter: 68, bluesky: 38, threads: 55, tiktok: 265 },
      { date: '2024-01-07', instagram: 148, facebook: 95, twitter: 45, bluesky: 42, threads: 45, tiktok: 230 },
    ];

    setPlatforms(mockPlatforms);
    setEngagementData(mockEngagementData);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const totalFollowers = platforms.reduce((sum, platform) => sum + platform.followers, 0);
  const avgEngagement = platforms.reduce((sum, platform) => sum + platform.engagement, 0) / platforms.length;

  const pieData = platforms.map(platform => ({
    name: platform.name,
    value: platform.followers,
    color: platform.color,
  }));

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      <Box sx={{ width: "100%" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Social Media Analytics
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={refreshData}
            disabled={loading}
          >
            Refresh Data
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ flex: "1 1 60%", minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Total Followers
            </Typography>
            <Typography variant="h3" color="primary">
              {totalFollowers.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Across all platforms
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ flex: "1 1 60%", minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Average Engagement
            </Typography>
            <Typography variant="h3" color="secondary">
              {avgEngagement.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Engagement rate
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ flex: "1 1 60%", minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Best Performer
            </Typography>
            <Box display="flex" alignItems="center" mb={1}>
              {platforms.find(p => p.engagement === Math.max(...platforms.map(p => p.engagement)))?.icon}
              <Typography variant="h6" sx={{ ml: 1 }}>
                TikTok
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Highest engagement rate
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Platform Cards */}
      {platforms.map((platform, index) => (
        <Box sx={{ flex: "1 1 300px" }} key={index}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: platform.color, mr: 2 }}>
                  {platform.icon}
                </Avatar>
                <Typography variant="h6">{platform.name}</Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="h5" color="primary">
                  {platform.followers.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Followers
                </Typography>
              </Box>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Engagement Rate</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {platform.engagement}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={platform.engagement * 10}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Weekly Growth</Typography>
                <Chip
                  icon={platform.weeklyGrowth > 0 ? <TrendingUp /> : <TrendingDown />}
                  label={`${platform.weeklyGrowth > 0 ? '+' : ''}${platform.weeklyGrowth}%`}
                  color={platform.weeklyGrowth > 0 ? 'success' : 'error'}
                  size="small"
                />
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Posts This Month</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {platform.posts}
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Reach</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {platform.reach.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ))}

      {/* Engagement Chart */}
      <Box sx={{ flex: 1, minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Weekly Engagement Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="instagram" stroke="#E1306C" strokeWidth={2} name="Instagram" />
                <Line type="monotone" dataKey="facebook" stroke="#1877F2" strokeWidth={2} name="Facebook" />
                <Line type="monotone" dataKey="twitter" stroke="#1DA1F2" strokeWidth={2} name="Twitter/X" />
                <Line type="monotone" dataKey="tiktok" stroke="#000000" strokeWidth={2} name="TikTok" />
                <Line type="monotone" dataKey="threads" stroke="#555555" strokeWidth={2} name="Threads" />
                <Line type="monotone" dataKey="bluesky" stroke="#00A8E8" strokeWidth={2} name="Bluesky" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Follower Distribution */}
      <Box sx={{ flex: 1, minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Follower Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Integration Status */}
      <Box sx={{ width: "100%" }}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Integration Status:</strong> This shows mock data. To connect real social media analytics, 
            you'll need to set up API integrations with each platform (Instagram Basic Display API, Facebook Graph API, 
            Twitter API v2, etc.) or use services like Ayrshare or Socialinsider for unified analytics.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default SocialMediaAnalytics;
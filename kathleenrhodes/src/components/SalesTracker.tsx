import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';

import { 
  TrendingUp, 
  TrendingDown, 
  Book, 
  AttachMoney,
  Refresh 
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface SalesData {
  date: string;
  amazon: number;
  barnesNoble: number;
  total: number;
}

interface BookStats {
  title: string;
  totalSales: number;
  weeklyChange: number;
  revenue: number;
  ranking: number;
}

const SalesTracker: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [bookStats, setBookStats] = useState<BookStats[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    const mockSalesData: SalesData[] = [
      { date: '2024-01-01', amazon: 25, barnesNoble: 8, total: 33 },
      { date: '2024-01-02', amazon: 32, barnesNoble: 12, total: 44 },
      { date: '2024-01-03', amazon: 28, barnesNoble: 15, total: 43 },
      { date: '2024-01-04', amazon: 45, barnesNoble: 18, total: 63 },
      { date: '2024-01-05', amazon: 38, barnesNoble: 22, total: 60 },
      { date: '2024-01-06', amazon: 52, barnesNoble: 25, total: 77 },
      { date: '2024-01-07', amazon: 41, barnesNoble: 19, total: 60 },
    ];

    const mockBookStats: BookStats[] = [
      {
        title: 'The Dark Road',
        totalSales: 1247,
        weeklyChange: 12.5,
        revenue: 8729.80,
        ranking: 15432,
      },
    ];

    setSalesData(mockSalesData);
    setBookStats(mockBookStats);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      <Box sx={{ width: "100%" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Sales Performance
          </Typography>
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
            onClick={refreshData}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </Box>
      </Box>

      {/* Book Statistics Cards */}
      {bookStats.map((book, index) => (
        <Box sx={{ flex: "1 1 300px" }} key={index}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Book sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h3">
                  {book.title}
                </Typography>
              </Box>
              
              <Box mb={2}>
                <Typography variant="h4" color="primary">
                  {book.totalSales.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Sales
                </Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Weekly Change</Typography>
                <Chip
                  icon={book.weeklyChange > 0 ? <TrendingUp /> : <TrendingDown />}
                  label={`${book.weeklyChange > 0 ? '+' : ''}${book.weeklyChange}%`}
                  color={book.weeklyChange > 0 ? 'success' : 'error'}
                  size="small"
                />
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Revenue</Typography>
                <Box display="flex" alignItems="center">
                  <AttachMoney sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2" fontWeight="bold">
                    {book.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">Amazon Ranking</Typography>
                <Typography variant="body2" fontWeight="bold">
                  #{book.ranking.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      ))}

      {/* Sales Chart */}
      <Box sx={{ flex: 1, minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Daily Sales Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="amazon" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Amazon"
                />
                <Line 
                  type="monotone" 
                  dataKey="barnesNoble" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  name="Barnes & Noble"
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Total"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Platform Comparison */}
      <Box sx={{ flex: 1, minWidth: "300px" }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Platform Performance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amazon" fill="#8b5cf6" name="Amazon" />
                <Bar dataKey="barnesNoble" fill="#f97316" name="Barnes & Noble" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Integration Status */}
      <Box sx={{ width: "100%" }}>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Integration Status:</strong> This demo shows mock data. To connect real sales data, 
            you'll need to set up API integrations with Amazon KDP and Barnes & Noble Press. 
            Consider using services like BookReport or custom scraping solutions for automated data collection.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default SalesTracker;
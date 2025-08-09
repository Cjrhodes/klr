import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Today as TodayIcon
} from '@mui/icons-material';

interface ScheduledPost {
  id: string;
  title: string;
  platform: string;
  content: string;
  scheduledDate: string;
  status: 'scheduled' | 'posted' | 'failed';
  type: 'post' | 'story' | 'reel' | 'tweet';
}

const CalendarView: React.FC = () => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  // const [selectedDate] = useState<string>(''); // Will be used for future calendar interactions
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Mock data for demonstration
  useEffect(() => {
    const mockPosts: ScheduledPost[] = [
      {
        id: '1',
        title: 'Behind the Scenes Post',
        platform: 'Instagram',
        content: 'Writing late into the night... The Dark Road reveals its secrets.',
        scheduledDate: '2024-01-22T14:30:00',
        status: 'scheduled',
        type: 'post'
      },
      {
        id: '2',
        title: 'Book Quote Tweet',
        platform: 'Twitter',
        content: '"The road stretched endlessly into the darkness..." #TheDarkRoad',
        scheduledDate: '2024-01-23T10:00:00',
        status: 'scheduled',
        type: 'tweet'
      },
      {
        id: '3',
        title: 'Weekly Newsletter',
        platform: 'Email',
        content: 'This week in horror writing...',
        scheduledDate: '2024-01-24T09:00:00',
        status: 'scheduled',
        type: 'post'
      }
    ];
    setScheduledPosts(mockPosts);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getPostsForDate = (day: number) => {
    if (!day) return [];
    
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    
    return scheduledPosts.filter(post => 
      post.scheduledDate.split('T')[0] === dateString
    );
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleAddPost = () => {
    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return '#E4405F';
      case 'facebook':
        return '#1877F2';
      case 'twitter':
        return '#1DA1F2';
      case 'linkedin':
        return '#0077B5';
      case 'tiktok':
        return '#000000';
      case 'email':
        return '#EA4335';
      default:
        return '#6B7280';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <EventIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h5">Content Calendar</Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddPost}
              sx={{ bgcolor: '#8b5cf6' }}
            >
              Schedule Post
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Plan and schedule your marketing content across all platforms. 
            Coordinate campaigns and maintain consistent posting schedules.
          </Alert>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              icon={<EventIcon />}
              label={`${scheduledPosts.filter(p => p.status === 'scheduled').length} Scheduled`}
              color="warning"
              variant="outlined"
            />
            <Chip
              icon={<TodayIcon />}
              label={`${scheduledPosts.filter(p => p.status === 'posted').length} Posted`}
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<EventIcon />}
              label={`${scheduledPosts.length} Total Posts`}
              color="primary"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        <Box sx={{ flex: "1 1 60%", minWidth: "300px" }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
                <Button onClick={handlePreviousMonth}>&larr;</Button>
                <Typography variant="h6" sx={{ mx: 2, minWidth: 200, textAlign: 'center' }}>
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Typography>
                <Button onClick={handleNextMonth}>&rarr;</Button>
              </Box>

              {/* Calendar Header */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {weekDays.map(day => (
                  <Box key={day} sx={{ textAlign: 'center', py: 1, fontWeight: 'bold' }}>
                    {day}
                  </Box>
                ))}
              </Box>

              {/* Calendar Days */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
                {getDaysInMonth(currentMonth).map((day, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      minHeight: 80,
                      border: '1px solid #e0e0e0',
                      p: 0.5,
                      bgcolor: day ? 'transparent' : '#f5f5f5'
                    }}
                  >
                    {day && (
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {day}
                        </Typography>
                        <Box>
                          {getPostsForDate(day).map(post => (
                            <Chip
                              key={post.id}
                              label={post.platform}
                              size="small"
                              sx={{
                                bgcolor: getPlatformColor(post.platform),
                                color: 'white',
                                fontSize: '10px',
                                height: 16,
                                mb: 0.25,
                                display: 'block',
                                width: 'fit-content'
                              }}
                            />
                          ))}
                        </Box>
                      </>
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 60%", minWidth: "300px" }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Posts
              </Typography>
              
              <List>
                {scheduledPosts
                  .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                  .slice(0, 5)
                  .map(post => (
                    <ListItem key={post.id} divider>
                      <ListItemText
                        primary={post.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {post.platform} • {new Date(post.scheduledDate).toLocaleDateString()}
                            </Typography>
                            <Chip
                              label={post.status}
                              size="small"
                              sx={{
                                bgcolor: getStatusColor(post.status),
                                color: 'white',
                                mt: 0.5
                              }}
                            />
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
              </List>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Platform Analytics
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Instagram: 12 posts scheduled
                </Typography>
                <Box sx={{ bgcolor: '#E4405F', height: 4, width: '80%', borderRadius: 1, mt: 0.5 }} />
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Twitter: 8 posts scheduled
                </Typography>
                <Box sx={{ bgcolor: '#1DA1F2', height: 4, width: '60%', borderRadius: 1, mt: 0.5 }} />
              </Box>
              
              <Box mb={2}>
                <Typography variant="body2" color="textSecondary">
                  Facebook: 6 posts scheduled
                </Typography>
                <Box sx={{ bgcolor: '#1877F2', height: 4, width: '45%', borderRadius: 1, mt: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Add Post Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule New Post</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Post Title"
              fullWidth
              margin="normal"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Platform</InputLabel>
              <Select defaultValue="">
                <MenuItem value="instagram">Instagram</MenuItem>
                <MenuItem value="facebook">Facebook</MenuItem>
                <MenuItem value="twitter">Twitter</MenuItem>
                <MenuItem value="linkedin">LinkedIn</MenuItem>
                <MenuItem value="tiktok">TikTok</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Content"
              multiline
              rows={4}
              fullWidth
              margin="normal"
            />
            
            <TextField
              label="Schedule Date & Time"
              type="datetime-local"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            sx={{ bgcolor: '#8b5cf6' }}
            onClick={() => setDialogOpen(false)}
          >
            Schedule Post
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarView;
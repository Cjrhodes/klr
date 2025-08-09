import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Alert,
  Avatar,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Psychology as PsychologyIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';

interface AgentTask {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  agent: string;
  deadline?: string;
}

interface AgentMessage {
  message: string;
  tasks: AgentTask[];
  recommendations: string[];
  metrics: {
    completedToday: number;
    pendingTasks: number;
    campaignsActive: number;
  };
}

const AgentMessageBanner: React.FC = () => {
  const [agentMessage, setAgentMessage] = useState<AgentMessage | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAgentMessage = useCallback(async () => {
    setLoading(true);
    
    // Use demo data instead of API call
    setAgentMessage({
      message: "Good morning! I'm coordinating your marketing efforts for Kathleen Rhodes. We have several high-priority tasks to drive your book sales this week.",
      tasks: generateCurrentTasks(),
      recommendations: ["Configure API keys to enable full AI automation", "Review pending social media posts", "Check campaign performance metrics"],
      metrics: {
        completedToday: 5,
        pendingTasks: 8,
        campaignsActive: 2
      }
    });
    
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAgentMessage();
    // Refresh every 5 minutes
    const interval = setInterval(loadAgentMessage, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadAgentMessage]);


  const generateCurrentTasks = (): AgentTask[] => {
    return [
      {
        id: '1',
        title: 'Generate Instagram horror quote post',
        priority: 'high',
        status: 'pending',
        agent: 'Social Media Agent',
        deadline: 'Today 2:00 PM'
      },
      {
        id: '2',
        title: 'Create DALL-E book cover variation',
        priority: 'high',
        status: 'in_progress',
        agent: 'Graphic Artist Agent'
      },
      {
        id: '3',
        title: 'Analyze weekend campaign performance',
        priority: 'medium',
        status: 'pending',
        agent: 'Web/IT Agent',
        deadline: 'Today 5:00 PM'
      },
      {
        id: '4',
        title: 'Draft author interview content',
        priority: 'medium',
        status: 'completed',
        agent: 'Marketing Lead Agent'
      },
      {
        id: '5',
        title: 'Schedule TikTok video posts',
        priority: 'low',
        status: 'pending',
        agent: 'Social Media Agent',
        deadline: 'Tomorrow'
      }
    ];
  };


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon sx={{ color: '#10b981' }} />;
      case 'in_progress': return <ScheduleIcon sx={{ color: '#f59e0b' }} />;
      case 'pending': return <WarningIcon sx={{ color: '#6b7280' }} />;
      default: return <ScheduleIcon />;
    }
  };

  if (loading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#8b5cf6' }}>
              <PsychologyIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="body1">Loading agent status...</Typography>
              <LinearProgress sx={{ mt: 1 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!agentMessage) return null;

  return (
    <Card sx={{ mb: 3, border: '1px solid #8b5cf6' }}>
      <CardContent>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Avatar sx={{ bgcolor: '#8b5cf6', mt: 0.5 }}>
            <PsychologyIcon />
          </Avatar>
          
          <Box flex={1}>
            <Box display="flex" alignItems="center" justifyContent="between" mb={1}>
              <Typography variant="h6" color="primary" gutterBottom>
                Project Lead Agent
              </Typography>
              <Box display="flex" gap={1}>
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`${agentMessage.metrics.completedToday} completed today`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<ScheduleIcon />}
                  label={`${agentMessage.metrics.pendingTasks} pending`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
                <Chip
                  icon={<CampaignIcon />}
                  label={`${agentMessage.metrics.campaignsActive} campaigns active`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>

            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
              {agentMessage.message}
            </Typography>

            {/* High Priority Tasks Preview */}
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              {agentMessage.tasks
                .filter(task => task.priority === 'high' && task.status !== 'completed')
                .slice(0, 3)
                .map(task => (
                  <Chip
                    key={task.id}
                    label={task.title}
                    size="small"
                    sx={{
                      bgcolor: getPriorityColor(task.priority),
                      color: 'white'
                    }}
                  />
                ))}
            </Box>

            <Box display="flex" alignItems="center" justifyContent="between">
              <Button
                variant="outlined"
                startIcon={<TrendingUpIcon />}
                size="small"
                sx={{ mr: 1 }}
              >
                View Analytics
              </Button>
              
              <IconButton 
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 3 }}>
            {/* Detailed Task List */}
            <Typography variant="h6" gutterBottom>
              Today's Priority Tasks
            </Typography>
            
            <List dense>
              {agentMessage.tasks.slice(0, 5).map(task => (
                <ListItem key={task.id}>
                  <ListItemIcon>
                    {getStatusIcon(task.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={task.title}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {task.agent}
                        </Typography>
                        {task.deadline && (
                          <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                            • Due: {task.deadline}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <Chip
                    label={task.priority}
                    size="small"
                    sx={{
                      bgcolor: getPriorityColor(task.priority),
                      color: 'white',
                      minWidth: 60
                    }}
                  />
                </ListItem>
              ))}
            </List>

            {/* Recommendations */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Strategic Recommendations
              </Typography>
              
              {agentMessage.recommendations.map((recommendation, index) => (
                <Alert key={index} severity="info" sx={{ mb: 1 }}>
                  {recommendation}
                </Alert>
              ))}
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default AgentMessageBanner;
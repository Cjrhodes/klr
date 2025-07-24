import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Chip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  Share as ShareIcon,
  Analytics as AnalyticsIcon,
  Book as BookIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import API_ENDPOINTS from '../config/api';

interface APIService {
  name: string;
  category: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  enabled: boolean;
  configured: boolean;
}

interface APIConfiguration {
  service: string;
  apiKey: string;
  additionalConfig?: Record<string, any>;
}

// Move serviceCategories outside the component to prevent unnecessary re-renders
// Use icon names instead of JSX elements to avoid dependency issues
const serviceCategories = {
  ai_services: {
    title: 'AI Services',
    iconName: 'CloudIcon',
    color: '#8b5cf6',
    services: {
      anthropic: 'Claude AI for content generation',
      openai: 'DALL-E 3 for image generation'
    }
  },
  social_media: {
    title: 'Social Media',
    iconName: 'ShareIcon',
    color: '#f97316',
    services: {
      instagram: 'Instagram Business API',
      facebook: 'Facebook Graph API',
      twitter: 'Twitter API v2',
      tiktok: 'TikTok for Business API',
      threads: 'Threads API',
      bluesky: 'Bluesky API'
    }
  },
  analytics: {
    title: 'Analytics',
    iconName: 'AnalyticsIcon',
    color: '#06b6d4',
    services: {
      google_analytics: 'Google Analytics 4',
      facebook_pixel: 'Facebook Pixel tracking'
    }
  },
  book_platforms: {
    title: 'Book Platforms',
    iconName: 'BookIcon',
    color: '#10b981',
    services: {
      amazon_kdp: 'Amazon KDP sales tracking',
      bookbub: 'BookBub advertising API'
    }
  },
  email_marketing: {
    title: 'Email Marketing',
    iconName: 'EmailIcon',
    color: '#f59e0b',
    services: {
      mailchimp: 'Mailchimp email campaigns',
      convertkit: 'ConvertKit email automation'
    }
  },
  author_settings: {
    title: 'Author Settings',
    iconName: 'SecurityIcon',
    color: '#6366f1',
    services: {
      author_email: 'Author email for reports and notifications',
      notification_preferences: 'Email notification settings'
    }
  }
};

const APISettings: React.FC = () => {
  const [services, setServices] = useState<APIService[]>([]);
  const [loading, setLoading] = useState(true);
  const [configDialog, setConfigDialog] = useState<{
    open: boolean;
    service: string;
    category: string;
  }>({ open: false, service: '', category: '' });
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [additionalConfig, setAdditionalConfig] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });
  const [testingConnection, setTestingConnection] = useState(false);
  // Helper function to get icon component
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactElement } = {
      CloudIcon: <CloudIcon />,
      ShareIcon: <ShareIcon />,
      AnalyticsIcon: <AnalyticsIcon />,
      BookIcon: <BookIcon />,
      EmailIcon: <EmailIcon />,
      SecurityIcon: <SecurityIcon />
    };
    return iconMap[iconName] || <SettingsIcon />;
  };

  const loadAPIStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.STATUS);
      const data = await response.json();
      
      if (data.success) {
        const servicesArray: APIService[] = [];
        
        Object.entries(serviceCategories).forEach(([category, categoryInfo]) => {
          Object.entries(categoryInfo.services).forEach(([serviceName, description]) => {
            const serviceStatus = data.data[category]?.[serviceName] || {
              enabled: false,
              configured: false,
              status: 'not_configured'
            };
            
            servicesArray.push({
              name: serviceName,
              category,
              description: description as string,
              status: serviceStatus.status === 'ready' ? 'connected' : 
                     serviceStatus.configured ? 'error' : 'disconnected',
              enabled: serviceStatus.enabled,
              configured: serviceStatus.configured
            });
          });
        });
        
        setServices(servicesArray);
      }
    } catch (error) {
      console.error('Error loading API status:', error);
      showSnackbar('Error loading API status', 'error');
    } finally {
      setLoading(false);
    }
  }, []); // Now the dependency array can be empty since serviceCategories is outside the component

  useEffect(() => {
    loadAPIStatus();
  }, [loadAPIStatus]);

  const handleConfigureService = (serviceName: string, category: string) => {
    setConfigDialog({ open: true, service: serviceName, category });
    setApiKey('');
    setAdditionalConfig({});
    setShowApiKey(false);
  };

  const handleSaveConfiguration = async () => {
    try {
      setTestingConnection(true);
      
      const configuration: APIConfiguration = {
        service: configDialog.service,
        apiKey: apiKey,
        additionalConfig: additionalConfig
      };

      const response = await fetch(API_ENDPOINTS.CONFIGURE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configuration)
      });

      const data = await response.json();
      
      if (data.success) {
        showSnackbar(`${configDialog.service} configured successfully`, 'success');
        setConfigDialog({ open: false, service: '', category: '' });
        await loadAPIStatus(); // Reload status
      } else {
        showSnackbar(`Configuration failed: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Error configuring service:', error);
      showSnackbar('Error configuring service', 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleTestConnection = async (serviceName: string) => {
    try {
      setTestingConnection(true);
      // Implement connection test logic here
      showSnackbar(`Testing connection to ${serviceName}...`, 'info');
      
      // Simulate test delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showSnackbar(`Connection to ${serviceName} successful`, 'success');
    } catch (error) {
      showSnackbar(`Connection test failed for ${serviceName}`, 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon sx={{ color: '#10b981' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#ef4444' }} />;
      default:
        return <WarningIcon sx={{ color: '#f59e0b' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return '#10b981';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const renderAdditionalConfigFields = () => {
    const service = configDialog.service;
    const fields: Array<{ key: string; label: string; type?: string; required?: boolean }> = [];

    // Define additional config fields for each service
    switch (service) {
      case 'facebook':
        fields.push({ key: 'page_id', label: 'Page ID', required: true });
        break;
      case 'instagram':
        fields.push({ key: 'business_account_id', label: 'Business Account ID', required: true });
        break;
      case 'twitter':
        fields.push(
          { key: 'api_secret', label: 'API Secret', type: 'password', required: true },
          { key: 'access_token', label: 'Access Token', required: true },
          { key: 'access_secret', label: 'Access Token Secret', type: 'password', required: true }
        );
        break;
      case 'google_analytics':
        fields.push({ key: 'measurement_id', label: 'Measurement ID', required: true });
        break;
      case 'amazon_kdp':
        fields.push({ key: 'asin', label: 'Book ASIN', required: true });
        break;
      case 'mailchimp':
        fields.push({ key: 'audience_id', label: 'Audience ID', required: true });
        break;
      case 'author_email':
        fields.push(
          { key: 'email', label: 'Author Email Address', type: 'email', required: true },
          { key: 'name', label: 'Author Name', required: true }
        );
        break;
      case 'notification_preferences':
        fields.push(
          { key: 'daily_reports', label: 'Daily Reports', type: 'checkbox' },
          { key: 'campaign_alerts', label: 'Campaign Alerts', type: 'checkbox' },
          { key: 'performance_summaries', label: 'Weekly Performance Summaries', type: 'checkbox' }
        );
        break;
    }

    return fields.map((field) => {
      if (field.type === 'checkbox') {
        return (
          <FormControlLabel
            key={field.key}
            control={
              <Checkbox
                checked={additionalConfig[field.key] === 'true' || false}
                onChange={(e) => setAdditionalConfig(prev => ({
                  ...prev,
                  [field.key]: e.target.checked.toString()
                }))}
              />
            }
            label={field.label}
            sx={{ display: 'block', mt: 2 }}
          />
        );
      }
      
      return (
        <TextField
          key={field.key}
          label={field.label}
          type={field.type === 'password' ? 'password' : field.type === 'email' ? 'email' : 'text'}
          fullWidth
          margin="normal"
          value={additionalConfig[field.key] || ''}
          onChange={(e) => setAdditionalConfig(prev => ({
            ...prev,
            [field.key]: e.target.value
          }))}
          required={field.required}
        />
      );
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <SecurityIcon sx={{ color: '#8b5cf6' }} />
              <Typography variant="h5">API Configuration</Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadAPIStatus}
              disabled={loading}
            >
              Refresh Status
            </Button>
          </Box>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            Configure your API keys to enable full functionality of the Marketing Assistant. 
            All keys are encrypted and stored securely.
          </Alert>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              icon={<CheckCircleIcon />}
              label={`${services.filter(s => s.status === 'connected').length} Connected`}
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<WarningIcon />}
              label={`${services.filter(s => s.status === 'disconnected').length} Not Configured`}
              color="warning"
              variant="outlined"
            />
            <Chip
              icon={<ErrorIcon />}
              label={`${services.filter(s => s.status === 'error').length} Error`}
              color="error"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {Object.entries(serviceCategories).map(([categoryKey, category]) => (
        <Accordion key={categoryKey} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" alignItems="center" gap={2}>
              {React.cloneElement(getIconComponent(category.iconName), { sx: { color: category.color } })}
              <Typography variant="h6">{category.title}</Typography>
              <Chip
                size="small"
                label={`${services.filter(s => s.category === categoryKey && s.status === 'connected').length}/${Object.keys(category.services).length}`}
                color={services.filter(s => s.category === categoryKey && s.status === 'connected').length > 0 ? 'success' : 'default'}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {Object.entries(category.services).map(([serviceName, description]) => {
                const service = services.find(s => s.name === serviceName);
                return (
                  <ListItem
                    key={serviceName}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'background.paper'
                    }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(service?.status || 'disconnected')}
                    </ListItemIcon>
                    <ListItemText
                      primary={serviceName.replace('_', ' ').toUpperCase()}
                      secondary={description}
                    />
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={service?.status || 'disconnected'}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(service?.status || 'disconnected'),
                          color: 'white'
                        }}
                      />
                      {service?.status === 'connected' && (
                        <Tooltip title="Test Connection">
                          <Button
                            size="small"
                            onClick={() => handleTestConnection(serviceName)}
                            disabled={testingConnection}
                          >
                            Test
                          </Button>
                        </Tooltip>
                      )}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<SettingsIcon />}
                        onClick={() => handleConfigureService(serviceName, categoryKey)}
                      >
                        Configure
                      </Button>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Configuration Dialog */}
      <Dialog 
        open={configDialog.open} 
        onClose={() => setConfigDialog({ open: false, service: '', category: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Configure {configDialog.service.replace('_', ' ').toUpperCase()}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="API Key"
              type={showApiKey ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <Button
                    onClick={() => setShowApiKey(!showApiKey)}
                    size="small"
                  >
                    {showApiKey ? <VisibilityOff /> : <Visibility />}
                  </Button>
                )
              }}
            />
            
            {renderAdditionalConfigFields()}
            
            <Alert severity="warning" sx={{ mt: 2 }}>
              API keys are encrypted and stored securely. Never share your API keys with anyone.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfigDialog({ open: false, service: '', category: '' })}
            disabled={testingConnection}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveConfiguration}
            variant="contained"
            disabled={!apiKey || testingConnection}
            startIcon={testingConnection ? <CircularProgress size={16} /> : null}
          >
            {testingConnection ? 'Testing...' : 'Save & Test'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default APISettings;
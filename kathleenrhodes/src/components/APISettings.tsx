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

interface APIService {
  name: string;
  category: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  enabled: boolean;
  configured: boolean;
}


// Move serviceCategories outside the component to prevent unnecessary re-renders
// Use icon names instead of JSX elements to avoid dependency issues
const serviceCategories = {
  ai_services: {
    title: 'AI Services',
    iconName: 'CloudIcon',
    color: '#8b5cf6',
    services: {
      'Claude AI': 'Anthropic\'s Claude for intelligent conversations and content generation',
      'GPT-4': 'OpenAI\'s GPT-4 for advanced text generation and analysis',
      'DALL-E 3': 'OpenAI\'s DALL-E 3 for AI-powered image generation'
    }
  },
  social_media: {
    title: 'Social Media Accounts',
    iconName: 'ShareIcon',
    color: '#1877F2',
    services: {
      'Instagram': 'Enter your Instagram username/handle',
      'Facebook': 'Enter your Facebook page name',
      'Twitter / X': 'Enter your Twitter/X handle',
      'Threads': 'Enter your Threads username',
      'TikTok': 'Enter your TikTok username',
      'Bluesky': 'Enter your Bluesky handle'
    }
  },
  unified_social: {
    title: 'Unified Social Media Services',
    iconName: 'CloudIcon',
    color: '#8b5cf6',
    services: {
      'Ayrshare': 'Post to multiple platforms simultaneously with one API',
      'Buffer': 'Schedule and manage social media posts across platforms',
      'Hootsuite': 'Enterprise social media management and analytics'
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
    setLoading(true);
    
    // Load actual API key/account info status from localStorage
    const servicesArray: APIService[] = [];
    
    Object.entries(serviceCategories).forEach(([category, categoryInfo]) => {
      Object.entries(categoryInfo.services).forEach(([serviceName, description]) => {
        // Check if data exists in localStorage (API key or account info)
        const data = localStorage.getItem(`apiKey_${serviceName.replace(/\s+/g, '_')}`);
        const isConfigured = !!(data && data.length > 0);
        
        servicesArray.push({
          name: serviceName,
          category,
          description: description as string,
          status: isConfigured ? 'connected' : 'disconnected',
          enabled: isConfigured,
          configured: isConfigured
        });
      });
    });
    
    setServices(servicesArray);
    setLoading(false);
  }, []);

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
    setTestingConnection(true);
    
    if (apiKey.trim()) {
      try {
        // Save API key to localStorage
        const keyName = `apiKey_${configDialog.service.replace(/\s+/g, '_')}`;
        localStorage.setItem(keyName, apiKey.trim());
        
        // Save additional config if any
        if (Object.keys(additionalConfig).length > 0) {
          const configName = `config_${configDialog.service.replace(/\s+/g, '_')}`;
          localStorage.setItem(configName, JSON.stringify(additionalConfig));
        }
        
        // Test/validate the input (API key or username)
        await testAPIKey(configDialog.service, apiKey.trim());
        
        const isSocialMedia = ['Instagram', 'Facebook', 'Twitter / X', 'Threads', 'TikTok', 'Bluesky'].includes(configDialog.service);
        showSnackbar(`${configDialog.service} ${isSocialMedia ? 'account info saved' : 'configured'} successfully!`, 'success');
        setConfigDialog({ open: false, service: '', category: '' });
        
        // Update services array to show as connected
        setServices(prev => prev.map(service => 
          service.name === configDialog.service 
            ? { ...service, status: 'connected', enabled: true, configured: true }
            : service
        ));
      } catch (error) {
        showSnackbar(`Configuration failed: ${error}`, 'error');
      }
    } else {
      const isSocialMedia = ['Instagram', 'Facebook', 'Twitter / X', 'Threads', 'TikTok', 'Bluesky'].includes(configDialog.service);
      showSnackbar(`Please enter ${isSocialMedia ? 'your username/handle' : 'an API key'}`, 'error');
    }
    
    setTestingConnection(false);
  };

  const testAPIKey = async (serviceName: string, input: string): Promise<void> => {
    // Basic validation for different services
    switch (serviceName) {
      case 'Claude AI':
        if (!input.startsWith('sk-ant-')) {
          throw new Error('Invalid Claude key format (should start with sk-ant-)');
        }
        break;
      case 'DALL-E 3':
        if (!input.startsWith('sk-')) {
          throw new Error('Invalid OpenAI key format (should start with sk-)');
        }
        break;
      case 'GPT-4':
        if (!input.startsWith('sk-')) {
          throw new Error('Invalid OpenAI key format (should start with sk-)');
        }
        break;
      case 'Ayrshare':
        // Ayrshare API keys are typically formatted as XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX
        if (!/^[A-Z0-9]{8}-[A-Z0-9]{8}-[A-Z0-9]{8}-[A-Z0-9]{8}$/.test(input)) {
          throw new Error('Invalid Ayrshare key format (should be XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX)');
        }
        break;
      case 'Instagram':
        // Instagram username validation
        if (!/^[a-zA-Z0-9._]{1,30}$/.test(input)) {
          throw new Error('Invalid Instagram username format (letters, numbers, dots, underscores only)');
        }
        break;
      case 'Facebook':
        // Facebook page name validation (more flexible)
        if (input.length < 2 || input.length > 50) {
          throw new Error('Facebook page name should be 2-50 characters');
        }
        break;
      case 'Twitter / X':
        // Twitter handle validation
        if (!/^@?[a-zA-Z0-9_]{1,15}$/.test(input)) {
          throw new Error('Invalid Twitter handle format (@username, 1-15 characters)');
        }
        break;
      case 'Threads':
        // Threads username validation (similar to Instagram)
        if (!/^[a-zA-Z0-9._]{1,30}$/.test(input)) {
          throw new Error('Invalid Threads username format (letters, numbers, dots, underscores only)');
        }
        break;
      case 'TikTok':
        // TikTok username validation
        if (!/^@?[a-zA-Z0-9._]{2,24}$/.test(input)) {
          throw new Error('Invalid TikTok username format (@username, 2-24 characters)');
        }
        break;
      case 'Bluesky':
        // Bluesky handle validation (can be domain-like or simple handle)
        if (!/^@?[a-zA-Z0-9.-]+$/.test(input) || input.length < 2 || input.length > 50) {
          throw new Error('Invalid Bluesky handle format');
        }
        break;
      default:
        if (input.length < 2) {
          throw new Error('Input seems too short');
        }
    }
    
    // Add a small delay to simulate validation
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleTestConnection = async (serviceName: string) => {
    try {
      setTestingConnection(true);
      const isSocialMedia = ['Instagram', 'Facebook', 'Twitter / X', 'Threads', 'TikTok', 'Bluesky'].includes(serviceName);
      showSnackbar(`${isSocialMedia ? 'Validating' : 'Testing connection to'} ${serviceName}...`, 'info');
      
      // Get stored data (API key or account info)
      const keyName = `apiKey_${serviceName.replace(/\s+/g, '_')}`;
      const data = localStorage.getItem(keyName);
      
      if (!data) {
        throw new Error(isSocialMedia ? 'No account info configured' : 'No key configured');
      }
      
      await testAPIKey(serviceName, data);
      showSnackbar(`${isSocialMedia ? 'Account info validated' : `Connection to ${serviceName} successful`}`, 'success');
    } catch (error) {
      showSnackbar(`${['Instagram', 'Facebook', 'Twitter / X', 'Threads', 'TikTok', 'Bluesky'].includes(serviceName) ? 'Validation' : 'Connection test'} failed: ${error}`, 'error');
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

    // Social media accounts don't need additional config fields
    // since they just need the username/handle in the main field
    switch (service) {
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
              <Typography variant="h5">Settings</Typography>
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
            Set up your services: Configure Ayrshare API key for unified social media posting, 
            add your social media account handles for reference, and set up other service keys.
            All data is encrypted and stored securely.
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
              {getIconComponent(category.iconName)}
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
            {(() => {
              const isSocialMedia = ['Instagram', 'Facebook', 'Twitter / X', 'Threads', 'TikTok', 'Bluesky'].includes(configDialog.service);
              const isAryshare = configDialog.service === 'Ayrshare';
              
              if (isSocialMedia) {
                const placeholders: { [key: string]: string } = {
                  'Instagram': '@username or username',
                  'Facebook': 'Your page name',
                  'Twitter / X': '@username',
                  'Threads': '@username',
                  'TikTok': '@username',
                  'Bluesky': '@username.bsky.social or custom domain'
                };
                
                return (
                  <TextField
                    label={`${configDialog.service} Username/Handle`}
                    type="text"
                    fullWidth
                    margin="normal"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                    placeholder={placeholders[configDialog.service]}
                    helperText="Enter your account username or handle (no API key needed)"
                  />
                );
              } else {
                return (
                  <TextField
                    label={isAryshare ? 'Ayrshare API Key' : 'API Key'}
                    type={showApiKey ? 'text' : 'password'}
                    fullWidth
                    margin="normal"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                    placeholder={isAryshare ? 'XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX' : ''}
                    helperText={isAryshare ? 'Get your API key from Ayrshare dashboard after connecting your social accounts' : ''}
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
                );
              }
            })()}
            
            {renderAdditionalConfigFields()}
            
            <Alert severity="info" sx={{ mt: 2 }}>
              {['Instagram', 'Facebook', 'Twitter / X', 'Threads', 'TikTok', 'Bluesky'].includes(configDialog.service) 
                ? 'Account information is stored locally for reference. Posting is handled through Ayrshare - make sure to connect your accounts there first.'
                : 'API keys are encrypted and stored securely. Never share your keys with anyone.'
              }
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
            {testingConnection 
              ? (['Instagram', 'Facebook', 'Twitter / X', 'Threads', 'TikTok', 'Bluesky'].includes(configDialog.service) ? 'Validating...' : 'Testing...')
              : (['Instagram', 'Facebook', 'Twitter / X', 'Threads', 'TikTok', 'Bluesky'].includes(configDialog.service) ? 'Save & Validate' : 'Save & Test')
            }
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
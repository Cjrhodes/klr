import React, { useState } from 'react';
import { 
  Tab, 
  Tabs, 
  Box 
} from '@mui/material';
import SalesTracker from './SalesTracker';
import SocialMediaAnalytics from './SocialMediaAnalytics';
import AIAssistant from './AIAssistant';
import PostCreator from './PostCreator';
import CalendarView from './CalendarView';
import APISettings from './APISettings';
import AgentMessageBanner from './AgentMessageBanner';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const Dashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <AgentMessageBanner />

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="📊 Sales & Analytics" {...a11yProps(0)} />
          <Tab label="📱 Social Media" {...a11yProps(1)} />
          <Tab label="🤖 AI Assistant" {...a11yProps(2)} />
          <Tab label="✍️ Create Posts" {...a11yProps(3)} />
          <Tab label="📅 Schedule & Calendar" {...a11yProps(4)} />
          <Tab label="⚙️ Settings" {...a11yProps(5)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <SalesTracker />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <SocialMediaAnalytics />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <AIAssistant />
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <PostCreator />
      </TabPanel>
      <TabPanel value={tabValue} index={4}>
        <CalendarView />
      </TabPanel>
      <TabPanel value={tabValue} index={5}>
        <APISettings />
      </TabPanel>
    </Box>
  );
};

export default Dashboard;
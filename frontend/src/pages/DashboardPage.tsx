// frontend/src/pages/DashboardPage.tsx

import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import SummaryWidget from '../components/dashboard/SummaryWidget';

import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import GppGoodIcon from '@mui/icons-material/GppGood';
import BugReportIcon from '@mui/icons-material/BugReport';
import DataUsageIcon from '@mui/icons-material/DataUsage'; 

// Dummy data for now - replace with API calls
const summaryData = {
    activeAlerts: { value: 125, trend: 'up', trendValue: '+15 last 7 days' },
    policiesEnforced: { value: 78, trend: 'neutral', trendValue: 'No change' },
    openIncidents: { value: 12, trend: 'down', trendValue: '-2 last 7 days' },
    dataScanned: { value: '2.5 TB', trend: 'up', trendValue: '+200GB today' },
};

const DashboardPage: React.FC = () => {
    return (
        <Box>
        <PageHeader title="Dashboard Overview" />

        <Grid container spacing={3} className="mb-6">
            <Grid item xs={12} sm={6} md={3}>
            <SummaryWidget
                title="Active Alerts"
                value={summaryData.activeAlerts.value}
                icon={<NotificationsActiveIcon />}
                color="bg-red-600" 
                iconColor="text-white"
                trend={summaryData.activeAlerts.trend as any}
                trendValue={summaryData.activeAlerts.trendValue}
            />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
            <SummaryWidget
                title="Policies Enforced"
                value={summaryData.policiesEnforced.value}
                icon={<GppGoodIcon />}
                color="bg-green-600"
                iconColor="text-white"
                trend={summaryData.policiesEnforced.trend as any}
                trendValue={summaryData.policiesEnforced.trendValue}
            />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
            <SummaryWidget
                title="Open Incidents"
                value={summaryData.openIncidents.value}
                icon={<BugReportIcon />}
                color="bg-yellow-500"
                iconColor="text-gray-800"
                trend={summaryData.openIncidents.trend as any}
                trendValue={summaryData.openIncidents.trendValue}
            />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
            <SummaryWidget
                title="Data Scanned (Today)"
                value={summaryData.dataScanned.value}
                icon={<DataUsageIcon />}
                color="bg-sky-500" 
                iconColor="text-white"
                trend={summaryData.dataScanned.trend as any}
                trendValue={summaryData.dataScanned.trendValue}
            />
            </Grid>
        </Grid>

        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
            <Paper className="p-4 shadow-lg bg-dlp-surface h-[400px] flex items-center justify-center">
                <Typography className="text-dlp-text-secondary">Recent Alerts Trend (Chart Placeholder)</Typography>
                {/* <RecentAlertsChart data={alertsChartData} /> */}
            </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
            <Paper className="p-4 shadow-lg bg-dlp-surface h-[400px] flex items-center justify-center">
                <Typography className="text-dlp-text-secondary">Policy Compliance Status (Chart Placeholder)</Typography>
                {/* <PolicyComplianceChart data={policyComplianceData} /> */}
            </Paper>
            </Grid>
            <Grid item xs={12}>
            <Paper className="p-4 shadow-lg bg-dlp-surface min-h-[300px] flex items-center justify-center">
                <Typography className="text-dlp-text-secondary">Top Violated Policies (Table Placeholder)</Typography>
                {/* <TopViolatedPoliciesTable /> */}
            </Paper>
            </Grid>
        </Grid>
        </Box>
    );
};

export default DashboardPage;

"use client";

import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ActivityLogList from '../../components/ActivityLog/ActivityLogList';
import { CircularProgress } from '@mui/material';

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <CircularProgress />;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <ActivityLogList />
    </div>
  );
};

export default DashboardPage;
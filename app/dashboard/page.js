"use client";

import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ActivityLogList from "../../components/ActivityLog/ActivityLogList";
import { CircularProgress, Container } from "@mui/material";

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    <Container sx={{ py: 4, textAlign: "center" }}>
      return <CircularProgress />;
    </Container>;
  }

  return (
    <Container>
      <h1>Dashboard</h1>
      <ActivityLogList />
    </Container>
  );
};

export default DashboardPage;

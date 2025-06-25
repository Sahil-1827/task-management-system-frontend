"use client";

import { Container, Typography } from "@mui/material";
import ActivityLogList from "../../components/ActivityLog/ActivityLogList";

export default function ActivityLogPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Activity Log
      </Typography>
      <ActivityLogList />
    </Container>
  );
}
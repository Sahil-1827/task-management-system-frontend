import { Container, Typography } from "@mui/material";
import ActivityLogList from "../components/ActivityLog/ActivityLogList";

export default function ActivityLogPage() {
  return (
    <Container maxWidth="md" sx={{ pt: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        Activity Log
      </Typography>
      <ActivityLogList />
    </Container>
  );
}

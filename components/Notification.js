"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Alert, Snackbar } from "@mui/material";

// Move socket initialization outside component to prevent multiple instances
let socket = null;
const initializeSocket = () => {
  if (!socket) {
    socket = io("http://localhost:5000", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export default function Notification({ userId, onTaskUpdate, onTeamUpdate }) {
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!userId) {
      console.log("No userId provided, skipping WebSocket setup");
      return;
    }

    console.log("Setting up WebSocket for user:", userId);
    
    // Get socket instance
    const socketInstance = initializeSocket();

    // Only connect if not already connected
    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    // Join room
    socketInstance.emit("join", userId);

    // Add the taskUpdated handler
    const handleTaskUpdated = (data) => {
      console.log("Received taskUpdated event:", data);
      setMessage(data.message);
      setOpen(true);
      if (onTaskUpdate) {
        console.log("Calling onTaskUpdate callback");
        onTaskUpdate();
      }
    };

    const handleTaskAssigned = (data) => {
      console.log("Received taskAssigned event:", data);
      setMessage(data.message);
      setOpen(true);
      if (onTaskUpdate) {
        console.log("Calling onTaskUpdate callback");
        onTaskUpdate();
      }
    };

    const handleTaskUnassigned = (data) => {
      console.log("Received taskUnassigned event:", data);
      setMessage(data.message);
      setOpen(true);
      if (onTaskUpdate) {
        console.log("Calling onTaskUpdate callback");
        onTaskUpdate();
      }
    };

    const handleTaskAssignedToTeam = (data) => {
      console.log("Received taskAssignedToTeam event:", data);
      setMessage(data.message);
      setOpen(true);
      if (onTaskUpdate) {
        console.log("Calling onTaskUpdate callback");
        onTaskUpdate();
      }
    };

    const handleTeamAdded = (data) => {
      console.log("Received teamAdded event:", data);
      setMessage(data.message);
      setOpen(true);
      // Always call onTeamUpdate for both new teams and updates
      if (onTeamUpdate) {
        console.log("Calling onTeamUpdate callback");
        onTeamUpdate();
      }
    };

    const handleTeamRemoved = (data) => {
      console.log("Received teamRemoved event:", data);
      setMessage(data.message);
      setOpen(true);
      if (onTeamUpdate) {
        console.log("Calling onTeamUpdate callback");
        onTeamUpdate();
      }
    };

    // Add this new handler for teamUpdated event
    const handleTeamUpdated = (data) => {
      console.log("Received teamUpdated event:", data);
      setMessage(data.message);
      setOpen(true);
      if (onTeamUpdate) {
        console.log("Calling onTeamUpdate callback");
        onTeamUpdate();
      }
    };

    socketInstance.on("taskUpdated", handleTaskUpdated);
    socketInstance.on("taskAssigned", handleTaskAssigned);
    socketInstance.on("taskUnassigned", handleTaskUnassigned);
    socketInstance.on("taskAssignedToTeam", handleTaskAssignedToTeam);
    socketInstance.on("teamAdded", handleTeamAdded);
    socketInstance.on("teamRemoved", handleTeamRemoved);
    // Add the new listener here
    socketInstance.on("teamUpdated", handleTeamUpdated);

    return () => {
      console.log("Cleaning up WebSocket listeners for user:", userId);
      socketInstance.off("taskUpdated", handleTaskUpdated);
      socketInstance.off("taskAssigned", handleTaskAssigned);
      socketInstance.off("taskUnassigned", handleTaskUnassigned);
      socketInstance.off("taskAssignedToTeam", handleTaskAssignedToTeam);
      socketInstance.off("teamAdded", handleTeamAdded);
      socketInstance.off("teamRemoved", handleTeamRemoved);
      // Remove the new listener here
      socketInstance.off("teamUpdated", handleTeamUpdated);
    };
  }, [userId, onTaskUpdate, onTeamUpdate]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={() => setOpen(false)}
        severity="info"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
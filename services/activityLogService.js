import { toast } from 'react-toastify';

const BASE_URL = "http://localhost:5000/api/activity-logs";

export const activityLogService = {
  async getLogs(filters = {}) {
    try {
      const token = localStorage.getItem("token");

      // Enforce sorting and limit for every request
      const queryFilters = {
        ...filters,
        sort: "-createdAt", // Sort by creation date, newest first
        limit: 20 // Limit to 20 documents
      };

      const queryParams = new URLSearchParams(queryFilters).toString();
      const response = await fetch(`${BASE_URL}?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      toast.error("Failed to fetch activity logs.");
      throw error;
    }
  }
};

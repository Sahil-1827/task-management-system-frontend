const BASE_URL = "http://localhost:8080/api/activity-logs";

export const activityLogService = {
  async getLogs(filters = {}) {
    try {
      const token = localStorage.getItem("token");

      // Enforce sorting and limit for every request
      const queryFilters = {
        ...filters,
        sort: "-createdAt", // Sort by creation date, newest first
        limit: 25 // Limit to 25 documents
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
      throw error;
    }
  }
};

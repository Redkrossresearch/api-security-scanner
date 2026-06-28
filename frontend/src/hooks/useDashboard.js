import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../services/api";
import { getVulnerability } from "../services/vulnerabilityService";
import logger from "../utils/logger";
import { DEFAULT_COMPLIANCE_DATA } from "../constants/dashboardConstants";

export default function useDashboard() {
  // ✅ Saari state
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendRange, setTrendRange] = useState("7D");
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);

  // ✅ Sprint 3.4.5: Pagination states
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // ✅ Saare useMemo
  const criticalFindings = useMemo(() => {
    return dashboardData?.criticalFindings || [];
  }, [dashboardData]);

  const criticalCount = useMemo(() => {
    return criticalFindings.filter(
      (item) => item.severity?.toLowerCase() === "critical",
    ).length;
  }, [criticalFindings]);

  // ✅ complianceData - using constant instead of hardcoded array
  const complianceData = useMemo(() => {
    return dashboardData?.complianceRadarData || DEFAULT_COMPLIANCE_DATA;
  }, [dashboardData]);

  // ✅ Functions - Sprint 3.4.5 + trendRange integration
  const fetchDashboard = useCallback(
    async (pageNumber = 1) => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(
          `/dashboard/stats?page=${pageNumber}&limit=5&range=${trendRange}`,
        );
        setDashboardData(res.data.stats);
        setPagination(res.data.stats.pagination);
      } catch (err) {
        logger.error(err, "Dashboard fetch failed");
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    },
    [trendRange], // ✅ trendRange dependency added
  );

  const handleVulnerabilityClick = useCallback(async (id) => {
    try {
      const data = await getVulnerability(id);
      setSelectedVulnerability(data);
    } catch (error) {
      logger.error(error, "Vulnerability fetch failed");
    }
  }, []);

  // ✅ useEffect - Already correct, will auto-rerun when trendRange changes
  useEffect(() => {
    fetchDashboard(page);
  }, [fetchDashboard, page]);

  // ✅ Return object
  return {
    dashboardData,
    loading,
    error,

    trendRange,
    setTrendRange,

    selectedVulnerability,
    setSelectedVulnerability,

    criticalFindings,
    criticalCount,
    complianceData,

    // ✅ Sprint 3.4.5: Pagination exports
    page,
    setPage,
    pagination,

    fetchDashboard,
    handleVulnerabilityClick,
  };
}
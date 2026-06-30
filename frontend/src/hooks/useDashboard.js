import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../services/api";
import logger from "../utils/logger";
import { DEFAULT_COMPLIANCE_DATA } from "../constants/dashboardConstants";

export default function useDashboard() {
  // ✅ Saari state
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendRange, setTrendRange] = useState("7D");
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  
  // ✅ Single source of truth for selected scan
  const [selectedScan, setSelectedScan] = useState(null);

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

  // ✅ fetchScanDetails function (PEHELE define karna zaroori hai)
  const fetchScanDetails = useCallback(async (scanId) => {
    try {
      const res = await api.get(`/dashboard/scans/${scanId}`);
      setSelectedScan(res.data.scan);
    } catch (error) {
      logger.error(error, "Failed to fetch scan details");
    }
  }, []);

  // ✅ fetchDashboard function
  const fetchDashboard = useCallback(
    async (pageNumber = 1) => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(
          `/dashboard/stats?page=${pageNumber}&limit=5&range=${trendRange}`,
        );
        
        const stats = res.data.stats;
        setDashboardData(stats);
        setPagination(stats.pagination);

        // Auto-load first scan details
        if (stats.latestScans?.length > 0) {
          await fetchScanDetails(stats.latestScans[0]._id);
        }
      } catch (err) {
        logger.error(err, "Dashboard fetch failed");
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    },
    [trendRange, fetchScanDetails],
  );

  // ✅ SIMPLIFIED - No API call, direct set
  const handleVulnerabilityClick = useCallback((vulnerability) => {
    setSelectedVulnerability(vulnerability);
  }, []);

  // ✅ useEffect
  useEffect(() => {
    fetchDashboard(page);
  }, [fetchDashboard, page]);

  // ✅ Return object
  return {
    dashboardData,
    loading,
    error,

    selectedScan,
    setSelectedScan,
    fetchScanDetails,

    trendRange,
    setTrendRange,

    selectedVulnerability,
    setSelectedVulnerability,

    criticalFindings,
    criticalCount,
    complianceData,

    page,
    setPage,
    pagination,

    fetchDashboard,
    handleVulnerabilityClick,
  };
}
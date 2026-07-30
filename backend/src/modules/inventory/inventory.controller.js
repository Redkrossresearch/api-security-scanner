const {
  triggerDirectTargetScan,
  getInventoryStats,
  getTargetWebsites,
  getFilteredEndpoints,
  getEndpointDetails,
  updateEndpointMetadata,
  importOpenApiSpec,
  generateOpenApiSpec,
} = require("./inventory.service");

/**
 * POST /api/inventory/scan-target
 */
async function triggerTargetScanHandler(req, res) {
  try {
    const { targetUrl } = req.body;
    if (!targetUrl) {
      return res.status(400).json({ success: false, error: "targetUrl is required." });
    }

    const result = await triggerDirectTargetScan(targetUrl);
    return res.status(200).json({
      success: true,
      message: `Discovered and ingested ${result.count} endpoints from ${result.host}`,
      ...result,
    });
  } catch (error) {
    console.error("[inventory.controller] triggerTargetScan error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to scan target URL." });
  }
}

/**
 * GET /api/inventory/stats
 */
async function getInventoryStatsHandler(req, res) {
  try {
    const { host } = req.query;
    const stats = await getInventoryStats(host);
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("[inventory.controller] getInventoryStats error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch inventory statistics." });
  }
}

/**
 * GET /api/inventory/targets (Grouped Website Targets)
 */
async function getTargetWebsitesHandler(req, res) {
  try {
    const targets = await getTargetWebsites();
    return res.status(200).json({ success: true, targets });
  } catch (error) {
    console.error("[inventory.controller] getTargetWebsites error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch target website list." });
  }
}

/**
 * GET /api/inventory
 */
async function getInventoryEndpointsHandler(req, res) {
  try {
    const result = await getFilteredEndpoints(req.query);
    return res.status(200).json({
      success: true,
      endpoints: result.endpoints,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("[inventory.controller] getInventoryEndpoints error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch inventory endpoints." });
  }
}

/**
 * GET /api/inventory/:id
 */
async function getEndpointDetailsHandler(req, res) {
  try {
    const { id } = req.params;
    const endpoint = await getEndpointDetails(id);
    if (!endpoint) {
      return res.status(404).json({ success: false, error: "Endpoint not found." });
    }
    return res.status(200).json({ success: true, endpoint });
  } catch (error) {
    console.error("[inventory.controller] getEndpointDetails error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch endpoint details." });
  }
}

/**
 * PATCH /api/inventory/:id
 */
async function updateEndpointMetadataHandler(req, res) {
  try {
    const { id } = req.params;
    const updated = await updateEndpointMetadata(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: "Endpoint not found." });
    }
    return res.status(200).json({ success: true, endpoint: updated });
  } catch (error) {
    console.error("[inventory.controller] updateEndpointMetadata error:", error);
    return res.status(500).json({ success: false, error: "Failed to update endpoint metadata." });
  }
}

/**
 * POST /api/inventory/import
 */
async function importSpecHandler(req, res) {
  try {
    const { specData, targetHost } = req.body;

    let specObj = specData;
    if (typeof specData === "string") {
      try {
        specObj = JSON.parse(specData);
      } catch (e) {
        return res.status(400).json({ success: false, error: "Invalid JSON format for specification." });
      }
    }

    if (!specObj || typeof specObj !== "object") {
      return res.status(400).json({ success: false, error: "Spec data is required." });
    }

    const result = await importOpenApiSpec(specObj, targetHost);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("[inventory.controller] importSpec error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to import specification." });
  }
}

/**
 * GET /api/inventory/export
 */
async function exportSpecHandler(req, res) {
  try {
    const { host } = req.query;
    const spec = await generateOpenApiSpec(host);

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", 'attachment; filename="openapi_discovered_inventory.json"');
    return res.status(200).send(JSON.stringify(spec, null, 2));
  } catch (error) {
    console.error("[inventory.controller] exportSpec error:", error);
    return res.status(500).json({ success: false, error: "Failed to export OpenAPI specification." });
  }
}

module.exports = {
  triggerTargetScanHandler,
  getInventoryStatsHandler,
  getTargetWebsitesHandler,
  getInventoryEndpointsHandler,
  getEndpointDetailsHandler,
  updateEndpointMetadataHandler,
  importSpecHandler,
  exportSpecHandler,
};

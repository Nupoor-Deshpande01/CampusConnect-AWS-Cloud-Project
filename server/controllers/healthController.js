/**
 * Health Controller
 * Returns server operational status
 */
export const getHealthStatus = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'CampusConnect API',
    version: 'v1',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
};

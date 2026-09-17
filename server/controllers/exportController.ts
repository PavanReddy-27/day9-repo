import { Request, Response } from 'express';
import ExportService from '../services/exportService.js';

export const exportAuditLogs = async (req: any, res: Response) => {
  try {
    const { format = 'json', startDate, endDate, actionFilter, limit } = req.query;
    
    const actor = {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email || req.user.username || 'unknown',
      companyId: req.companyId,
      ip: req.ip || '127.0.0.1'
    };

    const result = await ExportService.exportAuditLogs(
      { format, startDate, endDate, actionFilter, limit: limit ? parseInt(limit) : undefined },
      actor
    );

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.status(200).send(result.data);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const exportEmployees = async (req: any, res: Response) => {
  try {
    const { format = 'json', startDate, endDate, limit } = req.query;
    
    const actor = {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email || req.user.username || 'unknown',
      companyId: req.companyId,
      ip: req.ip || '127.0.0.1'
    };

    const result = await ExportService.exportEmployeeData(
      { format, startDate, endDate, limit: limit ? parseInt(limit) : undefined },
      actor
    );

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    return res.status(200).send(result.data);
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

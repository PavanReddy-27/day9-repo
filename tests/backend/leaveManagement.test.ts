import { describe, it, expect, vi, beforeEach } from 'vitest';
import LeaveRequest from '../../server/models/LeaveRequest.js';
import LeaveBalance from '../../server/models/LeaveBalance.js';
import { checkLeaveOverlap, calculateLeaveDuration, deductLeaveBalance } from '../../server/services/leaveService.js';
import mongoose from 'mongoose';

vi.mock('../../server/models/LeaveRequest.js', () => {
  return {
    default: {
      findOne: vi.fn(),
      create: vi.fn(),
    }
  };
});

vi.mock('../../server/models/LeaveBalance.js', () => {
  return {
    default: {
      findOne: vi.fn(),
    }
  };
});

describe('Leave Management Service', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate duration correctly excluding weekends', () => {
    // Friday to Monday = 2 days (Fri, Mon)
    const duration = calculateLeaveDuration('2025-01-10', '2025-01-13'); 
    expect(duration).toBe(2);
  });

  it('should prevent overlapping leaves', async () => {
    const mockSession = {
      session: vi.fn().mockResolvedValue({ _id: 'overlap_id' }) // simulate found overlap
    };
    (LeaveRequest.findOne as any).mockReturnValue(mockSession);

    const companyId = new mongoose.Types.ObjectId();
    const empId = new mongoose.Types.ObjectId();

    const hasOverlap = await checkLeaveOverlap(companyId, empId, '2025-01-11', '2025-01-11');
    expect(hasOverlap).toBe(true);
    expect(LeaveRequest.findOne).toHaveBeenCalledWith({
      companyId,
      employeeId: empId,
      status: { $in: ["Pending", "Approved"] },
      $or: [
        { startDate: { $lte: '2025-01-11' }, endDate: { $gte: '2025-01-11' } }
      ]
    });
  });

  it('should deduct balance correctly on approval', async () => {
    const companyId = new mongoose.Types.ObjectId();
    const empId = new mongoose.Types.ObjectId();
    
    const mockBalance = {
      available: 10,
      used: 0,
      save: vi.fn()
    };

    const mockSession = {
      session: vi.fn().mockResolvedValue(mockBalance)
    };
    (LeaveBalance.findOne as any).mockReturnValue(mockSession);

    await deductLeaveBalance(companyId, empId, 'Annual', 3, null as any);
    
    expect(mockBalance.available).toBe(7);
    expect(mockBalance.used).toBe(3);
    expect(mockBalance.save).toHaveBeenCalled();
  });

  it('should throw error if balance is insufficient', async () => {
    const companyId = new mongoose.Types.ObjectId();
    const empId = new mongoose.Types.ObjectId();
    
    const mockBalance = {
      available: 2,
      used: 0,
      save: vi.fn()
    };

    const mockSession = {
      session: vi.fn().mockResolvedValue(mockBalance)
    };
    (LeaveBalance.findOne as any).mockReturnValue(mockSession);

    await expect(deductLeaveBalance(companyId, empId, 'Annual', 5, null as any))
      .rejects.toThrow(/Insufficient leave balance/);
  });

  it('should not deduct balance for Unpaid leave', async () => {
    const companyId = new mongoose.Types.ObjectId();
    const empId = new mongoose.Types.ObjectId();

    await deductLeaveBalance(companyId, empId, 'Unpaid', 5, null as any);
    
    // findOne should not be called for Unpaid
    expect(LeaveBalance.findOne).not.toHaveBeenCalled();
  });

});

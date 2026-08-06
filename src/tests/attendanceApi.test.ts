/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { attendanceApi } from '../services/attendanceApi';
import { saveSession } from '../utils/authStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock, configurable: true });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, configurable: true });
Object.defineProperty(globalThis, 'sessionStorage', { value: sessionStorageMock, configurable: true });

describe('Attendance API', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    saveSession({
      user: {
        id: 'user-1',
        employeeId: 'EMP-100',
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        role: 'Employee',
        department: 'Engineering',
        designation: 'Engineer',
        location: 'Austin',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: 'token',
      refreshToken: 'refresh',
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 365,
      rememberMe: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should successfully check in an employee', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
    const record = await attendanceApi.checkIn('emp-1', 'John Doe');
    expect(record.employeeId).toBe('emp-1');
    expect(record.status).toBe('Present');
    expect(record.lateArrival).toBe(false);
  });

  it('should flag late arrival if checking in after 09:15', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 9, 30, 0));
    const record = await attendanceApi.checkIn('emp-2', 'Jane Doe');
    expect(record.lateArrival).toBe(true);
  });

  it('should prevent duplicate check-ins on the same day without checking out', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
    await attendanceApi.checkIn('emp-1', 'John Doe');
    await expect(attendanceApi.checkIn('emp-1', 'John Doe')).rejects.toThrow(/Already checked in or active session exists/);
  });

  it('should prevent check out before check in', async () => {
    await expect(attendanceApi.checkOut('emp-1')).rejects.toThrow(/No active check-in found to check out/);
  });

  it('should successfully check out and calculate working hours', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
    await attendanceApi.checkIn('emp-1', 'John Doe');

    vi.setSystemTime(new Date(2026, 7, 6, 17, 0, 0)); // 9 hours later
    const record = await attendanceApi.checkOut('emp-1');
    expect(record.workingHours).toBe(9);
    expect(record.isOvertime).toBe(false);
  });

  it('should correctly flag overtime', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
    await attendanceApi.checkIn('emp-1', 'John Doe');

    vi.setSystemTime(new Date(2026, 7, 6, 18, 30, 0)); // 10.5 hours later
    const record = await attendanceApi.checkOut('emp-1');
    expect(record.workingHours).toBe(10.5);
    expect(record.isOvertime).toBe(true);
  });

  it('should correctly account for break durations in working hours', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
    await attendanceApi.checkIn('emp-1', 'John Doe');

    // Break 12:00 -> 13:00 (1 hour = 60 mins)
    vi.setSystemTime(new Date(2026, 7, 6, 12, 0, 0));
    await attendanceApi.startBreak('emp-1');

    vi.setSystemTime(new Date(2026, 7, 6, 13, 0, 0));
    await attendanceApi.endBreak('emp-1');

    // Checkout at 17:00 (Total 9 hours - 1 hour break = 8 hours)
    vi.setSystemTime(new Date(2026, 7, 6, 17, 0, 0));
    const record = await attendanceApi.checkOut('emp-1');
    
    expect(record.totalBreakDuration).toBe(60);
    expect(record.workingHours).toBe(8);
  });

  it('should use idempotency key to prevent duplicate check-ins via network retry', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
    const idempotencyKey = 'some-unique-key';
    const firstCheckIn = await attendanceApi.checkIn('emp-1', 'John Doe', undefined, 'Web', 'Regular', idempotencyKey);
    
    // Simulate network retry with same key
    const secondCheckIn = await attendanceApi.checkIn('emp-1', 'John Doe', undefined, 'Web', 'Regular', idempotencyKey);
    
    expect(firstCheckIn.id).toBe(secondCheckIn.id);
  });

  it('should use configured server time offset for attendance timestamps', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
    localStorage.setItem('workforce_server_time_offset_ms', '-3600000');

    const record = await attendanceApi.checkIn('emp-3', 'Alice Doe');

    expect(record.checkInTime).toBe(new Date(2026, 7, 6, 7, 0, 0).toISOString());
  });
});

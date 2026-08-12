/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { attendanceApi } from '../services/attendanceApi';
import { saveSession } from '../utils/authStorage';
import type { AuthSession, User } from '../types/auth';

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

// Builds a full auth session for a given user, so tests can switch identity
// (Employee / Manager, different departments) the same way the real app does.
const loginAs = (overrides: Partial<User> & Pick<User, 'id' | 'role' | 'department'>): void => {
  const user: User = {
    id: overrides.id,
    employeeId: overrides.employeeId ?? `EMP-${overrides.id}`,
    firstName: overrides.firstName ?? 'Test',
    lastName: overrides.lastName ?? 'User',
    fullName: overrides.fullName ?? 'Test User',
    username: overrides.username ?? `user-${overrides.id}`,
    email: overrides.email ?? `${overrides.id}@example.com`,
    role: overrides.role,
    department: overrides.department,
    designation: overrides.designation ?? 'Engineer',
    location: overrides.location ?? 'Austin',
    workMode: overrides.workMode,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const session: AuthSession = {
    user,
    accessToken: 'token',
    refreshToken: 'refresh',
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 365,
    rememberMe: false,
  };

  saveSession(session);
};

describe('Attendance API', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    loginAs({ id: 'user-1', role: 'Employee', department: 'Engineering' });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should successfully check in an employee', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
    const record = await attendanceApi.checkIn('user-1', 'John Doe');
    expect(record.employeeId).toBe('user-1');
    expect(record.status).toBe('Present');
    expect(record.lateArrival).toBe(false);
  });

  it('should flag late arrival if checking in after 09:15', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 9, 30, 0));
    const record = await attendanceApi.checkIn('user-1', 'John Doe');
    expect(record.lateArrival).toBe(true);
  });

  it('should prevent duplicate check-ins on the same day without checking out', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
    await attendanceApi.checkIn('user-1', 'John Doe');
    await expect(attendanceApi.checkIn('user-1', 'John Doe')).rejects.toThrow(/Already checked in or active session exists/);
  });

  it('should prevent check out before check in', async () => {
    await expect(attendanceApi.checkOut('user-1')).rejects.toThrow(/No active check-in found to check out/);
  });

  it('should successfully check out and calculate working hours', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
    await attendanceApi.checkIn('user-1', 'John Doe');

    vi.setSystemTime(new Date(2026, 7, 6, 17, 0, 0)); // 9 hours later
    const record = await attendanceApi.checkOut('user-1');
    expect(record.workingHours).toBe(9);
    expect(record.isOvertime).toBe(false);
  });

  it('should correctly flag overtime', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
    await attendanceApi.checkIn('user-1', 'John Doe');

    vi.setSystemTime(new Date(2026, 7, 6, 18, 30, 0)); // 10.5 hours later
    const record = await attendanceApi.checkOut('user-1');
    expect(record.workingHours).toBe(10.5);
    expect(record.isOvertime).toBe(true);
  });

  it('should correctly account for break durations in working hours', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
    await attendanceApi.checkIn('user-1', 'John Doe');

    // Break 12:00 -> 13:00 (1 hour = 60 mins)
    vi.setSystemTime(new Date(2026, 7, 6, 12, 0, 0));
    await attendanceApi.startBreak('user-1');

    vi.setSystemTime(new Date(2026, 7, 6, 13, 0, 0));
    await attendanceApi.endBreak('user-1');

    // Checkout at 17:00 (Total 9 hours - 1 hour break = 8 hours)
    vi.setSystemTime(new Date(2026, 7, 6, 17, 0, 0));
    const record = await attendanceApi.checkOut('user-1');

    expect(record.totalBreakDuration).toBe(60);
    expect(record.workingHours).toBe(8);
  });

  it('should use idempotency key to prevent duplicate check-ins via network retry', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
    const idempotencyKey = 'some-unique-key';
    const firstCheckIn = await attendanceApi.checkIn('user-1', 'John Doe', undefined, 'Web', 'Regular', idempotencyKey);

    // Simulate network retry with same key
    const secondCheckIn = await attendanceApi.checkIn('user-1', 'John Doe', undefined, 'Web', 'Regular', idempotencyKey);

    expect(firstCheckIn.id).toBe(secondCheckIn.id);
  });

  it('should use configured server time offset for attendance timestamps', async () => {
    vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
    localStorage.setItem('workforce_server_time_offset_ms', '-3600000');

    const record = await attendanceApi.checkIn('user-1', 'Alice Doe');

    expect(record.checkInTime).toBe(new Date(2026, 7, 6, 7, 0, 0).toISOString());
  });

  describe('Geofence and GPS accuracy validation', () => {
    // Office defaults to San Francisco (37.7749, -122.4194) with a 500m radius,
    // see src/config/attendance.ts.
    const onSiteLocation = { latitude: 17.3850, longitude: 78.4867, accuracy: 20 };
    const farAwayLocation = { latitude: 40.7128, longitude: -74.006, accuracy: 20 }; // New York

    it('allows an Office check-in from inside the configured geofence', async () => {
      vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
      const record = await attendanceApi.checkIn('user-1', 'John Doe', onSiteLocation, 'Web', 'Regular', undefined, 'Engineering');
      expect(record.status).toBe('Present');
    });

    it('blocks an Office check-in from outside the configured geofence', async () => {
      vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
      await expect(
        attendanceApi.checkIn('user-1', 'John Doe', farAwayLocation, 'Web', 'Regular', undefined, 'Engineering')
      ).rejects.toThrow(/outside the .*allowed range/i);
    });

    it('rejects a GPS reading with poor accuracy even when near the office', async () => {
      vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
      const inaccurateLocation = { latitude: 17.3850, longitude: 78.4867, accuracy: 1000 };
      await expect(
        attendanceApi.checkIn('user-1', 'John Doe', inaccurateLocation, 'Web', 'Regular', undefined, 'Engineering')
      ).rejects.toThrow(/too inaccurate/i);
    });

    it('does not apply the office geofence to Remote employees', async () => {
      vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
      const record = await attendanceApi.checkIn('user-1', 'John Doe', farAwayLocation, 'Web', 'Regular', undefined, 'Remote Engineering');
      expect(record.status).toBe('Present');
    });

    it('throws a typed GeofenceError with reason "outside_geofence" for a check-in outside the radius', async () => {
      vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
      expect.assertions(2);
      try {
        await attendanceApi.checkIn('user-1', 'John Doe', farAwayLocation, 'Web', 'Regular', undefined, 'Engineering');
      } catch (err) {
        expect(err).toBeInstanceOf(GeofenceError);
        expect((err as GeofenceError).reason).toBe('outside_geofence');
      }
    });

    it('throws a typed GeofenceError with reason "inaccurate_gps" for a poor GPS reading', async () => {
      vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
      const inaccurateLocation = { latitude: 17.3850, longitude: 78.4867, accuracy: 1000 };
      expect.assertions(2);
      try {
        await attendanceApi.checkIn('user-1', 'John Doe', inaccurateLocation, 'Web', 'Regular', undefined, 'Engineering');
      } catch (err) {
        expect(err).toBeInstanceOf(GeofenceError);
        expect((err as GeofenceError).reason).toBe('inaccurate_gps');
      }
    });

    it('exempts a work-from-home employee from the office geofence via their profile workMode, even when their department name gives no hint', async () => {
      // "Engineering" doesn't mention "remote", but the employee's own profile
      // marks them as WFH, which should take priority over the department heuristic.
      loginAs({ id: 'user-1', role: 'Employee', department: 'Engineering', workMode: 'Remote' });

      vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
      const record = await attendanceApi.checkIn('user-1', 'John Doe', farAwayLocation, 'Web', 'Regular', undefined, 'Engineering');
      expect(record.status).toBe('Present');
      expect(record.policyType).toBe('Remote');

      vi.setSystemTime(new Date(2026, 7, 6, 17, 0, 0));
      const checkedOut = await attendanceApi.checkOut('user-1', farAwayLocation);
      expect(checkedOut.checkOutTime).not.toBeNull();
      expect(checkedOut.checkOutLocation).toEqual(farAwayLocation);
    });

    it('stores the check-in location on the record for later display', async () => {
      vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
      const record = await attendanceApi.checkIn('user-1', 'John Doe', onSiteLocation, 'Web', 'Regular', undefined, 'Engineering');
      expect(record.location).toEqual(onSiteLocation);
    });

    it('allows an Office check-out from inside the configured geofence and stores the location', async () => {
      vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
      await attendanceApi.checkIn('user-1', 'John Doe', onSiteLocation, 'Web', 'Regular', undefined, 'Engineering');

      vi.setSystemTime(new Date(2026, 7, 6, 17, 0, 0));
      const record = await attendanceApi.checkOut('user-1', onSiteLocation);
      expect(record.checkOutTime).not.toBeNull();
      expect(record.checkOutLocation).toEqual(onSiteLocation);
    });

    it('blocks an Office check-out from outside the configured geofence', async () => {
      vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
      await attendanceApi.checkIn('user-1', 'John Doe', onSiteLocation, 'Web', 'Regular', undefined, 'Engineering');

      vi.setSystemTime(new Date(2026, 7, 6, 17, 0, 0));
      await expect(attendanceApi.checkOut('user-1', farAwayLocation)).rejects.toThrow(/outside the .*allowed range/i);

      // The active session should remain open since the check-out was rejected.
      const stillOpen = await attendanceApi.getTodayRecord('user-1');
      expect(stillOpen?.checkOutTime).toBeNull();
    });

    it('rejects an Office check-out with a poor-accuracy GPS reading', async () => {
      vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
      await attendanceApi.checkIn('user-1', 'John Doe', onSiteLocation, 'Web', 'Regular', undefined, 'Engineering');

      vi.setSystemTime(new Date(2026, 7, 6, 17, 0, 0));
      const inaccurateLocation = { latitude: 17.3850, longitude: 78.4867, accuracy: 1000 };
      await expect(attendanceApi.checkOut('user-1', inaccurateLocation)).rejects.toThrow(/too inaccurate/i);
    });

    it('allows a Remote employee to check out without geofence restrictions', async () => {
      vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
      await attendanceApi.checkIn('user-1', 'John Doe', undefined, 'Web', 'Regular', undefined, 'Remote Engineering');

      vi.setSystemTime(new Date(2026, 7, 6, 17, 0, 0));
      const record = await attendanceApi.checkOut('user-1', farAwayLocation);
      expect(record.checkOutTime).not.toBeNull();
      expect(record.checkOutLocation).toEqual(farAwayLocation);
    });
  });

  describe('Employee self-access', () => {
    it('prevents an employee from checking in as a different employee', async () => {
      vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
      await expect(attendanceApi.checkIn('some-other-user', 'Someone Else')).rejects.toThrow(/only access their own/i);
    });

    it("prevents an employee from reading another employee's today record", async () => {
      await expect(attendanceApi.getTodayRecord('some-other-user')).rejects.toThrow(/only access their own/i);
    });

    it('prevents an employee from checking out on behalf of another employee', async () => {
      await expect(attendanceApi.checkOut('some-other-user')).rejects.toThrow(/only access their own/i);
    });

    it('allows an employee to check in and read back their own record', async () => {
      vi.setSystemTime(new Date(2026, 7, 6, 8, 0, 0));
      await attendanceApi.checkIn('user-1', 'John Doe');
      const record = await attendanceApi.getTodayRecord('user-1');
      expect(record?.employeeId).toBe('user-1');
    });
  });

  describe('Manager department restriction on corrections', () => {
    it('only returns pending corrections submitted by the manager\'s own department', async () => {
      loginAs({ id: 'user-1', role: 'Employee', department: 'Engineering' });
      await attendanceApi.submitCorrection({
        recordId: 'rec-eng',
        employeeId: 'user-1',
        employeeName: 'Engineering Employee',
        requestedCheckIn: null,
        requestedCheckOut: null,
        reason: 'Forgot to check in',
      });

      loginAs({ id: 'user-2', role: 'Employee', department: 'Sales' });
      await attendanceApi.submitCorrection({
        recordId: 'rec-sales',
        employeeId: 'user-2',
        employeeName: 'Sales Employee',
        requestedCheckIn: null,
        requestedCheckOut: null,
        reason: 'Forgot to check out',
      });

      loginAs({ id: 'mgr-eng', role: 'Manager', department: 'Engineering' });
      const pending = await attendanceApi.getPendingCorrections('Engineering');

      expect(pending).toHaveLength(1);
      expect(pending[0].employeeId).toBe('user-1');
    });

    it('prevents a manager from reviewing a correction outside their department', async () => {
      loginAs({ id: 'user-2', role: 'Employee', department: 'Sales' });
      const correction = await attendanceApi.submitCorrection({
        recordId: 'rec-sales',
        employeeId: 'user-2',
        employeeName: 'Sales Employee',
        requestedCheckIn: null,
        requestedCheckOut: null,
        reason: 'Forgot to check out',
      });

      loginAs({ id: 'mgr-eng', role: 'Manager', department: 'Engineering' });
      await expect(attendanceApi.reviewCorrection(correction.id, 'Approved')).rejects.toThrow(/Department Scope Check Failed/i);
    });

    it('allows a manager to review a correction from their own department', async () => {
      loginAs({ id: 'user-1', role: 'Employee', department: 'Engineering' });
      const correction = await attendanceApi.submitCorrection({
        recordId: 'rec-eng',
        employeeId: 'user-1',
        employeeName: 'Engineering Employee',
        requestedCheckIn: null,
        requestedCheckOut: null,
        reason: 'Forgot to check in',
      });

      loginAs({ id: 'mgr-eng', role: 'Manager', department: 'Engineering' });
      await expect(attendanceApi.reviewCorrection(correction.id, 'Rejected', 'Not approved')).resolves.toBeUndefined();
    });
  });
});

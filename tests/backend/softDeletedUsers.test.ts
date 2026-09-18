import { describe, it, expect } from 'vitest';

export interface UserAccount {
  id: string;
  email: string;
  role: string;
  status: 'active' | 'disabled' | 'suspended';
  deletedAt?: Date | null;
}

/**
 * Validates whether a user account is active and authorized to perform actions or log in.
 */
function validateAccountStatus(user: UserAccount): { canAccess: boolean; error?: string } {
  if (user.deletedAt) {
    return { canAccess: false, error: 'Account has been deleted' };
  }
  if (user.status === 'disabled') {
    return { canAccess: false, error: 'Account is disabled' };
  }
  if (user.status === 'suspended') {
    return { canAccess: false, error: 'Account is suspended' };
  }
  return { canAccess: true };
}

describe('Soft-Deleted and Disabled Users Access Control', () => {
  it('allows access for active users', () => {
    const activeUser: UserAccount = {
      id: 'usr-1',
      email: 'active@example.com',
      role: 'Employee',
      status: 'active',
      deletedAt: null,
    };
    expect(validateAccountStatus(activeUser).canAccess).toBe(true);
  });

  it('rejects access for soft-deleted users (deletedAt is set)', () => {
    const deletedUser: UserAccount = {
      id: 'usr-2',
      email: 'deleted@example.com',
      role: 'Employee',
      status: 'active',
      deletedAt: new Date(),
    };
    const res = validateAccountStatus(deletedUser);
    expect(res.canAccess).toBe(false);
    expect(res.error).toBe('Account has been deleted');
  });

  it('rejects access for disabled users', () => {
    const disabledUser: UserAccount = {
      id: 'usr-3',
      email: 'disabled@example.com',
      role: 'Manager',
      status: 'disabled',
      deletedAt: null,
    };
    const res = validateAccountStatus(disabledUser);
    expect(res.canAccess).toBe(false);
    expect(res.error).toBe('Account is disabled');
  });
});

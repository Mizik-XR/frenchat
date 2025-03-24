import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { handleRedirection } from '@/utils/auth/redirectionUtils';
import type { Location } from 'react-router-dom';

describe('redirectionUtils', () => {
  let mockNavigate: jest.Mock;
  let mockLocation: Location;

  beforeEach(() => {
    mockNavigate = jest.fn();
    mockLocation = {
      pathname: '/test',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to default path when no redirect is provided', () => {
    handleRedirection(mockNavigate, mockLocation);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should redirect to provided path', () => {
    const redirectPath = '/dashboard';
    mockLocation.search = `?redirect=${encodeURIComponent(redirectPath)}`;
    
    handleRedirection(mockNavigate, mockLocation);
    expect(mockNavigate).toHaveBeenCalledWith(redirectPath);
  });

  it('should handle empty redirect parameter', () => {
    mockLocation.search = '?redirect=';
    
    handleRedirection(mockNavigate, mockLocation);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should handle invalid redirect parameter', () => {
    mockLocation.search = '?redirect=invalid%path';
    
    handleRedirection(mockNavigate, mockLocation);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should handle multiple redirect parameters', () => {
    mockLocation.search = '?redirect=/first&redirect=/second';
    
    handleRedirection(mockNavigate, mockLocation);
    expect(mockNavigate).toHaveBeenCalledWith('/first');
  });
});

import { describe, test, expect, beforeEach, vi } from 'vitest';
import * as api from '@/api';
import axios from 'axios';

// Mocking axios
vi.mock('axios', async () => {
  const actualAxios = await vi.importActual('axios') as any;
  const mockInstance = {
    get: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  };
  return {
    default: {
      create: vi.fn().mockReturnValue(mockInstance),
      interceptors: actualAxios.interceptors
    }
  };
});

// Since we mock axios before importing api, the api module will use the mock instance
// but the interceptors are registered at the top level of api/index.ts

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('getUserProfile', async () => {
    const mockData = { id: 'test-user' };
    const mockInstance = (axios.create as any)();
    mockInstance.get.mockResolvedValue({ data: mockData });

    const result = await api.getUserProfile();
    expect(result).toEqual(mockData);
    expect(mockInstance.get).toHaveBeenCalledWith('/me');
  });

  test('getUserSavedAlbums', async () => {
    const mockData = { items: [] };
    const mockInstance = (axios.create as any)();
    mockInstance.get.mockResolvedValue({ data: mockData });

    const result = await api.getUserSavedAlbums();
    expect(result).toEqual(mockData);
    expect(mockInstance.get).toHaveBeenCalledWith('/me/albums?offset=0&limit=50');
  });

  test('getNextUserSavedAlbums', async () => {
    const mockData = { items: [] };
    const mockUrl = 'https://next-url';
    const mockInstance = (axios.create as any)();
    mockInstance.get.mockResolvedValue({ data: mockData });

    const result = await api.getNextUserSavedAlbums(mockUrl);
    expect(result).toEqual(mockData);
    expect(mockInstance.get).toHaveBeenCalledWith(mockUrl);
  });

  test('getUserSavedPlaylists', async () => {
    const mockData = { items: [] };
    const mockInstance = (axios.create as any)();
    mockInstance.get.mockResolvedValue({ data: mockData });

    const result = await api.getUserSavedPlaylists();
    expect(result).toEqual(mockData);
    expect(mockInstance.get).toHaveBeenCalledWith('/me/playlists?offset=0&limit=20');
  });

  test('getNextUserSavedPlaylists', async () => {
    const mockData = { items: [] };
    const mockUrl = 'https://next-url';
    const mockInstance = (axios.create as any)();
    mockInstance.get.mockResolvedValue({ data: mockData });

    const result = await api.getNextUserSavedPlaylists(mockUrl);
    expect(result).toEqual(mockData);
    expect(mockInstance.get).toHaveBeenCalledWith(mockUrl);
  });

  test('getTracks', async () => {
    const mockData = { items: [] };
    const mockUrl = 'https://next-url';
    const mockInstance = (axios.create as any)();
    mockInstance.get.mockResolvedValue({ data: mockData });

    const result = await api.getTracks(mockUrl);
    expect(result).toEqual(mockData);
    expect(mockInstance.get).toHaveBeenCalledWith(mockUrl);
  });
});

import Axios from 'axios';

import { API_CONFIG } from '../config';
import { tokenStorage } from './token-storage';
import * as SecureStore from 'expo-secure-store';
const REFRESH_TOKEN_KEY = 'refreshToken';
export async function refreshAccessToken() {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  const response = await Axios.post(
    API_CONFIG.refreshTokenUrl,
    { refreshToken },
    {
      withCredentials: true,
    }
  );

  const accessToken = response.data.data.accessToken;

  await tokenStorage.setAccessToken(accessToken);

  return accessToken;
}

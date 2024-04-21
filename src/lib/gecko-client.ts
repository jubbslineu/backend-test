import axios from 'axios';
import environment from './environment';

export const geckoClient = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-cg-pro-api-key': environment.geckoApiKey,
  },
});

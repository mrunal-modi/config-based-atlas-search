// customAxios.ts
import axios from 'axios';

// Create a custom Axios instance
const customAxios = axios.create({
  baseURL: "/",
});

export default customAxios;
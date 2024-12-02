import { defineConfig } from "cypress";
import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  e2e: {
    chromeWebSecurity: false,
    setupNodeEvents(_, config) {
      // Add environment variables to the Cypress config
      config.env = {
        ...config.env,
        VITE_FRONTEND_URL: process.env.VITE_FRONTEND_URL,
        VITE_BACKEND_URL: process.env.VITE_BACKEND_URL,
        VITE_AUTH0_USERNAME: process.env.VITE_AUTH0_USERNAME,
        VITE_AUTH0_PASSWORD: process.env.VITE_AUTH0_PASSWORD,
        VITE_AUTH0_DOMAIN: process.env.VITE_AUTH0_DOMAIN,
      };

      // You can also directly access them via process.env in your tests
      return config;
    },
    experimentalStudio: true,
    baseUrl: process.env.VITE_FRONTEND_URL || "https://teamverde.westus2.cloudapp.azure.com", // Fallback to default URL
  },
});
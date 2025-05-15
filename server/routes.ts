import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { WalletAddressSchema } from "@shared/schema";
import { getWalletData } from "./services/monadService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get wallet data by address
  app.get("/api/wallet/:address", async (req, res, next) => {
    try {
      const { address } = req.params;
      
      // Validate Ethereum address format
      const result = WalletAddressSchema.safeParse({ address });
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid Ethereum address format" 
        });
      }
      
      // Get wallet data from Monad testnet
      const walletData = await getWalletData(address);
      
      return res.json(walletData);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      
      return res.status(500).json({ 
        message: "An unexpected error occurred while fetching wallet data" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

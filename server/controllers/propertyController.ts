import express from "express";
import type { Response } from "express";
import { propertyService } from "../services/propertyService.ts";
import { AuthRequest } from "../middleware/auth.ts";

export const getProperties = async (req: AuthRequest, res: Response) => {
  try {
    const agencyId = req.user?.agency_id;
    if (!agencyId) return res.status(401).json({ error: "Unauthorized" });
    const result = await propertyService.getAll(agencyId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPropertyFull = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const agencyId = req.user?.agency_id;
    if (!agencyId) return res.status(401).json({ error: "Unauthorized" });
    const property = await propertyService.getById(id, agencyId);
    if (!property) return res.status(404).json({ error: "Property not found" });
    res.json(property);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const agencyId = req.user?.agency_id;
    if (!agencyId) return res.status(401).json({ error: "Unauthorized" });
    const id = await propertyService.create(req.body, agencyId);
    res.json({ id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const agencyId = req.user?.agency_id;
    if (!agencyId) return res.status(401).json({ error: "Unauthorized" });
    await propertyService.update(id, req.body, agencyId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const agencyId = req.user?.agency_id;
    if (!agencyId) return res.status(401).json({ error: "Unauthorized" });
    const changes = await propertyService.delete(id, agencyId);
    if (changes === 0) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const duplicateProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const agencyId = req.user?.agency_id;
    if (!agencyId) return res.status(401).json({ error: "Unauthorized" });
    const newId = await propertyService.duplicate(id, agencyId);
    res.json({ id: newId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const archiveProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const agencyId = req.user?.agency_id;
    if (!agencyId) return res.status(401).json({ error: "Unauthorized" });
    await propertyService.archive(id, agencyId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

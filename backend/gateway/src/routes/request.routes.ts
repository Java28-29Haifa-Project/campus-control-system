import express from "express";
import {requestController} from "../controllers/request.controller.js";

export const requestRoutes = express.Router();

requestRoutes.get('/', requestController.getAllRequests);
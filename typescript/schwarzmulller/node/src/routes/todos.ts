import { Router } from "express";

import {
  createToDo,
  deleteTodo,
  getTodods,
  updateTodo,
} from "../controllers/todos";

const router = Router();

router.post("/", createToDo);   

router.get("/", getTodods);

router.patch("/:id", updateTodo);

router.delete("/:id", deleteTodo);

export default router;

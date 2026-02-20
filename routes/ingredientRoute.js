import express from 'express';
import { addIngredient } from '../controller/ingredientController';


const router = express.Router();

router.get('/:id',addIngredient);
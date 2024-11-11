const express = require("express");
const cors = require("cors");
const app = express();
let { user } = require("./models/user.model");
let { recipe } = require("./models/recipe.model");
let { favorite } = require("./models/favorite.model");
let { Op } = require("@sequelize/core");
const { sequelize } = require("./lib/index");
const { Sequelize } = require("sequelize");

app.use(express.json());
app.use(cors());

let recipeData = [
  {
    title: 'Spaghetti Carbonara',
    chef: 'Chef Luigi',
    cuisine: 'Italian',
    preparationTime: 30,
    instructions: 'Cook spaghetti. In a bowl, mix eggs, cheese, and pepper. Combine with pasta and pancetta.',
  },
  {
    title: 'Chicken Tikka Masala',
    chef: 'Chef Anil',
    cuisine: 'Indian',
    preparationTime: 45,
    instructions: 'Marinate chicken in spices and yogurt. Grill and serve with a creamy tomato sauce.',
  },
  {
    title: 'Sushi Roll',
    chef: 'Chef Sato',
    cuisine: 'Japanese',
    preparationTime: 60,
    instructions: 'Cook sushi rice. Place rice on nori, add fillings, roll, and slice into pieces.',
  },
  {
    title: 'Beef Wellington',
    chef: 'Chef Gordon',
    cuisine: 'British',
    preparationTime: 120,
    instructions: 'Wrap beef fillet in puff pastry with mushroom duxelles and bake until golden.',
  },
  {
    title: 'Tacos Al Pastor',
    chef: 'Chef Maria',
    cuisine: 'Mexican',
    preparationTime: 50,
    instructions: 'Marinate pork in adobo, grill, and serve on tortillas with pineapple and cilantro.',
  },
];

// Defining a route to seed the database
app.get("/seed_db", async (req, res) => {
  try{
    await sequelize.sync({ force: true });
    await recipe.bulkCreate(recipeData);
    await user.create({
      username: "foodlover",
      email: "foodlover@example.com",
      password: "securepassword",
    });
  
    return res.status(200).json({ message: "Database seeding successful." });
  } catch(error){
    return res.status(500).json({ message: "Error seeding the database", error: error.message });
  }  
});

// function to get all recipes
async function getAllRecipes(){
  let allRecipes = await recipe.findAll();
  return { allRecipes };
}

// Endpoint to get all recipes
app.get("/recipes", async (req, res) => {
 try{
  let response = await getAllRecipes();
  
  if(response.allRecipes.length === 0){
    return res.status(404).json({ message: "No recipes found." });
  }

  return res.status(200).json(response);
 } catch(error){
  return res.status(500).json({ message: "Error fetching all recipes", error: error.message });
 }
});

// function to set a favorite recipe
async function favoriteRecipe(data){
  let newFavorite = await favorite.create({
   userId: data.userId,
   recipeId: data.recipeId,
  });

  return { message: "Recipe set to favorite", newFavorite };
}

// Endpoint to favorite a recipe
app.get("/users/:id/favorite", async (req, res) => {
  try{
    let userId = parseInt(req.params.id);
    let recipeId = parseInt(req.query.recipeId);
    let response = await favoriteRecipe({ userId, recipeId });

    return res.status(200).json(response);
  } catch(error){
    return res.status(500).json({ message: "Facing some error", error: error.message });
  }
});

// function to unfavorite a recipe
async function unfavoriteRecipe(data){
 let count = await favorite.destroy({ where: {
  userId: data.userId,
  recipeId: data.recipeId,
 }});

 if(count === 0){
   return {};
 }
 
 return { message: "Recipe removed from favorites." };
};

// Endpoint to unfavorite a recipe
app.get("/users/:id/unfavorite", async (req, res) =>{
  try{
    let userId = parseInt(req.params.id);
    let recipeId = parseInt(req.query.recipeId);
    let response = await unfavoriteRecipe({ userId,recipeId });

    return res.status(200).json(response);
  } catch(error){
    return res.status(500).json({ message: "Facing some error", error: error.message });
  }
});

// function to get all favorite recipes
async function allFavoritedRecipe(userId){
  let recipeIds = await favorite.findAll({
    where: {userId},
    attributes: ["recipeId"],
  });
  
  let recipeRecords = [];

  for(let i=0; i<recipeIds.length; i++){
    recipeRecords.push(recipeIds[i].recipeId);
  }

  let favoritedRecipes = await recipe.findAll({
    where: { id: { [Op.in] : recipeRecords } }
  });

  return { favoritedRecipes };
}

// Endpoint to get all favorite recipes
app.get("/users/:id/favorites", async (req, res) => {
 try{
  let userId = parseInt(req.params.id);
  let response = await allFavoritedRecipe(userId);
  
  if(response.favoritedRecipes.length === 0){
    return res.status(404).json({ message: "No favorited recipes found." });
  }
  
  return res.status(200).json(response);
 } catch(error){
  return res.status(500).json({ message: "Error fetching all favorite recipes", error: error.message });
 }
});

app.listen(3000, () => {
  console.log("Server is running on Port : 3000");
});
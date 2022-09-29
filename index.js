const express = require("express");
const app = express();
const axios = require("axios").default;
const fs = require("fs");
const path = require("path");
const compression = require("compression");

app.use(compression());

if (!fs.existsSync(path.join(__dirname, "pokemon"))) {
  console.log("pokemon directory missing, creating");

  try {
    fs.mkdirSync(path.join(__dirname, "pokemon"));
  } catch (err) {
    return console.log("Error creating dir:\n" + err);
  }
}

const catchEmAll = async () => {
  let iter = 1;
  let morePokemon = true;
  do {
    if (!fs.existsSync(path.join(__dirname, "pokemon", `${iter}.json`))) {
      await axios
        .get(`https://pokeapi.co/api/v2/pokemon/${iter}`, {
          transformResponse: (res) => {
            // NOT parsing response
            // res = JSON.parse(res);
            return res;
          },
          responseType: "json",
        })
        .then((response) => {
          fs.writeFile(
            path.join(__dirname, "pokemon", `${iter}.json`),
            response.data,
            (err) => {
              if (err) throw err;
            }
          );
          iter++;
        })
        .catch((error) => {
          morePokemon = false;
          pokemonLoaded = true;
          console.log("Pokemon data ready!");
        });
    } else {
      // console.log("Pokemon exists moving to next...");
      iter++;
    }
  } while (morePokemon === true);
};

catchEmAll();

if (!fs.existsSync(path.join(__dirname, "species"))) {
  console.log("species directory missing, creating");

  try {
    fs.mkdirSync(path.join(__dirname, "species"));
  } catch (err) {
    return console.log("Error creating dir:\n" + err);
  }
}

const scrapeSpecies = async () => {
  let iter = 1;
  let morePokemon = true;
  do {
    if (!fs.existsSync(path.join(__dirname, "species", `${iter}.json`))) {
      await axios
        .get(`https://pokeapi.co/api/v2/pokemon-species/${iter}`, {
          transformResponse: (res) => {
            // NOT parsing response
            // res = JSON.parse(res);
            return res;
          },
          responseType: "json",
        })
        .then((response) => {
          fs.writeFile(
            path.join(__dirname, "species", `${iter}.json`),
            response.data,
            (err) => {
              if (err) throw err;
            }
          );
          iter++;
        })
        .catch((error) => {
          morePokemon = false;
          speciesLoaded = true;
          console.log("Species data ready!");
        });
    } else {
      // console.log("species exists moving to next...");
      iter++;
    }
  } while (morePokemon === true);
};

scrapeSpecies();

app.get("/pokemon/:number", (req, res) => {
  if (
    fs.existsSync(path.join(__dirname, "pokemon", `${req.params.number}.json`))
  ) {
    res.sendFile(path.join(__dirname, "pokemon", `${req.params.number}.json`));
  } else {
    res.sendStatus(404);
  }
});

app.get("/species/:number", (req, res) => {
  if (
    fs.existsSync(path.join(__dirname, "species", `${req.params.number}.json`))
  ) {
    res.sendFile(path.join(__dirname, "species", `${req.params.number}.json`));
  } else {
    res.sendStatus(404);
  }
});

app.get("/totalPokemon", (req, res) => {
  fs.readdir(path.join(__dirname, "pokemon"), (err, fileNameArr) => {
    res.json({ totalpokemon: fileNameArr.length });
  });
});

app.get("*", (req, res) => res.sendStatus(404));

let pokemonLoaded = false;
let speciesLoaded = false;
const assetCheckInterval = setInterval(() => {
  if (pokemonLoaded && speciesLoaded) {
    startServer();
    clearInterval(assetCheckInterval);
  }
}, 1000);

const startServer = () => {
  app.listen(8080, () => console.log("Server up on 8080"));
};

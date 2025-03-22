require("dotenv").config();
console.log("HF_API_TOKEN:", process.env.HF_API_TOKEN);
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const HF_API_TOKEN = process.env.HF_API_TOKEN;
console.log("Hugging Face API Token:", HF_API_TOKEN ? "OK" : "NON DÉFINI");

app.use(cors());
app.use(express.json());

const client = new MongoClient(MONGO_URI);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("monchatgpt");
    console.log("Connecté à MongoDB");
  } catch (error) {
    console.error(" Erreur de connexion à MongoDB", error);
  }
}
connectDB();

// async function queryModel(inputText) {
//   // const MODEL_NAME = "https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407";
//   // const MODEL_NAME = "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-Nemo-Instruct-2407";
//   const MODEL_NAME = "mistralai/Mistral-Nemo-Instruct-2407";

//   try {
//      const response = await fetch(
//        `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
//        {
//          method: "POST",
//          headers: {
//            Authorization: `Bearer ${HF_API_TOKEN}`,
//            "Content-Type": "application/json",
//          },
//          body: JSON.stringify({
//            inputs: inputText,
//          }),
//        }
//      );
//     // const response = await fetch(MODEL_NAME, {
//     //   method: "POST",
//     //   headers: {
//     //     Authorization: `Bearer ${HF_API_TOKEN}`,
//     //     "Content-Type": "application/json",
//     //   },
//     //   body: JSON.stringify({ inputs: inputText }),
//     // });
//     if (!response.ok) {
//         throw new Error(`Erreur HTTP ${response.status}`);
//     }
//   } catch (error) {
//     console.error("Erreur API Hugging Face: ", error.message);
//     throw new Error("Impossible d'obtenir une réponse du modèle");
//   }
// }

async function queryModel(inputText) {
  const BASE_URL = "https://router.huggingface.co/hf-inference/models";
  // const MODEL_NAME = "bigscience/bloom"; // ou un autre modèle compatible
  const MODEL_NAME = "mistralai/Mistral-Nemo-Instruct-2407";

  //   try {
  //     const response = await fetch(
  //       `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           inputs: inputText,
  //         }),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const result = await response.json();
  //     return result;
  //   } catch (error) {
  //     console.error("Error:", error);
  //     throw error;
  //   }
  // }
  try {
    const response = await fetch(`${BASE_URL}/${MODEL_NAME}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: inputText }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur API Hugging Face:", error.message);
    throw new Error("Impossible d'obtenir une réponse du modèle");
  }
}

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message)
      return res.status(400).json({ error: "Vous devez écrire quelque chose" });

    const response = await queryModel(message);

    const chat = {
      messageUser: message,
      responseBot: response,
      timestamp: new Date(),
    };
    await db.collection("convo").insertOne(chat);

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/historique", async (req, res) => {
  try {
    const historique = await db.collection("convo").find().toArray();
    res.json(historique);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération d'historique" });
  }
});

app.delete("/historique/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("convo").deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Conversation supprimée" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression" });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur écoute http://localhost:${PORT}`);
});

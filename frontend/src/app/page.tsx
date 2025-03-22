"use client";
import Image from "next/image";
import background from "@/assets/background.jpg";
import globe from "@/assets/globe1.svg";
import { AiOutlineMenu, AiOutlineSend } from "react-icons/ai";
import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [historique, setHistorique] = useState<{ messageUser: string; responseBot: string }[]>([]);

  useEffect(() => {
    const fetchHistorique = async () => {
      try {
        const res = await fetch("http://localhost:5000/historique");
        if (!res.ok) throw new Error("Erreur lors de la récupération");
        const data = await res.json();
    
        console.log("Historique récupéré:", data);
    
        const formattedData = data.map((chat: any) => {
          console.log("Chat reçu:", chat); 
          return {
            messageUser: chat.messageUser,
            responseBot: typeof chat.responseBot === "object" && "generated_text" in chat.responseBot
              ? chat.responseBot.generated_text
              : String(chat.responseBot), 
          };
        });
    
        console.log("Données après formatage:", formattedData);
    
        setHistorique(formattedData);
      } catch (error) {
        console.error("Erreur historique", error);
      }
    };
    
     

    fetchHistorique();
  }, []);

  const recupBotResponse = (response: any) => {
    if (!response) return "Aucune réponse";

    if (typeof response === "string") {
      return response;
    }

    if (Array.isArray(response) && response.length > 0) {
      return response[0]?.generated_text || "Réponse vide";
    }

    if (typeof response === "object" && "generated_text" in response) {
      return response.generated_text || "Réponse vide";
    }

    return JSON.stringify(response);
  };

  const sendMessage = async() => {
    if (!message.trim()) return;

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({message}),
     });

     if (!res.ok) throw new Error("Erreur API");
     const data = await res.json();

     let botResponse = "Erreur: réponse inattendue par l'IA";
     
     if (Array.isArray(data.responseBot) && data.responseBot.length > 0) {
      botResponse = data.responseBot[0].generated_text || botResponse;
     }

    setResponse(botResponse);
    setHistorique((prev) => [...prev, { messageUser: message, responseBot: recupBotResponse(data.responseBot) }]);


    setMessage("");

    } catch (error) {
      console.error("Erreur lors de l'envoie du message: ", error);
      setResponse("Impossible d'obtenir une réponse");
    }
  };

  return (
    <div className="relative h-screen text-white flex justify-center items-center">
      <Image
        src={background}
        alt="Background"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="w-[60%] h-[85%] rounded-xl shadow-lg flex flex-col justify-between relative overflow-hidden containerPanel bg-gray-800 bg-opacity-70 backdrop-blur-lg ">
        <div className="flex justify-between border-b border-[#e2e2e2] ">
          <div className="z-10 p-4">
            <div className="flex items-center">
              <Image src={globe} alt="ChatGPT Logo" width={30} height={30} />
              <p className="ml-4 text-[#e2e2e2] text-xl font-semibold">
                Mini-Gpt
              </p>
            </div>
          </div>

          <div className="p-4 top-4 right-4 z-10 cursor-pointer">
            <AiOutlineMenu size={30} />
          </div>
        </div>
        <div className="">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-[#11163d]  border-[#3d468c] rounded-lg p-6 backdrop-blur-lg shadow-xl">
              <span className="text-4xl">🖐</span>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center mb-6 max-h-[50vh] overflow-y-auto p-a">
          {historique.length === 0 ? (
            <h1 className="text-3xl text-white font-semibold">Posez vos questions ici !</h1>
          ) : (
            historique.map((chat, index) => (
              <div key={index} className="w-full mb-4">
                <div className="bg-[#1e293b] p-4 rounded-lg shadow-md">
                  <p className="text-white font-semibold">👤 {chat.messageUser}</p>
                  <p className="text-gray-300 mt-2">🤖 {chat.responseBot}</p>
                </div>
              </div>
            ))
          )}
          </div>

          <div className="mt-auto p-4 flex items-center relative">
            <input
              type="text"
              placeholder="Posez une question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 bg-[#11163d] rounded-lg outline-none shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl border-[1px] border-[#3d468c] text-[#e2e2e2] pr-14"
            />
            <button 
            onClick={sendMessage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 py-2 px-6 bg-[#f7186d] text-white rounded-lg hover:bg-pink-600 focus:outline-none transition-colors duration-300 mr-4
            hover:cursor-pointer active:transform active:scale-95 active:transition-transform active:duration-100">
            <AiOutlineSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const functions = require("firebase-functions/v1");
// const functions = require("firebase-functions"); -- if any problem revert to this
// email -> https://mail.google.com/mail/u/0/#inbox/FMfcgzGxTPDrJfXWFGhxHqzcDrwttRJL
const admin = require("firebase-admin");
const { OpenAI } = require("openai");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();
const openai = new OpenAI({ apiKey: functions.config().openai.apikey });

exports.magicCreatePage = functions.https.onCall(async (data, context) => {
  // Authentication check (optional)

  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { projectId, pageId, prompt, withImage, optionsCount, lastPage } = data;

  const TEMPLATE_PROMPT = `Generate content for a digital choose-your-own-adventure book page based on the theme: 
  ${prompt}. For additional context about the content itself that you will generate, consider that each page can either be a room with objects inside or doorways or anything, or it can be an encounter with an NPC in which case the options might be what you say to them, or it can be a scenario like you are opening a hidden chest from a previous option in a different page, and now you may have options like: you found some item or you get spooked and run away.
  The content should include a unique name for the page, a vivid description that captures the essence of the theme,
   and ${optionsCount} options for actions a user can take, each with a label. 
   The page keys for each option should be increments from the base page ${lastPage}.  
   The response MUST FOLLOW this structure without any deviation:
  type: name: string, description: string, options: {label: string, page: number}[]

{
  "name": "[Unique room name or scenario related to the theme]",
  "description": "[Vivid description of the room or scenario, highlighting aspects related to the theme]",
  "options": [
    {
      "label": "[First action the user can take]",
      "page": [base page + 1] (number) // please increment the page count on each option starting from the base page
    },
    {
      "label": "[Second action the user can take]",
      "page": [base page + 2]  (number) 
    }
  ]
}`;

  try {
    let imgUrl = null;
    let imageResponse = null;
    const gptResponse = await openai.chat.completions.create({
      messages: [{ role: "system", content: TEMPLATE_PROMPT }],
      model: "gpt-3.5-turbo",
    });

    const { name, description, options } = JSON.parse(
      gptResponse.choices[0].message.content
    );

    const promptFromText = `Name: ${name} Description: ${description} Options: ${options}`;

    if (withImage) {
      const TEMPLATE_IMAGE_PROMPT = `
      Generate a fantasy-style image for a choose-your-adventure book based on: ${promptFromText}. Aim to visually capture the scenario/room described, including elements leading to the options provided`;

      imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: TEMPLATE_IMAGE_PROMPT,
        response_format: "b64_json",
        n: 1,
        size: "1024x1024",
      });
      const imageBuffer = Buffer.from(imageResponse.data[0].b64_json, "base64");
      const filePath = `projects/${projectId}/pages/${pageId}/roomImage.png`;
      const file = storage.bucket().file(filePath);

      const [exists] = await file.exists();
      if (exists) {
        await file.delete();
      }

      await file.save(imageBuffer, {
        metadata: {
          contentType: "image/png",
        },
      });

      await file.makePublic();

      imgUrl = `https://storage.googleapis.com/${file.bucket.name}/${filePath}`;
    }

    return { success: true, gptResponse: gptResponse, imageUrl: imgUrl };
  } catch (error) {
    console.error("Error calling OpenAI or updating Firestore:", error);
    throw new functions.https.HttpsError(
      error,
      "Failed to generate or update the page."
    );
  }
});

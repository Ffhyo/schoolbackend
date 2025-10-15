import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

// Helper function to parse AI response for activity suggestions
const parseActivityFromResponse = (response, activityType = null) => {
  try {
    // Look for JSON structure in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const activityData = JSON.parse(jsonMatch[0]);
        
        // Validate and structure the activity
        if (activityData.activity) {
          return {
            activity: activityData.activity,
            description: activityData.description || "An engaging assembly activity for students",
            duration: activityData.duration || "15-20 minutes",
            materials: Array.isArray(activityData.materials) ? activityData.materials : 
                      ["Microphone", "Presentation materials", "Timer"],
            skills: Array.isArray(activityData.skills) ? activityData.skills : 
                   ["Public Speaking", "Confidence", "Leadership"],
            difficulty: ['easy', 'medium', 'hard'].includes(activityData.difficulty?.toLowerCase()) 
                       ? activityData.difficulty.toLowerCase() 
                       : "medium",
            activityType: activityData.activityType || activityType || 'conduction',
            learningOutcomes: Array.isArray(activityData.learningOutcomes) ? activityData.learningOutcomes : 
                            ["Improved communication skills", "Enhanced confidence"],
            preparationTips: Array.isArray(activityData.preparationTips) ? activityData.preparationTips : 
                           ["Practice beforehand", "Prepare materials in advance"]
          };
        }
      } catch (parseError) {
        console.log("JSON parse error, trying alternative parsing:", parseError);
      }
    }

    // If no structured data found, create a basic activity from the response
    const activityTypes = ['conduction', 'newsReading', 'talentShow', 'speech'];
    const detectedType = activityType || activityTypes.find(type => 
      response.toLowerCase().includes(type) || 
      response.toLowerCase().includes(getActivityDisplayName(type))
    ) || 'conduction';

    // Extract activity name from response (first line or creative extraction)
    let activityName = "Creative Assembly Activity";
    const firstLine = response.split('\n')[0];
    if (firstLine && firstLine.length > 10 && firstLine.length < 100) {
      activityName = firstLine.replace(/^[#\-\*]\s*/, '').trim();
    }

    return {
      activity: activityName,
      description: response.length > 200 ? response.substring(0, 197) + "..." : response,
      duration: "15-20 minutes",
      materials: ["Microphone", "Presentation materials", "Custom resources"],
      skills: ["Communication", "Confidence", "Creativity"],
      difficulty: "medium",
      activityType: detectedType,
      learningOutcomes: ["Enhanced student engagement", "Skill development"],
      preparationTips: ["Review the activity details", "Prepare necessary materials"]
    };

  } catch (error) {
    console.error("Error parsing activity from response:", error);
    return null;
  }
};

const getActivityDisplayName = (type) => {
  const names = {
    conduction: "assembly conduction",
    newsReading: "news reading", 
    talentShow: "talent show",
    speech: "speech delivery"
  };
  return names[type] || type;
};

// Main chat function for general conversations
export const chat = async (req, res) => {
  try {
    const { message } = req.body;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: "Invalid request: 'message' field is required and must be a non-empty string" 
      });
    }

    console.log("Received message:", message);

    // Generate content with proper error handling
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: message,
    });

    console.log("Raw AI response:", result);

    // Check if result exists
    if (!result) {
      throw new Error("No response received from AI model");
    }

    // Try different ways to extract the response text
    let reply;

    // Method 1: Standard Gemini response structure
    if (result.response && result.response.text) {
      reply = result.response.text();
    } 
    // Method 2: Direct text access
    else if (result.response && typeof result.response.text === 'function') {
      reply = await result.response.text();
    }
    // Method 3: Check for candidates array (common in Gemini)
    else if (result.response && result.response.candidates && result.response.candidates[0]) {
      const candidate = result.response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
        reply = candidate.content.parts[0].text;
      }
    }
    // Method 4: Direct access to text property
    else if (result.text) {
      reply = result.text;
    }
    // Method 5: Check if response is directly the text
    else if (typeof result === 'string') {
      reply = result;
    }
    else {
      // Log the entire response structure for debugging
      console.log("Full response structure:", JSON.stringify(result, null, 2));
      throw new Error("Unable to extract text from AI response - unexpected structure");
    }

    // Validate the extracted reply
    if (!reply || typeof reply !== 'string') {
      throw new Error("Extracted reply is invalid");
    }

    // Clean up the response (remove markdown formatting if any)
    reply = reply.trim();

    console.log("Final AI Response:", reply);

    res.status(200).json({ reply });
    
  } catch (error) { 
    console.error("Error generating AI response:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to generate AI response";
    
    if (error.message.includes("UNAUTHENTICATED") || error.message.includes("API key")) {
      errorMessage = "AI service authentication failed - check API key";
    } else if (error.message.includes("quota") || error.message.includes("rate limit")) {
      errorMessage = "AI service quota exceeded - try again later";
    } else if (error.message.includes("network") || error.message.includes("fetch")) {
      errorMessage = "Network error connecting to AI service";
    } else if (error.message.includes("Unable to extract text")) {
      errorMessage = "AI service returned unexpected response format";
    }
    
    res.status(500).json({ error: errorMessage });
  }
}

// Specialized function for activity-related chat
export const chatActivity = async (req, res) => {
  try {
    const { message, context, currentActivities, selectedActivityType } = req.body;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: "Invalid request: 'message' field is required and must be a non-empty string" 
      });
    }

    console.log("Received activity chat message:", message);
    console.log("Context:", context);
    console.log("Selected Activity Type:", selectedActivityType);

    // Create enhanced prompt with context for activity generation
    let enhancedPrompt = `You are an expert educational activity planner. ${message}`;

    // Add context information
    if (context) {
      enhancedPrompt += `\n\nCONTEXT INFORMATION:
- Number of Students: ${context.selectedStudents || 'Not specified'}
- Month: ${context.selectedMonth || 'Not specified'}
- Activity Type Focus: ${context.activityType || 'Any type'}`;

      if (context.participationData && context.participationData.length > 0) {
        enhancedPrompt += `\n- Student Background: ${context.participationData.length} students with varying participation history`;
        
        // Add summary of participation data
        const totalActivities = context.participationData.reduce((sum, student) => sum + (student.totalActivities || 0), 0);
        const avgPerformance = context.participationData.reduce((sum, student) => sum + (student.performance || 0), 0) / context.participationData.length;
        
        enhancedPrompt += `\n  * Total previous activities: ${totalActivities}`;
        enhancedPrompt += `\n  * Average performance: ${avgPerformance.toFixed(1)}/5`;
      }
    }

    // Add current activities for improvement context
    if (currentActivities && currentActivities.length > 0) {
      enhancedPrompt += `\n\nCURRENT ACTIVITIES TO IMPROVE:`;
      currentActivities.forEach((activity, index) => {
        enhancedPrompt += `\n${index + 1}. ${activity.activity} (${activity.activityType}) - ${activity.description}`;
      });
    }

    // Add structured response guidance for activity generation
    enhancedPrompt += `\n\nPlease provide your response in a structured way. If you're suggesting or improving an activity, use this JSON format:

{
  "activity": "Creative and engaging activity name",
  "description": "Clear, detailed description of the activity and its educational value",
  "duration": "Realistic time estimate (e.g., 15-20 minutes)",
  "materials": ["List", "of", "required", "materials"],
  "skills": ["Primary", "skills", "developed"],
  "difficulty": "easy/medium/hard",
  "activityType": "conduction/newsReading/talentShow/speech",
  "learningOutcomes": ["Specific", "educational", "outcomes"],
  "preparationTips": ["Practical", "preparation", "advice"]
}

Make sure the activity type matches one of: conduction, newsReading, talentShow, or speech.`;

    console.log("Enhanced activity prompt:", enhancedPrompt);

    // Generate content with proper error handling
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: enhancedPrompt,
    });

    console.log("Raw AI activity response:", result);

    // Check if result exists
    if (!result) {
      throw new Error("No response received from AI model");
    }

    // Extract response text
    let reply;
    
    // Method 1: Standard Gemini response structure
    if (result.response && result.response.text) {
      reply = result.response.text();
    } 
    // Method 2: Direct text access
    else if (result.response && typeof result.response.text === 'function') {
      reply = await result.response.text();
    }
    // Method 3: Check for candidates array (common in Gemini)
    else if (result.response && result.response.candidates && result.response.candidates[0]) {
      const candidate = result.response.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts[0]) {
        reply = candidate.content.parts[0].text;
      }
    }
    // Method 4: Direct access to text property
    else if (result.text) {
      reply = result.text;
    }
    // Method 5: Check if response is directly the text
    else if (typeof result === 'string') {
      reply = result;
    }
    else {
      console.log("Full response structure:", JSON.stringify(result, null, 2));
      throw new Error("Unable to extract text from AI response");
    }

    // Validate the extracted reply
    if (!reply || typeof reply !== 'string') {
      throw new Error("Extracted reply is invalid");
    }

    // Clean up the response
    reply = reply.trim();
    console.log("Final AI Activity Response:", reply);

    // Parse for activity suggestions
    const suggestedActivity = parseActivityFromResponse(reply, selectedActivityType);

    // Prepare response for frontend
    const responseData = {
      response: reply,
      ...(suggestedActivity && { suggestedActivity })
    };

    // If generating all activities or multiple activities
    if (context?.activityType === 'all' && suggestedActivity) {
      // For 'all' type, we might want to generate multiple activities
      // For now, we'll return one and the frontend can request others
      responseData.suggestedActivities = [suggestedActivity];
    }

    console.log("Sending response:", responseData);
    res.status(200).json(responseData);
    
  } catch (error) { 
    console.error("Error generating AI activity response:", error);
    
    let errorMessage = "Failed to generate activity suggestions";
    
    if (error.message.includes("UNAUTHENTICATED") || error.message.includes("API key")) {
      errorMessage = "AI service authentication failed - check API key";
    } else if (error.message.includes("quota") || error.message.includes("rate limit")) {
      errorMessage = "AI service quota exceeded - try again later";
    } else if (error.message.includes("network") || error.message.includes("fetch")) {
      errorMessage = "Network error connecting to AI service";
    }
    
    res.status(500).json({ 
      error: errorMessage,
      response: "I apologize, but I'm having trouble generating activity suggestions right now. Please try again."
    });
  }
}

// Function to generate multiple activities at once
export const generateActivities = async (req, res) => {
  try {
    const { activityTypes, context } = req.body;

    if (!activityTypes || !Array.isArray(activityTypes) || activityTypes.length === 0) {
      return res.status(400).json({ 
        error: "Invalid request: 'activityTypes' field is required and must be a non-empty array" 
      });
    }

    console.log("Generating activities for types:", activityTypes);

    const activities = [];

    // Generate activities for each type (limited to avoid rate limits)
    for (const activityType of activityTypes.slice(0, 4)) {
      try {
        const prompt = `Create a ${activityType} assembly activity for school students. 
        Context: ${context ? JSON.stringify(context) : 'General school assembly'}
        Provide the response in JSON format with activity details.`;

        const result = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
        });

        let reply;
        if (result.response && result.response.text) {
          reply = result.response.text();
        } else if (result.response && typeof result.response.text === 'function') {
          reply = await result.response.text();
        }

        if (reply) {
          const activity = parseActivityFromResponse(reply, activityType);
          if (activity) {
            activities.push(activity);
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (typeError) {
        console.error(`Error generating ${activityType} activity:`, typeError);
        // Continue with other activity types even if one fails
      }
    }

    res.status(200).json({
      response: `Generated ${activities.length} activity suggestions`,
      suggestedActivities: activities
    });

  } catch (error) {
    console.error("Error generating multiple activities:", error);
    res.status(500).json({ 
      error: "Failed to generate activities",
      response: "Unable to generate activity suggestions at this time."
    });
  }
}
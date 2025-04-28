from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import logging
import json
import time
import traceback
import random

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)

OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "llama3"

# Fallback responses when Ollama is not available
FALLBACK_RESPONSES = [
    "Hi there! I'm IZZY. How can I help you today?",
    "Hello! I'm IZZY, your AI conversation partner. What would you like to chat about?",
    "Great to see you! I'm IZZY. Tell me something about yourself.",
    "Hi! I'm here to help you practice conversations. What's on your mind?",
    "Hello there! I'm IZZY. How are you feeling today?",
    "I'm IZZY, your AI conversation partner. What would you like to discuss?",
    "Nice to meet you! I'm IZZY. How can I assist you today?",
    "I'm IZZY! I'm here to chat with you. What would you like to talk about?",
    "Hello! I'm your AI conversation partner. What's something you'd like to discuss?",
    "Hi! I'm IZZY. I'm here to help you practice your conversation skills. What's on your mind?"
]

def get_ollama_response(prompt: str, timeout: int = 30) -> str:
    try:
        # Log the request details
        request_payload = {
            "model": OLLAMA_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
            "temperature": 0.7,
            "max_tokens": 150
        }
        logging.info(f"Sending request to Ollama at {OLLAMA_URL}")
        logging.info(f"Request payload: {json.dumps(request_payload, indent=2)}")
        
        # Make the request
        start_time = time.time()
        response = requests.post(
            OLLAMA_URL,
            json=request_payload,
            timeout=timeout
        )
        request_time = time.time() - start_time
        logging.info(f"Request took {request_time:.2f} seconds")
        
        # Log response details
        logging.info(f"Response status: {response.status_code}")
        logging.info(f"Raw response: {response.text}")
        
        response.raise_for_status()
        data = response.json()
        
        # Changed: Get content from correct response structure
        content = data.get("message", {}).get("content", "")
        if not content:
            # Fallback to alternative response format
            content = data.get("response", "")
            
        if not content:
            logging.error(f"No content in response: {data}")
            return "No response content from AI model."
            
        return content

    except requests.Timeout:
        logging.error(f"Ollama timeout after {timeout} seconds")
        return "I'm sorry, the response took too long. Please try again."
    except requests.ConnectionError:
        logging.error("Could not connect to Ollama server")
        return random.choice(FALLBACK_RESPONSES)
    except json.JSONDecodeError as e:
        logging.error(f"JSON decode error: {str(e)}")
        logging.error(f"Raw response text: {response.text}")
        return "Error parsing AI response."
    except Exception as e:
        logging.error(f"Ollama error: {str(e)}")
        logging.error(f"Full exception: {traceback.format_exc()}")
        # Use fallback responses when Ollama is not available
        return random.choice(FALLBACK_RESPONSES)

# Dummy response function for when Ollama is not available
def get_dummy_response(prompt: str) -> str:
    # Check for greetings
    prompt_lower = prompt.lower()
    
    if any(word in prompt_lower for word in ["hi", "hello", "hey", "greetings", "what's up"]):
        return random.choice([
            "Hello! It's great to chat with you. How are you doing today?",
            "Hi there! I'm IZZY. What would you like to talk about?",
            "Hey! Nice to meet you. How are you feeling today?",
        ])
    
    if any(word in prompt_lower for word in ["how are you", "how're you", "how you doing"]):
        return random.choice([
            "I'm doing great, thanks for asking! How about you?",
            "I'm well! Thanks for asking. What about you?",
            "I'm good! I appreciate you asking. How has your day been so far?",
        ])
    
    if "name" in prompt_lower and ("your" in prompt_lower or "you" in prompt_lower):
        return "I'm IZZY, your AI conversation partner. I'm here to help you practice conversations!"
    
    # Default responses for other queries
    return random.choice(FALLBACK_RESPONSES)

@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json(force=True)
    prompt = data.get("prompt", "")
    if not isinstance(prompt, str) or not prompt.strip():
        return jsonify({"response": "Please provide a valid message."})

    logging.info(f"Received prompt: {prompt}")
    
    try:
        # First try to get a response from Ollama
        logging.info("Attempting to connect to Ollama...")
        response_text = get_ollama_response(prompt.strip())
        
        # Check if response is empty or undefined
        if not response_text or response_text == "undefined" or not response_text.strip():
            response_text = get_dummy_response(prompt.strip())
            logging.warn("Received empty response from Ollama, using fallback")
        else:
            logging.info(f"Got response from Ollama: {response_text[:50]}...")
            
        return jsonify({"response": response_text})
    except requests.ConnectionError as e:
        # Specific handling for connection errors (Ollama not running)
        logging.error(f"Connection error: {str(e)}")
        logging.info("Falling back to dummy response")
        response_text = get_dummy_response(prompt.strip())
        return jsonify({"response": response_text})
    except Exception as e:
        # Generic error handling for everything else
        logging.error(f"Error: {str(e)}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        logging.info("Falling back to dummy response")
        response_text = get_dummy_response(prompt.strip())
        return jsonify({"response": response_text})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
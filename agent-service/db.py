import os
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

firebase_admin = None
credentials = None
firestore = None
db = None

# Initialize Firebase Admin when available. The service should still start
# without it so local development can use the rule-based fallbacks.
try:
    import firebase_admin as firebase_admin_module
    from firebase_admin import credentials as firebase_credentials
    from firebase_admin import firestore as firebase_firestore

    firebase_admin = firebase_admin_module
    credentials = firebase_credentials
    firestore = firebase_firestore

    if not firebase_admin._apps:
        service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
        else:
            # Fallback to Application Default Credentials if running in GCP
            # or if the user has authenticated via gcloud locally
            firebase_admin.initialize_app()
    
    db = firestore.client()
    print("Firebase Admin initialized and Firestore client ready.")
except ModuleNotFoundError as e:
    print(f"Warning: Firebase Admin package not available: {e}. Running without Firestore persistence.")
except Exception as e:
    print(f"Warning: Failed to initialize Firebase Admin: {e}")
    db = None

def get_chat_history(user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    """
    Retrieve the chat history for a given user.
    Returns a list of messages formatted for Gemini.
    """
    if not db or user_id == "anonymous":
        return []

    try:
        doc_ref = db.collection("agent_chats").document(user_id)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            history = data.get("history", [])
            # Return the last 'limit' messages
            return history[-limit:] if limit > 0 else history
        return []
    except Exception as e:
        print(f"Error fetching chat history for {user_id}: {e}")
        return []

def save_chat_interaction(user_id: str, user_query: str, agent_response: str):
    """
    Save a user query and the agent's response to the user's chat history.
    """
    if not db or user_id == "anonymous":
        return

    try:
        doc_ref = db.collection("agent_chats").document(user_id)
        
        # New messages to append
        new_messages = [
            {"role": "user", "parts": [user_query]},
            {"role": "model", "parts": [agent_response]}
        ]
        
        doc = doc_ref.get()
        if doc.exists:
            # We update the array
            # Note: For large histories, consider truncating the array or using a subcollection
            doc_ref.update({
                "history": firestore.ArrayUnion(new_messages)
            })
        else:
            # Create the document with the initial history
            doc_ref.set({
                "history": new_messages,
                "created_at": firestore.SERVER_TIMESTAMP
            })
    except Exception as e:
        print(f"Error saving chat interaction for {user_id}: {e}")

def get_user_fcm_token(user_id: str) -> str:
    """
    Retrieve the FCM registration token for a given user from the 'users' collection.
    """
    if not db or user_id == "anonymous":
        return None

    try:
        doc_ref = db.collection("users").document(user_id)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            return data.get("fcmToken")
        return None
    except Exception as e:
        print(f"Error fetching FCM token for {user_id}: {e}")
        return None

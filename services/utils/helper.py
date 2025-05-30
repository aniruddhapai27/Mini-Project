import json
import regex as re
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.vectorstores import FAISS
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
load_dotenv()
import os
os.environ['HF_TOKEN'] = os.getenv("HF_TOKEN")


def extract_json_objects(text: str):
    """
    Extracts all JSON objects from the given text and returns them as a list of dicts.
    """
    # This regex matches JSON objects (non-greedy)
    pattern = r'\{(?:[^{}]|(?R))*\}'
    matches = re.findall(pattern, text, re.DOTALL)
    json_objects = []
    for match in matches:
        try:
            obj = json.loads(match)
            json_objects.append(obj)
        except json.JSONDecodeError:
            continue
    return json_objects

def get_model():
    groq_api_key = os.getenv("GROQ_API_KEY_DQ")
    model = ChatGroq(groq_api_key=groq_api_key, model_name="llama-3.3-70b-versatile")
    embeddings = HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')
    return model, embeddings

def init_retriever(model, embeddings, subject):
    vector_db = FAISS.load_local(f'RAG/{subject}', embeddings, allow_dangerous_deserialization=True)
    retriever = vector_db.as_retriever()
    
    contextualize_q_system_prompt = """
    You are an AI study assistant for engineering students, answering only from the provided textbook.
    """
    contextualize_q_prompt = ChatPromptTemplate.from_messages(
        [
            ("system", contextualize_q_system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ]
    )
    history_aware_retriever = create_history_aware_retriever(
        model, retriever, contextualize_q_prompt
    )
    return history_aware_retriever, retriever

def init_rag_chain(model, retriever, subject):
    system_template = (
        "You are an AI assistant for {subject}. "
        "Answer strictly from the textbook context below. "
        "If context is insufficient, do not answer. "
        "Do not speculate or ask follow-up questions.\n"
        "Context:\n{context}"
    )
    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", system_template),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}")
    ])
    qa_prompt = qa_prompt.partial(subject=subject)
    question_answer_chain = create_stuff_documents_chain(model, qa_prompt)
    return create_retrieval_chain(retriever, question_answer_chain)
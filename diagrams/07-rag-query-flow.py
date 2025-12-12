"""
RAG Query Flow - Advanced RAG Process
Like the reference RAG diagram with numbered steps
"""
from diagrams import Diagram, Edge
from diagrams.aws.general import User
from diagrams.aws.database import Database
from diagrams.aws.ml import Sagemaker
from diagrams.aws.ml import MachineLearning
from diagrams.aws.migration import ApplicationDiscoveryService

# Custom graph attributes for clean, simple style
graph_attr = {
    "fontsize": "20",
    "fontname": "Arial Bold",
    "bgcolor": "white",
    "splines": "ortho",
    "rankdir": "LR",
    "dpi": "200",
    "nodesep": "1.5",
    "ranksep": "1.2"
}

node_attr = {
    "fontsize": "18",
    "fontname": "Arial Bold",
    "fontcolor": "#0F2F6B",
    "style": "rounded,filled",
    "fillcolor": "#E3F2FD",
    "color": "#1976D2",
    "penwidth": "2.7",
    "width": "1.2",
    "height": "1.0",
    "margin": "0.45,0.30",
    "imagescale": "true"
}

edge_attr = {
    "color": "#1976D2",
    "penwidth": "2.3",
    "arrowsize": "0.9",
    "fontsize": "16",
    "fontname": "Arial Bold",
    "labeldistance": "1.6",
    "labelangle": "0",
    "labelfloat": "true"
}

with Diagram(
    "RAG Query Flow",
    filename="07-rag-query-flow",
    show=False,
    direction="LR",
    outformat=["png", "svg"],
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr
):
    
    # User and Query
    user = User("User")
    
    # Embedding Model (Text to Embedding)
    embed_model = MachineLearning("Embedding\nModel\ntext-embedding-3-small")
    
    # Retrieval Model (Search)
    retrieval = ApplicationDiscoveryService("Retrieval\nModel\nSimilarity Search")
    
    # Knowledge Base
    knowledge_base = Database("Knowledge\nBase\nVector Store")
    
    # Language Model (Sagemaker)
    llm = Sagemaker("Language\nModel\nGPT-4o-mini")
    
    # Response
    response_user = User("Response")
    
    # Flow with numbered steps (like the reference image)
    user >> Edge(label="1. Query", color="#1976D2", style="bold") >> retrieval
    embed_model >> Edge(label="2. Encode", color="#1976D2", style="bold") >> retrieval
    retrieval >> Edge(label="3. Search KB", color="#1976D2", style="bold") >> knowledge_base
    knowledge_base >> Edge(label="4. Retrieved Context", color="#1976D2", style="dashed") >> retrieval
    retrieval >> Edge(label="5. Rank / Compose", color="#1976D2", style="bold") >> llm
    llm >> Edge(label="6. Response", color="#1976D2", style="bold") >> response_user

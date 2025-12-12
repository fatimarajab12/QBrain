"""
QBrain System Architecture - Complete System Overview
"""
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.general import Users
from diagrams.programming.language import Nodejs
from diagrams.aws.database import RDS, Database
from diagrams.aws.ml import Sagemaker
from diagrams.aws.ml import MachineLearning
from diagrams.aws.ml import Textract
from diagrams.aws.storage import S3
from diagrams.aws.management import SystemsManagerDocuments
from diagrams.aws.network import ElbNetworkLoadBalancer
from diagrams.aws.migration import ApplicationDiscoveryService
from diagrams.digitalocean.storage import Folder

# Custom graph attributes for blue theme
graph_attr = {
    "fontsize": "18",
    "fontname": "Arial Bold",
    "bgcolor": "white",
    "splines": "ortho",
    "rankdir": "TB",
    "dpi": "200"
}

node_attr = {
    "fontsize": "16",
    "fontname": "Arial Bold",
    "fontcolor": "#0F2F6B",
    "style": "rounded,filled",
    "fillcolor": "#E3F2FD",
    "color": "#1976D2",
    "penwidth": "2.4",
    "width": "1.1",
    "height": "0.95",
    "margin": "0.45,0.30",
    "imagescale": "true"
}

edge_attr = {
    "color": "#1976D2",
    "penwidth": "2.0",
    "arrowsize": "0.9",
    "fontsize": "15",
    "fontname": "Arial Bold",
    "labeldistance": "1.6",
    "labelangle": "0",
    "labelfloat": "true"
}

cluster_attr = {
    "fontsize": "16",
    "fontname": "Arial Bold",
    "fontcolor": "#0F2F6B",
    "style": "rounded",
    "color": "#1976D2",
    "penwidth": "2.2"
}

with Diagram(
    "QBrain System Architecture",
    filename="04-system-architecture",
    show=False,
    direction="TB",
    outformat=["png", "svg"],
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr
):
    
    with Cluster("Frontend Layer", graph_attr=cluster_attr):
        frontend = Users("Frontend\nReact 18 + TypeScript\nTailwind CSS")
    
    with Cluster("Backend Layer", graph_attr=cluster_attr):
        backend = Nodejs("Backend API\nExpress.js\nNode.js")
        
        with Cluster("AI Services", graph_attr=cluster_attr):
            search_service = ApplicationDiscoveryService("RAG Service\nFeature Extraction\nTest Case Generation\nQuery Processing")
            text_splitter = SystemsManagerDocuments("Text Splitter\nRecursiveCharacter\n2000 chars\n300 overlap")
            chunking = ElbNetworkLoadBalancer("Chunking\nText Segments")
    
    with Cluster("Data Storage", graph_attr=cluster_attr):
        mongo = RDS("MongoDB\nProjects\nFeatures\nTest Cases")
        supabase = Database("Supabase\nVector DB\n(pgvector)\nEmbeddings")
        file_storage = Folder("File System\nSRS Documents\n(uploads folder)")
    
    with Cluster("External Services", graph_attr=cluster_attr):
        openai_llm = Sagemaker("OpenAI API\nGPT-4o-mini\nFeature & Test Case\nGeneration")
        openai_embed = MachineLearning("OpenAI API\ntext-embedding-3-small\n1536 dimensions")
        docai = Textract("Google Document AI\nPDF Processing\nOCR & Tables\nForms Extraction")
    
    # Connections with labeled edges
    frontend >> Edge(label="HTTP/REST API", color="#1976D2") >> backend
    
    backend >> Edge(label="Upload SRS", color="#1976D2") >> file_storage
    backend >> Edge(label="Process PDF", color="#1976D2") >> docai
    docai >> Edge(label="Extracted Text", color="#1976D2") >> text_splitter
    text_splitter >> Edge(label="Text Chunks", color="#1976D2") >> openai_embed
    openai_embed >> Edge(label="Embeddings", color="#1976D2") >> supabase
    
    backend >> Edge(label="Feature Extraction", color="#1976D2") >> search_service
    backend >> Edge(label="Test Case Generation", color="#1976D2") >> search_service
    search_service >> Edge(label="Similarity Search", color="#1976D2") >> supabase
    search_service >> Edge(label="LLM Calls", color="#1976D2") >> openai_llm
    search_service >> Edge(label="Query Embeddings", color="#1976D2") >> openai_embed
    
    docai >> Edge(label="Extracted Text", color="#1976D2") >> text_splitter
    text_splitter >> Edge(label="Split Documents", color="#1976D2") >> chunking
    chunking >> Edge(label="Text Chunks", color="#1976D2") >> openai_embed
    
    backend >> Edge(label="CRUD Operations", color="#1976D2") >> mongo
    search_service >> Edge(label="Save Features/Test Cases", color="#1976D2") >> mongo
    search_service >> Edge(label="Add to Vector Store", color="#1976D2", style="dashed") >> supabase

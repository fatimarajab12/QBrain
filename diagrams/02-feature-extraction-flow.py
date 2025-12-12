"""
Feature Extraction Flow - Simple RAG Process
Like the reference RAG diagram
"""
from diagrams import Diagram, Edge, Cluster
from diagrams.aws.general import User
from diagrams.aws.database import Database, RDS
from diagrams.aws.ml import Sagemaker
from diagrams.aws.ml import MachineLearning
from diagrams.aws.migration import ApplicationDiscoveryService
from diagrams.aws.cost import CostAndUsageReport

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
    "fontsize": "17",
    "fontname": "Arial Bold",
    "fontcolor": "#0F2F6B",
    "style": "rounded,filled",
    "fillcolor": "#E3F2FD",
    "color": "#1976D2",
    "penwidth": "2.5",
    "width": "1.2",
    "height": "1.0",
    "margin": "0.45,0.30",
    "imagescale": "true"
}

edge_attr = {
    "color": "#1976D2",
    "penwidth": "2.3",
    "arrowsize": "1.05",
    "fontsize": "15",
    "fontname": "Arial Bold",
    "labeldistance": "1.6",
    "labelangle": "0",
    "labelfloat": "true"
}

with Diagram(
    "Feature Extraction Flow",
    filename="02-feature-extraction-flow",
    show=False,
    direction="LR",
    outformat=["png", "svg"],
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr
):
    
    # Step 1: User request to extract features
    user = User("User\nExtract Features\nfrom SRS")
    
    # Step 2: Vector DB with SRS chunks
    vector_db = Database("Vector Store\nSupabase pgvector\nSRS Chunks")
    
    # Step 3: Generate query embedding
    embed_model = MachineLearning("Embedding Model\ntext-embedding-3-small\nQuery Embedding")
    
    # Step 4: Similarity search
    search = ApplicationDiscoveryService("Similarity Search\nRetrieve Top-K\nRelevant Chunks\nCosine Distance")
    
    # Step 5: Re-rank / filter chunks
    rerank = ApplicationDiscoveryService("Re-rank / Filter\nTop Ranked Chunks")
    
    # Step 6: Group chunks by sections
    grouped = CostAndUsageReport("Group Chunks\nby Sections\nCoverage Analysis")
    
    # Step 7: LLM generation
    llm = Sagemaker("LLM\nGPT-4o-mini\nExtract Features\nJSON Response")
    
    # Step 8: Save features
    mongo = RDS("MongoDB\nSave Features\nwith Metadata")
    
    # Step 9: Add to vector store
    vector_store = Database("Vector Store\nAdd Features\nto Embeddings")
    
    # Flow with numbered steps
    user >> Edge(label="1. Request", color="#1976D2", style="bold") >> embed_model
    vector_db >> Edge(label="2. Chunks", color="#1976D2", style="dashed") >> search
    embed_model >> Edge(label="3. Query Embedding", color="#1976D2", style="bold") >> search
    search >> Edge(label="4. Relevant Chunks", color="#1976D2", style="bold") >> rerank
    rerank >> Edge(label="5. Filtered / Ranked", color="#1976D2", style="bold") >> grouped
    grouped >> Edge(label="6. Grouped Context", color="#1976D2", style="bold") >> llm
    user >> Edge(label="7. Original Query", color="#1976D2", style="dashed") >> llm
    llm >> Edge(label="8. Features JSON", color="#1976D2", style="bold") >> mongo
    llm >> Edge(label="9. Add to Vector", color="#1976D2", style="bold") >> vector_store
    
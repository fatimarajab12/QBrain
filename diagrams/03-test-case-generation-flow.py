"""
Test Case Generation Flow - Simple RAG Process for Test Cases
Like the reference RAG diagram
"""
from diagrams import Diagram, Edge, Cluster
from diagrams.aws.general import User
from diagrams.aws.database import Database, RDS
from diagrams.aws.ml import Sagemaker
from diagrams.aws.ml import MachineLearning
from diagrams.aws.migration import ApplicationDiscoveryService
from diagrams.aws.cost import CostAndUsageReport
from diagrams.aws.devtools import CommandLineInterface

# Custom graph attributes for clean, simple style
graph_attr = {
    "fontsize": "20",
    "fontname": "Arial Bold",
    "bgcolor": "white",
    "splines": "ortho",
    "rankdir": "LR",
    "dpi": "200",
    "nodesep": "1.7",
    "ranksep": "1.3"
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
    "Test Case Generation Flow",
    filename="03-test-case-generation-flow",
    show=False,
    direction="LR",
    outformat=["png", "svg"],
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr
):
    
    # Step 1: Feature selected
    feature = User("Feature\nSelected\nType & Sections")
    vector_db = Database("Vector Store\nSupabase pgvector\nSRS Chunks")
    
    # Step 2: Generate query embedding
    embed_model = MachineLearning("Embedding Model\ntext-embedding-3-small\nQuery Embedding")
    
    # Step 3: Search from matched sections
    search_sections = ApplicationDiscoveryService("Search Sections\nFrom Matched Sections\nSimilarity Search")
    
    # Step 4: Search general context
    search_general = ApplicationDiscoveryService("Search General\nContext Chunks\nTop-K Results")
    
    # Step 5: Combine context (Group chunks)
    context = CostAndUsageReport("Context\nSection + General\nChunks Combined")
    
    # Step 6: LLM generation
    llm = Sagemaker("LLM\nGPT-4o-mini\nGenerate Test Cases\nJSON Mode")
    
    # Step 7: Parse and convert to Gherkin
    parse = CommandLineInterface("Parse & Validate\nConvert to Gherkin\nFormat")
    
    # Step 8: Save test cases
    mongo = RDS("MongoDB\nSave Test Cases\nwith Gherkin")
    
    # Step 9: Add to vector store
    vector_store = Database("Vector Store\nAdd Test Cases\nto Embeddings")
    
    # Flow with numbered steps
    feature >> Edge(label="1. Feature Data", color="#1976D2", style="bold") >> embed_model
    vector_db >> Edge(label="2. SRS Chunks", color="#1976D2", style="dashed") >> search_sections
    vector_db >> Edge(label="3. SRS Chunks", color="#1976D2", style="dashed") >> search_general
    embed_model >> Edge(label="4. Query Embedding", color="#1976D2", style="bold") >> search_sections
    embed_model >> Edge(label="5. Query Embedding", color="#1976D2", style="bold") >> search_general
    search_sections >> Edge(label="6. Section Context", color="#1976D2", style="bold") >> context
    search_general >> Edge(label="7. General Context", color="#1976D2", style="bold") >> context
    context >> Edge(label="8. Combined Context", color="#1976D2", style="bold") >> llm
    feature >> Edge(label="9. Feature Info", color="#1976D2", style="dashed") >> llm
    llm >> Edge(label="10. Test Cases JSON", color="#1976D2", style="bold") >> parse
    parse >> Edge(label="11. Save", color="#1976D2", style="bold") >> mongo
    parse >> Edge(label="12. Add to Vector", color="#1976D2", style="bold") >> vector_store
    

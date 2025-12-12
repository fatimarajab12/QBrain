"""
File Upload Flow - SRS Document Processing Pipeline
Simple and clear flow like the reference images
"""
from diagrams import Diagram, Edge
from diagrams.aws.general import User
from diagrams.digitalocean.storage import Folder
from diagrams.aws.ml import Textract
from diagrams.aws.management import SystemsManagerDocuments
from diagrams.aws.network import ElbNetworkLoadBalancer
from diagrams.aws.ml import MachineLearning
from diagrams.aws.database import Database, RDS

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
    "penwidth": "2.5",
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
    "File Upload Flow",
    filename="01-file-upload-flow",
    show=False,
    direction="LR",
    outformat=["png", "svg"],
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr
):
    
    # Step 1: User uploads SRS document
    user = User("User\nUpload SRS")
    document = Folder("SRS Document\n(PDF/TXT)\nFile Upload")
    
    # Step 2: Extract text from PDF using Document AI
    extract = Textract("Document AI\nExtract Text\nTables & Forms\nOCR Support")
    
    # Step 3: Split document into chunks
    split_docs = SystemsManagerDocuments("Text Splitter\nRecursiveCharacter\n2000 chars\n300 overlap")
    
    # Step 4: Process chunks
    chunks = ElbNetworkLoadBalancer("Text Chunks\nSegments\nReady for Embedding")
    
    # Step 5: Generate embeddings
    embedding = MachineLearning("Embedding Model\ntext-embedding-3-small\n1536 dimensions\nBatch Processing")
    
    # Step 6: Store in Vector Database
    vectors = Database("Vector Store\nSupabase pgvector\nStore Embeddings")
    
    # Step 7: Update MongoDB project
    mongo = RDS("MongoDB\nUpdate Project\nprocessed: true\nchunksCount")
    
    # Flow with numbered steps
    user >> Edge(label="1. Upload", color="#1976D2", style="bold") >> document
    document >> Edge(label="2. File", color="#1976D2", style="bold") >> extract
    extract >> Edge(label="3. Extracted Text", color="#1976D2", style="bold") >> split_docs
    split_docs >> Edge(label="4. Split", color="#1976D2", style="bold") >> chunks
    chunks >> Edge(label="5. Encode", color="#1976D2", style="bold") >> embedding
    embedding >> Edge(label="6. Store", color="#1976D2", style="bold") >> vectors
    vectors >> Edge(label="7. Update", color="#1976D2", style="bold") >> mongo

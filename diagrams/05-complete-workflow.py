"""
Complete Workflow - End-to-End Process Flow
"""
from diagrams import Diagram, Edge, Cluster
from diagrams.aws.general import User
from diagrams.aws.database import RDS, Database
from diagrams.aws.ml import Sagemaker
from diagrams.aws.ml import MachineLearning
from diagrams.aws.ml import Textract
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
    "rankdir": "LR",
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
    "height": "1.0",
    "margin": "0.45,0.30",
    "imagescale": "true"
}

edge_attr = {
    "color": "#1976D2",
    "penwidth": "2.1",
    "arrowsize": "1.05",
    "fontsize": "15",
    "fontname": "Arial Bold",
    "labeldistance": "1.6",
    "labelangle": "0",
    "labelfloat": "true"
}

cluster_attr = {
    "fontsize": "15",
    "fontname": "Arial Bold",
    "fontcolor": "#0F2F6B",
    "style": "rounded",
    "color": "#1976D2",
    "penwidth": "2.2"
}

with Diagram(
    "Complete Workflow",
    filename="05-complete-workflow",
    show=False,
    direction="LR",
    outformat=["png", "svg"],
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr
):
    
    with Cluster("Project Setup", graph_attr=cluster_attr):
        create = User("Step 1:\nCreate Project")
        upload = Folder("Step 2:\nUpload SRS\nDocument\n(PDF/TXT)")
        extract = Textract("Step 3:\nGoogle Document AI\nExtract Text\nTables & Forms")
        split_docs = SystemsManagerDocuments("Step 4:\nText Splitter\nRecursiveCharacter\n2000 chars\n300 overlap")
        chunking = ElbNetworkLoadBalancer("Step 5:\nChunking\nText Segments")
        embed = MachineLearning("Step 6:\nOpenAI API\ntext-embedding-3-small\nGenerate Embeddings")
        vector_db = Database("Step 7:\nSupabase\nVector Store\nStore Embeddings")
        update_project = RDS("Step 8:\nMongoDB\nUpdate Project\nprocessed: true")
    
    with Cluster("Feature Extraction", graph_attr=cluster_attr):
        search_features = ApplicationDiscoveryService("Step 9:\nRAG Service\nSimilarity Search\nExtract Features")
        llm_features = Sagemaker("Step 10:\nOpenAI API\nGPT-4o-mini\nGenerate Features\nJSON Response")
        features_db = RDS("Step 11:\nMongoDB\nSave Features\nwith Metadata")
        add_features = Database("Step 12:\nSupabase\nAdd Features\nto Vector Store")
    
    with Cluster("Test Case Generation", graph_attr=cluster_attr):
        search_tests = ApplicationDiscoveryService("Step 13:\nRAG Service\nSection Context\nGenerate Test Cases")
        llm_tests = Sagemaker("Step 14:\nOpenAI API\nGPT-4o-mini\nJSON Mode\nGenerate Test Cases")
        testcases_db = RDS("Step 15:\nMongoDB\nSave Test Cases\nwith Gherkin")
        add_tests = Database("Step 16:\nSupabase\nAdd Test Cases\nto Vector Store")
    
    # Flow with numbered, labeled edges - clearer descriptions
    create >> Edge(label="1. Create Project", color="#1976D2", style="bold") >> upload
    upload >> Edge(label="2. Upload SRS File\n(PDF or TXT)", color="#1976D2", style="bold") >> extract
    extract >> Edge(label="3. Extracted Text\n(Full Document)", color="#1976D2", style="bold") >> split_docs
    split_docs >> Edge(label="4. Split Documents", color="#1976D2", style="bold") >> chunking
    chunking >> Edge(label="5. Text Chunks\n(2000 chars each)", color="#1976D2", style="bold") >> embed
    embed >> Edge(label="6. Embeddings\n(1536-dim vectors)", color="#1976D2", style="bold") >> vector_db
    vector_db >> Edge(label="7. Save Embeddings\nUpdate Project", color="#1976D2", style="bold") >> update_project
    
    update_project >> Edge(label="8. Request Features\nfrom SRS", color="#1976D2", style="bold") >> search_features
    vector_db >> Edge(label="9. Similarity Search\nRetrieve Context", color="#1976D2", style="dashed") >> search_features
    search_features >> Edge(label="10. Context + Query\nAugmented Prompt", color="#1976D2", style="bold") >> llm_features
    llm_features >> Edge(label="11. Features JSON\nResponse", color="#1976D2", style="bold") >> features_db
    llm_features >> Edge(label="12. Add Features\nto Vector Store", color="#1976D2", style="bold") >> add_features
    
    features_db >> Edge(label="13. Select Feature\nfor Test Cases", color="#1976D2", style="bold") >> search_tests
    vector_db >> Edge(label="14. Section Context\nfrom Matched Sections", color="#1976D2", style="dashed") >> search_tests
    search_tests >> Edge(label="15. Context + Feature\nAugmented Prompt", color="#1976D2", style="bold") >> llm_tests
    llm_tests >> Edge(label="16. Test Cases JSON\nwith Gherkin", color="#1976D2", style="bold") >> testcases_db
    llm_tests >> Edge(label="17. Add Test Cases\nto Vector Store", color="#1976D2", style="bold") >> add_tests

# Production Evolution Blueprint

This document details how the YellowSense Customer 360 platform can evolve from a local Proof-of-Concept (POC) to a highly scalable, secure, and compliant production environment.

## Overview: Transitioning Architecture

```mermaid
graph TD
    subgraph On-Premises Data Center (Sovereign Core)
        CBS[(CBS Oracle RAC)] -->|WAL log stream| Debezium[Debezium CDC Connector]
        Debezium -->|Publish events| Kafka[Apache Kafka Backbone]
        Kafka -->|Enforce schema| SR[Confluent Schema Registry]
    end

    subgraph VPC-Isolated Cloud (India Region)
        Kafka -->|IPSec VPN Tunnel| Delta[Databricks Delta Lake]
        Delta -->|Bronze -> Silver -> Gold| Pinot[(Apache Pinot Serving DB)]
        Pinot -->|Low-latency serving| Web[RM / Executive UI Portal]
        
        Temporal[Temporal.io Workflow Engine] <-->|Durable Orchestration| Delta
        DGX[Local NVIDIA DGX Cluster] <-->|Air-Gapped Llama 3.1 70B RAG| Pinot
    end
```

---

## 1. Change Data Capture (CDC) & Event Backbone
- **POC Architecture**: The POC interacts directly with the database or simulated system adapters.
- **Production Evolution**: 
  - Deploy **Debezium Source Connectors** on Core Banking databases (e.g. Oracle RAC, Microsoft SQL Server) to capture log-based writes asynchronously via log readers (like Oracle LogMiner).
  - Stream events to an **Apache Kafka** cluster running inside the bank's secure network.
  - Integrate a **Schema Registry** to enforce contract validation and prevent schema drift.

## 2. Lakehouse & Analytics Store
- **POC Architecture**: Analytical summaries are compiled directly from the SQL database using aggregate queries.
- **Production Evolution**:
  - Mirror events from Kafka into a **Databricks Delta Lake** (or Apache Iceberg) on cloud storage via an encrypted IPSec VPN.
  - Implement a medallion pipeline (Bronze -> Silver -> Gold) to process, deduplicate, and mask sensitive customer data.
  - Ingest gold-tier metrics into a real-time OLAP database like **Apache Pinot** or **ClickHouse** to serve sub-50ms queries for interactive dashboards under high concurrency.

## 3. Durable Workflow Orchestration
- **POC Architecture**: Business flows and lead creation stages are updated via direct HTTP requests.
- **Production Evolution**:
  - Deploy **Temporal.io** or AWS Step Functions to manage multi-system transactions (such as ZRT needs assessment leading to RM assignments and Core Banking collateral holds) using the **Saga Pattern**.
  - This ensures that if any system fails midway, compensating actions run automatically to rollback the state.

## 4. Air-Gapped Local AI & MLOps
- **POC Architecture**: Scores are computed using deterministic mathematical engines.
- **Production Evolution**:
  - Run local, air-gapped **vLLM model servers** housing fine-tuned LLMs (e.g., Llama 3.1 70B, Qwen 2.5) on secure hardware (e.g., NVIDIA DGX cluster).
  - Utilize **pgvector** as a retrieval-augmented generation (RAG) source.
  - Standardize lifecycle validation using MLOps frameworks (e.g., MLflow, Kubeflow) to continuously track model drift and accuracy.

## 5. Compliance & Security (DPDP & RBI Guidelines)
- **DPDP Compliance**: Enforce cell-level tokenization and dynamic data masking in Databricks and PostgreSQL. Store active user consents and automatically revoke data access downstream when consent is withdrawn.
- **Sovereign Cloud**: Ensure all public-cloud endpoints are VPC-isolated within India (e.g. AWS ap-south-1 / ap-south-2) to satisfy RBI data residency regulations.

# Accessing RDS PostgreSQL from Lambda in Other Accounts via VPC Peering

In your project, RDS PostgreSQL is in the **Shared Services Account**, while Lambda microservices are in separate **Backend Accounts**.  
By default, Lambda in one account cannot directly reach RDS in another over a private network.  
The most reliable and secure method is to set up **VPC Peering** between accounts, allowing Lambda to connect to the private RDS endpoint (without public access).

## Why VPC Peering?
- Security: RDS remains completely private (publicly_accessible = false).
- No extra costs for NAT Gateway or public traffic.
- Low latency.
- Works seamlessly with Lambda in VPC.

Alternatives (less recommended for educational project):
- Public RDS access + SG by IP — insecure.
- RDS Proxy — more complex and costly.
- IAM DB Authentication — does not replace network access.

## Step-by-Step VPC Peering Setup

### 1. Preparation (in each account)
- Ensure you have VPCs:
  - Shared Services → VPC for RDS (default VPC is fine).
  - Each Backend → VPC for Lambda (default is fine).
- CIDR blocks must NOT overlap!  
  Safe examples:
  - Shared: `10.0.0.0/16`
  - Backend 1: `10.1.0.0/16`
  - Backend 2: `10.2.0.0/16`

### 2. Create VPC Peering Connection (once per account pair)

#### In Shared Services Account (Requester):
1. VPC → Peering Connections → Create peering connection.
2. Name: `shared-to-backend1`.
3. Local VPC: your Shared VPC.
4. Account: **Another account** → enter Backend Account ID.
5. Region: same region.
6. VPC ID: Backend VPC ID.
7. Create → note Peering Connection ID (pcx-xxxx).

#### In Backend Account (Accepter):
1. VPC → Peering Connections.
2. Find pending request from Shared.
3. Actions → Accept.

### 3. Configure Route Tables

In **both accounts**:

#### Shared Services Account:
- Route Table associated with RDS subnets.
- Add route:
  - Destination: Backend CIDR (`10.1.0.0/16`)
  - Target: Peering Connection ID

#### Backend Account:
- Route Table associated with Lambda subnets.
- Add route:
  - Destination: Shared CIDR (`10.0.0.0/16`)
  - Target: same Peering Connection ID

### 4. Security Groups

#### Shared Services (RDS SG):
- Inbound: PostgreSQL (5432) from Lambda Security Group ID (Backend).

#### Backend (Lambda SG):
- Outbound: allow 5432 to RDS SG (or all outbound for simplicity).

### 5. Configure Lambda (Backend Account)
- Enable VPC:
  - VPC: Backend VPC
  - Subnets: private subnets
  - Security Groups: one allowing outbound to RDS

### 6. Terraform Example (recommended)

In **Shared Account**:
```hcl
resource "aws_vpc_peering_connection" "to_backend1" {
  vpc_id        = aws_vpc.shared.id
  peer_vpc_id   = "vpc-12345678"
  peer_owner_id = "BACKEND_ACCOUNT_ID"
  auto_accept   = false

  tags = { Name = "shared-to-backend1" }
}

resource "aws_route" "shared_to_backend1" {
  route_table_id            = aws_vpc.shared.main_route_table_id
  destination_cidr_block    = "10.1.0.0/16"
  vpc_peering_connection_id = aws_vpc_peering_connection.to_backend1.id
}
In Backend Account:
hclresource "aws_vpc_peering_connection_accepter" "from_shared" {
  vpc_peering_connection_id = "pcx-xxxxxxxx"
  auto_accept               = true
}

resource "aws_route" "backend_to_shared" {
  route_table_id            = aws_vpc.backend.main_route_table_id
  destination_cidr_block    = "10.0.0.0/16"
  vpc_peering_connection_id = aws_vpc_peering_connection_accepter.from_shared.id
}
7. Testing
From Lambda or test EC2 in Backend VPC:
Bashpsql -h your-rds-endpoint.rds.amazonaws.com -U admin -d mydb
Or in Lambda code:
JavaScriptconst client = new pg.Client({
  host: 'your-rds-endpoint.rds.amazonaws.com',
  port: 5432,
  user: 'admin',
  password: process.env.DB_PASSWORD,
  database: 'mydb'
});
Tips

Repeat steps 2–6 for each Backend Account.
DNS resolution works automatically.
Propagation may take up to 5 minutes.
Use VPC Flow Logs if issues arise.

Now your Lambdas securely connect to RDS!
